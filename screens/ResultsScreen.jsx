import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Share, Dimensions, Alert, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SECTIONS, QUADRANTS, calcScores, getClassification } from '../data/sensoryData';
import { getEvaluations, getPatients, formatDate, calcAge } from '../data/storage';
import { buildReportHTML } from '../data/pdfReport';

const { width: SW } = Dimensions.get('window');
const SEC_EMOJI = { auditivo:'👂', visual:'👁', tatil:'✋', movimento:'🌀', proprioceptivo:'💪', oral:'👅', olfativo:'👃', conduta:'🧠' };

export default function ResultsScreen({ navigation, route }) {
  const { evaluationId, patientId } = route.params;
  const [evaluation,  setEvaluation]  = useState(null);
  const [patient,     setPatient]     = useState(null);
  const [pdfLoading,    setPdfLoading]    = useState(false);
  const [commentQuad,   setCommentQuad]   = useState('');
  const [commentSec,    setCommentSec]    = useState('');

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const evs = await getEvaluations(patientId);
    const ev  = evs.find(e => e.id === evaluationId);
    const ps  = await getPatients();
    setEvaluation(ev);
    setPatient(ps.find(p => p.id === patientId));
    setCommentQuad(ev?.commentQuad || '');
    setCommentSec(ev?.commentSec  || '');
  }

  if (!evaluation || !patient) {
    return <SafeAreaView style={s.safe}><Text style={{ color: '#888', padding: 20 }}>Carregando...</Text></SafeAreaView>;
  }

  const { sectionScores, quadrantScores, quadrantMax } = calcScores(evaluation.answers || {});

  // ── Salvar comentário ───────────────────────────────────
  async function saveComment(field, value) {
    const { saveEvaluation } = await import('../data/storage');
    const updated = { ...evaluation, [field]: value };
    await saveEvaluation(updated);
    setEvaluation(updated);
  }

  // ── Exportar PDF ────────────────────────────────────────
  async function exportPDF() {
    try {
      setPdfLoading(true);
      const html = buildReportHTML(patient, { ...evaluation, commentQuad, commentSec });

      if (Platform.OS === 'web') {
        // Web: abre relatório em nova aba já pronto para Ctrl+P / Salvar como PDF
        const win = window.open('', '_blank');
        if (!win) {
          Alert.alert('Popup bloqueado', 'Permita popups para este site nas configurações do navegador.');
          setPdfLoading(false);
          return;
        }
        // Injeta CSS de impressão A4 perfeito direto no HTML
        const printHtml = html.replace('</style>', `
  @media print {
    html, body { width: 210mm; margin: 0 !important; padding: 0 !important; background: white !important; }
    .page { padding: 12mm 15mm !important; }
    .block { break-inside: avoid !important; page-break-inside: avoid !important; }
  }
  /* Botão fixo no canto — desaparece ao imprimir */
  #print-btn {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    background: #C4703F; color: white; border: none; border-radius: 12px;
    padding: 14px 22px; font-size: 15px; font-weight: 700;
    cursor: pointer; box-shadow: 0 4px 16px rgba(196,112,63,0.4);
  }
  @media print { #print-btn { display: none !important; } }
</style>`);
        const finalHtml = printHtml.replace('</body>', `
  <button id="print-btn" onclick="window.print()">🖨️ Salvar / Imprimir PDF</button>
</body>`);
        win.document.open();
        win.document.write(finalHtml);
        win.document.close();
        setPdfLoading(false);
        return;
      } else {
        // Mobile: gera arquivo PDF via expo-print
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `PS2 — ${patient.name}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('PDF gerado', `Arquivo salvo em:\n${uri}`);
        }
      }
    } catch (e) {
      Alert.alert('Erro ao gerar PDF', e.message);
    } finally {
      setPdfLoading(false);
    }
  }

  // ── Compartilhar texto ───────────────────────────────────
  async function shareText() {
    let txt = `PERFIL SENSORIAL 2 — RELATÓRIO\n${'─'.repeat(34)}\n`;
    txt += `Paciente: ${patient.name}\nIdade: ${calcAge(patient.dob)}\nData: ${formatDate(evaluation.finishedAt || evaluation.startedAt)}\n\n`;
    txt += `QUADRANTES:\n`;
    QUADRANTS.forEach(q => {
      const cls = getClassification(quadrantScores[q.id], quadrantMax[q.id]);
      txt += `• ${q.name}: ${quadrantScores[q.id]}/${quadrantMax[q.id]} — ${cls.label}\n`;
    });
    txt += `\nSISTEMAS SENSORIAIS:\n`;
    SECTIONS.forEach(sec => {
      const sc  = sectionScores[sec.id];
      const cls = getClassification(sc.total, sc.max);
      txt += `• ${sec.fullName}: ${sc.total}/${sc.max} — ${cls.label}\n`;
    });
    await Share.share({ message: txt, title: 'Perfil Sensorial 2' });
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTag}>RESULTADO</Text>
          <Text style={s.headerTitle} numberOfLines={1}>{patient.name}</Text>
        </View>
        <TouchableOpacity style={s.pdfBtn} onPress={exportPDF} disabled={pdfLoading}>
          {pdfLoading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={s.pdfBtnTxt}>⬇ PDF</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Meta */}
        <View style={s.metaCard}>
          <View style={s.metaRow}>
            <MetaItem label="Paciente" value={patient.name} />
            <MetaItem label="Idade"    value={calcAge(patient.dob)} />
          </View>
          <View style={[s.metaRow, { marginTop: 10 }]}>
            <MetaItem label="Data"        value={formatDate(evaluation.finishedAt || evaluation.startedAt)} />
            <MetaItem label="Avaliador(a)" value={evaluation.evaluator || '—'} />
          </View>
          {patient.diagnosis ? (
            <View style={s.diagRow}>
              <Text style={s.diagLbl}>🏥</Text>
              <Text style={s.diagTxt}>{patient.diagnosis}</Text>
            </View>
          ) : null}
        </View>

        {/* ── QUADRANTES ── */}
        <STitle title="Quadrantes de Processamento" sub="Modelo de Dunn (1997)" />
        <View style={s.quadGrid}>
          {QUADRANTS.map(q => {
            const score = quadrantScores[q.id];
            const max   = quadrantMax[q.id];
            const pct   = max > 0 ? score / max : 0;
            const cls   = getClassification(score, max);
            return (
              <View key={q.id} style={[s.quadCard, { borderTopColor: q.color }]}>
                <Text style={s.quadEmoji}>{q.emoji}</Text>
                <Text style={[s.quadName, { color: q.color }]}>{q.name}</Text>
                <Text style={s.quadDesc}>{q.desc}</Text>
                <HBar pct={pct * 100} color={q.color} height={8} />
                <View style={s.quadScoreRow}>
                  <Text style={[s.quadScore, { color: q.color }]}>{score}<Text style={s.quadMax}>/{max}</Text></Text>
                  <Text style={{ fontSize: 11, color: '#8C7B6B' }}>{Math.round(pct * 100)}%</Text>
                </View>
                <ClsBadge cls={cls} />
              </View>
            );
          })}
        </View>

        {/* ── GRÁFICO QUADRANTES ── */}
        <STitle title="Comparativo dos Quadrantes" sub="% do máximo possível" />
        <View style={s.chartCard}>
          {QUADRANTS.map(q => {
            const score = quadrantScores[q.id];
            const max   = quadrantMax[q.id];
            const pct   = max > 0 ? (score / max) * 100 : 0;
            const cls   = getClassification(score, max);
            return (
              <View key={q.id} style={s.hRow}>
                <Text style={s.hLabel}>{q.shortName}</Text>
                <View style={{ flex: 1 }}><HBar pct={pct} color={q.color} height={12} /></View>
                <Text style={s.hPct}>{Math.round(pct)}%</Text>
                <ClsBadge cls={cls} small />
              </View>
            );
          })}
          <ZoneLegend />
        </View>

        {/* ── COMENTÁRIO QUADRANTES ── */}
        <View style={s.commentCard}>
          <Text style={s.commentLabel}>💬 Comentários sobre os Quadrantes</Text>
          <TextInput
            style={s.commentInput}
            placeholder="Observações clínicas sobre o perfil dos quadrantes..."
            placeholderTextColor="#B0A090"
            multiline
            textAlignVertical="top"
            value={commentQuad}
            onChangeText={v => { setCommentQuad(v); saveComment('commentQuad', v); }}
          />
        </View>

        {/* ── SISTEMAS SENSORIAIS ── */}
        <STitle title="Sistemas Sensoriais" sub="Pontuação por categoria" />
        <View style={s.chartCard}>
          {SECTIONS.map(sec => {
            const sc  = sectionScores[sec.id];
            const pct = sc.max > 0 ? (sc.total / sc.max) * 100 : 0;
            const cls = getClassification(sc.total, sc.max);
            return (
              <View key={sec.id} style={s.hRow}>
                <Text style={s.hEmoji}>{SEC_EMOJI[sec.id]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.hSecName}>{sec.name}</Text>
                  <HBar pct={pct} color={sec.color} height={10} />
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 52 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714' }}>{sc.total}/{sc.max}</Text>
                  <ClsBadge cls={cls} small />
                </View>
              </View>
            );
          })}
          <ZoneLegend />
        </View>

        {/* ── COMENTÁRIO SISTEMAS ── */}
        <View style={s.commentCard}>
          <Text style={s.commentLabel}>💬 Comentários sobre os Sistemas Sensoriais</Text>
          <TextInput
            style={s.commentInput}
            placeholder="Observações clínicas sobre os sistemas sensoriais..."
            placeholderTextColor="#B0A090"
            multiline
            textAlignVertical="top"
            value={commentSec}
            onChangeText={v => { setCommentSec(v); saveComment('commentSec', v); }}
          />
        </View>

        {/* ── LEGENDA ── */}
        <View style={s.legendCard}>
          <Text style={s.legendTitle}>LEGENDA DE CLASSIFICAÇÃO</Text>
          {[
            { label: 'Muito Menos que os Típicos', color: '#B85C6E', bg: '#FFEEF2', range: '0–35%' },
            { label: 'Menos que os Típicos',       color: '#C4703F', bg: '#FFF0E8', range: '36–50%' },
            { label: 'Semelhante aos Típicos',     color: '#5A8C5A', bg: '#EEF7EE', range: '51–75%' },
            { label: 'Mais que os Típicos',        color: '#4A6FA5', bg: '#EEF3FF', range: '76–88%' },
            { label: 'Muito Mais que os Típicos',  color: '#7A5C9A', bg: '#F3EEFF', range: '89–100%' },
          ].map(item => (
            <View key={item.label} style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendTxt}>{item.label}</Text>
              <Text style={[s.legendRange, { color: item.color }]}>{item.range}</Text>
            </View>
          ))}
        </View>

        {/* ── AÇÕES ── */}
        <View style={{ gap: 10, marginBottom: 16 }}>
          <TouchableOpacity style={s.btnPDF} onPress={exportPDF} disabled={pdfLoading} activeOpacity={0.85}>
            {pdfLoading
              ? <ActivityIndicator color="white" />
              : <Text style={s.btnPDFTxt}>⬇ Exportar PDF com Gráficos</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.btnShare} onPress={shareText} activeOpacity={0.85}>
            <Text style={s.btnShareTxt}>↑ Compartilhar como Texto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnBack2} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={s.btnBack2Txt}>← Voltar ao Paciente</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────

function HBar({ pct, color, height = 10 }) {
  return (
    <View style={{ height, backgroundColor: '#F0EAE0', borderRadius: height, overflow: 'hidden', position: 'relative' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(Math.round(pct), 100)}%`, backgroundColor: color, borderRadius: height }} />
      {[35, 50, 75, 88].map(z => (
        <View key={z} style={{ position: 'absolute', left: `${z}%`, top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 2 }} />
      ))}
    </View>
  );
}

