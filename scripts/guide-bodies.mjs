// Contenido (en español) de cada guía propia. Solo conceptos generales de la
// saga Pokémon; todo dato específico de PokeMMO (cifras, precios, rutas,
// fechas, versiones) va en `verify` y debe confirmarse antes de publicar.
// Formato: { intro, sections: [[titulo, [puntos…]]], verify: [puntos…] }
// Para editar una guía: cambia aquí y ejecuta `npm run gen`.

export const bodies = {
  crianza: {
    intro: 'Criar consiste en obtener Pokémon con naturaleza e IVs deseados a partir de huevos.',
    sections: [
      ['Ideas clave', ['La naturaleza se puede transmitir con un objeto específico en el padre elegido.', 'Los IVs de los padres influyen en los del huevo: conviene empezar con padres con IVs altos.', 'Los huevos heredan la especie base de la madre (o de Ditto si participa).']],
      ['Flujo general', ['Define el objetivo: especie, naturaleza e IVs que necesitas.', 'Reúne padres compatibles (mismo grupo huevo).', 'Cría, eclosiona y selecciona; repite con la mejor cría.']],
    ],
    verify: ['Objetos exactos de herencia disponibles en PokeMMO y cuántos IVs transmiten.', 'Costes y límites de la guardería.'],
  },
  'evs-ivs': {
    intro: 'Los IVs son valores innatos (0–31 por estadística); los EVs se ganan entrenando.',
    sections: [
      ['EVs', ['Cada Pokémon tiene un máximo de 252 EVs por estadística y 510 en total (reglas de la saga).', 'Cada 4 EVs equivalen a 1 punto de estadística a nivel 100.']],
      ['IVs', ['Se fijan al nacer o capturar y no cambian con el entrenamiento.', 'Se buscan mediante crianza o captura selectiva.']],
    ],
    verify: ['Si PokeMMO aplica exactamente los topes 252/510 y las fórmulas de la generación usada.', 'Objetos que modifican la ganancia de EVs en PokeMMO.'],
  },
  'shiny-hunting': {
    intro: 'Un shiny es una variante de color poco frecuente; cazarlo requiere paciencia y método.',
    sections: [
      ['Ideas generales', ['La probabilidad es baja y cada encuentro es independiente: no existe "mala racha" que se compense.', 'Elige un método que puedas repetir muchas veces con comodidad.', 'Lleva un registro de encuentros para tener referencia.']],
    ],
    verify: ['Probabilidad real de shiny en PokeMMO y si algún método la modifica.', 'Métodos permitidos por las reglas del juego (evita herramientas no autorizadas).'],
  },
  'pvp-competitive': {
    intro: 'El PvP competitivo se basa en construir un equipo coherente y anticipar al rival.',
    sections: [
      ['Fundamentos', ['Cubre tus debilidades de tipo y equilibra roles (atacante, soporte, defensivo).', 'Elige naturaleza, EVs, objeto y movimientos con un propósito claro.', 'Estudia los Pokémon frecuentes del formato para prepararte.']],
    ],
    verify: ['Reglas y clausulas vigentes del formato en PokeMMO.', 'Lista actual de Pokémon, objetos o movimientos restringidos.'],
  },
  'farming-dinero': {
    intro: 'Ganar dinero consiste en convertir tu tiempo en recursos de forma eficiente.',
    sections: [
      ['Enfoques generales', ['Vender recursos o Pokémon que otros jugadores demanden.', 'Comparar el tiempo invertido con la ganancia por hora.', 'Reinvertir en objetivos que te ahorren tiempo.']],
    ],
    verify: ['Ganancia real por hora de cada método.', 'Precios y demanda actuales de cualquier objeto mencionado.'],
  },
  legendarios: {
    intro: 'Capturar un legendario suele ser un encuentro único; la preparación marca la diferencia.',
    sections: [
      ['Preparación', ['Lleva Pokémon con movimientos que reduzcan la vida sin derrotar al objetivo.', 'Usa estados alterados (sueño, parálisis) para mejorar la captura.', 'Guarda la partida y lleva suficientes Poké Balls.']],
    ],
    verify: ['Ubicación, nivel y condiciones de aparición de cada legendario en PokeMMO.', 'Si el encuentro es repetible y con qué restricciones.'],
  },
  'rutas-historia': {
    intro: 'Una visión general para avanzar por la historia sin atascarte.',
    sections: [
      ['Consejos', ['Sigue el orden natural de gimnasios y rutas de cada región.', 'Equilibra tu equipo antes de cada líder.', 'Anota objetos clave y MO necesarios para progresar.']],
    ],
    verify: ['Regiones disponibles y su orden recomendado en PokeMMO.', 'Requisitos de nivel o de misiones de cada tramo.'],
  },
  naturalezas: {
    intro: 'La naturaleza sube un 10 % una estadística y baja otra, salvo las neutras.',
    sections: [
      ['Cómo elegir', ['Sube la estadística que más usa tu Pokémon.', 'Baja la que menos necesita (por ejemplo, ataque físico en un atacante especial).', 'Las naturalezas neutras no modifican ninguna estadística.']],
    ],
    verify: ['Tabla completa de naturalezas con sus estadísticas afectadas (confirmar en una fuente fiable).'],
  },
  'habilidades-ocultas': {
    intro: 'Las habilidades ocultas son una tercera habilidad posible de ciertas especies.',
    sections: [
      ['Ideas clave', ['No todas las especies tienen habilidad oculta.', 'Suelen obtenerse por métodos especiales de captura o por crianza.']],
    ],
    verify: ['Métodos concretos para conseguir y transmitir habilidades ocultas en PokeMMO.', 'Especies con habilidad oculta disponible.'],
  },
  'huevos-eclosion': {
    intro: 'Eclosionar depende de los pasos que das con el huevo en el equipo.',
    sections: [
      ['Consejos generales', ['Cada huevo necesita un número de pasos según la especie.', 'Algunas habilidades reducen los pasos necesarios.', 'Lleva varios huevos a la vez para aprovechar el recorrido.']],
    ],
    verify: ['Pasos por especie y habilidades que aceleran la eclosión en PokeMMO.'],
  },
  'gtl-mercado': {
    intro: 'El mercado entre jugadores se rige por oferta y demanda.',
    sections: [
      ['Cómo analizarlo', ['Observa precios durante varios días antes de decidir.', 'Compara el precio con el coste de obtener el objeto tú mismo.', 'Diversifica y evita depender de un solo producto.']],
    ],
    verify: ['Funcionamiento actual del GTL: comisiones, límites y reglas.', 'Cualquier precio mencionado (cambian con frecuencia).'],
  },
  'tipos-efectividad': {
    intro: 'Cada ataque tiene un tipo que es fuerte, débil o ineficaz contra otros.',
    sections: [
      ['Conceptos', ['Un ataque súper eficaz hace el doble de daño; no muy eficaz, la mitad; algunos tipos son inmunes.', 'El bonus STAB (mismo tipo del ataque y del Pokémon) multiplica el daño ×1,5.', 'Un Pokémon de doble tipo combina las efectividades de ambos.']],
    ],
    verify: ['Qué tipos existen exactamente en PokeMMO (p. ej., si incluye el tipo Hada).', 'Tabla de efectividad vigente.'],
  },
  'primeros-pasos': {
    intro: 'Una orientación para tus primeras sesiones.',
    sections: [
      ['Para empezar', ['Crea tu cuenta desde el sitio oficial y sigue sus instrucciones de instalación.', 'Elige región e inicial con calma; podrás ampliar tu equipo después.', 'Únete a la comunidad para resolver dudas.']],
    ],
    verify: ['Requisitos y pasos de registro/instalación actuales (consulta el sitio oficial).', 'Contenido disponible para cuentas gratuitas y de pago.'],
  },
  'elegir-inicial': {
    intro: 'Tu inicial debe ayudarte con tu primer objetivo, sea historia, crianza o farmeo.',
    sections: [
      ['Cómo decidir', ['Piensa en la dificultad de los primeros gimnasios y en el tipo que cubre.', 'Considera su utilidad más adelante: comercio, crianza o combate.']],
    ],
    verify: ['Iniciales disponibles por región en PokeMMO.', 'Valor de mercado de cada inicial.'],
  },
  'hordas-ev': {
    intro: 'Las batallas de hordas enfrentan a varios Pokémon a la vez, lo que acelera el entrenamiento.',
    sections: [
      ['Ideas generales', ['Elige una horda cuyos Pokémon den los EVs de la estadística que buscas.', 'Usa un Pokémon que pueda derrotar a varios rivales por turno.', 'Controla tu avance para no sobrepasar los topes de EVs.']],
    ],
    verify: ['Ubicaciones de hordas y EVs que otorga cada especie en PokeMMO.', 'Existencia y efectos de objetos de entrenamiento de EVs.'],
  },
  'tiers-metajuego': {
    intro: 'Los tiers agrupan Pokémon por rendimiento para formar formatos equilibrados.',
    sections: [
      ['Conceptos', ['El metajuego es el conjunto de estrategias y equipos más usados.', 'Cambia con el tiempo según las reglas y el comportamiento de los jugadores.']],
    ],
    verify: ['Sistema de tiers oficial o de comunidad usado en PokeMMO y su lista actual.'],
  },
  'movimientos-tm': {
    intro: 'Los movimientos se aprenden por nivel, MT, crianza o tutores.',
    sections: [
      ['Ideas clave', ['Una MT enseña un movimiento si la especie es compatible.', 'Algunos movimientos solo se heredan mediante crianza.']],
    ],
    verify: ['Dónde se consiguen las MT y tutores en PokeMMO y si son de un solo uso.'],
  },
  'eventos-temporada': {
    intro: 'Los eventos son actividades por tiempo limitado, con recompensas especiales.',
    sections: [
      ['Cómo seguirlos', ['Consulta los canales oficiales del juego.', 'Anota las fechas de inicio y fin para planificar.']],
    ],
    verify: ['Calendario real de eventos (las fechas cambian; no las presentes como vigentes sin comprobar).'],
  },
  'pokedex-completar': {
    intro: 'Completar la Pokédex requiere organización por regiones y métodos de obtención.',
    sections: [
      ['Planificación', ['Lista qué especies faltan y dónde aparecen.', 'Agrupa las que se consiguen por evolución, intercambio o evento.']],
    ],
    verify: ['Especies obtenibles en cada región de PokeMMO.', 'Recompensas por completar la Pokédex, si las hay.'],
  },
  'pesca-recursos': {
    intro: 'La pesca permite obtener Pokémon y objetos en zonas de agua.',
    sections: [
      ['Ideas generales', ['Cada caña da acceso a distintos Pokémon acuáticos.', 'Algunas habilidades mejoran la probabilidad de picar.']],
    ],
    verify: ['Cañas disponibles, Pokémon por zona y rentabilidad de la pesca en PokeMMO.'],
  },
  'elite-cuatro': {
    intro: 'El Alto Mando es una serie de combates seguidos sin poder volver a una ciudad.',
    sections: [
      ['Preparación', ['Lleva suficientes objetos de curación.', 'Cubre los tipos de cada miembro con tu equipo.', 'Sube el nivel de tu equipo antes de intentarlo.']],
    ],
    verify: ['Equipos y niveles actuales del Alto Mando en cada región de PokeMMO.'],
  },
  'trading-seguro': {
    intro: 'Comerciar con seguridad evita pérdidas y estafas.',
    sections: [
      ['Buenas prácticas', ['Revisa siempre el intercambio antes de confirmarlo.', 'Desconfía de ofertas demasiado buenas o con prisa.', 'Nunca compartas tu contraseña con nadie.']],
    ],
    verify: ['Normas oficiales de intercambio y sanciones por estafas en PokeMMO.'],
  },
  'legendarios-evento': {
    intro: 'Un checklist ayuda a no olvidar nada antes de un evento de legendarios.',
    sections: [
      ['Checklist', ['Equipo preparado con movimientos de debilitar y de estado.', 'Poké Balls y objetos de curación suficientes.', 'Espacio libre en el equipo y en la caja.']],
    ],
    verify: ['Fechas, ubicación y reglas del evento (confirmar siempre en canales oficiales).'],
  },
};
