# RIIIACD — Portal institucional (fase 1: frontend)

Frontend del portal de la **Red de Investigación e Innovación en Inteligencia Artificial y Ciencia de Datos (RIIIACD)**, del entorno del Tecnológico Nacional de México (TecNM).

React 19 · Vite 7 · TypeScript estricto · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide · Recharts.

## Requisitos

- Node.js **20.19 o superior** (requisito de Vite 7).
- npm 10 o superior.

## Instalación y ejecución

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
```

Otros comandos:

```bash
npm run typecheck  # verificación de tipos (tsc -b)
npm run build      # verificación de tipos + compilación de producción en dist/
npm run preview    # sirve la compilación de producción
```

Variables de entorno opcionales: copia `.env.example` como `.env.local`.

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `VITE_SHOW_DEMO_DATA` | `false` oculta integrantes e instituciones demostrativos | `true` |
| `VITE_API_BASE_URL` | URL de la futura API; vacía = datos locales | vacía |
| `VITE_MOCK_LATENCY_MS` | Retardo simulado para ver estados de carga | `350` |

> **Despliegue:** el sitio usa rutas del navegador (`/integrantes`, `/nosotros`…). En el servidor configura la reescritura de cualquier ruta a `index.html` (p. ej. `try_files $uri /index.html;` en Nginx).

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Hero con grafo de la red, cifras, presentación, líneas, objetivo, liderazgo y accesos |
| `/nosotros` | Quiénes somos, contexto, objetivo, organigrama, liderazgo, colaboración |
| `/lineas-investigacion` | Las cinco líneas oficiales con responsable |
| `/lineas-investigacion/:slug` | Detalle de una línea y acceso a sus integrantes |
| `/integrantes` | Directorio: búsqueda, filtros (institución, línea, rol), orden, paginación y ficha |
| `/instituciones` | Composición por tipo (gráfica), catálogo filtrable con espacio para logotipos |
| `/contacto` | Correo institucional, líder de la red y formulario con validación |

Los filtros del directorio viven en la URL (`/integrantes?linea=linea-3&institucion=cenidet&pagina=2`), por lo que se pueden compartir y enlazar desde otras páginas. La ficha de un integrante también: `?integrante=<id>`.

## Estructura

```text
src/
├── assets/            logos/ (logotipos oficiales), images/, icons/
├── components/
│   ├── common/        Button, SectionTitle, LoadingState, StatusMessage (vacío/error), Reveal,
│   │                  Logo, Monogram, PageHeader, Notice, SelectField
│   ├── layout/        Navbar, Footer, MainLayout (transición entre páginas, salto al contenido)
│   ├── home/          Hero, NetworkGraph, Statistics, AboutPreview, ResearchPreview,
│   │                  Objective, Leadership, Collaboration
│   ├── members/       MemberCard, MemberFilters, MemberSearch, MemberDetails, Pagination
│   ├── research/      ResearchCard
│   ├── institutions/  InstitutionCard, InstitutionChart
│   └── contact/       ContactForm
├── config/            site.ts (nombre, correo, rutas, navegación), dataSource.ts
├── data/              members.ts, researchLines.ts, institutions.ts, statistics.ts, content.ts
├── hooks/             useMembers, useInstitutions, useMemberFilters, useAsyncResource, useDocumentTitle
├── pages/             Home, About, ResearchLines, ResearchLineDetail, Members, Institutions, Contact, NotFound
├── routes/            AppRouter.tsx (páginas con carga diferida)
├── services/          http.ts, membersService.ts, institutionsService.ts
├── styles/            globals.css (tokens de diseño)
├── theme/             lineThemes.ts (icono y color por línea), institutionTheme.ts
├── types/             member.ts, research.ts, institution.ts, statistics.ts, filters.ts, content.ts
└── utils/             memberMapper.ts, filters.ts, institutions.ts, networkGraph.ts, text.ts, cn.ts
```

Cambios respecto a la estructura propuesta y su motivo:

- **`services/`**: los componentes nunca leen `src/data` para datos de directorio; lo piden a un servicio que hoy resuelve con datos locales y mañana con la API. Cambiar de origen es tocar un archivo.
- **`config/`** y **`theme/`**: separan configuración institucional y presentación (iconos, colores) de los datos, para que `src/data` sea serializable y equivalente a lo que devolverá un backend.
- **`types/filters.ts`** y **`utils/filters.ts`**: el filtrado, orden y paginación son funciones puras, reproducibles en el backend como parámetros de consulta.

## Datos e información institucional

**Fuente única.** Las cifras (88 integrantes, 36 instituciones, 23 tecnológicos, 2 centros, 11 universidades) están solo en `src/data/statistics.ts`. Los textos institucionales están en `src/data/content.ts`; nombre, correo y rutas en `src/config/site.ts`.

**Qué es real y qué no:**

- Real (documentación proporcionada): nombre de la red, objetivo, cifras, las cinco líneas y sus responsables, líder de la red y correo de contacto.
- Derivado: la adscripción del Dr. Eddie Helbert Clemente Torres al **CENIDET** se infiere del dominio del correo institucional (`cenidet.tecnm.mx`). Las **descripciones de las líneas** son redacción breve basada en su nombre oficial; conviene sustituirlas por las oficiales.
- Pendiente (se muestra un aviso en lugar de inventarlo): antecedentes e historia de la red; proyectos y productos por línea; adscripción de los responsables de línea; las 35 instituciones restantes.
- **Demostrativo**: registros `Integrante Demostrativo NN` e instituciones `… demostrativo/a X`, marcados con `esDemostrativo: true` y la etiqueta «Demo». Solo sirven para probar filtros y paginación. Se ocultan con `VITE_SHOW_DEMO_DATA=false`.

No se generan fotografías de personas: el avatar muestra iniciales hasta que exista `fotoUrl`.

## Integrantes: información pública y administrativa

`src/types/member.ts` define tres niveles:

1. **`ExcelMemberRow`** — fila cruda del Excel, con los encabezados exactos del archivo (`EXCEL_COLUMNS`).
2. **`MemberRecord`** — registro administrativo completo: CVU, teléfono, correo personal, archivos, carta compromiso, infraestructura, programas. La columna `ROLL` se normaliza como `rol`. **Nunca debe llegar al sitio público.**
3. **`PublicMember`** — lo único que consume la interfaz: nombre, adscripción, rol, línea y `correoPublico` solo si existe autorización (`autorizaCorreoPublico`, que el Excel actual no registra, por lo que el valor por defecto es `false`).

`toPublicMember()` construye el objeto público por **lista blanca**, campo por campo, para que una columna nueva del Excel no se publique por accidente.

> Ocultar campos en React **no es una medida de seguridad**: cualquier dato enviado al navegador es visible para quien lo inspeccione. En la integración con backend, la API debe responder al sitio público únicamente con `PublicMember`. El Excel de integrantes no debe colocarse en `public/` ni versionarse (está excluido en `.gitignore`).

## Importación del Excel (preparada)

`src/utils/memberMapper.ts` implementa, sin depender de ninguna librería de Excel:

| Función | Responsabilidad |
| --- | --- |
| `normalizeRawRow` | Reconoce encabezados con variaciones de mayúsculas, acentos y espacios |
| `cleanCell`, `cleanIdentifier` | Limpieza de espacios; celdas vacías, «N/A», «-», «No aplica» → `undefined`; CVU/Scopus como texto |
| `normalizePersonName` | «DE LA CRUZ NICOLÁS» → «De la Cruz Nicolás» (partículas, guiones, acentos) |
| `normalizeEmail` | Minúsculas, validación, primer correo válido si la celda trae varios |
| `normalizeInstitution` | Asocia la adscripción al catálogo (siglas, nombre, «TecNM Campus …», alias configurables) |
| `resolveResearchLine` | Asocia el texto libre a una línea oficial: número («Línea 3»), nombre o palabras clave; marca ambigüedades |
| `normalizeRole` | Normaliza `ROLL` → `rol` con alias («líder de línea», «miembro»…) |
| `findDuplicates` | Detecta duplicados por nombre normalizado, correo institucional o CVU TecNM |
| `importMemberRows` | Procesa la hoja completa y devuelve registros, duplicados, advertencias por fila y filas omitidas |
| `toPublicMember` | Proyección pública por lista blanca |

Uso previsto, idealmente en un script de importación o en el backend (no en el navegador):

```ts
import * as XLSX from 'xlsx';
import { importMemberRows, toPublicMembers } from '@/utils/memberMapper';

