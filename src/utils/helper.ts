// helper.ts — actualiza para ter label/value por posição
export const departmentPositions: Record<string, string[]> = {
  Administrativo: [
    "Direcção Académica",
    "Secretária Académica",
    "Arquivo e Documentação",
  ],
  Pedagógico: ["Coordenação Pedagógica", "Professor", "Bibliotecário"],
  Financeiro: ["Contabilista", "Gestor de Pagamentos"],
  Técnico: [
    "Administrador de Sistemas",
    "Suporte Informático",
    "Suporte ao Sistema Escolar",
    "Segurança Tecnológica",
  ],
};

//
export const mozambiqueData = {
  Niassa: [
    "Cuamba",
    "Lago",
    "Lichinga",
    "Majune",
    "Mandimba",
    "Marrupa",
    "Maúa",
    "Mavago",
    "Mecanhelas",
    "Mecula",
    "Metarica",
    "Muembe",
    "Ngauma",
    "Nipepe",
    "Sanga",
  ],

  CaboDelgado: [
    "Ancuabe",
    "Balama",
    "Chiúre",
    "Ibo",
    "Macomia",
    "Mecúfi",
    "Meluco",
    "Mocímboa da Praia",
    "Montepuez",
    "Mueda",
    "Muidumbe",
    "Namuno",
    "Nangade",
    "Palma",
    "Pemba",
  ],

  Nampula: [
    "Angoche",
    "Eráti",
    "Ilha de Moçambique",
    "Lalaua",
    "Malema",
    "Meconta",
    "Mecubúri",
    "Memba",
    "Mogincual",
    "Mogovolas",
    "Moma",
    "Monapo",
    "Mossuril",
    "Muecate",
    "Murrupula",
    "Nacala-a-Velha",
    "Nacarôa",
    "Nampula",
    "Rapale",
    "Ribáuè",
  ],

  Zambezia: [
    "Alto Molócuè",
    "Chinde",
    "Derre",
    "Gilé",
    "Gurué",
    "Ile",
    "Inhassunge",
    "Luabo",
    "Lugela",
    "Maganja da Costa",
    "Milange",
    "Mocuba",
    "Mopeia",
    "Morrumbala",
    "Namacurra",
    "Namarroi",
    "Nicoadala",
    "Pebane",
    "Quelimane",
  ],

  Tete: [
    "Angónia",
    "Cahora-Bassa",
    "Changara",
    "Chifunde",
    "Chiuta",
    "Dôa",
    "Macanga",
    "Magoé",
    "Marara",
    "Moatize",
    "Mutarara",
    "Tete",
    "Tsangano",
    "Zumbo",
  ],

  Manica: [
    "Bárue",
    "Chimoio",
    "Gondola",
    "Guro",
    "Macate",
    "Machaze",
    "Manica",
    "Mossurize",
    "Sussundenga",
    "Tambara",
    "Vanduzi",
  ],

  Sofala: [
    "Beira",
    "Búzi",
    "Caia",
    "Chemba",
    "Cheringoma",
    "Chibabava",
    "Dondo",
    "Gorongosa",
    "Machanga",
    "Marínguè",
    "Marromeu",
    "Muanza",
    "Nhamatanda",
  ],

  Inhambane: [
    "Funhalouro",
    "Govuro",
    "Homoíne",
    "Inhambane",
    "Inharrime",
    "Inhassoro",
    "Jangamo",
    "Mabote",
    "Massinga",
    "Maxixe",
    "Morrumbene",
    "Panda",
    "Vilankulo",
    "Zavala",
  ],

  Gaza: [
    "Bilene",
    "Chibuto",
    "Chicualacuala",
    "Chigubo",
    "Chókwè",
    "Guijá",
    "Limpopo",
    "Mabalane",
    "Manjacaze",
    "Mapai",
    "Massangena",
    "Massingir",
    "Xai-Xai",
  ],

  MaputoProvincia: [
    "Boane",
    "Magude",
    "Manhiça",
    "Marracuene",
    "Matola",
    "Matutuíne",
    "Moamba",
    "Namaacha",
  ],

  MaputoCidade: [
    "KaMpfumo",
    "Nlhamankulu",
    "KaMaxaquene",
    "KaMavota",
    "KaMubukwana",
    "KaTembe",
    "KaNyaka",
  ],
};

export type ProvinceName = keyof typeof mozambiqueData;
export type DistrictName = (typeof mozambiqueData)[ProvinceName][number];

export const provinceNameData: ProvinceName[] = [
  "Niassa",
  "CaboDelgado",
  "Nampula",
  "Zambezia",
  "Tete",
  "Manica",
  "Sofala",
  "Inhambane",
  "Gaza",
  "MaputoProvincia",
  "MaputoCidade",
];

// Bilhete de Identidade — 12 dígitos + 1 letra no final (ex: 123456789012A)
export const biRegex = /^\d{12}[A-Z]$/;

// NUIT — exactamente 9 dígitos, sem letras
export const nuitRegex = /^\d{9}$/;

export const phoneRegex = /^(84|85|86|87|83|82)\d{7}$/;

export const wageRegex = /^\d+(\.\d+)?$/;
