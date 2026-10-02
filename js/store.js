/* =====================================================================
   DATOS DE TURNOS — compartidos entre la web pública y el panel del dueño.
   En esta versión de demostración se guardan en el navegador
   (localStorage). Para uso real se reemplaza por una base de datos.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.__NEGOCIO__;
  if (!C) return;

  var KEY = "turnos-" + C.modo;
  var SEED_KEY = "turnos-seed-v2-" + C.modo;

  var pad = function (n) { return String(n).padStart(2, "0"); };
  var dateKey = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var toMin = function (h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; };
  var toHHMM = function (m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function code() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }

  function active(b) { return b.estado !== "cancelado"; }

  function isProFree(proId, dk, start, dur, ignoreCode) {
    return !all().some(function (b) {
      if (!active(b) || b.pro !== proId || b.date !== dk || b.code === ignoreCode) return false;
      var bs = toMin(b.time), be = bs + b.dur;
      return start < be && start + dur > bs;
    });
  }

  /* --------- Datos de ejemplo para que la demo se vea "viva" --------- */
  var NOMBRES = {
    barberia: ["Juan Pérez", "Matías Gómez", "Lucas Fernández", "Santiago Díaz", "Federico Ruiz", "Joaquín Torres", "Bruno Romero", "Facundo Sosa", "Agustín Álvarez", "Tomás Benítez", "Ignacio Medina", "Franco Herrera", "Gonzalo Castro", "Ezequiel Ríos", "Nahuel Molina"],
    otros: ["Lucía Martínez", "Sofía García", "Valentina López", "Camila Rodríguez", "Martina Sánchez", "Julieta Romero", "Agustina Díaz", "Florencia Acosta", "Micaela Ruiz", "Carolina Vega", "Paula Morales", "Antonella Ortiz", "Rocío Silva", "Daniela Navarro", "Belén Castro"]
  };

  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }

  function seed(force) {
    if (!C.esDemo) return;
    var done = null;
    try { done = localStorage.getItem(SEED_KEY); } catch (e) {}
    if (done && !force) return;

    var list = force ? [] : all().filter(function (b) { return !b.demo; });
    var names = C.modo === "barberia" ? NOMBRES.barberia : NOMBRES.otros;
    var clients = names.map(function (n, i) { return { nombre: n, telefono: "11 " + (4000 + i * 137) + " " + (1000 + i * 791) % 9000 }; });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    var r = rng(C.modo.length * 7919 + today.getMonth() * 31 + today.getDate());

    for (var off = -35; off <= 10; off++) {
      var d = new Date(today); d.setDate(d.getDate() + off);
      var dk = dateKey(d);
      if (C.diasCerrados.indexOf(dk) >= 0) continue;
      var shifts = C.horarios[d.getDay()] || [];
      var density = off < 0 ? 0.62 : off === 0 ? 0.55 : Math.max(0.12, 0.42 - off * 0.03);

      C.equipo.forEach(function (p) {
        var svcs = C.servicios.filter(function (s) { return p.servicios === "todos" || p.servicios.indexOf(s.id) >= 0; });
        shifts.forEach(function (sh) {
          var t = toMin(sh[0]), end = toMin(sh[1]);
          while (t < end) {
            var s = svcs[Math.floor(r() * svcs.length)];
            if (!s || t + s.duracion > end) break;
            if (r() < density) {
              var cl = clients[Math.floor(r() * clients.length)];
              var past = off < 0 || (off === 0 && t + s.duracion <= nowMin);
              var estado = past ? (r() < 0.9 ? "atendido" : "ausente") : "confirmado";
              list.push({
                code: code(), svcs: [s.id], pro: p.id, date: dk, time: toHHMM(t), dur: s.duracion, total: s.precio,
                nombre: cl.nombre, telefono: cl.telefono, email: "", nota: "",
                estado: estado, origen: r() < 0.7 ? "web" : "local",
                sena: C.sena && C.sena.activa && r() < 0.8 ? Math.round(s.precio * C.sena.porcentaje / 100) : 0,
                demo: true, creado: new Date(d.getTime() - 86400000 * 2).toISOString()
              });
              t += s.duracion;
            } else {
              t += C.intervaloTurnos;
            }
          }
        });
      });
    }
    save(list);
    try { localStorage.setItem(SEED_KEY, "1"); } catch (e) {}
  }

  window.__TURNOS__ = {
    all: all,
    save: save,
    code: code,
    isProFree: isProFree,
    add: function (b) { var l = all(); l.push(b); save(l); },
    update: function (c, patch) {
      save(all().map(function (b) { return b.code === c ? Object.assign({}, b, patch) : b; }));
    },
    remove: function (c) { save(all().filter(function (b) { return b.code !== c; })); },
    seed: seed,
    resetDemo: function () { seed(true); },
    util: { pad: pad, dateKey: dateKey, toMin: toMin, toHHMM: toHHMM }
  };

  seed(false);
})();
