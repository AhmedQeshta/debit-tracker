import { View, Text,StyleSheet } from 'react-native';
import { Colors } from '@/theme/colors';
import { Users as UsersIcon,Receipt, Info } from 'lucide-react-native';
import { Spacing } from '@/theme/spacing';
import { IEmptySectionProps } from '@/types/common';


export const EmptySection = ({title,description,icon}:IEmptySectionProps)=>{
const getIcons = (icon:string)=>{
  switch (icon) {
    case 'users':
      return <UsersIcon size={64} color={Colors.primary} strokeWidth={1.5} />
    case 'transactions':
      return <Receipt size={64} color={Colors.primary} strokeWidth={1.5} />
    default:
      return <Info size={64} color={Colors.primary} strokeWidth={1.5}/>
  }
}

  return <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          {getIcons(icon||'')}
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{description}</Text>
      </View>
}


const styles = StyleSheet.create({

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
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  
});

