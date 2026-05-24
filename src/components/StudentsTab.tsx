import * as React from "react";
import { useState } from "react";
import { Student, SubjectDef } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Upload, Plus, Trash2, Download } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";

interface Props {
  students: Student[];
  subjects: SubjectDef[];
  onChange: (students: Student[]) => void;
  classFilter: string;
}

export default function StudentsTab({ students, subjects, onChange, classFilter }: Props) {
  const [newSiswa, setNewSiswa] = useState({ name: "", nis: "", nisn: "", gender: "L" as "L"|"P", class: "6A" });

  const defaultScores = () => {
      const s: Record<string, number> = {};
      subjects.forEach(sub => s[sub.id] = 0);
      return s;
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const imported = results.data.filter((r: any) => r.Nama || r.name).map((r: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: r.Nama || r.name || '',
            nis: r.NIS || r.nis || '',
            nisn: r.NISN || r.nisn || '',
            gender: (r.L_P || r.Gender || r.JK || 'L').toUpperCase(),
            class: r.Kelas || r.class || newSiswa.class,
            rataRapor: defaultScores(),
            ujianSekolah: defaultScores(),
            nilaiAkhir: defaultScores(),
            nilaiSemester: {
              smt8: defaultScores(),
              smt9: defaultScores(),
              smt10: defaultScores(),
              smt11: defaultScores(),
              smt12: defaultScores()
            },
            totalNilai: 0,
            rataRataAkhir: 0,
            progressSmt: { smt8: 0, smt9: 0, smt10: 0, smt11: 0, smt12: 0 }
          } as Student));
          onChange([...students, ...imported]);
        }
      });
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Nama", "NIS", "NISN", "L_P", "Kelas"],
      ["Andi Saputra", "1001", "0123456789", "L", "6A"],
      ["Budi Santoso", "1002", "0123456790", "L", "6A"],
      ["Citra Kirana", "1003", "0123456791", "P", "6B"],
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + templateData.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_siswa.csv");
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
  };

  const addSiswa = () => {
    if (!newSiswa.name.trim()) {
      toast.error("Nama siswa tidak boleh kosong.");
      return;
    }
    const s: Student = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      ...newSiswa,
      rataRapor: defaultScores(),
      ujianSekolah: defaultScores(),
      nilaiAkhir: defaultScores(),
      nilaiSemester: {
        smt8: defaultScores(),
        smt9: defaultScores(),
        smt10: defaultScores(),
        smt11: defaultScores(),
        smt12: defaultScores()
      },
      totalNilai: 0,
      rataRataAkhir: 0,
      progressSmt: { smt8: 0, smt9: 0, smt10: 0, smt11: 0, smt12: 0 }
    };
    onChange([...students, s]);
    setNewSiswa({ ...newSiswa, name: "", nis: "", nisn: "" });
    toast.success("Siswa berhasil ditambahkan.");
  };

  const removeSiswa = (id: string) => {
    onChange(students.filter(s => s.id !== id));
  };

  const filteredStudents = React.useMemo(() => {
    const filtered = classFilter === "Semua" ? students : students.filter(s => s.class === classFilter);
    const sorted = [...filtered].sort((a, b) => b.rataRataAkhir - a.rataRataAkhir);
    const rankMap = new Map();
    sorted.forEach((s, i) => rankMap.set(s.id, i + 1));
    return filtered.map(s => ({...s, ranking: rankMap.get(s.id)}));
  }, [students, classFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Data Siswa</CardTitle>
            <CardDescription>Kelola data siswa kelas 6 atau import dari file CSV</CardDescription>
          </div>
          <div>
            <Button variant="outline" className="mr-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Download Template CSV
            </Button>
            <Input type="file" accept=".csv" className="hidden" id="import-csv" onChange={handleImport} />
            <Button variant="outline" onClick={() => document.getElementById('import-csv')?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Import CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2 mb-6 items-end" onSubmit={(e) => { e.preventDefault(); addSiswa(); }}>
            <div className="grid gap-1 flex-1">
              <label className="text-xs font-semibold">Nama</label>
              <Input value={newSiswa.name} onChange={e => setNewSiswa({...newSiswa, name: e.target.value})} placeholder="Nama Siswa" />
            </div>
            <div className="grid gap-1 w-24">
              <label className="text-xs font-semibold">NIS</label>
              <Input value={newSiswa.nis} onChange={e => setNewSiswa({...newSiswa, nis: e.target.value})} />
            </div>
            <div className="grid gap-1 w-24">
              <label className="text-xs font-semibold">NISN</label>
              <Input value={newSiswa.nisn} onChange={e => setNewSiswa({...newSiswa, nisn: e.target.value})} />
            </div>
            <div className="grid gap-1 w-16">
              <label className="text-xs font-semibold">L/P</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={newSiswa.gender} onChange={e => setNewSiswa({...newSiswa, gender: e.target.value as "L"|"P"})}>
                <option value="L">L</option><option value="P">P</option>
              </select>
            </div>
            <div className="grid gap-1 w-16">
              <label className="text-xs font-semibold">Kelas</label>
              <Input value={newSiswa.class} onChange={e => setNewSiswa({...newSiswa, class: e.target.value})} />
            </div>
            <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
          </form>

          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider sticky top-0">
                <TableRow className="border-b">
                  <TableHead className="p-4 w-12">No</TableHead>
                  <TableHead className="p-4">NIS/NISN</TableHead>
                  <TableHead className="p-4">Nama</TableHead>
                  <TableHead className="p-4">L/P</TableHead>
                  <TableHead className="p-4">Kelas</TableHead>
                  <TableHead className="p-4 text-center">Peringkat</TableHead>
                  <TableHead className="p-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm text-slate-600">
                {filteredStudents.map((s, i) => (
                  <TableRow key={s.id} className="border-b hover:bg-slate-50">
                    <TableCell className="p-4 font-mono">{i + 1}</TableCell>
                    <TableCell className="p-4">{s.nis} / {s.nisn}</TableCell>
                    <TableCell className="font-semibold text-slate-800 p-4">{s.name}</TableCell>
                    <TableCell className="p-4">{s.gender}</TableCell>
                    <TableCell className="p-4">{s.class}</TableCell>
                    <TableCell className="p-4 text-center font-bold text-indigo-600">{s.rataRataAkhir > 0 ? s.ranking : '-'}</TableCell>
                    <TableCell className="p-4 text-right">
                      <AlertDialog>
                         <AlertDialogTrigger render={
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         } />
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Hapus Siswa</AlertDialogTitle>
                             <AlertDialogDescription>
                               Apakah Anda yakin ingin menghapus {s.name} ({s.nisn})? Semua data nilai siswa ini akan terhapus.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel variant="outline" size="default">Batal</AlertDialogCancel>
                             <AlertDialogAction onClick={() => removeSiswa(s.id)} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus</AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                      Belum ada data siswa. Silahkan tambah manual atau import dari CSV.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
             <CardTitle className="text-sm">Panduan Format CSV</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
             <p>File CSV harus memiliki header kolom berikut:</p>
             <code className="bg-slate-100 p-2 block rounded">Nama, NIS, NISN, L_P, Kelas</code>
             <p>Gunakan koma (,) sebagai pemisah. Baris pertama harus berisi judul kolom tersebut.</p>
          </CardContent>
      </Card>
    </div>
  );
}
