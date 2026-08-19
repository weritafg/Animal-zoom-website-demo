(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Mobile nav toggle */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("flex");
      mobileNav.classList.toggle("hidden");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("overflow-hidden", isOpen);
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.add("hidden");
        mobileNav.classList.remove("flex");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.classList.remove("is-open");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  /* Header elevation + solidify on scroll */
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Sliding nav indicator */
  const navGroup = document.querySelector("[data-nav]");
  if (navGroup) {
    const indicator = navGroup.querySelector("[data-nav-indicator]");
    const links = Array.from(navGroup.querySelectorAll("a"));
    const activeLink = navGroup.querySelector("a.is-active");

    const moveIndicatorTo = (link, animate) => {
      if (!link || !indicator) return;
      const groupRect = navGroup.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const left = linkRect.left - groupRect.left;
      if (animate && window.gsap && !prefersReducedMotion) {
        gsap.to(indicator, { left, width: linkRect.width, opacity: 1, duration: 0.35, ease: "power2.out" });
      } else {
        indicator.style.left = `${left}px`;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.opacity = 1;
      }
    };

    if (activeLink) {
      requestAnimationFrame(() => moveIndicatorTo(activeLink, false));
    }
    if (hasFinePointer) {
      links.forEach((link) => {
        link.addEventListener("mouseenter", () => moveIndicatorTo(link, true));
      });
      navGroup.addEventListener("mouseleave", () => moveIndicatorTo(activeLink, true));
    }
    window.addEventListener("resize", () => moveIndicatorTo(navGroup.querySelector("a:hover") || activeLink, false));
  }

  /* Scroll reveal via GSAP ScrollTrigger */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    gsap.utils.toArray("[data-split]").forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w) => `<span class="line-mask"><span class="line-mask__inner">${w}&nbsp;</span></span>`)
        .join("");
      gsap.to(el.querySelectorAll(".line-mask__inner"), {
        y: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.05,
        delay: 0.15,
      });
    });

    gsap.utils.toArray("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split(".")[1] || "").length;
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = obj.val.toFixed(decimals);
            },
          });
        },
      });
    });

    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.parallax) || 12,
        ease: "none",
        scrollTrigger: { trigger: el.closest("[data-parallax-wrap]") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => (el.style.opacity = 1));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  }

  /* Cursor-following blob in the hero */
  document.querySelectorAll("[data-mouse-blob-zone]").forEach((zone) => {
    const blob = zone.querySelector("[data-mouse-blob]");
    if (!blob || prefersReducedMotion) return;

    let moveTo;
    if (hasFinePointer && window.gsap) {
      const xTo = gsap.quickTo(blob, "x", { duration: 1.6, ease: "power2.out" });
      const yTo = gsap.quickTo(blob, "y", { duration: 1.6, ease: "power2.out" });
      moveTo = (x, y) => { xTo(x); yTo(y); };
    } else {
      moveTo = (x, y) => {
        blob.style.transform = `translate(${x}px, ${y}px)`;
      };
    }

    zone.addEventListener("pointermove", (e) => {
      const rect = zone.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      moveTo(relX, relY);
    });
  });

  /* Cursor-follow ambient glow */
  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll("[data-spotlight]").forEach((section) => {
      section.addEventListener("pointermove", (e) => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        section.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
        section.classList.add("is-active");
      });
      section.addEventListener("pointerleave", () => section.classList.remove("is-active"));
    });
  }

  /* Magnetic buttons */
  if (hasFinePointer && !prefersReducedMotion && window.gsap) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.4, duration: 0.4, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }));
    });
  }

  /* Accordion (Servicios / Veterinaria / FAQ) */
  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    const panel = trigger.parentElement.querySelector("[data-accordion-panel]");
    if (!panel) return;
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      document.querySelectorAll("[data-accordion-trigger]").forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          const p = t.parentElement.querySelector("[data-accordion-panel]");
          if (p) p.style.height = "0px";
        }
      });
      if (isOpen) {
        trigger.setAttribute("aria-expanded", "false");
        panel.style.height = "0px";
      } else {
        trigger.setAttribute("aria-expanded", "true");
        panel.style.height = `${panel.scrollHeight}px`;
      }
    });
  });

  /* Testimonial dot pagination */
  document.querySelectorAll("[data-testimonial-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-testimonial-track]");
    const slides = Array.from(track.children);
    const dotsWrap = carousel.querySelector("[data-testimonial-dots]");
    if (!track || !slides.length || !dotsWrap) return;
    let active = 0;
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Testimonio ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);
    function goTo(i) {
      active = i;
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
    }
    let auto = setInterval(() => goTo((active + 1) % slides.length), 6000);
    carousel.addEventListener("mouseenter", () => clearInterval(auto));
    carousel.addEventListener("mouseleave", () => (auto = setInterval(() => goTo((active + 1) % slides.length), 6000)));
  });

  /* ---------------------------------------------------------------------
     Booking form — "Agenda tu cita"
     Client-side, single form. No backend: on submit it builds a pre-filled
     WhatsApp message from every field and opens wa.me in a new tab.
     -------------------------------------------------------------------
     TODO(client): WHATSAPP_NUMBER below is a PLACEHOLDER. Replace it with
     Animal Zoom's real WhatsApp number (E.164, no symbols, e.g. 52155...)
     before this site goes live.
  --------------------------------------------------------------------- */
  const WHATSAPP_NUMBER = "5215555555555"; // TODO: replace with real WhatsApp number

  document.querySelectorAll("[data-booking-form]").forEach((form) => {
    const isEnglish = document.documentElement.lang === "en";
    const t = isEnglish
      ? {
          location: "Location",
          service: "Service",
          pet: "Pet",
          date: "Preferred date",
          time: "Preferred time",
          name: "My name",
          notes: "Notes",
          greeting: "Hi Animal Zoom 🐾 I'd like to book an appointment.",
          locale: "en-US",
        }
      : {
          location: "Sucursal",
          service: "Servicio",
          pet: "Mascota",
          date: "Fecha preferida",
          time: "Horario preferido",
          name: "Mi nombre",
          notes: "Comentario",
          greeting: "Hola Animal Zoom 🐾 Quiero agendar una cita.",
          locale: "es-MX",
        };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const get = (field) => form.querySelector(`[data-field="${field}"]`)?.value.trim() || "";
      const date = get("date");
      const dateLabel = date
        ? new Date(date + "T00:00:00").toLocaleDateString(t.locale, { weekday: "long", day: "numeric", month: "long" })
        : "";

      const lines = [
        t.greeting,
        `${t.location}: ${get("location")}`,
        `${t.service}: ${get("service")}`,
        `${t.pet}: ${get("pet")}`,
        `${t.date}: ${dateLabel}`,
        `${t.time}: ${get("time")}`,
        `${t.name}: ${get("name")}`,
        get("notes") ? `${t.notes}: ${get("notes")}` : null,
      ].filter(Boolean);

      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
    });
  });
})();
