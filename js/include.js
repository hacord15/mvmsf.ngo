/*
 * include.js
 * 1) Replaces every <div data-include="path/to/file.html"></div> with that file's HTML
 * 2) Then wires up the header (scroll state + mobile menu) and the newsletter form
 *
 * NOTE: uses fetch(), so the site must be served over http(s)
 * (VS Code Live Server, `npx serve`, `python -m http.server`, or your real host).
 * Opening index.html directly via file:// will not load the partials.
 */
(function () {
  // ---------------------------------------------------------
  // 1) Includes
  // ---------------------------------------------------------
  async function loadIncludes() {
    var slots = document.querySelectorAll("[data-include]");

    await Promise.all(
      Array.prototype.map.call(slots, async function (slot) {
        var url = slot.getAttribute("data-include");
        try {
          var res = await fetch(url);
          if (!res.ok) throw new Error(res.status + " " + res.statusText);
          slot.outerHTML = await res.text();
        } catch (err) {
          console.error("[include] Failed to load " + url, err);
        }
      })
    );
  }

  // ---------------------------------------------------------
  // 2) Header — scroll state + mobile menu
  // ---------------------------------------------------------
  function initHeader() {
    var header = document.getElementById("site-header");
    var pill = document.getElementById("nav-pill");
    var menu = document.getElementById("mobile-menu");
    var toggle = document.getElementById("menu-toggle");
    if (!header || !pill || !menu || !toggle) return;

    function applyScrolled(scrolled) {
      header.classList.toggle("is-scrolled", scrolled);
      header.classList.toggle("bg-white", scrolled);
      header.classList.toggle("shadow-md", scrolled);
      header.classList.toggle("bg-transparent", !scrolled);

      pill.classList.toggle("mt-2", scrolled);
      pill.classList.toggle("mb-2", scrolled);
      pill.classList.toggle("mt-2.5", !scrolled);
    }

    window.addEventListener("scroll", function () {
      applyScrolled(window.scrollY > 50);
    });
    applyScrolled(window.scrollY > 50);

    var open = false;
    function setOpen(value) {
      open = value;
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("flex", open);
      toggle.textContent = open ? "✕" : "☰";
    }

    toggle.addEventListener("click", function () {
      setOpen(!open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });
  }

  // ---------------------------------------------------------
  // 3) Newsletter — safe to keep even if the section is commented out
  // ---------------------------------------------------------
  function initNewsletter() {
    var form = document.getElementById("newsletter-form");
    var email = document.getElementById("newsletter-email");
    var thanks = document.getElementById("newsletter-thanks");
    if (!form || !email || !thanks) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!email.value) return;
      thanks.classList.remove("hidden");
    });
  }

  // ---------------------------------------------------------
  // Boot
  // ---------------------------------------------------------
  async function init() {
    await loadIncludes();
    initHeader();
    initNewsletter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
