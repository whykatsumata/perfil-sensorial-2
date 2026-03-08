import { SECTIONS, QUADRANTS, calcScores, getClassification } from './sensoryData';
import { calcAge, formatDate } from './storage';

export function buildReportHTML(patient, evaluation) {
  const answers = evaluation.answers || {};
  const { sectionScores, quadrantScores, quadrantMax } = calcScores(answers);
  const date = formatDate(evaluation.finishedAt || evaluation.startedAt);
  const age  = calcAge(patient.dob);

  const SEC_EMOJI = {
    auditivo:'👂', visual:'👁', tato:'✋', movimento:'🌀',
    posicao:'💪', oral:'👅', conduta:'🧠', socioemocional:'❤️', atencao:'🧩',
  };

  function bar(pct, color, h = 12) {
    const zones = [35, 50, 75, 88].map(p =>
      `<div style="position:absolute;left:${p}%;top:0;bottom:0;width:1.5px;background:rgba(0,0,0,0.2);z-index:2;"></div>`
    ).join('');
    return `<div style="position:relative;height:${h}px;background:#EDE5D8;border-radius:${h}px;overflow:hidden;">
      <div style="position:absolute;left:0;top:0;height:100%;width:${Math.min(Math.round(pct),100)}%;background:${color};border-radius:${h}px;"></div>
      ${zones}
    </div>`;
  }

  function badge(cls) {
    return `<span style="display:inline-block;background:${cls.bg};color:${cls.color};font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;">${cls.label}</span>`;
  }

  // Só renderiza se houver texto real — corrige bug da caixa vazia
  function commentBlock(raw, borderColor) {
    const txt = typeof raw === 'string' ? raw.trim() : '';
    if (!txt) return '';
    return `<div style="background:#FFFDF8;border-left:3px solid ${borderColor};border-radius:6px;padding:12px 16px;margin-top:12px;break-inside:avoid;page-break-inside:avoid;">
      <div style="font-size:8px;font-weight:800;letter-spacing:1.5px;color:#8C7B6B;text-transform:uppercase;margin-bottom:6px;">Comentários</div>
      <div style="font-size:12px;color:#1A1714;line-height:1.7;white-space:pre-wrap;">${txt}</div>
    </div>`;
  }

  // Cards quadrantes (2x2)
  const quadCards = QUADRANTS.map(q => {
    const score = quadrantScores[q.id];
    const max   = quadrantMax[q.id];
    const pct   = max > 0 ? (score / max) * 100 : 0;
    const cls   = getClassification(score, max);
    return `<div style="width:48%;background:white;border-radius:10px;padding:14px;border-top:3px solid ${q.color};break-inside:avoid;">
      <div style="font-weight:800;font-size:13px;color:${q.color};margin-bottom:3px;">${q.name}</div>
      <div style="font-size:9px;color:#8C7B6B;margin-bottom:8px;line-height:1.4;">${q.desc}</div>
      ${bar(pct, q.color, 8)}
      <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
        <span style="font-size:22px;font-weight:800;color:${q.color};">${score}<span style="font-size:11px;color:#8C7B6B;font-weight:400;">/${max}</span></span>
        <span style="font-size:10px;color:#8C7B6B;">${Math.round(pct)}%</span>
      </div>
      ${badge(cls)}
    </div>`;
  }).join('');

  // Gráfico quadrantes
  const quadChart = QUADRANTS.map(q => {
    const score = quadrantScores[q.id];
    const max   = quadrantMax[q.id];
    const pct   = max > 0 ? (score / max) * 100 : 0;
    const cls   = getClassification(score, max);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <div style="width:110px;font-size:11px;font-weight:700;color:#1A1714;text-align:right;flex-shrink:0;">${q.shortName}</div>
      <div style="flex:1;">${bar(pct, q.color, 13)}</div>
      <div style="width:32px;font-size:10px;color:#8C7B6B;text-align:right;flex-shrink:0;">${Math.round(pct)}%</div>
      <div style="width:130px;flex-shrink:0;">${badge(cls)}</div>
    </div>`;
  }).join('');

  // Gráfico sistemas sensoriais
  const sectionsChart = SECTIONS.map(sec => {
    const sc  = sectionScores[sec.id];
    const pct = sc.max > 0 ? (sc.total / sc.max) * 100 : 0;
    const cls = getClassification(sc.total, sc.max);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px;background:white;border-radius:8px;">
      <div style="font-size:18px;width:26px;text-align:center;flex-shrink:0;">${SEC_EMOJI[sec.id] || '•'}</div>
      <div style="flex:1;">
        <div style="font-size:10px;font-weight:700;color:#1A1714;margin-bottom:4px;">${sec.fullName}</div>
        ${bar(pct, sec.color, 8)}
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:52px;">
        <div style="font-size:11px;font-weight:700;color:#1A1714;margin-bottom:3px;">${sc.total}/${sc.max}</div>
        ${badge(cls)}
      </div>
    </div>`;
  }).join('');

  // Cabeçalho info
  const headerItems = [
    ['Paciente',    patient.name],
    ['Idade',       age],
    ['Data',        date],
    evaluation.evaluator ? ['Avaliador(a)', evaluation.evaluator] : null,
    patient.diagnosis    ? ['Diagnóstico',  patient.diagnosis]    : null,
    patient.respondent   ? ['Respondente',  patient.respondent]   : null,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>PS2 — ${patient.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    background: #F5F3EF;
    color: #1A1714;
    /* largura A4 exata */
    width: 210mm;
    margin: 0 auto;
  }
  .page  { padding: 12mm 15mm; }
  .block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 16px; }
  .card  { background: #F0EAE0; border-radius: 10px; padding: 14px 16px; }
  .sec-title {
    font-size: 10px; font-weight: 800; letter-spacing: 1.8px;
    color: #8C7B6B; text-transform: uppercase; margin-bottom: 3px;
    break-after: avoid; page-break-after: avoid;
  }
  .sec-sub { font-size: 9px; color: #B0A090; margin-bottom: 10px; }
  @page  { size: A4; margin: 0; }
  @media print {
    body    { background: white; }
    .block  { break-inside: avoid; page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Cabeçalho -->
  <div class="block">
    <div style="background:#0F1923;border-radius:12px;padding:20px 22px;color:white;">
      <div style="font-size:8px;font-weight:800;letter-spacing:2.5px;color:#C9A84C;margin-bottom:4px;">RELATÓRIO DE AVALIAÇÃO</div>
      <div style="font-size:22px;font-weight:800;margin-bottom:1px;">Perfil Sensorial 2</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:16px;">Winnie Dunn, PhD • Pearson Clinical • 2014</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${headerItems.map(([l,v]) => `
          <div style="background:rgba(255,255,255,0.09);border-radius:7px;padding:6px 12px;">
            <div style="font-size:7px;color:rgba(255,255,255,0.4);font-weight:700;text-transform:uppercase;margin-bottom:2px;">${l}</div>
            <div style="font-size:12px;font-weight:700;">${v}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Quadrantes — cards -->
  <div class="block">
    <div class="sec-title">Quadrantes de Processamento Sensorial</div>
    <div class="sec-sub">Modelo de Dunn (1997)</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">${quadCards}</div>
  </div>

  <!-- Quadrantes — gráfico + comentário -->
  <div class="block">
    <div class="sec-title">Comparativo dos Quadrantes</div>
    <div class="sec-sub">Percentual do máximo por quadrante</div>
    <div class="card">
      ${quadChart}
      <div style="display:flex;gap:14px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,0.08);">
        ${[{p:35,c:'#C0547A',l:'M. Menos'},{p:50,c:'#E07B2A',l:'Menos'},{p:75,c:'#4A9B5A',l:'Típico'},{p:88,c:'#3A6DB5',l:'Mais'}]
          .map(z=>`<div style="display:flex;align-items:center;gap:3px;">
            <div style="width:2px;height:10px;background:${z.c};"></div>
            <span style="font-size:8px;color:${z.c};font-weight:700;">${z.l}</span>
          </div>`).join('')}
      </div>
    </div>
    ${commentBlock(evaluation.commentQuad, '#C4703F')}
  </div>

  <!-- Sistemas Sensoriais + comentário -->
  <div class="block">
    <div class="sec-title">Sistemas Sensoriais</div>
    <div class="sec-sub">Pontuação e classificação por categoria</div>
    <div class="card">${sectionsChart}</div>
    ${commentBlock(evaluation.commentSec, '#3A7D7B')}
  </div>

  <!-- Legenda -->
  <div class="block">
    <div class="card" style="display:flex;gap:20px;align-items:flex-start;">
      <div style="flex:1;">
        <div class="sec-title" style="margin-bottom:8px;">Legenda de Classificação</div>
        ${[
          {label:'Muito menos que outros(as)', color:'#C0547A', bg:'#FAEDF2'},
          {label:'Menos que outros(as)',        color:'#E07B2A', bg:'#FEF0E3'},
          {label:'Exatamente como a maioria',   color:'#4A9B5A', bg:'#E8F5EB'},
          {label:'Mais que outros(as)',          color:'#3A6DB5', bg:'#E8F0FB'},
          {label:'Muito mais que outros(as)',    color:'#7A5C9A', bg:'#F3EEFF'},
        ].map(l=>`<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
          <div style="width:9px;height:9px;border-radius:50%;background:${l.color};flex-shrink:0;"></div>
          <span style="font-size:10px;color:#1A1714;">${l.label}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Rodapé -->
  <div style="text-align:center;padding:10px;font-size:8px;color:#B0A090;border-top:1px solid #E0D8CC;margin-top:6px;">
    Perfil Sensorial 2 • Winnie Dunn, PhD, OTR, FAOTA • Pearson Clinical Assessment (2014)<br>
    Gerado em ${new Date().toLocaleDateString('pt-BR')} • Para uso exclusivo de profissionais habilitados.
  </div>

</div>
</body>
</html>`;
}
