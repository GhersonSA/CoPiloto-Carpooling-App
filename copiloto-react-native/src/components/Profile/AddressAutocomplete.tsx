import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRef, useEffect, useCallback } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder = 'Escribe una dirección...' }: AddressAutocompleteProps) {
  const ref = useRef<any>(null);
  const lastSetByParent = useRef(value || '');

  // Only sync text from parent when it changes externally
  useEffect(() => {
    if (ref.current && value !== lastSetByParent.current) {
      lastSetByParent.current = value || '';
      ref.current.setAddressText(value || '');
    }
  }, [value]);

  const handlePress = useCallback((data: any) => {
    const address = data.description || data.structured_formatting?.main_text || '';
    lastSetByParent.current = address;
    onChange(address);
  }, [onChange]);

  return (
    <View style={s.wrapper}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        onPress={handlePress}
        keyboardShouldPersistTaps="handled"
        textInputProps={{
          placeholderTextColor: '#9ca3af',
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'es',
          components: 'country:es',
        }}
        disableScroll={true}
        fetchDetails={false}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={3}
        styles={{
          textInput: s.input,
          container: s.container,
          listView: s.listView,
          row: s.row,
          description: s.description,
          separator: s.separator,
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    zIndex: 9999,
    position: 'relative',
  },
  container: {
    flex: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#111827',
    height: 48,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: 200,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
