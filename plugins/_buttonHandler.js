export async function before(m, { conn, usedPrefix }) {
  // Solo procesar respuestas de botones
  if (m.mtype !== 'buttonsResponseMessage') return;
  
  console.log('=== BOTÓN INTERCEPTADO ===');
  
  // Obtener la selección del botón
  let selection = m.message?.buttonsResponseMessage?.selectedButtonId;
  
  if (!selection) return;
  
  console.log('Botón seleccionado:', selection);
  
  // Extraer el comando (quitar el punto)
  let cmd = selection.replace(/^\./, '');
  console.log('Comando a buscar:', cmd);
  
  // Buscar y ejecutar el plugin
  for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin || !plugin.command) continue;
    
    let commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    
    if (commands.includes(cmd)) {
      console.log('✅ Plugin encontrado:', name);
      
      try {
        await plugin.call(this, m, {
          conn,
          usedPrefix,
          command: cmd,
          args: [],
          text: ''
        });
        return true;
      } catch (e) {
        console.error('❌ Error ejecutando plugin:', e);
        return true;
      }
    }
  }
  
  console.log('⚠️ No se encontró plugin para:', cmd);
}