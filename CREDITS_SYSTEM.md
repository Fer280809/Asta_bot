# 🔐 Sistema de Protección de Créditos - Asta Bot

## 📋 Descripción

Este sistema implementa un mecanismo de **validación de credenciales cifradas** para proteger los derechos de autoría del proyecto **『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』** contra forks no autorizados que intenten ocultar o eliminar los créditos a los creadores originales.

## 🎯 Cómo Funciona

### 1. **Validación al Iniciar**
- El archivo `index.js` importa y ejecuta `lib/credits.js` al iniciar
- Se verifica que las credenciales cifradas no hayan sido modificadas
- Si la validación falla, el bot se detiene inmediatamente

### 2. **Archivos del Sistema**

#### `lib/credits.js`
- Contiene las credenciales cifradas con AES-256-CBC
- Valida la integridad usando hash SHA-256
- Se ejecuta al inicio del bot
- Monitorea periódicamente (cada 30 minutos) si las credenciales no fueron modificadas

#### `index.js`
- Importa y ejecuta `validateCredits()` antes de cualquier otra operación
- Inicia el monitoreo periódico con `startCreditsMonitoring()`
- Si detecta cambios, detiene el bot automáticamente

### 3. **Credenciales Protegidas**

Las siguientes credenciales están cifradas y protegidas:

```
🎬 PROYECTO: 『𝕬𝖘𝖆-𝕭𝖔𝖙』
👤 CREADOR: Fer280809 (Fernando)
📊 VERSIÓN: 1.5
🔗 GITHUB: https://github.com/Fer280809/Asta-bot
📧 EMAIL: fer2809fl@gmail.com
```

## ⚠️ Advertencias Críticas

### ❌ **NO HAGAS ESTO:**

1. **NO elimines `lib/credits.js`** - El bot se detendrá
2. **NO modifiques** `ENCRYPTED_CREDENTIALS` o `VALIDATION_HASH` - Fallarán las validaciones
3. **NO remuevas** las líneas de importación en `index.js` - El bot no iniciará
4. **NO edites** los valores hash - El bot detectará tampering y se cerrará

### ✅ **ACCIONES SEGURAS:**

- Clonear el repositorio original
- Hacer forks autorizados (mencionando créditos)
- Modificar solo las funciones y lógica del bot
- Mantener este archivo de documentación

## 🔍 Detección de Tampering

El sistema detecta:

✓ Modificación del archivo `lib/credits.js`  
✓ Cambios en las constantes de encriptación  
✓ Intento de eliminar o comentar la validación  
✓ Alteración del hash de verificación  

Si detecta cualquier cambio **el bot se detendrá automáticamente**.

## 🛡️ Seguridad Técnica

- **Algoritmo**: AES-256-CBC
- **Hash**: SHA-256 para validación de integridad
- **Monitoreo**: Cada 30 minutos
- **Clave**: Basada en hash de "Asta-Bot-Protection-System-2026"

## 📝 Para Desarrolladores Autorizados

Si necesitas regenerar las credenciales:

1. Modifica los datos en `lib/credits.js` si es necesario
2. Usa el algoritmo AES-256-CBC con la clave definida
3. Reemplaza `ENCRYPTED_CREDENTIALS` con el nuevo valor
4. Actualiza `VALIDATION_HASH` correspondiente

## 🚀 Uso

El sistema es **automático** y no requiere configuración adicional.

```javascript
// Se ejecuta automáticamente al iniciar:
await validateCredits() // Validación inicial
startCreditsMonitoring() // Monitoreo cada 30 minutos
```

## 📞 Soporte

Si necesitas autorización para modificar este sistema:
- 📧 Email: fer2809fl@gmail.com
- 🔗 GitHub: https://github.com/Fer280809/Asta-bot

---

**⚖️ Derechos de Autor** © 2026 Fer280809 - MIT License  
**🤝 Respeta el trabajo original** - Mantén los créditos

