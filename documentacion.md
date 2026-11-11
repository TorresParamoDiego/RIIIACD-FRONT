# Documentación del proyecto — RIIIACD (frontend)

Portal institucional de la **Red de Investigación e Innovación en Inteligencia Artificial y Ciencia de Datos (RIIIACD)**, del entorno del Tecnológico Nacional de México (TecNM).

| | |
| --- | --- |
| Fase actual | **Fase 2: backend y correcciones al frontend** |
| Repositorio | Frontend. El backend está en el repositorio **`riiiacd-back`** (FastAPI + PostgreSQL) |
| Stack | React 19 · Vite 7 · TypeScript estricto · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide React · Recharts |
| Idioma del sitio | Español (México) |
| Instrucciones de arranque | Ver `README.md` |

Este documento describe **qué está hecho**, **qué falta** y **cómo se conectan ambos repositorios**. La sección 0 resume la fase 2, la sección 3 es el inventario de pendientes y la sección 6 explica el contrato con el backend.

---

## 0. Fase 2: qué cambió

| Cambio | Dónde |
| --- | --- |
| Identidad visual: azul `#1B396A` (hero, pie, bandas oscuras) y verde `#117533` (acento, botones primarios). Sin cian | `src/styles/globals.css` (tokens `brand-*`, `ink`) |
| Botón primario verde; hover `#0E6B2C` (6.65:1 con texto blanco) | `components/common/Button.tsx` |
| Paleta de las cinco líneas y de los tipos de institución dentro de la familia azul-verde | `src/theme/lineThemes.ts`, `src/theme/institutionTheme.ts` |
| Símbolo provisional, favicon y `theme-color` con los colores nuevos | `components/common/Logo.tsx`, `public/favicon.svg`, `index.html` |
| `biografia` (≤ 1,000), `perfilProfesional` y `lineasPropuestas` en el modelo; solicitud de correo separada de la autorización aprobada | `src/types/member.ts`, `src/utils/memberMapper.ts` |
| Página `/actualizar/:token`: propuesta de cambios con foto, enviada a aprobación | `src/pages/MemberUpdate.tsx`, `src/services/memberUpdateService.ts` |
| La ficha pública muestra biografía, perfil profesional y líneas adicionales cuando están aprobados | `components/members/MemberDetails.tsx` |
| `ErrorBoundary` exterior y por página | `components/common/ErrorBoundary.tsx` |
| Archivo alojada localmente (Fontsource); sin Google Fonts | `src/main.tsx` |
| ESLint, Prettier, Vitest y Testing Library; 48 pruebas | `eslint.config.js`, `.prettierrc.json`, `vitest.config.ts`, `*.test.ts(x)` |
| Prueba automática de contraste WCAG de todos los tokens y paletas | `src/utils/contrast.test.ts` |
| Tipos generados desde el OpenAPI del backend y verificación de contrato en compilación | `src/types/api.generated.ts`, `src/types/api.contract.ts` |
| `GET /members` paginado: el servicio pide todas las páginas mientras el filtrado siga en el navegador | `src/services/membersService.ts` |

**Pantone 294 C** es solo una referencia provisional de la identidad (pendiente de validar con el manual oficial, brief 4.10). No se usa en la interfaz ni en los tokens.

Comprobación de la fase: `npm run check` (typecheck, lint, formato, pruebas y compilación).

---

## 1. Resumen del estado

| Área | Estado |
| --- | --- |
| Páginas y navegación | Hecho |
| Diseño responsive y accesibilidad básica | Hecho (sin auditoría formal; contraste AA verificado por prueba automática) |
| Directorio con búsqueda, filtros, orden, paginación y ficha | Hecho (datos locales o API) |
| Separación de tipos público / administrativo | Hecho, con verificación de contrato contra el OpenAPI |
| Mapper del Excel (`memberMapper.ts`) | Hecho; trasladado al backend, que es quien importa |
| Capa de servicios | Hecho: local y API |
| Página de actualización del integrante | Hecho (`/actualizar/:token`) |
| Backend, base de datos, autenticación | Hecho en `riiiacd-back` |
| Panel administrativo | **Pendiente** (aplicación separada; brief 4.4) |
| Datos reales del padrón (88 integrantes) | **Pendiente**: se cargan con la importación del backend |
| Catálogo completo de instituciones (36) | **Pendiente** (1 de 36) |
| Envío real del formulario de contacto | Backend listo (`POST /contact`); falta conectar el formulario |
| Pruebas automáticas y linter | Hecho. CI/CD y despliegue: **pendientes** |
| Aviso de privacidad, SEO, analítica | **Pendiente** |

