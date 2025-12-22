// ============================================
// plugins/gacha-harem.js - VERSIÓN MEJORADA (OPCIONAL)
// Solo mejora visual y claridad
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Determinar usuario a consultar
    let targetUser = m.sender;
    let isSelf = true;
    
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0];
        isSelf = targetUser === m.sender;
    } else if (args[0] && args[0].startsWith('@')) {
        const num = args[0].replace('@', '');
        targetUser = num + '@s.whatsapp.net';
        isSelf = targetUser === m.sender;
    }
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    if (!users[targetUser] || !users[targetUser].harem || users[targetUser].harem.length === 0) {
        const msg = isSelf 
            ? '🎄 *¡Tu árbol está vacío!*\n\n✨ Usa `.roll` para obtener adornos navideños y decorar tu árbol.' 
            : '📭 *Este ayudante no ha colgado adornos en su árbol navideño aún.*';
        return m.reply(msg);
    }
    
    const userName = await conn.getName(targetUser);
    const page = parseInt(args[1]) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(users[targetUser].harem.length / perPage);
    
    // Validar página
    if (page < 1 || page > totalPages) {
        return m.reply(`📄 *Página inválida.*\n\nSolo hay ${totalPages} páginas disponibles.\nUsa \`.harem ${page > totalPages ? totalPages : 1}\``);
    }
    
    // Calcular estadísticas
    const totalValue = users[targetUser].harem.reduce((sum, char) => sum + (parseInt(char.value) || 100), 0);
    const forSaleCount = users[targetUser].harem.filter(c => c.forSale).length;
    const favoritesCount = users[targetUser].favorites?.length || 0;
    
    // Crear encabezado
    let text = `🎄 *COLECCIÓN NAVIDEÑA DE ${userName.toUpperCase()}* 🎁\n\n`;
    text += `📊 *Estadísticas:*\n`;
    text += `   🎁 Adornos totales: ${users[targetUser].harem.length}\n`;
    text += `   ⭐ Favoritos: ${favoritesCount}\n`;
    text += `   🏪 En venta: ${forSaleCount}\n`;
    text += `   💎 Valor total: ${totalValue}\n\n`;
    
    text += `📄 *Página ${page}/${totalPages}:*\n`;
    text += `╔══════════════════════════╗\n`;
    
    // Listar adornos de la página actual
    users[targetUser].harem.slice(start, end).forEach((char, i) => {
        const globalIndex = start + i + 1;
        const isFav = users[targetUser].favorites?.includes(char.id);
        const saleInfo = char.forSale ? `💰 *EN VENTA:* ${char.salePrice} coins` : '';
        const favIcon = isFav ? '🌟 ' : '';
        
        text += `║ ${globalIndex}. ${favIcon}*${char.name}*\n`;
        text += `║    🎬 ${char.source || 'Desconocido'}\n`;
        text += `║    💎 Valor: ${char.value || 100}\n`;
        if (saleInfo) {
            text += `║    ${saleInfo}\n`;
        }
        text += `║\n`;
    });
    
    text += `╚══════════════════════════╝\n`;
    
    // Pie de página con comandos útiles
    if (isSelf) {
        text += `\n🔧 *Tus comandos:*\n`;
        text += `• \`.sell <nombre> <precio>\` - Vender adorno\n`;
        text += `• \`.fav <nombre>\` - Marcar favorito\n`;
        text += `• \`.givechar @amigo <nombre>\` - Regalar adorno\n`;
    }
    
    // Navegación entre páginas
    if (totalPages > 1) {
        text += `\n📖 *Navegar:* \`.harem${isSelf ? '' : ' @' + userName.split(' ')[0]} <página>\``;
        if (page < totalPages) {
            text += `\n🎄 *Siguiente:* \`.harem${isSelf ? '' : ' @' + userName.split(' ')[0]} ${page + 1}\``;
        }
    }
    
    await m.reply(text);
};

handler.help = ['harem', 'miharem', 'coleccion', 'misadornos'];
handler.tags = ['gacha', 'navidad', 'info'];
handler.command = ['harem', 'miharem', 'coleccion', 'misadornos'];
handler.group = true;
handler.private = true;

export default handler;