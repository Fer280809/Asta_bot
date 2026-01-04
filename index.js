#!/usr/bin/env node
import './setting.js'; // Importar configuración global
import { createConnection } from './lib/baileys.js';
import { loadPlugins } from './handler.js';
import { printBanner, color, clearConsole, printMenu } from './lib/print.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Interfaz para entrada de usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Variables globales
let selectedMethod = null;
let phoneNumber = global.botNumber || "";

// Crear la pregunta como promesa
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function main() {
    clearConsole();
    await printBanner();
    
    console.log(color('cyan', `⚡ ${global.botname} v${global.version}\n`));
    console.log(color('yellow', `👤 Creado por: ${global.etiqueta}\n`));
    
    // Crear directorios automáticamente
    await createDirectories();
    
    // Validar configuración
    validateSettings();
    
    // Mostrar menú principal
    await showMainMenu();
}

async function createDirectories() {
    console.log(color('cyan', '📁 Creando directorios necesarios...\n'));
    
    const directories = [
        'temp',
        'database', 
        'plugins',
        'Sesuke/Principal-sasuke',
        'Sesuke/sup-bot-sasuke',
    ];
    
    try {
        for (const dir of directories) {
            const fullPath = join(__dirname, dir);
            
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(color('green', `   ✓ Creada: ${dir}`));
            } else {
                console.log(color('gray', `   ✓ Ya existe: ${dir}`));
            }
        }
        
        // Crear subcarpetas
        const subdirs = [
            'temp/media',
            'temp/stickers', 
            'temp/downloads',
            'database/users',
            'database/groups',
            'database/economy'
        ];
        
        for (const dir of subdirs) {
            const fullPath = join(__dirname, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }
        
        console.log(color('green', '\n✅ Directorios creados correctamente\n'));
        
    } catch (error) {
        console.log(color('red', `❌ Error creando directorios: ${error.message}`));
        // Continuar de todos modos
    }
}

async function showMainMenu() {
    // Verificar si ya existe sesión
    const credsPath = join(__dirname, global.sessions, 'creds.json');
    if (fs.existsSync(credsPath)) {
        console.log(color('yellow', '📱 Sesión encontrada. Iniciando bot directamente...\n'));
        await startBot();
        return;
    }
    
    printMenu();
    
    const answer = await question(color('green', '👉 Selecciona una opción (1-3): '));
    
    switch (answer.trim()) {
        case '1':
            selectedMethod = 'qr';
            await startBot();
            break;
        case '2':
            selectedMethod = 'code';
            await showCodeMethod();
            break;
        case '3':
            await showSettings();
            break;
        case '0':
            console.log(color('yellow', '\n🌀 Saliendo...'));
            rl.close();
            process.exit(0);
            break;
        default:
            console.log(color('red', '\n❌ Opción inválida'));
            setTimeout(() => showMainMenu(), 1000);
            break;
    }
}

async function showCodeMethod() {
    clearConsole();
    
    console.log(color('cyan', `
╔══════════════════════════════════════╗
║        🔒 VINCULACIÓN POR CÓDIGO     ║
╚══════════════════════════════════════╝`));
    
    // Si no hay número configurado, pedirlo
    if (!phoneNumber) {
        console.log(color('yellow', '\n📱 INGRESA TU NÚMERO DE WHATSAPP:'));
        console.log(color('white', 'Ejemplo: 5213312345678 (sin +)\n'));
        
        let isValid = false;
        while (!isValid) {
            phoneNumber = await question(color('green', '👉 Número: '));
            phoneNumber = phoneNumber.trim().replace(/\D/g, '');
            
            if (phoneNumber.length >= 10 && phoneNumber.length <= 15) {
                isValid = true;
            } else {
                console.log(color('red', '❌ Número inválido. Debe tener entre 10-15 dígitos.'));
            }
        }
        
        console.log(color('green', `✅ Número guardado: ${phoneNumber}`));
    } else {
        console.log(color('green', `\n📱 Usando número: ${phoneNumber}`));
    }
    
    console.log(color('yellow', '\n⏳ Generando código de vinculación...\n'));
    
    await startBot();
}

async function showSettings() {
    clearConsole();
    
    console.log(color('cyan', `
╔══════════════════════════════════════╗
║          ⚙️  CONFIGURACIÓN           ║
╚══════════════════════════════════════╝`));
    
    console.log(color('yellow', '\n📊 CONFIGURACIÓN ACTUAL:'));
    console.log(color('white', `   Nombre: ${global.botname}`));
    console.log(color('white', `   Versión: ${global.version}`));
    console.log(color('white', `   Prefijo: ${global.prefix || 'Ninguno'}`));
    console.log(color('white', `   Sin prefijo: ${global.noPrefix ? '✅' : '❌'}`));
    console.log(color('white', `   Owners: ${global.owner.length}`));
    console.log(color('white', `   Premium: ${global.prem.length}`));
    
    console.log(color('yellow', '\n🔧 OPCIONES:'));
    console.log(color('white', '   1. Cambiar prefijo'));
    console.log(color('white', '   2. Ver lista de owners'));
    console.log(color('white', '   3. Ver lista de premium'));
    console.log(color('white', '   4. Volver al menú principal\n'));
    
    const answer = await question(color('green', '👉 Selecciona (1-4): '));
    
    switch (answer.trim()) {
        case '1':
            const newPrefix = await question(color('green', 'Nuevo prefijo (deja vacío para ninguno): '));
            global.prefix = newPrefix || '';
            console.log(color('green', `✅ Prefijo actualizado: ${global.prefix || 'Ninguno'}`));
            setTimeout(() => showSettings(), 1500);
            break;
        case '2':
            console.log(color('cyan', '\n👑 LISTA DE OWNERS:'));
            global.owner.forEach((owner, i) => {
                console.log(color('white', `   ${i+1}. ${owner}`));
            });
            await question(color('green', '\n👉 Presiona ENTER para continuar... '));
            showSettings();
            break;
        case '3':
            console.log(color('cyan', '\n⭐ LISTA DE PREMIUM:'));
            global.prem.forEach((prem, i) => {
                console.log(color('white', `   ${i+1}. ${prem}`));
            });
            await question(color('green', '\n👉 Presiona ENTER para continuar... '));
            showSettings();
            break;
        case '4':
            await showMainMenu();
            break;
        default:
            console.log(color('red', '❌ Opción inválida'));
            setTimeout(() => showSettings(), 1000);
            break;
    }
}

