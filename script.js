
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
