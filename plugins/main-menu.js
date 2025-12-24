let handler = async (m, { conn, usedPrefix }) => {
    // Imagen del bot desde settings.js
    let menuImage = global.icono || "https://files.catbox.moe/nqvhaq.jpg";
    
    let txt = `🎮 *${global.botname || 'Asta-Bot'}-MENÚ* 🎮
╔════════════════════════╗
      💼 *ECONOMY*
╚════════════════════════╝

┌─🔸 *${usedPrefix}work*
│  ╰─ Ganar coins trabajando
├─🔸 *${usedPrefix}slut*
│  ╰─ Ganar coins prostituyéndote
├─🔸 *${usedPrefix}crime*
│  ╰─ Ganar coins rápido (crimen)
├─🔸 *${usedPrefix}miming*
│  ╰─ Ganar coins minando
├─🔸 *${usedPrefix}aventura*
│  ╰─ Aventuras para ganar coins y EXP
├─🔸 *${usedPrefix}cazar*
│  ╰─ Cazar animales por recompensas
├─🔸 *${usedPrefix}fish*
│  ╰─ Pescar para ganar coins
├─🔸 *${usedPrefix}mazmorra*
│  ╰─ Explorar mazmorras
├─🔸 *${usedPrefix}daily*
│  ╰─ Recompensa diaria
├─🔸 *${usedPrefix}weekly*
│  ╰─ Recompensa semanal
├─🔸 *${usedPrefix}monthly*
│  ╰─ Recompensa mensual
├─🔸 *${usedPrefix}cofre*
│  ╰─ Reclamar cofre diario
├─🔹 *${usedPrefix}balance* [@usuario]
│  ╰─ Ver saldo de coins
├─🔹 *${usedPrefix}deposit* [cantidad|all]
│  ╰─ Depositar en el banco
├─🔹 *${usedPrefix}withdraw* [cantidad|all]
│  ╰─ Retirar del banco
├─🔹 *${usedPrefix}economyinfo*
│  ╰─ Tu información económica
├─🔹 *${usedPrefix}givecoins* [@usuario] [cantidad]
│  ╰─ Dar coins a otro usuario
├─🔸 *${usedPrefix}coinflip* [cantidad] [cara/cruz]
│  ╰─ Apostar en cara o cruz
├─🔸 *${usedPrefix}roulette* [red/black] [cantidad]
│  ╰─ Apostar en la ruleta
├─🔸 *${usedPrefix}casino* [cantidad]
│  ╰─ Jugar en el casino
├─🔸 *${usedPrefix}steal* [@usuario]
│  ╰─ Intentar robar coins
├─🔹 *${usedPrefix}curar*
│  ╰─ Curar salud para aventuras
├─🔹 *${usedPrefix}heal*
│  ╰─ Curar salud (alternativo)
├─🔸 *${usedPrefix}economyboard* [página]
│  ╰─ Ranking económico del grupo
└─🔸 *${usedPrefix}baltop* [página]
   ╰─ Ranking económico (alternativo)
   
╔════════════════════════╗
     ⬇️ *DOWNLOAD*
╚════════════════════════╝

┌─🔸 *${usedPrefix}play* [canción]
│  ╰─ Buscar y reproducir música
├─🔸 *${usedPrefix}ytmp3* [link]
│  ╰─ Descargar audio de YouTube
├─🔸 *${usedPrefix}ytmp3doc* [link]
│  ╰─ Audio como documento
├─🔸 *${usedPrefix}spotify* [link]
│  ╰─ Descargar de Spotify
├─🔹 *${usedPrefix}ytmp4* [link]
│  ╰─ Descargar video de YouTube
├─🔹 *${usedPrefix}ytmp4doc* [link]
│  ╰─ Video como documento
├─🔹 *${usedPrefix}tiktok* [link]
│  ╰─ Descargar de TikTok
├─🔹 *${usedPrefix}facebook* [link]
│  ╰─ Descargar de Facebook
├─🔹 *${usedPrefix}twitter* [link]
│  ╰─ Descargar de Twitter/X
├─🔹 *${usedPrefix}instagram* [link]
│  ╰─ Descargar de Instagram
├─🔸 *${usedPrefix}pinterest* [búsqueda]
│  ╰─ Buscar imágenes Pinterest
├─🔸 *${usedPrefix}image* [búsqueda]
│  ╰─ Buscar imágenes Google
├─🔸 *${usedPrefix}pinterestdoc* [búsqueda]
│  ╰─ Imágenes como documento
├─🔹 *${usedPrefix}mediafire* [link]
│  ╰─ Descargar de MediaFire
├─🔹 *${usedPrefix}mega* [link]
│  ╰─ Descargar de MEGA
├─🔹 *${usedPrefix}apk* [nombre app]
│  ╰─ Buscar APK en Aptoide
├─🔹 *${usedPrefix}mods* [nombre]
│  ╰─ Buscar mods Minecraft
├─🔸 *${usedPrefix}ytsearch* [búsqueda]
│  ╰─ Buscar en YouTube
├─🔸 *${usedPrefix}play2* [canción]
│  ╰─ Alternativa de búsqueda
└─🔸 *${usedPrefix}estados*
   ╰─ Descargar estados WhatsApp
            
╔════════════════════════╗
   🎲 *GACHA COMMANDS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}rollwaifu*
│  ╰─ Personaje aleatorio
├─🔸 *${usedPrefix}claim* [@personaje]
│  ╰─ Reclamar personaje
├─🔸 *${usedPrefix}harem* [@usuario]
│  ╰─ Ver colección personal
├─🔸 *${usedPrefix}charinfo* [nombre]
│  ╰─ Info de personaje
├─🔸 *${usedPrefix}serielist*
│  ╰─ Listar series disponibles
├─🔹 *${usedPrefix}sell* [precio] [nombre]
│  ╰─ Vender personaje
├─🔹 *${usedPrefix}tiendashop* [página]
│  ╰─ Tienda de personajes
├─🔹 *${usedPrefix}buycharacter* [nombre]
│  ╰─ Comprar personaje
├─🔹 *${usedPrefix}removesale* [precio] [nombre]
│  ╰─ Retirar de venta
├─🔹 *${usedPrefix}givechar* [@usuario] [nombre]
│  ╰─ Regalar personaje
├─🔸 *${usedPrefix}trade* [tu personaje] [otro personaje]
│  ╰─ Intercambiar personajes
├─🔸 *${usedPrefix}robwaifu* [@usuario]
│  ╰─ Robar personaje
├─🔸 *${usedPrefix}giveallharem* [@usuario]
│  ╰─ Regalar toda la colección
├─🔸 *${usedPrefix}vote* [nombre]
│  ╰─ Votar por personaje
├─🔹 *${usedPrefix}setclaimmsg* [mensaje]
│  ╰─ Personalizar mensaje de claim
├─🔹 *${usedPrefix}delclaimmsg*
│  ╰─ Restablecer mensaje de claim
├─🔹 *${usedPrefix}deletewaifu* [nombre]
│  ╰─ Eliminar personaje
├─🔹 *${usedPrefix}charimage* [nombre]
│  ╰─ Ver imagen del personaje
├─🔹 *${usedPrefix}serieinfo* [nombre]
│  ╰─ Información del anime
├─🔸 *${usedPrefix}gachainfo*
│  ╰─ Tu info de gacha
├─🔸 *${usedPrefix}waifusboard* [número]
│  ╰─ Top personajes por valor
├─🔸 *${usedPrefix}favoritetop*
│  ╰─ Top personajes favoritos
└─🔸 *${usedPrefix}delwaifu* [nombre]
   ╰─ Eliminar personaje (alternativo)
            
╔════════════════════════╗
      🤖 *SOCKETS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}qr* / *${usedPrefix}code*
│  ╰─ Crear sub-bot con QR/código
├─🔸 *${usedPrefix}bots*
│  ╰─ Ver bots activos
├─🔸 *${usedPrefix}logout*
│  ╰─ Cerrar sesión del bot
├─🔸 *${usedPrefix}join* [invitación]
│  ╰─ Unir bot a un grupo
├─🔹 *${usedPrefix}setusername* [nombre]
│  ╰─ Cambiar nombre de usuario
├─🔹 *${usedPrefix}setpfp*
│  ╰─ Cambiar imagen de perfil
├─🔹 *${usedPrefix}setstatus* [estado]
│  ╰─ Cambiar estado (bio)
├─🔹 *${usedPrefix}leave*
│  ╰─ Salir de un grupo
├─🔸 *${usedPrefix}status*
│  ╰─ Ver estado del bot
├─🔸 *${usedPrefix}ping*
│  ╰─ Medir tiempo de respuesta
└─🔸 *${usedPrefix}botlist*
   ╰─ Ver número de bots (alternativo)
            

╔════════════════════════╗
       🎨 *TOOLS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}sticker*
│  ╰─ Crear sticker de imagen/video
├─🔸 *${usedPrefix}toimg*
│  ╰─ Convertir sticker a imagen
├─🔸 *${usedPrefix}setmeta* [autor]|[pack]
│  ╰─ Configurar pack/autor stickers
├─🔸 *${usedPrefix}delmeta*
│  ╰─ Restablecer pack stickers
├─🔸 *${usedPrefix}brat* / *${usedPrefix}emojimix*
│  ╰─ Stickers con texto/emojis
├─🔸 *${usedPrefix}enhance* [imagen]
│  ╰─ Mejorar calidad de imagen
├─🔹 *${usedPrefix}ia* / *${usedPrefix}gemini*
│  ╰─ Preguntar a ChatGPT/Gemini
├─🔹 *${usedPrefix}dalle* [texto]
│  ╰─ Crear imágenes con IA
├─🔹 *${usedPrefix}translate* [texto]
│  ╰─ Traducir texto
├─🔸 *${usedPrefix}google* [consulta]
│  ╰─ Buscar en Google
├─🔸 *${usedPrefix}wiki* [tema]
│  ╰─ Consultar Wikipedia
├─🔸 *${usedPrefix}ssweb* [url]
│  ╰─ Captura de pantalla web
├─🔸 *${usedPrefix}gitclone* [url]
│  ╰─ Clonar repositorio GitHub
├─🔹 *${usedPrefix}calcular* [ecuación]
│  ╰─ Calculadora
├─🔹 *${usedPrefix}letra* [texto]
│  ╰─ Cambiar fuente de texto
├─🔹 *${usedPrefix}getpic* [@usuario]
│  ╰─ Ver foto de perfil
├─🔹 *${usedPrefix}tourl*
│  ╰─ Subir media a URL
├─🔹 *${usedPrefix}readviewonce*
│  ╰─ Ver imágenes viewonce
├─🔹 *${usedPrefix}say* [texto]
│  ╰─ Repetir mensaje
├─🔹 *${usedPrefix}npmdl* [paquete]
│  ╰─ Descargar paquete npm
├─🔹 *${usedPrefix}sc*
│  ╰─ Link del repositorio
├─🔸 *${usedPrefix}help*
│  ╰─ Menú de comandos
├─🔸 *${usedPrefix}reporte* [problema]
│  ╰─ Reportar fallos
└─🔸 *${usedPrefix}suggest* [idea]
   ╰─ Sugerir nuevas funciones
            
╔════════════════════════╗
     📱 *PROFILES*
╚════════════════════════╝

┌─🔸 *${usedPrefix}profile* [@usuario]
│  ╰─ Ver perfil de usuario
├─🔸 *${usedPrefix}level* [@usuario]
│  ╰─ Ver nivel y experiencia
├─🔸 *${usedPrefix}leaderboard* [página]
│  ╰─ Top de usuarios por EXP
├─🔹 *${usedPrefix}setdescription* [texto]
│  ╰─ Establecer tu descripción
├─🔹 *${usedPrefix}deldescription*
│  ╰─ Eliminar descripción
├─🔹 *${usedPrefix}setgenre* [hombre|mujer]
│  ╰─ Establecer género
├─🔹 *${usedPrefix}delgenre*
│  ╰─ Eliminar género
├─🔹 *${usedPrefix}setbirth* [fecha]
│  ╰─ Establecer cumpleaños
├─🔹 *${usedPrefix}delbirth*
│  ╰─ Eliminar cumpleaños
├─🔹 *${usedPrefix}setfavourite* [personaje]
│  ╰─ Establecer claim favorito
├─🔸 *${usedPrefix}marry* [@usuario]
│  ╰─ Casarse con otro usuario
├─🔸 *${usedPrefix}divorce*
│  ╰─ Divorciarse
└─🔸 *${usedPrefix}prem*
   ╰─ Comprar membresía premium

╔════════════════════════╗
      🏰 *GROUPS*
╚════════════════════════╝

┌─🔸 *${usedPrefix}kick* @usuario
│  ╰─ Expulsar del grupo
├─🔸 *${usedPrefix}add* 521123456789
│  ╰─ Invitar por número
├─🔸 *${usedPrefix}admins*
│  ╰─ Listar administradores
├─🔸 *${usedPrefix}link*
│  ╰─ Obtener enlace
├─🔹 *${usedPrefix}promote* @usuario
│  ╰─ Hacer administrador
├─🔹 *${usedPrefix}demote* @usuario
│  ╰─ Quitar administrador
├─🔹 *${usedPrefix}warn* @usuario
│  ╰─ Advertir usuario
├─🔹 *${usedPrefix}revoke*
│  ╰─ Renovar enlace
├─🔸 *${usedPrefix}fantasmas*
│  ╰─ Detectar inactivos
├─🔸 *${usedPrefix}hidetag* [texto]
│  ╰─ Mencionar silenciosamente
├─🔸 *${usedPrefix}group* open/close
│  ╰─ Abrir/cerrar chat
├─🔸 *${usedPrefix}delete*
   ╰─ Borrar mensajes
├─🔹 *${usedPrefix}infogrupo*
│  ╰─ Info detallada
├─🔹 *${usedPrefix}setwelcome*
│  ╰─ Configurar bienvenida
├─🔹 *${usedPrefix}setbye*
│  ╰─ Configurar despedida
├─🔹 *${usedPrefix}bot* on/off
│  ╰─ Control del bot
├─🔸 *${usedPrefix}groupname*
│  ╰─ Cambiar nombre
├─🔸 *${usedPrefix}groupdesc*
│  ╰─ Cambiar descripción
└─🔸 *${usedPrefix}groupimg*
   ╰─ Cambiar foto
   
╔════════════════════════╗
      🏰 *GROUPS*
╚════════════════════════╝
    
┌─🌸 *${usedPrefix}angry* @usuario
│  ╰─ Enojarse con alguien
├─🌸 *${usedPrefix}bath* @usuario
│  ╰─ Bañarse o ducharse
├─🌸 *${usedPrefix}bite* @usuario
│  ╰─ Morder a alguien
├─🌸 *${usedPrefix}bleh* @usuario
│  ╰─ Sacar la lengua
├─🌸 *${usedPrefix}blush* @usuario
│  ╰─ Sonrojarse o avergonzarse
├─🌸 *${usedPrefix}bored* @usuario
│  ╰─ Mostrar aburrimiento
├─🌸 *${usedPrefix}clap* @usuario
│  ╰─ Aplaudir o felicitar
├─🌸 *${usedPrefix}coffee* @usuario
│  ╰─ Tomar un café
├─🌸 *${usedPrefix}cry* @usuario
│  ╰─ Llorar por algo
├─🌸 *${usedPrefix}cuddle* @usuario
│  ╰─ Acurrucarse o arrullar
├─🌸 *${usedPrefix}dance* @usuario
│  ╰─ Bailar o danzar
├─🌸 *${usedPrefix}dramatic* @usuario
│  ╰─ Dramatizar una situación
├─🌸 *${usedPrefix}drunk* @usuario
│  ╰─ Actuar como borracho
├─🌸 *${usedPrefix}eat* @usuario
│  ╰─ Comer algo delicioso
├─🌸 *${usedPrefix}facepalm* @usuario
│  ╰─ Palmada en la cara
├─🌸 *${usedPrefix}happy* @usuario
│  ╰─ Mostrar felicidad
├─🌸 *${usedPrefix}hug* @usuario
│  ╰─ Dar un abrazo
├─🌸 *${usedPrefix}impregnate* @usuario
│  ╰─ Embarazar a alguien
├─🌸 *${usedPrefix}kill* @usuario
│  ╰─ Matar o atacar
├─🌸 *${usedPrefix}kiss* @usuario
│  ╰─ Dar un beso
├─🌸 *${usedPrefix}kisscheek* @usuario
│  ╰─ Beso en la mejilla
├─🌸 *${usedPrefix}laugh* @usuario
│  ╰─ Reírse a carcajadas
├─🌸 *${usedPrefix}lick* @usuario
│  ╰─ Lamer a alguien
├─🌸 *${usedPrefix}love* @usuario
│  ╰─ Enamorarse o amar
├─🌸 *${usedPrefix}pat* @usuario
│  ╰─ Acariciar suavemente
├─🌸 *${usedPrefix}poke* @usuario
│  ╰─ Picar o tocar
├─🌸 *${usedPrefix}pout* @usuario
│  ╰─ Hacer pucheros
├─🌸 *${usedPrefix}punch* @usuario
│  ╰─ Dar un puñetazo
├─🌸 *${usedPrefix}run* @usuario
│  ╰─ Correr o huir
├─🌸 *${usedPrefix}sad* @usuario
│  ╰─ Mostrar tristeza
├─🌸 *${usedPrefix}scared* @usuario
│  ╰─ Asustarse o temer
├─🌸 *${usedPrefix}seduce* @usuario
│  ╰─ Seducir a alguien
├─🌸 *${usedPrefix}shy* @usuario
│  ╰─ Mostrar timidez
├─🌸 *${usedPrefix}slap* @usuario
│  ╰─ Dar una bofetada
├─🌸 *${usedPrefix}sleep* @usuario
│  ╰─ Dormir o descansar
├─🌸 *${usedPrefix}smoke* @usuario
│  ╰─ Fumar un cigarro
├─🌸 *${usedPrefix}spit* @usuario
│  ╰─ Escupir o despreciar
├─🌸 *${usedPrefix}step* @usuario
│  ╰─ Pisar a alguien
├─🌸 *${usedPrefix}think* @usuario
│  ╰─ Pensar o reflexionar
├─🌸 *${usedPrefix}walk* @usuario
│  ╰─ Caminar o pasear
├─🌸 *${usedPrefix}wink* @usuario
│  ╰─ Guiñar el ojo
├─🌸 *${usedPrefix}cringe* @usuario
│  ╰─ Avergonzarse
├─🌸 *${usedPrefix}smug* @usuario
│  ╰─ Presumir con estilo
├─🌸 *${usedPrefix}smile* @usuario
│  ╰─ Sonreír tiernamente
├─🌸 *${usedPrefix}highfive* @usuario
│  ╰─ Chocar los cinco
├─🌸 *${usedPrefix}bully* @usuario
│  ╰─ Molestar o acosar
├─🌸 *${usedPrefix}handhold* @usuario
│  ╰─ Tomarse de la mano
├─🌸 *${usedPrefix}wave* @usuario
│  ╰─ Saludar con la mano
├─💞 *${usedPrefix}waifu*
│  ╰─ Waifu aleatoria
├─💑 *${usedPrefix}ppcouple*
│  ╰─ Imágenes de parejas anime
├─🔍 *${usedPrefix}pokedex* <nombre>
│  ╰─ Información Pokémon
├─🐾 *${usedPrefix}pokemon* <nombre>
│  ╰─ Buscar Pokémon
├─📺 *${usedPrefix}anime* <nombre>
│  ╰─ Buscar anime
├─📚 *${usedPrefix}manga* <nombre>
│  ╰─ Buscar manga
├─👤 *${usedPrefix}character* <nombre>
│  ╰─ Buscar personaje
├─🎨 *${usedPrefix}animepic*
│  ╰─ Imagen anime aleatoria
└─🖼️ *${usedPrefix}wallpaper*
   ╰─ Wallpaper anime HD`;

    const buttonMessage = {
        image: { url: menuImage },
        caption: txt,
        footer: `${global.botname || 'Asta-Bot'} | Menú`,
        buttons: [
            {
                buttonId: `${usedPrefix}menu`,
                buttonText: { displayText: '📜 HOME' },
                type: 1
            }
        ],
        headerType: 1,
        mentions: [m.sender]
    };
    
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
};

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help2']

export default handler
