import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HealthCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon?: string;
  onPress?: () => void;
  isLoading?: boolean;
  error?: boolean;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  title,
  value,
  unit,
  icon,
  onPress,
  isLoading = false,
  error = false,
}) => {
  const displayValue = () => {
    if (isLoading) return '...';
    if (error || value === null) return '--';
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={[styles.card, error && styles.errorCard]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, error && styles.errorText]}>
          {displayValue()}
        </Text>
        {unit && !isLoading && !error && value !== null && (
          <Text style={styles.unit}>{unit}</Text>
        )}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
  },
  errorCard: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flex: 1,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  errorText: {
    color: '#ff6b6b',
  },
});