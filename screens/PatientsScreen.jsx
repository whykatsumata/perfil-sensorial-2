import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPatients, getEvaluations, deletePatient, calcAge, formatDate } from '../data/storage';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

export default function PatientsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [patients,  setPatients]  = useState([]);
  const [evalCount, setEvalCount] = useState({});
  const [search,    setSearch]    = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  async function load() {
    const ps   = await getPatients();
    const evs  = await getEvaluations();
    const cnt  = {};
    evs.forEach(e => { cnt[e.patientId] = (cnt[e.patientId] || 0) + 1; });
    setPatients(ps);
    setEvalCount(cnt);
  }

  function confirmDelete(patient) {
    setConfirmDel(patient);
  }

  async function handleDeleteConfirmed() {
    await deletePatient(confirmDel.id);
    setConfirmDel(null);
    load();
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={Platform.OS === 'web' ? [] : []}
      >
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>Avaliação Padronizada</Text>
          <Text style={s.headerTitle}>Perfil Sensorial 2</Text>
          {user?.displayName ? (
            <Text style={s.headerUser}>👤 {user.displayName}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity style={s.trashBtn} onPress={() => navigation.navigate('Trash')}>
            <Text style={s.trashBtnTxt}>🗑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutBtn} onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm(`Logado como: ${user?.displayName || user?.email || 'usuário'}\n\nDeseja sair e entrar com outra conta?`)) logout();
            } else {
              Alert.alert('Trocar de conta',
                `Logado como: ${user?.displayName || user?.email || 'usuário'}\n\nDeseja sair e entrar com outra conta?`,
                [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: logout }]
              );
            }
          }}>
            <Text style={s.logoutTxt}>⎋ Sair</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('PatientForm', {})}>
            <Text style={s.addBtnTxt}>+ Paciente</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar paciente..."
          placeholderTextColor="#A09080"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#A09080', fontSize: 16, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      <View style={s.statsBar}>
        <StatChip num={patients.length} label="Pacientes" color="#C4703F" />
        <StatChip num={Object.values(evalCount).reduce((a,b)=>a+b,0)} label="Avaliações" color="#4A6FA5" />
        <StatChip num={patients.filter(p => evalCount[p.id] > 0).length} label="Com avaliação" color="#5A8C5A" />
      </View>

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>👤</Text>
          <Text style={s.emptyTitle}>{search ? 'Nenhum resultado' : 'Nenhum paciente ainda'}</Text>
          <Text style={s.emptySub}>{search ? 'Tente outro nome' : 'Toque em "+ Paciente" para cadastrar'}</Text>
        </View>
      ) : (
        <View style={{ padding: 16, paddingTop: 8 }}>
          {filtered.map(p => (
            <TouchableOpacity
              key={p.id}
              style={s.patientCard}
              onPress={() => navigation.navigate('PatientDetail', { patientId: p.id })}
              activeOpacity={0.85}
            >
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.patientInfo}>
                <Text style={s.patientName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.patientMeta}>
                  {calcAge(p.dob)}{p.dob ? '  •  ' : ''}{formatDate(p.createdAt)}
                </Text>
                <View style={s.evalBadgeRow}>
                  <View style={[s.evalBadge, { backgroundColor: evalCount[p.id] ? '#EEF3FF' : '#F5F3EF' }]}>
                    <Text style={[s.evalBadgeTxt, { color: evalCount[p.id] ? '#4A6FA5' : '#A09080' }]}>
                      {evalCount[p.id] || 0} avaliação(ões)
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('PatientForm', { patient: p })}>
                  <Text style={s.editBtnTxt}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.deleteBtn} onPress={() => confirmDelete(p)}>
                  <Text style={s.deleteBtnTxt}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
      </ScrollView>
      <ConfirmModal
        visible={!!confirmDel}
        title="Excluir paciente"
        message={confirmDel ? `Excluir "${confirmDel.name}" e todas as avaliações? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDel(null)}
      />
    </SafeAreaView>
  );
}

function StatChip({ num, label, color }) {
  return (
    <View style={[ss.chip, { borderLeftColor: color }]}>
      <Text style={[ss.chipNum, { color }]}>{num}</Text>
      <Text style={ss.chipLbl}>{label}</Text>
    </View>
  );
}
const ss = StyleSheet.create({
  chip: { flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 12, borderLeftWidth: 3, alignItems: 'center' },
  chipNum: { fontSize: 22, fontWeight: '800' },
  chipLbl: { fontSize: 10, color: '#8C7B6B', fontWeight: '600', marginTop: 1 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1923' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20,
  },
  headerSub:   { fontSize: 11, color: '#C4703F', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: 'white', marginTop: 2 },
  headerUser: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  trashBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(192,84,122,0.15)', borderRadius: 10 },
  trashBtnTxt: { fontSize: 16 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  logoutTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  addBtn: { backgroundColor: '#C4703F', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 14,
  },
  searchIcon:  { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: 'white' },

  statsBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:  { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 6 },
  emptySub:   { fontSize: 14, color: '#8C7B6B', textAlign: 'center' },

  patientCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#C4703F', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '800', color: 'white' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1A1714', marginBottom: 3 },
  patientMeta: { fontSize: 12, color: '#8C7B6B', marginBottom: 6 },
  evalBadgeRow: { flexDirection: 'row' },
  evalBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  evalBadgeTxt: { fontSize: 11, fontWeight: '700' },
  cardActions: { gap: 8 },
  editBtn:   { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F3EF', alignItems: 'center', justifyContent: 'center' },
  editBtnTxt: { fontSize: 14 },
  deleteBtn:  { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF0EE', alignItems: 'center', justifyContent: 'center' },
  deleteBtnTxt: { fontSize: 14 },
});
