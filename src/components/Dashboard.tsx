import { useState, useEffect, useRef, useCallback } from "react";
import { User } from "firebase/auth";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { LogOut, GraduationCap, Link2Off, RefreshCw } from "lucide-react";
import { Student, SubjectDef, DEFAULT_SUBJECTS, SchoolInfo } from "../types";
import { fetchFromAppsScript, saveToAppsScript } from "../lib/sheets";
import { toast } from "sonner";
import StudentsTab from "./StudentsTab";
import InputNilaiTab from "./InputNilaiTab";
import RekapitulasiTab from "./RekapitulasiTab";
import AnalisisTab from "./AnalisisTab";
import CetakRaporTab from "./CetakRaporTab";
import PengaturanTab from "./PengaturanTab";
import { debounce } from "lodash";

interface DashboardProps {
  sheetId: string;
  onDisconnect: () => void;
  onSignOut: () => void;
  user: User | null;
}

export default function Dashboard({ sheetId, onDisconnect, onSignOut, user }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<SubjectDef[]>(DEFAULT_SUBJECTS);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    kepalaSekolah: "Nama Kepala Sekolah, M.Pd.",
    nip: "1970XXXXXXXXXX",
    tanggalCetak: "Jakarta, 15 Juni 2024",
    tahunPelajaran: "2023/2024"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAppsScriptData = async () => {
    setIsLoading(true);
    try {
      if (sheetId.startsWith('local-')) {
          const lS = localStorage.getItem(`students-${sheetId}`);
          if (lS) setStudents(JSON.parse(lS));
          const lSub = localStorage.getItem(`subjects-${sheetId}`);
          if (lSub) setSubjects(JSON.parse(lSub));
          const lInfo = localStorage.getItem(`schoolInfo-${sheetId}`);
          if (lInfo) setSchoolInfo(JSON.parse(lInfo));
          return;
      }

      const data = await fetchFromAppsScript(sheetId);
      if (data.students) setStudents(data.students);
      if (data.subjects) setSubjects(data.subjects);
      if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat data dari Apps Script: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sheetId) fetchAppsScriptData();
  }, [sheetId]);

  const debouncedSaveStudents = useRef(
    debounce(async (url: string, st: Student[]) => {
      setIsSaving(true);
      try {
        if (url.startsWith('local-')) {
            localStorage.setItem(`students-${url}`, JSON.stringify(st));
            return;
        }
        await saveToAppsScript(url, { action: 'save_students', students: st });
      } catch (err: any) {
        toast.error("Gagal menyimpan otomatis: " + err.message);
      } finally {
        setIsSaving(false);
      }
    }, 2000)
  ).current;

  const debouncedSaveSubjects = useRef(
    debounce(async (url: string, sub: SubjectDef[]) => {
      setIsSaving(true);
      try {
        if (url.startsWith('local-')) {
            localStorage.setItem(`subjects-${url}`, JSON.stringify(sub));
            return;
        }
        await saveToAppsScript(url, { action: 'save_subjects', subjects: sub });
      } catch (err: any) {
        toast.error("Gagal menyimpan otomatis: " + err.message);
      } finally {
        setIsSaving(false);
      }
    }, 2000)
  ).current;

  const debouncedSaveSchoolInfo = useRef(
    debounce(async (url: string, info: SchoolInfo) => {
      setIsSaving(true);
      try {
        if (url.startsWith('local-')) {
            localStorage.setItem(`schoolInfo-${url}`, JSON.stringify(info));
            return;
        }
        await saveToAppsScript(url, { action: 'save_schoolInfo', schoolInfo: info });
      } catch (err: any) {
        toast.error("Gagal menyimpan otomatis: " + err.message);
      } finally {
        setIsSaving(false);
      }
    }, 2000)
  ).current;

  const handleStudentsChange = useCallback((newStudents: Student[]) => {
      setStudents(newStudents);
      localStorage.setItem(`students-${sheetId}`, JSON.stringify(newStudents));
      debouncedSaveStudents(sheetId, newStudents);
  }, [sheetId, debouncedSaveStudents]);

  const handleSubjectsChange = useCallback((newSubjects: SubjectDef[]) => {
      setSubjects(newSubjects);
      localStorage.setItem(`subjects-${sheetId}`, JSON.stringify(newSubjects));
      debouncedSaveSubjects(sheetId, newSubjects);
  }, [sheetId, debouncedSaveSubjects]);

  const handleSchoolInfoChange = useCallback((newInfo: SchoolInfo) => {
      setSchoolInfo(newInfo);
      localStorage.setItem(`schoolInfo-${sheetId}`, JSON.stringify(newInfo));
      debouncedSaveSchoolInfo(sheetId, newInfo);
  }, [sheetId, debouncedSaveSchoolInfo]);

  const [classFilter, setClassFilter] = useState<string>("Semua");

  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).filter(Boolean).sort();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-slate-100 rounded border text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">Aplikasi Ijazah</div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <span className="hidden sm:inline">Pangkalan Data Kelas 6</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={classFilter} 
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 rounded border-slate-300 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="Semua">Semua Kelas</option>
            {uniqueClasses.map(c => (
              <option key={c} value={c}>Kelas {c}</option>
            ))}
          </select>
          <span className="text-xs font-medium text-slate-400">
             {isSaving ? "Menyimpan perubahan..." : "Semua perubahan tersimpan"}
          </span>
          <Button variant="outline" size="sm" onClick={fetchAppsScriptData} disabled={isLoading} className="border-slate-300 text-slate-600 font-medium rounded shadow-sm text-xs h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <div className="text-xs font-mono text-slate-500 hidden md:block truncate max-w-[150px] bg-slate-50 border px-2 py-1.5 rounded">
             {sheetId.startsWith('local-') ? 'Mode Lokal' : sheetId}
          </div>
          <Button variant="ghost" size="sm" onClick={onDisconnect} title="Putuskan koneksi Apps Script" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500">
            <Link2Off className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-sm hidden sm:flex">G</div>
             <div className="text-sm hidden lg:block">
                <div className="font-semibold text-slate-700 leading-tight">Guru Kelas 6</div>
                <div className="text-[10px] text-emerald-600 font-medium lowercase">@online</div>
             </div>
          </div>
          <AlertDialog>
             <AlertDialogTrigger render={
               <Button variant="ghost" size="sm" className="h-9 w-9 sm:w-auto p-0 sm:px-3 text-slate-500 hover:bg-slate-100">
                 <LogOut className="h-4 w-4 sm:mr-2" />
                 <span className="hidden sm:inline text-xs font-medium">Keluar</span>
               </Button>
             } />
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                 <AlertDialogDescription>
                   Apakah Anda yakin ingin keluar dari aplikasi?
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel variant="outline" size="default">Batal</AlertDialogCancel>
                 <AlertDialogAction onClick={onSignOut} className="bg-red-600 hover:bg-red-700 text-white">Ya, Keluar</AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex-1 w-full bg-slate-50 overflow-x-hidden p-6 max-w-none print:p-0 print:overflow-visible print:bg-white">
        <Tabs defaultValue="siswa" className="max-w-[1200px] mx-auto w-full gap-6 flex flex-col">
          <TabsList className="bg-transparent space-x-2 h-auto p-0 max-w-full overflow-x-auto justify-start border-b border-transparent shadow-none w-full hidden sm:flex px-1 pb-2 print:hidden">
            <TabsTrigger value="siswa" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Data Siswa</TabsTrigger>
            <TabsTrigger value="input" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Input Nilai</TabsTrigger>
            <TabsTrigger value="rekap" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Rekapitulasi</TabsTrigger>
            <TabsTrigger value="analisis" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Analisis</TabsTrigger>
            <TabsTrigger value="rapor" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Cetak Rapor</TabsTrigger>
            <TabsTrigger value="pengaturan" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded py-2 px-4 text-slate-500 font-medium">Pengaturan Mapel</TabsTrigger>
          </TabsList>

          <div className="sm:hidden -mx-6 px-6 -mt-2 pb-4 overflow-x-auto print:hidden">
             <TabsList className="bg-white border shadow-sm p-1">
                <TabsTrigger value="siswa">Siswa</TabsTrigger>
                <TabsTrigger value="input">Nilai</TabsTrigger>
                <TabsTrigger value="rekap">Rekap</TabsTrigger>
                <TabsTrigger value="analisis">Grafik</TabsTrigger>
                <TabsTrigger value="rapor">Cetak</TabsTrigger>
                <TabsTrigger value="pengaturan">Seting</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="siswa">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <StudentsTab students={students} subjects={subjects} onChange={handleStudentsChange} classFilter={classFilter} />
             </motion.div>
          </TabsContent>

          <TabsContent value="input">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <InputNilaiTab students={students} subjects={subjects} onChange={handleStudentsChange} classFilter={classFilter} />
             </motion.div>
          </TabsContent>

          <TabsContent value="rekap">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <RekapitulasiTab students={students} subjects={subjects} classFilter={classFilter} />
             </motion.div>
          </TabsContent>

          <TabsContent value="analisis">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <AnalisisTab students={students} subjects={subjects} classFilter={classFilter} />
             </motion.div>
          </TabsContent>
          
          <TabsContent value="rapor">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <CetakRaporTab students={students} subjects={subjects} classFilter={classFilter} schoolInfo={schoolInfo} />
             </motion.div>
          </TabsContent>

          <TabsContent value="pengaturan">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                 <PengaturanTab subjects={subjects} onChange={handleSubjectsChange} schoolInfo={schoolInfo} onSchoolInfoChange={handleSchoolInfoChange} />
             </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

