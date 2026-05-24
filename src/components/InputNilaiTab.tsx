import { useState, useMemo } from "react";
import { Student, SubjectDef, SubjectScores } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

interface Props {
  students: Student[];
  subjects: SubjectDef[];
  onChange: (students: Student[]) => void;
  classFilter?: string;
}

export default function InputNilaiTab({ students, subjects, onChange, classFilter }: Props) {
  const filteredStudents = classFilter && classFilter !== "Semua" 
     ? students.filter(s => s.class === classFilter) 
     : students;

  const [selectedId, setSelectedId] = useState<string>("");
  const selectedStudent = useMemo(() => filteredStudents.find(s => s.id === selectedId), [filteredStudents, selectedId]);

  const updateStudentData = (
    updater: (s: Student) => void
  ) => {
    if (!selectedStudent) return;
    
    const updated = students.map(s => {
      if (s.id === selectedId) {
        const newObj = JSON.parse(JSON.stringify(s)) as Student; // Deep copy to handle nested objects easily
        updater(newObj);
        
        // Recalculate rata-rata rapor per mapel
        newObj.rataRapor = newObj.rataRapor || {};
        newObj.progressSmt = newObj.progressSmt || { smt7: 0, smt8: 0, smt9: 0, smt10: 0, smt11: 0, smt12: 0 };
        
        let totalProgress = { smt7: 0, smt8: 0, smt9: 0, smt10: 0, smt11: 0, smt12: 0 };
        let subjectCount = subjects.length;

        subjects.forEach(sub => {
           const subId = sub.id;
           let total = 0;
           total += (newObj.nilaiSemester?.smt7?.[subId] || 0);
           total += (newObj.nilaiSemester?.smt8?.[subId] || 0);
           total += (newObj.nilaiSemester?.smt9?.[subId] || 0);
           total += (newObj.nilaiSemester?.smt10?.[subId] || 0);
           total += (newObj.nilaiSemester?.smt11?.[subId] || 0);
           total += (newObj.nilaiSemester?.smt12?.[subId] || 0);
           newObj.rataRapor[subId] = total / 6;

           // Auto calculate nilai akhir
           newObj.nilaiAkhir = newObj.nilaiAkhir || {};
           newObj.nilaiAkhir[subId] = (newObj.rataRapor[subId] * 0.6) + ((newObj.ujianSekolah?.[subId] || 0) * 0.4);

           // Sum up for progress chart
           totalProgress.smt7 += (newObj.nilaiSemester?.smt7?.[subId] || 0);
           totalProgress.smt8 += (newObj.nilaiSemester?.smt8?.[subId] || 0);
           totalProgress.smt9 += (newObj.nilaiSemester?.smt9?.[subId] || 0);
           totalProgress.smt10 += (newObj.nilaiSemester?.smt10?.[subId] || 0);
           totalProgress.smt11 += (newObj.nilaiSemester?.smt11?.[subId] || 0);
           totalProgress.smt12 += (newObj.nilaiSemester?.smt12?.[subId] || 0);
        });

        // Recalculate progressSmt (rata-rata per semester across all subjects)
        if (subjectCount > 0) {
           newObj.progressSmt.smt7 = Number((totalProgress.smt7 / subjectCount).toFixed(2));
           newObj.progressSmt.smt8 = Number((totalProgress.smt8 / subjectCount).toFixed(2));
           newObj.progressSmt.smt9 = Number((totalProgress.smt9 / subjectCount).toFixed(2));
           newObj.progressSmt.smt10 = Number((totalProgress.smt10 / subjectCount).toFixed(2));
           newObj.progressSmt.smt11 = Number((totalProgress.smt11 / subjectCount).toFixed(2));
           newObj.progressSmt.smt12 = Number((totalProgress.smt12 / subjectCount).toFixed(2));
        }
        
        // Recalculate totals
        newObj.totalNilai = Object.values(newObj.nilaiAkhir).reduce((a, b) => a + b, 0);
        newObj.rataRataAkhir = subjectCount > 0 ? newObj.totalNilai / subjectCount : 0;
        
        return newObj;
      }
      return s;
    });
    
    onChange(updated);
  };

  const updateSemesterScore = (smt: keyof Student['nilaiSemester'], subject: string, value: string) => {
     updateStudentData((s) => {
         s.nilaiSemester = s.nilaiSemester || { smt7: {}, smt8: {}, smt9: {}, smt10: {}, smt11: {}, smt12: {} };
         s.nilaiSemester[smt] = s.nilaiSemester[smt] || {};
         s.nilaiSemester[smt][subject] = parseFloat(value) || 0;
     });
  };

  const updateUsScore = (subject: string, value: string) => {
     updateStudentData((s) => {
         s.ujianSekolah = s.ujianSekolah || {};
         s.ujianSekolah[subject] = parseFloat(value) || 0;
     });
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pilih Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Siswa..." />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.nis})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStudent && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm space-y-2 border">
                <p><span className="font-semibold w-16 inline-block text-slate-500">Nama:</span> <span className="font-bold">{selectedStudent.name}</span></p>
                <p><span className="font-semibold w-16 inline-block text-slate-500">Kelas:</span> {selectedStudent.class}</p>
                <p><span className="font-semibold w-16 inline-block text-slate-500">NISN:</span> {selectedStudent.nisn}</p>

                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Rekapitulasi</p>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Nilai Ijazah</span>
                            <span className="font-bold">{selectedStudent.totalNilai?.toFixed(1) || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Rata-Rata Akhir</span>
                            <span className="font-bold text-indigo-600">{selectedStudent.rataRataAkhir?.toFixed(2) || '0'}</span>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Input Nilai: {selectedStudent?.name || "Belum dipilih"}</CardTitle>
            <Button size="sm" onClick={() => onChange([...students])}><Save className="h-4 w-4 mr-2"/> Simpan ke Sheet</Button>
          </CardHeader>
          <CardContent>
             {!selectedStudent ? (
                 <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg">Silakan pilih siswa di sebelah kiri</div>
             ) : (
                <Tabs defaultValue="smt7">
                    <TabsList className="grid w-full grid-cols-7 mb-4">
                        <TabsTrigger value="smt7">4 Smt 1</TabsTrigger>
                        <TabsTrigger value="smt8">4 Smt 2</TabsTrigger>
                        <TabsTrigger value="smt9">5 Smt 1</TabsTrigger>
                        <TabsTrigger value="smt10">5 Smt 2</TabsTrigger>
                        <TabsTrigger value="smt11">6 Smt 1</TabsTrigger>
                        <TabsTrigger value="smt12">6 Smt 2</TabsTrigger>
                        <TabsTrigger value="us">US</TabsTrigger>
                    </TabsList>

                    {["smt7", "smt8", "smt9", "smt10", "smt11", "smt12"].map((smtStr) => {
                        const smt = smtStr as keyof Student['nilaiSemester'];
                        const num = parseInt(smt.replace('smt',''));
                        const kls = Math.floor((num + 1) / 2);
                        const sem = num % 2 !== 0 ? 1 : 2;
                        return (
                        <TabsContent key={smt} value={smt}>
                            <Card className="border shadow-none">
                                <CardHeader className="bg-slate-50 border-b pb-3">
                                    <CardTitle className="text-sm">Nilai Rapor Kelas {kls} Semester {sem}</CardTitle>
                                    <CardDescription>Masukkan nilai mata pelajaran untuk semester ini</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead className="w-12 text-center">No</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="w-32 text-center">Nilai</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((sub, i) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="text-center font-mono">{i+1}</TableCell>
                                                <TableCell className="font-medium text-slate-800">{sub.name}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" className="text-center"
                                                        value={selectedStudent.nilaiSemester?.[smt]?.[sub.id] || ''}
                                                        onChange={(e) => updateSemesterScore(smt, sub.id, e.target.value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )})}

                    <TabsContent value="us">
                        <Card className="border shadow-none">
                            <CardHeader className="bg-slate-50 border-b pb-3">
                                <CardTitle className="text-sm">Nilai Ujian Sekolah & Kalkulasi Ijazah</CardTitle>
                                <CardDescription>Masukkan nilai US. Rata-rata rapor dan Nilai Ijazah dihitung otomatis (Rapor 60%, US 40%).</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead className="w-12 text-center">No</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="w-32 text-center bg-slate-50/50">Rata-Rata Rapor</TableHead>
                                        <TableHead className="w-32 text-center">Ujian Sekolah</TableHead>
                                        <TableHead className="w-32 text-center bg-indigo-50/50">Nilai Akhir</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((sub, i) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="text-center font-mono">{i+1}</TableCell>
                                                <TableCell className="font-medium text-slate-800 whitespace-nowrap">{sub.name}</TableCell>
                                                <TableCell className="text-center bg-slate-50/50">
                                                    {selectedStudent.rataRapor?.[sub.id]?.toFixed(2) || '0.00'}
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" className="text-center h-8"
                                                        value={selectedStudent.ujianSekolah?.[sub.id] || ''}
                                                        onChange={(e) => updateUsScore(sub.id, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-indigo-700 bg-indigo-50/50">
                                                    {selectedStudent.nilaiAkhir?.[sub.id]?.toFixed(1) || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t-2">
                                            <TableCell colSpan={4} className="text-right font-bold py-3 pr-4">Total & Rata-rata Ijazah</TableCell>
                                            <TableCell className="bg-indigo-600 text-white font-bold text-center">
                                                {selectedStudent.rataRataAkhir?.toFixed(2) || '0'}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

