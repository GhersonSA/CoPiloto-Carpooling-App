import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, getLocalPresetSource } from '../../lib/imageUtils';

interface Props {
  perfil: any;
  vehiculo: any;
  rutaOriginal: any;
  onGestionarRuta: () => void;
  onEliminarRuta: () => void;
}

export default function DriverProfileCard({ perfil, vehiculo, rutaOriginal, onGestionarRuta, onEliminarRuta }: Props) {
  if (!perfil) return null;

  const formatHora = (hora: string) => (hora ? hora.slice(0, 5) : '');
  const localChoferImg = getLocalPresetSource(perfil.img_chofer);
  const imgUrl = localChoferImg ? null : getImageUrl(perfil.img_chofer);
  const localVehImg = vehiculo ? getLocalPresetSource(vehiculo.img_vehiculo) : null;
  const vehImgUrl = vehiculo && !localVehImg ? getImageUrl(vehiculo.img_vehiculo) : null;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="car" size={28} color="#172554" />
        <Text style={s.headerTitle}>Perfil Chofer</Text>
      </View>

      {/* Chofer + Vehiculo */}
      <View style={s.cardsRow}>
        {/* Chofer */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="person" size={18} color="#172554" />
            <Text style={s.cardTitle}>Chofer</Text>
          </View>
          <View style={s.avatarContainer}>
            {localChoferImg ? (
              <Image source={localChoferImg} style={s.avatar} />
            ) : imgUrl ? (
              <Image source={{ uri: imgUrl }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Ionicons name="person" size={36} color="#6b7280" />
              </View>
            )}
          </View>
          <View style={s.infoList}>
            <InfoItem icon="location" label="Dirección" value={perfil.direccion} />
            <InfoItem icon="map" label="Barrio" value={perfil.barrio} />
            {perfil.telefono && <InfoItem icon="call" label="Teléfono" value={perfil.telefono} />}
            <InfoItem icon="star" label="Calificación" value={perfil.calificacion || '0.00'} iconColor="#eab308" />
          </View>
        </View>

        {/* Vehículo */}
        {vehiculo && Object.keys(vehiculo).length > 0 && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="car-sport" size={18} color="#172554" />
              <Text style={s.cardTitle}>Vehículo</Text>
            </View>
            <View style={s.avatarContainer}>
              {localVehImg ? (
                <Image source={localVehImg} style={s.vehicleImage} />
              ) : vehImgUrl ? (
                <Image source={{ uri: vehImgUrl }} style={s.vehicleImage} />
              ) : (
                <View style={[s.vehicleImage, s.avatarPlaceholder]}>
                  <Ionicons name="car" size={36} color="#6b7280" />
                </View>
              )}
            </View>
            <View style={s.infoList}>
              <InfoItem icon="speedometer" label="Marca" value={vehiculo.marca} />
              <InfoItem icon="car-outline" label="Modelo" value={vehiculo.modelo} />
              <InfoItem icon="color-palette" label="Color" value={vehiculo.color} />
              <InfoItem icon="card" label="Matrícula" value={vehiculo.matricula} />
              <InfoItem icon="people" label="Plazas" value={vehiculo.plazas?.toString()} />
            </View>
          </View>
        )}
      </View>

      {/* Ruta */}
      <View style={s.routeSection}>
        <View style={s.cardHeader}>
          <Ionicons name="navigate" size={18} color="#172554" />
          <Text style={s.cardTitle}>Tu Ruta</Text>
        </View>

        {rutaOriginal ? (
          <View style={s.routeBox}>
            <Text style={s.routeText}><Text style={s.bold}>Origen:</Text> {rutaOriginal.origen}</Text>
            <Text style={s.routeText}><Text style={s.bold}>Destino:</Text> {rutaOriginal.destino}</Text>
            <Text style={s.routeText}><Text style={s.bold}>Días:</Text> {rutaOriginal.dias}</Text>
            <Text style={s.routeText}>
              <Text style={s.bold}>Salida:</Text> {formatHora(rutaOriginal.hora_salida)} — <Text style={s.bold}>Llegada:</Text> {formatHora(rutaOriginal.hora_llegada)}
            </Text>
            <Text style={s.routeText}>
              <Text style={s.bold}>Regreso:</Text> {formatHora(rutaOriginal.hora_regreso)} — <Text style={s.bold}>Llegada:</Text> {formatHora(rutaOriginal.hora_llegada_regreso)}
            </Text>
            {rutaOriginal.paradas?.length > 0 && (
              <Text style={[s.routeText, { marginTop: 4 }]}>
                <Ionicons name="pin" size={12} color="#172554" /> <Text style={s.bold}>Paradas:</Text> {rutaOriginal.paradas.length}
              </Text>
            )}
            <TouchableOpacity onPress={onEliminarRuta} style={s.deleteBtn}>
              <Ionicons name="trash" size={14} color="#fff" />
              <Text style={s.deleteBtnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={s.noRoute}>No tienes ruta definida</Text>
        )}

        <TouchableOpacity onPress={onGestionarRuta} style={s.manageBtn}>
          <Ionicons name="map" size={16} color="#fff" />
          <Text style={s.manageBtnText}>Gestionar Ruta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoItem({ icon, label, value, iconColor }: { icon: string; label: string; value?: string | null; iconColor?: string }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon as any} size={14} color={iconColor || '#172554'} />
      <Text style={s.infoLabel}>{label}:</Text>
      <Text style={s.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#eff6ff',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172554',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#172554',
  },
  vehicleImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#93c5fd',
  },
  avatarPlaceholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoList: {
    gap: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  infoValue: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  routeSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#bfdbfe',
  },
  routeBox: {
    borderWidth: 2,
    borderColor: '#93c5fd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  routeText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
  },
  noRoute: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#172554',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  manageBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
