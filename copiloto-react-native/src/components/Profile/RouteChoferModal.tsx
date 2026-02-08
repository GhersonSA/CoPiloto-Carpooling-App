import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddressAutocomplete from './AddressAutocomplete';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  rutaChofer: any;
  setRutaChofer: (data: any) => void;
  paradasSeleccionadas: { pasajero_id: string; direccion: string }[];
  setParadasSeleccionadas: (paradas: { pasajero_id: string; direccion: string }[]) => void;
}

export default function RouteChoferModal({
  visible,
  onClose,
  onSave,
  rutaChofer,
  setRutaChofer,
  paradasSeleccionadas,
  setParadasSeleccionadas,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboardView}>
          <View style={s.modalContainer}>
            {/* Header */}
            <View style={s.modalHeader}>
              <View style={s.titleRow}>
                <Ionicons name="navigate" size={24} color="#172554" />
                <Text style={s.modalTitle}>Gestionar Ruta de Chofer</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {/* Route Info */}
              <View style={[s.section, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
                <View style={s.sectionHeader}>
                  <Ionicons name="map" size={18} color="#172554" />
                  <Text style={[s.sectionTitle, { color: '#172554' }]}>Información de la Ruta</Text>
                </View>

                <FormField label="Punto de Origen" icon="location" iconColor="#22c55e">
                  <AddressAutocomplete
                    value={rutaChofer?.origen || ''}
                    onChange={(v) => setRutaChofer({ ...rutaChofer, origen: v })}
                    placeholder="Ej: Calle Gran Vía 1, Zaragoza"
                  />
                </FormField>

                <FormField label="Punto de Destino" icon="flag" iconColor="#ef4444">
                  <AddressAutocomplete
                    value={rutaChofer?.destino || ''}
                    onChange={(v) => setRutaChofer({ ...rutaChofer, destino: v })}
                    placeholder="Ej: Plaza del Pilar, Zaragoza"
                  />
                </FormField>

                <FormField label="Días de la Semana" icon="calendar" iconColor="#a855f7">
                  <TextInput
                    style={s.input}
                    placeholder="Ej: Lunes, Martes, Miércoles"
                    placeholderTextColor="#9ca3af"
                    value={rutaChofer?.dias || ''}
                    onChangeText={(v) => setRutaChofer({ ...rutaChofer, dias: v })}
                  />
                </FormField>

                <View style={s.row}>
                  <View style={s.halfField}>
                    <FormField label="Hora de Salida" icon="time" iconColor="#f97316">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaChofer?.hora_salida || ''}
                        onChangeText={(v) => setRutaChofer({ ...rutaChofer, hora_salida: v })}
                      />
                    </FormField>
                  </View>
                  <View style={s.halfField}>
                    <FormField label="Hora de Llegada" icon="time" iconColor="#3b82f6">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaChofer?.hora_llegada || ''}
                        onChangeText={(v) => setRutaChofer({ ...rutaChofer, hora_llegada: v })}
                      />
                    </FormField>
                  </View>
                </View>

                <View style={s.row}>
                  <View style={s.halfField}>
                    <FormField label="Hora de Regreso" icon="return-up-back" iconColor="#f97316">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaChofer?.hora_regreso || ''}
                        onChangeText={(v) => setRutaChofer({ ...rutaChofer, hora_regreso: v })}
                      />
                    </FormField>
                  </View>
                  <View style={s.halfField}>
                    <FormField label="Llegada del Regreso" icon="home" iconColor="#3b82f6">
                      <TextInput
                        style={s.input}
                        placeholder="HH:MM"
                        placeholderTextColor="#9ca3af"
                        value={rutaChofer?.hora_llegada_regreso || ''}
                        onChangeText={(v) => setRutaChofer({ ...rutaChofer, hora_llegada_regreso: v })}
                      />
                    </FormField>
                  </View>
                </View>
              </View>

              {/* Paradas */}
              <View style={[s.section, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
                <View style={s.sectionHeader}>
                  <Ionicons name="pin" size={18} color="#15803d" />
                  <Text style={[s.sectionTitle, { color: '#15803d' }]}>Paradas de Pasajeros</Text>
                </View>

                {paradasSeleccionadas.length === 0 ? (
                  <Text style={s.noParadas}>No hay paradas añadidas todavía</Text>
                ) : (
                  paradasSeleccionadas.map((parada, index) => (
                    <View key={index} style={s.paradaRow}>
                      <View style={s.paradaNum}>
                        <Text style={s.paradaNumText}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <AddressAutocomplete
                          value={parada.direccion}
                          onChange={(v) => {
                            const newParadas = [...paradasSeleccionadas];
                            newParadas[index] = { ...newParadas[index], direccion: v };
                            setParadasSeleccionadas(newParadas);
                          }}
                          placeholder={`Dirección de parada ${index + 1}`}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setParadasSeleccionadas(paradasSeleccionadas.filter((_, i) => i !== index))}
                        style={s.paradaDeleteBtn}
                      >
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  onPress={() => setParadasSeleccionadas([...paradasSeleccionadas, { pasajero_id: '', direccion: '' }])}
                  style={s.addParadaBtn}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={s.addParadaText}>Agregar Parada</Text>
                </TouchableOpacity>
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
    color: '#172554',
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
  noParadas: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  paradaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  paradaNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paradaNumText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  paradaDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addParadaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  addParadaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
    backgroundColor: '#172554',
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
