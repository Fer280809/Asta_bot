/* Menú de Logos Separado por API - Por @Rayo-ofc */

const logosEphoto = {
  '🎮 GAMING': [
    { cmd: 'naruto', emoji: '🍥', desc: 'Estilo Naruto Shippuden' },
    { cmd: 'dragonball', emoji: '🟠', desc: 'Estilo Dragon Ball' },
    { cmd: 'pubg', emoji: '🔫', desc: 'Logo PUBG' },
    { cmd: 'amongus', emoji: '👾', desc: 'Among Us' },
    { cmd: 'minion', emoji: '💛', desc: 'Estilo Minions' }
  ],
  '✨ EFECTOS NEON': [
    { cmd: 'neon', emoji: '💡', desc: 'Luz Neón' },
    { cmd: 'neonglitch', emoji: '🌈', desc: 'Neón Glitch' },
    { cmd: 'neoncity', emoji: '🌃', desc: 'Ciudad Neón' },
    { cmd: 'neonmaker', emoji: '🔆', desc: 'Creador Neón Galaxia' },
    { cmd: 'multicolor', emoji: '💫', desc: 'Neón Multicolor' },
    { cmd: 'colorful', emoji: '🎨', desc: 'Colores Brillantes' }
  ],
  '🌟 BRILLO Y RESPLANDOR': [
    { cmd: 'glow', emoji: '✨', desc: 'Resplandor Avanzado' },
    { cmd: 'glowing', emoji: '💎', desc: 'Texto Brillante' },
    { cmd: 'stars', emoji: '⭐', desc: 'Luz de Estrellas' },
    { cmd: 'gradient', emoji: '🌀', desc: 'Gradiente 3D' },
    { cmd: 'gold', emoji: '🥇', desc: 'Oro Lujoso' },
    { cmd: 'silver3d', emoji: '🪙', desc: 'Plata 3D Brillante' }
  ],
  '🎬 CINE Y SERIES': [
    { cmd: 'harry', emoji: '⚡', desc: 'Harry Potter' },
    { cmd: 'marvel', emoji: '🦸', desc: 'Marvel Studios' },
    { cmd: 'deadpool', emoji: '🔴', desc: 'Logo Deadpool' },
    { cmd: 'blackpink', emoji: '💖', desc: 'Estilo BLACKPINK' },
    { cmd: 'bplogo', emoji: '🌸', desc: 'Logo BLACKPINK' },
    { cmd: 'bornpink', emoji: '🎀', desc: 'BORN PINK Album' },
    { cmd: 'signatures', emoji: '✍️', desc: 'Firmas BLACKPINK' },
    { cmd: '1917', emoji: '🎥', desc: 'Estilo 1917' }
  ],
  '🔥 EFECTOS NATURALES': [
    { cmd: 'fire', emoji: '🔥', desc: 'Fuego Épico' },
    { cmd: 'ice', emoji: '🧊', desc: 'Hielo Frío' },
    { cmd: 'rainy', emoji: '🌧️', desc: 'Lluvia Neblinosa' },
    { cmd: 'clouds', emoji: '☁️', desc: 'Efecto Nubes' },
    { cmd: 'sky', emoji: '🌤️', desc: 'Cielo Nublado' },
    { cmd: 'underwater', emoji: '🌊', desc: 'Bajo el Agua 3D' }
  ],
  '🏖️ PLAYA Y VERANO': [
    { cmd: 'beach', emoji: '🏖️', desc: 'Arena de Playa' },
    { cmd: 'sand', emoji: '🏝️', desc: 'Arena de Verano' },
    { cmd: 'wetsand', emoji: '💦', desc: 'Arena Mojada' }
  ],
  '🌌 ESPACIAL Y TECH': [
    { cmd: 'galaxy', emoji: '🪐', desc: 'Fondo Galaxia' },
    { cmd: 'galaxystyle', emoji: '🌌', desc: 'Estilo Galaxia' },
    { cmd: 'matrix', emoji: '🟩', desc: 'Matrix Digital' },
    { cmd: 'glitch', emoji: '🟣', desc: 'Glitch Digital' },
    { cmd: 'pixel', emoji: '🔳', desc: 'Pixel Glitch' }
  ],
  '🎨 ARTE Y DISEÑO': [
    { cmd: 'watercolor', emoji: '🖍️', desc: 'Acuarela' },
    { cmd: 'graffiti', emoji: '🎨', desc: 'Graffiti Color' },
    { cmd: 'cartoon', emoji: '🖌️', desc: 'Estilo Cartoon' },
    { cmd: 'papercut', emoji: '✂️', desc: 'Papel Cortado 3D' },
    { cmd: 'typography', emoji: '📝', desc: 'Tipografía Pavimento' },
    { cmd: 'paintcolor', emoji: '🎨', desc: 'Pintura 3D Colorida' },
    { cmd: 'multilayer', emoji: '📐', desc: 'Arte Multicapa' },
    { cmd: 'comic3d', emoji: '💥', desc: 'Cómic 3D' }
  ],
  '👑 ELEGANTE Y REAL': [
    { cmd: 'royal', emoji: '👑', desc: 'Texto Real' },
    { cmd: 'steeleph', emoji: '🔩', desc: 'Acero' },
    { cmd: 'angel', emoji: '👼', desc: 'Alas de Ángel' }
  ],
  '🎯 ESPECIALES': [
    { cmd: 'glass', emoji: '💧', desc: 'Vidrio Mojado' },
    { cmd: 'foggy', emoji: '🌫️', desc: 'Vidrio Empañado' },
    { cmd: 'hologram', emoji: '💠', desc: 'Holograma 3D' },
    { cmd: 'equalizer', emoji: '🎚️', desc: 'Ecualizador Música' },
    { cmd: 'flag', emoji: '🏳️', desc: 'Bandera Nigeria 3D' },
    { cmd: 'flag3d', emoji: '🏁', desc: 'Bandera USA 3D' },
    { cmd: 'eraser', emoji: '❌', desc: 'Efecto Borrador' },
    { cmd: 'bear', emoji: '🐻', desc: 'Logo Oso' },
    { cmd: 'rainbow', emoji: '🌈', desc: 'Arcoíris Brillante' },
    { cmd: 'balloon3d', emoji: '🎈', desc: 'Globos 3D' },
    { cmd: 'quotes', emoji: '💬', desc: 'Frases con Fotos' },
    { cmd: 'pornhub', emoji: '🟧', desc: 'Estilo PornHub' }
  ],
  '🎄 AÑO NUEVO 2025': [
    { cmd: 'newyear2025', emoji: '🎊', desc: 'Año Nuevo 2025' },
    { cmd: 'golden2025', emoji: '✨', desc: 'Dorado 2025' }
  ]
};

