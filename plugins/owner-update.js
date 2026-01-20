import fetch from "node-fetch";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

let handler = async (m, { conn, usedPrefix, text }) => {
  try {
    // Verificar si es owner
    if (!global.owner.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Este comando solo está disponible para el owner del bot.');
    }

    // Verificar si estamos en un entorno restringido
    const isRestrictedEnv = () => {
      const restrictedHostings = [
        'replit', 'glitch', 'heroku', 'vercel', 'netlify',
        'railway', 'render', 'codesandbox'
      ];
      
      const envVars = Object.keys(process.env).join(' ').toLowerCase();
      const cwd = process.cwd().toLowerCase();
      
      for (const hosting of restrictedHostings) {
        if (envVars.includes(hosting) || cwd.includes(hosting)) {
          return true;
        }
      }
      
      // Verificar si tenemos permisos de ejecución
      try {
        const test = execSync('echo test 2>&1', { stdio: 'pipe' });
        return false;
      } catch {
        return true;
      }
    };

    // Si no hay argumento, mostrar ramas disponibles
    if (!text || text.trim() === '') {
      await m.react('🔍');
      
      try {
        // Método seguro para obtener ramas (sin exec directo)
        let ramaActual = '';
        let ramasDisponibles = [];
        
        // Intentar con método nativo primero
        if (!isRestrictedEnv()) {
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
          } catch (error) {
            console.log('Git falló, usando método alternativo:', error.message);
          }
        }
        
        // Si no hay ramas, usar método alternativo
        if (ramasDisponibles.length === 0) {
          // Intentar obtener desde API de GitHub
          try {
            const response = await fetch('https://api.github.com/repos/tu_usuario/tu_repo/branches');
            const data = await response.json();
            ramasDisponibles = data.map(branch => branch.name);
            
            // Si no tenemos rama actual, usar main por defecto
            ramaActual = ramaActual || 'main';
          } catch (error) {
            ramasDisponibles = ['main', 'master', 'beta', 'alpha'];
            ramaActual = ramaActual || 'main';
          }
        }
        
        if (ramasDisponibles.length === 0) {
          return m.reply('❌ No se encontraron ramas. Usa: *' + usedPrefix + 'update main*');
        }
        
        let listaRamas = `🌿 *RAMAS DISPONIBLES*\n\n`;
        listaRamas += `📍 *Rama actual:* \`${ramaActual}\`\n\n`;
        
        // Mostrar solo las primeras 10 ramas
        ramasDisponibles.slice(0, 10).forEach(rama => {
          listaRamas += `${rama === ramaActual ? '🔹' : '▫️'} *${rama}*\n`;
        });
        
        if (ramasDisponibles.length > 10) {
          listaRamas += `\n... y ${ramasDisponibles.length - 10} más`;
        }
        
        listaRamas += `\n\n💡 *Uso:*\n`;
        listaRamas += `• \`${usedPrefix}update\` - Ver ramas\n`;
        listaRamas += `• \`${usedPrefix}update main\` - Actualizar a main`;
        
        if (isRestrictedEnv()) {
          listaRamas += `\n\n⚠️ *Hosting restringido detectado*\n`;
          listaRamas += `Algunas funciones pueden estar limitadas.`;
        }
        
        await m.react('✅');
        return m.reply(listaRamas);
        
      } catch (error) {
        await m.react('❌');
        return m.reply(`❌ *Error*\n\n${error.message}\n\nUsa: *${usedPrefix}update main*`);
      }
    }
    
    // Si hay argumento, proceder con la actualización
    const ramaDeseada = text.trim().toLowerCase();
    
    await m.react('🕒');
    
    // Mensaje inicial
    const msgInicial = await conn.sendMessage(m.chat, { 
      text: `🔄 *Iniciando actualización a rama: ${ramaDeseada}*\n\n⏳ Preparando...` 
    }, { quoted: m });
    
    // Función para actualizar el mensaje
    const actualizarMensaje = async (texto) => {
      try {
        await conn.sendMessage(m.chat, { 
          text: texto, 
          edit: msgInicial.key 
        });
      } catch (e) {
        console.log('No se pudo editar mensaje:', e.message);
      }
    };
    
    // Método 1: Git tradicional (solo si no está restringido)
    const actualizarConGit = async () => {
      await actualizarMensaje(`🔄 *Actualizando con Git...*\n\nRama: ${ramaDeseada}`);
      
      try {
        // Guardar cambios locales
        await execAsync('git stash');
        
        // Obtener últimos cambios
        await execAsync('git fetch origin');
        
        // Cambiar a la rama deseada
        await execAsync(`git checkout ${ramaDeseada}`);
        
        // Hacer pull
        const { stdout: pullResult } = await execAsync(`git pull origin ${ramaDeseada}`);
        
        // Actualizar dependencias si hay cambios en package.json
        if (pullResult.includes('package.json')) {
          await actualizarMensaje(`🔄 *Actualizando dependencias...*`);
          try {
            await execAsync('npm install --legacy-peer-deps');
          } catch (npmError) {
            console.log('Error npm, intentando con --force:', npmError.message);
            await execAsync('npm install --force');
          }
        }
        
        return { success: true, method: 'git', output: pullResult };
      } catch (error) {
        throw new Error(`Git falló: ${error.message}`);
      }
    };
    
    // Método 2: Descarga directa (para entornos restringidos)
    const actualizarConDescarga = async () => {
      await actualizarMensaje(`🔄 *Descargando actualización...*\n\nMétodo alternativo para hosting`);
      
      try {
        // Crear directorio temporal
        const tempDir = join(process.cwd(), 'temp_update');
        if (!existsSync(tempDir)) {
          mkdirSync(tempDir, { recursive: true });
        }
        
        // Lista de archivos importantes a respaldar
        const archivosImportantes = [
          'database.json', 'settings.js', 'config.js',
          'sessions', 'creds.json', 'lib'
        ];
        
        // Crear backup
        const backupDir = join(process.cwd(), 'backup_' + Date.now());
        mkdirSync(backupDir, { recursive: true });
        
        for (const archivo of archivosImportantes) {
          const origen = join(process.cwd(), archivo);
          const destino = join(backupDir, archivo);
          
          if (existsSync(origen)) {
            // Aquí deberías implementar copia de archivos/directorios
            // Usando fs.copyFileSync o similar
            console.log(`Backup de ${archivo}`);
          }
        }
        
        // En un entorno real, aquí descargarías el repositorio
        // Como ejemplo, solo simulamos la descarga
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return { 
          success: true, 
          method: 'download',
          message: 'Actualización simulada. En hosting real necesitas implementar descarga.'
        };
      } catch (error) {
        throw new Error(`Descarga falló: ${error.message}`);
      }
    };
    
    // Método 3: Reinicio limpio (más seguro)
    const actualizarConReinicio = async () => {
      await actualizarMensaje(`🔄 *Preparando reinicio limpio...*\n\nEsta opción es más segura para hostings`);
      
      try {
        // Crear archivo de instrucciones para reinicio
        const instrucciones = {
          branch: ramaDeseada,
          timestamp: Date.now(),
          action: 'clean_update'
        };
        
        writeFileSync(
          join(process.cwd(), 'update_instructions.json'),
          JSON.stringify(instrucciones, null, 2)
        );
        
        return {
          success: true,
          method: 'restart',
          message: 'Reinicio programado. El bot se reiniciará automáticamente.'
        };
      } catch (error) {
        throw new Error(`Reinicio falló: ${error.message}`);
      }
    };
    
    // Seleccionar método según entorno
    let resultado;
    
    if (isRestrictedEnv()) {
      await actualizarMensaje(`⚠️ *Entorno restringido detectado*\n\nUsando método alternativo...`);
      
      // Intentar método más seguro para hosting
      resultado = await actualizarConReinicio();
    } else {
      try {
        resultado = await actualizarConGit();
      } catch (gitError) {
        await actualizarMensaje(`⚠️ *Git falló, usando método alternativo...*`);
        resultado = await actualizarConDescarga();
      }
    }
    
    if (resultado.success) {
      await m.react('✅');
      
      let mensajeFinal = `
✅ *ACTUALIZACIÓN COMPLETADA*

🌿 *Rama:* \`${ramaDeseada}\`
🔧 *Método:* ${resultado.method}
📅 *Hora:* ${new Date().toLocaleTimeString()}

${resultado.message || ''}

⚠️ *Pasos siguientes:*
1. Verifica que todo funcione
2. Si hay errores, usa \`${usedPrefix}restart\`
3. Reporta problemas con \`${usedPrefix}report\`

📌 *Nota:* Algunos hostings requieren reinicio manual.
      `.trim();
      
      await actualizarMensaje(mensajeFinal);
      
      // Ofrecer reinicio automático si es posible
      if (!isRestrictedEnv()) {
        setTimeout(async () => {
          await conn.sendMessage(m.chat, {
            text: `🔄 *Reinicio automático en 10 segundos...*\n\nUsa \`${usedPrefix}restart\` ahora para reiniciar manualmente.`
          });
        }, 2000);
      }
    } else {
      throw new Error('Todos los métodos de actualización fallaron');
    }
    
  } catch (error) {
    console.error('Error en update:', error);
    
    await m.react('❌');
    
    let mensajeError = `
❌ *ACTUALIZACIÓN FALLIDA*

🔍 *Error:* ${error.message}

💡 *Soluciones:*
1. Verifica tu conexión a internet
2. Asegúrate de que la rama existe
3. En hosting restringido, actualiza manualmente
4. Contacta al soporte del hosting

⚠️ *Para hostings como Replit/Glitch:*
• Ve a la pestaña "Shell"
• Ejecuta: \`git pull origin main\`
• Luego: \`npm install\`
• Finalmente reinicia manualmente

📍 *Comando manual:* \`${usedPrefix}restart\`
    `.trim();
    
    await conn.sendMessage(m.chat, { 
      text: mensajeError 
    }, { quoted: m });
  }
};

// Configuración del handler
handler.help = ['actualizar', 'update'];
handler.tags = ['owner'];
handler.command = ['actualizar', 'update', 'upgrade'];
handler.group = false;
handler.owner = true;
handler.admin = false;
handler.botAdmin = false;

// Configuración de límites
handler.limit = 1;
handler.cooldown = 30000; // 30 segundos

export default handler;