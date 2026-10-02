/* =====================================================================
   CONFIGURACIÓN DEL NEGOCIO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitás tocar para personalizar la web:
   nombre, servicios, precios, horarios, equipo, fotos y contacto.

   MODO: "barberia" o "salon"  → cambia colores, textos y servicios.
   Para usar tus propias fotos, guardalas en assets/fotos/ y reemplazá
   las URLs por, por ejemplo: "assets/fotos/local-1.jpg"
   ===================================================================== */
(function () {
  "use strict";

  // Cambiá esto a "salon" para la versión salón de belleza femenino.
  var MODO = "barberia";

  // Muestra un selector flotante para alternar entre ambos modos (útil
  // para ver la demo). Ponelo en false cuando publiques la web.
  var MOSTRAR_SELECTOR_DEMO = true;

  var u = function (id, w) {
    return "https://images.unsplash.com/" + id + "?auto=format&fit=crop&q=75&w=" + (w || 1200);
  };

  /* ------------------------------------------------------------------ */
  var comunes = {
    moneda: "$",
    // Duración de cada bloque del calendario (minutos)
    intervaloTurnos: 30,
    // Cuántos días hacia adelante se puede reservar
    diasReservables: 30,
    // Anticipación mínima para reservar (minutos)
    anticipacionMinima: 60,
    // 0 = domingo, 1 = lunes … 6 = sábado. Podés tener turnos cortados.
    horarios: {
      1: [["10:00", "20:00"]],
      2: [["10:00", "20:00"]],
      3: [["10:00", "20:00"]],
      4: [["10:00", "21:00"]],
      5: [["10:00", "21:00"]],
      6: [["09:00", "14:00"], ["15:00", "19:00"]],
      0: []
    },
    // Fechas puntuales cerradas (feriados, vacaciones) formato AAAA-MM-DD
    diasCerrados: ["2026-12-25", "2027-01-01"],
    contacto: {
      whatsapp: "5491100000000", // código de país + número, sin + ni espacios
      telefono: "+54 9 11 0000-0000",
      email: "hola@tunegocio.com",
      instagram: "tunegocio",
      direccion: "Av. Siempreviva 742, Buenos Aires",
      mapaQuery: "Obelisco, Buenos Aires"
    }
  };

  /* ------------------------------------------------------------------ */
  var barberia = {
    nombre: "Barbería Imperio",
    nombreCorto: "Imperio",
    eslogan: "Oficio, navaja y buena charla.",
    descripcion:
      "Cortes clásicos y modernos, afeitado con toalla caliente y perfilado de barba. Un lugar para sentarse, desconectar y salir impecable.",
    heroImagen: u("photo-1503951914875-452162b0f3f1", 1800),
    nosotrosImagen: u("photo-1585747860715-2ba37e788b70", 1200),
    nosotrosTitulo: "Desde 2012, el sillón es nuestro taller.",
    nosotrosTexto: [
      "Empezamos con dos sillones y una radio vieja. Hoy somos un equipo que entiende la barbería como un oficio: tijera, navaja, paciencia y oído.",
      "Trabajamos con productos seleccionados, herramientas esterilizadas en cada servicio y turnos con el tiempo justo para que nadie te apure."
    ],
    cifras: [
      { valor: 14, sufijo: "", texto: "años de oficio" },
      { valor: 25, sufijo: "k+", texto: "cortes realizados" },
      { valor: 4.9, sufijo: "★", texto: "en Google", decimales: 1 }
    ],
    servicios: [
      { id: "corte", categoria: "Cortes", nombre: "Corte clásico", descripcion: "Tijera y máquina, lavado y peinado.", duracion: 40, precio: 12000, destacado: true },
      { id: "fade", categoria: "Cortes", nombre: "Fade / Degradé", descripcion: "Degradé a navaja con terminación prolija.", duracion: 45, precio: 14000 },
      { id: "nino", categoria: "Cortes", nombre: "Corte niño", descripcion: "Hasta 12 años.", duracion: 30, precio: 9000 },
      { id: "barba", categoria: "Barba", nombre: "Perfilado de barba", descripcion: "Diseño, rebaje y aceite hidratante.", duracion: 30, precio: 8000 },
      { id: "afeitado", categoria: "Barba", nombre: "Afeitado tradicional", descripcion: "Toalla caliente, navaja y bálsamo.", duracion: 40, precio: 11000 },
      { id: "combo", categoria: "Combos", nombre: "Corte + Barba", descripcion: "El combo de la casa.", duracion: 70, precio: 18000, destacado: true },
      { id: "ritual", categoria: "Combos", nombre: "Ritual Imperio", descripcion: "Corte, afeitado, limpieza facial y bebida.", duracion: 100, precio: 26000 },
      { id: "color", categoria: "Extras", nombre: "Color / Canas", descripcion: "Camuflaje de canas o color fantasía.", duracion: 60, precio: 16000 },
      { id: "cejas", categoria: "Extras", nombre: "Cejas", descripcion: "Perfilado con navaja o hilo.", duracion: 15, precio: 4000 }
    ],
    equipo: [
      { id: "martin", nombre: "Martín", rol: "Fundador · Clásicos y navaja", foto: u("photo-1507003211169-0a1dd7228f2d", 700), servicios: "todos" },
      { id: "leo", nombre: "Leo", rol: "Fades y diseños", foto: u("photo-1500648767791-00dcc994a43e", 700), servicios: ["corte", "fade", "nino", "barba", "combo", "cejas"] },
      { id: "nico", nombre: "Nico", rol: "Barba y afeitado", foto: u("photo-1506794778202-cad84cf45f1d", 700), servicios: ["corte", "barba", "afeitado", "combo", "ritual", "color"] }
    ],
    galeria: [
      { src: u("photo-1585747860715-2ba37e788b70"), alt: "Sillón de barbería" },
      { src: u("photo-1621605815971-fbc98d665033"), alt: "Corte en proceso" },
      { src: u("photo-1599351431202-1e0f0137899a"), alt: "Barbero trabajando" },
      { src: u("photo-1622286342621-4bd786c2447c"), alt: "Herramientas de barbería" },
      { src: u("photo-1605497788044-5a32c7078486"), alt: "Detalle de corte" },
      { src: u("photo-1512690459411-b9245aed614b"), alt: "Interior del local" }
    ],
    testimonios: [
      { texto: "El mejor fade que me hicieron. Puntuales con el turno y una onda bárbara.", autor: "Juan P.", estrellas: 5 },
      { texto: "El afeitado con toalla caliente es otra cosa. Vuelvo todos los meses.", autor: "Diego R.", estrellas: 5 },
      { texto: "Reservé desde el celu en un minuto. Llegué y me atendieron en el horario exacto.", autor: "Tomás G.", estrellas: 5 }
    ],
    faq: [
      { p: "¿Cómo cancelo o cambio mi turno?", r: "Escribinos por WhatsApp con al menos 3 horas de anticipación y lo reprogramamos sin cargo." },
      { p: "¿Qué medios de pago aceptan?", r: "Efectivo, débito, crédito, transferencia y Mercado Pago." },
      { p: "¿Atienden sin turno?", r: "Sí, si hay un hueco libre. Pero con turno te asegurás no esperar." },
      { p: "¿Qué pasa si llego tarde?", r: "Tenemos 10 minutos de tolerancia. Después puede que debamos acortar el servicio o reprogramar." }
    ]
  };

  /* ------------------------------------------------------------------ */
  var salon = {
    nombre: "Maison Lumière",
    nombreCorto: "Lumière",
    eslogan: "Belleza que se toma su tiempo.",
    descripcion:
      "Cortes, color, peinados, uñas y tratamientos en un espacio luminoso pensado para que te relajes. Reservá tu momento en segundos.",
    heroImagen: u("photo-1560066984-138dadb4c035", 1800),
    nosotrosImagen: u("photo-1522337360788-8b13dee7a37e", 1200),
    nosotrosTitulo: "Un salón donde el tiempo es tuyo.",
    nosotrosTexto: [
      "Creamos Lumière para que ir a la peluquería deje de ser un trámite. Escuchamos, asesoramos y trabajamos con calma.",
      "Usamos marcas profesionales, coloración libre de amoníaco y protocolos de higiene estrictos en cada estación."
    ],
    cifras: [
      { valor: 9, sufijo: "", texto: "años de trayectoria" },
      { valor: 18, sufijo: "k+", texto: "clientas felices" },
      { valor: 4.9, sufijo: "★", texto: "en Google", decimales: 1 }
    ],
    servicios: [
      { id: "corte", categoria: "Cabello", nombre: "Corte y brushing", descripcion: "Diagnóstico, lavado, corte y secado.", duracion: 60, precio: 22000, destacado: true },
      { id: "brushing", categoria: "Cabello", nombre: "Brushing", descripcion: "Lavado y secado con forma.", duracion: 40, precio: 12000 },
      { id: "peinado", categoria: "Cabello", nombre: "Peinado de evento", descripcion: "Recogidos, ondas y semirecogidos.", duracion: 60, precio: 28000 },
      { id: "color", categoria: "Color", nombre: "Color global", descripcion: "Tintura completa + matizador.", duracion: 120, precio: 38000 },
      { id: "balayage", categoria: "Color", nombre: "Balayage", descripcion: "Iluminación a mano alzada.", duracion: 180, precio: 65000, destacado: true },
      { id: "nutricion", categoria: "Tratamientos", nombre: "Nutrición profunda", descripcion: "Hidratación intensiva con ampolla.", duracion: 45, precio: 18000 },
      { id: "alisado", categoria: "Tratamientos", nombre: "Alisado / Keratina", descripcion: "Libre de formol.", duracion: 150, precio: 55000 },
      { id: "manicura", categoria: "Uñas", nombre: "Manicura semipermanente", descripcion: "Esmaltado que dura hasta 3 semanas.", duracion: 60, precio: 15000 },
      { id: "esculpidas", categoria: "Uñas", nombre: "Uñas esculpidas", descripcion: "Gel o acrílico, diseño simple.", duracion: 90, precio: 24000 },
      { id: "cejas", categoria: "Rostro", nombre: "Perfilado de cejas", descripcion: "Diseño con pinza o hilo.", duracion: 20, precio: 7000 },
      { id: "lifting", categoria: "Rostro", nombre: "Lifting de pestañas", descripcion: "Curvatura y tinte.", duracion: 60, precio: 20000 }
    ],
    equipo: [
      { id: "sofia", nombre: "Sofía", rol: "Directora · Color y balayage", foto: u("photo-1494790108377-be9c29b29330", 700), servicios: ["corte", "brushing", "color", "balayage", "nutricion", "alisado", "peinado"] },
      { id: "valen", nombre: "Valentina", rol: "Cortes y peinados", foto: u("photo-1534528741775-53994a69daeb", 700), servicios: ["corte", "brushing", "peinado", "nutricion", "alisado"] },
      { id: "cami", nombre: "Camila", rol: "Uñas, cejas y pestañas", foto: u("photo-1544005313-94ddf0286df2", 700), servicios: ["manicura", "esculpidas", "cejas", "lifting"] }
    ],
    galeria: [
      { src: u("photo-1560066984-138dadb4c035"), alt: "Interior del salón" },
      { src: u("photo-1562322140-8baeececf3df"), alt: "Peinado terminado" },
      { src: u("photo-1604654894610-df63bc536371"), alt: "Manicura" },
      { src: u("photo-1522337360788-8b13dee7a37e"), alt: "Estilista trabajando" },
      { src: u("photo-1487412947147-5cebf100ffc2"), alt: "Maquillaje" },
      { src: u("photo-1516975080664-ed2fc6a32937"), alt: "Estaciones del salón" }
    ],
    testimonios: [
      { texto: "Sofía entendió exactamente el tono que quería. El balayage quedó soñado.", autor: "Lucía M.", estrellas: 5 },
      { texto: "Un lugar hermoso y súper prolijo. Las uñas me duraron casi un mes.", autor: "Carla F.", estrellas: 5 },
      { texto: "Reservar online es comodísimo y siempre respetan el horario.", autor: "Agustina B.", estrellas: 5 }
    ],
    faq: [
      { p: "¿Cómo cancelo o cambio mi turno?", r: "Escribinos por WhatsApp con al menos 6 horas de anticipación y lo reprogramamos sin cargo." },
      { p: "¿Hacen prueba de color?", r: "Sí, para trabajos de color recomendamos una consulta previa gratuita de 15 minutos." },
      { p: "¿Qué medios de pago aceptan?", r: "Efectivo, débito, crédito, transferencia y Mercado Pago." },
      { p: "¿Atienden novias y eventos?", r: "Sí. Escribinos para armar un paquete a medida con prueba incluida." }
    ]
  };

  /* ------------------------------------------------------------------ */
  var guardado = null;
  try { guardado = localStorage.getItem("demo-modo"); } catch (e) {}
  if (MOSTRAR_SELECTOR_DEMO && (guardado === "barberia" || guardado === "salon")) MODO = guardado;

  var base = MODO === "salon" ? salon : barberia;
  var cfg = {};
  Object.keys(comunes).forEach(function (k) { cfg[k] = comunes[k]; });
  Object.keys(base).forEach(function (k) { cfg[k] = base[k]; });
  cfg.modo = MODO;
  cfg.mostrarSelectorDemo = MOSTRAR_SELECTOR_DEMO;

  window.__NEGOCIO__ = cfg;
})();
