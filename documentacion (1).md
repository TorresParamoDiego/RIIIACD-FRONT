# Documentación del proyecto — RIIIACD (frontend)

Portal institucional de la **Red de Investigación e Innovación en Inteligencia Artificial y Ciencia de Datos (RIIIACD)**, del entorno del Tecnológico Nacional de México (TecNM).

| | |
| --- | --- |
| Fase actual | **Fase 1: frontend** |
| Repositorio | Solo frontend. El backend se desarrollará en **otro repositorio** |
| Stack | React 19 · Vite 7 · TypeScript estricto · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide React · Recharts |
| Idioma del sitio | Español (México) |
| Instrucciones de arranque | Ver `README.md` |

Este documento describe **qué está hecho**, **qué falta** y **cómo se conectarán ambos repositorios**. La sección 3 es el inventario de pendientes y la sección 6 es el contrato que el backend deberá cumplir.

---

## 1. Resumen del estado

| Área | Estado |
| --- | --- |
| Páginas y navegación | Hecho |
| Diseño responsive y accesibilidad básica | Hecho (sin auditoría formal) |
| Directorio con búsqueda, filtros, orden, paginación y ficha | Hecho (con datos locales) |
| Separación de tipos público / administrativo | Hecho |
| Mapper del Excel (`memberMapper.ts`) | Hecho (sin lector de Excel conectado) |
| Capa de servicios preparada para API | Hecho (solo implementación local) |
| Datos reales del padrón (88 integrantes) | **Pendiente** |
| Catálogo completo de instituciones (36) | **Pendiente** (1 de 36) |
| Backend, base de datos, autenticación, panel administrativo | **Pendiente, otro repositorio** |
| Envío real del formulario de contacto | **Pendiente** (requiere backend) |
| Pruebas automáticas, linter, CI/CD, despliegue | **Pendiente** |
| Aviso de privacidad, SEO, analítica | **Pendiente** |

> **Verificación incompleta:** el comando `npm run typecheck` (`tsc -b`) **no se ha ejecutado** porque el entorno donde se generó el proyecto no tenía acceso a npm. La revisión visual y funcional se hizo con una compilación de prueba (esbuild) con versiones simplificadas de React Router, Framer Motion y Recharts. Antes de continuar, ejecutar `npm install && npm run typecheck && npm run build` y corregir cualquier error. Las versiones de `package.json` no se instalaron ni probaron.

---

## 2. Lo que ya está implementado

### 2.1 Páginas

| Ruta | Archivo | Contenido |
| --- | --- | --- |
| `/` | `pages/Home.tsx` | Hero con grafo de la red, cifras, presentación, cinco líneas, objetivo, liderazgo y accesos |
| `/nosotros` | `pages/About.tsx` | Quiénes somos, contexto y origen, objetivo, organigrama, liderazgo, importancia de la colaboración |
| `/lineas-investigacion` | `pages/ResearchLines.tsx` | Las cinco líneas oficiales con responsable |
| `/lineas-investigacion/:slug` | `pages/ResearchLineDetail.tsx` | Detalle de una línea y acceso a sus integrantes |
| `/integrantes` | `pages/Members.tsx` | Directorio funcional |
| `/instituciones` | `pages/Institutions.tsx` | Composición por tipo (gráfica) y catálogo filtrable |
| `/contacto` | `pages/Contact.tsx` | Correo, líder de la red y formulario |
| `*` | `pages/NotFound.tsx` | Página 404 |

Las páginas distintas de la portada se cargan de forma diferida (`React.lazy`), de modo que Recharts solo se descarga en `/instituciones`.

### 2.2 Directorio de integrantes

- Búsqueda por nombre y apellidos, sin distinguir acentos ni mayúsculas, con retardo de 200 ms.
- Filtros por institución, línea de investigación y rol, con conteo por opción.
- Orden por apellidos (A–Z, Z–A) y por nombre.
- Paginación de 12 elementos con numeración compacta.
- Ficha del integrante en diálogo accesible (foco atrapado, cierre con Esc, retorno del foco).
- Estado de los filtros guardado en la URL: `/integrantes?linea=linea-3&institucion=cenidet&q=ramirez&pagina=2&integrante=<id>`.
- Estados de carga, vacío y error con reintento.
- Preparado para fotografía (`fotoUrl`) y perfil académico (`perfilAcademicoUrl`).