async function startBot() {
    clearConsole();
    
    console.log(color('cyan', `
╔══════════════════════════════════════╗
║          🚀 INICIANDO BOT            ║
╚══════════════════════════════════════╝`));
    
    console.log(color('yellow', '\n🔄 Cargando plugins...'));
    
    try {
        // Cargar plugins
        const plugins = await loadPlugins();
        console.log(color('green', `✅ ${plugins.size} plugins cargados`));
        
        // Configurar sesión
        const sessionConfig = {
            name: 'Principal-sasuke',
            type: 'principal',
            sessionPath: join(__dirname, global.sessions),
            phoneNumber: selectedMethod === 'code' ? phoneNumber : null,
            showQR: selectedMethod === 'qr',
            method: selectedMethod
        };
        
        console.log(color('cyan', `\n🔗 Método: ${selectedMethod === 'code' ? 'CÓDIGO' : 'QR'}`));
        console.log(color('cyan', `📁 Sesión: ${sessionConfig.name}`));
        
        // Crear conexión
        const sock = await createConnection(sessionConfig, plugins);
        
        // Configurar manejadores
        setupHandlers(sock, plugins, sessionConfig);
        
        // Mostrar estado final
        console.log(color('green', '\n✅ BOT INICIADO CORRECTAMENTE\n'));
        
        if (global.prefix) {
            console.log(color('yellow', `📌 Prefijo: ${global.prefix}`));
        }
        
        if (global.noPrefix) {
            console.log(color('yellow', `📌 También responde sin prefijo`));
        }
        
        console.log(color('yellow', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        
        // Mostrar instrucción final
        if (selectedMethod === 'code' && phoneNumber) {
            console.log(color('cyan', '\n⏳ Generando código de vinculación...'));
            console.log(color('cyan', `   Número: ${phoneNumber}`));
            console.log(color('yellow', '\n📱 Sigue las instrucciones en pantalla'));
        } else if (selectedMethod === 'qr') {
            console.log(color('cyan', '\n📱 Escanea el código QR con WhatsApp'));
        }
        
        console.log(color('yellow', '\n💡 Presiona Ctrl+C para salir'));
        console.log(color('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        
        // Manejar cierre limpio
        setupExitHandlers(sock);
        
    } catch (error) {
        console.log(color('red', `\n❌ Error al iniciar bot: ${error.message}`));
        const retry = await question(color('green', '\n👉 ¿Reintentar? (s/n): '));
        if (retry.toLowerCase() === 's') {
            await showMainMenu();
        } else {
            rl.close();
            process.exit(0);
        }
    }
}

function setupHandlers(sock, plugins, config) {
    // Evento de conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;
        
        if (qr && config.showQR) {
            console.log(color('yellow', '\n📱 CÓDIGO QR GENERADO:'));
            require('qrcode-terminal').generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log(color('green', '\n✅ CONECTADO A WHATSAPP'));
            
            // Mostrar información del usuario
            const user = sock.user;
            console.log(color('cyan', `👤 Conectado como: ${user?.name || 'Usuario'}`));
            console.log(color('cyan', `📞 Número: ${user?.id?.split(':')[0] || 'Desconocido'}`));
            
            // Notificar al owner
            if (global.owner && global.owner.length > 0) {
                notifyOwner(sock);
            }
        }
        
        if (connection === 'close') {
            console.log(color('red', '\n❌ DESCONECTADO DE WHATSAPP'));
            console.log(color('yellow', '🔄 Intentando reconectar en 5 segundos...'));
            setTimeout(async () => {
                try {
                    console.log(color('cyan', '🔄 Reconectando...'));
                    await startBot();
                } catch (error) {
                    console.log(color('red', `❌ Error reconectando: ${error.message}`));
                }
            }, 5000);
        }
    });
}

async function notifyOwner(sock) {
    const owner = global.owner[0];
    if (!owner) return;
    
    try {
        await sock.sendMessage(
            owner,
            { text: `✅ *${global.botname}* está en línea!\n📅 ${new Date().toLocaleString()}` }
        );
    } catch (e) {
        // Silenciar error
    }
}

function setupExitHandlers(sock) {
    process.on('SIGINT', async () => {
        console.log(color('yellow', '\n\n🌀 Cerrando sesión...'));
        try {
            await sock.logout();
        } catch (e) {
            // Ignorar errores
        }
        console.log(color('green', '✅ Sesión cerrada correctamente'));
        rl.close();
        process.exit(0);
    });
}

function validateSettings() {
    console.log(color('cyan', "🔍 Validando configuración..."));
    
    if (!global.prefix && !global.noPrefix) {
        console.log(color('yellow', "⚠️  Advertencia: El bot no responderá a ningún comando"));
    }
    
    if (global.owner.length === 0) {
        console.log(color('yellow', "⚠️  Advertencia: No hay dueños configurados"));
    }
    
    console.log(color('green', "✅ Configuración validada"));
}

// Iniciar aplicación
main().catch(console.error);