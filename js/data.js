// ============================================================
// ORBUX · data.js
// Datos estáticos — COPY, TEMAS, AMENIDADES, TIPOS
// ============================================================

// ---------- TIPOS DE LUGAR ----------
export const TIPOS_TURISMO = ['finca','glamping','hotel','hosteria','turistico'];
export const TIPOS_INMO    = ['casa','apartamento','lote','oficina','bodega','local'];
export const TIPOS_VEH     = ['carro','automovil','camioneta','moto','tractomula'];

// ---------- TEMAS VISUALES ----------
export const TEMAS = {
  dorado:    'tema-dorado',
  azul:      'tema-azul',
  verde:     'tema-verde',
  coral:     'tema-coral',
  gris:      'tema-gris',
  bordo:     'tema-bordo',
  cobre:     'tema-cobre',
  turquesa:  'tema-turquesa',
  champagne: 'tema-champagne',
  lavanda:   'tema-lavanda',
  titanio:   'tema-titanio',
  esmeralda: 'tema-esmeralda',
};

export const TEMAS_META = [
  { val:'dorado',    bg:'#0d0f0a', ac:'#c9a84c', label:'Dorado luxury'        },
  { val:'azul',      bg:'#080c14', ac:'#2e7cbf', label:'Azul corporativo'     },
  { val:'verde',     bg:'#080f08', ac:'#4a8c42', label:'Verde naturaleza'     },
  { val:'coral',     bg:'#100808', ac:'#c0392b', label:'Coral vibrante'       },
  { val:'gris',      bg:'#0a0a0c', ac:'#8a9ab0', label:'Gris platino'         },
  { val:'bordo',     bg:'#0f0608', ac:'#8b1a3a', label:'Bordo elegante'       },
  { val:'cobre',     bg:'#0f0c08', ac:'#b87333', label:'Cobre premium'        },
  { val:'turquesa',  bg:'#080f0f', ac:'#0e9090', label:'Turquesa marino'      },
  { val:'champagne', bg:'#0f0f0e', ac:'#d4c5a9', label:'Champagne suave'      },
  { val:'lavanda',   bg:'#0d0b10', ac:'#8b7ab5', label:'Lavanda sofisticado'  },
  { val:'titanio',   bg:'#0a0a0c', ac:'#c8c8cc', label:'Titanio plateado'     },
  { val:'esmeralda', bg:'#080f0b', ac:'#1a7a4a', label:'Esmeralda profundo'   },
];

// ---------- AMENIDADES ----------
export const AMENIDADES_INFO = {
  piscina:      { label:'Piscina',           desc:'Refréscate rodeado de naturaleza'        },
  zonas_verdes: { label:'Zonas verdes',      desc:'Amplios jardines y senderos naturales'   },
  bbq:          { label:'BBQ / Fogón',       desc:'Zona de parrilla para compartir'         },
  wifi:         { label:'WiFi',              desc:'Conexión en zonas comunes'               },
  parking:      { label:'Parqueadero',       desc:'Estacionamiento propio'                  },
  restaurante:  { label:'Restaurante',       desc:'Gastronomía local disponible'            },
  eventos:      { label:'Salón de eventos',  desc:'Espacios para celebraciones'             },
  senderos:     { label:'Senderos',          desc:'Rutas naturales para caminar'            },
  rio:          { label:'Río / Quebrada',    desc:'Acceso directo al agua natural'          },
  jacuzzi:      { label:'Jacuzzi',           desc:'Relájate con vista al paisaje'           },
  deportes:     { label:'Deportes',          desc:'Canchas y zonas deportivas'              },
  cabalgata:    { label:'Cabalgata',         desc:'Recorridos a caballo por la finca'       },
  // Inmobiliaria
  parqueadero:    { label:'Parqueadero',       desc:'Estacionamiento propio'                },
  ascensor:       { label:'Ascensor',          desc:'Acceso fácil a todos los pisos'        },
  vigilancia:     { label:'Vigilancia 24h',    desc:'Seguridad permanente'                  },
  gimnasio:       { label:'Gimnasio',          desc:'Equipos modernos disponibles'          },
  salon_comunal:  { label:'Salón comunal',     desc:'Espacio para reuniones y eventos'      },
  terraza:        { label:'Terraza',           desc:'Vista panorámica desde las alturas'    },
  deposito:       { label:'Depósito',          desc:'Espacio adicional de almacenamiento'   },
  cuarto_util:    { label:'Cuarto útil',       desc:'Espacio versátil para tus necesidades' },
  amoblado:       { label:'Amoblado',          desc:'Listo para habitar'                    },
  // Vehículos
  aire:      { label:'Aire acondicionado', desc:'Confort térmico garantizado'          },
  abs:       { label:'Frenos ABS',         desc:'Frenado seguro en cualquier terreno'  },
  airbag:    { label:'Airbags',            desc:'Protección pasiva de última generación'},
  camara:    { label:'Cámara reversa',     desc:'Maniobras precisas y seguras'         },
  bluetooth: { label:'Bluetooth',          desc:'Conectividad total desde el volante'  },
  gps:       { label:'GPS',               desc:'Navegación integrada'                 },
  electrico: { label:'Eléctrico/Híbrido', desc:'Tecnología limpia y eficiente'        },
  sunroof:   { label:'Sunroof',           desc:'Apertura panorámica al cielo'         },
  cuero:     { label:'Tapicería cuero',   desc:'Acabados de lujo en el interior'      },
  '4x4':     { label:'4x4',              desc:'Tracción total para todo terreno'      },
  turbo:     { label:'Motor turbo',       desc:'Potencia y eficiencia combinadas'     },
  automatico:{ label:'Transmisión automática', desc:'Conducción fluida y cómoda'      },
};

