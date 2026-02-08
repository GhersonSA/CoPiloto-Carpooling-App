import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddressAutocomplete from './AddressAutocomplete';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  rutaPasajero: any;
  setRutaPasajero: (data: any) => void;
}

export default function RoutePasajeroModal({ visible, onClose, onSave, rutaPasajero, setRutaPasajero }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboardView}>
          <View style={s.modalContainer}>
            {/* Header */}
            <View style={s.modalHeader}>
              <View style={s.titleRow}>
                <Ionicons name="navigate" size={24} color="#15803d" />
                <Text style={s.modalTitle}>Gestionar Ruta de Pasajero</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              <View style={[s.section, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
                <View style={s.sectionHeader}>
                  <Ionicons name="map" size={18} color="#15803d" />
                  <Text style={[s.sectionTitle, { color: '#15803d' }]}>Información de tu Ruta</Text>
                </View>

                <FormField label="¿Desde dónde sales? (Origen)" icon="home" iconColor="#22c55e">
                  <AddressAutocomplete
                    value={rutaPasajero?.origen || ''}
                    onChange={(v) => setRutaPasajero({ ...rutaPasajero, origen: v })}
                    placeholder="Ej: Tu dirección de casa"
                  />
                </FormField>

                <FormField label="¿A dónde vas? (Destino)" icon="briefcase" iconColor="#ef4444">
                  <AddressAutocomplete
                    value={rutaPasajero?.destino || ''}
                    onChange={(v) => setRutaPasajero({ ...rutaPasajero, destino: v })}
                    placeholder="Ej: Tu lugar de trabajo o estudio"
                  />
                </FormField>

                <FormField label="¿Qué días necesitas transporte?" icon="calendar" iconColor="#a855f7">
                  <TextInput
                    style={s.input}
                    placeholder="Ej: Lunes, Martes, Miércoles, Jueves, Viernes"
                    placeholderTextColor="#9ca3af"
                    value={rutaPasajero?.dias || ''}
                    onChangeText={(v) => setRutaPasajero({ ...rutaPasajero, dias: v })}
                  />
                </FormField>

                <View style={s.row}>
                  <View style={s.halfField}>
                    <FormField label="Hora de Salida (Ida)" icon="sunny" iconColor="#f97316">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaPasajero?.hora_salida || ''}
                        onChangeText={(v) => setRutaPasajero({ ...rutaPasajero, hora_salida: v })}
                      />
                    </FormField>
                  </View>
                  <View style={s.halfField}>
                    <FormField label="Hora de Llegada (Ida)" icon="time" iconColor="#3b82f6">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaPasajero?.hora_llegada || ''}
                        onChangeText={(v) => setRutaPasajero({ ...rutaPasajero, hora_llegada: v })}
                      />
                    </FormField>
                  </View>
                </View>

                <View style={s.row}>
                  <View style={s.halfField}>
                    <FormField label="Hora de Regreso (Vuelta)" icon="moon" iconColor="#6366f1">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaPasajero?.hora_regreso || ''}
                        onChangeText={(v) => setRutaPasajero({ ...rutaPasajero, hora_regreso: v })}
                      />
                    </FormField>
                  </View>
                  <View style={s.halfField}>
                    <FormField label="Llegada a Casa (Vuelta)" icon="home" iconColor="#22c55e">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaPasajero?.hora_llegada_regreso || ''}
                        onChangeText={(v) => setRutaPasajero({ ...rutaPasajero, hora_llegada_regreso: v })}
                      />
                    </FormField>
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View style={s.btnRow}>
                <TouchableOpacity onPress={onSave} style={s.saveBtn}>
                  <Ionicons name="save" size={18} color="#fff" />
                  <Text style={s.saveBtnText}>Guardar Ruta</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={s.cancelBtn}>
                  <Ionicons name="close" size={18} color="#fff" />
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function FormField({ label, icon, iconColor, children }: { label: string; icon: string; iconColor: string; children: React.ReactNode }) {
  return (
    <View style={s.formField}>
      <Text style={s.fieldLabel}>
        <Ionicons name={icon as any} size={13} color={iconColor} /> {label}
      </Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803d',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  formField: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
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
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9ca3af',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