### 2.3 Modelo de datos y privacidad

`src/types/member.ts` define tres niveles:

1. `ExcelMemberRow`: fila cruda con los encabezados exactos del Excel (`EXCEL_COLUMNS`).
2. `MemberRecord`: registro administrativo completo (CVU, teléfono, correo personal, archivos, carta compromiso, infraestructura, programas). La columna `ROLL` se normaliza como `rol`. **Nunca debe llegar al sitio público.**
3. `PublicMember`: lo único que consume la interfaz. Incluye `correoPublico` solo si hay autorización.

`toPublicMember()` construye el objeto público por **lista blanca**, campo por campo.

> Ocultar campos en React **no es seguridad**. Cualquier dato enviado al navegador es visible para quien lo inspeccione. El control real debe ocurrir en el backend (sección 6).

### 2.4 Mapper del Excel (`src/utils/memberMapper.ts`)

Funciones implementadas, sin dependencia de librería de Excel:

- `normalizeRawRow`: reconoce encabezados con variaciones de mayúsculas, acentos y espacios.
- `cleanCell` / `cleanIdentifier`: limpieza de espacios; «N/A», «-», «No aplica» → vacío; CVU y Scopus como texto.
- `normalizePersonName`: «DE LA CRUZ NICOLÁS» → «De la Cruz Nicolás».
- `normalizeEmail`: validación y selección del primer correo válido.
- `normalizeInstitution`: asocia la adscripción al catálogo por nombre, siglas o alias configurables.
- `resolveResearchLine`: asocia el texto libre a una línea oficial (número, nombre o palabras clave) y marca ambigüedades.
- `normalizeRole`: `ROLL` → `rol`, con alias.
- `findDuplicates`: duplicados por nombre normalizado, correo institucional o CVU TecNM.
- `importMemberRows`: procesa la hoja completa y devuelve registros, duplicados, advertencias por fila y filas omitidas.
- `toPublicMember` / `toPublicMembers`: proyección pública.

### 2.5 Capa de acceso a datos

- `services/http.ts`: `apiGet<T>()`, `ApiError`, `isApiEnabled()`, `simulateRequest()`.
- `services/membersService.ts` y `services/institutionsService.ts`: hoy resuelven con datos locales; con `VITE_API_BASE_URL` definido llaman a `GET /members` y `GET /institutions`.
- `hooks/useAsyncResource.ts`: carga con cancelación y reintento.
- Los componentes **no** importan `src/data` para el directorio: usan los hooks `useMembers` e `useInstitutions`.

### 2.6 Fuente única de información

| Qué | Dónde |
| --- | --- |
| Cifras (88, 36, 23, 2, 11) | `src/data/statistics.ts` |
| Textos institucionales, objetivo | `src/data/content.ts` |
| Nombre, correo, rutas, navegación | `src/config/site.ts` |
| Líneas de investigación y responsables | `src/data/researchLines.ts` |
| Iconos y colores por línea | `src/theme/lineThemes.ts` |
| Origen de datos y tamaño de página | `src/config/dataSource.ts` |

### 2.7 Diseño y experiencia

- Tipografía Archivo (familia variable con eje de anchura).
- Paleta institucional como tokens en `src/styles/globals.css`.
- Una secuencia de animación al cargar el grafo, aparición discreta de secciones y transición breve entre páginas; todo se desactiva con «reducir movimiento».
- Accesibilidad básica: enlace «Saltar al contenido», foco visible, navegación por teclado, etiquetas en formularios, errores asociados con `aria-describedby`, regiones `aria-live`.
- Menú hamburguesa en móvil, sin desbordamiento horizontal verificado a 390 px y 1440 px.

### 2.8 Formulario de contacto

