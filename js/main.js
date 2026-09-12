document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const navbar = document.querySelector(".navbar");
  const progressBar = document.querySelector(".scroll-progress span");

  const closeMenu = () => {
    if (!menuButton || !navLinks) return;
    navLinks.classList.remove("active");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
  };

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuButton.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (!navLinks.classList.contains("active")) return;
      if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  const updateScrollUI = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 16);
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
    progressBar.style.width = `${progress}%`;
  };
  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("active"));
  }

  const subjectFromUrl = new URLSearchParams(window.location.search).get("subject");
  const subjectSelect = document.getElementById("subject");
  const subjectMap = {
    "due-diligence": "Due-diligence document request",
    "investor-brief": "Investor brief request",
    project: "Mineral or project introduction",
    technical: "Technical partnership"
  };
  if (subjectSelect && subjectMap[subjectFromUrl]) subjectSelect.value = subjectMap[subjectFromUrl];

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = Object.fromEntries(new FormData(contactForm).entries());
    const subject = `Fortenous Metals enquiry: ${data.subject}`;
    const body = [
      `Name: ${data.name}`,
      `Organisation: ${data.organisation}`,
      `Email: ${data.email}`,
      `Telephone: ${data.phone || "Not provided"}`,
      `Enquiry type: ${data.subject}`,
      "",
      data.message
    ].join("\n");

    const mailto = `mailto:ayubuamudi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (formMessage) {
      formMessage.style.display = "block";
      formMessage.textContent = "Your email application is opening. Review the message and press Send there.";
    }
    window.location.href = mailto;
  });
});
