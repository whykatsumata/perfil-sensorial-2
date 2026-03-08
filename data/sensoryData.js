// ============================================================
// PERFIL SENSORIAL 2 — Dados clínicos
// Winnie Dunn, PhD, OTR, FAOTA — Pearson Clinical (2014)
// Questionário do Cuidador: 3 anos 0 meses a 14 anos 11 meses
// ============================================================

export const OPTIONS = [
  { label: 'Quase sempre',    short: 'QS', value: 5 },
  { label: 'Frequentemente',  short: 'FR', value: 4 },
  { label: 'Metade do tempo', short: 'MT', value: 3 },
  { label: 'Ocasionalmente',  short: 'OC', value: 2 },
  { label: 'Quase nunca',     short: 'QN', value: 1 },
];

// Componentes oficiais do PS2 (legenda da pág. 6)
// EX = Exploração   (laranja  #E07B2A)
// EV = Esquiva      (azul     #3A6DB5)
// SN = Sensibilidade(verde    #4A9B5A)
// OB = Observação   (rosa     #C0547A)
// NONE = Nenhum quadrante (quadrado verde sem sigla)
export const QUADRANT_META = {
  EX:   { abbr: 'EX', label: 'Exploração',       color: '#E07B2A', bg: '#FEF0E3' },
  EV:   { abbr: 'EV', label: 'Esquiva',           color: '#3A6DB5', bg: '#E8F0FB' },
  SN:   { abbr: 'SN', label: 'Sensibilidade',     color: '#4A9B5A', bg: '#E8F5EB' },
  OB:   { abbr: 'OB', label: 'Observação',        color: '#C0547A', bg: '#FAEDF2' },
  NONE: { abbr: '',   label: 'Nenhum quadrante',  color: '#4A9B5A', bg: '#E8F5EB' },
};

