export async function all(m) {
  let selection = null;
  
  // Detectar respuesta de BOTONES
  if (m.mtype === 'buttonsResponseMessage') {
    selection = m.message?.buttonsResponseMessage?.selectedButtonId;
    console.log('=== Botón presionado ===');
    console.log('Selección:', selection);
  }
  
  // Detectar respuesta de LISTA
  if (m.mtype === 'listResponseMessage') {
    console.log('=== Lista detectada ===');
    console.log('Mensaje lista:', JSON.stringify(m.message.listResponseMessage, null, 2));
    
    selection = m.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
    console.log('ID seleccionado:', selection);
  }
  
  // Si no hay selección, salir
  if (!selection) {
    if (m.mtype === 'listResponseMessage') {
      console.log('❌ No se pudo extraer la selección de la lista');
    }
    return;
  }
  
  console.log('✅ Comando a ejecutar:', selection);
  
  // Modificar el mensaje para que sea procesado como comando
  m.text = selection;
  m.body = selection;
  m.message.conversation = selection;
  
  if (!m.message.extendedTextMessage) {
    m.message.extendedTextMessage = {};
  }
  m.message.extendedTextMessage.text = selection;
  
  // Limpiar respuestas
  delete m.message.buttonsResponseMessage;
  delete m.message.listResponseMessage;
}