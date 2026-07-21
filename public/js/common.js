/* Helper bersama untuk seluruh halaman frontend. */

const API = {
  async request(method, url, body) {
    const opts = { method, headers: {} };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
    return data;
  },
  get(url) {
    return this.request("GET", url);
  },
  post(url, body) {
    return this.request("POST", url, body);
  },
  patch(url, body) {
    return this.request("PATCH", url, body);
  },
  del(url) {
    return this.request("DELETE", url);
  },
};

/** Menampilkan badge instance yang melayani ke elemen #served-by. */
function showServedBy(instance) {
  const el = document.getElementById("served-by");
  if (el && instance) {
    el.innerHTML = `<span class="node"></span>Dilayani oleh: <strong>&nbsp;${instance}</strong>`;
    el.classList.remove("hidden");
  }
}

/** Toast notifikasi. */
function toast(message, type = "") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function statusBadge(status) {
  const label =
    {
      waiting: "Menunggu",
      called: "Dipanggil",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }[status] || status;
  return `<span class="badge ${status}">${label}</span>`;
}

/** Menghubungkan Socket.IO bila tersedia (untuk update realtime). */
function connectRealtime(onUpdate) {
  if (typeof io === "undefined") return null;
  const socket = io();
  socket.on("queue:update", onUpdate);
  return socket;
}