const workbook = XLSX.read(buffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

const { registros, duplicados, advertencias } = importMemberRows(rows);
// 1) revisar duplicados y advertencias
// 2) completar el catálogo de instituciones (src/data/institutions.ts)
// 3) publicar solo toPublicMembers(registros)
```

## Integración futura con API

- `services/http.ts` incluye `apiGet<T>()` y `ApiError`. Al definir `VITE_API_BASE_URL`, `membersService` llama a `GET /members` e `institutionsService` a `GET /institutions`.
- Contratos esperados: `PublicMember[]` e `Institution[]` (ver `src/types`).
- El formulario de contacto (`components/contact/ContactForm.tsx`) no envía nada: valida, simula la preparación y ofrece abrir el mensaje en la aplicación de correo. Para conectarlo, reemplazar la función `prepare` por la llamada al endpoint (p. ej. `POST /contact`) con protección anti-spam en el servidor.
- Sin autenticación ni panel administrativo en esta fase.

## Diseño

- **Tipografía:** Archivo (Google Fonts), familia variable con eje de anchura: titulares en versión expandida (`font-display`), texto en anchura normal.
- **Color:** paleta institucional del brief como tokens en `src/styles/globals.css` (`navy-950` #071B35, `navy-800` #123C68, `electric-600` #2563EB, `signal` #22D3EE, `mist` #F3F6FA). Cada línea de investigación tiene un tono de la familia azul-cian que se repite en el grafo, las tarjetas, los avatares y los filtros.
- **Elemento principal:** el grafo del hero se genera de forma determinista con un nodo por integrante, agrupado en cinco núcleos (uno por línea) unidos entre sí. Es ilustrativo: reparte los nodos de forma equitativa y no representa la afiliación real.
- **Movimiento:** una única secuencia al cargar el grafo, aparición discreta de secciones y transición breve entre páginas; todo se desactiva con la preferencia del sistema «reducir movimiento».
- **Accesibilidad:** enlace «Saltar al contenido», foco visible, navegación por teclado, diálogo con foco atrapado y cierre con Esc, etiquetas en formularios, mensajes de error asociados (`aria-describedby`), regiones `aria-live` para resultados, contraste AA en texto.

## Logotipos

- Logotipo de la red: `src/components/common/Logo.tsx` dibuja un símbolo provisional (cinco nodos en red). Para usar el oficial, coloca el archivo en `src/assets/logos/` y sustitúyelo en ese componente.
- Instituciones: añade `logoUrl` a cada institución en `src/data/institutions.ts`; la tarjeta ya reserva el espacio y muestra las siglas mientras tanto.