export const AMENIDADES_POR_TIPO = {
  turismo: [
    'piscina','zonas_verdes','bbq','wifi','parking',
    'restaurante','eventos','senderos','rio','jacuzzi','deportes','cabalgata'
  ],
  inmobiliaria: [
    'parqueadero','ascensor','vigilancia','piscina','gimnasio',
    'bbq','zonas_verdes','salon_comunal','terraza','deposito','cuarto_util','amoblado'
  ],
  vehiculos: [
    'aire','abs','airbag','camara','bluetooth',
    'gps','electrico','sunroof','cuero','4x4','turbo','automatico'
  ],
};

// ---------- MÓDULOS POR TIPO ----------
export const MODULOS_POR_TIPO = {
  turismo:      ['galeria','amenidades','alojamiento','video360','mapa','contacto'],
  inmobiliaria: ['galeria','amenidades','mapa','contacto'],
  vehiculos:    ['galeria','amenidades','contacto'],
};

// ---------- COPY POR TIPO ----------
export const COPY = {
  turismo: {
    navCta:       'Consultar disponibilidad',
    heroBtn1:     'Explorar el lugar',
    heroBtn2:     'Consultar disponibilidad',
    heroTagDef:   'Descubre un lugar único para desconectarte y disfrutar.',
    introEyebrow: 'El lugar',
    introDesc2:   'Perfecta para familias, grupos o parejas que buscan desconectarse sin renunciar a la comodidad.',
    statsDef:     [{num:'360°',lbl:'Recorrido virtual'},{num:'4K',lbl:'Fotografía aérea'},{num:'∞',lbl:'Naturaleza'},{num:'24/7',lbl:'Atención'}],
    ctaEyebrow:   '¿Te interesa?',
    ctaH2:        'Tu próxima<br><em>desconexión</em> comienza aquí',
    ctaSub:       'Escríbenos y te contamos disponibilidad, tarifas y todo lo que necesitas para vivir esta experiencia.',
    ctaMicro:     'Respuesta en menos de 2 horas · Sin costo de cotización',
    ctaWa:        'Consultar disponibilidad',
    footerTag:    'Un lugar donde el tiempo se detiene',
    mapaEyebrow:  'Cómo llegar',
    mapaTitulo:   'Ubicación',
    mapaBtn:      'Consultar cómo llegar',
    mapaPuntos:   ['Acceso por vía pavimentada','Estacionamiento propio','Coordenadas disponibles al consultar'],
    shareMsg:     'Mira este lugar: ',
    alojTitle:    'Tipos de alojamiento',
    alojHint:     'Nombre · Capacidad. Ej: Cabaña privada / 2-4 personas',
    taglinePH:    'Escápate a la tranquilidad del llano',
  },
  inmobiliaria: {
    navCta:       'Agendar visita',
    heroBtn1:     'Ver la propiedad',
    heroBtn2:     'Agendar visita',
    heroTagDef:   'La propiedad que estabas buscando, ahora disponible.',
    introEyebrow: 'La propiedad',
    introDesc2:   'Ubicación estratégica, excelentes acabados y las condiciones ideales para tu inversión o tu nuevo hogar.',
    statsDef:     [{num:'0',lbl:'m² construidos'},{num:'0',lbl:'Habitaciones'},{num:'0',lbl:'Baños'},{num:'0',lbl:'Estrato'}],
    ctaEyebrow:   '¿Te interesa esta propiedad?',
    ctaH2:        'Agenda tu<br><em>visita</em> hoy mismo',
    ctaSub:       'Contáctanos y coordina una visita presencial o virtual. Sin compromisos, sin costos.',
    ctaMicro:     'Asesor disponible · Respuesta en menos de 1 hora',
    ctaWa:        'Agendar visita por WhatsApp',
    footerTag:    'Tu próximo hogar o inversión te espera',
    mapaEyebrow:  'Ubicación',
    mapaTitulo:   '¿Dónde está?',
    mapaBtn:      'Cómo llegar',
    mapaPuntos:   ['Zona de alta valorización','Vías de acceso principales','Cerca a colegios, centros comerciales y hospitales'],
    shareMsg:     'Mira esta propiedad: ',
    alojTitle:    'Espacios del inmueble',
    alojHint:     'Tipo · Detalle. Ej: Habitación principal / Con baño propio',
    taglinePH:    'El hogar que siempre soñaste',
  },
  vehiculo: {
    navCta:       'Solicitar cotización',
    heroBtn1:     'Ver detalles',
    heroBtn2:     'Solicitar cotización',
    heroTagDef:   'Potencia, diseño y tecnología en un solo vehículo.',
    introEyebrow: 'El vehículo',
    introDesc2:   'Ingeniería de alto nivel, confort de clase superior y un desempeño que se siente desde el primer arranque.',
    statsDef:     [{num:'—',lbl:'Cilindrada'},{num:'—',lbl:'Potencia'},{num:'—',lbl:'Año modelo'},{num:'—',lbl:'Km recorridos'}],
    ctaEyebrow:   '¿Te interesa este vehículo?',
    ctaH2:        'Tu próxima<br><em>máquina</em> te espera',
    ctaSub:       'Escríbenos para conocer precio, formas de pago, financiación y agendar una prueba de manejo.',
    ctaMicro:     'Respuesta inmediata · Prueba de manejo disponible',
    ctaWa:        'Consultar precio y disponibilidad',
    footerTag:    'Haz que cada ruta comience con carácter',
    mapaEyebrow:  'Dónde encontrarnos',
    mapaTitulo:   'Ubicación',
    mapaBtn:      'Cómo llegar al concesionario',
    mapaPuntos:   ['Atención con cita previa','Prueba de manejo disponible','Financiación y trámites en el lugar'],
    shareMsg:     'Mira este vehículo: ',
    alojTitle:    'Versiones disponibles',
    alojHint:     'Versión · Detalle. Ej: Full equipo / Color negro',
    taglinePH:    'Potencia y confort en un solo vehículo',
  },
};