Valida nombre, correo, asunto y mensaje (mínimo 20 y máximo 2000 caracteres), muestra errores por campo y un estado de preparación simulado. **No envía nada a ningún servidor.** Al final ofrece abrir el mensaje en la aplicación de correo del usuario (`mailto:`) y lo indica explícitamente.

---

## 3. Lo que falta

### 3.1 Contenido institucional

| Pendiente | Situación actual | Quién debe aportarlo |
| --- | --- | --- |
| Padrón oficial de 88 integrantes | 5 responsables documentados + 31 registros de prueba «Demo» | Coordinación de la red (Excel) |
| Catálogo de 36 instituciones | Solo CENIDET confirmado + 7 demostrativas | Se obtiene del Excel (columna «Institución de adscripción») |
| Tipo de cada institución | Solo conocido para CENIDET | Coordinación |
| Adscripción de los 4 responsables de línea restantes | «Adscripción por confirmar» | Coordinación |
| Confirmación de que el CENIDET es la adscripción del líder | **Inferido** del dominio del correo `cenidet.tecnm.mx` | Coordinación |
| Descripciones oficiales de las líneas | Redacción provisional basada en el nombre oficial | Coordinación |
| Antecedentes, fecha de conformación e hitos | Aviso «Antecedentes por publicar» | Coordinación |
| Proyectos, publicaciones y resultados por línea | Aviso «Información por publicar» | Responsables de línea |
| Logotipo oficial de la red | Símbolo provisional (`components/common/Logo.tsx`) | TecNM / coordinación |
| Logotipos de instituciones | Espacio reservado; se muestran siglas | Cada institución |
| Fotografías y perfiles académicos | Avatar con iniciales | Cada integrante, con consentimiento |
| Misión, visión y valores | **No se incluyeron a propósito**: no están documentados | Coordinación, si existen |
| Autorización de publicación del correo institucional | El Excel no registra esa columna; por defecto `false` | Añadir columna o formato de consentimiento |
| Aviso de privacidad | No existe | Área jurídica / TecNM |
| Texto de «Plan México» | Se menciona solo como lo cita el objetivo; sin enlace ni explicación | Coordinación |

### 3.2 Calidad y herramientas del frontend

| Pendiente | Detalle |
| --- | --- |
| Ejecutar `npm install`, `npm run typecheck`, `npm run build` | Nunca se ejecutaron. Verificar versiones de dependencias |
| ESLint y Prettier | No hay configuración |
| Pruebas unitarias (Vitest) | Ninguna. Prioridad: `memberMapper.ts`, `filters.ts`, `validateContact` |
| Pruebas de componentes (Testing Library) | Ninguna |
| Pruebas de extremo a extremo (Playwright) | Ninguna. Las comprobaciones hechas fueron manuales |
| Límite de errores (`ErrorBoundary`) | No implementado: un error de render dejaría la pantalla en blanco |
| Auditoría de accesibilidad | Pendiente: lector de pantalla, axe/Lighthouse, contraste de cada color por línea |
| Revisión visual en dispositivos reales | Solo se probó en dos anchos de ventana con Chromium |
| Optimización de rendimiento | Sin medir (Lighthouse, tamaño del paquete) |
| Tipografía alojada localmente | Se carga desde Google Fonts: dependencia externa y transmisión de la IP del visitante a un tercero. Se recomienda alojarla en el propio sitio |
| Favicon e imágenes para redes sociales | Solo hay un `favicon.svg` provisional |
| SEO | Faltan descripciones por página, Open Graph, `sitemap.xml`, `robots.txt`, datos estructurados |
| Internacionalización | Todo el texto está en español dentro del código; no hay capa de traducción |
| Analítica | No hay; definir si se usará y con qué base de privacidad |
| Gráfica de Recharts | Es una sola; verificar su aspecto real con la librería instalada |

### 3.3 Integración con el backend

Todo esto pertenece al **repositorio del backend**, salvo donde se indica que toca el frontend.

