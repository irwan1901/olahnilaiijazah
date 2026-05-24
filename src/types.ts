export type SubjectScores = Record<string, number>;

export interface SubjectDef {
  id: string;
  name: string;
  type?: 'umum' | 'mulok';
}

export interface SchoolInfo {
  kepalaSekolah: string;
  nip: string;
  tanggalCetak: string;
  tahunPelajaran: string;
}

export interface Student {
  id: string; // row index or unique id
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  class: string;
  
  nilaiSemester: {
    smt7: SubjectScores;
    smt8: SubjectScores;
    smt9: SubjectScores;
    smt10: SubjectScores;
    smt11: SubjectScores;
    smt12: SubjectScores;
  };
  rataRapor: SubjectScores;
  ujianSekolah: SubjectScores;
  nilaiAkhir: SubjectScores;
  
  totalNilai: number;
  rataRataAkhir: number;
  ranking?: number;

  progressSmt: {
    smt7: number;
    smt8: number;
    smt9: number;
    smt10: number;
    smt11: number;
    smt12: number;
  }
}

export const DEFAULT_SUBJECTS: SubjectDef[] = [
  { id: 'pai', name: 'Pend. Agama & Budi Pekerti', type: 'umum' },
  { id: 'pkn', name: 'Pend. Pancasila & Kewarganegaraan', type: 'umum' },
  { id: 'bi', name: 'Bahasa Indonesia', type: 'umum' },
  { id: 'mtk', name: 'Matematika', type: 'umum' },
  { id: 'ipa', name: 'Ilmu Pengetahuan Alam', type: 'umum' },
  { id: 'ips', name: 'Ilmu Pengetahuan Sosial', type: 'umum' },
  { id: 'sbdp', name: 'Seni Budaya dan Prakarya', type: 'umum' },
  { id: 'pjok', name: 'Pend. Jasmani, Olahraga & Kesehatan', type: 'umum' },
  { id: 'bsunda', name: 'Bahasa Sunda', type: 'mulok' },
];
