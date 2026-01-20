let handler = async (m, { conn, usedPrefix }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
  let libreria = 'Baileys';
  let vs = '1.3';
  let userId = m.sender;
  
  let infoText = `╭─━━━━━━━━━━━━━━━─╮
│ 🎭 ¡Hola @${userId.split('@')[0]}! 💖
╰─━━━━━━━━━━━━━━━─╯

Me llamo『 𝕬𝖘𝖙𝖆-𝕭𝖔𝖙 』⚡

╭─═⊰ 📡 𝐄𝐒𝐓𝐀𝐃𝐎 𝐀𝐂𝐓𝐈𝐕𝐎
│ 🤖 Estado: ${(conn.user.jid == global.conn.user.jid ? '🟢 PREMIUM' : '🔗 prem-ʙᴏᴛ')}
│ 👥 Users: 『${totalreg.toLocaleString()}』🔥
│ 🛠️ Comandos: 『${totalCommands}』⚙️
│ 📅 Librería » ${libreria}
│ 🌍 Servidor: México 🇲🇽
│ 📡 Ping: Online ✅
│ 💾 Version: ${vs}
│ 🔒 Modo: ${(conn.user.jid == global.conn.user.jid ? '🔐 PRIVADO' : '🔓 PUBLICO')}
╰───────────────╯



*🤖 PON #code O #qr PARA HACERTE SUBBOT DEL ASTA-BOT-MD 📡*



┏━━━━━━━━━━━━━━┓
*💰 ECONOMY*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de *Economía* para ganar dinero.  

╰┈➤ 💼 *#w / #work / #trabajar*
        ╰┈➤ Ganar coins trabajando  
╰┈➤ 💃 *#slut / #prostituirse*
        ╰┈➤ Ganar coins prostituyéndote  
╰┈➤ 🎲 *#coinflip / #flip / #cf* + [cantidad] <cara/cruz>
        ╰┈➤ Apostar coins en cara o cruz  
╰┈➤ 🚨 *#crime / #crimen*
        ╰┈➤ Ganar coins rápido  
╰┈➤ 🎯 *#roulette / #rt* + [red/black] [cantidad]
        ╰┈➤ Apostar coins en la ruleta  
╰┈➤ 🎰 *#casino / #apostar / #slot* + [cantidad]
        ╰┈➤ Apostar coins en el casino  
╰┈➤ 🏦 *#balance / #bal / #bank* + <usuario>
        ╰┈➤ Ver cuantos coins tienes en el banco  
╰┈➤ 💳 *#deposit / #dep / #depositar / #d* + [cantidad] | all
        ╰┈➤ Depositar tus coins en el banco  
╰┈➤ 💸 *#withdraw / #with / #retirar* + [cantidad] | all
        ╰┈➤ Retirar tus coins del banco  
╰┈➤ 📊 *#economyinfo / #einfo*
        ╰┈➤ Ver tu información de economía  
╰┈➤ 🤝 *#givecoins / #pay / #coinsgive* + [usuario] [cantidad]
        ╰┈➤ Dar coins a un usuario  
╰┈➤ ⛏️ *#miming / #minar / #mine*
        ╰┈➤ Realizar trabajos de minería y ganar coins  
╰┈➤ 🎁 *#daily / #diario*
        ╰┈➤ Reclamar tu recompensa diaria  
╰┈➤ 🧰 *#cofre / #coffer*
        ╰┈➤ Reclamar tu cofre diario  
╰┈➤ 📅 *#weekly / #semanal*
        ╰┈➤ Reclamar tu recompensa semanal  
╰┈➤ 🗓️ *#monthly / #mensual*
        ╰┈➤ Reclamar tu recompensa mensual  
╰┈➤ 🕶️ *#steal / #robar / #rob* + [@mencion]
        ╰┈➤ Intentar robar coins a un usuario  
╰┈➤ 🏆 *#economyboard / #eboard / #baltop* + <pagina>
        ╰┈➤ Ver el ranking económico del grupo  
╰┈➤ ⚔️ *#aventura / #adventure*
        ╰┈➤ Aventuras para ganar coins y exp  
╰┈➤ ❤️ *#curar / #heal*
        ╰┈➤ Curar salud para salir de aventuras  
╰┈➤ 🦌 *#cazar / #hunt*
        ╰┈➤ Cazar animales para ganar coins y exp  
╰┈➤ 🎣 *#fish / #pescar*
        ╰┈➤ Ganar coins y exp pescando  
╰┈➤ 🏰 *#mazmorra / #dungeon*
        ╰┈➤ Explorar mazmorras para ganar coins y exp  
  


┏━━━━━━━━━━━━━━┓
*📥 DOWNLOAD*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de *Descargas* para obtener archivos de varias fuentes  

╰┈➤ 🎵 *#tiktok / #tt* + [Link] / [busqueda]
        ╰┈➤ Descargar un video de TikTok  
╰┈➤ 📱 #estados – Descarga estados de WhatsApp
        ╰┈➤ Descarga estados de whatsapp
╰┈➤ 📂 *#mediafire / #mf* + [Link]
        ╰┈➤ Descargar un archivo de MediaFire  
╰┈➤ 📂 *#mega / #mg* + [Link]
        ╰┈➤ Descargar un archivo de MEGA  
╰┈➤ 🎶 *#play / play2 / ytmp3 / ytmp4 / ytmp3doc / ytmp4doc + [Cancion] / [Link]
        ╰┈➤ Descargar una canción o vídeo de YouTube  
╰┈➤ 📘 *#facebook / #fb* + [Link]
        ╰┈➤ Descargar un video de Facebook  
╰┈➤ 🐦 *#twitter / #x* + [Link]
        ╰┈➤ Descargar un video de Twitter/X  
╰┈➤ 🔩 *#mods / #mod* + [nombre]
        ╰┈➤ Descargar un mods para minecraft 
╰┈➤ 📸 *#ig / #instagram* + [Link]
        ╰┈➤ Descargar un reel de Instagram  
╰┈➤ 📌 *#pinterest / #pin* + [busqueda] / [Link]
        ╰┈➤ Buscar y descargar imágenes de Pinterest  
╰┈➤ 🔍 *#image / #imagen* + [busqueda]
        ╰┈➤ Buscar y descargar imágenes de Google  
╰┈➤ 📱 *#apk / #modapk* + [busqueda]
        ╰┈➤ Descargar un APK de Aptoide  
╰┈➤ 🎥 *#ytsearch / #search* + [busqueda]
        ╰┈➤ Buscar videos de YouTube  



┏━━━━━━━━━━━━━━┓
*🎴 GACHA*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de *Gacha* para reclamar y coleccionar personajes  

╰┈➤ 🛒 *#buycharacter / #buychar / #buyc* + [nombre]
        ╰┈➤ Comprar un personaje en venta  
╰┈➤ 🖼️ *#charimage / #waifuimage / #cimage / #wimage* + [nombre]
        ╰┈➤ Ver una imagen aleatoria de un personaje  
╰┈➤ ℹ️ *#charinfo / #winfo / #waifuinfo* + [nombre]
        ╰┈➤ Ver información de un personaje  
╰┈➤ ✨ *#claim / #c / #reclamar* + {citar personaje}
        ╰┈➤ Reclamar un personaje  
╰┈➤ 📝 *#delclaimmsg*
        ╰┈➤ Restablecer el mensaje al reclamar un personaje  
╰┈➤ ❌ *#deletewaifu / #delwaifu / #delchar* + [nombre]
        ╰┈➤ Eliminar un personaje reclamado  
╰┈➤ ⭐ *#favoritetop / #favtop*
        ╰┈➤ Ver el top de personajes favoritos  
╰┈➤ 📊 *#gachainfo / #ginfo / #infogacha*
        ╰┈➤ Ver tu información de gacha  
╰┈➤ 🎁 *#giveallharem* + [@usuario]
        ╰┈➤ Regalar todos tus personajes a otro usuario  
╰┈➤ 🎁 *#givechar / #givewaifu / #regalar* + [@usuario] [nombre]
        ╰┈➤ Regalar un personaje a otro usuario  
╰┈➤ 🏴‍☠️ *#robwaifu / #robarwaifu* + [@usuario]
        ╰┈➤ Robar un personaje a otro usuario  
╰┈➤ 👥 *#harem / #waifus / #claims* + <@usuario>
        ╰┈➤ Ver tus personajes reclamados  
╰┈➤ 🏪 *#haremshop / #tiendawaifus / #wshop* + <pagina>
        ╰┈➤ Ver los personajes en venta  
╰┈➤ ❌ *#removesale / #removerventa* + [precio] [nombre]
        ╰┈➤ Eliminar un personaje en venta  
╰┈➤ 🎲 *#rollwaifu / #rw / #roll*
        ╰┈➤ Waifu o husbando aleatorio  
╰┈➤ 💰 *#sell / #vender* + [precio] [nombre]
        ╰┈➤ Poner un personaje a la venta  
╰┈➤ 📚 *#serieinfo / #ainfo / #animeinfo* + [nombre]
        ╰┈➤ Información de un anime  
╰┈➤ 📜 *#serielist / #slist / #animelist*
        ╰┈➤ Listar series del bot  
╰┈➤ ✏️ *#setclaimmsg / #setclaim* + [mensaje]
        ╰┈➤ Modificar el mensaje al reclamar un personaje  
╰┈➤ 🔄 *#trade / #intercambiar* + [Tu personaje] / [Personaje 2]
        ╰┈➤ Intercambiar un personaje con otro usuario  
╰┈➤ 🗳️ *#vote / #votar* + [nombre]
        ╰┈➤ Votar por un personaje para subir su valor  
╰┈➤ 🏆 *#waifusboard / #waifustop / #topwaifus / #wtop* + [número]
        ╰┈➤ Ver el top de personajes con mayor valor  



┏━━━━━━━━━━━━━━┓
*🔌 SOCKETS*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos para registrar tu propio Bot  

╰┈➤ 🔗 *#qr / #code*
        ╰┈➤ Crear un Sub-Bot con un código QR/Code  
╰┈➤ 🤖 *#bots / #botlist*
        ╰┈➤ Ver el número de bots activos  
╰┈➤ 📈 *#status / #estado*
        ╰┈➤ Ver el estado del bot  
╰┈➤ 🏓 *#p / #ping*
        ╰┈➤ Medir tiempo de respuesta  
╰┈➤ ➕ *#join* + [Invitación]
        ╰┈➤ Unir al bot a un grupo  
╰┈➤ ❌ *#leave / #salir*
        ╰┈➤ Salir de un grupo  
╰┈➤ 🔒 *#logout*
        ╰┈➤ Cerrar sesión del bot  
╰┈➤ 🖼️ *#setpfp / #setimage*
        ╰┈➤ Cambiar la imagen de perfil  
╰┈➤ 📝 *#setstatus* + [estado]
        ╰┈➤ Cambiar el estado del bot  
╰┈➤ 🆔 *#setusername* + [nombre]
        ╰┈➤ Cambiar el nombre de usuario  

┏━━━━━━━━━━━━━━┓
*🛠️ UTILITIES*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de *Utilidades*  

╰┈➤ 📋 *#help / #menu*
        ╰┈➤ Ver el menú de comandos  
╰┈➤ 📄 *#sc / #script*
        ╰┈➤ Link del repositorio oficial del Bot  
╰┈➤ 💡 *#sug / #suggest*
        ╰┈➤ Sugerir nuevas funciones al desarrollador  
╰┈➤ 🛠️ *#reporte / #reportar*
        ╰┈➤ Reportar fallas o problemas del bot  
╰┈➤ 🔢 *#calcular / #cal*
        ╰┈➤ Calcular tipos de ecuaciones  
╰┈➤ 📝 *#delmeta*
        ╰┈➤ Restablecer el pack y autor por defecto para tus stickers  
╰┈➤ 🖼️ *#getpic / #pfp* + [@usuario]
        ╰┈➤ Ver la foto de perfil de un usuario  
╰┈➤ 🗣️ *#say* + [texto]
        ╰┈➤ Repetir un mensaje  
╰┈➤ ✏️ *#setmeta* + [autor] | [pack]
        ╰┈➤ Establecer el pack y autor por defecto para tus stickers  
╰┈➤ 🎨 *#sticker / #s / #wm* + {citar una imagen/video}
        ╰┈➤ Convertir una imagen/video a sticker  
╰┈➤ 🖼️ *#toimg / #img* + {citar sticker}
        ╰┈➤ Convertir un sticker/imagen a imagen  
╰┈➤ 🖌️ *#brat / #bratv / #qc / #emojimix*
        ╰┈➤ Crear stickers con texto  
╰┈➤ 💻 *#gitclone* + [Link]
        ╰┈➤ Descargar un repositorio de Github  
╰┈➤ 🔧 *#enhance / #remini / #hd*
        ╰┈➤ Mejorar calidad de una imagen  
╰┈➤ 🔤 *#letra / #style*
        ╰┈➤ Cambiar la fuente de las letras  
╰┈➤ 👁️ *#read / #readviewonce*
        ╰┈➤ Ver imágenes viewonce  
╰┈➤ 🌐 *#ss / #ssweb*
        ╰┈➤ Ver el estado de una página web  
╰┈➤ 🌍 *#translate / #traducir / #trad*
        ╰┈➤ Traducir palabras a otros idiomas  
╰┈➤ 🤖 *#ia / #gemini*
        ╰┈➤ Preguntar a ChatGPT  
╰┈➤ 🔗 *#tourl / #catbox*
        ╰┈➤ Convertir imagen/video a URL  
╰┈➤ 📚 *#wiki / #wikipedia*
        ╰┈➤ Investigar temas a través de Wikipedia  
╰┈➤ 🎨 *#dalle / #flux*
        ╰┈➤ Crear imágenes con texto mediante IA  
╰┈➤ 📦 *#npmdl / #nmpjs*
        ╰┈➤ Descargar paquetes de NPMJS  
╰┈➤ 🔎 *#google*
        ╰┈➤ Realizar búsquedas por Google  


┏━━━━━━━━━━━━━━┓
*👤 PROFILES*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de *Perfil* para ver y configurar tu perfil  

╰┈➤ 🏆 *#leaderboard / #lboard / #top* + <pagina>
        ╰┈➤ Top de usuarios con más experiencia  
╰┈➤ 📊 *#level / #lvl* + <@Mencion>
        ╰┈➤ Ver tu nivel y experiencia actual  
╰┈➤ 💍 *#marry / #casarse* + <@Mencion>
        ╰┈➤ Casarte con alguien  
╰┈➤ 📝 *#profile* + <@Mencion>
        ╰┈➤ Ver tu perfil  
╰┈➤ 🎂 *#setbirth* + [fecha]
        ╰┈➤ Establecer tu fecha de cumpleaños  
╰┈➤ ✏️ *#setdescription / #setdesc* + [Descripcion]
        ╰┈➤ Establecer tu descripción  
╰┈➤ ⚧ *#setgenre* + Hombre | Mujer
        ╰┈➤ Establecer tu género  
╰┈➤ ❌ *#delgenre / #delgenero*
        ╰┈➤ Eliminar tu género  
╰┈➤ ❌ *#delbirth* + [fecha]
        ╰┈➤ Borrar tu fecha de cumpleaños  
╰┈➤ 💔 *#divorce*
        ╰┈➤ Divorciarte de tu pareja  
╰┈➤ ⭐ *#setfavourite / #setfav* + [Personaje]
        ╰┈➤ Establecer tu claim favorito  
╰┈➤ ❌ *#deldescription / #deldesc*
        ╰┈➤ Eliminar tu descripción  
╰┈➤ 💎 *#prem / #vip*
        ╰┈➤ Comprar membresía premium  


┏━━━━━━━━━━━━━━┓
*👥 GROUPS*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos para *Administradores* de grupos  

╰┈➤ 📢 *#tag / #hidetag / #invocar / #tagall* + [mensaje]
        ╰┈➤ Envía un mensaje mencionando a todos los usuarios del grupo  
╰┈➤ ⚠️ *#detect / #alertas* + [enable/disable]
        ╰┈➤ Activar/desactivar las alertas de promote/demote  
╰┈➤ 🔎 *#setting / #config* 
        ╰┈➤ activa y o desactiva y ve las opciones que estan activas o desactivadas y ve el menu de opciones
╰┈➤ 🔗 *#antilink / #antienlace* + [enable/disable]
        ╰┈➤ Activar/desactivar el antienlace  
╰┈➤ 🤖 *#bot* + [enable/disable]
        ╰┈➤ Activar/desactivar al bot  
╰┈➤ 🔒 *#close / #cerrar*
        ╰┈➤ Cerrar el grupo para que solo los administradores puedan enviar mensajes  
╰┈➤ ⬇️ *#demote* + <@usuario> | {mencion}
        ╰┈➤ Descender a un usuario de administrador  
╰┈➤ 💰 *#economy* + [enable/disable]
        ╰┈➤ Activar/desactivar los comandos de economía  
╰┈➤ 🎮 *#gacha* + [enable/disable]
        ╰┈➤ Activar/desactivar los comandos de Gacha y Games  
╰┈➤ 🎉 *#welcome / #bienvenida* + [enable/disable]
        ╰┈➤ Activar/desactivar la bienvenida y despedida  
╰┈➤ ✉️ *#setbye* + [texto]
        ╰┈➤ Establecer un mensaje de despedida personalizado  
╰┈➤ ⭐ *#setprimary* + [@bot]
        ╰┈➤ Establece un bot como primario del grupo  
╰┈➤ ✉️ *#setwelcome* + [texto]
        ╰┈➤ Establecer un mensaje de bienvenida personalizado  
╰┈➤ ❌ *#kick* + <@usuario> | {mencion}
        ╰┈➤ Expulsar a un usuario del grupo  
╰┈➤ 🔓 *#open / #abrir*
        ╰┈➤ Abrir el grupo para que todos los usuarios puedan enviar mensajes  
╰┈➤ ⬆️ *#promote* + <@usuario> | {mencion}
        ╰┈➤ Ascender a un usuario a administrador  
╰┈➤ ➕ *#add / #añadir / #agregar* + {número}
        ╰┈➤ Invitar a un usuario a tu grupo  
╰┈➤ 👑 *admins / admin* + [texto]
        ╰┈➤ Mencionar a los admins para solicitar ayuda  
╰┈➤ 🔄 *#restablecer / #revoke*
        ╰┈➤ Restablecer enlace del grupo  
╰┈➤ ⚠️ *#addwarn / #warn* + <@usuario> | {mencion}
        ╰┈➤ Advertir a un usuario  
╰┈➤ ❌ *#unwarn / #delwarn* + <@usuario> | {mencion}
        ╰┈➤ Quitar advertencias de un usuario  
╰┈➤ 📋 *#advlist / #listadv*
        ╰┈➤ Ver lista de usuarios advertidos  
╰┈➤ 💤 *#inactivos / #kickinactivos*
        ╰┈➤ Ver y eliminar a usuarios inactivos  
╰┈➤ 🚫 *#listnum / #kicknum* [texto]
        ╰┈➤ Eliminar usuarios con prefijo de país  
╰┈➤🚫  *#stopkicknum*
        ╰┈➤ parar el kicknum cuando nesesites
╰┈➤ 🖼️ *#gpbanner / #groupimg*
        ╰┈➤ Cambiar la imagen del grupo  
╰┈➤ ✏️ *#gpname / #groupname* [texto]
        ╰┈➤ Cambiar el nombre del grupo  
╰┈➤ 📝 *#gpdesc / #groupdesc* [texto]
        ╰┈➤ Cambiar la descripción del grupo  
╰┈➤ ❌ *#del / #delete* + {citar un mensaje}
        ╰┈➤ Eliminar un mensaje  
╰┈➤ 👥 *#linea / #listonline*
        ╰┈➤ Ver lista de usuarios en línea  
╰┈➤ ℹ️ *#gp / #infogrupo*
        ╰┈➤ Ver la información del grupo  
╰┈➤ 🔗 *#link*
        ╰┈➤ Ver enlace de invitación del grupo  



┏━━━━━━━━━━━━━━┓
*🎌 ANIME*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos de reacciones de anime  

╰┈➤ 😡 *#angry / #enojado* + <mencion>
        ╰┈➤ Estar enojado  
╰┈➤ 🛁 *#bath / #bañarse* + <mencion>
        ╰┈➤ Bañarse  
╰┈➤ 🐍 *#bite / #morder* + <mencion>
        ╰┈➤ Muerde a alguien  
╰┈➤ 😛 *#bleh / #lengua* + <mencion>
        ╰┈➤ Sacar la lengua  
╰┈➤ 😊 *#blush / #sonrojarse* + <mencion>
        ╰┈➤ Sonrojarte  
╰┈➤ 😒 *#bored / #aburrido* + <mencion>
        ╰┈➤ Estar aburrido  
╰┈➤ 👏 *#clap / #aplaudir* + <mencion>
        ╰┈➤ Aplaudir  
╰┈➤ ☕ *#coffee / #cafe / #café* + <mencion>
        ╰┈➤ Tomar café  
╰┈➤ 😢 *#cry / #llorar* + <mencion>
        ╰┈➤ Llorar por algo o alguien  
╰┈➤ 🤗 *#cuddle / #acurrucarse* + <mencion>
        ╰┈➤ Acurrucarse  
╰┈➤ 💃 *#dance / #bailar* + <mencion>
        ╰┈➤ Sacate los pasitos prohibidos  
╰┈➤ 🎭 *#dramatic / #drama* + <mencion>
        ╰┈➤ Drama  
╰┈➤ 🍺 *#drunk / #borracho* + <mencion>
        ╰┈➤ Estar borracho  
╰┈➤ 🍴 *#eat / #comer* + <mencion>
        ╰┈➤ Comer algo delicioso  
╰┈➤ 🤦 *#facepalm / #palmada* + <mencion>
        ╰┈➤ Darte una palmada en la cara  
╰┈➤ 😄 *#happy / #feliz* + <mencion>
        ╰┈➤ Salta de felicidad  
╰┈➤ 🤗 *#hug / #abrazar* + <mencion>
        ╰┈➤ Dar un abrazo  
╰┈➤ 🤰 *#impregnate / #preg / #preñar / #embarazar* + <mencion>
        ╰┈➤ Embarazar a alguien  
╰┈➤ 🔪 *#kill / #matar* + <mencion>
        ╰┈➤ Toma tu arma y mata a alguien  
╰┈➤ 😘 *#kiss / #muak* + <mencion>
        ╰┈➤ Dar un beso  
╰┈➤ 😚 *#kisscheek / #beso* + <mencion>
        ╰┈➤ Beso en la mejilla  
╰┈➤ 😂 *#laugh / #reirse* + <mencion>
        ╰┈➤ Reírte de algo o alguien  
╰┈➤ 👅 *#lick / #lamer* + <mencion>
        ╰┈➤ Lamer a alguien  
╰┈➤ ❤️ *#love / #amor / #enamorado / #enamorada* + <mencion>
        ╰┈➤ Sentirse enamorado  
╰┈➤ ✋ *#pat / #palmadita / #palmada* + <mencion>
        ╰┈➤ Acaricia a alguien  
╰┈➤ 👉 *#poke / #picar* + <mencion>
        ╰┈➤ Picar a alguien  
╰┈➤ 😗 *#pout / #pucheros* + <mencion>
        ╰┈➤ Hacer pucheros  
╰┈➤ 👊 *#punch / #pegar / #golpear* + <mencion>
        ╰┈➤ Dar un puñetazo  
╰┈➤ 🏃 *#run / #correr* + <mencion>
        ╰┈➤ Correr  
╰┈➤ 😔 *#sad / #triste* + <mencion>
        ╰┈➤ Expresar tristeza  
╰┈➤ 😱 *#scared / #asustado / #asustada* + <mencion>
        ╰┈➤ Estar asustado  
╰┈➤ 😏 *#seduce / #seducir* + <mencion>
        ╰┈➤ Seducir a alguien  
╰┈➤ 😳 *#shy / #timido / #timida* + <mencion>
        ╰┈➤ Sentir timidez  
╰┈➤ 👋 *#slap / #bofetada* + <mencion>
        ╰┈➤ Dar una bofetada  
╰┈➤ 💤 *#sleep / #dormir* + <mencion>
        ╰┈➤ Tumbarte a dormir  
╰┈➤ 🚬 *#smoke / #fumar* + <mencion>
        ╰┈➤ Fumar  
╰┈➤ 😤 *#spit / #escupir* + <mencion>
        ╰┈➤ Escupir  
╰┈➤ 👣 *#step / #pisar* + <mencion>
        ╰┈➤ Pisar a alguien  
╰┈➤ 🤔 *#think / #pensar* + <mencion>
        ╰┈➤ Pensar en algo  
╰┈➤ 🚶 *#walk / #caminar* + <mencion>
        ╰┈➤ Caminar  
╰┈➤ 😉 *#wink / #guiñar* + <mencion>
        ╰┈➤ Guiñar el ojo  
╰┈➤ 😳 *#cringe / #avergonzarse* + <mencion>
        ╰┈➤ Sentir vergüenza ajena  
╰┈➤ 😎 *#smug / #presumir* + <mencion>
        ╰┈➤ Presumir con estilo  
╰┈➤ 🙂 *#smile / #sonreir* + <mencion>
        ╰┈➤ Sonreír con ternura  
╰┈➤ ✋ *#highfive / #5* + <mencion>
        ╰┈➤ Chocar los cinco  
╰┈➤ 😈 *#bully / #bullying* + <mencion>
        ╰┈➤ Molestar a alguien  
╰┈➤ 🤝 *#handhold / #mano* + <mencion>
        ╰┈➤ Tomarse de la mano  
╰┈➤ 👋 *#wave / #ola / #hola* + <mencion>
        ╰┈➤ Saludar con la mano  
╰┈➤ 💞 *#waifu*
        ╰┈➤ Buscar una waifu aleatoria  
╰┈➤ 💑 *#ppcouple / #ppcp*
        ╰┈➤ Genera imágenes para amistades o parejas  



┏━━━━━━━━━━━━━━┓
*🔞 NSFW*  
┗━━━━━━━━━━━━━━┛
╰┈➤ ✿ Comandos NSFW  

╰┈➤ 🔞 *#danbooru / #dbooru* + [Tags]
        ╰┈➤ Buscar imágenes en Danbooru  
╰┈➤ 🔞 *#gelbooru / #gbooru* + [Tags]
        ╰┈➤ Buscar imágenes en Gelbooru  
╰┈➤ 🔞 *#rule34 / #r34* + [Tags]
        ╰┈➤ Buscar imágenes en Rule34  
╰┈➤ 🎥 *#xvideos / #xvideosdl* + [Link]
        ╰┈➤ Descargar un video de Xvideos  
╰┈➤ 🎥 *#xnxx / #xnxxdl* + [Link]
        ╰┈➤ Descargar un video de Xnxx  
╰┈➤ 💦 *#mamada*  
        ╰┈➤ manda un video de mamando `;

  let buttons = [
      { buttonId: usedPrefix + 'code', buttonText: { displayText: '🤖 Sup-Bot' }, type: 1 }
  ];
  
  // URL de la imagen o video (cambia por tu propia URL)
  let mediaUrl = 'https://github.com/Fer280809/Asta_bot/blob/main/lib/catalogo.jpg'; // Cambia esto por tu imagen
  // let mediaUrl = 'https://example.com/video.mp4'; // O usa un video
  
  try {
    // Intenta enviar con imagen
    await conn.sendMessage(m.chat, {
      image: { url: mediaUrl },
      caption: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 4,
      mentions: [userId]
    }, { quoted: m });
  } catch {
    // Si falla, envía sin imagen (método alternativo)
    let buttonMessage = {
      text: infoText,
      footer: "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡",
      buttons: buttons,
      headerType: 1,
      mentions: [userId]
    };
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
  }
};

handler.help = ['menu2'];
handler.tags = ['main'];
handler.command = ['menú2', 'menu2', 'help2'];

export default handler;