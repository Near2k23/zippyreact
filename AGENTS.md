# AGENTS.md

## Objetivo de este repositorio

Este monorepo implementa una plataforma tipo ride-hailing con cuatro piezas principales:

- `web-app`: panel web y sitio publico.
- `mobile-app`: app Expo/React Native con variantes `rider` y `driver`.
- `functions`: backend serverless en Firebase Cloud Functions.
- `common`: capa compartida de Firebase, Redux y acciones de negocio consumida por web y mobile.

Si una IA necesita contexto rapido del proyecto, debe leer este archivo primero y luego el `AGENTS.md` del paquete donde vaya a trabajar.

## Arquitectura real del sistema

La arquitectura gira alrededor de Firebase Realtime Database, no Firestore.

- La autenticacion vive en Firebase Auth.
- Los datos transaccionales viven en Realtime Database.
- Los archivos viven en Firebase Storage.
- La web y la app movil consumen casi toda la logica compartida desde `common`.
- `functions` anade logica server-side para pagos, OTP, emails, notificaciones push y efectos colaterales por cambios en la base.

Flujo general:

1. El usuario inicia sesion desde web o mobile.
2. `common` inicializa Firebase, Redux y carga settings, idiomas, usuario, zonas, tipos de carro y otros catalogos.
3. La UI renderiza segun rol y plataforma.
4. Cloud Functions responde a eventos de base de datos o endpoints HTTP para completar operaciones delicadas como pagos, wallet, OTP y notificaciones.

## Que paquete usar para cada cambio

- Cambios visuales o de UX web: `web-app`.
- Cambios de pantallas o navegacion movil: `mobile-app`.
- Cambios de reglas compartidas de auth, Redux, CRUD o acceso a Firebase: `common`.
- Cambios de pagos, emails, OTP, webhooks, automatismos de backend o side effects de RTDB: `functions`.

Regla practica: si la logica debe comportarse igual en web y app, primero revisa si debe vivir en `common` antes de duplicarla.

## Archivos de entrada mas importantes

- `common/src/config/configureFirebase.js`: inicializacion de Firebase y mapa de referencias a RTDB/Storage/Auth.
- `common/src/actions/authactions.js`: flujo de autenticacion, perfil y validaciones de usuario.
- `common/src/index.js`: exporta `FirebaseProvider`, `store` y el objeto `api`.
- `web-app/src/App.js`: bootstrap web, providers, tema y rutas.
- `mobile-app/App.js`: bootstrap movil y seleccion de variante `driver`/`rider`.
- `mobile-app/AppCommon.shared.js`: carga compartida de settings, idiomas, ubicacion, zona, usuario y notificaciones.
- `mobile-app/src/navigation/AppNavigator.js`: navegacion principal de la app.
- `functions/index.js`: entrypoint del backend serverless.

## Dominios de datos importantes

Las entidades mas repetidas en el repo son:

- `users`
- `bookings`
- `tracking`
- `cars`
- `cartypes`
- `zones`
- `settings`
- `languages`
- `notifications`
- `walletHistory`
- `withdraws`
- `promos`
- `taxes`
- `payment_settings`
- `complain`
- `sos`

Cuando una IA toque uno de estos dominios debe revisar primero en que lugares se usa:

- `common/src/actions/*`
- reducers en `common/src/reducers/*`
- vistas o screens de cada frontend
- triggers o endpoints en `functions/index.js`

## Sobre `common`

`common` es la pieza que mas contexto aporta y la mas facil de subestimar.

Responsabilidades principales:

- Inicializar Firebase para web y React Native.
- Exponer referencias reutilizables a RTDB, Storage y Auth.
- Proveer el store Redux.
- Agrupar acciones de negocio en `api`.

Puntos clave:

- `configureFirebase.js` maneja diferencias entre navegador y React Native.
- Web usa persistencia de auth en navegador.
- Mobile usa `AsyncStorage` para persistencia.
- Muchas pantallas dependen de que `api.fetchSettings()`, `api.fetchLanguage()`, `api.fetchCarTypes()`, `api.fetchZones()` y `api.fetchUser()` hayan corrido correctamente.

## Comandos utiles desde la raiz

- `yarn web`: levanta la web.
- `yarn workspace web-app build`: build web.
- `yarn web:deploy`: build y deploy de hosting.
- `yarn app`: levanta la app movil.
- `yarn app:driver`: levanta variante driver.
- `yarn app:rider`: levanta variante rider.
- `yarn app:build-android`: build Android produccion.
- `yarn app:build-ios`: build iOS produccion.
- `yarn web:functions`: deploy de Cloud Functions.

## Riesgos y zonas delicadas

- El proyecto usa RTDB en muchas pantallas y acciones; pequenos cambios de esquema rompen varias superficies a la vez.
- `wallet`, pagos y cancelaciones tienen efectos financieros. Cualquier cambio exige revisar triggers y providers.
- Auth y `usertype` condicionan navegacion, permisos y visibilidad tanto en web como en mobile.
- `common` y `functions` comparten supuestos sobre paths de RTDB; si cambias uno sin revisar el otro, aparecen bugs silenciosos.
- Idiomas y settings se cargan muy temprano; si fallan, la UI queda en estados parciales o rotos.

## Guia rapida para otra IA

Si vas a trabajar aqui:

1. Lee este archivo.
2. Lee el `AGENTS.md` del paquete objetivo.
3. Si el cambio toca auth, wallet, pagos o roles, revisa tambien `common` y `functions`.
4. Si el cambio toca una pantalla, busca primero que action/reducer de `common` alimenta esa pantalla.
5. Si el cambio toca estructura de RTDB, identifica triggers en `functions/index.js` antes de editar.

## Que NO asumir

- No asumir Firestore.
- No asumir que web y mobile tienen flujos separados; comparten gran parte de la logica via `common`.
- No asumir que una pantalla es solo visual; muchas dependen de settings, idiomas, zonas, permisos o `usertype`.
- No asumir que los pagos viven en un solo proveedor; el backend carga varios gateways dinamicamente.

## Documentacion especifica por paquete

- `web-app/AGENTS.md`
- `mobile-app/AGENTS.md`
- `functions/AGENTS.md`
