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
    return false; // NO encontrado, dejar que el handler principal lo intente
  }

  console.log('✅ Plugin encontrado:', pluginName);

  // ============ VALIDACIÓN DE PERMISOS ============

  // Verificar si requiere ser owner
  if (pluginFound.rowner && !isROwner) {
    await m.reply(`🎅 *¡ACCESO DENEGADO!*\n\nEste comando es exclusivo para los creadores del bot.`);
    return true; // DETENER propagación
  }

  if (pluginFound.owner && !isOwner) {
    await m.reply(`🎁 *¡RESERVADO PARA OWNERS!*\n\nSolo los desarrolladores del bot pueden usar este comando.`);
    return true; // DETENER propagación
  }

  // Verificar si requiere admin
  if (pluginFound.admin && !isAdmin) {
    await m.reply(`⚠️ *¡PERMISO DENEGADO!*\n\nEste comando solo puede ser usado por administradores del grupo.`);
    return true; // DETENER propagación
  }

  // Verificar si requiere que el bot sea admin
  if (pluginFound.botAdmin && !isBotAdmin) {
    await m.reply(`🤖 *¡BOT SIN PERMISOS!*\n\nNecesito ser administrador del grupo para ejecutar este comando.`);
    return true; // DETENER propagación
  }

  // Verificar si solo funciona en grupos
  if (pluginFound.group && !m.isGroup) {
    await m.reply(`👥 *¡SOLO GRUPOS!*\n\nEste comando solo puede usarse en grupos.`);
    return true; // DETENER propagación
  }

  // Verificar si solo funciona en privado
  if (pluginFound.private && m.isGroup) {
    await m.reply(`🔒 *¡SOLO PRIVADO!*\n\nEste comando solo puede usarse en chat privado.`);
    return true; // DETENER propagación
  }

  // ============ EJECUTAR PLUGIN ============
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
      isBotAdmin
    });

    console.log('✅ Plugin ejecutado correctamente');
    return true; // DETENER propagación - comando ejecutado exitosamente

  } catch (e) {
    console.error('❌ Error ejecutando plugin:', e);
    await m.reply(`❌ *Error al ejecutar el comando*\n\n${e.message || e}`);
    return true; // DETENER propagación incluso con error
  }
}