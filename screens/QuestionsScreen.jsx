import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SECTIONS, OPTIONS, QUADRANT_META } from '../data/sensoryData';
import { getEvaluations, getPatients, saveEvaluation } from '../data/storage';

export default function QuestionsScreen({ navigation, route }) {
  const [evaluation, setEvaluation] = useState(null);
  const [patient,    setPatient]    = useState(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const scrollRef = useRef(null);
  const saveTimer = useRef(null);
  const evalRef   = useRef(null);

  useFocusEffect(useCallback(() => {
    load();
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  // Lê route.params dentro do load para sempre pegar os valores mais recentes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.reopen, route.params?.evaluationId]));

  async function load() {
    // Lê params aqui para garantir valores atuais mesmo quando a tela é reusada
    const { evaluationId, patientId } = route.params;
    const evs = await getEvaluations(patientId);
    const ev  = evs.find(e => e.id === evaluationId);
    if (!ev) { navigation.goBack(); return; }
    const ps  = await getPatients();
    setPatient(ps.find(p => p.id === patientId));
    setEvaluation(ev);
    evalRef.current = ev;
    setAnswers(ev.answers || {});
    // Retoma exatamente na seção onde parou
    setSectionIdx(ev.sectionIdx || 0);
  }

  function scheduleAutosave(newAnswers, idx) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (evalRef.current) {
        saveEvaluation({ ...evalRef.current, answers: newAnswers, sectionIdx: idx, status: 'draft' });
      }
    }, 1500);
  }

  async function saveAndExit() {
    // Salva imediatamente e vai direto para a tela principal
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (evalRef.current) {
      await saveEvaluation({ ...evalRef.current, answers, sectionIdx, status: 'draft' });
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Patients' }],
    });
  }

  const section     = SECTIONS[sectionIdx];
  const totalItems  = SECTIONS.reduce((s, x) => s + x.items.length, 0);
  const progress    = Object.keys(answers).length / totalItems;
  const secAnswered = section.items.filter((_, i) => answers[`${section.id}_${i}`] !== undefined).length;
  const secComplete = secAnswered === section.items.length;

  function selectAnswer(key, value) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    scheduleAutosave(next, sectionIdx);
  }

  async function goNext() {
    if (!secComplete) {
      Alert.alert('Seção incompleta', `Ainda há ${section.items.length - secAnswered} item(ns) sem resposta.`);
      return;
    }
    const nextIdx = sectionIdx + 1;
    if (nextIdx < SECTIONS.length) {
      setSectionIdx(nextIdx);
      await saveEvaluation({ ...evalRef.current, answers, sectionIdx: nextIdx, status: 'draft' });
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      const finished = { ...evalRef.current, answers, sectionIdx, status: 'complete', finishedAt: new Date().toISOString() };
      await saveEvaluation(finished);
      navigation.replace('Results', { evaluationId: route.params.evaluationId, patientId: route.params.patientId });
    }
  }

  function goPrev() {
    if (sectionIdx > 0) {
      const prev = sectionIdx - 1;
      setSectionIdx(prev);
      saveEvaluation({ ...evalRef.current, answers, sectionIdx: prev });
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      saveAndExit();
    }
  }

  if (!evaluation || !patient) {
    return <SafeAreaView style={s.safe}><Text style={{ color: '#888', padding: 20 }}>Carregando...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={goPrev} style={s.backBtn}>
          <Text style={s.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={s.progressLbl}>{Math.round(progress * 100)}% · {patient.name}{evaluation.evaluator ? ' · ' + evaluation.evaluator : ''}</Text>
        </View>
        {/* Botão sair para tela principal */}
        <TouchableOpacity onPress={saveAndExit} style={s.exitBtn}>
          <Text style={s.exitBtnTxt}>🏠</Text>
        </TouchableOpacity>
        <View style={[s.secBadge, { backgroundColor: section.colorLight }]}>
          <Text style={[s.secBadgeTxt, { color: section.color }]}>{sectionIdx + 1}/{SECTIONS.length}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[s.secHeader, { borderLeftColor: section.color }]}>
          <Text style={[s.secTag, { color: section.color }]}>Sistema {sectionIdx + 1} de {SECTIONS.length}</Text>
          <Text style={s.secTitle}>{section.fullName}</Text>
          <Text style={s.secSub}>Frequência nos últimos 30 dias · {secAnswered}/{section.items.length} respondidos</Text>
          {/* Legenda de componentes */}
          <View style={s.compLegendRow}>
            {Object.entries(QUADRANT_META).map(([key, m]) => (
              <View key={key} style={s.compLegendItem}>
                {key === 'NONE' ? (
                  <View style={[s.compLegendSquare, { backgroundColor: m.color }]} />
                ) : (
                  <View style={[s.compLegendDot, { backgroundColor: m.bg, borderColor: m.color }]}>
                    <Text style={[s.compLegendAbbr, { color: m.color }]}>{m.abbr}</Text>
                  </View>
                )}
                <Text style={s.compLegendLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 6 }}>
            {OPTIONS.map(opt => (
              <View key={opt.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: section.color }} />
                <Text style={{ fontSize: 11, color: '#8C7B6B' }}>{opt.value} = {opt.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {section.items.map((item, i) => {
          const key      = `${section.id}_${i}`;
          const selected = answers[key];
          const qMeta    = QUADRANT_META[item.q];
          const isNone   = item.q === 'NONE';
          return (
            <View key={key} style={[s.qCard, selected !== undefined && s.qCardAnswered, item.starred && s.qCardStarred]}>
              <View style={s.qTop}>
                <View style={s.qNumWrap}>
                  {/* Número global do item */}
                  <View style={[s.qNumBadge, { backgroundColor: section.colorLight }]}>
                    <Text style={[s.qNum, { color: section.color }]}>{item.n}</Text>
                  </View>
                  {/* Badge do componente: NONE = quadrado verde sem sigla */}
                  {isNone ? (
                    <View style={s.qCompNone} />
                  ) : (
                    <View style={[s.qCompBadge, { backgroundColor: qMeta.bg, borderColor: qMeta.color }]}>
                      <Text style={[s.qCompTxt, { color: qMeta.color }]}>{qMeta.abbr}</Text>
                    </View>
                  )}
                  {item.starred && <Text style={s.qStarredMark}>*</Text>}
                </View>
                <Text style={s.qText}>{item.text}</Text>
              </View>
              <View style={s.optsRow}>
                {OPTIONS.map(opt => {
                  const isSel = selected === opt.value;
                  return (
                    <TouchableOpacity key={opt.value}
                      style={[s.optBtn, isSel && { backgroundColor: section.color, borderColor: section.color }]}
                      onPress={() => selectAnswer(key, opt.value)} activeOpacity={0.75}>
                      <Text style={[s.optNum,   isSel && { color: 'white' }]}>{opt.value}</Text>
                      <Text style={[s.optLabel, isSel && { color: 'rgba(255,255,255,0.8)' }]}>{opt.short}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[s.dot, { backgroundColor: secComplete ? '#5A8C5A' : '#C4703F' }]} />
          <Text style={{ fontSize: 13, color: '#8C7B6B', fontWeight: '500' }}>
            {secComplete ? 'Seção completa!' : `${section.items.length - secAnswered} restante(s)`}
          </Text>
          <Text style={{ fontSize: 10, color: '#B0A090', marginLeft: 'auto' }}>💾 auto-salvo</Text>
        </View>
        <View style={s.bottomBtns}>
          <TouchableOpacity style={s.btnSaveExit} onPress={saveAndExit} activeOpacity={0.85}>
            <Text style={s.btnSaveExitTxt}>💾 Salvar e Sair</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnNext, !secComplete && s.btnNextDis]} onPress={goNext} activeOpacity={0.85}>
            <Text style={s.btnNextTxt}>
              {sectionIdx === SECTIONS.length - 1 ? 'Finalizar ✓' : 'Próxima →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3EF' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E0D8CC' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3EF', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: '#1A1714' },
  exitBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0E8', borderRadius: 10 },
  exitBtnTxt: { fontSize: 17 },
  progressWrap: { flex: 1 },
  progressTrack: { height: 6, backgroundColor: '#E0D8CC', borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#C4703F', borderRadius: 6 },
  progressLbl: { fontSize: 10, color: '#8C7B6B', fontWeight: '600' },
  secBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  secBadgeTxt: { fontSize: 11, fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },
  secHeader: { borderLeftWidth: 4, paddingLeft: 14, marginBottom: 16 },
  secTag: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  secTitle: { fontSize: 22, fontWeight: '800', color: '#1A1714', marginBottom: 4 },
  secSub: { fontSize: 12, color: '#8C7B6B', marginBottom: 10 },
  compLegendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  compLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compLegendDot: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  compLegendAbbr: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  compLegendLabel: { fontSize: 11, color: '#8C7B6B', fontWeight: '500' },
  compLegendSquare: { width: 22, height: 14, borderRadius: 3 },
  qCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  qCardAnswered: { borderColor: '#F0D8C0', backgroundColor: '#FFFCF9' },
  qCardStarred: { borderStyle: 'dashed', borderColor: '#C0D8C0' },
  qTop: { flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  qNumWrap: { flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 },
  qNumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  qNum: { fontSize: 11, fontWeight: '800' },
  qCompBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, alignItems: 'center', borderWidth: 1.5 },
  qCompTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  qCompNone: { width: 28, height: 18, borderRadius: 5, backgroundColor: '#4A9B5A' },
  qStarredMark: { fontSize: 10, color: '#4A9B5A', fontWeight: '800' },
  qText: { flex: 1, fontSize: 14, color: '#1A1714', lineHeight: 20 },
  optsRow: { flexDirection: 'row', gap: 6 },
  optBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: '#F5F3EF', borderWidth: 2, borderColor: '#E0D8CC', borderRadius: 10 },
  optNum: { fontSize: 15, fontWeight: '800', color: '#8C7B6B' },
  optLabel: { fontSize: 9, color: '#B0A090', fontWeight: '600', marginTop: 2 },
  bottomNav: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E0D8CC', padding: 16, gap: 10 },
  bottomBtns: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  btnSaveExit: { backgroundColor: '#F5F3EF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#E0D8CC', flex: 1 },
  btnSaveExitTxt: { color: '#8C7B6B', fontSize: 13, fontWeight: '700' },
  btnNext: { backgroundColor: '#C4703F', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 3, flex: 2 },
  btnNextDis: { backgroundColor: '#D4B89E', elevation: 0 },
  btnNextTxt: { color: 'white', fontSize: 15, fontWeight: '700' },
});