function ClsBadge({ cls, small }) {
  return (
    <View style={{ backgroundColor: cls.bg, paddingHorizontal: small ? 6 : 10, paddingVertical: small ? 2 : 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: small ? 3 : 0 }}>
      <Text style={{ fontSize: small ? 9 : 10, fontWeight: '800', color: cls.color }}>{small ? cls.short : cls.label}</Text>
    </View>
  );
}

function ZoneLegend() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0EAE0' }}>
      {[
        { pct: 35, label: 'M. Menos', color: '#B85C6E' },
        { pct: 50, label: 'Menos',    color: '#C4703F' },
        { pct: 75, label: 'Típico',   color: '#5A8C5A' },
        { pct: 88, label: 'Mais',     color: '#4A6FA5' },
      ].map(z => (
        <View key={z.pct} style={{ alignItems: 'center', gap: 3 }}>
          <View style={{ width: 2, height: 10, backgroundColor: z.color }} />
          <Text style={{ fontSize: 9, color: z.color, fontWeight: '700' }}>{z.label}</Text>
        </View>
      ))}
    </View>
  );
}

function STitle({ title, sub }) {
  return (
    <View style={{ marginBottom: 10, marginTop: 4 }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1714' }}>{title}</Text>
      {sub ? <Text style={{ fontSize: 11, color: '#8C7B6B', marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
}

function MetaItem({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: '#8C7B6B', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1714' }} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0F1923' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnTxt: { fontSize: 18, color: 'white' },
  headerTag:   { fontSize: 10, color: '#C9A84C', fontWeight: '800', letterSpacing: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: 'white' },
  pdfBtn: { backgroundColor: '#C4703F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, minWidth: 70, alignItems: 'center' },
  pdfBtnTxt: { color: 'white', fontSize: 13, fontWeight: '700' },

  scroll: { padding: 16, paddingTop: 12, backgroundColor: '#F5F3EF' },

  metaCard: { backgroundColor: 'white', borderRadius: 14, padding: 18, marginBottom: 20, elevation: 2 },
  metaRow:  { flexDirection: 'row', gap: 16 },
  diagRow:  { marginTop: 10, backgroundColor: '#F5F3EF', borderRadius: 8, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  diagLbl:  { fontSize: 14 },
  diagTxt:  { fontSize: 12, color: '#1A1714', flex: 1 },

  quadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quadCard: { width: (SW - 42) / 2, backgroundColor: 'white', borderRadius: 14, padding: 14, borderTopWidth: 4, elevation: 2 },
  quadEmoji: { fontSize: 20, marginBottom: 6 },
  quadName:  { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  quadDesc:  { fontSize: 10, color: '#8C7B6B', lineHeight: 14, marginBottom: 10 },
  quadScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 8 },
  quadScore: { fontSize: 22, fontWeight: '800' },
  quadMax:   { fontSize: 12, color: '#8C7B6B', fontWeight: '400' },

  chartCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  hRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  hLabel:   { fontSize: 11, fontWeight: '800', color: '#1A1714', width: 44, textAlign: 'right' },
  hEmoji:   { fontSize: 18, width: 28, textAlign: 'center' },
  hSecName: { fontSize: 10, color: '#8C7B6B', fontWeight: '600', marginBottom: 3 },
  hPct:     { fontSize: 11, fontWeight: '700', color: '#8C7B6B', width: 30, textAlign: 'right' },

  legendCard:  { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  legendTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#8C7B6B', textTransform: 'uppercase', marginBottom: 12 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  legendDot:   { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendTxt:   { flex: 1, fontSize: 12, color: '#1A1714' },
  legendRange: { fontSize: 11, fontWeight: '700' },

  btnPDF:   { backgroundColor: '#C4703F', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3, minHeight: 52, justifyContent: 'center' },
  btnPDFTxt: { color: 'white', fontSize: 15, fontWeight: '700' },
  btnShare: { backgroundColor: '#0F1923', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  btnShareTxt: { color: 'white', fontSize: 15, fontWeight: '700' },
  btnBack2: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E0D8CC' },
  btnBack2Txt: { color: '#8C7B6B', fontSize: 15, fontWeight: '700' },
  commentCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#C4703F' },
  commentLabel: { fontSize: 12, fontWeight: '700', color: '#8C7B6B', marginBottom: 10, letterSpacing: 0.5 },
  commentInput: { backgroundColor: '#F5F3EF', borderRadius: 10, padding: 12, fontSize: 14, color: '#1A1714', minHeight: 90, borderWidth: 1.5, borderColor: '#E0D8CC' },
});
