import { SECTIONS, QUADRANTS, calcScores, getClassification } from './sensoryData';
import { calcAge, formatDate } from './storage';

export function buildReportHTML(patient, evaluation) {
  const answers = evaluation.answers || {};
  const { sectionScores, quadrantScores, quadrantMax } = calcScores(answers);
  const date = formatDate(evaluation.finishedAt || evaluation.startedAt);
  const age  = calcAge(patient.dob);

  const SEC_EMOJI = { auditivo:'👂', visual:'👁', tato:'✋', movimento:'🌀', posicao:'💪', oral:'👅', conduta:'🧠', socioemocional:'❤️', atencao:'🧩' };

  function bar(pct, color, height = 16) {
    const zones = [35, 50, 75, 88].map(p =>
      `<div style="position:absolute;left:${p}%;top:0;bottom:0;width:1.5px;background:rgba(0,0,0,0.18);z-index:2;"></div>`
    ).join('');
    return `<div style="position:relative;height:${height}px;background:#F0EAE0;border-radius:${height}px;overflow:hidden;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:${Math.min(Math.round(pct),100)}%;background:${color};border-radius:${height}px;"></div>
      ${zones}
    </div>`;
  }

  function clsBadge(cls) {
    return `<span style="background:${cls.bg};color:${cls.color};font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;white-space:nowrap;">${cls.label}</span>`;
  }

  function commentBlock(text, borderColor) {
    if (!text || !text.trim()) return '';
    return `<div style="background:white;border-radius:12px;padding:16px 20px;border-left:4px solid ${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-top:12px;">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:#8C7B6B;text-transform:uppercase;margin-bottom:8px;">Comentários</div>
      <div style="font-size:13px;color:#1A1714;line-height:1.7;white-space:pre-wrap;">${text}</div>
    </div>`;
  }

  // Cards dos 4 quadrantes
  const quadCardsHTML = QUADRANTS.map(q => {
    const score = quadrantScores[q.id];
    const max   = quadrantMax[q.id];
    const pct   = max > 0 ? (score / max) * 100 : 0;
    const cls   = getClassification(score, max);
    return `<div style="width:46%;background:white;border-radius:12px;padding:16px;border-top:4px solid ${q.color};box-shadow:0 2px 8px rgba(0,0,0,0.07);break-inside:avoid;">
      <div style="font-size:14px;font-weight:800;color:${q.color};margin-bottom:4px;">${q.name}</div>
      <div style="font-size:10px;color:#8C7B6B;line-height:1.4;margin-bottom:10px;">${q.desc}</div>
      ${bar(pct, q.color, 10)}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;margin-bottom:8px;">
        <span style="font-size:24px;font-weight:800;color:${q.color};">${score}<span style="font-size:12px;color:#8C7B6B;font-weight:400;">/${max}</span></span>
        <span style="font-size:12px;color:#8C7B6B;">${Math.round(pct)}%</span>
      </div>
      ${clsBadge(cls)}
    </div>`;
  }).join('');

  // Gráfico comparativo quadrantes
  const quadChartHTML = QUADRANTS.map(q => {
    const score = quadrantScores[q.id];
    const max   = quadrantMax[q.id];
    const pct   = max > 0 ? (score / max) * 100 : 0;
    const cls   = getClassification(score, max);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:88px;font-size:11px;font-weight:700;color:#1A1714;text-align:right;flex-shrink:0;">${q.shortName}</div>
      <div style="flex:1;">${bar(pct, q.color, 13)}</div>
      <div style="width:34px;font-size:11px;font-weight:700;color:#8C7B6B;text-align:right;flex-shrink:0;">${Math.round(pct)}%</div>
      <div style="width:110px;flex-shrink:0;">${clsBadge(cls)}</div>
    </div>`;
  }).join('');

  // Gráfico sistemas sensoriais
  const sectionsHTML = SECTIONS.map(sec => {
    const sc  = sectionScores[sec.id];
    const pct = sc.max > 0 ? (sc.total / sc.max) * 100 : 0;
    const cls = getClassification(sc.total, sc.max);
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px 12px;background:white;border-radius:10px;break-inside:avoid;">
      <div style="font-size:20px;width:28px;text-align:center;flex-shrink:0;">${SEC_EMOJI[sec.id] || '•'}</div>
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:700;color:#1A1714;margin-bottom:4px;">${sec.fullName}</div>
        ${bar(pct, sec.color, 9)}
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:50px;">
        <div style="font-size:12px;font-weight:700;color:#1A1714;margin-bottom:3px;">${sc.total}/${sc.max}</div>
        ${clsBadge(cls)}
      </div>
    </div>`;
  }).join('');

  // Legenda de zonas
  const zoneLinesHTML = [
    {p:35,c:'#B85C6E',l:'35%'},{p:50,c:'#C4703F',l:'50%'},
    {p:75,c:'#5A8C5A',l:'75%'},{p:88,c:'#4A6FA5',l:'88%'}
  ].map(z => `<div style="display:flex;align-items:center;gap:4px;">
    <div style="width:2px;height:13px;background:${z.c};"></div>
    <span style="font-size:10px;color:${z.c};font-weight:700;">${z.l}</span>
  </div>`).join('');

  const legendHTML = [
    { label: 'Muito menos que outros(as)', color: '#C0547A', bg: '#FAEDF2', range: '0–13%' },
    { label: 'Menos que outros(as)',        color: '#E07B2A', bg: '#FEF0E3', range: '14–36%' },
    { label: 'Exatamente como a maioria',  color: '#4A9B5A', bg: '#E8F5EB', range: '37–72%' },
    { label: 'Mais que outros(as)',         color: '#3A6DB5', bg: '#E8F0FB', range: '73–88%' },
    { label: 'Muito mais que outros(as)',   color: '#7A5C9A', bg: '#F3EEFF', range: '89–100%' },
  ].map(l => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <div style="width:11px;height:11px;border-radius:50%;background:${l.color};flex-shrink:0;"></div>
    <span style="flex:1;font-size:12px;color:#1A1714;">${l.label}</span>
    <span style="font-size:11px;font-weight:700;color:${l.color};">${l.range}</span>
  </div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Perfil Sensorial 2 — ${patient.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; background: #F5F3EF; color: #1A1714; }
  .page { padding: 28px; max-width: 780px; margin: 0 auto; }

  /* Cada bloco (título + conteúdo + comentário) nunca quebra internamente */
  .block { break-inside: avoid; page-break-inside: avoid; margin-bottom: 24px; }

  /* Título do bloco nunca fica orphão sem o conteúdo */
  .block-title {
    font-size: 12px; font-weight: 800; letter-spacing: 2px;
    color: #8C7B6B; text-transform: uppercase;
    margin-bottom: 4px;
    break-after: avoid; page-break-after: avoid;
  }
  .block-sub {
    font-size: 11px; color: #B0A090; margin-bottom: 12px;
    break-after: avoid; page-break-after: avoid;
  }
  .card {
    background: white; border-radius: 14px; padding: 18px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    break-inside: avoid; page-break-inside: avoid;
  }
  @media print {
    body { background: white; }
    .page { padding: 16px; }
    .block { break-inside: avoid; page-break-inside: avoid; }
    .block-title { break-after: avoid; page-break-after: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ── Cabeçalho ── -->
  <div class="block">
    <div style="background:#0F1923;border-radius:16px;padding:24px 28px;color:white;">
      <div style="font-size:10px;font-weight:800;letter-spacing:2.5px;color:#C9A84C;text-transform:uppercase;margin-bottom:6px;">RELATÓRIO DE AVALIAÇÃO</div>
      <div style="font-size:26px;font-weight:800;margin-bottom:3px;">Perfil Sensorial 2</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:16px;">Winnie Dunn • Pearson Clinical • 2014</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${[
          ['Paciente', patient.name],
          ['Idade', age],
          ['Data', date],
          evaluation.evaluator ? ['Avaliador(a)', evaluation.evaluator] : null,
          patient.diagnosis    ? ['Diagnóstico',  patient.diagnosis]    : null,
        ].filter(Boolean).map(([l,v]) => `
          <div style="background:rgba(255,255,255,0.07);border-radius:8px;padding:8px 14px;">
            <div style="font-size:9px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;margin-bottom:2px;">${l}</div>
            <div style="font-size:14px;font-weight:700;">${v}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- ── Legenda ── -->
  <div class="block">
    <div class="card">
      <div class="block-title" style="margin-bottom:10px;">Legenda de Classificação</div>
      ${legendHTML}
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #F0EAE0;display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
        <span style="font-size:10px;color:#8C7B6B;">Limites nos gráficos:</span>
        ${zoneLinesHTML}
      </div>
    </div>
  </div>

  <!-- ── Quadrantes — cards ── -->
  <div class="block">
    <div class="block-title">Quadrantes de Processamento Sensorial</div>
    <div class="block-sub">Modelo de Dunn (1997)</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">${quadCardsHTML}</div>
  </div>

  <!-- ── Quadrantes — gráfico comparativo + comentário ── -->
  <div class="block">
    <div class="block-title">Comparativo dos Quadrantes</div>
    <div class="block-sub">Percentual do máximo possível por quadrante</div>
    <div class="card">
      ${quadChartHTML}
      <div style="display:flex;justify-content:space-around;margin-top:10px;padding-top:10px;border-top:1px solid #F0EAE0;">
        ${[
          {p:35,c:'#C0547A',l:'M. Menos'},{p:50,c:'#E07B2A',l:'Menos'},
          {p:75,c:'#4A9B5A',l:'Típico'}, {p:88,c:'#3A6DB5',l:'Mais'},
        ].map(z=>`<div style="display:flex;align-items:center;gap:4px;">
          <div style="width:2px;height:11px;background:${z.c};"></div>
          <span style="font-size:9px;color:${z.c};font-weight:700;">${z.l}</span>
        </div>`).join('')}
      </div>
    </div>
    ${commentBlock(evaluation.commentQuad, '#C4703F')}
  </div>

  <!-- ── Sistemas Sensoriais + comentário ── -->
  <div class="block">
    <div class="block-title">Sistemas Sensoriais</div>
    <div class="block-sub">Pontuação e classificação por categoria</div>
    <div class="card">
      ${sectionsHTML}
    </div>
    ${commentBlock(evaluation.commentSec, '#3A7D7B')}
  </div>

  <!-- ── Rodapé ── -->
  <div style="text-align:center;padding:14px;font-size:10px;color:#B0A090;border-top:1px solid #E0D8CC;margin-top:8px;">
    Perfil Sensorial 2 • Winnie Dunn • Pearson Clinical (2014)<br>
    Gerado em ${new Date().toLocaleDateString('pt-BR')} • Para uso exclusivo de profissionais habilitados.
  </div>

</div>
</body>
</html>`;
}