// ─────────────────────────────────────────────────────────────
// SEÇÕES — itens exatamente como no formulário oficial
// Numeração global: 1–86
// q: quadrante do item ('EX'|'EV'|'SN'|'OB'|'NONE')
// starred: item não entra na pontuação bruta da seção
// ─────────────────────────────────────────────────────────────
export const SECTIONS = [

  // ── 1. AUDITIVO — itens 1–8 (/40) ────────────────────────
  {
    id: 'auditivo', name: 'Auditivo',
    fullName: 'Processamento AUDITIVO',
    color: '#4A6FA5', colorLight: '#EEF3FF',
    items: [
      { n:  1, text: 'reage intensamente a sons inesperados ou barulhentos (por exemplo, sirenes, cachorro latindo, secador de cabelo).', q: 'EV' },
      { n:  2, text: 'coloca as mãos sobre os ouvidos para protegê-los do som.', q: 'EV' },
      { n:  3, text: 'tem dificuldade em concluir tarefas quando há música tocando ou a TV está ligada.', q: 'SN' },
      { n:  4, text: 'se distrai quando há muito barulho ao redor.', q: 'SN' },
      { n:  5, text: 'torna-se improdutivo(a) com ruídos de fundo (por exemplo, ventilador, geladeira).', q: 'EV' },
      { n:  6, text: 'para de prestar atenção em mim ou parece que me ignora.', q: 'SN' },
      { n:  7, text: 'parece não ouvir quando eu o(a) chamo por seu nome (mesmo com sua audição sendo normal).', q: 'SN' },
      { n:  8, text: 'gosta de barulhos estranhos ou faz barulho(s) para se divertir.', q: 'OB' },
    ],
  },

  // ── 2. VISUAL — itens 9–15 (/30 — item 15 não pontua) ───
  {
    id: 'visual', name: 'Visual',
    fullName: 'Processamento VISUAL',
    color: '#7A5C9A', colorLight: '#F3EEFF',
    items: [
      { n:  9, text: 'prefere brincar ou fazer tarefas em condições de pouca luz.', q: 'SN' },
      { n: 10, text: 'prefere vestir-se com roupas de cores brilhantes ou estampadas.', q: 'NONE' },
      { n: 11, text: 'se diverte ao olhar para detalhes visuais em objetos.', q: 'NONE' },
      { n: 12, text: 'precisa de ajuda para encontrar objetos que são óbvios para outros.', q: 'OB' },
      { n: 13, text: 'se incomoda mais com luzes brilhantes do que outras crianças da mesma idade.', q: 'SN' },
      { n: 14, text: 'observa as pessoas conforme elas se movem ao redor da sala.', q: 'EX' },
      { n: 15, text: 'se incomoda com luzes brilhantes (por exemplo, se esconde da luz solar que reluz através da janela do carro).*', q: 'EV', starred: true },
    ],
    starNote: '*Este item não faz parte da Pontuação bruta VISUAL.',
  },

  // ── 3. TATO — itens 16–26 (/55) ──────────────────────────
  {
    id: 'tato', name: 'Tato',
    fullName: 'Processamento do TATO',
    color: '#C4703F', colorLight: '#FFF0E8',
    items: [
      { n: 16, text: 'mostra desconforto durante momentos de cuidado pessoal (por exemplo, briga ou chora durante o corte de cabelo, lavagem do rosto, corte das unhas das mãos).', q: 'SN' },
      { n: 17, text: 'se irrita com o uso de sapatos ou meias.', q: 'NONE' },
      { n: 18, text: 'mostra uma resposta emocional ou agressiva ao ser tocado(a).', q: 'EV' },
      { n: 19, text: 'fica ansioso(a) quando fica de pé em proximidade a outros (por exemplo, em uma fila).', q: 'SN' },
      { n: 20, text: 'esfrega ou coça uma parte do corpo que foi tocada.', q: 'SN' },
      { n: 21, text: 'toca as pessoas ou objetos a ponto de incomodar outros.', q: 'EX' },
      { n: 22, text: 'exibe a necessidade de tocar brinquedos, superfícies ou texturas (por exemplo, quer obter a sensação de tudo ao redor).', q: 'EX' },
      { n: 23, text: 'parece não ter consciência quanto à dor.', q: 'OB' },
      { n: 24, text: 'parece não ter consciência quanto a mudanças de temperatura.', q: 'OB' },
      { n: 25, text: 'toca pessoas e objetos mais do que crianças da mesma idade.', q: 'EX' },
      { n: 26, text: 'parece alheio(a) quanto ao fato de suas mãos ou face estarem sujas.', q: 'OB' },
    ],
  },

  // ── 4. MOVIMENTOS — itens 27–34 (/40) ────────────────────
  {
    id: 'movimento', name: 'Movimentos',
    fullName: 'Processamento de MOVIMENTOS',
    color: '#3A7D7B', colorLight: '#EEF8F8',
    items: [
      { n: 27, text: 'busca movimentar-se até o ponto que interfere com rotinas diárias (por exemplo, não consegue ficar quieto, demonstra inquietude).', q: 'EX' },
      { n: 28, text: 'faz movimento de balançar na cadeira, no chão ou enquanto está em pé.', q: 'EX' },
      { n: 29, text: 'hesita subir ou descer calçadas ou degraus (por exemplo, é cauteloso, para antes de se movimentar).', q: 'NONE' },
      { n: 30, text: 'fica animado(a) durante tarefas que envolvem movimento.', q: 'EX' },
      { n: 31, text: 'se arrisca ao se movimentar ou escalar de modo perigoso.', q: 'EX' },
      { n: 32, text: 'procura oportunidades para cair sem se importar com a própria segurança (por exemplo, cai de propósito).', q: 'EX' },
      { n: 33, text: 'perde o equilíbrio inesperadamente ao caminhar sobre uma superfície irregular.', q: 'OB' },
      { n: 34, text: 'esbarra em coisas, sem conseguir notar objetos ou pessoas no caminho.', q: 'OB' },
    ],
  },

  // ── 5. POSIÇÃO DO CORPO — itens 35–42 (/40) ──────────────
  {
    id: 'posicao', name: 'Posição do Corpo',
    fullName: 'Processamento da POSIÇÃO DO CORPO',
    color: '#5A8C5A', colorLight: '#EEF7EE',
    items: [
      { n: 35, text: 'move-se de modo rígido.', q: 'OB' },
      { n: 36, text: 'fica cansado(a) facilmente, principalmente quando está em pé ou mantendo o corpo em uma posição.', q: 'OB' },
      { n: 37, text: 'parece ter músculos fracos.', q: 'OB' },
      { n: 38, text: 'se apoia para se sustentar (por exemplo, segura a cabeça com as mãos, apoia-se em uma parede).', q: 'OB' },
      { n: 39, text: 'se segura a objetos, paredes ou corrimões mais do que as crianças da mesma idade.', q: 'OB' },
      { n: 40, text: 'ao andar, faz barulho, como se os pés fossem pesados.', q: 'OB' },
      { n: 41, text: 'se inclina para se apoiar em móveis ou em outras pessoas.', q: 'EX' },
      { n: 42, text: 'precisa de cobertores pesados para dormir.', q: 'NONE' },
    ],
  },

  // ── 6. SENSIBILIDADE ORAL — itens 43–52 (/50) ────────────
  {
    id: 'oral', name: 'Sensibilidade Oral',
    fullName: 'Processamento de SENSIBILIDADE ORAL',
    color: '#C9A84C', colorLight: '#FDF4E0',
    items: [
      { n: 43, text: 'fica com ânsia de vômito facilmente com certas texturas de alimentos ou utensílios alimentares na boca.', q: 'NONE' },
      { n: 44, text: 'rejeita certos gostos ou cheiros de comida que são, normalmente, parte de dietas de crianças.', q: 'SN' },
      { n: 45, text: 'se alimenta somente de certos sabores (por exemplo, doce, salgado).', q: 'SN' },
      { n: 46, text: 'limita-se quanto a certas texturas de alimentos.', q: 'SN' },
      { n: 47, text: 'é exigente para comer, principalmente com relação às texturas de alimentos.', q: 'SN' },
      { n: 48, text: 'cheira objetos não comestíveis.', q: 'EX' },
      { n: 49, text: 'mostra uma forte preferência por certos sabores.', q: 'EX' },
      { n: 50, text: 'deseja intensamente certos alimentos, gostos ou cheiros.', q: 'EX' },
      { n: 51, text: 'coloca objetos na boca (por exemplo, lápis, mãos).', q: 'EX' },
      { n: 52, text: 'morde a língua ou lábios mais do que as crianças da mesma idade.', q: 'SN' },
    ],
  },

  // ── 7. CONDUTA — itens 53–61 (/45) ───────────────────────
  {
    id: 'conduta', name: 'Conduta',
    fullName: 'CONDUTA associada ao processamento sensorial',
    color: '#B85C6E', colorLight: '#FFEEF2',
    items: [
      { n: 53, text: 'parece propenso(a) a acidentes.', q: 'OB' },
      { n: 54, text: 'se apressa em atividades de colorir, escrever ou desenhar.', q: 'OB' },
      { n: 55, text: 'se expõe a riscos excessivos (por exemplo, sobe alto em uma árvore, salta de móveis altos) que comprometem sua própria segurança.', q: 'EX' },
      { n: 56, text: 'parece ser mais ativo(a) do que crianças da mesma idade.', q: 'EX' },
      { n: 57, text: 'faz as coisas de uma maneira mais difícil do que necessário (por exemplo, perde tempo, move-se lentamente).', q: 'OB' },
      { n: 58, text: 'pode ser teimoso(a) e não cooperativo(a).', q: 'EV' },
      { n: 59, text: 'faz birra.', q: 'EV' },
      { n: 60, text: 'parece se divertir quando cai.', q: 'EX' },
      { n: 61, text: 'resiste ao contato visual comigo ou com outros.', q: 'EV' },
    ],
  },

  // ── 8. SOCIOEMOCIONAL — itens 62–75 (/70) ────────────────
  {
    id: 'socioemocional', name: 'Socioemocional',
    fullName: 'Respostas SOCIOEMOCIONAIS associadas ao processamento sensorial',
    color: '#5C6BC0', colorLight: '#ECEEFF',
    items: [
      { n: 62, text: 'parece ter baixa autoestima (por exemplo, dificuldade de gostar de si mesmo(a)).', q: 'OB' },
      { n: 63, text: 'precisa de apoio positivo para enfrentar situações desafiadoras.', q: 'EV' },
      { n: 64, text: 'é sensível às críticas.', q: 'EV' },
      { n: 65, text: 'possui medos definidos e previsíveis.', q: 'EV' },
      { n: 66, text: 'se expressa sentindo-se como um fracasso.', q: 'EV' },
      { n: 67, text: 'é demasiadamente sério(a).', q: 'EV' },
      { n: 68, text: 'tem fortes explosões emocionais quando não consegue concluir uma tarefa.', q: 'EV' },
      { n: 69, text: 'tem dificuldade de interpretar linguagem corporal ou expressões faciais.', q: 'SN' },
      { n: 70, text: 'fica frustrado(a) facilmente.', q: 'EV' },
      { n: 71, text: 'possui medos que interferem nas rotinas diárias.', q: 'EV' },
      { n: 72, text: 'fica angustiado(a) com mudanças nos planos, rotinas ou expectativas.', q: 'EV' },
      { n: 73, text: 'precisa de mais proteção contra acontecimentos da vida do que crianças da mesma idade (por exemplo, é indefeso(a) física ou emocionalmente).', q: 'SN' },
      { n: 74, text: 'interage ou participa em grupos menos que crianças da mesma idade.', q: 'EV' },
      { n: 75, text: 'tem dificuldade com amizades (por exemplo, fazer ou manter amigos).', q: 'EV' },
    ],
  },

  // ── 9. ATENÇÃO — itens 76–86 (/50 — item 86 não pontua) ─
  {
    id: 'atencao', name: 'Atenção',
    fullName: 'Respostas de ATENÇÃO associadas ao processamento sensorial',
    color: '#6D8B3A', colorLight: '#EEF5E0',
    items: [
      { n: 76, text: 'não faz contato visual comigo durante interações no dia a dia.', q: 'OB' },
      { n: 77, text: 'tem dificuldade para prestar atenção.', q: 'SN' },
      { n: 78, text: 'se desvia de tarefas para observar todas as ações na sala.', q: 'SN' },
      { n: 79, text: 'parece alheio(a) dentro de um ambiente ativo (por exemplo, não tem consciência quanto à atividade).', q: 'OB' },
      { n: 80, text: 'olha fixamente, de maneira intensa, para objetos.', q: 'OB' },
      { n: 81, text: 'olha fixamente, de maneira intensa, para as pessoas.', q: 'EV' },
      { n: 82, text: 'observa a todos conforme se movem ao redor da sala.', q: 'EX' },
      { n: 83, text: 'muda de uma coisa para outra de modo a interferir com as atividades.', q: 'EX' },
      { n: 84, text: 'se perde facilmente.', q: 'SN' },
      { n: 85, text: 'tem dificuldade para encontrar objetos em espaços cheios de coisas (por exemplo, sapatos em um quarto bagunçado, lápis na "gaveta de bagunças").', q: 'OB' },
      { n: 86, text: 'parece não se dar conta quando pessoas entram na sala.*', q: 'OB', starred: true },
    ],
    starNote: '*Este item não faz parte da Pontuação bruta de ATENÇÃO.',
  },
];