| Pendiente | Frontend | Backend |
| --- | --- | --- |
| API de integrantes, instituciones y estadísticas | Sustituir datos locales (ya preparado) | Implementar (sección 6) |
| Base de datos | — | Diseñar e implementar |
| Importación del Excel | Opcionalmente, vista de revisión | Implementar con `memberMapper` como referencia |
| Autenticación y autorización | Pantalla de acceso, manejo de sesión | Implementar |
| Panel administrativo | Aplicación aparte o sección protegida | Endpoints administrativos |
| Gestión de consentimientos de publicación | Mostrar solo lo autorizado | Registrar y hacer cumplir |
| Envío del formulario de contacto | Cambiar `prepare` por llamada a la API | Endpoint, validación, protección anti-spam, entrega al correo de la red |
| Carga de fotografías y documentos | Componente de carga | Almacenamiento y validación de archivos |
| Bitácora de cambios y auditoría | — | Implementar |
| Respaldos y retención de datos personales | — | Definir y operar |

### 3.4 Seguridad

- **Autorización en el servidor**: la API pública debe devolver únicamente `PublicMember`. No existe aún.
- **Cabeceras de seguridad** (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) en el servidor web: pendientes.
- **CORS** restringido al dominio del sitio: pendiente en backend.
- **Límite de solicitudes** y **protección anti-spam** en el formulario de contacto: pendiente en backend.
- **Protección de datos personales**: cumplir con la normativa mexicana aplicable (Ley Federal de Protección de Datos Personales en Posesión de los Particulares y, para instituciones públicas, la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados). Requiere revisión del área jurídica; este documento no sustituye ese análisis.
- **El Excel original** contiene datos personales: no debe estar en este repositorio ni en el del backend (ver `.gitignore`).
- **Dependencias**: activar revisión automática de vulnerabilidades (Dependabot o equivalente): pendiente.

### 3.5 Operación

| Pendiente | Nota |
| --- | --- |
| Dominio y certificado HTTPS | Por definir |
| Plataforma de alojamiento | Por definir. El sitio es estático (`dist/`) |
| Reescritura de rutas al `index.html` | Obligatoria, porque se usan rutas del navegador (ver sección 7) |
| Integración y despliegue continuos | No hay flujo configurado |
| Entornos (desarrollo, pruebas, producción) | Solo existen las variables de `.env.example` |
| Monitoreo y registro de errores | No hay |
| Plan de actualización de dependencias | No definido |
| Licencia del repositorio | No definida |
| Archivos `CONTRIBUTING`, guía de estilo y de ramas | No existen |

---

## 4. Arquitectura del frontend

```text
src/
├── assets/            logos/ (logotipos oficiales), images/, icons/
├── components/
│   ├── common/        Button, SectionTitle, LoadingState, StatusMessage, Reveal,
│   │                  Logo, Monogram, PageHeader, Notice, SelectField
│   ├── layout/        Navbar, Footer, MainLayout
│   ├── home/          Hero, NetworkGraph, Statistics, AboutPreview, ResearchPreview,
│   │                  Objective, Leadership, Collaboration
│   ├── members/       MemberCard, MemberFilters, MemberSearch, MemberDetails, Pagination
│   ├── research/      ResearchCard
│   ├── institutions/  InstitutionCard, InstitutionChart
│   └── contact/       ContactForm
├── config/            site.ts, dataSource.ts
├── data/              members.ts, researchLines.ts, institutions.ts, statistics.ts, content.ts
├── hooks/             useMembers, useInstitutions, useMemberFilters, useAsyncResource, useDocumentTitle
├── pages/             Home, About, ResearchLines, ResearchLineDetail, Members, Institutions, Contact, NotFound
├── routes/            AppRouter.tsx
├── services/          http.ts, membersService.ts, institutionsService.ts
├── styles/            globals.css
├── theme/             lineThemes.ts, institutionTheme.ts
├── types/             member.ts, research.ts, institution.ts, statistics.ts, filters.ts, content.ts
└── utils/             memberMapper.ts, filters.ts, institutions.ts, networkGraph.ts, text.ts, cn.ts
```

### Principios

