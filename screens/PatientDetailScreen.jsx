import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getPatients, getEvaluations, deleteEvaluation,
  saveEvaluation, generateId, calcAge, formatDate,
} from '../data/storage';
import { SECTIONS } from '../data/sensoryData';

const TOTAL_ITEMS = SECTIONS.reduce((s, x) => s + x.items.length, 0);

export default function PatientDetailScreen({ navigation, route }) {
  const { patientId } = route.params;
  const [patient,   setPatient]   = useState(null);
  const [evals,     setEvals]     = useState([]);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const ps = await getPatients();
    setPatient(ps.find(p => p.id === patientId) || null);
    const ev = await getEvaluations(patientId);
    setEvals(ev.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)));
  }

  const [evalModalVisible, setEvalModalVisible] = useState(false);
  const [newEvaluatorName, setNewEvaluatorName] = useState('');

  function promptNewEval() {
    setNewEvaluatorName('');
    setEvalModalVisible(true);
  }

  async function startNewEval() {
    const evaluator = newEvaluatorName.trim();
    setEvalModalVisible(false);
    const ev = {
      id:         generateId(),
      patientId,
      evaluator,
      startedAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      finishedAt: null,
      status:     'draft',
      sectionIdx: 0,
      answers:    {},
    };
    await saveEvaluation(ev);
    navigation.navigate('Questions', { evaluationId: ev.id, patientId });
  }

  async function reopenEval(ev) {
    // Reabre avaliação completa para edição — mantém respostas, volta ao status draft
    const updated = { ...ev, status: 'draft', sectionIdx: 0, finishedAt: null };
    await saveEvaluation(updated);
    // Usa push para forçar nova instância da tela e recarregar dados do Firestore
    navigation.push('Questions', { evaluationId: ev.id, patientId, reopen: Date.now() });
  }

  function confirmDelete(ev) {
    Alert.alert('Excluir avaliação', 'Deseja excluir esta avaliação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteEvaluation(ev.id);
        load();
      }},
    ]);
  }

  function progressOf(ev) {
    return Math.round((Object.keys(ev.answers || {}).length / TOTAL_ITEMS) * 100);
  }

  if (!patient) return null;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>Paciente</Text>
          <Text style={s.headerTitle} numberOfLines={1}>{patient.name}</Text>
        </View>
        <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('PatientForm', { patient })}>
          <Text style={s.editBtnTxt}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Patient card */}
        <View style={s.patientCard}>
          <View style={s.avatarLarge}>
            <Text style={s.avatarTxt}>{patient.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.patientInfo}>
            <Text style={s.patientName}>{patient.name}</Text>
            {patient.dob      && <InfoRow icon="🎂" text={`${patient.dob} (${calcAge(patient.dob)})`} />}
            {patient.diagnosis && <InfoRow icon="🏥" text={patient.diagnosis} />}
            {patient.respondent && <InfoRow icon="👤" text={`${patient.respondent}${patient.relation ? ' · ' + patient.relation : ''}`} />}
            {patient.notes     && <InfoRow icon="📝" text={patient.notes} />}
          </View>
        </View>

        {/* New eval button */}
        <TouchableOpacity style={s.btnNewEval} onPress={promptNewEval} activeOpacity={0.85}>
          <Text style={s.btnNewEvalIcon}>＋</Text>
          <View>
            <Text style={s.btnNewEvalTitle}>Nova Avaliação</Text>
            <Text style={s.btnNewEvalSub}>Iniciar Perfil Sensorial 2</Text>
          </View>
        </TouchableOpacity>

        {/* Evaluations */}
        <Text style={s.sectionTitle}>Avaliações Realizadas</Text>

        {evals.length === 0 ? (
          <View style={s.emptyEvals}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTxt}>Nenhuma avaliação ainda</Text>
          </View>
        ) : (
          evals.map(ev => {
            const pct      = progressOf(ev);
            const isDraft  = ev.status === 'draft';
            return (
              <View key={ev.id} style={s.evalCard}>
                <View style={s.evalCardTop}>
                  <View style={[s.statusDot, { backgroundColor: isDraft ? '#C9A84C' : '#5A8C5A' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.evalDate}>{formatDate(ev.startedAt)}</Text>
                    <Text style={s.evalStatus}>{isDraft ? `Em andamento · ${pct}%` : 'Concluída'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(ev)} style={s.delBtn}>
                    <Text style={{ fontSize: 16 }}>🗑</Text>
                  </TouchableOpacity>
                </View>

                {isDraft && (
                  <View style={s.progressBarWrap}>
                    <View style={[s.progressBarFill, { width: `${pct}%` }]} />
                  </View>
                )}

                <View style={s.evalCardBtns}>
                  {isDraft ? (
                    <TouchableOpacity style={s.btnResume}
                      onPress={() => navigation.navigate('Questions', { evaluationId: ev.id, patientId })}>
                      <Text style={s.btnResumeTxt}>↩ Retomar</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity style={s.btnView}
                        onPress={() => navigation.navigate('Results', { evaluationId: ev.id, patientId })}>
                        <Text style={s.btnViewTxt}>📊 Ver Resultado</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.btnEdit}
                        onPress={() => Alert.alert(
                          'Editar respostas',
                          'Isso reabrirá a avaliação para edição. O resultado atual será mantido até você finalizar novamente.',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Editar', onPress: () => reopenEval(ev) },
                          ]
                        )}>
                        <Text style={s.btnEditTxt}>✏️ Editar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal nome do avaliador */}
      {evalModalVisible && (
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Nova Avaliação</Text>
            <Text style={s.modalSub}>Nome do(a) avaliador(a) (opcional)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ex: Dra. Ana Lima"
              placeholderTextColor="#B0A090"
              value={newEvaluatorName}
              onChangeText={setNewEvaluatorName}
              autoFocus
              autoCapitalize="words"
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setEvalModalVisible(false)}>
                <Text style={s.modalBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalBtnOk} onPress={startNewEval}>
                <Text style={s.modalBtnOkTxt}>Iniciar →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 5, alignItems: 'flex-start' }}>
      <Text style={{ fontSize: 13 }}>{icon}</Text>
      <Text style={{ fontSize: 13, color: '#5C5050', flex: 1, lineHeight: 18 }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1923' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: 'white' },
  headerSub:   { fontSize: 10, color: '#C4703F', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
  btnEdit:    { flex: 1, backgroundColor: '#EDE8E0', borderRadius: 10, padding: 10, alignItems: 'center' },
  btnEditTxt: { fontSize: 13, fontWeight: '700', color: '#5C5050' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox:   { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1714', marginBottom: 4 },
  modalSub:   { fontSize: 13, color: '#8C7B6B', marginBottom: 16 },
  modalInput: { backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 10, padding: 12, fontSize: 15, color: '#1A1714', marginBottom: 16 },
  modalBtns:  { flexDirection: 'row', gap: 10 },
  modalBtnCancel:    { flex: 1, backgroundColor: '#F0EAE0', borderRadius: 10, padding: 13, alignItems: 'center' },
  modalBtnCancelTxt: { fontSize: 14, fontWeight: '600', color: '#5C5050' },
  modalBtnOk:    { flex: 1, backgroundColor: '#C4703F', borderRadius: 10, padding: 13, alignItems: 'center' },
  modalBtnOkTxt: { fontSize: 14, fontWeight: '700', color: 'white' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBtnTxt: { color: 'white', fontSize: 13, fontWeight: '600' },

  scroll: { padding: 16, paddingTop: 8 },

  patientCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 20, marginBottom: 16,
    flexDirection: 'row', gap: 16, elevation: 3,
  },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#C4703F', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontSize: 26, fontWeight: '800', color: 'white' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '800', color: '#1A1714', marginBottom: 4 },

  btnNewEval: {
    backgroundColor: '#C4703F', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24, elevation: 4,
  },
  btnNewEvalIcon:  { fontSize: 28, color: 'white', fontWeight: '300' },
  btnNewEvalTitle: { fontSize: 16, fontWeight: '800', color: 'white' },
  btnNewEvalSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  sectionTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },

  emptyEvals: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTxt:  { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  evalCard: {
    backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 2,
  },
  evalCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  evalDate:   { fontSize: 14, fontWeight: '700', color: '#1A1714' },
  evalStatus: { fontSize: 12, color: '#8C7B6B', marginTop: 1 },
  delBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  progressBarWrap: { height: 5, backgroundColor: '#F0EAE0', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 5 },

  evalCardBtns: { flexDirection: 'row', gap: 8 },
  btnResume: { flex: 1, backgroundColor: '#FFF4E0', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnResumeTxt: { color: '#C9A84C', fontWeight: '700', fontSize: 14 },
  btnView: { flex: 1, backgroundColor: '#EEF3FF', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnViewTxt: { color: '#4A6FA5', fontWeight: '700', fontSize: 14 },
});
