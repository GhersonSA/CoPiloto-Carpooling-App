import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from './PhoneInput';
import ImageSelector from './ImageSelector';
import AddressAutocomplete from './AddressAutocomplete';
import { ImageSourcePropType } from 'react-native';

const choferImg: { source: ImageSourcePropType; id: string }[] = [
  { source: require('../../../assets/imgChofer1.png'), id: '/assets/imgChofer1.png' },
  { source: require('../../../assets/imgChofer2.jpg'), id: '/assets/imgChofer2.jpg' },
  { source: require('../../../assets/imgChofer3.png'), id: '/assets/imgChofer3.png' },
];
const vehiculoImg: { source: ImageSourcePropType; id: string }[] = [
  { source: require('../../../assets/imgVehiculo1.jpg'), id: '/assets/imgVehiculo1.jpg' },
  { source: require('../../../assets/imgVehiculo2.jpeg'), id: '/assets/imgVehiculo2.jpeg' },
  { source: require('../../../assets/imgVehiculo3.jpg'), id: '/assets/imgVehiculo3.jpg' },
];
const pasajeroImg: { source: ImageSourcePropType; id: string }[] = [
  { source: require('../../../assets/imgPasajero1.jpg'), id: '/assets/imgPasajero1.jpg' },
  { source: require('../../../assets/imgPasajero2.jpg'), id: '/assets/imgPasajero2.jpg' },
  { source: require('../../../assets/imgPasajero3.png'), id: '/assets/imgPasajero3.png' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formRole: any;
  setFormRole: (data: any) => void;
  mode: 'create' | 'edit';
}

export default function RoleFormModal({ visible, onClose, onSubmit, formRole, setFormRole, mode }: Props) {
  if (!formRole) return null;

  const tipo = formRole.tipo;
  const isChofer = tipo === 'chofer';
  const titleColor = isChofer ? '#172554' : '#15803d';
  const title = mode === 'create'
    ? `Crear Rol: ${isChofer ? 'Chofer' : 'Pasajero'}`
    : `Editar Rol: ${isChofer ? 'Chofer' : 'Pasajero'}`;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboardView}>
          <View style={s.modalContainer}>
            {/* Header */}
            <View style={s.modalHeader}>
              <View style={s.titleRow}>
                <Ionicons name={isChofer ? 'car' : 'person'} size={28} color={titleColor} />
                <Text style={[s.modalTitle, { color: titleColor }]}>{title}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {/* Chofer form */}
              {isChofer && (
                <>
                  {/* Datos Personales */}
                  <View style={[s.section, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
                    <View style={s.sectionHeader}>
                      <Ionicons name="person" size={18} color="#172554" />
                      <Text style={[s.sectionTitle, { color: '#172554' }]}>Datos Personales</Text>
                    </View>

                    <FormField label="Dirección" icon="location" iconColor="#3b82f6">
                      <AddressAutocomplete
                        value={formRole.direccion || ''}
                        onChange={(v) => setFormRole({ ...formRole, direccion: v })}
                        placeholder="Ej: Calle Gran Vía 25, Zaragoza"
                      />
                    </FormField>

                    <FormField label="Barrio" icon="pin" iconColor="#a855f7">
                      <TextInput
                        style={s.input}
                        placeholder="Ej: Centro, Delicias, Actur..."
                        placeholderTextColor="#9ca3af"
                        value={formRole.barrio || ''}
                        onChangeText={(v) => setFormRole({ ...formRole, barrio: v })}
                      />
                    </FormField>

                    <FormField label="Teléfono de Contacto" icon="call" iconColor="#22c55e">
                      <PhoneInput
                        value={formRole.telefono || ''}
                        onChange={(v) => setFormRole({ ...formRole, telefono: v })}
                      />
                    </FormField>

                    <ImageSelector
                      currentImage={formRole.img_chofer}
                      onImageSelect={(url) => setFormRole({ ...formRole, img_chofer: url })}
                      presetImages={choferImg}
                      label="Imagen del Chofer"
                      type="chofer"
                    />
                  </View>

                  {/* Datos del Vehículo */}
                  <View style={[s.section, { borderColor: '#fed7aa', backgroundColor: '#fff7ed' }]}>
                    <View style={s.sectionHeader}>
                      <Ionicons name="car-sport" size={18} color="#c2410c" />
                      <Text style={[s.sectionTitle, { color: '#c2410c' }]}>Datos del Vehículo</Text>
                    </View>

                    <View style={s.row}>
                      <View style={s.halfField}>
                        <FormField label="Marca" icon="business" iconColor="#6b7280">
                          <TextInput
                            style={s.input}
                            placeholder="Ej: Toyota, Ford..."
                            placeholderTextColor="#9ca3af"
                            value={formRole.marca || ''}
                            onChangeText={(v) => setFormRole({ ...formRole, marca: v })}
                          />
                        </FormField>
                      </View>
                      <View style={s.halfField}>
                        <FormField label="Modelo" icon="car" iconColor="#3b82f6">
                          <TextInput
                            style={s.input}
                            placeholder="Ej: Corolla, Focus..."
                            placeholderTextColor="#9ca3af"
                            value={formRole.modelo || ''}
                            onChangeText={(v) => setFormRole({ ...formRole, modelo: v })}
                          />
                        </FormField>
                      </View>
                    </View>

                    <View style={s.row}>
                      <View style={s.halfField}>
                        <FormField label="Color" icon="color-palette" iconColor="#ec4899">
                          <TextInput
                            style={s.input}
                            placeholder="Ej: Blanco, Negro..."
                            placeholderTextColor="#9ca3af"
                            value={formRole.color || ''}
                            onChangeText={(v) => setFormRole({ ...formRole, color: v })}
                          />
                        </FormField>
                      </View>
                      <View style={s.halfField}>
                        <FormField label="Matrícula" icon="card" iconColor="#6366f1">
                          <TextInput
                            style={s.input}
                            placeholder="Ej: 1234 ABC"
                            placeholderTextColor="#9ca3af"
                            value={formRole.matricula || ''}
                            onChangeText={(v) => setFormRole({ ...formRole, matricula: v })}
                          />
                        </FormField>
                      </View>
                    </View>

                    <FormField label="Plazas Disponibles" icon="people" iconColor="#22c55e">
                      <TextInput
                        style={s.input}
                        placeholder="Ej: 4"
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        value={formRole.plazas?.toString() || ''}
                        onChangeText={(v) => setFormRole({ ...formRole, plazas: parseInt(v) || 0 })}
                      />
                    </FormField>

                    <ImageSelector
                      currentImage={formRole.img_vehiculo}
                      onImageSelect={(url) => setFormRole({ ...formRole, img_vehiculo: url })}
                      presetImages={vehiculoImg}
                      label="Imagen del Vehículo"
                      type="vehiculo"
                    />
                  </View>
                </>
              )}

              {/* Pasajero form */}
              {!isChofer && (
                <View style={[s.section, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
                  <View style={s.sectionHeader}>
                    <Ionicons name="person" size={18} color="#15803d" />
                    <Text style={[s.sectionTitle, { color: '#15803d' }]}>Datos Personales</Text>
                  </View>

                  <FormField label="Nacionalidad" icon="globe" iconColor="#3b82f6">
                    <TextInput
                      style={s.input}
                      placeholder="Ej: Española, Colombiana..."
                      placeholderTextColor="#9ca3af"
                      value={formRole.nacionalidad || ''}
                      onChangeText={(v) => setFormRole({ ...formRole, nacionalidad: v })}
                    />
                  </FormField>

                  <FormField label="Barrio" icon="pin" iconColor="#a855f7">
                    <TextInput
                      style={s.input}
                      placeholder="Ej: Centro, Delicias, Actur..."
                      placeholderTextColor="#9ca3af"
                      value={formRole.barrio || ''}
                      onChangeText={(v) => setFormRole({ ...formRole, barrio: v })}
                    />
                  </FormField>

                  <FormField label="Teléfono de Contacto" icon="call" iconColor="#22c55e">
                    <PhoneInput
                      value={formRole.telefono || ''}
                      onChange={(v) => setFormRole({ ...formRole, telefono: v })}
                    />
                  </FormField>

                  <ImageSelector
                    currentImage={formRole.img_pasajero}
                    onImageSelect={(url) => setFormRole({ ...formRole, img_pasajero: url })}
                    presetImages={pasajeroImg}
                    label="Imagen del Pasajero"
                    type="pasajero"
                  />
                </View>
              )}

              {/* Buttons */}
              <View style={s.btnRow}>
                <TouchableOpacity
                  onPress={onSubmit}
                  style={[s.submitBtn, { backgroundColor: isChofer ? '#172554' : '#16a34a' }]}
                >
                  <Ionicons name={mode === 'create' ? 'checkmark' : 'save'} size={18} color="#fff" />
                  <Text style={s.submitBtnText}>{mode === 'create' ? 'Crear Rol' : 'Guardar'}</Text>
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
    fontSize: 20,
    fontWeight: '700',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