1. **Los datos no viven en los componentes.** Los componentes reciben datos por hooks o propiedades.
2. **Un solo lugar por dato.** Cifras, textos y rutas se definen una vez.
3. **Los tipos reflejan el contrato de la API.** `PublicMember`, `Institution` y `ResearchLine` son serializables y equivalen a lo que devolverá el backend.
4. **El filtrado es lógica pura** (`utils/filters.ts`), reproducible en el servidor como parámetros de consulta.
5. **Sin `any`.** TypeScript en modo estricto con `noUnusedLocals` y `noUnusedParameters`.

### Convenciones de nombres

- Archivos de componentes y páginas: `PascalCase.tsx`.
- Hooks: `useXxx.ts`. Utilidades: `camelCase.ts`.
- Tipos de datos del dominio en español (`nombres`, `institucion`, `rol`), igual que el Excel y la API; código y comentarios técnicos en español.
- Rutas en español, minúsculas, con guiones: `/lineas-investigacion`.

### Dónde cambiar cada cosa

| Quiero… | Edito… |
| --- | --- |
| Cambiar una cifra | `src/data/statistics.ts` |
| Cambiar el texto del objetivo o de «Nosotros» | `src/data/content.ts` |
| Cambiar el correo de contacto | `src/config/site.ts` |
| Añadir una institución | `src/data/institutions.ts` (y `institutionAliases` en el mapper si el Excel la escribe distinto) |
| Poner el logotipo de una institución | `logoUrl` en `src/data/institutions.ts` |
| Cambiar colores de la identidad | Tokens en `src/styles/globals.css` |
| Cambiar icono o color de una línea | `src/theme/lineThemes.ts` |
| Ocultar datos demostrativos | `VITE_SHOW_DEMO_DATA=false` |

---

## 5. Datos demostrativos

Existen para probar el directorio y deben desaparecer antes de publicar.

- **Integrantes:** `Integrante Demostrativo 01` a `31`, con `esDemostrativo: true` y etiqueta «Demo».
- **Instituciones:** siete registros `… demostrativo/a X`, también marcados.
- Sus correos usan el dominio reservado `institucion.example`.
- Cuando el backend entregue datos reales, eliminar `demoMembers`, `demoInstitutions` y el campo `esDemostrativo` si ya no se necesita (o mantenerlo como `false`).

Las cifras de la portada (88, 36…) son las **oficiales** y **no** se calculan a partir de los registros cargados. Mientras haya datos de prueba, el directorio muestra 36 registros y esa cifra no coincide con la portada; es esperado. Cuando haya datos reales, conviene que el backend entregue las estadísticas calculadas (endpoint `/statistics`) y que `src/data/statistics.ts` pase a ser un respaldo.

---

## 6. Contrato propuesto para el backend (repositorio aparte)

Es una propuesta para arrancar. Los tipos de referencia están en `src/types/`. Conviene que el backend mantenga su propia definición y que ambos repositorios se sincronicen mediante un esquema compartido (por ejemplo OpenAPI).

### 6.1 Endpoints públicos (sin autenticación)

| Método y ruta | Respuesta | Notas |
| --- | --- | --- |
| `GET /members` | `PublicMember[]` | Ver 6.3 sobre paginación en servidor |
| `GET /members/:id` | `PublicMember` | `404` si no existe o no es público |
| `GET /institutions` | `Institution[]` | |
| `GET /research-lines` | `ResearchLine[]` | Hoy son datos locales; pueden moverse al backend |
| `GET /statistics` | `NetworkStatistics` | Cifras calculadas |
| `POST /contact` | `204` | Cuerpo: `{ nombre, correo, asunto, mensaje }` |

### 6.2 Forma de los datos públicos

```ts
interface PublicMember {
  id: string;
  tratamiento?: 'Dr.' | 'Dra.' | 'Mtro.' | 'Mtra.' | 'Ing.' | 'Lic.';
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  institucionId: string | null;
  rol: string;
  lineaInvestigacionId: 'linea-1' | 'linea-2' | 'linea-3' | 'linea-4' | 'linea-5' | null;
  correoPublico?: string;       // solo con autorización
  fotoUrl?: string;
  perfilAcademicoUrl?: string;
  esDemostrativo: boolean;
}
```

### 6.3 Paginación y filtros en el servidor