// ─────────────────────────────────────────────────────────────
// QUADRANTES
// Pontuações máximas conforme tabela pág. 8 do formulário
// EX /95 | EV /100 | SN /95 | OB /110
// ─────────────────────────────────────────────────────────────
export const QUADRANTS = [
  {
    id: 'EX', name: 'Exploração',
    fullName: 'Exploração / Criança exploradora',
    shortName: 'Exploração',
    emoji: '🟠',
    color: '#E07B2A', colorLight: '#FEF0E3',
    desc: 'A criança obtém estímulo sensorial e busca estímulos em uma taxa mais elevada que outros.',
    maxScore: 95,
  },
  {
    id: 'EV', name: 'Esquiva',
    fullName: 'Esquiva / Criança que se esquiva',
    shortName: 'Esquiva',
    emoji: '🔵',
    color: '#3A6DB5', colorLight: '#E8F0FB',
    desc: 'A criança fica incomodada por estímulos sensoriais e se afasta em uma taxa mais elevada.',
    maxScore: 100,
  },
  {
    id: 'SN', name: 'Sensibilidade',
    fullName: 'Sensibilidade / Criança sensível',
    shortName: 'Sensibilidade',
    emoji: '🟢',
    color: '#4A9B5A', colorLight: '#E8F5EB',
    desc: 'A criança detecta estímulos sensoriais e os percebe em uma taxa mais elevada que outros.',
    maxScore: 95,
  },
  {
    id: 'OB', name: 'Observação',
    fullName: 'Observação / Criança observadora',
    shortName: 'Observação',
    emoji: '🩷',
    color: '#C0547A', colorLight: '#FAEDF2',
    desc: 'A criança não percebe estímulos sensoriais em uma taxa mais elevada que outros.',
    maxScore: 110,
  },
];

