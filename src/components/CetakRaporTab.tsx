import { useState, useRef } from "react";
import { Student, SubjectDef, SchoolInfo } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Printer } from "lucide-react";

interface Props {
  students: Student[];
  subjects: SubjectDef[];
  classFilter?: string;
  schoolInfo: SchoolInfo;
}

export default function CetakRaporTab({ students, subjects, classFilter, schoolInfo }: Props) {
  const [selectedId, setSelectedId] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  const printDocument = () => {
    if (window.self !== window.top) {
       alert("Peringatan: Jika layar cetak tidak muncul atau kosong, buka aplikasi ini di Tab Baru (tombol pojok kanan atas) untuk mencetak rapor.");
    }
    window.print();
  };

  const filteredStudentsList = classFilter && classFilter !== "Semua" ? students.filter(s => s.class === classFilter) : students;

  const selectedStudents = selectedId === "all" ? filteredStudentsList : filteredStudentsList.filter(s => s.id === selectedId);

  const subjectsUmum = subjects.filter(s => s.type !== 'mulok');
  const subjectsMulok = subjects.filter(s => s.type === 'mulok');

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader className="flex flex-row justify-between items-center pb-4">
          <div>
            <CardTitle>Cetak Dokumen Nilai Ijazah</CardTitle>
            <CardDescription>Pilih siswa untuk dicetak satu per satu atau cetak semua sekaligus</CardDescription>
          </div>
          <Button onClick={printDocument}><Printer className="h-4 w-4 mr-2"/> Cetak Rapor (PDF/Printer)</Button>
        </CardHeader>
        <CardContent>
           <div className="max-w-md">
             <label className="text-sm font-semibold mb-2 block">Pilih Mode Cetak</label>
             <Select value={selectedId} onValueChange={setSelectedId}>
               <SelectTrigger>
                 <SelectValue placeholder="Pilih..." />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Semua Siswa {classFilter && classFilter !== "Semua" ? `di Kelas ${classFilter} ` : ''}({filteredStudentsList.length} Hal)</SelectItem>
                 {filteredStudentsList.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.nis})</SelectItem>)}
               </SelectContent>
             </Select>
           </div>
        </CardContent>
      </Card>

      {/* Area yang akan dicetak */}
      <div ref={printRef} className="print-area space-y-8">
         {selectedStudents.map(student => (
           <div key={student.id} className="bg-white print:border-none print:shadow-none border rounded-lg shadow-sm p-8 print:p-8 page-break-after-always">
              <div className="text-center mb-8 border-b-2 border-black pb-4">
                 <h2 className="text-2xl font-bold uppercase tracking-widest">Surat Keterangan Lulus</h2>
                 <p className="text-lg mt-1 font-semibold">Tahun Pelajaran {schoolInfo.tahunPelajaran || "2023/2024"}</p>
                 <p className="text-sm mt-1">Daftar Nilai Ujian Sekolah & Rapor Kelas 4 - 6</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm max-w-2xl">
                 <div className="flex"><span className="w-40 font-semibold">Nama Siswa</span><span>: {student.name}</span></div>
                 <div className="flex"><span className="w-40 font-semibold">NIS / NISN</span><span>: {student.nis} / {student.nisn}</span></div>
                 <div className="flex"><span className="w-40 font-semibold">Kelas</span><span>: {student.class}</span></div>
              </div>

              <table className="w-full text-sm border-collapse border border-slate-800 mb-8">
                 <thead>
                    <tr className="bg-slate-100 print:bg-slate-100">
                       <th className="border border-slate-800 p-2 w-12 text-center">No</th>
                       <th className="border border-slate-800 p-2 text-left">Mata Pelajaran</th>
                       <th className="border border-slate-800 p-2 w-24 text-center">Rata-Rata Rapor<br/><span className="font-normal text-[10px]">(Smt 7-12)</span></th>
                       <th className="border border-slate-800 p-2 w-24 text-center">Ujian Sekolah</th>
                       <th className="border border-slate-800 p-2 w-24 text-center">Nilai Ijazah</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td colSpan={5} className="border border-slate-800 p-2 font-bold bg-slate-50 print:bg-slate-50">Kelompok A (Umum)</td>
                    </tr>
                    {subjectsUmum.map((sub, i) => (
                      <tr key={sub.id}>
                         <td className="border border-slate-800 p-2 text-center">{i+1}</td>
                         <td className="border border-slate-800 p-2">{sub.name}</td>
                         <td className="border border-slate-800 p-2 text-center">{student.rataRapor[sub.id] ? student.rataRapor[sub.id].toFixed(2) : '-'}</td>
                         <td className="border border-slate-800 p-2 text-center">{student.ujianSekolah[sub.id] || '-'}</td>
                         <td className="border border-slate-800 p-2 text-center font-semibold">{student.nilaiAkhir[sub.id]?.toFixed(2) || '-'}</td>
                      </tr>
                    ))}
                    {subjectsMulok.length > 0 && (
                      <tr>
                         <td colSpan={5} className="border border-slate-800 p-2 font-bold bg-slate-50 print:bg-slate-50">Kelompok B (Muatan Lokal)</td>
                      </tr>
                    )}
                    {subjectsMulok.map((sub, i) => (
                      <tr key={sub.id}>
                         <td className="border border-slate-800 p-2 text-center">{i+1}</td>
                         <td className="border border-slate-800 p-2">{sub.name}</td>
                         <td className="border border-slate-800 p-2 text-center">{student.rataRapor[sub.id] ? student.rataRapor[sub.id].toFixed(2) : '-'}</td>
                         <td className="border border-slate-800 p-2 text-center">{student.ujianSekolah[sub.id] || '-'}</td>
                         <td className="border border-slate-800 p-2 text-center font-semibold">{student.nilaiAkhir[sub.id]?.toFixed(2) || '-'}</td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50 print:bg-slate-50 font-bold">
                       <td colSpan={4} className="border border-slate-800 p-2 text-right">Total Nilai</td>
                       <td className="border border-slate-800 p-2 text-center">{student.totalNilai.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-50 print:bg-slate-50 font-bold">
                       <td colSpan={4} className="border border-slate-800 p-2 text-right">Rata-Rata</td>
                       <td className="border border-slate-800 p-2 text-center">{student.rataRataAkhir.toFixed(2)}</td>
                    </tr>
                 </tbody>
              </table>

              <div className="flex justify-between mt-16 text-sm">
                 <div className="w-1/3 text-center"></div>
                 <div className="w-1/3 text-center">
                    <p>{schoolInfo.tanggalCetak}</p>
                    <p>Kepala Sekolah,</p>
                    <div className="h-24"></div>
                    <p className="font-bold border-b border-black inline-block px-4">{schoolInfo.kepalaSekolah}</p>
                    <p className="mt-1">{schoolInfo.nip}</p>
                 </div>
              </div>
           </div>
         ))}
         {selectedStudents.length === 0 && (
             <div className="text-center p-8 text-slate-500 border rounded-lg bg-white">Belum ada siswa yang dapat dicetak.</div>
         )}
      </div>

      <style>{`
        @media print {
          .page-break-after-always {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
