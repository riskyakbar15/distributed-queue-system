"use strict";

/**
 * Uji beban sederhana untuk membuktikan penomoran antrean tetap unik
 * meskipun banyak request dikirim bersamaan ke beberapa instance
 * (menguji penanganan race condition antar-instance).
 *
 * Jalankan setelah Nginx + tiga instance aktif:
 *   node scripts/loadtest.js [jumlah] [baseUrl]
 *
 * Contoh: node scripts/loadtest.js 100 http://localhost
 */

const COUNT = Number(process.argv[2]) || 50;
const BASE_URL = process.argv[3] || "http://localhost";

async function takeQueue(i) {
  const res = await fetch(`${BASE_URL}/api/queues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Uji ${i}`,
      nim: `NIM${String(i).padStart(4, "0")}`,
      studyProgram: "Teknik Informatika",
      serviceId: 1,
    }),
  });
  const body = await res.json();
  return { number: body?.data?.queueNumber, servedBy: body?.servedBy };
}

async function main() {
  console.log(`Mengirim ${COUNT} request bersamaan ke ${BASE_URL} ...`);
  const results = await Promise.all(
    Array.from({ length: COUNT }, (_, i) => takeQueue(i)),
  );

  const numbers = results.map((r) => r.number).filter(Boolean);
  const unique = new Set(numbers);
  const byInstance = results.reduce((acc, r) => {
    acc[r.servedBy] = (acc[r.servedBy] || 0) + 1;
    return acc;
  }, {});

  console.log("Total berhasil     :", numbers.length);
  console.log("Nomor unik         :", unique.size);
  console.log("Distribusi instance:", byInstance);

  if (unique.size !== numbers.length) {
    console.error("GAGAL: terdapat nomor antrean ganda!");
    process.exit(1);
  }
  console.log(
    "BERHASIL: semua nomor antrean unik (race condition tertangani).",
  );
}

main().catch((err) => {
  console.error("Load test gagal:", err.message);
  process.exit(1);
});
