import React from 'react';
import { View, Text,StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Users as UsersIcon, Receipt, Info, Calculator } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';
import { IEmptySectionProps } from '@/types/common';


export const EmptySection = ({title,description,icon}:IEmptySectionProps)=>{
const { colors } = useTheme();
const styles = createStyles(colors);
const getIcons = (icon:string)=>{
  const iconMap: Record<string, React.ReactElement> = {
    'users': <UsersIcon size={64} color={colors.accent} strokeWidth={1.5} />,
    'transactions': <Receipt size={64} color={colors.accent} strokeWidth={1.5} />,
    'budgets': <Calculator size={64} color={colors.accent} strokeWidth={1.5} />,
  };
  
  return iconMap[icon] || <Info size={64} color={colors.accent} strokeWidth={1.5} />;
}

  return <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          {getIcons(icon||'')}
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{description}</Text>
      </View>
}


const createStyles = (colors: { surface2: string; border: string; text: string; textMuted: string }) => StyleSheet.create({

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  
});

