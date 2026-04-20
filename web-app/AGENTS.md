# AGENTS.md

## Para que sirve `web-app`

`web-app` es el frontend web del proyecto. Combina dos superficies:

- sitio publico/marketing
- dashboard operativo para admin, fleetadmin, customer y driver

No es solo una landing. Tambien es la consola principal para gestionar bookings, usuarios, zonas, vehiculos, promociones, impuestos, pagos y configuracion.

## Stack principal

- React 19
- React Router 6
- MUI 5
- Tailwind CSS
- `common` para Firebase, Redux y acciones de negocio
- Google Maps JavaScript API via `@react-google-maps/api`

## Puntos de entrada y archivos criticos

- `src/App.js`: bootstrap general, providers, tema MUI y rutas.
- `src/views/*`: paginas principales del dashboard y paginas publicas.
- `src/views/ProtectedRoute.js`: proteccion por rol.
- `src/views/AuthLoading.js`: carga inicial ligada a auth/usuario.
- `src/views/LoginPage.js`: login web.
- `src/config/FirebaseConfig.js`: credenciales/config Firebase del frontend.
- `src/config/GoogleMapApiConfig.js`: API key de mapas.
- `src/mapConfig.js`: version y opciones del loader de Google Maps.
- `src/components/ui/*`: bloques de UI del sitio publico y piezas reutilizables.
- `src/components/Theme/WebTheme.js`, `src/components/ui/uiTheme.css`, `src/index.css`: base visual del producto.

## Como arranca la app

`src/App.js` monta este orden:

1. `HelmetProvider`
2. `Provider` de Redux usando `store` importado desde `common`
3. `FirebaseProvider` usando la config web
4. `ThemeProvider` de MUI
5. `AuthLoading`
6. `BrowserRouter`
7. `Routes`

Esto significa que la mayoria de paginas asumen que Redux y Firebase ya existen y que `AuthLoading` resolvio el estado inicial del usuario.

## Organizacion funcional de rutas

Las rutas importantes viven en `src/App.js`.

Areas mas relevantes:

- Publicas: `/`, `/login`, `/about-us`, `/contact-us`, `/privacy-policy`, `/term-condition`, `/driver-agreement`
- Operacion general: `/dashboard`, `/bookings`, `/bookings/bookingdetails/:id`, `/profile`
- Gestion administrativa: `/users/:id`, `/zones`, `/cartypes`, `/cars`, `/promos`, `/taxes`, `/dynamic-hours`
- Finanzas: `/paymentsettings`, `/withdraws`, `/userwallet`, `/addtowallet`
- Seguridad y soporte: `/notifications`, `/sos`, `/complain`

La autorizacion por rol se hace con `ProtectedRoute` y cadenas tipo `admin,fleetadmin`.

## Relacion con `common`

La web delega gran parte de su logica a `common`.

En la practica:

- Los datos no suelen pedirse directo desde cada vista.
- Las vistas consumen acciones, selectors y estado compartido.
- Cualquier ajuste en auth, settings, idiomas, bookings, users, cars, zones o wallet probablemente toca tambien `common`.

Antes de reescribir logica en la web, revisa:

- `../common/src/actions/*`
- `../common/src/reducers/*`
- `../common/src/config/configureFirebase.js`

## Sistema visual

La UI no vive en una sola tecnologia. Conviven:

- MUI para parte del dashboard
- Tailwind para utilidades y layout
- CSS propio para branding y secciones publicas

Contexto actual importante:

- El color primario base es naranja `#F97316`.
- El tema MUI principal se configura en `src/App.js`.
- La web publica usa varios componentes de `src/components/ui`.

Si haces redisenos:

- Manten coherencia entre dashboard y landing.
- No metas un cuarto sistema de estilos.
- Reutiliza la paleta naranja existente en vez de volver a azules heredados.

## Google Maps

Mapas y autocomplete dependen de:

- `src/config/GoogleMapApiConfig.js`
- `src/mapConfig.js`
- `useJsApiLoader` en `src/App.js`

Si algo falla con mapas:

- revisa la API key
- revisa restricciones de dominio
- revisa la version declarada en `mapConfig.js`

## Auth y login

El login web depende de `LoginPage.js` mas la logica de `common`.

Zonas a revisar cuando falle auth:

- `src/views/LoginPage.js`
- `../common/src/actions/authactions.js`
- `../common/src/config/configureFirebase.js`
- configuracion OAuth en Firebase/Google

La web es sensible a:

- origenes permitidos para Google auth
- persistencia de sesion
- rol del usuario (`usertype`)
- estados de verificacion del usuario

## Donde tocar segun el tipo de cambio

- Nueva pagina web: crear vista en `src/views` y registrar ruta en `src/App.js`
- Cambio de navegacion o guardas: `ProtectedRoute.js`, `AuthLoading.js`, `src/App.js`
- Cambio visual publico: `src/components/ui/*`, `src/views/LandingPage.js`, `src/index.css`, `uiTheme.css`
- Cambio de tablas/listados: revisar `src/styles/tableStyle.js` y la vista especifica
- Cambio de auth o datos: casi seguro toca `common`
- Cambio de mapas: `GoogleMapApiConfig.js`, `mapConfig.js`, componentes que usan mapas

## Comandos utiles

- `yarn web`
- `yarn workspace web-app build`
- `yarn web:deploy`

## Riesgos frecuentes

- Romper permisos por rol en rutas protegidas.
- Cambiar una vista sin revisar el action/reducer compartido.
- Tocar auth desde la web sin validar impacto en mobile.
- Cambiar diseno sin revisar componentes reutilizados entre landing y dashboard.

## Regla practica para otra IA

Si el problema parece visual, empieza en `src/views` o `src/components/ui`.
Si el problema parece de datos, auth o permisos, probablemente el origen real esta en `common`.
