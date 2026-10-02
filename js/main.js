/* =====================================================================
   LÓGICA DE LA WEB — render desde config.js + sistema de reservas
   (IIFE clásico, sin módulos: funciona en cualquier hosting estático)
   ===================================================================== */
(function () {
  "use strict";

  var C = window.__NEGOCIO__;
  if (!C) return;
  document.documentElement.classList.add("js");

  /* ---------------- Utilidades ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (n) { return C.moneda + Number(n).toLocaleString("es-AR"); };
  var toMin = function (hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; };
  var toHHMM = function (m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var dateKey = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var parseKey = function (k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var startOfDay = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  var DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  var fmtLargo = function (d) {
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  };
  var durTxt = function (m) {
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + " h" : "") + (h && r ? " " : "") + (r ? r + " min" : "");
  };
  var safe = function (fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); }
  };
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem("turnos-" + C.modo) || "[]"); } catch (e) { return []; } },
    set: function (v) { try { localStorage.setItem("turnos-" + C.modo, JSON.stringify(v)); } catch (e) {} }
  };
  var toastTimer;
  var toast = function (msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 3200);
  };
  var svcById = function (id) { return C.servicios.filter(function (s) { return s.id === id; })[0]; };
  var proById = function (id) { return C.equipo.filter(function (p) { return p.id === id; })[0]; };
  var fallbackImg = function (img) {
    img.addEventListener("error", function () {
      var d = document.createElement("div");
      d.className = "img-fallback"; d.textContent = "Tu foto acá";
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    }, { once: true });
  };
  var waLink = function (text) {
    return "https://wa.me/" + C.contacto.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  };

  /* ---------------- Contenido general ---------------- */
  function initContent() {
    document.title = C.nombre + " — Reservá tu turno online";
    if (C.modo === "salon") $('meta[name="theme-color"]').setAttribute("content", "#f8f3ee");

    var binds = {
      nombre: C.nombre,
      descripcion: C.descripcion,
      eslogan: C.eslogan,
      nosotrosTitulo: C.nosotrosTitulo,
      kicker: (C.modo === "salon" ? "Salón de belleza" : "Barbería") + " · Turnos online 24/7",
      anio: "+" + (C.cifras[0] ? C.cifras[0].valor : 10)
    };
    $$("[data-bind]").forEach(function (el) {
      var k = el.getAttribute("data-bind");
      if (binds[k] != null) el.textContent = binds[k];
    });
    $("#year").textContent = new Date().getFullYear();

    // Hero
    var hero = $("#heroImg"); hero.src = C.heroImagen; hero.alt = C.nombre;
    hero.addEventListener("error", function () { hero.classList.add("is-broken"); });
    var words = C.eslogan.split(" ");
    $("#heroTitle").innerHTML = words.map(function (w, i) {
      var inner = i === words.length - 1 ? "<em>" + esc(w) + "</em>" : esc(w);
      return '<span class="w"><span style="animation-delay:' + (0.15 + i * 0.09).toFixed(2) + 's">' + inner + "</span></span>";
    }).join(" ");
    $("#heroStats").innerHTML = C.cifras.map(function (c) {
      return '<li><strong data-count="' + c.valor + '" data-dec="' + (c.decimales || 0) + '" data-suf="' + esc(c.sufijo) + '">' +
        c.valor + esc(c.sufijo) + "</strong><span>" + esc(c.texto) + "</span></li>";
    }).join("");

    // Marquee
    var names = C.servicios.map(function (s) { return "<span>" + esc(s.nombre) + "</span>"; }).join("");
    $("#marqueeTrack").innerHTML = names + names;

    // Nosotros
    var about = $("#aboutImg"); fallbackImg(about); about.src = C.nosotrosImagen; about.alt = "Nuestro local";
    $("#aboutParas").innerHTML = C.nosotrosTexto.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");

    // Instagram
    var ig = $("#igLink");
    ig.href = "https://instagram.com/" + C.contacto.instagram;

    // WhatsApp flotante
    $("#waFloat").href = waLink("¡Hola " + C.nombre + "! Quería hacer una consulta.");
  }

  /* ---------------- Servicios / precios ---------------- */
  function initServices() {
    var cats = [];
    C.servicios.forEach(function (s) { if (cats.indexOf(s.categoria) < 0) cats.push(s.categoria); });
    var tabs = $("#serviceTabs"), list = $("#priceList");
    var all = ["Todos"].concat(cats);
    tabs.innerHTML = all.map(function (c, i) {
      return '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");

    function render(cat) {
      var items = C.servicios.filter(function (s) { return cat === "Todos" || s.categoria === cat; });
      list.innerHTML = items.map(function (s, i) {
        return '<button class="price" type="button" data-svc="' + esc(s.id) + '" style="animation-delay:' + (i * 0.04) + 's">' +
          '<span class="price__name">' + esc(s.nombre) + (s.destacado ? '<span class="price__tag">Favorito</span>' : "") + "</span>" +
          '<span class="price__value">' + money(s.precio) + "</span>" +
          '<span class="price__desc">' + esc(s.descripcion) + "</span>" +
          '<span class="price__dur">' + durTxt(s.duracion) + "</span>" +
          '<span class="price__book">Reservar este servicio →</span></button>';
      }).join("");
    }
    render("Todos");

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (!b) return;
      $$(".tab", tabs).forEach(function (t) { t.setAttribute("aria-selected", t === b); });
      render(b.getAttribute("data-cat"));
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".price"); if (!b) return;
      Booking.preselectService(b.getAttribute("data-svc"));
    });
  }

  /* ---------------- Galería + lightbox ---------------- */
  function initGallery() {
    var g = $("#gallery");
    if (g.children.length > 0) return;
    g.innerHTML = C.galeria.map(function (f, i) {
      return '<button class="gallery__item reveal" type="button" data-i="' + i + '" data-alt="' + esc(f.alt) + '">' +
        '<img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy"></button>';
    }).join("");
    $$("img", g).forEach(fallbackImg);

    var lb = $("#lightbox"), img = $("img", lb), cur = 0;
    function show(i) {
      cur = (i + C.galeria.length) % C.galeria.length;
      img.src = C.galeria[cur].src.replace(/w=\d+/, "w=1800"); img.alt = C.galeria[cur].alt;
    }
    function close() { lb.hidden = true; document.body.style.overflow = ""; }
    g.addEventListener("click", function (e) {
      var b = e.target.closest(".gallery__item"); if (!b || !$("img", b)) return;
      show(+b.getAttribute("data-i")); lb.hidden = false; document.body.style.overflow = "hidden";
    });
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__nav--prev", lb).addEventListener("click", function () { show(cur - 1); });
    $(".lightbox__nav--next", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* ---------------- Equipo ---------------- */
  function initTeam() {
    var t = $("#team");
    t.innerHTML = C.equipo.map(function (p) {
      return '<article class="member reveal"><div class="member__photo"><img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy"></div>' +
        "<h3>" + esc(p.nombre) + "</h3><p>" + esc(p.rol) + '</p><button type="button" data-pro="' + esc(p.id) + '">Reservar con ' + esc(p.nombre) + " →</button></article>";
    }).join("");
    $$("img", t).forEach(fallbackImg);
    t.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pro]"); if (!b) return;
      Booking.preferPro(b.getAttribute("data-pro"));
    });
  }

  /* ---------------- Testimonios / FAQ / horarios / footer ---------------- */
  function initQuotes() {
    $("#quotes").innerHTML = C.testimonios.map(function (q) {
      return '<figure class="quote reveal"><div class="quote__stars">' + "★★★★★".slice(0, q.estrellas || 5) + "</div><blockquote>“" +
        esc(q.texto) + "”</blockquote><figcaption>— " + esc(q.autor) + "</figcaption></figure>";
    }).join("");
  }
  function initFaq() {
    $("#faqList").innerHTML = C.faq.map(function (f) {
      return "<details><summary>" + esc(f.p) + "</summary><p>" + esc(f.r) + "</p></details>";
    }).join("");
  }

  var ICON = {
    pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/></svg>'
  };

  function initHours() {
    var orden = [1, 2, 3, 4, 5, 6, 0], hoy = new Date().getDay();
    $("#hoursTable").innerHTML = "<tbody>" + orden.map(function (d) {
      var h = C.horarios[d] || [];
      var txt = h.length ? h.map(function (r) { return r[0] + " – " + r[1]; }).join(" · ") : '<span class="closed">Cerrado</span>';
      return '<tr class="' + (d === hoy ? "is-today" : "") + '"><td>' + DIAS[d] + "</td><td>" + txt + "</td></tr>";
    }).join("") + "</tbody>";

    var k = C.contacto;
    $("#contactList").innerHTML =
      "<li>" + ICON.pin + "<span>" + esc(k.direccion) + "</span></li>" +
      "<li>" + ICON.phone + '<a href="' + esc(waLink()) + '" target="_blank" rel="noopener">' + esc(k.telefono) + "</a></li>" +
      "<li>" + ICON.mail + '<a href="mailto:' + esc(k.email) + '">' + esc(k.email) + "</a></li>" +
      "<li>" + ICON.ig + '<a href="https://instagram.com/' + esc(k.instagram) + '" target="_blank" rel="noopener">@' + esc(k.instagram) + "</a></li>";
    $("#mapFrame").src = "https://maps.google.com/maps?q=" + encodeURIComponent(k.mapaQuery || k.direccion) + "&z=15&output=embed";

    $("#footerCols").innerHTML =
      "<div><h5>Explorar</h5><ul><li><a href=\"#servicios\">Servicios</a></li><li><a href=\"#galeria\">Galería</a></li><li><a href=\"#equipo\">Equipo</a></li><li><a href=\"#reservar\">Reservar</a></li></ul></div>" +
      "<div><h5>Contacto</h5><ul><li>" + esc(k.direccion) + '</li><li><a href="' + esc(waLink()) + '" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="mailto:' + esc(k.email) + '">' + esc(k.email) + "</a></li></ul></div>" +
      '<div><h5>Seguinos</h5><ul><li><a href="https://instagram.com/' + esc(k.instagram) + '" target="_blank" rel="noopener">Instagram</a></li></ul></div>';
  }

  /* Abierto / cerrado en vivo */
  function initStatus() {
    var pill = $("#statusPill");
    function upd() {
      var now = new Date(), m = now.getHours() * 60 + now.getMinutes();
      var r = (C.horarios[now.getDay()] || []).filter(function (x) { return m >= toMin(x[0]) && m < toMin(x[1]); })[0];
      var closedToday = C.diasCerrados.indexOf(dateKey(now)) >= 0;
      pill.hidden = false;
      pill.classList.toggle("is-open", !!r && !closedToday);
      $("span", pill).textContent = r && !closedToday ? "Abierto · cierra " + r[1] : "Cerrado ahora";
    }
    upd(); setInterval(upd, 60000);
  }

  /* ---------------- Reservas ---------------- */
  var Booking = (function () {
    var st = { step: 1, svcs: [], pro: null, date: null, time: null, month: null };
    var preferred = null;
    var box = $("#booking");

    function selectedSvcs() { return st.svcs.map(svcById).filter(Boolean); }
    function totalDur() { return selectedSvcs().reduce(function (a, s) { return a + s.duracion; }, 0); }
    function totalPrice() { return selectedSvcs().reduce(function (a, s) { return a + s.precio; }, 0); }
    function capablePros() {
      return C.equipo.filter(function (p) {
        return p.servicios === "todos" || st.svcs.every(function (id) { return p.servicios.indexOf(id) >= 0; });
      });
    }
    function candidatePros() {
      if (st.pro && st.pro !== "any") return [proById(st.pro)];
      return capablePros();
    }

    function isProFree(proId, dk, start, dur) {
      return !store.get().some(function (b) {
        if (b.pro !== proId || b.date !== dk) return false;
        var bs = toMin(b.time), be = bs + b.dur;
        return start < be && start + dur > bs;
      });
    }
    function slotsFor(dk) {
      var d = parseKey(dk), dur = totalDur(), out = [];
      if (!dur) return out;
      var now = new Date(), isToday = dk === dateKey(now);
      var minStart = isToday ? now.getHours() * 60 + now.getMinutes() + C.anticipacionMinima : -1;
      var pros = candidatePros();
      (C.horarios[d.getDay()] || []).forEach(function (r) {
        for (var t = toMin(r[0]); t + dur <= toMin(r[1]); t += C.intervaloTurnos) {
          if (t < minStart) continue;
          var free = pros.filter(function (p) { return isProFree(p.id, dk, t, dur); });
          if (free.length) out.push({ t: t, pro: free[0].id });
        }
      });
      return out;
    }
    function dayOpen(d) {
      var today = startOfDay(new Date());
      var last = new Date(today); last.setDate(last.getDate() + C.diasReservables);
      if (d < today || d > last) return false;
      if (!(C.horarios[d.getDay()] || []).length) return false;
      if (C.diasCerrados.indexOf(dateKey(d)) >= 0) return false;
      return slotsFor(dateKey(d)).length > 0;
    }

    /* Paso 1 */
    function renderSvcs() {
      var cats = [], html = "";
      C.servicios.forEach(function (s) { if (cats.indexOf(s.categoria) < 0) cats.push(s.categoria); });
      cats.forEach(function (c) {
        html += '<p class="svc-group">' + esc(c) + "</p>";
        C.servicios.filter(function (s) { return s.categoria === c; }).forEach(function (s) {
          var on = st.svcs.indexOf(s.id) >= 0;
          html += '<button type="button" class="opt' + (on ? " is-selected" : "") + '" data-id="' + esc(s.id) + '" aria-pressed="' + on + '">' +
            '<span class="opt__check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span>' +
            '<span class="opt__body"><strong>' + esc(s.nombre) + "</strong><small>" + durTxt(s.duracion) + " · " + esc(s.descripcion) + "</small></span>" +
            '<span class="opt__price">' + money(s.precio) + "</span></button>";
        });
      });
      $("#svcPick").innerHTML = html;
    }
    $("#svcPick").addEventListener("click", function (e) {
      var b = e.target.closest(".opt"); if (!b) return;
      var id = b.getAttribute("data-id"), i = st.svcs.indexOf(id);
      if (i >= 0) st.svcs.splice(i, 1); else st.svcs.push(id);
      b.classList.toggle("is-selected", i < 0); b.setAttribute("aria-pressed", i < 0);
      st.time = null;
      if (st.pro && st.pro !== "any" && capablePros().map(function (p) { return p.id; }).indexOf(st.pro) < 0) st.pro = null;
      update();
    });

    /* Paso 2 */
    function renderPros() {
      var pros = capablePros();
      if (preferred && !st.pro && pros.some(function (p) { return p.id === preferred; })) st.pro = preferred;
      if (!pros.length) {
        $("#proPick").innerHTML = '<p class="slots__empty">Ningún profesional realiza todos esos servicios juntos. Probá reservarlos por separado.</p>';
        return;
      }
      var html = "";
      if (pros.length > 1) {
        html += '<button type="button" class="opt pro' + (st.pro === "any" ? " is-selected" : "") + '" data-id="any"><span class="pro__avatar">✦</span><span><strong>Cualquiera</strong><small>Primer horario libre</small></span></button>';
      }
      html += pros.map(function (p) {
        return '<button type="button" class="opt pro' + (st.pro === p.id ? " is-selected" : "") + '" data-id="' + esc(p.id) + '">' +
          '<span class="pro__avatar"><img src="' + esc(p.foto) + '" alt="" onerror="this.remove()"></span>' +
          "<span><strong>" + esc(p.nombre) + "</strong><small>" + esc(p.rol) + "</small></span></button>";
      }).join("");
      $("#proPick").innerHTML = html;
      if (pros.length === 1 && !st.pro) { st.pro = pros[0].id; $("#proPick .opt").classList.add("is-selected"); }
    }
    $("#proPick").addEventListener("click", function (e) {
      var b = e.target.closest(".opt"); if (!b) return;
      st.pro = b.getAttribute("data-id"); st.time = null; st.date = null;
      $$("#proPick .opt").forEach(function (x) { x.classList.toggle("is-selected", x === b); });
      update();
    });

    /* Paso 3 */
    function renderCalendar() {
      var today = startOfDay(new Date());
      if (!st.month) st.month = new Date(today.getFullYear(), today.getMonth(), 1);
      var m = st.month, y = m.getFullYear(), mo = m.getMonth();
      var last = new Date(today); last.setDate(last.getDate() + C.diasReservables);
      var first = new Date(y, mo, 1), offset = (first.getDay() + 6) % 7; // semana arranca lunes
      var days = new Date(y, mo + 1, 0).getDate();
      var canPrev = y > today.getFullYear() || mo > today.getMonth();
      var canNext = new Date(y, mo + 1, 1) <= last;
      var html = '<div class="cal__head"><button type="button" data-nav="-1" aria-label="Mes anterior"' + (canPrev ? "" : " disabled") + ">‹</button>" +
        "<strong>" + first.toLocaleDateString("es-AR", { month: "long", year: "numeric" }) + "</strong>" +
        '<button type="button" data-nav="1" aria-label="Mes siguiente"' + (canNext ? "" : " disabled") + '>›</button></div><div class="cal__grid">' +
        ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map(function (d) { return '<span class="cal__dow">' + d + "</span>"; }).join("");
      for (var i = 0; i < offset; i++) html += "<span></span>";
      for (var d = 1; d <= days; d++) {
        var dt = new Date(y, mo, d), k = dateKey(dt), ok = dayOpen(dt);
        html += '<button type="button" class="cal__day' + (k === dateKey(today) ? " is-today" : "") + (k === st.date ? " is-selected" : "") +
          '" data-date="' + k + '"' + (ok ? "" : " disabled") + ">" + d + "</button>";
      }
      $("#calendar").innerHTML = html + "</div>";
    }
    function firstOpenDay() {
      var d = startOfDay(new Date());
      for (var i = 0; i <= C.diasReservables; i++) {
        if (dayOpen(d)) return dateKey(d);
        d.setDate(d.getDate() + 1);
      }
      return null;
    }
    function renderSlots() {
      var label = $("#slotsLabel"), grid = $("#slots");
      if (!st.date) { label.textContent = "Elegí un día"; grid.innerHTML = '<p class="slots__empty">No hay días disponibles.</p>'; return; }
      label.textContent = fmtLargo(parseKey(st.date));
      var s = slotsFor(st.date);
      grid.innerHTML = s.length ? s.map(function (x) {
        var h = toHHMM(x.t);
        return '<button type="button" class="slot' + (st.time === h ? " is-selected" : "") + '" data-time="' + h + '" data-pro="' + esc(x.pro) + '">' + h + "</button>";
      }).join("") : '<p class="slots__empty">No quedan horarios este día.</p>';
    }
    $("#calendar").addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav && !nav.disabled) {
        st.month = new Date(st.month.getFullYear(), st.month.getMonth() + +nav.getAttribute("data-nav"), 1);
        renderCalendar(); return;
      }
      var b = e.target.closest(".cal__day"); if (!b || b.disabled) return;
      st.date = b.getAttribute("data-date"); st.time = null;
      renderCalendar(); renderSlots(); update();
    });
    $("#slots").addEventListener("click", function (e) {
      var b = e.target.closest(".slot"); if (!b) return;
      st.time = b.getAttribute("data-time"); st.slotPro = b.getAttribute("data-pro");
      $$("#slots .slot").forEach(function (x) { x.classList.toggle("is-selected", x === b); });
      update();
    });

    /* Resumen + navegación */
    function update() {
      var svcs = selectedSvcs();
      $("#summaryList").innerHTML = svcs.length ? svcs.map(function (s) {
        return "<li><span>" + esc(s.nombre) + "</span><span>" + money(s.precio) + "</span></li>";
      }).join("") : '<li class="muted">Todavía no elegiste servicios.</li>';
      var proName = st.pro === "any" ? "Cualquiera" : st.pro ? proById(st.pro).nombre : "—";
      if (st.pro === "any" && st.time && st.slotPro) proName = proById(st.slotPro).nombre;
      $("#sumPro").textContent = proName;
      $("#sumDate").textContent = st.date ? fmtLargo(parseKey(st.date)).replace(/^\w/, function (c) { return c.toUpperCase(); }) + (st.time ? " · " + st.time : "") : "—";
      $("#sumDur").textContent = svcs.length ? durTxt(totalDur()) : "—";
      $("#sumTotal").textContent = money(totalPrice());

      var ok = { 1: svcs.length > 0, 2: !!st.pro && capablePros().length > 0, 3: !!st.date && !!st.time, 4: true }[st.step];
      var next = $("#nextBtn");
      next.disabled = !ok;
      next.textContent = st.step === 4 ? "Confirmar turno" : "Continuar";
      $("#prevBtn").hidden = st.step === 1 || st.step === 5;
      $("#summary").style.display = st.step === 5 ? "none" : "";
      box.classList.toggle("is-finished", st.step === 5);
      $$("#steps li").forEach(function (li, i) {
        li.classList.toggle("is-active", i + 1 === st.step);
        li.classList.toggle("is-done", i + 1 < st.step);
      });
    }

    function go(step) {
      st.step = step;
      $$(".pane", box).forEach(function (p) { p.classList.toggle("is-active", +p.getAttribute("data-pane") === step); });
      if (step === 1) renderSvcs();
      if (step === 2) renderPros();
      if (step === 3) {
        if (!st.date || !dayOpen(parseKey(st.date))) { st.date = firstOpenDay(); st.time = null; }
        if (st.date) { var d = parseKey(st.date); st.month = new Date(d.getFullYear(), d.getMonth(), 1); }
        renderCalendar(); renderSlots();
      }
      update();
      var top = box.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
    }

    $("#nextBtn").addEventListener("click", function () {
      if (st.step < 4) return go(st.step + 1);
      confirm();
    });
    $("#prevBtn").addEventListener("click", function () { if (st.step > 1) go(st.step - 1); });

    function validate() {
      var f = $("#bookingForm"), ok = true;
      ["nombre", "telefono"].forEach(function (n) {
        var inp = f.elements[n], v = inp.value.trim();
        var bad = n === "nombre" ? v.length < 3 : v.replace(/\D/g, "").length < 8;
        inp.closest(".field").classList.toggle("has-error", bad);
        if (bad) ok = false;
      });
      var em = f.elements.email;
      var badEmail = em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
      em.closest(".field").classList.toggle("has-error", !!badEmail);
      if (badEmail) ok = false;
      if (!ok) toast("Revisá los datos marcados en rojo.");
      return ok;
    }

    function confirm() {
      if (!validate()) return;
      var dur = totalDur(), t = toMin(st.time);
      var pro = st.pro === "any" ? st.slotPro : st.pro;
      if (!isProFree(pro, st.date, t, dur)) { toast("Ese horario se acaba de ocupar. Elegí otro."); return go(3); }
      var f = $("#bookingForm");
      var b = {
        code: Math.random().toString(36).slice(2, 7).toUpperCase(),
        svcs: st.svcs.slice(), pro: pro, date: st.date, time: st.time, dur: dur, total: totalPrice(),
        nombre: f.elements.nombre.value.trim(), telefono: f.elements.telefono.value.trim(),
        email: f.elements.email.value.trim(), nota: f.elements.nota.value.trim(),
        recordatorio: f.elements.recordatorio.checked, creado: new Date().toISOString()
      };
      var all = store.get(); all.push(b); store.set(all);
      showSuccess(b);
      renderMine();
    }

    function showSuccess(b) {
      var d = parseKey(b.date), names = b.svcs.map(function (id) { return svcById(id).nombre; }).join(" + ");
      var proName = proById(b.pro).nombre;
      $("#successText").textContent = b.nombre.split(" ")[0] + ", te esperamos el " + fmtLargo(d) + " a las " + b.time + " con " + proName + ".";
      $("#successCode").textContent = b.code;
      var msg = "¡Hola " + C.nombre + "! Reservé un turno:\n" +
        "• " + names + "\n• Con: " + proName + "\n• " + fmtLargo(d) + " a las " + b.time + "\n• Total: " + money(b.total) +
        "\n• A nombre de: " + b.nombre + " (" + b.telefono + ")" + (b.nota ? "\n• Nota: " + b.nota : "") + "\nCódigo: " + b.code;
      $("#waConfirm").href = waLink(msg);

      var s = new Date(d); s.setHours(0, toMin(b.time));
      var e = new Date(s.getTime() + b.dur * 60000);
      var fmt = function (x) { return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + "T" + pad(x.getHours()) + pad(x.getMinutes()) + "00"; };
      var title = names + " — " + C.nombre;
      $("#gcalLink").href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) +
        "&dates=" + fmt(s) + "/" + fmt(e) + "&details=" + encodeURIComponent("Con " + proName + ". Código " + b.code) +
        "&location=" + encodeURIComponent(C.contacto.direccion);
      $("#icsBtn").onclick = function () {
        var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + C.nombre + "//Turnos//ES", "BEGIN:VEVENT",
          "UID:" + b.code + "@turnos", "DTSTAMP:" + fmt(new Date()), "DTSTART:" + fmt(s), "DTEND:" + fmt(e),
          "SUMMARY:" + title, "LOCATION:" + C.contacto.direccion, "DESCRIPTION:Con " + proName + ". Código " + b.code,
          "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Recordatorio de turno", "END:VALARM",
          "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = "turno-" + b.code + ".ics"; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      };
      go(5);
    }

    $("#newBooking").addEventListener("click", function () {
      st = { step: 1, svcs: [], pro: null, date: null, time: null, month: null };
      preferred = null; $("#bookingForm").reset(); go(1);
    });

    /* Mis turnos (guardados en este navegador) */
    function renderMine() {
      var now = dateKey(new Date());
      var mine = store.get().filter(function (b) { return b.date >= now; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
      var box2 = $("#myBookings");
      box2.hidden = !mine.length;
      $("#myBookingsList").innerHTML = mine.map(function (b) {
        return "<li><span><strong>" + esc(fmtLargo(parseKey(b.date))) + " · " + esc(b.time) + "</strong><br><span class=\"muted\">" +
          esc(b.svcs.map(function (id) { var s = svcById(id); return s ? s.nombre : id; }).join(" + ")) + " con " + esc((proById(b.pro) || {}).nombre || "") +
          " · " + esc(b.code) + '</span></span><button type="button" data-cancel="' + esc(b.code) + '">Cancelar</button></li>';
      }).join("");
    }
    $("#myBookingsList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-cancel]"); if (!b) return;
      var code = b.getAttribute("data-cancel");
      if (!window.confirm("¿Cancelar el turno " + code + "?")) return;
      store.set(store.get().filter(function (x) { return x.code !== code; }));
      renderMine(); toast("Turno cancelado.");
      if (st.step === 3) { renderCalendar(); renderSlots(); }
    });

    renderSvcs(); update(); renderMine();

    return {
      preselectService: function (id) {
        if (st.step === 5) { st = { step: 1, svcs: [], pro: null, date: null, time: null, month: null }; }
        if (st.svcs.indexOf(id) < 0) st.svcs.push(id);
        st.time = null;
        go(1); toast(svcById(id).nombre + " agregado a tu reserva.");
      },
      preferPro: function (id) {
        preferred = id;
        if (st.step === 5) { st = { step: 1, svcs: [], pro: null, date: null, time: null, month: null }; }
        var p = proById(id);
        var can = !st.svcs.length || p.servicios === "todos" || st.svcs.every(function (s) { return p.servicios.indexOf(s) >= 0; });
        if (can) st.pro = id;
        go(st.svcs.length ? 2 : 1);
        toast("Vas a reservar con " + p.nombre + ". Elegí el servicio.");
      }
    };
  })();

  /* ---------------- Efectos ---------------- */
  function initNav() {
    var nav = $("#nav"), burger = $("#burger"), mcta = $(".mobile-cta");
    var booking = $("#reservar");
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 30);
      var r = booking.getBoundingClientRect();
      var inBooking = r.top < window.innerHeight && r.bottom > 0;
      mcta.classList.toggle("is-on", y > window.innerHeight * 0.7 && !inBooking);
    }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", open);
    });
    $$("#mobileMenu a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); });
    });

    // Link activo según sección
    var links = $$(".nav__links a");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle("is-current", l.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) io.observe(s); });
    }
  }

  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sibs = $$(".reveal", el.parentNode).filter(function (x) { return x.parentNode === el.parentNode; });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 0.08 + "s";
        el.classList.add("is-in"); io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    // Red de seguridad: si algo quedó oculto, mostrarlo igual
    setTimeout(function () { els.forEach(function (e) { e.classList.add("is-in"); }); }, 6000);
  }

  function initCounters() {
    $$("[data-count]").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count")), dec = +el.getAttribute("data-dec"), suf = el.getAttribute("data-suf");
      var t0 = null, dur = 1800;
      setTimeout(function () {
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * e).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 1000);
    });
  }

  function initParallax() {
    var media = $(".hero__media"), ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) media.style.transform = "translate3d(0," + y * 0.3 + "px,0)";
        ticking = false;
      });
    }, { passive: true });
  }

  function initDemoSwitch() {
    if (!C.mostrarSelectorDemo) return;
    var sw = $("#demoSwitch"); sw.hidden = false;
    $$("button", sw).forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-mode") === C.modo);
      b.addEventListener("click", function () {
        if (b.getAttribute("data-mode") === C.modo) return;
        try { localStorage.setItem("demo-modo", b.getAttribute("data-mode")); } catch (e) {}
        location.reload();
      });
    });
  }

  function boot() {
    safe(initContent, "content");
    safe(initServices, "services");
    safe(initGallery, "gallery");
    safe(initTeam, "team");
    safe(initQuotes, "quotes");
    safe(initFaq, "faq");
    safe(initHours, "hours");
    safe(initStatus, "status");
    safe(initNav, "nav");
    safe(initReveal, "reveal");
    safe(initCounters, "counters");
    safe(initParallax, "parallax");
    safe(initDemoSwitch, "demo");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
