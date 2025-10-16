const estilosLogos = [
  { cmd: "glitchtext",      emoji: "🟣" },
  { cmd: "narutotext",     emoji: "🍥" },
  { cmd: "dragonball",     emoji: "🟠" },
  { cmd: "neonlight",      emoji: "💡" },
  { cmd: "pubglogo",       emoji: "🔫" },
  { cmd: "harrypotter",    emoji: "⚡" },
  { cmd: "marvel",         emoji: "🦸" },
  { cmd: "pixelglitch",    emoji: "🔳" },
  { cmd: "amongustext",    emoji: "👾" },
  { cmd: "writetext",      emoji: "✍️" },
  { cmd: "advancedglow",   emoji: "🌟" },
  { cmd: "typographytext", emoji: "📝" },
  { cmd: "neonglitch",     emoji: "🌈" },
  { cmd: "flagtext",       emoji: "🏳️" },
  { cmd: "flag3dtext",     emoji: "🏁" },
  { cmd: "deletingtext",   emoji: "❌" },
  { cmd: "blackpinkstyle", emoji: "💖" },
  { cmd: "glowingtext",    emoji: "✨" },
  { cmd: "underwatertext", emoji: "🌊" },
  { cmd: "logomaker",      emoji: "🖌️" },
  { cmd: "cartoonstyle",   emoji: "🎨" },
  { cmd: "papercutstyle",  emoji: "✂️" },
  { cmd: "watercolortext", emoji: "🖍️" },
  { cmd: "effectclouds",   emoji: "☁️" },
  { cmd: "blackpinklogo",  emoji: "🌸" },
  { cmd: "gradienttext",   emoji: "🌀" },
  { cmd: "summerbeach",    emoji: "🏖️" },
  { cmd: "luxurygold",     emoji: "🥇" },
  { cmd: "multicoloredneon", emoji: "💫" },
  { cmd: "sandsummer",     emoji: "🏝️" },
  { cmd: "galaxywallpaper", emoji: "🪐" },
  { cmd: "style",          emoji: "💠" },
  { cmd: "makingneon",     emoji: "🔆" },
  { cmd: "royaltext",      emoji: "👑" },
  { cmd: "freecreate",     emoji: "🆓" },
  { cmd: "galaxystyle",    emoji: "🌌" },
  { cmd: "rainytext",      emoji: "🌧️" },
  { cmd: "graffititext",   emoji: "🖍️" },
  { cmd: "colorfulltext",  emoji: "🌈" },
  { cmd: "equalizertext",  emoji: "🎚️" },
  { cmd: "angeltxt",       emoji: "👼" },
  { cmd: "starlight",      emoji: "🌟" },
  { cmd: "steel",          emoji: "🔩" },
  { cmd: "neoncity",       emoji: "🌃" },
  { cmd: "cloudsky",       emoji: "☁️" },
  { cmd: "matrix",         emoji: "🟩" },
  { cmd: "minion",         emoji: "💛" },
  { cmd: "papercut3d",     emoji: "📐" },
  { cmd: "firetext",       emoji: "🔥" },
  { cmd: "icecold",        emoji: "🧊" },
  { cmd: "rainbowtext",    emoji: "🌈" }
];

const handler = async (m, { conn, usedPrefix }) => {
  let menuText = `*┏━━⊱  MENÚ DE LOGOS Y ESTILOS  ⊰━━┓*\n\n`;

  menuText += estilosLogos.map(e => `${e.emoji} *${usedPrefix}${e.cmd}*`).join('\n');
  menuText += `\n\n*┗━━⊱ Usa así:* _${usedPrefix}comando tu texto_\nPor ejemplo: *${usedPrefix}glitchtext Rayo-ofc*`;

  await conn.reply(m.chat, menuText, m);
};

handler.help = ['menulogos'];
handler.tags = ['menu'];
handler.command = ['menulogos', 'logosmenu', 'logostylemenu', 'ml'];

export default handler;