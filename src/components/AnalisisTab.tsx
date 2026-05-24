import { useMemo, useState } from "react";
import { Student, SubjectDef } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  students: Student[];
  subjects: SubjectDef[];
  classFilter?: string;
}

export default function AnalisisTab({ students, subjects, classFilter }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  const filteredStudents = useMemo(() => {
    return classFilter && classFilter !== "Semua" ? students.filter(s => s.class === classFilter) : students;
  }, [students, classFilter]);

  const progressData = useMemo(() => {
    if (selectedStudentId === "all") {
       // Average of all students
       if (filteredStudents.length === 0) return [];
       const sums = { smt7: 0, smt8: 0, smt9: 0, smt10: 0, smt11: 0, smt12: 0 };
       let count = 0;
       filteredStudents.forEach(s => {
           if (s.progressSmt.smt7 > 0 || s.progressSmt.smt8 > 0) {
               sums.smt7 += s.progressSmt.smt7 || 0;
               sums.smt8 += s.progressSmt.smt8 || 0;
               sums.smt9 += s.progressSmt.smt9 || 0;
               sums.smt10 += s.progressSmt.smt10 || 0;
               sums.smt11 += s.progressSmt.smt11 || 0;
               sums.smt12 += s.progressSmt.smt12 || 0;
               count++;
           }
       });
       if (count === 0) return [];
       return [
         { name: 'Kls 4 Smt 1', nilai: Number((sums.smt7 / count).toFixed(2)) },
         { name: 'Kls 4 Smt 2', nilai: Number((sums.smt8 / count).toFixed(2)) },
         { name: 'Kls 5 Smt 1', nilai: Number((sums.smt9 / count).toFixed(2)) },
         { name: 'Kls 5 Smt 2', nilai: Number((sums.smt10 / count).toFixed(2)) },
         { name: 'Kls 6 Smt 1', nilai: Number((sums.smt11 / count).toFixed(2)) },
         { name: 'Kls 6 Smt 2', nilai: Number((sums.smt12 / count).toFixed(2)) },
       ];
    } else {
       const student = students.find(s => s.id === selectedStudentId); // Find from all students in case selected stays but class changes
       if (!student) return [];
       return [
        { name: 'Kls 4 Smt 1', nilai: student.progressSmt.smt7 || 0 },
        { name: 'Kls 4 Smt 2', nilai: student.progressSmt.smt8 || 0 },
        { name: 'Kls 5 Smt 1', nilai: student.progressSmt.smt9 || 0 },
        { name: 'Kls 5 Smt 2', nilai: student.progressSmt.smt10 },
        { name: 'Kls 6 Smt 1', nilai: student.progressSmt.smt11 },
        { name: 'Kls 6 Smt 2', nilai: student.progressSmt.smt12 },
      ];
    }
  }, [filteredStudents, selectedStudentId, students]);

  const rankingDistribution = useMemo(() => {
    // Let's make a histogram of rata-rata akhir
    const bins = { '90-100': 0, '80-89': 0, '70-79': 0, '< 70': 0 };
    filteredStudents.forEach(s => {
        if (s.rataRataAkhir >= 90) bins['90-100']++;
        else if (s.rataRataAkhir >= 80) bins['80-89']++;
        else if (s.rataRataAkhir >= 70) bins['70-79']++;
        else if (s.totalNilai > 0) bins['< 70']++; // Only count if there's actual score
    });
    return Object.keys(bins).map(key => ({ range: key, jumlah: bins[key as keyof typeof bins] }));
  }, [filteredStudents]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                 <CardTitle>Grafik Perkembangan Nilai Rata-Rata (Smt 7-12)</CardTitle>
                 <CardDescription>Tren nilai rapor per semester dari kelas 4 semester 1 hingga kelas 6</CardDescription>
              </div>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Rata-rata Kelas</SelectItem>
                  {filteredStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
          </CardHeader>
          <CardContent className="h-[350px]">
              {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} style={{ fontSize: '12px' }}/>
                      <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} style={{ fontSize: '12px' }}/>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                      <Legend />
                      <Line type="monotone" dataKey="nilai" name="Nilai Rata-rata" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">Belum ada data perkembangan nilai</div>
              )}
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Distribusi Nilai Akhir</CardTitle>
              <CardDescription>Persebaran kelompok rentang rata-rata nilai ijazah kelas</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingDistribution} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tickMargin={10} style={{ fontSize: '12px' }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{stepSize: 1}} style={{ fontSize: '12px' }}/>
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="jumlah" name="Jumlah Siswa" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Ringkasan Kelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-500">Total Siswa</span>
                  <span className="font-bold text-lg text-slate-800">{filteredStudents.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-500">Laki-laki (L)</span>
                  <span className="font-medium text-slate-800">{filteredStudents.filter(s=>s.gender==='L').length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-500">Perempuan (P)</span>
                  <span className="font-medium text-slate-800">{filteredStudents.filter(s=>s.gender==='P').length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-500">Rata-rata Kelas</span>
                  <span className="font-bold text-xl text-indigo-600">
                      {(filteredStudents.reduce((acc, s) => acc + s.rataRataAkhir, 0) / (filteredStudents.filter(s => s.rataRataAkhir > 0).length || 1)).toFixed(2)}
                  </span>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