> **Verificación:** `npm install`, `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` se ejecutaron sin errores en la fase 2 (Node 22). El flujo `/actualizar/:token` y el directorio se probaron de extremo a extremo contra el backend real en Chromium.

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
- Paleta de marca como tokens en `src/styles/globals.css`: `brand-blue` `#1B396A`, `brand-blue-deep` `#15325A`, `brand-green` `#117533`, `brand-green-hover` `#0E6B2C`, `brand-green-50/100`, `brand-accent` `#A7F3D0` (acento sobre azul, donde el verde no alcanza contraste: 1.97:1) e `ink` `#071B35`. Neutros conservados; `ink-subtle` pasó de `#64748B` a `#5B6B82` porque no llegaba a 4.5:1 sobre `mist`.
- Texto blanco con opacidad sobre el azul: mínimo 60 % (5.20:1).
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

| Pendiente | Estado |
| --- | --- |
| `npm install`, `typecheck`, `build` | Hecho |
| ESLint y Prettier | Hecho. Quedan dos avisos de Fast Refresh (`Button.tsx`, `ContactForm.tsx` exportan funciones junto a componentes) |
| Pruebas unitarias (Vitest) | Hecho: mapper, privacidad de `toPublicMember`, formulario de actualización, contraste. Faltan `filters.ts` y `validateContact` |
| Pruebas de componentes (Testing Library) | Iniciadas (`ErrorBoundary`) |
| Pruebas de extremo a extremo (Playwright) | Pendiente de automatizar; se hicieron recorridos manuales con Chromium |
| `ErrorBoundary` | Hecho |
| Auditoría de accesibilidad | Pendiente: lector de pantalla, axe/Lighthouse. El contraste ya se verifica automáticamente |
| Revisión visual en dispositivos reales | Pendiente |
| Optimización de rendimiento | Sin medir. La gráfica de instituciones (Recharts) pesa unos 110 kB comprimidos y se carga solo en su página |
| Tipografía alojada localmente | Hecho |
| Favicon e imágenes para redes sociales | Favicon provisional actualizado; faltan imágenes Open Graph |
| SEO | Faltan descripciones por página, Open Graph, `sitemap.xml`, `robots.txt`. `/actualizar/:token` ya lleva `noindex` |
| Internacionalización | No hay capa de traducción |
| Analítica | No hay |
| Paginación en servidor en `/integrantes` | El backend la ofrece; la página sigue filtrando en el navegador (ver 6.3) |

### 3.3 Integración con el backend

El backend está en `riiiacd-back` (ver su `README.md`). Lo que falta del lado del frontend:

| Pendiente | Detalle |
| --- | --- |
| Formulario de contacto | Cambiar `prepare` por `POST /contact`, con el campo trampa `sitioWeb` oculto |
| Filtros en servidor | Pasar `q`, `institucion`, `linea`, `rol`, `orden`, `pagina` a `GET /members` |
| Estadísticas | Leer `GET /statistics` en lugar de `src/data/statistics.ts` cuando el padrón esté cargado |
| Líneas de investigación | Pueden leerse de `GET /research-lines`; hoy siguen en `src/data` (mismo contenido) |
| Panel administrativo | Aplicación separada (pendiente 4.4). La API ya expone sesión, importaciones, cola de aprobación, invitaciones y edición |

### 3.4 Seguridad

- **Autorización en el servidor**: la API pública devuelve únicamente `PublicMember` (lista blanca con `extra="forbid"`), comprobado por pruebas automáticas en `riiiacd-back`.
- **Cabeceras de seguridad** (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) en el servidor web: pendientes.
- **CORS** restringido a los orígenes configurados: hecho en backend (`CORS_ORIGINS`, `ADMIN_ORIGINS`).
- **Límite de solicitudes** y **campo trampa** en contacto: hechos en backend (por proceso; con varios procesos, moverlo a Redis o al proxy).
- **Token del enlace en la URL**: la página `/actualizar/:token` añade `noindex` y `referrer: no-referrer` para que el token no se filtre a buscadores ni a otros sitios.
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

## 6. Contrato con el backend

La fuente de verdad es **`openapi.json` en `riiiacd-back`** (una prueba del backend falla si está desactualizado). El frontend genera sus tipos a partir de él y verifica en compilación que coincidan con los escritos a mano:

