// ============================================
// plugins/rpg/resource-help.js
// ============================================
const handler = async (m, { conn, usedPrefix }) => {
    const text = `🎮 *SISTEMA DE RECURSOS Y MISIONES* 🎮

🛠️ *HERRAMIENTAS BÁSICAS:*
▸ ${usedPrefix}mine - Minar recursos (piedra, hierro, oro, etc.)
▸ ${usedPrefix}chop - Talar madera
▸ ${usedPrefix}fish - Pescar peces
▸ ${usedPrefix}inventory - Ver tu inventario

🛒 *TIENDA Y ECONOMÍA:*
▸ ${usedPrefix}shop - Comprar herramientas y vender recursos
▸ ${usedPrefix}shop repair - Reparar herramientas
▸ ${usedPrefix}shop sell - Vender recursos
▸ ${usedPrefix}craft - Craftear items especiales

📋 *MISIONES Y RECOMPENSAS:*
▸ ${usedPrefix}mission - Ver y reclamar misiones
▸ ${usedPrefix}mission claim - Reclamar recompensas
▸ Misiones diarias, semanales y mensuales
▸ Racha de 3 días = Personaje especial 🎁

⚡ *BONUS ESPECIALES:*
▸ Owners globales reciben bonificación x2
▸ Usuarios en global.fernando reciben x3
▸ Personajes exclusivos por misiones
▸ Herramientas de niveles épicos

💰 *CONSEJOS:*
1. Comienza con herramientas básicas
2. Completa misiones diarias para rachas
3. Mejora tus herramientas para mejores recursos
4. Craftea items para aumentar tu poder
5. Vende lo que no necesites

🎯 *OBJETIVOS:*
▸ Consigue todos los recursos legendarios
▸ Completa todas las misiones mensuales
▸ Arma tu colección de personajes
▸ Conviértete en el más rico del servidor

🔧 *NIVELES DE HERRAMIENTAS:*
1️⃣ Básico → 2️⃣ Hierro → 3️⃣ Oro → 4️⃣ Diamante → 5️⃣ Mitril

📞 *SOPORTE:*
¿Problemas? Contacta a los admins del bot.

✨ *¡Diviértete y acumula riquezas!* ✨`;

    await conn.reply(m.chat, text, m);
};

handler.help = ['resourcehelp', 'rh', 'recursoshelp'];
handler.tags = ['main', 'rpg'];
handler.command = ['resourcehelp', 'rh', 'recursoshelp'];
handler.group = true;
handler.reg = true

export default handler;