import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTrash, restoreFromTrash, deleteFromTrash, emptyTrash, formatDate } from '../data/storage';
import ConfirmModal from '../components/ConfirmModal';

export default function TrashScreen({ navigation }) {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(null); // trashId

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    const data = await getTrash();
    setItems(data);
    setLoading(false);
  }

  async function handleRestore(trashId) {
    await restoreFromTrash(trashId);
    load();
  }

  async function handleDeleteForever() {
    await deleteFromTrash(confirmDel);
    setConfirmDel(null);
    load();
  }

  async function handleEmptyTrash() {
    await emptyTrash();
    setConfirmEmpty(false);
    load();
  }

  function daysLeft(expiresAt) {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Patients')} style={s.backBtn}>
          <Text style={s.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTag}>LIXEIRA</Text>
          <Text style={s.headerTitle}>Itens excluídos</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity style={s.emptyBtn} onPress={() => setConfirmEmpty(true)}>
            <Text style={s.emptyBtnTxt}>Esvaziar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Aviso */}
        <View style={s.infoBox}>
          <Text style={s.infoTxt}>🕐 Itens ficam na lixeira por 30 dias e depois são apagados permanentemente.</Text>
        </View>

        {loading ? (
          <Text style={s.empty}>Carregando...</Text>
        ) : items.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🗑</Text>
            <Text style={s.emptyTitle}>Lixeira vazia</Text>
            <Text style={s.emptySub}>Itens excluídos aparecem aqui por 30 dias</Text>
          </View>
        ) : (
          items.map(item => {
            const isPatient = item.type === 'patient';
            const days = daysLeft(item.expiresAt);
            const urgent = days <= 3;
            return (
              <View key={item.trashId} style={s.card}>
                {/* Tipo + nome */}
                <View style={s.cardTop}>
                  <View style={[s.typeBadge, { backgroundColor: isPatient ? '#EEF3FF' : '#FFF4E0' }]}>
                    <Text style={[s.typeText, { color: isPatient ? '#4A6FA5' : '#C9A84C' }]}>
                      {isPatient ? '👤 Paciente' : '📋 Avaliação'}
                    </Text>
                  </View>
                  <View style={[s.daysBadge, { backgroundColor: urgent ? '#FFF0EE' : '#F5F3EF' }]}>
                    <Text style={[s.daysTxt, { color: urgent ? '#C0547A' : '#8C7B6B' }]}>
                      {days}d restantes
                    </Text>
                  </View>
                </View>

                <Text style={s.cardName}>
                  {isPatient
                    ? item.data.name
                    : `Avaliação de ${formatDate(item.data.startedAt)}${item.data.evaluator ? ' · ' + item.data.evaluator : ''}`}
                </Text>

                {isPatient && item.data.dob ? (
                  <Text style={s.cardMeta}>🎂 {item.data.dob}</Text>
                ) : null}
                {!isPatient && item.data.status ? (
                  <Text style={s.cardMeta}>
                    {item.data.status === 'complete' ? '✅ Concluída' : '🔄 Em andamento'}
                  </Text>
                ) : null}

                <Text style={s.cardDeleted}>Excluído em {formatDate(item.deletedAt)}</Text>

                {/* Ações */}
                <View style={s.cardBtns}>
                  <TouchableOpacity style={s.btnRestore} onPress={() => handleRestore(item.trashId)}>
                    <Text style={s.btnRestoreTxt}>↩ Restaurar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnDelete} onPress={() => setConfirmDel(item.trashId)}>
                    <Text style={s.btnDeleteTxt}>🗑 Apagar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={!!confirmDel}
        title="Apagar permanentemente"
        message="Este item será excluído para sempre e não poderá ser recuperado."
        confirmLabel="Apagar"
        onConfirm={handleDeleteForever}
        onCancel={() => setConfirmDel(null)}
      />

      <ConfirmModal
        visible={confirmEmpty}
        title="Esvaziar lixeira"
        message="Todos os itens serão excluídos permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Esvaziar"
        onConfirm={handleEmptyTrash}
        onCancel={() => setConfirmEmpty(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0F1923' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: 'white' },
  headerTag:  { fontSize: 10, color: '#C0547A', fontWeight: '800', letterSpacing: 2 },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: 'white' },
  emptyBtn:   { backgroundColor: 'rgba(192,84,122,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  emptyBtnTxt:{ fontSize: 13, fontWeight: '700', color: '#C0547A' },

  scroll: { padding: 16, paddingTop: 8, backgroundColor: '#F5F3EF' },

  infoBox: { backgroundColor: '#FFF4E0', borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#C9A84C' },
  infoTxt: { fontSize: 12, color: '#8C7B6B', lineHeight: 18 },

  empty:     { color: '#8C7B6B', padding: 20, textAlign: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle:{ fontSize: 16, fontWeight: '800', color: '#1A1714', marginBottom: 4 },
  emptySub:  { fontSize: 13, color: '#8C7B6B' },

  card: {
    backgroundColor: 'white', borderRadius: 14, padding: 16,
    marginBottom: 10, elevation: 2,
  },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText:  { fontSize: 12, fontWeight: '700' },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  daysTxt:   { fontSize: 11, fontWeight: '700' },

  cardName:   { fontSize: 15, fontWeight: '800', color: '#1A1714', marginBottom: 4 },
  cardMeta:   { fontSize: 12, color: '#8C7B6B', marginBottom: 2 },
  cardDeleted:{ fontSize: 11, color: '#B0A090', marginTop: 4, marginBottom: 12 },

  cardBtns:   { flexDirection: 'row', gap: 8 },
  btnRestore: { flex: 1, backgroundColor: '#EEF3FF', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnRestoreTxt: { color: '#4A6FA5', fontWeight: '700', fontSize: 13 },
  btnDelete:  { flex: 1, backgroundColor: '#FFF0EE', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnDeleteTxt: { color: '#C0547A', fontWeight: '700', fontSize: 13 },
});
