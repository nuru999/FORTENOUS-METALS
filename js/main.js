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

  const documentRegister = document.getElementById("documentRegister");
  if (documentRegister) {
    const documentCount = document.querySelector("[data-document-count]");
    const registerReviewed = document.querySelector("[data-register-reviewed]");
    const documentSearch = document.getElementById("documentSearch");
    const filterButtons = [...document.querySelectorAll("[data-document-filter]")];
    let documents = [];
    let activeFilter = "all";
    let searchTerm = "";

    const makeElement = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };

    const formatDate = (value) => {
      if (!value) return "Not stated";
      const parsed = new Date(`${value}T00:00:00`);
      return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
    };

    const showEmptyState = (title, message, showAction = false) => {
      const empty = makeElement("div", "register-empty");
      const icon = makeElement("span", "register-empty-icon");
      icon.innerHTML = '<i class="fa-solid fa-shield-halved" aria-hidden="true"></i>';
      empty.append(icon, makeElement("h3", "", title), makeElement("p", "", message));
      if (showAction) {
        const action = makeElement("a", "btn btn-secondary", "Request verified documents");
        action.href = "contact.html?subject=due-diligence";
        empty.append(action);
      }
      documentRegister.replaceChildren(empty);
      documentRegister.setAttribute("aria-busy", "false");
    };

    const createFact = (label, value) => {
      const item = makeElement("div");
      item.append(makeElement("span", "", label), makeElement("strong", "", value || "Not stated"));
      return item;
    };

    const createDocumentCard = (record) => {
      const card = makeElement("article", "document-entry");
      const head = makeElement("div", "document-entry-head");
      const allowedStatuses = ["active", "expired", "pending", "unknown"];
      const status = allowedStatuses.includes(record.status) ? record.status : "unknown";
      head.append(
        makeElement("span", "document-entry-type", record.categoryLabel || "Company record"),
        makeElement("span", `document-status document-status--${status}`, record.statusLabel || status)
      );

      card.append(head, makeElement("h3", "", record.title || "Untitled record"), makeElement("p", "", record.summary || "Summary pending company review."));
      const facts = makeElement("div", "document-facts");
      facts.append(
        createFact("Issuing authority", record.issuingAuthority),
        createFact("Legal holder", record.holder),
        createFact("Issue date", formatDate(record.issueDate)),
        createFact("Expiry date", formatDate(record.expiryDate))
      );
      if (record.scope) facts.append(createFact("Scope", record.scope));
      if (record.publicReference) facts.append(createFact("Reference", record.publicReference));
      card.append(facts);

      const actions = makeElement("div", "document-entry-actions");
      if (record.publicFile && /^documents\/public\/[A-Za-z0-9._/-]+$/.test(record.publicFile)) {
        const view = makeElement("a", "btn btn-secondary", "View redacted copy");
        view.href = record.publicFile;
        view.target = "_blank";
        view.rel = "noopener";
        actions.append(view);
      }
      const request = makeElement("a", "btn", "Request full record");
      request.href = "contact.html?subject=due-diligence";
      actions.append(request);
      card.append(actions);
      return card;
    };

    const renderDocuments = () => {
      if (!documents.length) {
        showEmptyState("Register ready. Records pending.", "No licence is being claimed without evidence. Verified, management-approved records will appear here as soon as they are available.", true);
        return;
      }

      const filtered = documents.filter((record) => {
        const categoryMatches = activeFilter === "all" || record.category === activeFilter;
        const searchable = [record.title, record.categoryLabel, record.issuingAuthority, record.holder, record.scope, record.summary, record.region, record.mineral].filter(Boolean).join(" ").toLowerCase();
        return categoryMatches && searchable.includes(searchTerm);
      });

      if (!filtered.length) {
        showEmptyState("No matching records", "Try another search phrase or choose a different document category.");
        return;
      }
      documentRegister.replaceChildren(...filtered.map(createDocumentCard));
      documentRegister.setAttribute("aria-busy", "false");
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.documentFilter || "all";
        filterButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        renderDocuments();
      });
    });
    documentSearch?.addEventListener("input", () => {
      searchTerm = documentSearch.value.trim().toLowerCase();
      renderDocuments();
    });

    fetch("data/documents.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Register request failed with ${response.status}`);
        return response.json();
      })
      .then((data) => {
        documents = Array.isArray(data.documents) ? data.documents.filter((record) => record && record.published === true) : [];
        if (documentCount) documentCount.textContent = String(documents.length);
        if (registerReviewed) registerReviewed.textContent = formatDate(data.lastReviewed);
        renderDocuments();
      })
      .catch(() => {
        showEmptyState("Register temporarily unavailable", "Please contact management to request the current verified record list.", true);
      });
  }

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
