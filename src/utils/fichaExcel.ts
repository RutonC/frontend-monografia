import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────────

export interface TermGrades {
  termName: string; // "1º Trimestre"
  termId: string;
  ACS1: number | null;
  ACS2: number | null;
  ACS3: number | null;
  ACP1: number | null;
  ACP2: number | null;
}

export interface StudentFichaRow {
  name: string; // "Apelido Nome"
  identifier?: string;
  terms: TermGrades[]; // índice 0=T1, 1=T2, 2=T3
}

export interface FichaData {
  teacherName: string;
  className: string; // "11ª Classe"
  sectionName: string; // "A01"
  subjectName: string;
  year: string; // "2025"
  students: StudentFichaRow[];
}

// ─────────────────────────────────────────────────────────────────
//  Fórmulas de cálculo
// ─────────────────────────────────────────────────────────────────

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (!valid.length) return null;
  return (
    Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
  );
}

function calcMACS(t: TermGrades) {
  return avg([t.ACS1, t.ACS2, t.ACS3]);
}

function calcMAP(t: TermGrades) {
  return avg([t.ACP1, t.ACP2]);
}

function calcMT(t: TermGrades): number | null {
  const macs = calcMACS(t);
  const map = calcMAP(t);
  if (macs === null && map === null) return null;
  // Fórmula: MT = (MACS*2 + MAP) / 3 (ponderação típica moçambicana)
  if (macs !== null && map !== null)
    return Math.round(((macs * 2 + map) / 3) * 10) / 10;
  return macs ?? map;
}

function calcMA(terms: TermGrades[]): number | null {
  const mts = terms.map(calcMT).filter((v): v is number => v !== null);
  if (!mts.length) return null;
  return Math.round((mts.reduce((a, b) => a + b, 0) / mts.length) * 10) / 10;
}

function approved(ma: number | null): string {
  if (ma === null) return "—";
  return ma >= 10 ? "Aprovado" : "Reprovado";
}

function fmt(v: number | null): string | number {
  return v === null ? "" : v;
}

// ─────────────────────────────────────────────────────────────────
//  Geração do workbook
// ─────────────────────────────────────────────────────────────────