```bash
# en riiiacd-back
python -m app.cli exportar-openapi
# en este repositorio (por defecto lee ../riiiacd-back/openapi.json)
npm run api:types          # → src/types/api.generated.ts
npm run typecheck          # src/types/api.contract.ts falla si los tipos divergen
```

### 6.1 Endpoints que usa el sitio público

| Método y ruta | Respuesta | Uso en el frontend |
| --- | --- | --- |
| `GET /members` | `{ items: PublicMember[], total, pagina, porPagina, totalPaginas }` | `membersService.ts` |
| `GET /members/{id}` | `PublicMember` (404 si no es público) | — |
| `GET /institutions` | `Institution[]` | `institutionsService.ts` |
| `GET /research-lines`, `GET /statistics` | | Pendiente de conectar (3.3) |
| `POST /contact` | `202` | Pendiente de conectar (3.3) |
| `GET /invitations/{token}` | `MemberInvitation` | `memberUpdateService.ts` |
| `PUT /invitations/{token}/photo` | `PhotoUploadResult` (multipart `foto`) | Se llama antes de enviar los cambios |
| `POST /invitations/{token}/changes` | `ChangeSubmissionResult`; consume el enlace | |

Errores: `{ "detail": { "codigo", "mensaje" } }`. El frontend traduce `invitacion-invalida`, `invitacion-expirada` e `invitacion-usada` a mensajes propios (`ApiError.code`).

### 6.2 Privacidad

`PublicMember` nunca incluye CVU, teléfono, correo personal, archivos ni carta compromiso. `correoPublico` solo existe con una autorización **aprobada** por la coordinación; la solicitud del integrante no basta (`MemberRecord.solicitaCorreoPublico` frente a `consentimientoCorreo`).

### 6.3 Paginación

La API pagina en servidor (máximo 100 por página). Como `/integrantes` todavía filtra en el navegador, `fetchPublicMembers` pide todas las páginas y las concatena. Al pasar los filtros a la API, cambiar el servicio y `useMembers`.

### 6.4 Modo sin API

Sin `VITE_API_BASE_URL`, todo funciona con datos locales. La página de actualización tiene tokens de demostración: `/actualizar/demo` (válido), `/actualizar/expirado` y `/actualizar/usado`.

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
- **Cabeceras de seguridad:** configurar CSP y demás en el servidor (ver 3.4). La tipografía ya es local; la CSP debe permitir el origen de la API en `connect-src` y en `img-src` (fotografías).
- **HTTPS** obligatorio.

---

## 8. Hoja de ruta sugerida

### Fase 2 (estado)

Hecho: identidad visual, modelo de integrante, página de actualización, `ErrorBoundary`, tipografía local, herramientas de calidad, backend con importación, invitaciones, aprobación, fotografías, auditoría y pruebas.

Siguiente:

1. Responder los pendientes del brief §4 (servidor, SMTP, logotipos, panel, retención del Excel, roles, campos, aviso de privacidad, tamaño de foto, Pantone).
2. Recibir el Excel (anonimizado para pruebas) y hacer una importación de revisión.
3. Construir el panel administrativo (`riiiacd-admin`, si se confirma).
4. Conectar contacto, estadísticas y filtros en servidor (3.3).
5. Completar el catálogo de instituciones; sustituir textos y logotipos provisionales.
6. SEO básico, auditoría de accesibilidad y revisión en dispositivos reales.

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
| Símbolo de la red | Provisional (verde y acento claro); se sustituye por los logotipos oficiales del TecNM y del Tecnológico de Celaya |
| Paleta de líneas | Propuesta de la fase 2 dentro de la familia azul-verde; línea 4 en índigo para distinguirla de la 1 |
| Perfil profesional | Máximo 500 caracteres, propuesto (pendiente 4.7) |
| Tamaño máximo de foto | 2 MB (pendiente 4.9) |
| Enrutamiento | Rutas del navegador (sin `#`) |
| Idioma | Solo español |

---

## 10. Versiones y dependencias

Instaladas y verificadas en la fase 2 (`package-lock.json`). Dependencias principales:

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

Además: `@fontsource-variable/archivo` (tipografía) y, en desarrollo, ESLint 10, typescript-eslint, Prettier 3, Vitest 5, Testing Library, jsdom y openapi-typescript. Requiere Node.js 20.19 o superior.

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
