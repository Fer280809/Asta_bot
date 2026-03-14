import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

const W = 720
const H = 290

// ─── Fotos ────────────────────────────────────────────────────────────────────
async function getFotoGrupo(conn, jid) {
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
  } catch { return null }
}

async function getFotoPerfil(conn, usuario) {
  try {
    const url = await conn.profilePictureUrl(usuario, 'image')
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
  } catch {
    const defaultPath = path.join(process.cwd(), 'assets', 'default.png')
    return fs.existsSync(defaultPath) ? fs.readFileSync(defaultPath) : null
  }
}

function getDisplayName(conn, userId) {
  const numero  = userId.split('@')[0]
  const contact = conn.contacts?.[userId]
  if (contact) {
    if (contact.notify)       return contact.notify
    if (contact.name)         return contact.name
    if (contact.short)        return contact.short
    if (contact.verifiedName) return contact.verifiedName
  }
  return numero
}

function drawPersonIcon(ctx, x, y, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x + 7, y + 5, 4.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + 7, y + 20, 7, Math.PI, 0); ctx.fill()
  ctx.restore()
}

async function generateWelcomeImage({ userAvatar, groupPhoto, userName, memberCount, isBye = false }) {
  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext('2d')
  const accent = isBye ? '#ff2255' : '#22ee77'

  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  if (groupPhoto) {
    try {
      const bg = await loadImage(groupPhoto)
      ctx.globalAlpha = 0.12; ctx.drawImage(bg, 0, 0, W, H); ctx.globalAlpha = 1
    } catch {}
  }

  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, 105, 105); ctx.clip()
  ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 5
  for (let i = -105; i < 210; i += 13) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 105, 105); ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = '#181820'; ctx.lineWidth = 2
  ctx.strokeRect(1, 1, W - 2, H - 2)

  const avSize = 178, avX = 38, avY = H / 2 - avSize / 2
  const pivotX = avX + avSize / 2, pivotY = avY + avSize / 2, angle = -0.035

  ctx.save()
  ctx.translate(pivotX, pivotY); ctx.rotate(angle); ctx.translate(-pivotX, -pivotY)
  ctx.fillStyle = '#050510'; ctx.fillRect(avX, avY, avSize, avSize)
  if (userAvatar) {
    try { const av = await loadImage(userAvatar); ctx.drawImage(av, avX, avY, avSize, avSize) } catch {}
  }
  ctx.restore()

  const cOff=9, cX=avX-cOff, cY=avY-cOff, cW=avSize+cOff*2, cH=avSize+cOff*2, cL=30
  ctx.save()
  ctx.translate(pivotX, pivotY); ctx.rotate(angle); ctx.translate(-pivotX, -pivotY)
  ctx.strokeStyle=accent; ctx.lineWidth=3; ctx.shadowColor=accent; ctx.shadowBlur=10; ctx.lineCap='butt'
  ctx.beginPath(); ctx.moveTo(cX+cL,cY);      ctx.lineTo(cX,cY);       ctx.lineTo(cX,cY+cL);      ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cX+cW-cL,cY);   ctx.lineTo(cX+cW,cY);    ctx.lineTo(cX+cW,cY+cL);   ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cX,cY+cH-cL);   ctx.lineTo(cX,cY+cH);    ctx.lineTo(cX+cL,cY+cH);   ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cX+cW-cL,cY+cH);ctx.lineTo(cX+cW,cY+cH); ctx.lineTo(cX+cW,cY+cH-cL);ctx.stroke()
  ctx.restore()

  const TX = 268
  drawPersonIcon(ctx, W-102, 11, '#bbbbbb')
  drawPersonIcon(ctx, W-86,  11, '#bbbbbb')
  ctx.save(); ctx.font='bold 12px Arial'; ctx.fillStyle='#aaaaaa'; ctx.textAlign='left'
  ctx.fillText('ASTA BOT', W-72, 26); ctx.restore()

  ctx.save(); ctx.font='bold 80px Impact'; ctx.textAlign='left'
  ctx.fillStyle=isBye?'#ff4466':'#ffffff'
  ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowOffsetX=3; ctx.shadowOffsetY=3; ctx.shadowBlur=0
  ctx.transform(1,0,-0.06,1,0,0); ctx.fillText(isBye?'GOODBYE':'WELCOME', TX+5, 148); ctx.restore()

  const toY=168
  ctx.save(); ctx.strokeStyle='#404050'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(TX,toY-3);    ctx.lineTo(TX+70,toY-3);  ctx.stroke()
  ctx.font='bold 13px Arial'; ctx.fillStyle='#777788'; ctx.textAlign='left'
  ctx.fillText(' TO ', TX+70, toY)
  ctx.beginPath(); ctx.moveTo(TX+98,toY-3); ctx.lineTo(TX+168,toY-3); ctx.stroke()
  ctx.restore()

  const displayName = userName.length>16 ? userName.slice(0,14)+'..' : userName
  ctx.save(); ctx.font='bold 26px Arial'; ctx.fillStyle='#ddddee'; ctx.textAlign='left'
  ctx.fillText('@'+displayName+'..', TX, 207); ctx.restore()

  const idText = userName.length>20 ? userName.slice(0,18)+'...' : userName+'...'
  ctx.save(); ctx.font='16px Arial'; ctx.fillStyle='#444455'; ctx.textAlign='left'
  ctx.fillText(idText, TX, 232); ctx.restore()

  const badgeText = memberCount+'th member'
  ctx.save(); ctx.font='bold 14px Arial'
  const bw = ctx.measureText(badgeText).width+28
  ctx.fillStyle=isBye?'#150005':'#060f09'
  ctx.beginPath(); ctx.roundRect(TX,250,bw,28,3); ctx.fill()
  ctx.strokeStyle=accent; ctx.lineWidth=1.5; ctx.shadowColor=accent; ctx.shadowBlur=7; ctx.stroke()
  ctx.shadowBlur=0; ctx.fillStyle='#ffffff'; ctx.textAlign='left'
  ctx.fillText(badgeText, TX+14, 269); ctx.restore()

  return canvas.toBuffer('image/png')
}