Hoy el frontend descarga todos los integrantes y filtra en el navegador, lo cual es adecuado para unos 88 registros. Si crece, el backend debería aceptar los mismos parámetros que ya usa la URL del sitio:

```text
GET /members?q=ramirez&institucion=cenidet&linea=linea-3&rol=Integrante&orden=apellidos-asc&pagina=2&porPagina=12
```

y responder con `{ items, page, pageSize, totalItems, totalPages }` (tipo `PageResult<T>`). Sería necesario ajustar `useMembers` y `Members.tsx`; la lógica de `utils/filters.ts` serviría de especificación.

### 6.4 Reglas de privacidad que el backend debe hacer cumplir

1. **Nunca** incluir en respuestas públicas: teléfono particular, correo personal, CVU, nombres de archivos, cartas compromiso, infraestructura, programas académicos ni documentos internos.
2. `correoPublico` solo si existe un **consentimiento registrado** del integrante.
3. Los datos administrativos solo se exponen a usuarios autenticados con rol autorizado, en endpoints separados (`/admin/...`).
4. Registrar quién consulta o modifica datos personales.
5. Permitir al integrante solicitar acceso, rectificación, cancelación u oposición a sus datos (derechos ARCO), según corresponda legalmente.

### 6.5 Importación del Excel (en el backend)

Flujo recomendado:

1. Un administrador autenticado sube el archivo.
2. El servidor lo lee (por ejemplo con SheetJS) y aplica la lógica equivalente a `importMemberRows`.
3. Se muestra un **informe de revisión**: duplicados, instituciones no reconocidas, líneas ambiguas, correos inválidos, filas omitidas.
4. Un administrador resuelve las advertencias y confirma.
5. Se guardan los registros administrativos y se genera la proyección pública.
6. El archivo original se elimina o se guarda cifrado, según la política de retención.

Notas para quien porte la lógica: la columna `ROLL` se normaliza a `rol`; los CVU y Scopus se tratan como texto (Excel los convierte en números); la columna de autorización de correo público **no existe** en el Excel actual y debe añadirse.

### 6.6 Formulario de contacto

`POST /contact` debe validar los mismos campos y límites que el frontend (`validateContact` en `ContactForm.tsx`), **repetir la validación en el servidor**, aplicar límite de solicitudes y protección anti-spam, y entregar el mensaje al correo institucional de la red. El frontend deberá sustituir la función `prepare` y conservar los estados de carga y error.

### 6.7 Autenticación y panel administrativo

No hay nada de esto en el frontend, a propósito: no existe autenticación simulada que pueda confundirse con seguridad real. Cuando se desarrolle:

- Decidir si el panel será una aplicación separada o una sección protegida de este sitio. Se recomienda **aplicación separada** para no mezclar superficie pública y administrativa.
- Sesiones con cookies `HttpOnly` y `Secure`, o tokens de corta duración, con protección CSRF.
- Roles mínimos sugeridos: administrador de la red, responsable de línea (solo su línea), consulta.

### 6.8 Integración desde el frontend

1. Definir `VITE_API_BASE_URL` en el entorno de despliegue.
2. Verificar que las respuestas coincidan con los tipos de `src/types/`.
3. Retirar los datos demostrativos de `src/data/members.ts` e `institutions.ts`.
4. Configurar CORS en el backend, o servir ambos bajo el mismo dominio con un proxy inverso (`/api`).
5. Si se usa el proxy inverso, `VITE_API_BASE_URL` puede ser `/api`.

---

## 7. Despliegue

El resultado de `npm run build` es una carpeta `dist/` con archivos estáticos. Requisitos:

- **Reescritura de rutas:** cualquier ruta debe responder con `index.html`; si no, recargar `/integrantes` daría error 404. Ejemplo para Nginx:

  ```nginx
  location / {
    try_files $uri /index.html;
  }
  ```

- **Caché:** los archivos en `dist/assets/` llevan hash en el nombre y pueden cachearse por largo tiempo; `index.html` no.
- **Cabeceras de seguridad:** configurar CSP y demás en el servidor (ver 3.4). Si se mantiene Google Fonts, la CSP debe permitir `fonts.googleapis.com` y `fonts.gstatic.com`.
- **HTTPS** obligatorio.