export function gerarFichaExcel(data: FichaData): void {
  const wb = XLSX.utils.book_new();

  // ── Construir a grelha como array 2D ──────────────────────────

  // Linha 0 — cabeçalho da escola
  const R0 = [
    "", // col A — espaço para logo
    "Escola Comunitária da A.M.S",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  // Linha 1 — "Ficha de avaliação"
  const R1 = ["", "Ficha de avaliação"];

  // Linha 2 — info do professor/turma
  const R2 = [
    "",
    `Nome do Professor: ${data.teacherName}`,
    "",
    "",
    "",
    "",
    `${data.className} Turma – ${data.sectionName}`,
    "",
    "",
    "",
    "",
    `Disciplina: ${data.subjectName}`,
    "",
    "",
    "",
    `Ano-${data.year}`,
  ];

  // Linha 3 — vazia
  const R3: any[] = [];

  // ── Cabeçalhos da tabela (3 níveis) ─────────────────────────

  // Nível 1 — grupos de colunas
  // Colunas: Nº | NOMES | [1ºTRI: 8 cols] | [2ºTRI: 8 cols] | [3ºTRI: 8 cols] | MA | A
  // Total: 1+1+8+8+8+1+1 = 28 colunas (A..AB)
  const H1 = [
    "Nº",
    "NOMES",
    "1º TRIMESTRE",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 8 cols
    "2º TRIMESTRE",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 8 cols
    "3º TRIMESTRE",
    "",
    "",
    "",
    "",
    "",
    "",
    "", // 8 cols
    "MA",
    "A",
  ];

  // Nível 2 — sub-grupos
  const H2 = [
    "",
    "",
    // T1
    "ACS",
    "",
    "",
    "MACS",
    "ACP",
    "",
    "MAP",
    "MT",
    // T2
    "ACS",
    "",
    "",
    "MACS",
    "AP",
    "",
    "MAP",
    "MT",
    // T3
    "AC",
    "",
    "",
    "MACS",
    "AP",
    "",
    "MAP",
    "MT",
    "",
    "",
  ];

  // Nível 3 — números
  const H3 = [
    "",
    "",
    "1",
    "2",
    "3",
    "",
    "1",
    "2",
    "",
    "", // T1
    "1",
    "2",
    "3",
    "",
    "1",
    "2",
    "",
    "", // T2
    "1",
    "2",
    "3",
    "",
    "1",
    "2",
    "",
    "", // T3
    "",
    "",
  ];

  // ── Linhas de dados ──────────────────────────────────────────

  const dataRows: any[][] = data.students.map((s, i) => {
    const [t1, t2, t3] = [
      s.terms[0] ?? null,
      s.terms[1] ?? null,
      s.terms[2] ?? null,
    ];

    const macs1 = t1 ? calcMACS(t1) : null;
    const map1 = t1 ? calcMAP(t1) : null;
    const mt1 = t1 ? calcMT(t1) : null;

    const macs2 = t2 ? calcMACS(t2) : null;
    const map2 = t2 ? calcMAP(t2) : null;
    const mt2 = t2 ? calcMT(t2) : null;

    const macs3 = t3 ? calcMACS(t3) : null;
    const map3 = t3 ? calcMAP(t3) : null;
    const mt3 = t3 ? calcMT(t3) : null;

    const ma = calcMA(s.terms.filter(Boolean));
    const ap = approved(ma);

    return [
      String(i + 1).padStart(2, "0"),
      s.name,
      // T1
      fmt(t1?.ACS1 ?? null),
      fmt(t1?.ACS2 ?? null),
      fmt(t1?.ACS3 ?? null),
      fmt(macs1),
      fmt(t1?.ACP1 ?? null),
      fmt(t1?.ACP2 ?? null),
      fmt(map1),
      fmt(mt1),
      // T2
      fmt(t2?.ACS1 ?? null),
      fmt(t2?.ACS2 ?? null),
      fmt(t2?.ACS3 ?? null),
      fmt(macs2),
      fmt(t2?.ACP1 ?? null),
      fmt(t2?.ACP2 ?? null),
      fmt(map2),
      fmt(mt2),
      // T3
      fmt(t3?.ACS1 ?? null),
      fmt(t3?.ACS2 ?? null),
      fmt(t3?.ACS3 ?? null),
      fmt(macs3),
      fmt(t3?.ACP1 ?? null),
      fmt(t3?.ACP2 ?? null),
      fmt(map3),
      fmt(mt3),
      // Totais
      fmt(ma),
      ap,
    ];
  });

  // Linhas de resumo por trimestre
  const buildSummary = (tIdx: number) => {
    const avaliados = data.students.filter((s) => {
      const t = s.terms[tIdx];
      return t && calcMT(t) !== null;
    }).length;
    const mts = data.students
      .map((s) => (s.terms[tIdx] ? calcMT(s.terms[tIdx]!) : null))
      .filter((v): v is number => v !== null);
    const neg = mts.filter((v) => v < 10).length;
    const pos = mts.filter((v) => v >= 10).length;
    const pctNeg = avaliados ? Math.round((neg / avaliados) * 100) : 0;
    const pctPos = avaliados ? Math.round((pos / avaliados) * 100) : 0;
    return { avaliados, neg, pos, pctNeg, pctPos };
  };

  const [s1, s2, s3] = [buildSummary(0), buildSummary(1), buildSummary(2)];

  const summaryRows = [
    [],
    [
      "",
      `Nº de avaliados:`,
      s1.avaliados,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `Nº de avaliados:`,
      s2.avaliados,
      "",
      "",
      "",
      "",
      "",
      "",
      `Nº de avaliados:`,
      s3.avaliados,
    ],
    [
      "",
      `Nº Neg.:`,
      s1.neg,
      "/",
      `${s1.pctNeg}%`,
      "",
      "",
      "",
      "",
      "",
      `Nº Neg.:`,
      s2.neg,
      "/",
      `${s2.pctNeg}%`,
      "",
      "",
      "",
      "",
      `Nº Neg.:`,
      s3.neg,
      "/",
      `${s3.pctNeg}%`,
    ],
    [
      "",
      `Nº Pos.:`,
      s1.pos,
      "/",
      `${s1.pctPos}%`,
      "",
      "",
      "",
      "",
      "",
      `Nº Pos.:`,
      s2.pos,
      "/",
      `${s2.pctPos}%`,
      "",
      "",
      "",
      "",
      `Nº Pos.:`,
      s3.pos,
      "/",
      `${s3.pctPos}%`,
    ],
  ];

  // ── Montar sheet ─────────────────────────────────────────────

  const allRows = [R0, R1, R2, R3, H1, H2, H3, ...dataRows, ...summaryRows];

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // ── Merges ───────────────────────────────────────────────────
  // XLSX merges: { s: {r, c}, e: {r, c} }

  const merges: XLSX.Range[] = [
    // Linha 0 — escola (B0..AB0)
    { s: { r: 0, c: 1 }, e: { r: 0, c: 27 } },
    // Linha 1 — ficha (B1..AB1)
    { s: { r: 1, c: 1 }, e: { r: 1, c: 27 } },
    // Linha 2 — info (B2..F2), (G2..K2), (L2..O2), (P2..AB2)
    { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } },
    { s: { r: 2, c: 6 }, e: { r: 2, c: 10 } },
    { s: { r: 2, c: 11 }, e: { r: 2, c: 14 } },
    { s: { r: 2, c: 15 }, e: { r: 2, c: 27 } },
    // H1: Nº (A4..A6), NOMES (B4..B6)
    { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
    { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
    // H1: 1º TRIMESTRE (C4..J4), 2º (K4..R4), 3º (S4..Z4)
    { s: { r: 4, c: 2 }, e: { r: 4, c: 9 } },
    { s: { r: 4, c: 10 }, e: { r: 4, c: 17 } },
    { s: { r: 4, c: 18 }, e: { r: 4, c: 25 } },
    // H1: MA, A
    { s: { r: 4, c: 26 }, e: { r: 6, c: 26 } },
    { s: { r: 4, c: 27 }, e: { r: 6, c: 27 } },
    // H2: ACS (3 cols cada tri), MACS, ACP(2), MAP, MT — por trimestre
    // T1: ACS=C5..E5, MACS=F5..F6, ACP=G5..H5, MAP=I5..I6, MT=J5..J6
    { s: { r: 5, c: 2 }, e: { r: 5, c: 4 } },
    { s: { r: 5, c: 5 }, e: { r: 6, c: 5 } },
    { s: { r: 5, c: 6 }, e: { r: 5, c: 7 } },
    { s: { r: 5, c: 8 }, e: { r: 6, c: 8 } },
    { s: { r: 5, c: 9 }, e: { r: 6, c: 9 } },
    // T2
    { s: { r: 5, c: 10 }, e: { r: 5, c: 12 } },
    { s: { r: 5, c: 13 }, e: { r: 6, c: 13 } },
    { s: { r: 5, c: 14 }, e: { r: 5, c: 15 } },
    { s: { r: 5, c: 16 }, e: { r: 6, c: 16 } },
    { s: { r: 5, c: 17 }, e: { r: 6, c: 17 } },
    // T3
    { s: { r: 5, c: 18 }, e: { r: 5, c: 20 } },
    { s: { r: 5, c: 21 }, e: { r: 6, c: 21 } },
    { s: { r: 5, c: 22 }, e: { r: 5, c: 23 } },
    { s: { r: 5, c: 24 }, e: { r: 6, c: 24 } },
    { s: { r: 5, c: 25 }, e: { r: 6, c: 25 } },
  ];

  ws["!merges"] = merges;

  // ── Larguras das colunas ─────────────────────────────────────
  ws["!cols"] = [
    { wch: 4 }, // Nº
    { wch: 28 }, // NOMES
    // T1
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 6 },
    // T2
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 6 },
    // T3
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 5 },
    { wch: 5 },
    { wch: 6 },
    { wch: 6 },
    // MA, A
    { wch: 6 },
    { wch: 10 },
  ];

  // ── Alturas das linhas ───────────────────────────────────────
  ws["!rows"] = [
    { hpt: 30 }, // R0
    { hpt: 20 }, // R1
    { hpt: 20 }, // R2
    { hpt: 8 }, // R3
    { hpt: 20 }, // H1
    { hpt: 18 }, // H2
    { hpt: 16 }, // H3
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Ficha de Avaliação");

  // ── Guardar o ficheiro ───────────────────────────────────────
  const fileName = `Ficha_${data.subjectName}_${data.sectionName}_${data.year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─────────────────────────────────────────────────────────────────
//  Exportar funções de cálculo para usar na UI
// ─────────────────────────────────────────────────────────────────
export { approved, avg, calcMA, calcMACS, calcMAP, calcMT };