// ─── Build welcome ────────────────────────────────────────────────────────────
export async function buildWelcome(conn, userId, groupMetadata, chat) {
  const userName    = getDisplayName(conn, userId)
  const groupName   = groupMetadata.subject
  const memberCount = groupMetadata.participants.length
  const numero      = userId.split('@')[0]
  const [userAvatar, groupPhoto] = await Promise.all([
    getFotoPerfil(conn, userId),
    getFotoGrupo(conn, groupMetadata.id)
  ])
  const imageBuffer = await generateWelcomeImage({ userAvatar, groupPhoto, userName, memberCount, isBye: false })
  const defaultCaption = [
    '┏━━〔 🌟 *BIENVENIDO* 〕━➣',
    '┃',
    '┃ ✶ @' + numero,
    '┃ Entró a *' + groupName + '*',
    '┃',
    '┃ Miembro #' + memberCount,
    '┃ Bienvenido a la comunidad ⚔️',
    '┃',
    '┗━━━━━━━━━━━━━━━━━━➣'
  ].join('\n')
  const caption = (chat.sWelcome && chat.sWelcome.trim())
    ? chat.sWelcome
        .replace(/{usuario}/g,  '@'+numero)
        .replace(/{grupo}/g,    groupName)
        .replace(/{desc}/g,     groupMetadata.desc||'Sin descripcion')
        .replace(/{cantidad}/g, memberCount)
    : defaultCaption
  return { imageBuffer, caption, mentions: [userId] }
}

