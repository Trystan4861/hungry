# Diseño de Hungry!

Este documento recoge las convenciones visuales y de interacción que ya aparecen en la aplicación. Describe el diseño actual; los valores son referencias observadas en los estilos, no un sistema formal de tokens.

## Principios visuales

- La interfaz es compacta y prioriza que las acciones de compra estén a mano.
- La aplicación usa una base oscura y controles de alto contraste.
- Los iconos identifican las secciones principales; el color identifica las categorías de productos.
- Las vistas ocupan el alto disponible y desplazan su propio contenido en lugar de desplazar toda la página.
- La navegación y las listas admiten interacción táctil, además de ratón y teclado donde el control lo permite.

## Colores

| Uso | Color observado |
| --- | --- |
| Fondo de página | Negro (`#000`) |
| Texto principal | Blanco (`#fff`) |
| Paneles y controles oscuros | Carbón (`#333`) |
| Navegación inactiva y carrusel de categorías | Gris oscuro (`#585858`) |
| Bordes y pistas de desplazamiento | Grises (`#555`, `#ccc`) |
| Navegación activa y superficies seleccionadas | Gris claro (`#e6e6e6`, `#fff`) |
| Resalte de opción al pasar el cursor | Gris claro (`lightgray`) con texto negro |
| Borde del campo de texto | Naranja arena (`sandybrown`) |

Las categorías tienen un color propio, editable desde la configuración. Los valores iniciales forman una gama saturada de rojos, naranjas, verdes, cian, azules y violetas. Los estados de acción usan las variantes semánticas de Bootstrap (`success`, `danger`, `info` y `warning`).

No hay una paleta centralizada en variables CSS: varios tonos grises están escritos directamente en los componentes. Al reutilizar un color, conserva su función visual y consulta sus valores actuales antes de introducir otro tono.

## Tipografía e iconos

- El texto normal hereda la fuente de sistema sans serif de Bootstrap.
- Los títulos usan la escala de encabezados de Bootstrap; algunos estados vacíos y etiquetas de acción se muestran en mayúsculas.
- Los emojis usan Noto Color Emoji cuando está disponible, con Segoe UI Emoji y Apple Color Emoji como alternativas.
- La navegación principal es iconográfica. Los iconos comunes se muestran en un área de aproximadamente `50 × 50 px`.
- Los iconos de supermercado y aplicación se cargan desde ImageKit; los recursos decorativos del carrusel de categorías están en el proyecto.

## Estructura y medidas

- La página ocupa el viewport (`100vh`) y no desplaza el `body`; el panel de la pestaña activa gestiona el desplazamiento vertical.
- La navegación tiene cinco pestañas de unos `50 px` de alto. La primera reserva unos `60 px`; las otras cuatro comparten el espacio restante.
- El contenedor general tiene un ancho mínimo de `350 px`; el contenido de las pestañas, de `290 px`.
- Las tarjetas usan fondo `#333`, relleno compacto y una sombra tenue. Las tarjetas de contenido suelen redondear las esquinas inferiores con un radio de `0.5 rem`.
- Los campos de texto y botones principales tienen unos `50 px` de alto. Las filas de producto tienen unos `30 px` de alto y el indicador de categoría, unos `25 px`.
- Los paneles de categorías y supermercados de configuración limitan su alto a unos `150 px` y desplazan su contenido internamente.

Bootstrap 5 aporta la cuadrícula y las utilidades de espaciado. `Style.scss` también define una escala de espacio de `0`, `0.25`, `0.5`, `1`, `1.5` y `3 rem`, con variantes para márgenes y rellenos. Sus puntos de corte declarados son `20`, `30`, `48`, `64`, `80` y `120 em` (`xxs` a `xl`).

## Navegación y tarjetas

- Las pestañas inactivas tienen fondo `#585858` y contenido claro; la pestaña activa tiene fondo `#e6e6e6` y contenido oscuro.
- El contenido de cada pestaña se presenta dentro de tarjetas oscuras. El redondeo de los bordes depende de la posición y del contexto de la tarjeta.
- En pantallas estrechas, la cuadrícula de configuración apila sus secciones; en anchos mayores, las organiza en dos o más columnas.
- Mantén una jerarquía clara entre el encabezado de sección, el contenido y las acciones, usando las utilidades de Bootstrap ya presentes.

## Categorías

- Las categorías se presentan en una sola fila con desplazamiento horizontal y ajuste de desplazamiento (`scroll-snap`) cercano al centro.
- Cada categoría usa un recuadro de color con borde negro fino, dentro de un marco gris. La selección se distingue con un marco blanco y una sombra discreta.
- El nombre de la categoría aparece centrado sobre una etiqueta negra translúcida con texto blanco.
- Los laterales y el fondo del carrusel usan imágenes de sombra para insinuar que hay más contenido fuera del área visible.
- En navegadores basados en WebKit, las barras de desplazamiento usan una pista gris y un control claro de unos `4 px`. Pasar el cursor no debe cambiar la altura del carrusel ni de la barra.

## Productos y listas

- Cada producto muestra un marcador del color de su categoría y el nombre en una fila compacta.
- Los productos seleccionados usan texto en negrita; los completados en la lista de compra se tachan.
- Las cantidades y sus controles aparecen junto al producto cuando corresponden.
- Las listas largas se desplazan dentro de su tarjeta. La búsqueda y los totales se mantienen junto al inicio de la lista.
- Los estados vacíos se comunican con un mensaje centrado, destacado y en mayúsculas.

## Formularios y acciones

- Los campos de texto ocupan el ancho disponible, miden unos `50 px` de alto y usan un borde de `2 px` color `sandybrown`.
- Los selectores usan una superficie oscura, borde gris y texto claro. El menú de opciones usa fondo gris; la opción bajo el cursor cambia a gris claro con texto negro.
- Los botones reutilizan los colores semánticos de Bootstrap. El componente de botón ocupa todo el ancho disponible, mide unos `50 px` y muestra su etiqueta en mayúsculas por defecto.
- Los interruptores personalizados tienen forma de cápsula, una perilla circular y una transición breve. El estado deshabilitado reduce la opacidad y aplica escala de grises.
- Los diálogos de SweetAlert2 se abren dentro del área de la aplicación y usan una sombra oscura suave.

## Adaptación e interacción

- Usa la cuadrícula responsive de Bootstrap para cambiar de columnas a filas según el ancho.
- Conserva el desplazamiento horizontal del carrusel de categorías y el desplazamiento vertical de paneles y listas cuando el contenido excede el área disponible.
- Las interacciones de producto incluyen toque, pulsación larga y arrastre; las categorías admiten selección y pulsación larga para cambiar su nombre.
- Los cambios de estado deben ser perceptibles por su superficie, peso tipográfico o tachado, además del color.
- Evita que `:hover` cambie las dimensiones del componente: el movimiento del cursor no debe desplazar el contenido ni alterar la geometría de las barras de desplazamiento.

## Consideraciones para cambios futuros

- Los estilos combinan utilidades de Bootstrap, reglas globales y estilos locales de cada componente. Antes de crear una variante, revisa si ya existe una regla equivalente.
- Los valores de color y espaciado descritos aquí están dispersos en el código; no deben tratarse como variables CSS disponibles.
- El estilo de foco no es uniforme: `MyInput` suprime el contorno de `:focus-visible`. Los controles nuevos deben conservar un indicador de foco visible para navegación con teclado.
