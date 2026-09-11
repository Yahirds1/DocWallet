# DocWallet

Aplicación móvil local para guardar imágenes y documentos PDF, con protección
biométrica opcional por documento.

## Ejecutar el proyecto

Requisitos:

- Node.js 20 o superior.
- Expo Go instalado en el teléfono.
- Teléfono y computadora conectados a la misma red.

Desde la carpeta `docwallet`:

```bash
npm install
npx expo start
```

Después, escanea el código QR con Expo Go. Si la red local bloquea la conexión,
inicia Expo con:

```bash
npx expo start --tunnel
```

## Probar el flujo

1. Presiona el botón `+`.
2. Escribe un nombre y selecciona una categoría.
3. Toma una fotografía, elige una imagen o selecciona un PDF.
4. Activa o desactiva la protección biométrica.
5. Guarda el documento y ábrelo desde Inicio.
6. Para documentos protegidos, confirma tu identidad con el método del teléfono.
7. Desde el menú `...` puedes editar o eliminar el documento.

## Biometría

- En Android, huella o reconocimiento facial se pueden probar desde Expo Go si
  el dispositivo tiene biometría configurada.
- En iOS, Face ID no funciona dentro de Expo Go. Apple exige probarlo mediante
  un development build. Touch ID sí puede estar disponible según el dispositivo.
- La aplicación no guarda información biométrica. La validación la realiza el
  sistema operativo mediante `expo-local-authentication`.

## Datos locales

Los metadatos se guardan con AsyncStorage y los archivos se copian al directorio
privado de DocWallet. No se utiliza Firebase, backend, cuentas ni servidores.

En iOS el PDF se muestra dentro de la aplicación. En Android se presenta una
vista protegida y el botón `Abrir PDF` utiliza el visor de PDF instalado en el
dispositivo, después de completar la autenticación cuando corresponda.
