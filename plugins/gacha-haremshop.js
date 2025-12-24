// ============================================
// plugins/gacha-haremshop.js - VERSIÓN CORREGIDA
// Solo arregla error de sintaxis y mejora visual
// ============================================
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    const usersPath = path.join(process.cwd(), 'lib', 'gacha_users.json');
    
    // Cargar usuarios festivos
    let users = {};
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    
    // Obtener todos los adornos en venta
    let forSale = [];
    for (const [userId, userData] of Object.entries(users)) {
        if (userData.harem && Array.isArray(userData.harem)) {
            userData.harem.forEach(char => {
                if (char.forSale && char.salePrice > 0) {
                    forSale.push({
                        ...char,
                        ownerId: userId,
                        ownerName: userData.name || 'Sin nombre'
                    });
                }
            });
        }
    }
    
    if (forSale.length === 0) {
        return m.reply('🏪 *¡El Mercado Navideño está vacío!*\n\n🎁 Nadie tiene adornos en venta actualmente.\n✨ Sé el primero en vender con `.sell <nombre> <precio>`');
    }
    
    // Ordenar por precio (más baratos primero)
    forSale.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    
    const page = parseInt(args[0]) || 1;
    const perPage = 8; // Menos por página para mejor visualización
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const totalPages = Math.ceil(forSale.length / perPage);
    
    // Validar página
    if (page < 1 || page > totalPages) {
        return m.reply(`📄 *Página inválida.*\n\nSolo hay ${totalPages} páginas disponibles.\nUsa \`.tienda ${page > totalPages ? totalPages : 1}\``);
    }
    
    // Calcular estadísticas del mercado
    const totalValue = forSale.reduce((sum, char) => sum + (char.salePrice || 0), 0);
    const avgPrice = Math.floor(totalValue / forSale.length);
    const cheapest = forSale[0]?.salePrice || 0;
    const mostExpensive = forSale[forSale.length - 1]?.salePrice || 0;
    
    // Crear mensaje del mercado
    let text = `🎄 *MERCADO NAVIDEÑO DE ADORNOS* 🛍️\n\n`;
    text += `📊 *Estadísticas del mercado:*\n`;
    text += `   🎁 Adornos en venta: ${forSale.length}\n`;
    text += `   💰 Valor total: ${totalValue} coins\n`;
    text += `   📈 Precio promedio: ${avgPrice} coins\n`;
    text += `   💸 Más barato: ${cheapest} coins\n`;
    text += `   💎 Más caro: ${mostExpensive} coins\n\n`;
    
    text += `📄 *Página ${page}/${totalPages}:*\n`;
    text += `╔══════════════════════════════════╗\n`;
    
    // Listar adornos de la página actual
    const currentPageItems = forSale.slice(start, end);
    
    for (let i = 0; i < currentPageItems.length; i++) {
        const char = currentPageItems[i];
        const globalIndex = start + i + 1;
        const ownerName = await conn.getName(char.ownerId).catch(() => char.ownerId.split('@')[0]);
        
        text += `║ ${globalIndex}. *${char.name}*\n`;
        text += `║    🎬 ${char.source || 'Desconocido'}\n`;
        text += `║    💎 Valor: ${char.value || 100}\n`;
        text += `║    💰 Precio: ${char.salePrice} coins\n`;
        text += `║    👤 Vendedor: ${ownerName}\n`;
        
        // Indicador de oferta (si es barato para su valor)
        const charValue = parseInt(char.value) || 100;
        const priceRatio = char.salePrice / charValue;
        if (priceRatio < 0.5) {
            text += `║    🎯 *¡OFERTA!* (${Math.floor(priceRatio * 100)}% del valor)\n`;
        }
        
        text += `║\n`;
    }
    
    text += `╚══════════════════════════════════╝\n\n`;
    
    // Comandos de compra
    text += `🛒 *Cómo comprar:*\n`;
    if (currentPageItems.length > 0) {
        text += `Ejemplo: \`.buychar ${currentPageItems[0].name}\`\n`;
    }
    text += `O usa: \`.buychar <nombre exacto del adorno>\`\n\n`;
    
    // Navegación
    if (totalPages > 1) {
        text += `📖 *Navegar:* \`.tienda <número de página>\`\n`;
        if (page < totalPages) {
            text += `🎄 *Siguiente página:* \`.tienda ${page + 1}\``;
        }
    }
    
    // Footer
    text += `\n\n🎅 *Consejo:* Compara precios antes de comprar!`;
    
    await m.reply(text);
};

handler.help = ['haremshop', 'tienda', 'market', 'mercadonavideño'];
handler.tags = ['gacha', 'navidad', 'economy'];
handler.command = ['gachashop', 'tiendagacha'];
handler.group = true;
export default handler;
