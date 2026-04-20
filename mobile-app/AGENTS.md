# AGENTS.md

## Para que sirve `mobile-app`

`mobile-app` es la app movil del producto construida con Expo y React Native. El mismo codigo base soporta dos variantes:

- `rider`
- `driver`

La variante activa se decide por configuracion y cambia pantallas, flujos y parte de la experiencia.

## Stack principal

- Expo SDK 55
- React Native 0.83
- React Navigation 6
- Firebase para React Native
- `common` para Redux, acciones y logica compartida
- Gluestack UI
- Expo Notifications, Expo Updates, Expo Location y React Native Maps

## Archivos de entrada y lectura obligatoria

- `App.js`: bootstrap principal y carga de la variante.
- `AppCommon.shared.js`: logica de arranque compartida.
- `src/appVariant.js`: resuelve si la app corre como `driver` o `rider`.
- `src/navigation/AppNavigator.js`: navegacion principal.
- `src/screens/index.js`, `src/screens/index.driver.js`, `src/screens/index.rider.js`: agrupacion/export de pantallas.

Si una IA va a tocar mobile y no lee esos archivos primero, casi seguro va a romper algo lateral.

## Como funciona el sistema de variantes

La variante sale de `Constants.expoConfig?.extra?.appVariant`.

- `driver` habilita la app de conductor.
- `rider` habilita la app de cliente.

`App.js` hace imports dinamicos en funcion de esa variante:

- `AppNavigator.driver` o `AppNavigator.rider`
- `AppCommon.driver` o `AppCommon.rider`

Esto es importante porque no toda pantalla esta disponible para ambos tipos de usuario, incluso si comparten codigo base.

## Flujo de arranque real

`App.js` hace varias cosas antes de dejar navegar:

1. carga fonts y assets
2. gestiona splash screen
3. configura Expo Updates
4. configura manejo de notificaciones
5. monta Redux
6. monta `FirebaseProvider` con persistencia en `AsyncStorage`
7. monta el wrapper comun y luego la navegacion

En paralelo, `AppCommon.shared.js` se encarga de:

- cargar settings
- cargar idiomas
- cargar tipos de carro
- cargar zonas
- inicializar i18n
- ajustar `moment` al idioma
- recuperar el usuario actual
- resolver zona por ubicacion
- validar si el usuario abrio la app correcta para su `usertype`
- registrar push token

Ese archivo explica gran parte del comportamiento "magico" de la app.

## Navegacion

La navegacion principal vive en `src/navigation/AppNavigator.js`.

Ese archivo controla:

- flujo de auth
- stacks y tabs
- deep links
- gating por tipo de usuario
- acceso a screens de booking, wallet, pagos, perfil, historial, notificaciones y conductor

Pantallas frecuentes dentro de `src/screens`:

- `LoginScreen.js`
- `Registration.js`
- `RegistrationDriver.js`
- `MapScreen.js`
- `SearchScreen.js`
- `BookedCabScreen.js`
- `RideDetails.js`
- `RideListScreen.js`
- `WalletDetails.js`
- `SelectGatewayScreen.js`
- `DriverTrips.js`
- `DriverIncomeScreen.js`
- `CarsScreen.js`
- `CarEditScreen.js`
- `SettingsScreen.js`
- `ProfileScreen.js`

## Relacion con `common`

Al igual que la web, mobile depende fuertemente de `common`.

Normalmente viven alli:

- auth
- fetch de usuario
- settings
- bookings
- cars
- zones
- wallet
- notifications

Si una pantalla movil muestra datos incorrectos, no asumas que el bug esta en la screen. Primero revisa:

- `../common/src/actions/*`
- `../common/src/reducers/*`
- `../common/src/config/configureFirebase.js`

## Ubicacion, mapas y notificaciones

La app usa varias capacidades nativas y de Expo:

- geolocalizacion
- mapas
- notificaciones push
- deep linking
- updates OTA

Por eso los bugs moviles a menudo no son solo de UI. Pueden venir de permisos, tokens, zona detectada, estado del usuario o settings remotos.

## Donde tocar segun el tipo de cambio

- Cambio de arranque, splash o providers: `App.js`
- Cambio de carga inicial, idioma, usuario o zona: `AppCommon.shared.js`
- Cambio de flujo de navegacion: `src/navigation/AppNavigator.js`
- Cambio de variante: `src/appVariant.js` y archivos `index.driver.js` / `index.rider.js`
- Cambio visual de una pantalla: `src/screens/*`
- Cambio de logica de negocio compartida: `common`

## Comandos utiles desde la raiz

- `yarn app`
- `yarn app:driver`
- `yarn app:rider`
- `yarn app:driver-lan`
- `yarn app:rider-lan`
- `yarn app:build-android`
- `yarn app:build-ios`
- `yarn app:publish`

## Riesgos frecuentes

- Abrir la variante equivocada para el `usertype` del usuario.
- Tocar navegacion sin revisar screens exclusivas de driver o rider.
- Cambiar auth en mobile sin revisar web y `common`.
- Romper persistencia de sesion por cambios en `FirebaseProvider` o `AsyncStorage`.
- Cambiar permisos o tokens push sin revisar Functions y el guardado de `pushToken`.

## Regla practica para otra IA

Si el problema aparece al abrir la app o justo despues del login, revisa primero `App.js` y `AppCommon.shared.js`.
Si el problema es de flujo entre pantallas, revisa `AppNavigator.js`.
Si el problema es de datos, usuario o booking, el origen probablemente esta en `common`.