const logosTextpro = {
  '🎮 GAMING': [
    { cmd: 'minecraft', emoji: '⛏️', desc: 'Minecraft' },
    { cmd: 'battlefield', emoji: '🎖️', desc: 'Battlefield 4' },
    { cmd: 'cod', emoji: '🔫', desc: 'Call of Duty' },
    { cmd: 'freefire', emoji: '🔥', desc: 'Free Fire' },
    { cmd: 'gamelogo', emoji: '🕹️', desc: 'Logo 8-Bit Clásico' }
  ],
  '✨ EFECTOS NEON': [
    { cmd: 'neondevil', emoji: '😈', desc: 'Neón Alas Diabólicas' },
    { cmd: 'neonlight', emoji: '💡', desc: 'Luz Neón' },
    { cmd: 'neongalaxy', emoji: '🌌', desc: 'Neón Galaxia 3D' },
    { cmd: 'neoncolor', emoji: '🌈', desc: 'Neón Colorido' }
  ],
  '🌟 3D Y METALICO': [
    { cmd: 'vintage3d', emoji: '💡', desc: 'Bombilla Vintage 3D' },
    { cmd: 'stone3d', emoji: '🗿', desc: 'Piedra 3D' },
    { cmd: 'metal3d', emoji: '🔩', desc: 'Metal 3D' },
    { cmd: 'chrome3d', emoji: '✨', desc: 'Cromado 3D' },
    { cmd: 'box3d', emoji: '📦', desc: 'Caja 3D' },
    { cmd: 'steel', emoji: '⚙️', desc: 'Acero Oscuro Dorado' }
  ],
  '🔥 EFECTOS NATURALES': [
    { cmd: 'thunder', emoji: '⚡', desc: 'Efecto Trueno' },
    { cmd: 'magma', emoji: '🌋', desc: 'Magma Caliente' },
    { cmd: 'lava', emoji: '🔥', desc: 'Lava' },
    { cmd: 'water', emoji: '💦', desc: 'Salpicadura de Agua' },
    { cmd: 'ice3d', emoji: '🧊', desc: 'Hielo 3D' },
    { cmd: 'snow', emoji: '❄️', desc: 'Nieve' }
  ],
  '👻 HORROR Y TERROR': [
    { cmd: 'horror', emoji: '🩸', desc: 'Horror Sangriento' },
    { cmd: 'zombie', emoji: '🧟', desc: 'Estilo Zombie Verde' },
    { cmd: 'halloween', emoji: '🎃', desc: 'Fuego Halloween' },
    { cmd: 'demon', emoji: '👹', desc: 'Demonio' }
  ],
  '🎨 ARTE Y DISEÑO': [
    { cmd: 'sketch', emoji: '✏️', desc: 'Boceto a Lápiz' },
    { cmd: 'pencil', emoji: '✍️', desc: 'Dibujo a Lápiz' },
    { cmd: 'graffiti3d', emoji: '🎨', desc: 'Graffiti 3D Maravilloso' },
    { cmd: 'blackpinktxt', emoji: '💖', desc: 'Logo BLACKPINK' },
    { cmd: 'glitter', emoji: '✨', desc: 'Brillo Metálico Púrpura' },
    { cmd: 'christmas', emoji: '🎄', desc: 'Árbol de Navidad' }
  ],
  '🎯 ESPECIALES': [
    { cmd: 'matrixtxt', emoji: '🟩', desc: 'Estilo Matrix' },
    { cmd: 'circuit', emoji: '🔌', desc: 'Circuito Tecnológico' },
    { cmd: 'transformer', emoji: '🤖', desc: 'Transformers' },
    { cmd: 'blood', emoji: '🩸', desc: 'Sangre en Vidrio' },
    { cmd: 'glowingtxt', emoji: '💫', desc: 'Brillo Neón' },
    { cmd: 'toxic', emoji: '☢️', desc: 'Tóxico' },
    { cmd: 'joker', emoji: '🃏', desc: 'Logo Joker' },
    { cmd: 'lionlogo', emoji: '🦁', desc: 'Mascota León' },
    { cmd: 'ninja', emoji: '🥷', desc: 'Logo Ninja' },
    { cmd: 'pornhubtxt', emoji: '🟧', desc: 'Estilo PornHub' },
    { cmd: 'tiktok', emoji: '📱', desc: 'Glitch TikTok' },
    { cmd: 'rainbowtxt', emoji: '🌈', desc: 'Ecualizador Arcoíris' },
    { cmd: 'gradienttxt', emoji: '🌀', desc: 'Gradiente' },
    { cmd: 'hologramtxt', emoji: '💠', desc: 'Holograma 3D' },
    { cmd: 'glitch3d', emoji: '📺', desc: 'Glitch 3D' }
  ]
};

