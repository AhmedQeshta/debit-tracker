import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAccount } from '@/hooks/settings/useAccount';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { ArrowLeft, User } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function AccountManagement()
{

  const { control, handleSubmit, errors, loading, updatingEmail, showEmailInput, newEmail, setShowEmailInput, setNewEmail, handleEmailUpdate, handleEmailSubmit, updateName, user, isLoaded, isSignedIn, router } = useAccount();
  if (!isLoaded)
  {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isSignedIn || !user)
  {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to manage your account.</Text>
          <Button
            title="Go to Login"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="primary"
          />
        </View>
      </ScreenContainer>
    );
  }


  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} color={Colors.text} />
        <Text style={styles.title}>Manage Account</Text>
      </TouchableOpacity>

      <View style={styles.profileSection}>
        {user.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={40} color={Colors.textSecondary} />
          </View>
        )}
        <Text style={styles.profileName}>
          {user.fullName || user.primaryEmailAddress?.emailAddress || 'User'}
        </Text>
        <Text style={styles.profileEmail}>
          {user.primaryEmailAddress?.emailAddress || 'No email'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Controller
          control={control}
          rules={{ required: 'First name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="First Name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter your first name"
              error={errors.firstName?.message}
            />
          )}
          name="firstName"
        />

        <Controller
          control={control}
          rules={{ required: 'Last name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Last Name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter your last name"
              error={errors.lastName?.message}
            />
          )}
          name="lastName"
        />

        <View style={styles.emailSection}>
          <Text style={styles.emailLabel}>Email Address</Text>
          {showEmailInput ? (
            <View style={styles.emailInputContainer}>
              <Input
                label="New Email"
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.emailActions}>
                <Button
                  title="Cancel"
                  onPress={() =>
                  {
                    setShowEmailInput(false);
                    setNewEmail('');
                  }}
                  variant="outline"
                />
                <Button
                  title="Update"
                  onPress={handleEmailSubmit}
                  variant="primary"
                  disabled={updatingEmail}
                  loading={updatingEmail}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.emailRow}>
                <Text style={styles.emailValue}>
                  {user.primaryEmailAddress?.emailAddress || 'No email'}
                </Text>
                <Button
                  title="Change"
                  onPress={handleEmailUpdate}
                  variant="outline"
                  disabled={updatingEmail}
                />
              </View>
              {user.emailAddresses.length > 1 && (
                <Text style={styles.emailHint}>
                  You have {user.emailAddresses.length} email address(es) associated with your account.
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Save Changes"
            onPress={handleSubmit(updateName)}
            loading={loading}
            variant="primary"
          />
        </View>

        <View style={styles.passwordSection}>
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => router.push('/(drawer)/settings/change-password')}
            activeOpacity={0.7}>
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  form: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  emailSection: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emailValue: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  emailInputContainer: {
    marginTop: Spacing.sm,
  },
  emailActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  emailHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: Spacing.md,
  },
  passwordSection: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changePasswordButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  infoSection: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
});

