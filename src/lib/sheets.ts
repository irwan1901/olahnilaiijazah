export async function fetchFromAppsScript(url: string) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error("Gagal mengambil data. HTTP " + res.status);
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch(e) {
        console.error("Non-JSON response:", text);
        if (text.includes("<!DOCTYPE html>") || text.toLowerCase().includes("google_sign_in") || text.includes("<html")) {
           throw new Error("Akses ditolak atau URL salah. Pastikan deploy Web App diset ke 'Who has access: Anyone' (Siapa saja) dan URL berakhiran /exec");
        }
        throw new Error("Respons dari server tidak valid bukan JSON.");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function saveToAppsScript(url: string, payload: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "follow"
    });
    if (!res.ok) throw new Error("Gagal menyimpan data. HTTP " + res.status);
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch(e) {
        console.error("Non-JSON response:", text);
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
           throw new Error("Akses ditolak. Pastikan deploy Web App diset ke 'Who has access: Anyone' (Siapa saja).");
        }
        throw new Error("Respons dari server tidak valid bukan JSON.");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
