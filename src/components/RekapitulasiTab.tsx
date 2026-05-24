import { useMemo } from "react";
import { Student, SubjectDef, SubjectScores } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Copy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

interface Props {
  students: Student[];
  subjects: SubjectDef[];
  classFilter?: string;
}

export default function RekapitulasiTab({ students, subjects, classFilter }: Props) {
  // Sort by RataRata Akhir desc
  const rankedStudents = useMemo(() => {
    const filtered = classFilter && classFilter !== "Semua" ? students.filter(s => s.class === classFilter) : students;
    const sorted = [...filtered].sort((a, b) => b.rataRataAkhir - a.rataRataAkhir);
    return sorted.map((s, i) => ({ ...s, ranking: i + 1 }));
  }, [students, classFilter]);

  const copyForExcel = () => {
      // Build Headers
      const headers = ["Peringkat", "NIS", "NISN", "Nama", "L/P", "Kelas"];
      subjects.forEach(s => headers.push(s.name.substring(0, 5)));
      headers.push("Total", "Rata-rata");
      
      let tsv = headers.join("\t") + "\n";
      rankedStudents.forEach(s => {
          const row = [
              s.ranking, s.nis, s.nisn, s.name, s.gender, s.class,
          ];
          subjects.forEach(sub => row.push(s.nilaiAkhir[sub.id] || 0));
          row.push(s.totalNilai, s.rataRataAkhir);
          tsv += row.join("\t") + "\n";
      });
      navigator.clipboard.writeText(tsv);
      toast.success("Disalin ke clipboard. Bisa di-paste langsung ke Excel.");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <div>
          <CardTitle>Rekapitulasi Nilai Akhir (Ijazah)</CardTitle>
          <CardDescription>Menampilkan peringkat berdasarkan rata-rata ijazah</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={copyForExcel}><Copy className="w-4 h-4 mr-2"/> Copy tabel</Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-x-auto">
          <Table className="text-xs text-slate-600">
            <TableHeader className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider sticky top-0">
              <TableRow className="border-b">
                <TableHead className="w-[50px] p-4 text-center border-r" rowSpan={2}>Rank</TableHead>
                <TableHead className="w-[80px] p-4 border-r" rowSpan={2}>NIS/NISN</TableHead>
                <TableHead className="min-w-[150px] p-4 border-r" rowSpan={2}>Nama Siswa</TableHead>
                <TableHead className="w-[40px] p-4 text-center border-r" rowSpan={2}>L/P</TableHead>
                <TableHead className="text-center p-2 border-b" colSpan={subjects.length}>Nilai Akhir Tiap Mata Pelajaran</TableHead>
                <TableHead className="text-right p-4 border-l" rowSpan={2}>Total</TableHead>
                <TableHead className="text-right p-4 font-bold" rowSpan={2}>Rata-rata</TableHead>
              </TableRow>
              <TableRow className="border-b bg-slate-50/80">
                {subjects.map(s => (
                  <TableHead key={s.id} className="text-center p-2 whitespace-nowrap">{s.id.substring(0,3).toUpperCase()}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {rankedStudents.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50 border-b">
                  <TableCell className="text-center font-bold bg-indigo-50/30 border-r p-4 text-indigo-700">{s.ranking}</TableCell>
                  <TableCell className="p-4 border-r text-[10px] text-slate-500 font-mono">{s.nis}<br/>{s.nisn}</TableCell>
                  <TableCell className="font-semibold text-slate-800 p-4 border-r">{s.name}</TableCell>
                  <TableCell className="text-center p-4 border-r">{s.gender}</TableCell>
                  {subjects.map(sub => (
                    <TableCell key={sub.id} className="text-center p-2">
                       {s.nilaiAkhir[sub.id]?.toFixed(1) || '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right p-4 border-l font-medium">{s.totalNilai.toFixed(1)}</TableCell>
                  <TableCell className="text-right p-4 font-bold text-indigo-600 bg-indigo-50/50">{s.rataRataAkhir.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {rankedStudents.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={16} className="text-center py-6 text-slate-500">Tidak ada data siswa.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