// ─────────────────────────────────────────────────────────────
// PONTUAÇÕES MÁXIMAS por seção (tabela pág. 8)
// ─────────────────────────────────────────────────────────────
const SECTION_MAX = {
  auditivo:       40,
  visual:         30,  // item 15 (starred) não conta
  tato:           55,
  movimento:      40,
  posicao:        40,
  oral:           50,
  conduta:        45,
  socioemocional: 70,
  atencao:        50,  // item 86 (starred) não conta
};

// ─────────────────────────────────────────────────────────────
// calcScores — retorna pontuações de seções e quadrantes
// ─────────────────────────────────────────────────────────────
export function calcScores(answers) {
  const sectionScores  = {};
  const quadrantScores = { EX: 0, EV: 0, SN: 0, OB: 0 };
  const quadrantMax    = { EX: 0, EV: 0, SN: 0, OB: 0 };

  SECTIONS.forEach(sec => {
    let total = 0;

    sec.items.forEach((item, i) => {
      const val = answers[`${sec.id}_${i}`] ?? 0;

      // Pontuação bruta da seção (itens starred não contam)
      if (!item.starred) {
        total += val;
      }

      // Pontuação do quadrante (NONE e starred não contam)
      if (item.q !== 'NONE' && !item.starred) {
        quadrantScores[item.q] += val;
        quadrantMax[item.q]    += 5;
      }
    });

    sectionScores[sec.id] = {
      total,
      max: SECTION_MAX[sec.id],
    };
  });

  return { sectionScores, quadrantScores, quadrantMax };
}

// ─────────────────────────────────────────────────────────────
// getClassification — baseado nas faixas da tabela (pág. 8)
// Muito menos / Menos / Exatamente como a maioria / Mais / Muito mais
// ─────────────────────────────────────────────────────────────
export function getClassification(score, max) {
  if (!max || max === 0) return { label: 'Sem dados', short: '—', color: '#888', bg: '#F5F5F5' };
  const pct = score / max;
  if (pct <= 0.13) return { label: 'Muito menos que outros(as)', short: 'Muito menos', color: '#C0547A', bg: '#FAEDF2' };
  if (pct <= 0.36) return { label: 'Menos que outros(as)',        short: 'Menos',       color: '#E07B2A', bg: '#FEF0E3' };
  if (pct <= 0.72) return { label: 'Exatamente como a maioria',  short: 'Típico',       color: '#4A9B5A', bg: '#E8F5EB' };
  if (pct <= 0.88) return { label: 'Mais que outros(as)',         short: 'Mais',         color: '#3A6DB5', bg: '#E8F0FB' };
  return               { label: 'Muito mais que outros(as)',  short: 'Muito mais',   color: '#7A5C9A', bg: '#F3EEFF' };
}