// ─── Build bye ────────────────────────────────────────────────────────────────
export async function buildBye(conn, userId, groupMetadata, chat) {
  const userName    = getDisplayName(conn, userId)
  const groupName   = groupMetadata.subject
  const memberCount = groupMetadata.participants.length
  const numero      = userId.split('@')[0]
  const [userAvatar, groupPhoto] = await Promise.all([
    getFotoPerfil(conn, userId),
    getFotoGrupo(conn, groupMetadata.id)
  ])
  const imageBuffer = await generateWelcomeImage({ userAvatar, groupPhoto, userName, memberCount, isBye: true })
  const defaultCaption = [
    '┏━━〔 😢 *HASTA LUEGO* 〕━➣',
    '┃',
    '┃ ✶ @' + numero,
    '┃ Ha salido de *' + groupName + '*',
    '┃',
    '┃ Ahora somos ' + memberCount + ' miembros',
    '┃ Te extrañaremos 🕯️',
    '┃',
    '┗━━━━━━━━━━━━━━━━━━➣'
  ].join('\n')
  const caption = (chat.sBye && chat.sBye.trim())
    ? chat.sBye
        .replace(/{usuario}/g,  '@'+numero)
        .replace(/{grupo}/g,    groupName)
        .replace(/{desc}/g,     groupMetadata.desc||'Sin descripcion')
        .replace(/{cantidad}/g, memberCount)
    : defaultCaption
  return { imageBuffer, caption, mentions: [userId] }
}

// ─── PLUGIN PRINCIPAL ─────────────────────────────────────────────────────────
// Sistema unificado de welcome - Se ejecuta como handler.all para capturar stubs

let handler = m => m

handler.all = async function (m) {
  try {
    // Verificar que sea un stub de grupo
    if (!m.messageStubType) return
    if (!m.chat?.endsWith('@g.us')) return

    // Obtener conn de forma segura desde global.conn
    const conn = global.conn || this.conn
    if (!conn) {
      console.error('[WELCOME] Error: conn no disponible')
      return
    }

    // Verificar que la DB esté lista
    if (!global.db?.data) {
      console.error('[WELCOME] Error: DB no inicializada')
      return
    }

    // Inicializar chat en DB si no existe
    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {
        isBanned: false, isMute: false, welcome: false,
        sWelcome: '', sBye: '', detect: true,
        modoadmin: false, antiLink: true, nsfw: false,
        economy: true, gacha: true
      }
    }

    const chat = global.db.data.chats[m.chat]
    if (!chat.welcome) return // Welcome desactivado

    const participants = m.messageStubParameters
    if (!participants?.length) return

    console.log(`[WELCOME] stub=${m.messageStubType} chat=${m.chat} participants=${participants.join(', ')}`)

    // Obtener metadata del grupo con retry
    let groupMetadata = null
    let retries = 3
    while (retries > 0 && !groupMetadata) {
      try {
        groupMetadata = await conn.groupMetadata(m.chat)
      } catch (e) {
        retries--
        if (retries === 0) {
          console.error('[WELCOME] Error obteniendo groupMetadata:', e.message)
          return
        }
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    const stub = m.messageStubType

    // 27 = GROUP_PARTICIPANT_ADD | 31 = GROUP_PARTICIPANT_INVITE
    if (stub === 27 || stub === 31) {
      for (const userId of participants) {
        if (!userId) continue
        try {
          const { imageBuffer, caption, mentions } = await buildWelcome(conn, userId, groupMetadata, chat)
          await conn.sendMessage(m.chat, { image: imageBuffer, caption, mentions })
          console.log(`[WELCOME] ✅ Bienvenida enviada a ${userId}`)
        } catch (e) { 
          console.error('[WELCOME] Error enviando bienvenida:', e.message) 
        }
      }
    }

    // 28 = GROUP_PARTICIPANT_REMOVE | 32 = GROUP_PARTICIPANT_LEAVE
    if (stub === 28 || stub === 32) {
      for (const userId of participants) {
        if (!userId) continue
        try {
          const { imageBuffer, caption, mentions } = await buildBye(conn, userId, groupMetadata, chat)
          await conn.sendMessage(m.chat, { image: imageBuffer, caption, mentions })
          console.log(`[WELCOME] ✅ Despedida enviada a ${userId}`)
        } catch (e) { 
          console.error('[WELCOME] Error enviando despedida:', e.message) 
        }
      }
    }

  } catch (e) {
    console.error('[WELCOME] Error general:', e.stack || e.message)
  }
}

export default handler