---

## 8. Hoja de ruta sugerida

### Fase 1b: cerrar el frontend (antes de integrar)

1. `npm install`, `npm run typecheck`, `npm run build`; corregir lo que aparezca.
2. Configurar ESLint, Prettier y Vitest; escribir pruebas del mapper, de los filtros y de la validación del formulario.
3. Añadir `ErrorBoundary`.
4. Alojar la tipografía localmente.
5. Recibir el Excel (anonimizado para pruebas) y ajustar el mapper a los valores reales.
6. Completar el catálogo de instituciones y sus tipos.
7. Sustituir descripciones provisionales, logotipo y textos pendientes por los oficiales.
8. Redactar el aviso de privacidad con el área jurídica.
9. SEO básico: metadatos por página, `robots.txt`, `sitemap.xml`, imagen para redes.
10. Auditoría de accesibilidad y revisión en dispositivos reales.

### Fase 2: backend (otro repositorio)

1. Definir esquema compartido de la API (OpenAPI) y modelo de base de datos.
2. Implementar endpoints públicos de lectura y `POST /contact`.
3. Implementar importación del Excel con informe de revisión.
4. Implementar autenticación, roles y bitácora.
5. Integrar con el frontend (sección 6.8).

### Fase 3: administración y operación

1. Panel administrativo.
2. Gestión de consentimientos, fotografías y perfiles académicos.
3. Integración continua, despliegue, monitoreo y respaldos.
4. Retirar los datos demostrativos y publicar.

---

## 9. Decisiones y supuestos a confirmar

| Decisión | Supuesto actual |
| --- | --- |
| Adscripción del líder | CENIDET, inferida del dominio del correo |
| Tipo del CENIDET | Centro de investigación |
| Descripciones de las líneas | Provisionales |
| Rol del líder y de los responsables de línea | «Líder de la red» y «Responsable de línea» |
| Línea del líder en el directorio | Línea 4, por ser su responsable |
| Correos visibles | Solo el del líder, que coincide con el correo de contacto de la red |
| Distribución del grafo del hero | Ilustrativa: reparte los nodos por igual entre líneas y no refleja afiliación real |
| Símbolo de la red | Provisional |
| Enrutamiento | Rutas del navegador (sin `#`) |
| Idioma | Solo español |

---

## 10. Versiones y dependencias

Declaradas en `package.json` y **no verificadas** por instalación:

| Paquete | Versión declarada |
| --- | --- |
| react / react-dom | ^19.1.0 |
| react-router-dom | ^7.6.0 |
| framer-motion | ^12.15.0 |
| lucide-react | ^0.511.0 |
| recharts | ^3.0.0 |
| vite | ^7.0.0 |
| @vitejs/plugin-react | ^5.0.0 |
| tailwindcss y @tailwindcss/vite | ^4.1.11 |
| typescript | ~5.8.3 |

Requiere Node.js 20.19 o superior. Si alguna versión no existe o es incompatible, ajustarla al instalar y volver a ejecutar `typecheck`.

---

## 11. Archivos que no deben versionarse

El `.gitignore` excluye, entre otros:

- `node_modules/`, `dist/`, cachés y `*.tsbuildinfo`.
- `.env` y variantes (se conserva `.env.example`).
- **Datos personales:** `*.xlsx`, `*.xls`, `*.csv`, `*.ods` y carpetas como `padron/`, `cvu/`, `cartas-compromiso/`, `data-privada/`.
- Claves y certificados (`*.pem`, `*.key`, etc.).
- Archivos de editor y del sistema operativo.

Si se necesita versionar un Excel de **ejemplo sin datos reales**, ponerlo en una carpeta propia y añadir una excepción explícita (`!ejemplos/padron-ejemplo.xlsx`).

Si algún archivo con datos personales llegó a confirmarse en el historial de Git, **eliminarlo del historial** (no basta con borrarlo en un commit nuevo) y tratar los datos como expuestos.
