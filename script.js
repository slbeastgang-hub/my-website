/* ============================================================
   NEXORA AI — script.js
   Modules:
   1. Mobile navigation
   2. Navbar scroll state
   3. Smooth scrolling
   4. Scroll reveal
   5. Active navigation highlighting
   6. Animated counters
   7. Particle field (lightweight)
   8. NEXORA chat demo
   9. Back to top
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Mobile navigation ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function setMenu(open) {
      toggle.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("open"));
    });

    // Close when a link inside the menu is clicked
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });

    // Reset state if viewport grows past mobile breakpoint
    var mq = window.matchMedia("(min-width: 861px)");
    mq.addEventListener
      ? mq.addEventListener("change", function (ev) { if (ev.matches) setMenu(false); })
      : mq.addListener(function (ev) { if (ev.matches) setMenu(false); });
  }

  /* ---------- 2. Navbar scroll state ---------- */
  function initNavbarScroll() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var ticking = false;

    function update() {
      nav.classList.toggle("scrolled", window.scrollY > 24);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ---------- 3. Smooth scrolling (with nav offset) ---------- */
  function initSmoothScroll() {
    document.querySelectorAll("a[data-scroll]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return;
        var target = id === "#top"
          ? document.body
          : document.querySelector(id);
        if (!target) return;
        e.preventDefault();

        var top = id === "#top"
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - 72;

        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

        // If target is the top, scroll exactly to 0
        if (id === "#top") window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ---------- 4. Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // Stagger delays via data-delay attribute
    items.forEach(function (el) {
      var d = el.getAttribute("data-delay");
      if (d) el.style.setProperty("--rd", d);
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Active navigation highlighting ---------- */
  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    if (!links.length) return;

    var sections = links
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.charAt(0) === "#"
          ? { id: id.slice(1), el: document.querySelector(id) }
          : null;
      })
      .filter(function (s) { return s && s.el; });

    function update() {
      var pos = window.scrollY + 140;
      var current = sections[0] ? sections[0].id : null;

      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= pos) current = sections[i].id;
      }
      // If near page bottom, force last section
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        current = sections[sections.length - 1].id;
      }

      links.forEach(function (link) {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + current
        );
      });
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }
    }, { passive: true });

    update();
  }

  /* ---------- 6. Animated counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var duration = 1800;
      var start = null;

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Particle field (lightweight) ---------- */
  function initParticles() {
    var canvas = document.getElementById("particleCanvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = 520; // logical px, matches canvas attrs
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    var COUNT = 26;
    var particles = [];
    var cx = size / 2;
    var cy = size / 2;
    var running = true;
    var raf = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }

    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: rand(0, size),
        y: rand(0, size),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.15, 0.15),
        r: rand(0.8, 2.2),
        hue: Math.random() > 0.5 ? "110, 231, 255" : "183, 148, 246"
      });
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // connecting lines between nearby particles
      for (var i = 0; i < COUNT; i++) {
        for (var j = i + 1; j < COUNT; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.strokeStyle = "rgba(110, 231, 255, " + (0.12 * (1 - dist / 90)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < COUNT; k++) {
        var p = particles[k];
        p.x += p.vx;
        p.y += p.vy;

        // soft bounce
        if (p.x < 0 || p.x > size) p.vx *= -1;
        if (p.y < 0 || p.y > size) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.hue + ", 0.7)";
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      draw();
      raf = requestAnimationFrame(loop);
    }

    // Pause when hero is off-screen or tab is hidden
    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) {
        loop();
      } else {
        cancelAnimationFrame(raf);
      }
    }

    var core = canvas.closest(".hero");
    if ("IntersectionObserver" in window && core) {
      new IntersectionObserver(function (entries) {
        setRunning(entries[0].isIntersecting);
      }, { threshold: 0.05 }).observe(core);
    }
    document.addEventListener("visibilitychange", function () {
      setRunning(!document.hidden);
    });

    loop();
  }

  /* ---------- 8. NEXORA chat demo ---------- */
  function initChat() {
    var form = document.getElementById("chatForm");
    var input = document.getElementById("chatInput");
    var body = document.getElementById("chatBody");
    if (!form || !input || !body) return;

    var MAX_MESSAGES = 24;

    var responses = [
      {
        test: /\b(hi|hello|hey|yo|greetings|good (morning|afternoon|evening))\b/i,
        reply: "Hello! 👋 I'm NEXORA. I can tell you about our models, security, performance, pricing — or just ask me anything."
      },
      {
        test: /\b(model|model|ai|neural|llm|gpt|neural|foundation)\b/i,
        reply: "Our NEXORA Core 4.0 family includes three foundation models — <strong>AURA</strong> for reasoning, <strong>PULSE</strong> for high-throughput generation, and <strong>VISION-IX</strong> for multimodal tasks. All are fine-tuned per-domain and deployed on our edge network."
      },
      {
        test: /\b(secur|privacy|encrypt|compliance|safe|soc|iso)\b/i,
        reply: "Security is foundational here. End-to-end encryption, zero-retention pipelines, SOC 2 Type II and ISO 27001 compliance. Your data is never used to train our models — it simply never has to be stored."
      },
      {
        test: /\b(pricing|price|cost|cheap|free|plan|subscription)\b/i,
        reply: "Pricing is simple: a free tier to start, then usage-based plans that scale with you. Enterprise plans add SSO, dedicated clusters and a 99.99% SLA. No hidden fees — ever."
      },
      {
        test: /\b(fast|speed|latency|performance|speed|ms|throughput)\b/i,
        reply: "We're obsessed with speed. Median inference latency is <strong>12ms</strong> on our global edge network, and our autoscaling clusters handle from 100 to 10 billion operations without breaking a sweat. ⚡"
      },
      {
        test: /\b(api|developer|sdk|code|integrat|docs)\b/i,
        reply: "Developers love us. Typed SDKs for Python, TypeScript, Go and Rust, an OpenAPI-compatible REST API, and local inference for edge devices. Most teams ship their first NEXORA integration in under an hour."
      },
      {
        test: /\b(creat|design|image|art|music|write|content)\b/i,
        reply: "NEXORA for Creators gives you a copilot that learns your style — generating text, images and code, remixing ideas, and iterating until it feels like *you* made it. 🎨"
      },
      {
        test: /\b(country|where|location|office|global)\b/i,
        reply: "We're a global team — 6 offices across San Francisco, London, Singapore and beyond — and our platform serves customers in 180+ countries, 24/7."
      },
      {
        test: /\b(who|what is nexora|about|company|founded|team)\b/i,
        reply: "NEXORA AI was founded in 2021 with a belief that intelligence should feel like instinct. Today we're 140+ researchers and engineers building the systems that power what comes next."
      },
      {
        test: /\b(thank|thanks|awesome|cool|nice|amazing|great)\b/i,
        reply: "You're very welcome! It's my pleasure. Is there anything else you'd like to explore? ✨"
      },
      {
        test: /\b(help|what can you do|capabilities|features)\b/i,
        reply: "I can chat about our <strong>models</strong>, <strong>security</strong>, <strong>pricing</strong>, <strong>performance</strong>, our <strong>API</strong>, and what NEXORA means for <strong>creators</strong>. Try asking me about any of those!"
      }
    ];

    var fallbacks = [
      "That's a great question. In short: NEXORA handles it. Ask me about our models, security, pricing or performance and I'll go deeper.",
      "Interesting one! I'm a demo assistant, so I know my corner of the universe best — try asking me about our technology, speed, or how we keep things secure.",
      "I'd love to dig into that. For now, try asking about our <strong>models</strong>, <strong>API</strong>, <strong>pricing</strong>, or how <strong>fast</strong> we are. 🚀"
    ];
    var fallbackIndex = 0;

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function addMessage(text, who) {
      var msg = document.createElement("div");
      msg.className = "msg msg--" + who;

      var bubble = document.createElement("div");
      bubble.className = "msg__bubble";
      if (who === "bot") {
        bubble.innerHTML = text; // safe: only our own predefined strings
      } else {
        bubble.textContent = text; // user input: plain text only
      }
      msg.appendChild(bubble);
      body.appendChild(msg);

      // Trim old messages
      while (body.children.length > MAX_MESSAGES) {
        body.removeChild(body.firstChild);
      }
      body.scrollTop = body.scrollHeight;
    }

    function getReply(raw) {
      for (var i = 0; i < responses.length; i++) {
        if (responses[i].test.test(raw)) return responses[i].reply;
      }
      return fallbacks[fallbackIndex++ % fallbacks.length];
    }

    function respond(userText) {
      // typing indicator
      var typing = document.createElement("div");
      typing.className = "msg msg--bot msg--typing";
      typing.innerHTML =
        '<div class="msg__bubble"><i></i><i></i><i></i></div>';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;

      var delay = 500 + Math.random() * 600;
      setTimeout(function () {
        typing.remove();
        addMessage(getReply(userText), "bot");
      }, delay);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      addMessage(text, "user");
      input.value = "";
      input.focus();
      respond(text);
    });
  }

  /* ---------- 9. Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("toTop");
    if (!btn) return;

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          btn.classList.toggle("show", window.scrollY > 600);
          ticking = false;
        });
      }
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initMobileNav();
    initNavbarScroll();
    initSmoothScroll();
    initReveal();
    initActiveNav();
    initCounters();
    initParticles();
    initChat();
    initBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