const handler = async (m, { conn, usedPrefix }) => {
  // Contar totales
  const totalEphoto = Object.values(logosEphoto).flat().length;
  const totalTextpro = Object.values(logosTextpro).flat().length;
  const totalGeneral = totalEphoto + totalTextpro;

  let menuText = `╔════════════════════════════╗
║    🎨 *MENÚ DE LOGOS* 🎨    ║
║  Total: ${totalGeneral} efectos disponibles  ║
╚════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📱 *EPHOTO360* (${totalEphoto} efectos)
┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;

  // EPHOTO360
  for (const [categoria, logos] of Object.entries(logosEphoto)) {
    menuText += `\n╭─『 ${categoria} 』\n`;
    logos.forEach(logo => {
      menuText += `│ ${logo.emoji} *${usedPrefix}${logo.cmd}*\n│    ${logo.desc}\n`;
    });
    menuText += `╰${'─'.repeat(25)}\n`;
  }

  menuText += `\n┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔷 *TEXTPRO* (${totalTextpro} efectos)
┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;

  // TEXTPRO
  for (const [categoria, logos] of Object.entries(logosTextpro)) {
    menuText += `\n╭─『 ${categoria} 』\n`;
    logos.forEach(logo => {
      menuText += `│ ${logo.emoji} *${usedPrefix}${logo.cmd}*\n│    ${logo.desc}\n`;
    });
    menuText += `╰${'─'.repeat(25)}\n`;
  }

  menuText += `\n╔════════════════════════════╗
║ 📝 *Uso:* ${usedPrefix}comando texto
║ 💡 *Ejemplo:* ${usedPrefix}neon Rayo
║ 
║ 🎯 Total: ${totalGeneral} efectos
╚════════════════════════════╝`;

  await conn.reply(m.chat, menuText, m);
};

handler.help = ['menulogos', 'logosmenu', 'ml'];
handler.tags = ['menu'];
handler.command = ['menulogos', 'logosmenu', 'ml'];

export default handler;