// ---------- HINTS ADMIN ----------
export const ALOJ_TITLE = {
  turismo:      'Tipos de alojamiento',
  inmobiliaria: 'Espacios del inmueble',
  vehiculos:    'Versiones disponibles',
};

export const ALOJ_HINT = {
  turismo:      'Nombre · Capacidad. Ej: Cabaña privada / 2-4 personas',
  inmobiliaria: 'Tipo · Detalle. Ej: Habitación principal / Con baño propio',
  vehiculos:    'Versión · Detalle. Ej: Full equipo / Color negro',
};

export const STATS_PLACEHOLDER = {
  turismo:      [{n:'5',l:'Cabañas'},{n:'3ha',l:'Hectáreas'},{n:'20',l:'Personas máx'}],
  inmobiliaria: [{n:'120',l:'m²'},{n:'3',l:'Habitaciones'},{n:'2',l:'Baños'},{n:'5',l:'Estrato'}],
  vehiculos:    [{n:'2022',l:'Año'},{n:'45.000',l:'Km'},{n:'2.0L',l:'Motor'},{n:'Consult.',l:'Precio'}],
};

// ---------- CATEGORÍAS DE FOTOS ----------
export const CATS_LABELS = {
  general:     'Fotos generales',
  aerea:       'Vista aérea (dron)',
  espacios:    'Espacios / Habitaciones',
  piscina:     'Piscina',
  zonas_verdes:'Zonas verdes',
  bbq:         'BBQ / Fogón',
  senderos:    'Senderos',
  rio:         'Río / Quebrada',
  jacuzzi:     'Jacuzzi',
  deportes:    'Deportes',
  eventos:     'Salón de eventos',
  alojamiento: 'Alojamiento',
  actividades: 'Actividades',
  exterior:    'Exterior',
  interior:    'Interior',
  motor:       'Motor / Mecánica',
  tablero:     'Tablero / Interior',
};
