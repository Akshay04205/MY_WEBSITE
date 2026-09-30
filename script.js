const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const glow = document.querySelector(".cursor-glow");

// Theme preference is saved locally so the visitor returns to the same visual mode.
// try/catch: some browsers (private mode) block localStorage and would crash the whole script.
function readTheme() {
  try { return localStorage.getItem("ax-theme"); } catch (e) { return null; }
}
function saveTheme(value) {
  try { localStorage.setItem("ax-theme", value); } catch (e) { /* ignore */ }
}

if (readTheme() === "light") body.classList.add("light");

function updateThemeIcon() {
  themeToggle.textContent = body.classList.contains("light") ? "☾" : "☼";
}
updateThemeIcon();

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light");
  saveTheme(body.classList.contains("light") ? "light" : "dark");
  updateThemeIcon();
});

menuToggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("pointermove", (event) => {
  if (glow && window.innerWidth > 760) {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }
});

// Reveal-on-scroll. If the browser has no IntersectionObserver, show everything instead of leaving it invisible.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add("visible"));
}

// Message form: sends without leaving the page and shows a status line.
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const btn = contactForm.querySelector(".send-btn");
    formStatus.className = "form-status";
    if (contactForm.action.includes("YOUR_FORM_ID")) {
      formStatus.textContent = "Form not connected yet - add your Formspree ID in index.html.";
      formStatus.classList.add("error");
      return;
    }
    btn.disabled = true;
    formStatus.textContent = "Sending...";
    try {
      const res = await fetch(contactForm.action, { method: "POST", body: new FormData(contactForm), headers: { Accept: "application/json" } });
      if (res.ok) { contactForm.reset(); formStatus.classList.add("success"); formStatus.textContent = "Thanks for reaching out! I'll reply within 24 hours."; }
      else throw new Error("failed");
    } catch (e) {
      formStatus.textContent = "Could not send. Please email me directly.";
      formStatus.classList.add("error");
    }
    btn.disabled = false;
  });
}

// Copy-email button
const copyBtn = document.getElementById("copyEmail");
const emailText = document.getElementById("emailText");
if (copyBtn && emailText) {
  copyBtn.addEventListener("click", async () => {
    const text = emailText.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // fallback for browsers that block the clipboard API
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      t.remove();
    }
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
  });
}
