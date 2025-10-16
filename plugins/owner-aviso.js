// Plugin para sistema de informes - Solo owners
const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  
  // Estilos disponibles para los informes
  const estilos = {
    1: (titulo, contenido, att, subtitulo = "Información Importante") => `★彡 𝙄𝙣𝙛𝙤𝙧𝙢𝙚𝙨 彡★

🎯 ${titulo}
📋 ${subtitulo}

${contenido}

> Si tienes alguna duda manda mensaje al wa.me/524181450063

Gracias Por estar apoyando el bot Asta
ATT: ${att}`,

    2: (titulo, contenido, att, subtitulo = "Notificación Oficial") => `╔═══════════════════╗
║    🔔 ${titulo.toUpperCase()} 🔔    ║
╚═══════════════════╝

📌 ${subtitulo}
📝 ${contenido}

💬 Dudas: wa.me/524181450063
⚡ Gracias por apoyar el bot Asta

📋 ATT: ${att}`,

    3: (titulo, contenido, att, subtitulo = "Comunicado Oficial") => `⟨⟨ 💫 ＩＮＦＯＲＭＥ ＯＦＩＣＩＡＬ 💫 ⟩⟩

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

🎯 ${titulo}
📢 ${subtitulo}

${contenido}

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

📞 wa.me/524181450063
🤖 Bot Asta - Siempre contigo

✍️ ${att}`,

    4: (titulo, contenido, att, subtitulo = "Aviso Especial") => `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃   🌸 ＮＯＴＩＦＩＣＡＣＩÓＮ 🌸   ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

╭─「 ${titulo} 」─⋆⋅☆
│ ✨ ${subtitulo}
│
│ ${contenido}
│
╰─────────────────⋆⋅☆

💭 wa.me/524181450063

🎀 Gracias por el apoyo - Bot Asta
📝 Firma: ${att}`,

    5: (titulo, contenido, att, subtitulo = "Anuncio Importante") => `『 ✦ ＡＶＩＳＯ ＩＭＰＯＲＴＡＮＴＥ ✦ 』

━━━━━━━━━━━━━━━━━━━━━━

🔥 ${titulo.toUpperCase()}
⚡ ${subtitulo}

${contenido}

━━━━━━━━━━━━━━━━━━━━━━

📲 Contacto: wa.me/524181450063
⚡ Bot Asta al servicio

👑 Por: ${att}`,

    6: (titulo, contenido, att, subtitulo = "Mensaje del Staff") => `▄▀█ █░█ █ █▀ █▀█
█▄█ ▀▄▀ █ ▄█ █▄█

╔════════════════════════╗
║     📢 ${titulo}     ║
╚════════════════════════╝

🎯 ${subtitulo}
💬 ${contenido}

❓ Dudas: wa.me/524181450063
🚀 Powered by Bot Asta

📌 ${att}`,

    7: (titulo, contenido, att, subtitulo = "Boletín Informativo") => `╭─────────────────────────╮
│  ⚡ ＢＯＬＥＴÍＮ ＯＦＩＣＩＡＬ ⚡  │
╰─────────────────────────╯

🎯 ${titulo.toUpperCase()}
📋 ${subtitulo}

┌ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ┐

${contenido}

└ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ◦ ┘

📱 wa.me/524181450063
🤖 Bot Asta - Tu compañero digital

⭐ Autor: ${att}`,

    8: (titulo, contenido, att, subtitulo = "Celebración Especial") => `🌟═══════════════════════🌟
   ╔╦╗ Ａ Ｓ Ｔ Ａ   Ｂ Ｏ Ｔ ╔╦╗
🌟═══════════════════════🌟

🎪 ${titulo}
🎊 ${subtitulo}

╔══════════════════════════╗
║  ${contenido}
╚══════════════════════════╝

☎️ wa.me/524181450063
🎈 ¡Siempre aquí para ti!

🎭 Creado por: ${att}`,

    9: (titulo, contenido, att, subtitulo = "Documento Oficial") => `⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘

   ❮❮ 💠 ＣＯＭＵＮＩＣＡＤＯ 💠 ❯❯

⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘ ⌘

🔰 TEMA: ${titulo}
📄 TIPO: ${subtitulo}

◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈

📋 INFORMACIÓN:
${contenido}

◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈◈

📞 SOPORTE: wa.me/524181450063
🔵 Bot Asta - Tecnología al servicio

🖋️ FIRMADO: ${att}`,

    10: (titulo, contenido, att, subtitulo = "Mensaje Nocturno") => `🌙═════════════════════════🌙
      ★ ＭＥＮＳＡＪＥ ＯＦＩＣＩＡＬ ★
🌙═════════════════════════🌙

◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤

🎯 ${titulo.toUpperCase()}
🌟 ${subtitulo}

${contenido}

◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤

📮 wa.me/524181450063
🌟 Bot Asta - Innovación constante

🌙 ${att} 🌙`,

    11: (titulo, contenido, att, subtitulo = "Creación Artística") => `╔═══❖◈◈◈❖═══╗
║  🎨 ＡＮＵＮＣＩＯ ＥＳＰＥＣＩＡＬ 🎨  ║
╚═══❖◈◈◈❖═══╝

≫─────────≪ ${titulo} ≫─────────≪
🎭 ${subtitulo}

💫 ${contenido}

≫─────────────────────────────≪

📞 wa.me/524181450063
✨ Bot Asta - Magia digital

🎯 Arte por: ${att}`,

    12: (titulo, contenido, att, subtitulo = "Estilo Ciberpunk") => `▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
███ 🤖 ＣＹＢＥＲ ＡＬＥＲＴ 🤖 ███
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

⚡ TÍTULO: ${titulo.toUpperCase()}
🔮 CATEGORÍA: ${subtitulo}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
> ${contenido}
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

📡 CONTACTO: wa.me/524181450063
🔋 Bot Asta - Neural Network

◉ SISTEMA: ${att} ◉`,

    13: (titulo, contenido, att, subtitulo = "Estilo Minimalista") => `━━━━━━━━━━━━━━━━━━━━

   ${titulo}

━━━━━━━━━━━━━━━━━━━━

${subtitulo}

${contenido}

━━━━━━━━━━━━━━━━━━━━

📞 wa.me/524181450063
Bot Asta

— ${att}`,

    14: (titulo, contenido, att, subtitulo = "Estilo Vintage") => `❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦

  ⚜️ ＰＲＯＣＬＡＭＡＣＩÓＮ ＲＥＡＬ ⚜️

❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦

🌿 Por la presente se hace saber:
📜 ${titulo}
🍀 Naturaleza: ${subtitulo}

Que se proclama lo siguiente:
${contenido}

❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦❦

📞 Mensajería Real: wa.me/524181450063
👑 Casa Real de Bot Asta

⚜️ Sellado por: ${att} ⚜️`,

    15: (titulo, contenido, att, subtitulo = "Estilo Galáctico") => `🌌════════════════════════🌌
     ⭐ ＴＲＡＮＳＭＩＳＩÓＮ ＧＡＬÁＣＴＩＣＡ ⭐
🌌════════════════════════🌌

🚀 ORIGEN: ${titulo}
🛸 FRECUENCIA: ${subtitulo}

▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️

🌟 MENSAJE DECODIFICADO:
${contenido}

▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️

📡 ENLACE SUBSPACIAL: wa.me/524181450063
🛰️ Estación Bot Asta - Sector 7

👽 Comandante: ${att}`,

    16: (titulo, contenido, att, subtitulo = "Estilo Matrix") => `█████████████████████████████
█ ＭＡＴＲＩＸ  ＭＥＳＳＡＧＥ █
█████████████████████████████

⚡ CÓDIGO DE ACCESO: ${titulo}
💊 NIVEL: ${subtitulo}

█████████████████████████████

01001000 INFORMACIÓN DESENCRIPTADA:
${contenido}

█████████████████████████████

📱 RED LIBERADA: wa.me/524181450063
🔓 Morfeo Bot Asta - Zion

⚡ Neo: ${att}`,

    17: (titulo, contenido, att, subtitulo = "Estilo Samurai") => `⚔️═══════════════════════⚔️
   🏯 ＥＤＩＣＴＯ  ＳＡＭＵＲÁＩ 🏯
⚔️═══════════════════════⚔️

⛩️ HONOR: ${titulo}
🎌 CLAN: ${subtitulo}

═══════════════════════════════

🗡️ Por el honor del clan se declara:

${contenido}

═══════════════════════════════

📞 Paloma mensajera: wa.me/524181450063
🏯 Dojo Bot Asta - Bushido

⚔️ Sensei: ${att}`,

    18: (titulo, contenido, att, subtitulo = "Estilo Neón") => `▄██▄██▄██▄██▄██▄██▄██▄██▄
█ 🌈 ＮＥＯＮ  ＦＬＡＳＨ 🌈 █
▄██▄██▄██▄██▄██▄██▄██▄██▄

💫 EVENTO: ${titulo}
🎪 VIBRA: ${subtitulo}

██████████████████████████████

⚡ MENSAJE BRILLANTE:
${contenido}

██████████████████████████████

📞 LÍNEA DIRECTA: wa.me/524181450063
🌈 Bot Asta - Luces de la ciudad

✨ DJ: ${att}`,

    19: (titulo, contenido, att, subtitulo = "Estilo Pirata") => `🏴‍☠️═══════════════════════🏴‍☠️
    ⚓ ＢＡＮＤＥＲＡ  ＮＥＧＲＡ ⚓
🏴‍☠️═══════════════════════🏴‍☠️

🗡️ TESORO: ${titulo}
🦜 MISIÓN: ${subtitulo}

🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊

⚔️ ¡Atención marineros!

${contenido}

🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊

📞 Botella al mar: wa.me/524181450063
🏴‍☠️ Barco Bot Asta - Corsarios digitales

⚓ Capitán: ${att}`,

    20: (titulo, contenido, att, subtitulo = "Estilo Rockero") => `🎸▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓🎸
   🤘 ＲＯＣＫ  ＡＮＮＯＵＮＣＥ 🤘
🎸▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓🎸

🔥 CANCIÓN: ${titulo}
🎵 GÉNERO: ${subtitulo}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

🎤 LETRA DEL DÍA:
${contenido}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

📞 BACKSTAGE: wa.me/524181450063
🎸 Bot Asta - Rock & Roll

🤘 Rockstar: ${att}`,

    21: (titulo, contenido, att, subtitulo = "Estilo Kawaii") => `🌸✧･ﾟ: *✧･ﾟ:*🌸✧･ﾟ: *✧･ﾟ:*🌸

      (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ KAWAII ✧ﾟ･: *

🌸✧･ﾟ: *✧･ﾟ:*🌸✧･ﾟ: *✧･ﾟ:*🌸

🎀 Título: ${titulo} (◕‿◕)♡
🍭 Tipo: ${subtitulo} ✧*｡

◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉

(´∀｀)♡ Mensaje súper kawaii:
${contenido}

◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉◉

📞 Teléfono mágico: wa.me/524181450063
🌈 Bot Asta-chan (◡ ‿ ◡)

✧*｡Creado por: ${att} ヽ(°〇°)ﾉ`,

    22: (titulo, contenido, att, subtitulo = "Estilo Militar") => `■■■■■■■■■■■■■■■■■■■■■■■■■■
███ 🎖️ ＯＰＥＲＡＣＩÓＮ ＡＬＦＡ 🎖️ ███
■■■■■■■■■■■■■■■■■■■■■■■■■■

🎯 OBJETIVO: ${titulo}
⚡ NIVEL: ${subtitulo}

■■■■■■■■■■■■■■■■■■■■■■■■■■

📋 BRIEFING OPERACIONAL:
${contenido}

■■■■■■■■■■■■■■■■■■■■■■■■■■

📞 LÍNEA SEGURA: wa.me/524181450063
🏴 Cuartel Bot Asta - Delta Force

🎖️ Comandante: ${att}`,

    23: (titulo, contenido, att, subtitulo = "Estilo Espacial") => `🚀･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧🚀
    ⭐ ＭＩＳＩÓＮ  ＥＳＰＡＣＩＡＬ ⭐
🚀･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧🚀

🛸 DESTINO: ${titulo}
🌌 COORDENADAS: ${subtitulo}

⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫

🌟 LOG DE MISIÓN:
${contenido}

⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫

📞 BASE TERRA: wa.me/524181450063
🛰️ Bot Asta - Estación espacial

🚀 Astronauta: ${att}`,

    24: (titulo, contenido, att, subtitulo = "Estilo Medieval") => `🏰═══════════════════════🏰
   ⚔️ ＰＲＯＣＬＡＭＡ  ＲＥＡＬ ⚔️
🏰═══════════════════════🏰

🛡️ DECRETO: ${titulo}
👑 REINO: ${subtitulo}

═══════════════════════════════

📜 Por orden de Su Majestad:

${contenido}

═══════════════════════════════

📞 Mensajero real: wa.me/524181450063
🏰 Castillo Bot Asta - Reino digital

⚔️ Caballero: ${att}`,

    25: (titulo, contenido, att, subtitulo = "Estilo Cyberpunk Avanzado") => `▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄
█▓▒░ ＧＨＯＳＴ ＩＮ ＳＨＥＬＬ ░▒▓█
▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄

🔥 HACK: ${titulo}
💀 ICE: ${subtitulo}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

🖥️ DATOS EXTRAÍDOS:
${contenido}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

📞 TERMINAL: wa.me/524181450063
⚡ Bot Asta - Sistema neural

🦾 Hacker: ${att}`,

    26: (titulo, contenido, att, subtitulo = "Estilo Tropical") => `🌺🌴🌺🌴🌺🌴🌺🌴🌺🌴🌺🌴🌺

     🏖️ ＰＡＲＡÍＳＯ ＤＩＧＩＴＡＬ 🏖️

🌺🌴🌺🌴🌺🌴🌺🌴🌺🌴🌺🌴🌺

🥥 EVENTO: ${titulo}
🌊 AMBIENTE: ${subtitulo}

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

🐚 Mensaje desde la playa:
${contenido}

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

📞 Cabina playera: wa.me/524181450063
🌴 Bot Asta - Resort digital

🏄‍♂️ Lifeguard: ${att}`,

    27: (titulo, contenido, att, subtitulo = "Estilo Horror") => `🕷️💀🕷️💀🕷️💀🕷️💀🕷️💀🕷️💀🕷️

   👻 ＴＲＡＮＳＭＩＳＩÓＮ ＭＡＬＤＩＴＡ 👻

🕷️💀🕷️💀🕷️💀🕷️💀🕷️💀🕷️💀🕷️

💀 VÍCTIMA: ${titulo}
🧙‍♀️ HECHIZO: ${subtitulo}

█████████████████████████████

🔮 MENSAJE DESDE EL MÁS ALLÁ:
${contenido}

█████████████████████████████

📞 OUIJA DIGITAL: wa.me/524181450063
🏚️ Bot Asta - Mansión embrujada

👻 Fantasma: ${att}`,

    28: (titulo, contenido, att, subtitulo = "Estilo Steampunk") => `⚙️▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓⚙️
  🎩 ＥＮＧＩＮＥ ＡＮＮＯＵＮＣＥＭＥＮＴ 🎩
⚙️▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓⚙️

🔧 INVENCIÓN: ${titulo}
⚙️ MECANISMO: ${subtitulo}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

🎯 COMUNICADO MECÁNICO:
${contenido}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

📞 TELÉGRAFO: wa.me/524181450063
🎩 Laboratorio Bot Asta - Era victoriana

⚙️ Inventor: ${att}`,

    29: (titulo, contenido, att, subtitulo = "Estilo Nórdico") => `❄️══════════════════════❄️
   🔨 ＭＥＮＳＡＪＥ ＤＥ ＡＳＧＡＲＤ 🔨
❄️══════════════════════❄️

⚡ PROFECÍA: ${titulo}
🌪️ VIENTO: ${subtitulo}

════════════════════════════

🐺 Mensaje de los antiguos dioses:
${contenido}

════════════════════════════

📞 Cuerno de guerra: wa.me/524181450063
🏔️ Bot Asta - Valhalla digital

⚡ Vikingo: ${att}`,

    30: (titulo, contenido, att, subtitulo = "Estilo Arcade") => `🕹️▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄🕹️
█ ⚡ ＧＡＭＥ  ＯＶＥＲ  ＡＬＥＲＴ ⚡ █
🕹️▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄🕹️

🎮 NIVEL: ${titulo}
🏆 SCORE: ${subtitulo}

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

🚀 MENSAJE DESBLOQUEADO:
${contenido}

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

📞 CHEAT CODE: wa.me/524181450063
🕹️ Bot Asta - Arcade hall

🎮 Player: ${att}`,

    31: (titulo, contenido, att, subtitulo = "Estilo Místico") => `🔮✨🌙✨🔮✨🌙✨🔮✨🌙✨🔮

     ⭐ ＯＲÁＣＵＬＯ ＣÓＳＭＩＣＯ ⭐

🔮✨🌙✨🔮✨🌙✨🔮✨🌙✨🔮

🌟 VISIÓN: ${titulo}
🔮 AURA: ${subtitulo}

◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇

🌙 Mensaje de las estrellas:
${contenido}

◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇◇

📞 Cristal de comunicación: wa.me/524181450063
🔮 Bot Asta - Templo sagrado

✨ Oráculo: ${att}`
  };

  // Función para formatear el mensaje con el estilo seleccionado
  const formatMessage = (estilo, titulo, contenido, att = "𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔", subtitulo = "") => {
    const estiloSeleccionado = estilos[estilo] || estilos[1];
    return estiloSeleccionado(titulo, contenido, att, subtitulo);
  };

  // Función para procesar el comando
  const procesarComando = (comando) => {
    try {
      // Remover "informes" del inicio
      comando = comando.replace(/^informes\s*/i, "").trim();
      
      // Verificar si especifica estilo (ejemplo: estilo2 o e2)
      let estilo = 1; // Estilo por defecto
      const estiloMatch = comando.match(/^(?:estilo|e)(\d+)\s+/i);
      if (estiloMatch) {
        estilo = parseInt(estiloMatch[1]);
        if (estilo < 1 || estilo > 31) estilo = 1;
        comando = comando.replace(/^(?:estilo|e)\d+\s+/i, "").trim();
      }
      
      // Extraer partes usando paréntesis
      const partes = [];
      let nivel = 0;
      let parteActual = "";
      
      for (const char of comando) {
        if (char === '(') {
          if (nivel > 0) {
            parteActual += char;
          }
          nivel++;
        } else if (char === ')') {
          nivel--;
          if (nivel === 0) {
            partes.push(parteActual.trim());
            parteActual = "";
          } else {
            parteActual += char;
          }
        } else {
          if (nivel > 0) {
            parteActual += char;
          }
        }
      }
      
      if (partes.length >= 2) {
        const titulo = partes[0];
        const contenido = partes[1];
        const att = partes[2] ? partes[2].replace(/^att:\s*/i, "").trim() : "𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔";
        const subtitulo = partes[3] ? partes[3].replace(/^sub:\s*/i, "").trim() : "";
        
        return { titulo, contenido, att, subtitulo, estilo, success: true };
      } else {
        return { success: false, error: "Formato incorrecto" };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // ID del canal de WhatsApp
  const channelId = "120363399175402285@newsletter";
  
  // Verificar si hay texto
  if (!text) {
    return conn.reply(m.chat, `❌ *Uso incorrecto*

📝 *Formato:*
${usedPrefix + command} [estilo] (titulo)(contenido)(att:nombre)(sub:subtitulo)

🎨 *Estilos disponibles (1-31):*
• estilo1 - Clásico con estrellas ⭐
• estilo2 - Marco elegante 🔲
• estilo3 - Oficial con líneas ▰
• estilo4 - Floral decorativo 🌸
• estilo5 - Fuego y energía 🔥
• estilo6 - ASCII moderno 📢
• estilo7 - Boletín profesional ⚡
• estilo8 - Festivo colorido 🌟
• estilo9 - Comunicado formal 💠
• estilo10 - Nocturno elegante 🌙
• estilo11 - Artístico especial 🎨
• estilo12 - Ciberpunk 🤖
• estilo13 - Minimalista ━
• estilo14 - Vintage ⚜️
• estilo15 - Galáctico 🌌
• estilo16 - Matrix █
• estilo17 - Samurai ⚔️
• estilo18 - Neón 🌈
• estilo19 - Pirata 🏴‍☠️
• estilo20 - Rockero 🎸
• estilo21 - Kawaii 🌸
• estilo22 - Militar 🎖️
• estilo23 - Espacial 🚀
• estilo24 - Medieval 🏰
• estilo25 - Cyberpunk Avanzado 💀
• estilo26 - Tropical 🌴
• estilo27 - Horror 👻
• estilo28 - Steampunk ⚙️
• estilo29 - Nórdico ❄️
• estilo30 - Arcade 🕹️
• estilo31 - Místico 🔮

📋 *Ejemplos:*
${usedPrefix + command} (Mantenimiento)(El bot estará offline 2 horas)(att:Admin)
${usedPrefix + command} estilo15 (Evento Galáctico)(Nueva misión espacial disponible)(att:Fernando)(sub:Aventura Cósmica)
${usedPrefix + command} e31 (Predicción)(Las estrellas revelan secretos)(att:Oráculo)(sub:Sabiduría Ancestral)

⚠️ *Nota:* Solo los owners pueden usar este comando.
📌 *Subtítulo opcional:* Agrega (sub:texto) al final para personalizar`, m);
  }

  // Procesar el comando
  const resultado = procesarComando(text);
  
  if (!resultado.success) {
    return conn.reply(m.chat, `❌ *Error en el formato*

${resultado.error}

📝 *Formato correcto:*
${usedPrefix + command} [estilo] (titulo)(contenido)(att:nombre)(sub:subtitulo)

🎨 *Estilos disponibles (1-31):*
1️⃣ Clásico ⭐ | 2️⃣ Elegante 🔲 | 3️⃣ Oficial ▰ | 4️⃣ Floral 🌸
5️⃣ Fuego 🔥 | 6️⃣ ASCII 📢 | 7️⃣ Boletín ⚡ | 8️⃣ Festivo 🌟
9️⃣ Formal 💠 | 🔟 Nocturno 🌙 | 1️⃣1️⃣ Artístico 🎨 | 1️⃣2️⃣ Ciberpunk 🤖
1️⃣3️⃣ Minimalista ━ | 1️⃣4️⃣ Vintage ⚜️ | 1️⃣5️⃣ Galáctico 🌌 | 1️⃣6️⃣ Matrix █
1️⃣7️⃣ Samurai ⚔️ | 1️⃣8️⃣ Neón 🌈 | 1️⃣9️⃣ Pirata 🏴‍☠️ | 2️⃣0️⃣ Rockero 🎸
2️⃣1️⃣ Kawaii 🌸 | 2️⃣2️⃣ Militar 🎖️ | 2️⃣3️⃣ Espacial 🚀 | 2️⃣4️⃣ Medieval 🏰
2️⃣5️⃣ Cyberpunk+ 💀 | 2️⃣6️⃣ Tropical 🌴 | 2️⃣7️⃣ Horror 👻 | 2️⃣8️⃣ Steampunk ⚙️
2️⃣9️⃣ Nórdico ❄️ | 3️⃣0️⃣ Arcade 🕹️ | 3️⃣1️⃣ Místico 🔮

📋 *Ejemplos:*
${usedPrefix + command} (Aviso)(Mensaje importante)(att:Admin)
${usedPrefix + command} estilo25 (Hack Alert)(Sistema comprometido)(att:Ghost)(sub:Nivel ICE-9)`, m);
  }

  // Formatear el mensaje con el estilo seleccionado
  const mensajeFormateado = formatMessage(resultado.estilo, resultado.titulo, resultado.contenido, resultado.att, resultado.subtitulo);

  try {
    // Enviar al canal
    await conn.sendMessage(channelId, { text: mensajeFormateado });
    
    // Confirmar al usuario
    await conn.reply(m.chat, `✅ *Informe enviado exitosamente*

📢 *Canal:* WhatsApp Newsletter
🎨 *Estilo:* ${resultado.estilo} 
🎯 *Título:* ${resultado.titulo}
${resultado.subtitulo ? `📌 *Subtítulo:* ${resultado.subtitulo}\n` : ""}👤 *Firmado por:* ${resultado.att}

*El mensaje ha sido publicado en el canal oficial.*`, m);

  } catch (error) {
    console.error('Error al enviar al canal:', error);
    
    // Mostrar el mensaje formateado al usuario como respaldo
    await conn.reply(m.chat, `⚠️ *Error al enviar al canal*

Sin embargo, aquí está el mensaje formateado:

${mensajeFormateado}

*Intenta enviarlo manualmente o contacta al administrador.*`, m);
  }
};

// Configuración del comando
handler.command = ['informes', 'informe', 'aviso'];
handler.rowner = true; // Solo owners pueden usar este comando
handler.help = ['informes [estilo] (titulo)(contenido)(att:nombre)(sub:subtitulo)'];
export default handler;
