import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { User } from '../types/models';
import { Link } from 'expo-router';

interface Props {
  user: User;
  balance: number;
}

export const UserCard = ({ user, balance }: Props) => {
  return (
    <Link href={`/user/${user.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.imageContainer}>
          {user.imageUri ? (
            <Image source={{ uri: user.imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>{user.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio} numberOfLines={1}>
            {user.bio}
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balance, balance < 0 ? styles.negative : styles.positive]}>
            ${Math.abs(balance).toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>{balance < 0 ? 'Owes You' : 'You Owe'}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    marginRight: Spacing.md,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderImage: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: Colors.success,
  },
  negative: {
    color: Colors.error,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
