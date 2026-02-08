import { View, Text, TextInput, StyleSheet } from 'react-native';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  prefix = '+34',
  placeholder = '612345678',
}: PhoneInputProps) {
  const getNumberWithoutPrefix = (val: string) => {
    if (!val) return '';
    return val.replace(prefix, '').replace(/\s/g, '');
  };

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const limited = digits.slice(0, 9);
    onChange(limited ? `${prefix}${limited}` : '');
  };

  return (
    <View style={s.container}>
      <View style={s.prefixBox}>
        <Text style={s.prefixText}>{prefix}</Text>
      </View>
      <TextInput
        style={s.input}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={getNumberWithoutPrefix(value)}
        onChangeText={handleChange}
        maxLength={9}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  prefixBox: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
    backgroundColor: '#fff',
  },
});
