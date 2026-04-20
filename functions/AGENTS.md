# AGENTS.md

## Para que sirve `functions`

`functions` es el backend serverless del proyecto sobre Firebase Cloud Functions v2. No reemplaza el acceso directo de los frontends a Firebase; complementa ese acceso con logica que conviene ejecutar del lado servidor.

Sus responsabilidades mas importantes son:

- side effects por cambios en Realtime Database
- pagos y pasarelas
- OTP por email y movil
- validaciones de auth
- emails y SMTP
- notificaciones push
- operaciones de wallet
- utilidades HTTP para frontend y callbacks de pago

## Stack y runtime

- Node.js CommonJS
- `firebase-functions` v2
- `firebase-admin`
- `nodemailer`
- varios SDKs de pago

El paquete opera sobre Firebase Realtime Database, Firebase Auth y en menor medida utilidades HTTP expuestas por Functions.

## Archivos mas importantes

- `index.js`: entrypoint principal y export de funciones.
- `config.json`: configuracion de proyecto y base de datos.
- `appcat.js`: categoria/configuracion complementaria del producto.
- `common/index.js`: helpers de push, wallet y distancia.
- `common/regularfunctions.js`: utilidades compartidas del backend.
- `common/sharedFunctions.js`: helpers adicionales reutilizados por triggers.
- `providers/*`: integracion individual por pasarela de pago.

## Como esta organizada la logica

### 1. Endpoints HTTP

`index.js` expone endpoints como:

- `get_providers`
- `googleapi`
- `success`
- `cancel`
- `validate_referrer`
- `user_signup`
- `update_user_email`
- `gettranslation`
- `getservertime`
- `checksmtpdetails`
- `check_auth_exists`
- `request_mobile_otp`
- `verify_mobile_otp`
- `request_email_otp`
- `verify_email_otp`
- `update_auth_mobile`

Estos endpoints sirven para:

- consultar providers activos
- proxyear llamadas sensibles a Google
- mostrar paginas de exito/cancelacion de pago
- validar referidos
- sincronizar datos de auth
- emitir y validar OTP
- probar configuracion SMTP

### 2. Triggers sobre Realtime Database

Tambien hay triggers importantes:

- `updateBooking`
- `withdrawCreate`
- `withdrawUpdate`
- `userDelete`
- `complainUpdate`
- `documentStatusUpdate`

Estos triggers manejan logica como:

- notificar conductores o usuarios
- mover dinero a wallet
- aplicar o revertir cargos
- reaccionar a cancelaciones
- procesar retiros
- limpiar datos asociados
- informar cambios de documentos o reclamos

### 3. Providers de pago

Los providers se cargan dinamicamente desde `providers/*`.

Pasarelas presentes en el repo:

- `braintree`
- `culqi`
- `flutterwave`
- `iyzico`
- `liqpay`
- `mercadopago`
- `payfast`
- `paymongo`
- `paypal`
- `paystack`
- `payulatam`
- `razorpay`
- `securepay`
- `slickpay`
- `squareup`
- `stripe`
- `tap`
- `test`
- `wipay`
- `xendit`

La lista efectiva depende tambien de `payment_settings` en RTDB.

## Cosas muy importantes que otra IA debe saber

### La base de datos principal es RTDB

Los paths de RTDB son parte del contrato del sistema. Si cambias estructura de:

- `bookings`
- `users`
- `walletHistory`
- `withdraws`
- `payment_settings`
- `tracking`

debes revisar triggers, frontends y helpers de `common`.

### Hay logica financiera sensible

`common/index.js` expone helpers como:

- `RequestPushMsg`
- `addToWallet`
- `deductFromWallet`
- `getDistance`

`addToWallet` y `deductFromWallet` no son detalles menores. Cualquier cambio ahi afecta saldo, historial y notificaciones del usuario.

### Los providers estan desacoplados pero no aislados

Aunque cada gateway vive en su propio archivo, todos comparten supuestos sobre:

- settings de pago
- rutas de retorno
- estructura de bookings y wallet
- estados de transaccion

No cambies un proveedor pensando que solo impacta ese archivo.

### `googleapi` tiene logica de IP/blocklist

El endpoint `googleapi` no es un simple proxy. Revisa:

- settings remotos
- `blockIps`
- `blocklist`
- `ipList`

antes de modificarlo.

## Donde tocar segun el tipo de cambio

- Nuevo webhook o endpoint HTTP: `index.js` o un archivo de `providers`
- Cambio en wallet, push o helpers backend: `common/index.js`
- Cambio de integracion de pago: `providers/*`
- Cambio de emails/SMTP/OTP: `index.js` y utilidades relacionadas
- Cambio por eventos de booking, retiro o documentos: triggers en `index.js`

## Comandos utiles

Desde la raiz:

- `yarn web:functions`

Desde este paquete:

- `yarn deploy`
- `yarn serve`
- `yarn shell`
- `yarn logs`

## Riesgos frecuentes

- Duplicar efectos de wallet o notificaciones por triggers mal condicionados.
- Romper callbacks de pago por cambiar paths o estados esperados.
- Cambiar auth o email sin revisar web, mobile y `common`.
- Asumir que un cambio en un provider no impacta el flujo completo de booking/pago.

## Regla practica para otra IA

Si el bug involucra dinero, estados de booking, OTP, proveedores de pago o emails, empieza por `functions/index.js` y sigue el flujo hasta `common` y el frontend afectado.
