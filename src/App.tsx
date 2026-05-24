import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Zap, Settings, Lock, User as UserIcon, Link as LinkIcon, Download } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Input } from "../components/ui/input";
import Dashboard from "./components/Dashboard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";

const GAS_CODE = `const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let studentsSheet = ss.getSheetByName('Students');
  let subjectsSheet = ss.getSheetByName('Subjects');
  let infoSheet = ss.getSheetByName('SchoolInfo');
  
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet('Students');
    studentsSheet.appendRow(["ID", "NIS", "NISN", "Nama", "L/P", "Kelas", "DataJSON"]);
  }
  
  if (!subjectsSheet) {
    subjectsSheet = ss.insertSheet('Subjects');
    subjectsSheet.appendRow(["ID", "Name", "Type"]);
    const defaultSubs = [
      ["pai", "Pend. Agama & Budi Pekerti", "umum"],
      ["pkn", "Pend. Pancasila & Kewarganegaraan", "umum"],
      ["bi", "Bahasa Indonesia", "umum"],
      ["mtk", "Matematika", "umum"],
      ["ipa", "Ilmu Pengetahuan Alam", "umum"],
      ["ips", "Ilmu Pengetahuan Sosial", "umum"],
      ["sbdp", "Seni Budaya dan Prakarya", "umum"],
      ["pjok", "Pend. Jasmani, Olahraga & Kesehatan", "umum"],
      ["bsunda", "Bahasa Sunda", "mulok"]
    ];
    subjectsSheet.getRange(2, 1, defaultSubs.length, 3).setValues(defaultSubs);
  }

  if (!infoSheet) {
    infoSheet = ss.insertSheet('SchoolInfo');
    infoSheet.appendRow(["kepalaSekolah", "nip", "tanggalCetak", "tahunPelajaran"]);
    infoSheet.appendRow(["Nama Kepala Sekolah, M.Pd.", "1970XXXXXXXXXX", "Jakarta, 15 Juni 2024", "2023/2024"]);
  }
  
  const studentData = studentsSheet.getDataRange().getValues().slice(1);
  const students = studentData.map(row => {
    try { return JSON.parse(row[6]); } catch(err) { return null; }
  }).filter(Boolean);
  
  const subjectsData = subjectsSheet.getDataRange().getValues().slice(1);
  const subjects = subjectsData.map(row => ({ id: String(row[0]), name: String(row[1]), type: String(row[2] || 'umum') }));

  const infoData = infoSheet.getDataRange().getValues();
  let schoolInfo = { kepalaSekolah: "Nama Kepala Sekolah, M.Pd.", nip: "1970XXXXXXXXXX", tanggalCetak: "Jakarta, 15 Juni 2024", tahunPelajaran: "2023/2024" };
  if(infoData.length > 1) {
    schoolInfo = {
      kepalaSekolah: String(infoData[1][0] || ""),
      nip: String(infoData[1][1] || ""),
      tanggalCetak: String(infoData[1][2] || ""),
      tahunPelajaran: String(infoData[1][3] || "2023/2024")
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ students, subjects, schoolInfo }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === 'save_students') {
      const sheet = ss.getSheetByName('Students');
      sheet.clear();
      sheet.appendRow(["ID", "NIS", "NISN", "Nama", "L/P", "Kelas", "DataJSON"]);
      
      const rows = data.students.map(s => [
        s.id, s.nis, s.nisn, s.name, s.gender, s.class, JSON.stringify(s)
      ]);
      
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 7).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'save_subjects') {
      const sheet = ss.getSheetByName('Subjects');
      sheet.clear();
      sheet.appendRow(["ID", "Name", "Type"]);
      
      const rows = data.subjects.map(s => [s.id, s.name, s.type || 'umum']);
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 3).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'save_schoolInfo') {
      const sheet = ss.getSheetByName('SchoolInfo');
      if (sheet) {
        sheet.clear();
        sheet.appendRow(["kepalaSekolah", "nip", "tanggalCetak", "tahunPelajaran"]);
        sheet.appendRow([data.schoolInfo.kepalaSekolah, data.schoolInfo.nip, data.schoolInfo.tanggalCetak, data.schoolInfo.tahunPelajaran]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function App() {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => localStorage.getItem("isLoggedIn") !== "true");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [sheetId, setSheetId] = useState<string>(() => localStorage.getItem("sheetId") || "");
  const [manualSheetId, setManualSheetId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("isLoggedIn", "true");
        setNeedsAuth(false);
        toast.success("Berhasil login sebagai Admin");
      } else {
        toast.error("Username atau password salah. Coba admin / admin123");
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  const handleLinkSheet = () => {
    let url = manualSheetId.trim();
    if (!url) return;
    
    if (!url.startsWith("https://script.google.com/macros/s/")) {
        toast.error("URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/...");
        return;
    }
    
    if (!url.endsWith("/exec")) {
        // Auto correct if they copied the url without /exec
        if (url.endsWith("/")) {
            url = url + "exec";
        } else {
            // Replace the end part with /exec (e.g. if it ends with /edit)
            const parts = url.split("/");
            parts[parts.length - 1] = "exec";
            url = parts.join("/");
        }
    }
    
    setSheetId(url);
    localStorage.setItem("sheetId", url);
    toast.success("Berhasil menghubungkan dengan Apps Script");
  };

  const handleLocalMode = () => {
      const localId = "local-" + Date.now().toString();
      setSheetId(localId);
      localStorage.setItem("sheetId", localId);
      toast.success("Masuk dalam Mode Lokal. Data akan tersimpan di browser.");
  }

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    setNeedsAuth(true);
    setUsername("");
    setPassword("");
  };
  
  const disconnectSheet = () => {
    setSheetId("");
    localStorage.removeItem("sheetId");
  };

  if (needsAuth) {
    return (
      <div className="min-h-screen flex bg-slate-50 font-sans">
        {/* Left Side */}
        <div className="hidden lg:flex w-1/2 bg-indigo-900 text-white p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold mb-2 tracking-tight">Selamat Datang di<br/>SI-PIKAT SD</h1>
            <p className="text-xl font-medium text-indigo-100 mb-6 tracking-wide">
              Sistem Informasi Penataan Ijazah Akurat
            </p>
            <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
              Sistem informasi akademik untuk mempermudah guru dalam merekap, menghitung, dan menganalisis nilai ijazah serta rapor siswa kelas 6 dengan cepat dan akurat.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-indigo-300">✓</div>
                <span className="font-medium">Hitung Nilai Rata-rata & Ijazah otomatis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-indigo-300">✓</div>
                <span className="font-medium">Otomatis Terhubung ke Google Sheets</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-indigo-300">✓</div>
                <span className="font-medium">Kelola Mata Pelajaran Sendiri</span>
              </div>
            </div>
            <div className="mt-16 text-indigo-400 text-sm font-medium">
              Aplikasi SI-PIKAT by Suka Coding
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
           <div className="absolute top-8 right-8 text-xs font-bold tracking-widest text-slate-400 uppercase">Versi 1.1.0</div>
           
           <Card className="w-full max-w-sm border-0 shadow-none bg-transparent sm:bg-white sm:border sm:shadow-xl sm:border-slate-200 rounded-2xl overflow-hidden">
             <div className="h-2 w-full bg-indigo-600 sm:block hidden"></div>
             <CardHeader className="text-center space-y-2 pt-8 pb-4">
               <div className="flex justify-center mb-2 lg:hidden">
                 <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                   <Lock className="h-7 w-7 text-indigo-600" />
                 </div>
               </div>
               <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">Masuk ke Akun</CardTitle>
               <CardDescription className="text-slate-500 font-medium pb-2">
                 Masukkan username dan password
               </CardDescription>
             </CardHeader>
             <CardContent className="pb-8">
               <form onSubmit={handleLogin} className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                   <div className="relative">
                     <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                     <Input 
                       type="text"
                       required
                       placeholder="admin" 
                       className="pl-10 border-slate-300 rounded focus-visible:ring-indigo-600"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                     <Input 
                       type="password"
                       required
                       placeholder="admin123" 
                       className="pl-10 border-slate-300 rounded focus-visible:ring-indigo-600"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                     />
                   </div>
                 </div>
                 <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium mt-6 shadow-sm h-11" disabled={isLoggingIn}>
                   {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk ke Dashboard'}
                 </Button>
               </form>
               <div className="mt-8 text-center bg-slate-50 p-3 rounded border border-slate-100 lg:hidden">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Sistem informasi akademik mempermudah guru merekap nilai ijazah serta rapor kelas 6.</p>
               </div>
             </CardContent>
           </Card>
        </div>
        <Toaster />
      </div>
    );
  }

  if (!sheetId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 border-4 border-slate-200">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-indigo-100 rounded flex items-center justify-center">
                  <Settings className="h-5 w-5 text-indigo-600" />
               </div>
               <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-800">Setup Database Nilai</h1>
                  <p className="text-xs text-slate-500 font-medium">Hubungkan ke Google Sheets melalui Apps Script Web App</p>
               </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 hover:bg-slate-100 rounded">
              Ganti Akun
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-slate-800 font-bold">
                  <LinkIcon className="mr-2 h-5 w-5 text-indigo-600" /> Web App URL (GAS)
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Masukkan URL Web App Google Apps Script dari Spreadsheet Anda agar data otomatis tersinkronisasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-6">
                <Input 
                  className="border-slate-300 rounded focus-visible:ring-indigo-600 font-mono text-xs"
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={manualSheetId}
                  onChange={(e) => setManualSheetId(e.target.value)}
                />
                <Button onClick={handleLinkSheet} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-sm" disabled={!manualSheetId}>
                  Hubungkan Script
                </Button>
                
                <Dialog>
                  <DialogTrigger render={<Button variant="link" className="w-full text-indigo-600 h-8 text-xs underline">Lihat Kode Apps Script</Button>} />
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Mulai Apps Script di Google Sheets Anda</DialogTitle>
                      <DialogDescription>
                        Buka Google Sheets baru Anda &rarr; <strong>Ekstensi</strong> &rarr; <strong>Apps Script</strong>.
                        Paste kode di bawah ini lalu klik <strong>Terapkan (Deploy)</strong> &rarr; <strong>Deployment Baru</strong>.
                        Pilih jenis <strong>Web App</strong>. Set Who has access (Siapa yang memiliki akses) menjadi <strong>Anyone</strong> (Siapa saja).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto bg-slate-900 rounded p-4 border border-slate-800">
                      <pre className="text-emerald-400 font-mono text-[10px] whitespace-pre-wrap">{GAS_CODE}</pre>
                    </div>
                    <Button onClick={() => {
                        navigator.clipboard.writeText(GAS_CODE);
                        toast.success("Kode disalin!");
                    }} className="bg-indigo-600 text-white"><Download className="w-4 h-4 mr-2" /> Salin Kode</Button>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-slate-800 font-bold">
                  <Zap className="mr-2 h-5 w-5 text-indigo-600" /> Mode Lokal
                </CardTitle>
                <CardDescription className="text-slate-500">Anda juga dapat menggunakan aplikasi ini 100% tanpa internet. Semua data akan disimpan di Browser ini (tidak bisa lintas perangkat).</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 h-full border-t">
                <Button onClick={handleLocalMode} size="lg" className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded font-medium shadow-none">
                  Lanjutkan Mode Lokal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <>
      <Dashboard sheetId={sheetId} onDisconnect={disconnectSheet} onSignOut={handleSignOut} user={null} />
      <Toaster />
    </>
  );
}
