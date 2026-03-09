import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { savePatient, generateId } from '../data/storage';

const RELATIONS = ['Mãe', 'Pai', 'Avó / Avô', 'Outro responsável', 'Professor(a)', 'Terapeuta'];

function maskDob(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}

export default function PatientFormScreen({ navigation, route }) {
  const existing = route.params?.patient;
  const [form, setForm] = useState({
    name:       existing?.name       || '',
    dob:        existing?.dob        || '',
    diagnosis:  existing?.diagnosis  || '',
    respondent: existing?.respondent || '',
    relation:   existing?.relation   || '',
    notes:      existing?.notes      || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!existing;

  async function save() {
    if (!form.name.trim()) {
      Platform.OS === 'web' ? window.alert('Informe o nome do paciente.') : Alert.alert('Campo obrigatório', 'Informe o nome do paciente.');
      return;
    }
    const patient = {
      id:        existing?.id || generateId(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      ...form,
    };
    await savePatient(patient);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backBtnTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{isEdit ? 'Editar Paciente' : 'Novo Paciente'}</Text>
          <TouchableOpacity style={s.saveBtn} onPress={save}>
            <Text style={s.saveBtnTxt}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Dados Pessoais</Text>
            <Field label="Nome completo *">
              <TextInput style={s.input} placeholder="Nome do paciente" placeholderTextColor="#B0A090"
                value={form.name} onChangeText={v => set('name', v)} />
            </Field>
            <Field label="Data de nascimento">
              <TextInput
                style={s.input} placeholder="DD/MM/AAAA" placeholderTextColor="#B0A090"
                value={form.dob} onChangeText={v => set('dob', maskDob(v))}
                keyboardType="numeric" maxLength={10}
              />
            </Field>
            <Field label="Diagnóstico / CID (opcional)">
              <TextInput style={s.input} placeholder="Ex: TEA, TDAH, DCD..." placeholderTextColor="#B0A090"
                value={form.diagnosis} onChangeText={v => set('diagnosis', v)} />
            </Field>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Respondente</Text>
            <Field label="Nome do respondente">
              <TextInput style={s.input} placeholder="Quem responde o questionário" placeholderTextColor="#B0A090"
                value={form.respondent} onChangeText={v => set('respondent', v)} />
            </Field>
            <Field label="Relação com a criança">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.chipsRow}>
                  {RELATIONS.map(r => (
                    <TouchableOpacity key={r}
                      style={[s.chip, form.relation === r && s.chipSel]}
                      onPress={() => set('relation', r)}>
                      <Text style={[s.chipTxt, form.relation === r && s.chipTxtSel]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Field>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Observações</Text>
            <TextInput
              style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]}
              placeholder="Observações clínicas gerais, histórico relevante..."
              placeholderTextColor="#B0A090"
              value={form.notes} onChangeText={v => set('notes', v)} multiline
            />
          </View>

          <TouchableOpacity style={s.btnSave} onPress={save} activeOpacity={0.85}>
            <Text style={s.btnSaveTxt}>{isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente'}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: '#8C7B6B', marginBottom: 8, textTransform: 'uppercase' }}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1923' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  saveBtn: { backgroundColor: '#C4703F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },
  scroll: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 20, marginBottom: 14, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1714', marginBottom: 18 },
  input: { backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 10, padding: 12, fontSize: 15, color: '#1A1714' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipSel: { backgroundColor: '#C4703F', borderColor: '#C4703F' },
  chipTxt: { fontSize: 13, color: '#8C7B6B', fontWeight: '500' },
  chipTxtSel: { color: 'white', fontWeight: '700' },
  btnSave: { backgroundColor: '#C4703F', borderRadius: 14, padding: 18, alignItems: 'center', elevation: 4 },
  btnSaveTxt: { color: 'white', fontSize: 17, fontWeight: '700' },
});
