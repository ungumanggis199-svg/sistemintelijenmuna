
// ===============================
// API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbzMZVV93BH3d_aL1uADw5Whj_bYIXoZn8_2acT9g5HLRHKTuO_rFCUEoV4aa4XPFMNTMg/exec";

// ===============================
// INIT SAFE
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {

    const passwordInput = document.getElementById("password");
    const toggle = document.getElementById("togglePassword");

    // ===============================
    // ICON MATA FIX TOTAL
    // ===============================
    if (toggle && passwordInput) {
      toggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          toggle.textContent = "🙈";
        } else {
          passwordInput.type = "password";
          toggle.textContent = "👁";
        }

      });
    }

    // ===============================
    // LOGIN SYSTEM FIX
    // ===============================
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      const btn = loginForm.querySelector("button");

      btn.textContent = "Checking...";
      btn.disabled = true;

      try {

        const res = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ username, password })
        });

        const text = await res.text();

        console.log("RAW RESPONSE:", text); // DEBUG PENTING

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error("Response bukan JSON: " + text);
        }

        if (data.status === "success") {

          localStorage.setItem("intel_session", JSON.stringify({
            username: data.username,
            role: data.role,
            token: data.token,
            loginTime: Date.now()
          }));

          btn.textContent = "Access Granted";

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 800);

        } else {
          btn.textContent = "Login Failed";
          btn.disabled = false;

          setTimeout(() => {
            btn.textContent = "Masuk ke Sistem Intelijen";
          }, 1500);
        }

      } catch (err) {

        console.error("LOGIN ERROR:", err);

        btn.textContent = "Server Error";
        btn.disabled = false;

        setTimeout(() => {
          btn.textContent = "Masuk ke Sistem Intelijen";
        }, 2000);

      }
      function createLights(){
  for(let i=0;i<15;i++){
    const l = document.createElement("div");
    l.className = "light";

    l.style.left = Math.random()*100 + "vw";
    l.style.animationDuration = (8 + Math.random()*10) + "s";

    document.body.appendChild(l);
  }
}
createLights();
    });
  }

});
/* =========================================================
   PROJECT.JS — Logika Tambah Project + Notifikasi WA
   Paste seluruh isi ini di script.js kamu (di bagian bawah).
   Pastikan const API_URL sudah ada di script.js (dipakai juga
   untuk login) — kalau belum ada, tambahkan baris di bawah ini
   sekali saja:

   const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const formProject = document.getElementById("formProject");
  if (!formProject) return; // halaman project belum ada di DOM ini, skip

  const pjMsg = document.getElementById("pjMsg");
  const pjSubmitBtn = document.getElementById("pjSubmitBtn");

  // ambil username yang login (disimpan saat login)
  function getUsername() {
    try {
      const session = JSON.parse(localStorage.getItem("intel_session"));
      return session ? session.username : "Unknown";
    } catch (e) {
      return "Unknown";
    }
  }

  // ============ SUBMIT FORM TAMBAH PROJECT ============
  formProject.addEventListener("submit", async (e) => {
    e.preventDefault();

    const namaProject = document.getElementById("pjNama").value.trim();
    const deskripsi = document.getElementById("pjDeskripsi").value.trim();
    const durasi = document.getElementById("pjDurasi").value;
    const deadline = document.getElementById("pjDeadline").value;

    if (!namaProject || !durasi || !deadline) {
      showMsg("Semua kolom wajib diisi (kecuali deskripsi).", "err");
      return;
    }

    pjSubmitBtn.disabled = true;
    pjSubmitBtn.textContent = "Menyimpan...";
    hideMsg();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "addProject",
          namaProject,
          deskripsi,
          durasi,
          deadline,
          username: getUsername()
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Response bukan JSON: " + text);
      }

      if (data.status === "success") {
        showMsg(
          data.waSent
            ? "✅ Project tersimpan & notifikasi WhatsApp terkirim ke tim."
            : "⚠️ Project tersimpan, tapi notifikasi WA gagal terkirim: " + data.waDetail,
          data.waSent ? "ok" : "err"
        );
        formProject.reset();
        loadProjects();
      } else {
        showMsg("Gagal menyimpan: " + (data.message || "Unknown error"), "err");
      }

    } catch (err) {
      console.error("ADD PROJECT ERROR:", err);
      showMsg("Terjadi kesalahan server: " + err.message, "err");
    } finally {
      pjSubmitBtn.disabled = false;
      pjSubmitBtn.textContent = "Simpan & Kirim Notifikasi WA";
    }
  });

  function showMsg(text, type) {
    pjMsg.textContent = text;
    pjMsg.className = "pj-msg " + type;
  }
  function hideMsg() {
    pjMsg.className = "pj-msg";
  }

  // ============ LOAD DAFTAR PROJECT ============
  async function loadProjects() {
    const wrap = document.getElementById("pjTableWrap");
    wrap.innerHTML = '<div class="pj-empty">Memuat data project...</div>';

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "getProjects" })
      });
      const text = await res.text();
      const data = JSON.parse(text);

      if (data.status !== "success" || !data.projects.length) {
        wrap.innerHTML = '<div class="pj-empty">Belum ada project. Tambahkan project pertama!</div>';
        return;
      }

      let rows = "";
      data.projects.forEach(p => {
        rows += `
          <tr>
            <td><b>${escapeHtml(p.nama)}</b><br><span style="color:#5B6660;font-size:11.5px;">${escapeHtml(p.deskripsi || "-")}</span></td>
            <td>${p.durasi} hari</td>
            <td>${formatDeadline(p.deadline)}</td>
            <td><span class="pj-status">${escapeHtml(p.status)}</span></td>
            <td>${escapeHtml(p.dibuatOleh)}</td>
          </tr>`;
      });

      wrap.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Nama Project</th>
              <th>Durasi</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Dibuat Oleh</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;

    } catch (err) {
      console.error("LOAD PROJECT ERROR:", err);
      wrap.innerHTML = '<div class="pj-empty">Gagal memuat data project.</div>';
    }
  }

  function formatDeadline(str) {
    if (!str) return "-";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // load pertama kali saat halaman dibuka
  loadProjects();

  // expose supaya bisa dipanggil ulang tiap kali menu "Project Baru" diklik
  window.loadProjects = loadProjects;
});


/* =========================================================
   SWITCH PAGE — hanya perlu ditambahkan kalau script.js kamu
   BELUM punya fungsi navigasi sidebar. Kalau sudah ada fungsi
   sejenis (misal showPage / setActivePage), pakai yang sudah
   ada saja dan HAPUS blok di bawah ini supaya tidak bentrok.
   ========================================================= */
if (typeof switchToPage === "undefined") {
  window.switchToPage = function (pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const target = document.getElementById("page-" + pageId);
    if (target) target.classList.add("active");

    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add("active");

    if (pageId === "project" && typeof window.loadProjects === "function") {
      window.loadProjects();
    }
  };
}
