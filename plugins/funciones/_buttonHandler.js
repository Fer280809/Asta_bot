import { jidNormalizedUser, areJidsSameUser } from '@whiskeysockets/baileys'

export async function before(m, { conn, usedPrefix }) {
  // Solo procesar respuestas de botones
  if (m.mtype !== 'buttonsResponseMessage') return false;

  // Obtener la selección del botón
  let selection = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!selection) return false;

  console.log('=== BOTÓN INTERCEPTADO ===');
  console.log('Botón seleccionado:', selection);

  // Extraer el comando (quitar el punto si existe)
  let cmd = selection.replace(/^\./, '');
  console.log('Comando a buscar:', cmd);

  // ============ DETECCIÓN DE ADMINS (IGUAL QUE HANDLER.JS) ============
  const groupMetadata = m.isGroup 
    ? (global.cachedGroupMetadata 
        ? await global.cachedGroupMetadata(m.chat).catch((_) => null) 
        : await this.groupMetadata(m.chat).catch((_) => null)) || {} 
    : {}

  const participants = Array.isArray(groupMetadata?.participants) ? groupMetadata.participants : []

  // Funciones auxiliares para normalizar IDs
  const decode = (j) => this.decodeJid(j)
  const norm = (j) => jidNormalizedUser(decode(j))
  const numOnly = (j) => String(decode(j)).split('@')[0].replace(/[^0-9]/g, '')

  // Identificación del Bot
  const meIdRaw = this.user?.id || this.user?.jid 
  const meLidRaw = (this.user?.lid || conn?.user?.lid || '').toString().replace(/:.*/, '') || null 
  const botNum = numOnly(meIdRaw)

  const botCandidates = [
    decode(meIdRaw),
    jidNormalizedUser(decode(meIdRaw)),
    botNum,
    meLidRaw && `${meLidRaw}@lid`,
    meLidRaw && jidNormalizedUser(`${meLidRaw}@lid`),
    meLidRaw && `${meLidRaw}@s.whatsapp.net`
  ].filter(Boolean)

  const senderCandidates = [decode(m.sender), jidNormalizedUser(decode(m.sender)), numOnly(m.sender)]

  // Mapeo de participantes
  const participantsMap = {}
  for (const p of participants) {
    const raw = p.jid || p.id
    const dj = decode(raw)
    const nj = jidNormalizedUser(dj)
    const no = numOnly(dj)
    participantsMap[dj] = p
    participantsMap[nj] = p
    participantsMap[no] = p
  }

  const pick = (cands) => {
    for (const k of cands) if (participantsMap[k]) return participantsMap[k]
    return participants.find((p) => cands.some((c) => areJidsSameUser(norm(p.jid || p.id), jidNormalizedUser(decode(c))))) || null
  }

  // Asignación de roles
  const userGroup = m.isGroup ? pick(senderCandidates) || {} : {}
  const botGroup = m.isGroup ? pick(botCandidates) || {} : {}

  const isRAdmin = userGroup?.admin === 'superadmin'
  const isAdmin = isRAdmin || userGroup?.admin === 'admin' || userGroup?.admin === true
  const isBotAdmin = botGroup?.admin === 'admin' || botGroup?.admin === 'superadmin' || botGroup?.admin === true

  // Detección de owners
  const isROwner = [...global.owner.map((number) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
  const isOwner = isROwner || m.fromMe

  console.log('🔍 Permisos:', { isAdmin, isBotAdmin, isOwner });

  // ============ BUSCAR PLUGIN ============
  let pluginFound = null
  let pluginName = null

  for (let name in global.plugins) {
    let plugin = global.plugins[name];
    if (!plugin || !plugin.command) continue;

    let commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];

    // Buscar coincidencia exacta O por regex
    const isMatch = commands.some(c => {
      if (c instanceof RegExp) return c.test(cmd)
      return c === cmd
    })

    if (isMatch) {
      pluginFound = plugin
      pluginName = name
      break
    }
  }

  if (!pluginFound) {
    console.log('⚠️ No se encontró plugin para:', cmd);
    return false;
  }

  console.log('✅ Plugin encontrado:', pluginName);

  // ============ VALIDACIÓN DE PERMISOS ============

  if (pluginFound.rowner && !isROwner) {
    await m.reply(`🎅 *¡ACCESO DENEGADO!*\n\nEste comando es exclusivo para los creadores del bot.`);
    return true;
  }

  if (pluginFound.owner && !isOwner) {
    await m.reply(`🎁 *¡RESERVADO PARA OWNERS!*\n\nSolo los desarrolladores del bot pueden usar este comando.`);
    return true;
  }

  if (pluginFound.admin && !isAdmin) {
    await m.reply(`⚠️ *¡PERMISO DENEGADO!*\n\nEste comando solo puede ser usado por administradores del grupo.`);
    return true;
  }

  if (pluginFound.botAdmin && !isBotAdmin) {
    await m.reply(`🤖 *¡BOT SIN PERMISOS!*\n\nNecesito ser administrador del grupo para ejecutar este comando.`);
    return true;
  }

  if (pluginFound.group && !m.isGroup) {
    await m.reply(`👥 *¡SOLO GRUPOS!*\n\nEste comando solo puede usarse en grupos.`);
    return true;
  }

  if (pluginFound.private && m.isGroup) {
    await m.reply(`🔒 *¡SOLO PRIVADO!*\n\nEste comando solo puede usarse en chat privado.`);
    return true;
  }

  // ============ EDITAR MENSAJE CON BOTONES A "CARGANDO" ============
  let loadingMsg = null;
  try {
    // Obtener el ID del mensaje que contiene los botones
    const buttonMsgKey = m.message?.buttonsResponseMessage?.contextInfo?.stanzaId 
      ? {
          id: m.message.buttonsResponseMessage.contextInfo.stanzaId,
          remoteJid: m.chat,
          fromMe: true
        }
      : null;

    if (buttonMsgKey) {
      loadingMsg = await conn.sendMessage(m.chat, {
        text: `⏳ *Procesando...*\n\n_Ejecutando: ${cmd}_`,
        edit: buttonMsgKey
      });
      console.log('✏️ Mensaje editado a estado de carga');
    }
  } catch (e) {
    console.log('⚠️ No se pudo editar mensaje:', e.message);
  }

  // ============ EJECUTAR PLUGIN CON DETECCIÓN DE RESPUESTA ============
  let pluginResponded = false;
  let originalReply = m.reply.bind(m);
  let originalSendMessage = conn.sendMessage.bind(conn);
  
  // Detectar si el plugin responde
  m.reply = async function(...args) {
    pluginResponded = true;
    if (loadingMsg && typeof args[0] === 'string') {
      try {
        await conn.sendMessage(m.chat, {
          text: args[0],
          edit: loadingMsg.key
        });
        return loadingMsg;
      } catch (e) {
        return originalReply.apply(this, args);
      }
    }
    return originalReply.apply(this, args);
  };

  // También detectar conn.sendMessage
  conn.sendMessage = async function(jid, content, ...args) {
    if (jid === m.chat && (content.text || content.caption || content.image || content.video)) {
      pluginResponded = true;
    }
    return originalSendMessage.apply(this, [jid, content, ...args]);
  };

  try {
    console.log('🚀 Ejecutando plugin desde botón...');

    await pluginFound.call(this, m, {
      conn,
      usedPrefix,
      command: cmd,
      args: [],
      text: '',
      participants,
      groupMetadata,
      userGroup,
      botGroup,
      isROwner,
      isOwner,
      isRAdmin,
      isAdmin,
      isBotAdmin,
      fromButton: true,
      loadingMessage: loadingMsg
    });

    console.log('✅ Plugin ejecutado correctamente');

    // Si el plugin NO respondió nada, borramos el mensaje de carga
    if (!pluginResponded && loadingMsg) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await conn.sendMessage(m.chat, { delete: loadingMsg.key });
      console.log('🗑️ Mensaje de carga eliminado (plugin no respondió)');
    } else if (pluginResponded && loadingMsg) {
      console.log('✏️ Mensaje de carga fue reemplazado por la respuesta del plugin');
    }

  } catch (e) {
    console.error('❌ Error ejecutando plugin:', e);
    
    if (loadingMsg) {
      try {
        await conn.sendMessage(m.chat, {
          text: `❌ *Error*\n\n${e.message || 'Error desconocido'}`,
          edit: loadingMsg.key
        });
      } catch (editError) {
        await originalReply(`❌ *Error al ejecutar el comando*\n\n${e.message || e}`);
      }
    } else {
      await originalReply(`❌ *Error al ejecutar el comando*\n\n${e.message || e}`);
    }
    return true;
  } finally {
    // Restaurar funciones originales
    m.reply = originalReply;
    conn.sendMessage = originalSendMessage;
  }

  return true;
}
