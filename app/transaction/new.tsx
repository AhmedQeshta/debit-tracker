import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { useTransactionForm } from '@/hooks/transaction/useTransactionForm';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { CATEGORIES } from '@/lib/data';

export default function AddTransaction() {
  const {
    friends,
    friendId,
    setFriendId,
    isNegative,
    setIsNegative,
    control,
    handleSubmit,
    errors,
    loading,
  } = useTransactionForm();
  const router = useRouter();

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={25} style={styles.ArrowLeft} color={Colors.text} />
        <Text style={styles.title}>Add Transaction</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Select Friend</Text>
          <View style={styles.userPicker}>
            {friends.length === 0 ? (
              <Text style={styles.errorText}>No friends available. Create one first.</Text>
            ) : (
              friends.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.userChip, friendId === f.id && styles.userChipSelected]}
                  onPress={() => setFriendId(f.id)}>
                  <Text
                    style={[styles.userChipText, friendId === f.id && styles.userChipTextSelected]}>
                    {f.name}
                  </Text>
                  {friendId === f.id && f.currency && (
                    <View style={styles.currencyBadgeInline}>
                      <Text style={styles.currencySymbolInline}>{f.currency}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.amountHeader}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.signToggle}>
              <TouchableOpacity
                style={[styles.signButton, !isNegative && styles.signButtonActivePositive]}
                onPress={() => setIsNegative(false)}>
                <Text style={styles.signText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signButton, isNegative && styles.signButtonActiveNegative]}
                onPress={() => setIsNegative(true)}>
                <Text style={styles.signText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="0.00"
                keyboardType="numeric"
                error={errors.amount ? 'Amount is required' : undefined}
              />
            )}
            name="amount"
          />

          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Title"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Lunch, Borrowed cash..."
                error={errors.title ? 'Title is required' : undefined}
              />
            )}
            name="title"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.userPicker}>
            {CATEGORIES.map((cat) => (
              <Controller
                key={cat}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[styles.userChip, value === cat && styles.userChipSelected]}
                    onPress={() => onChange(cat)}>
                    <Text
                      style={[styles.userChipText, value === cat && styles.userChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )}
                name="category"
              />
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {isNegative
                ? 'Friendly reminder: You owe this friend.'
                : 'Nice! This friend owes you.'}
            </Text>
          </View>

          <Button
            title="Add Transaction"
            onPress={handleSubmit}
            disabled={friends.length === 0}
            loading={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  form: {
    paddingVertical: Spacing.md,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  userPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  userChipText: {
    color: Colors.text,
    fontSize: 14,
  },
  userChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  currencyBadgeInline: {
    backgroundColor: '#000',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.borderRadius.round,
    marginLeft: Spacing.xs,
  },
  currencySymbolInline: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  signToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.input,
    borderRadius: Spacing.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  signButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signButtonActivePositive: {
    backgroundColor: Colors.success,
  },
  signButtonActiveNegative: {
    backgroundColor: Colors.error,
  },
  signText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ArrowLeft: {
    marginBottom: Spacing.md,
  },
});
