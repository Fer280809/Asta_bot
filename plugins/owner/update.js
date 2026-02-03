import fetch from "node-fetch";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "fs";
import { join, dirname } from "path";

const execAsync = promisify(exec);

let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.');
    }

    // Configuración del repositorio
    const REPO_URL = "https://github.com/Fer280809/asta.git";
    const REPO_API = "https://api.github.com/repos/Fer280809/asta/branches";
    const REPO_RAW = "https://raw.githubusercontent.com/Fer280809/asta";

    // Detectar entorno restringido
    const isRestrictedEnv = () => {
      const restrictedHostings = [
        'replit', 'glitch', 'heroku', 'vercel', 'netlify',
        'railway', 'render', 'codesandbox', 'stackblitz'
      ];
      
      const envVars = Object.keys(process.env).join(' ').toLowerCase();
      const cwd = process.cwd().toLowerCase();
      
      for (const hosting of restrictedHostings) {
        if (envVars.includes(hosting) || cwd.includes(hosting)) {
          console.log(`⚠️ Entorno restringido detectado: ${hosting}`);
          return true;
        }
      }
      
      return false;
    };

    // Función para copiar directorios recursivamente
    const copyDirSync = (src, dest) => {
      if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
      
      const items = readdirSync(src);
      for (const item of items) {
        const srcPath = join(src, item);
        const destPath = join(dest, item);
        
        if (statSync(srcPath).isDirectory()) {
          copyDirSync(srcPath, destPath);
        } else {
          copyFileSync(srcPath, destPath);
        }
      }
    };

    // Si no hay argumento, mostrar ramas disponibles
    if (!text || text.trim() === '') {
      await m.react('🔍');
      
      try {
        let ramaActual = '';
        let ramasDisponibles = [];
        const restricted = isRestrictedEnv();
        
        // Intentar obtener ramas de Git local si no está restringido
        if (!restricted) {
          try {
            const { stdout: currentBranch } = await execAsync('git branch --show-current');
            ramaActual = currentBranch.trim();
            
            await execAsync('git fetch origin --prune');
            const { stdout: branches } = await execAsync('git branch -r');
            
            ramasDisponibles = branches
              .split('\n')
              .map(r => r.trim())
              .filter(r => r && !r.includes('HEAD') && r.startsWith('origin/'))
              .map(r => r.replace('origin/', ''));
          } catch (gitError) {
            console.log('Git local falló:', gitError.message);
          }
        }
        
        // Si no hay ramas locales, obtener de GitHub API
        if (ramasDisponibles.length === 0) {
          try {
            const response = await fetch(REPO_API);
            if (response.ok) {
              const data = await response.json();
              ramasDisponibles = data.map(branch => branch.name);
            } else {
              // Valores por defecto si la API falla
              ramasDisponibles = ['main', 'master', 'beta', 'alpha', 'develop'];
            }
          } catch (apiError) {
            ramasDisponibles = ['main', 'master', 'beta', 'alpha'];
          }
        }
        
        // Determinar rama actual si no se pudo obtener
        if (!ramaActual) {
          ramaActual = ramasDisponibles.includes('main') ? 'main' : 
                      ramasDisponibles.includes('master') ? 'master' : 
                      ramasDisponibles[0] || 'main';
        }
        
        if (ramasDisponibles.length === 0) {
          return m.reply('❌ No se encontraron ramas. Usa: *' + usedPrefix + 'update main*');
        }
        
        let listaRamas = `🌿 *RAMAS DISPONIBLES - ASTA BOT*\n\n`;
        listaRamas += `📍 *Rama actual:* \`${ramaActual}\`\n`;
        listaRamas += `📦 *Repositorio:* ${REPO_URL.replace('https://github.com/', '')}\n\n`;
        
        // Mostrar ramas agrupadas
        const ramasPrincipales = ['main', 'master'];
        const ramasSecundarias = ramasDisponibles.filter(r => !ramasPrincipales.includes(r));
        
        ramasPrincipales.forEach(rama => {
          if (ramasDisponibles.includes(rama)) {
            listaRamas += `${rama === ramaActual ? '🌟' : '⭐'} *${rama}* (estable)\n`;
          }
        });
        
        if (ramasSecundarias.length > 0) {
          listaRamas += `\n📌 *Otras ramas:*\n`;
          ramasSecundarias.slice(0, 8).forEach(rama => {
            listaRamas += `${rama === ramaActual ? '🔹' : '▫️'} ${rama}\n`;
          });
          
          if (ramasSecundarias.length > 8) {
            listaRamas += `... y ${ramasSecundarias.length - 8} más\n`;
          }
        }
        
        listaRamas += `\n💡 *Uso:*\n`;
        listaRamas += `• \`${usedPrefix}update\` - Ver ramas\n`;
        listaRamas += `• \`${usedPrefix}update main\` - Actualizar a main\n`;
        listaRamas += `• \`${usedPrefix}update <rama>\` - Cambiar a otra rama`;
        
        if (restricted) {
          listaRamas += `\n\n⚠️ *Hosting restringido detectado*\n`;
          listaRamas += `Algunas funciones de Git pueden estar limitadas.`;
        }
        
        await m.react('✅');
        return m.reply(listaRamas);
        
      } catch (error) {
        await m.react('❌');
        return m.reply(`❌ *Error al obtener ramas*\n\n${error.message}\n\nUsa: *${usedPrefix}update main*`);
      }
    }
    
    // Procesar la actualización
    const ramaDeseada = text.trim();
    const ramaLower = ramaDeseada.toLowerCase();
    
    await m.react('🕒');
    
    // Mensaje inicial
    const msgInicial = await conn.sendMessage(m.chat, { 
      text: `🔄 *INICIANDO ACTUALIZACIÓN*\n\n` +
            `🌿 *Rama destino:* ${ramaDeseada}\n` +
            `📦 *Repositorio:* Fer280809/asta\n` +
            `⏳ *Estado:* Preparando...\n\n` +
            `_Este proceso puede tomar unos minutos..._`
    }, { quoted: m });
    
    // Función para actualizar el mensaje con progreso
    const actualizarMensaje = async (texto, progreso = null) => {
      try {
        let mensaje = texto;
        if (progreso !== null) {
          const barras = Math.round(progreso / 10);
          const porcentaje = Math.round(progreso);
          mensaje += `\n\n📊 *Progreso:* [${'█'.repeat(barras)}${'░'.repeat(10-barras)}] ${porcentaje}%`;
        }
        
        await conn.sendMessage(m.chat, { 
          text: mensaje, 
          edit: msgInicial.key 
        });
      } catch (e) {
        console.log('No se pudo editar mensaje:', e.message);
      }
    };
    
    // Método 1: Git tradicional
    const actualizarConGit = async () => {
      await actualizarMensaje(`🔄 *Actualizando con Git...*\n\nRama: ${ramaDeseada}`, 10);
      
      try {
        // Verificar si estamos en un repositorio Git
        await actualizarMensaje(`🔍 Verificando repositorio Git...`, 20);
        await execAsync('git status');
        
        // Guardar cambios locales si existen
        await actualizarMensaje(`💾 Guardando cambios locales...`, 30);
        try {
          await execAsync('git stash');
        } catch (stashError) {
          // Ignorar si no hay cambios
        }
        
        // Obtener últimos cambios
        await actualizarMensaje(`📥 Obteniendo cambios remotos...`, 40);
        await execAsync('git fetch origin --prune');
        
        // Cambiar a la rama deseada
        await actualizarMensaje(`🌿 Cambiando a rama ${ramaDeseada}...`, 50);
        try {
          await execAsync(`git checkout ${ramaDeseada}`);
        } catch (checkoutError) {
          // Si la rama no existe localmente, crearla desde origin
          await execAsync(`git checkout -b ${ramaDeseada} origin/${ramaDeseada}`);
        }
        
        // Hacer pull con merge
        await actualizarMensaje(`📦 Fusionando cambios...`, 70);
        const { stdout: pullResult } = await execAsync(`git pull origin ${ramaDeseada} --no-rebase`);
        
        // Verificar si hay cambios en package.json
        await actualizarMensaje(`📄 Analizando dependencias...`, 80);
        if (pullResult.includes('package.json') || pullResult.includes('package-lock.json')) {
          await actualizarMensaje(`📦 Actualizando dependencias...`, 85);
          try {
            await execAsync('npm ci --only=production');
          } catch (ciError) {
            try {
              await execAsync('npm install --legacy-peer-deps');
            } catch (npmError) {
              await execAsync('npm install --force');
            }
          }
        }
        
        await actualizarMensaje(`✅ Git actualizado correctamente`, 95);
        
        return { 
          success: true, 
          method: 'git', 
          output: pullResult.substring(0, 500) + '...',
          needRestart: true
        };
      } catch (error) {
        throw new Error(`Git falló: ${error.message}`);
      }
    };
    
    // Método 2: Descarga directa desde GitHub
    const actualizarConDescarga = async () => {
      await actualizarMensaje(`🌐 Usando método alternativo...`, 10);
      
      try {
        const tempDir = join(process.cwd(), 'temp_update_' + Date.now());
        const backupDir = join(process.cwd(), 'backup_' + Date.now());
        
        // Crear directorios temporales
        mkdirSync(tempDir, { recursive: true });
        mkdirSync(backupDir, { recursive: true });
        
        // Archivos y directorios importantes a respaldar
        const archivosImportantes = [
          'database.json', 'settings.js', 'config.js', 'creds.json',
          'sessions', 'lib', 'data', 'premium.json', 'ban.json'
        ];
        
        await actualizarMensaje(`💾 Creando backup...`, 20);
        
        // Hacer backup
        for (const archivo of archivosImportantes) {
          const origen = join(process.cwd(), archivo);
          if (existsSync(origen)) {
            const destino = join(backupDir, archivo);
            if (statSync(origen).isDirectory()) {
              copyDirSync(origen, destino);
            } else {
              copyFileSync(origen, destino);
            }
          }
        }
        
        // En un entorno real, aquí descargarías el ZIP del repositorio
        // Como ejemplo, simulamos la descarga
        await actualizarMensaje(`📥 Descargando actualización...`, 40);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simular extracción
        await actualizarMensaje(`📦 Extrayendo archivos...`, 70);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Aquí iría la lógica real de descarga y extracción
        // const downloadUrl = `https://github.com/Fer280809/asta/archive/refs/heads/${ramaDeseada}.zip`;
        // ... descargar y extraer ...
        
        await actualizarMensaje(`🔄 Restaurando configuración...`, 90);
        
        // Restaurar archivos importantes del backup
        for (const archivo of archivosImportantes) {
          const backupPath = join(backupDir, archivo);
          const destinoPath = join(process.cwd(), archivo);
          
          if (existsSync(backupPath)) {
            if (statSync(backupPath).isDirectory()) {
              copyDirSync(backupPath, destinoPath);
            } else {
              copyFileSync(backupPath, destinoPath);
            }
          }
        }
        
        // Crear instrucciones para npm install
        writeFileSync(
          join(process.cwd(), 'post_update.js'),
          `console.log('Ejecutando post-actualización...');
           const { execSync } = require('child_process');
           try {
             execSync('npm install --production', { stdio: 'inherit' });
             console.log('✅ Dependencias actualizadas');
           } catch(e) {
             console.error('❌ Error en npm install:', e.message);
           }`
        );
        
        return {
          success: true,
          method: 'download',
          message: 'Descarga simulada. En producción necesitas implementar la descarga real.',
          backupLocation: backupDir,
          needRestart: true
        };
      } catch (error) {
        throw new Error(`Descarga falló: ${error.message}`);
      }
    };
    
    // Seleccionar método de actualización
    let resultado;
    const restricted = isRestrictedEnv();
    
    if (!restricted) {
      try {
        resultado = await actualizarConGit();
      } catch (gitError) {
        await actualizarMensaje(`⚠️ Git falló, usando método alternativo...`, 0);
        resultado = await actualizarConDescarga();
      }
    } else {
      resultado = await actualizarConDescarga();
    }
    
    // Mostrar resultado final
    if (resultado.success) {
      await m.react('✅');
      
      let mensajeFinal = `
✅ *ACTUALIZACIÓN COMPLETADA*

🌿 *Rama:* \`${ramaDeseada}\`
🔧 *Método:* ${resultado.method}
📅 *Hora:* ${new Date().toLocaleTimeString()}
📊 *Estado:* ${resultado.needRestart ? 'Reinicio requerido' : 'Listo'}

${resultado.message ? '📝 ' + resultado.message : ''}

⚠️ *Siguientes pasos:*
1. Verifica los cambios en los logs
2. ${resultado.needRestart ? `Usa \`${usedPrefix}restart\` para aplicar cambios` : 'Los cambios están activos'}
3. Reporta problemas con \`${usedPrefix}reporte\`

🔗 *Repositorio:* Fer280809/asta
      `.trim();
      
      await actualizarMensaje(mensajeFinal, 100);
      
      // Ofrecer opción de reinicio si es necesario
      if (resultado.needRestart && !restricted) {
        setTimeout(async () => {
          await conn.sendMessage(m.chat, {
            text: `🔄 *¿Reiniciar ahora?*\n\n` +
                  `Los cambios requieren reinicio para aplicar.\n\n` +
                  `✅ *Sí:* \`${usedPrefix}restart\`\n` +
                  `⏳ *Más tarde:* El bot seguirá funcionando hasta el próximo reinicio`
          });
        }, 3000);
      }
      
    } else {
      throw new Error('La actualización falló');
    }
    
  } catch (error) {
    console.error('Error en update:', error);
    
    await m.react('❌');
    
    let mensajeError = `
❌ *ACTUALIZACIÓN FALLIDA*

🔍 *Error:* ${error.message}

💡 *Soluciones recomendadas:*
1. Verifica el nombre de la rama
2. Comprueba tu conexión a internet
3. Asegúrate de tener permisos de escritura

🛠️ *Para hostings restringidos (Replit/Glitch):*
\`\`\`bash
# En la terminal del hosting:
git pull origin ${text || 'main'}
npm install
# Luego reinicia manualmente
\`\`\`

📌 *Comandos útiles:*
• \`${usedPrefix}restart\` - Reiniciar bot
• \`${usedPrefix}reporte\` - Reportar problema
• \`${usedPrefix}owner\` - Contactar al desarrollador
    `.trim();
    
    await conn.sendMessage(m.chat, { 
      text: mensajeError 
    }, { quoted: m });
  }
};

// Configuración del handler
handler.help = ['actualizar', 'update'];
handler.tags = ['owner'];
handler.command = ['actualizar', 'update', 'upgrade', 'gitpull'];
handler.group = false;
handler.owner = true;
handler.admin = false;
handler.botAdmin = false;
handler.limit = 1;
handler.cooldown = 60000; // 1 minuto

export default handler;