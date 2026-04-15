import {
  ExportFileDescriptor,
  ExportFilePayload,
  PersistOptions,
  PersistResult,
} from '@/types/export';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const EXPORT_DIR_NAME = 'exports';

const getDirectoryUri = (useCache = false) => {
  const baseUri = useCache ? FileSystem.cacheDirectory : FileSystem.documentDirectory;
  return `${baseUri || ''}${EXPORT_DIR_NAME}/`;
};

const splitFileName = (name: string) => {
  const extIndex = name.lastIndexOf('.');
  if (extIndex <= 0) {
    return { base: name, extension: '' };
  }

  return {
    base: name.slice(0, extIndex),
    extension: name.slice(extIndex),
  };
};

const createFileNameWithSuffix = (name: string, suffix: string): string => {
  const { base, extension } = splitFileName(name);
  return `${base}-${suffix}${extension}`;
};

const ensureDirectory = async (targetUri: string) => {
  const info = await FileSystem.getInfoAsync(targetUri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(targetUri, { intermediates: true });
  }
};

const writeFilesToAppDirectory = async (
  files: ExportFilePayload[],
  useCache = false,
): Promise<ExportFileDescriptor[]> => {
  const directoryUri = getDirectoryUri(useCache);

  if (!directoryUri) {
    throw new Error('Export directory is not available on this device.');
  }

  await ensureDirectory(directoryUri);

  const descriptors: ExportFileDescriptor[] = [];

  for (const file of files) {
    const fileNameWithTimestamp = createFileNameWithSuffix(file.name, String(Date.now()));
    const uri = `${directoryUri}${fileNameWithTimestamp}`;

    await FileSystem.writeAsStringAsync(uri, file.content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    descriptors.push({
      name: fileNameWithTimestamp,
      uri,
      mimeType: file.mimeType,
    });
  }

  return descriptors;
};

const shareDescriptors = async (files: ExportFileDescriptor[]) => {
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable || files.length === 0) {
    return;
  }

  for (const file of files) {
    await Sharing.shareAsync(file.uri, {
      mimeType: file.mimeType,
      dialogTitle: `Share ${file.name}`,
      UTI: file.mimeType,
    });
  }
};

const writeFilesToSafDirectory = async (
  files: ExportFilePayload[],
): Promise<ExportFileDescriptor[]> => {
  const { StorageAccessFramework } = FileSystem;

  if (!StorageAccessFramework) {
    throw new Error('Storage access framework is unavailable on this device.');
  }

  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted || !permission.directoryUri) {
    throw new Error('Permission to save to selected folder was denied.');
  }

  const descriptors: ExportFileDescriptor[] = [];

  for (const file of files) {
    const fileName = createFileNameWithSuffix(file.name, String(Date.now()));
    const fileUri = await StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      fileName,
      file.mimeType,
    );

    await FileSystem.writeAsStringAsync(fileUri, file.content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    descriptors.push({
      name: fileName,
      uri: fileUri,
      mimeType: file.mimeType,
    });
  }

  return descriptors;
};

export const persistExportFiles = async (
  files: ExportFilePayload[],
  options: PersistOptions = {},
): Promise<PersistResult> => {
  const deliveryMode = options.deliveryMode || 'save';
  const warnings: string[] = [];

  if (deliveryMode === 'share') {
    const writtenFiles = await writeFilesToAppDirectory(files, true);
    await shareDescriptors(writtenFiles);
    return {
      files: writtenFiles,
      warnings,
      deliveryMode,
    };
  }

  if (Platform.OS === 'android') {
    try {
      const safFiles = await writeFilesToSafDirectory(files);
      return {
        files: safFiles,
        warnings,
        deliveryMode,
      };
    } catch (error: any) {
      const fallbackFiles = await writeFilesToAppDirectory(files, false);
      warnings.push(
        `Could not save to selected folder (${error?.message || 'permission denied'}). Saved to app storage instead.`,
      );
      return {
        files: fallbackFiles,
        warnings,
        deliveryMode,
      };
    }
  }

  const iosFiles = await writeFilesToAppDirectory(files, false);
  await shareDescriptors(iosFiles);

  return {
    files: iosFiles,
    warnings,
    deliveryMode,
  };
};

export const shareExportFiles = async (files: ExportFileDescriptor[]): Promise<void> => {
  await shareDescriptors(files);
};
