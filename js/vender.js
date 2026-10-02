/* Página comercial: renderiza planes, demos y datos del vendedor desde config.js */
(function () {
  "use strict";
  var C = window.__NEGOCIO__ || {}, V = C.vendedor || {};
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var wa = function (msg) { return "https://wa.me/" + (V.whatsapp || "") + "?text=" + encodeURIComponent(msg || V.mensaje || ""); };

  document.title = (V.nombre || "Turnos online") + " — Webs con turnos para tu local";
  $$('[data-v="nombre"]').forEach(function (e) { e.textContent = V.nombre || ""; });
  $$('[data-v="pin"]').forEach(function (e) { e.textContent = C.pinPanel || "1234"; });
  $$('[data-v="nota"]').forEach(function (e) { e.textContent = V.notaPlanes || ""; });
  $$("[data-wa]").forEach(function (a) { a.href = wa(); a.target = "_blank"; a.rel = "noopener"; });
  var mail = $("#mailLink"); if (mail && V.email) { mail.href = "mailto:" + V.email; mail.textContent = V.email; }
  $("#year").textContent = new Date().getFullYear();

  var ESTILOS = [
    { modo: "barberia", nombre: "Barbería", ejemplo: "Barbería Imperio", colores: ["#0f0e0c", "#c8a35b", "#efe9df"], texto: "Oscuro, clásico y masculino." },
    { modo: "salon", nombre: "Salón de belleza", ejemplo: "Maison Lumière", colores: ["#f8f3ee", "#a24d63", "#2b1d22"], texto: "Luminoso, elegante y femenino." },
    { modo: "spa", nombre: "Spa & estética", ejemplo: "Salvia Spa", colores: ["#f2f3ee", "#5d7a64", "#1f2a24"], texto: "Sereno, natural y de bienestar." },
    { modo: "unas", nombre: "Nail bar", ejemplo: "Nude Nail Bar", colores: ["#141113", "#e9a6b4", "#f6ece9"], texto: "Moderno, chic y con onda." }
  ];

  $("#heroPhone").src = "index.html?modo=barberia&limpio=1";

  $("#demoCards").innerHTML = ESTILOS.map(function (e) {
    return '<article class="democard"><div class="democard__sw">' + e.colores.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</div>" +
      "<h3>" + esc(e.nombre) + "</h3><p>" + esc(e.texto) + '</p><div class="democard__links">' +
      '<a class="btn btn--primary btn--sm" href="index.html?modo=' + e.modo + '&limpio=1" target="_blank" rel="noopener">Ver web</a>' +
      '<a class="btn btn--ghost btn--sm" href="admin.html?modo=' + e.modo + '" target="_blank" rel="noopener">Ver panel</a></div></article>';
  }).join("");

  var tryModes = $("#tryModes"), selected = "barberia";
  tryModes.innerHTML = ESTILOS.map(function (e) {
    return '<button type="button" data-mode="' + e.modo + '"' + (e.modo === selected ? ' class="is-active"' : "") + "><i style=\"background:" + e.colores[1] + '"></i>' + esc(e.nombre) + "</button>";
  }).join("");
  var form = $("#tryForm"), colorTouched = false;
  form.elements.color.addEventListener("input", function () { colorTouched = true; });
  tryModes.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-mode]"); if (!b) return;
    selected = b.getAttribute("data-mode");
    $$("#tryModes button").forEach(function (x) { x.classList.toggle("is-active", x === b); });
    if (!colorTouched) form.elements.color.value = ESTILOS.filter(function (e) { return e.modo === selected; })[0].colores[1];
  });
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var p = new URLSearchParams();
    p.set("modo", selected);
    p.set("nombre", form.elements.nombre.value.trim());
    if (colorTouched) p.set("color", form.elements.color.value.replace("#", ""));
    p.set("limpio", "1");
    window.open("index.html?" + p.toString(), "_blank", "noopener");
  });

  $("#plans").innerHTML = (V.planes || []).map(function (pl) {
    var msg = "¡Hola! Me interesa el plan " + pl.nombre + " para mi local.";
    return '<article class="plan' + (pl.destacado ? " plan--feat" : "") + '">' + (pl.destacado ? '<span class="plan__badge">Más elegido</span>' : "") +
      "<h3>" + esc(pl.nombre) + '</h3><p class="plan__price"><strong>' + esc(pl.precio) + "</strong><span>" + esc(pl.periodo) + "</span></p><ul>" +
      pl.incluye.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + '</ul><a class="btn ' + (pl.destacado ? "btn--primary" : "btn--ghost") +
      '" target="_blank" rel="noopener" href="' + esc(wa(msg)) + '">Quiero este plan</a></article>';
  }).join("");
})();
