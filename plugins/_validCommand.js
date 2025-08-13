export async function before(m) {
  if (!m.text || !global.prefix.test(m.text)) return;
  
  const usedPrefix = global.prefix.exec(m.text)[0];
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();
  
  const validCommand = (cmd, plugins) => {
    return Object.values(plugins).some(plugin => {
      if (!plugin.command) return false;
      const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
      return commands.includes(cmd);
    });
  };

  if (!command || command === "bot") return;

  if (validCommand(command, global.plugins)) {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    
    if (chat.isBanned && command !== "bot") {
      const aviso = `🚫 *Bot ${botname} desactivado* 🔒\n\n💡 *Para reactivar:*\n» \`${usedPrefix}bot on\`\n👑 _(Solo administradores)_`;
      await m.reply(aviso);
      return;
    }
    
    user.commands = (user.commands || 0) + 1;
  } else {
    const cmd = m.text.trim().split(' ')[0];
    await m.reply(`❌ *Comando no encontrado* ❌\n\n🔍 *${cmd}* no existe\n\n📋 *Ver todos los comandos:*\n» \`#help\` o \`#menu\`\n\n💡 *Tip:* Verifica la escritura`);
  }
}
