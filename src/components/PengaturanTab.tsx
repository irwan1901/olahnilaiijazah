import { useState } from "react";
import { SubjectDef, SchoolInfo } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";

interface Props {
  subjects: SubjectDef[];
  onChange: (subjects: SubjectDef[]) => void;
  schoolInfo: SchoolInfo;
  onSchoolInfoChange: (info: SchoolInfo) => void;
}

export default function PengaturanTab({ subjects, onChange, schoolInfo, onSchoolInfoChange }: Props) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"umum" | "mulok">("umum");

  const handleAdd = () => {
    if (!newId || !newName) return;
    const formattedId = newId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (subjects.find(s => s.id === formattedId)) {
        alert("ID Mata Pelajaran sudah ada!");
        return;
    }
    onChange([...subjects, { id: formattedId, name: newName, type: newType }]);
    setNewId("");
    setNewName("");
    setNewType("umum");
  };

  const handleRemove = (id: string) => {
      onChange(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Identitas Sekolah</CardTitle>
          <CardDescription>Atur nama kepala sekolah, NIP, dan tanggal cetak rapor</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold">Nama Kepala Sekolah</label>
                <Input value={schoolInfo.kepalaSekolah} onChange={e => onSchoolInfoChange({...schoolInfo, kepalaSekolah: e.target.value})} placeholder="Nama Kepala Sekolah, M.Pd." />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold">NIP Kepala Sekolah</label>
                <Input value={schoolInfo.nip} onChange={e => onSchoolInfoChange({...schoolInfo, nip: e.target.value})} placeholder="NIP. 1970XXXXXXXXXX" />
              </div>
              <div className="grid gap-2 md:col-span-1">
                <label className="text-xs font-semibold">Tahun Pelajaran</label>
                <Input value={schoolInfo.tahunPelajaran} onChange={e => onSchoolInfoChange({...schoolInfo, tahunPelajaran: e.target.value})} placeholder="2023/2024" />
              </div>
              <div className="grid gap-2 md:col-span-1">
                <label className="text-xs font-semibold">Tanggal Cetak Dokumen</label>
                <Input value={schoolInfo.tanggalCetak} onChange={e => onSchoolInfoChange({...schoolInfo, tanggalCetak: e.target.value})} placeholder="Jakarta, 15 Juni 2024" />
              </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Mata Pelajaran</CardTitle>
          <CardDescription>Sesuaikan mata pelajaran dengan kurikulum yang digunakan di sekolah Anda</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap">
              <div className="grid gap-1 flex-1 min-w-[200px]">
                <label className="text-xs font-semibold">Nama Mapel Lengkap</label>
                <Input placeholder="Contoh: Pendidikan Pancasila" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="grid gap-1 w-24">
                <label className="text-xs font-semibold">Tipe</label>
                <Select value={newType} onValueChange={(v: "umum" | "mulok") => setNewType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum">Umum</SelectItem>
                    <SelectItem value="mulok">Mulok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1 w-24">
                <label className="text-xs font-semibold">Singkatan (ID)</label>
                <Input placeholder="pkn" value={newId} onChange={e => setNewId(e.target.value)} />
              </div>
              <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2"/> Tambah</Button>
           </div>

           <div className="border rounded-md">
              <Table>
                 <TableHeader className="bg-slate-50">
                    <TableRow>
                       <TableHead className="w-16">No</TableHead>
                       <TableHead>Mata Pelajaran</TableHead>
                       <TableHead className="w-24 text-center">Tipe</TableHead>
                       <TableHead className="w-32">Singkatan (ID)</TableHead>
                       <TableHead className="text-right w-24">Aksi</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {subjects.map((s, i) => (
                        <TableRow key={s.id}>
                            <TableCell className="font-mono text-xs">{i+1}</TableCell>
                            <TableCell className="font-semibold">{s.name}</TableCell>
                            <TableCell className="text-center">
                               {s.type === 'mulok' ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Mulok</span> : <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Umum</span>}
                            </TableCell>
                            <TableCell>
                               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{s.id}</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                   <AlertDialogTrigger render={
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                                          <Trash2 className="w-4 h-4"/>
                                      </Button>
                                   } />
                                   <AlertDialogContent>
                                     <AlertDialogHeader>
                                       <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
                                       <AlertDialogDescription>
                                         Apakah Anda yakin ingin menghapus {s.name}? Data ini mungkin digunakan pada penilaian siswa.
                                       </AlertDialogDescription>
                                     </AlertDialogHeader>
                                     <AlertDialogFooter>
                                       <AlertDialogCancel variant="outline" size="default">Batal</AlertDialogCancel>
                                       <AlertDialogAction onClick={() => handleRemove(s.id)} className="bg-red-600 hover:bg-red-700 text-white">Ya, Hapus</AlertDialogAction>
                                     </AlertDialogFooter>
                                   </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
