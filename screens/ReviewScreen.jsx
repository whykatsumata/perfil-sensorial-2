import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SECTIONS, OPTIONS, QUADRANT_META } from '../data/sensoryData';
import { getEvaluations, getPatients, formatDate } from '../data/storage';

const OPT_BY_VALUE = Object.fromEntries(OPTIONS.map(o => [o.value, o]));

export default function ReviewScreen({ navigation, route }) {
  const { evaluationId, patientId } = route.params;
  const [evaluation, setEvaluation] = useState(null);
  const [patient,    setPatient]    = useState(null);
  const [openSec,    setOpenSec]    = useState(null); // id da seção expandida

  useFocusEffect(useCallback(() => {
    async function load() {
      const evs = await getEvaluations(patientId);
      const ev  = evs.find(e => e.id === evaluationId);
      if (!ev) { navigation.goBack(); return; }
      const ps  = await getPatients();
      setPatient(ps.find(p => p.id === patientId));
      setEvaluation(ev);
    }
    load();
  }, []));

  if (!evaluation || !patient) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={{ color: '#888', padding: 20 }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  const answers = evaluation.answers || {};

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTag}>REVISÃO DE RESPOSTAS</Text>
          <Text style={s.headerTitle} numberOfLines={1}>{patient.name}</Text>
        </View>
        <View style={s.dateBadge}>
          <Text style={s.dateBadgeTxt}>{formatDate(evaluation.finishedAt || evaluation.startedAt)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Legenda de resposta */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.legendScroll}>
          <View style={s.legendRow}>
            {OPTIONS.map(opt => (
              <View key={opt.value} style={[s.legendChip, { backgroundColor: chipColor(opt.value) + '22', borderColor: chipColor(opt.value) }]}>
                <Text style={[s.legendVal, { color: chipColor(opt.value) }]}>{opt.value}</Text>
                <Text style={[s.legendLbl, { color: chipColor(opt.value) }]}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {SECTIONS.map(sec => {
          const secAnswers  = sec.items.map((item, i) => answers[`${sec.id}_${i}`]);
          const answered    = secAnswers.filter(v => v !== undefined).length;
          const total       = sec.items.length;
          const isOpen      = openSec === sec.id;

          return (
            <View key={sec.id} style={s.secBlock}>
              {/* Cabeçalho da seção — clicável para expandir/colapsar */}
              <TouchableOpacity
                style={[s.secHeader, { borderLeftColor: sec.color }]}
                onPress={() => setOpenSec(isOpen ? null : sec.id)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.secName, { color: sec.color }]}>{sec.fullName}</Text>
                  <Text style={s.secCount}>{answered}/{total} respondidos</Text>
                </View>
                <View style={[s.secPill, { backgroundColor: sec.colorLight }]}>
                  <Text style={[s.secPillTxt, { color: sec.color }]}>
                    {isOpen ? '▲ fechar' : '▼ ver'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mini-barra de progresso da seção */}
              <View style={s.progTrack}>
                <View style={[s.progFill, { width: `${Math.round((answered / total) * 100)}%`, backgroundColor: sec.color }]} />
              </View>

              {/* Itens — só visíveis quando expandido */}
              {isOpen && sec.items.map((item, i) => {
                const key    = `${sec.id}_${i}`;
                const val    = answers[key];
                const opt    = OPT_BY_VALUE[val];
                const qMeta  = QUADRANT_META[item.q];
                const isNone = item.q === 'NONE';

                return (
                  <View key={key} style={[s.itemRow, val === undefined && s.itemRowUnanswered]}>
                    {/* Número global */}
                    <View style={[s.numBadge, { backgroundColor: sec.colorLight }]}>
                      <Text style={[s.numTxt, { color: sec.color }]}>{item.n}</Text>
                    </View>

                    {/* Quadrante badge */}
                    {isNone ? (
                      <View style={s.qNone} />
                    ) : (
                      <View style={[s.qBadge, { backgroundColor: qMeta.bg, borderColor: qMeta.color }]}>
                        <Text style={[s.qTxt, { color: qMeta.color }]}>{qMeta.abbr}</Text>
                      </View>
                    )}

                    {/* Texto do item */}
                    <Text style={s.itemTxt} numberOfLines={3}>{item.text}</Text>

                    {/* Resposta dada */}
                    {opt ? (
                      <View style={[s.ansBadge, { backgroundColor: chipColor(val) + '18', borderColor: chipColor(val) }]}>
                        <Text style={[s.ansVal,   { color: chipColor(val) }]}>{val}</Text>
                        <Text style={[s.ansShort, { color: chipColor(val) }]}>{opt.short}</Text>
                      </View>
                    ) : (
                      <View style={s.ansMissing}>
                        <Text style={s.ansMissingTxt}>—</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Cor por valor de resposta (5=mais intenso → 1=menos)
function chipColor(val) {
  return ['#888', '#5A8C5A', '#3A6DB5', '#C9A84C', '#C4703F', '#C0547A'][val] ?? '#888';
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0F1923' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: 'white' },
  headerTag:  { fontSize: 10, color: '#C9A84C', fontWeight: '800', letterSpacing: 2 },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: 'white' },
  dateBadge:  { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  dateBadgeTxt:{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },

  scroll: { padding: 16, paddingTop: 8, backgroundColor: '#F5F3EF' },

  legendScroll: { marginBottom: 16 },
  legendRow:    { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  legendChip:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  legendVal:    { fontSize: 13, fontWeight: '800' },
  legendLbl:    { fontSize: 11, fontWeight: '600' },

  secBlock:  { marginBottom: 10 },
  secHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 12, padding: 14,
    borderLeftWidth: 5, elevation: 2,
  },
  secName:    { fontSize: 13, fontWeight: '800', color: '#1A1714', marginBottom: 2 },
  secCount:   { fontSize: 11, color: '#8C7B6B' },
  secPill:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  secPillTxt: { fontSize: 11, fontWeight: '700' },

  progTrack: { height: 4, backgroundColor: '#E0D8CC', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden', marginBottom: 2 },
  progFill:  { height: '100%' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0EAE0',
  },
  itemRowUnanswered: { backgroundColor: '#FFF8F5' },

  numBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, minWidth: 28, alignItems: 'center', flexShrink: 0 },
  numTxt:   { fontSize: 10, fontWeight: '800' },

  qBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, borderWidth: 1.5, flexShrink: 0 },
  qTxt:   { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  qNone:  { width: 22, height: 16, borderRadius: 4, backgroundColor: '#4A9B5A', flexShrink: 0 },

  itemTxt: { flex: 1, fontSize: 12, color: '#1A1714', lineHeight: 17 },

  ansBadge:  { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1.5, minWidth: 38, flexShrink: 0 },
  ansVal:    { fontSize: 15, fontWeight: '800' },
  ansShort:  { fontSize: 9, fontWeight: '700', marginTop: 1 },
  ansMissing:    { minWidth: 38, alignItems: 'center', paddingVertical: 4 },
  ansMissingTxt: { fontSize: 16, color: '#D0C8C0' },
});
