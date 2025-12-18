let handler = async (m, { conn, usedPrefix, command }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`
╔══🎄 ECONOMÍA NAVIDEÑA DESACTIVADA 🎅══╗
│ Los comandos de *Economía Navideña* están desactivados en este grupo.
│ 
│ Un *elfo administrador* puede activarlos con:
│ » *${usedPrefix}economy on*
╚══════════════════════════════════════╝
        `);
    }

    let user = global.db.data.users[m.sender];
    user.lastcrime = user.lastcrime || 0;
    user.coin = user.coin || 0;

    const cooldown = 8 * 60 * 1000;
    const ahora = Date.now();

    if (ahora < user.lastcrime) {
        const restante = user.lastcrime - ahora;
        const wait = formatTimeMs(restante);
        return conn.reply(m.chat, `
🎄 *¡Espera un momento, duende travieso!* 🎅
No puedes usar *${usedPrefix + command}* todavía.
⏰ Tiempo de espera navideño: *${wait}*
        `, m);
    }

    user.lastcrime = ahora + cooldown;
    const evento = pickRandom(crimen);
    let cantidad;

    if (evento.tipo === 'victoria') {
        cantidad = Math.floor(Math.random() * 1501) + 6000;
        user.coin += cantidad;
    } else {
        cantidad = Math.floor(Math.random() * 1501) + 4000;
        user.coin -= cantidad;
        if (user.coin < 0) user.coin = 0;
    }

    // Nuevo estilo de mensaje final navideño
    await conn.reply(m.chat, `
╔══🎄 CRIMEN NAVIDEÑO REALIZADO 🎅══╗
│ ${evento.tipo === 'victoria' ? '🎁 ÉXITO NAVIDEÑO' : '🎅 FALLIDO NAVIDEÑO'}
│
│ ${evento.mensaje}
│
│ ${evento.tipo === 'victoria' ? '✨ Ganaste' : '🎄 Perdiste'}: *¥${cantidad.toLocaleString()} ${currency}*
╚══════════════════════════════════╝
    `, m);
}

handler.tags = ['economy'];
handler.help = ['crimen'];
handler.command = ['crimen', 'crime'];
handler.group = true;

export default handler;

function formatTimeMs(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const partes = [];
    if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`);
    partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`);
    return partes.join(' ');
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const crimen = [
    { tipo: 'victoria', mensaje: "🎅 Robaste el saco de regalos de Santa Claus y vendiste los juguetes, ganaste." },
    { tipo: 'victoria', mensaje: "🦌 Sustrajiste galletas navideñas de la fábrica del Polo Norte y las vendiste, ganaste." },
    { tipo: 'victoria', mensaje: "🎄 Hackeaste la lista de niños buenos y añadiste regalos extra para revender, ganaste." },
    { tipo: 'victoria', mensaje: "✨ Interceptaste un trineo de renos cargado de regalos y lo revendiste, ganaste." },
    { tipo: 'victoria', mensaje: "⛄ Robaste un saco lleno de monedas de chocolate navideñas, ganaste." },
    { tipo: 'victoria', mensaje: "🎁 Accediste al taller de duendes y tomaste juguetes antes de ser empaquetados, ganaste." },
    { tipo: 'victoria', mensaje: "🔔 Falsificaste cupones de descuento para tiendas navideñas y obtuviste productos gratis, ganaste." },
    { tipo: 'victoria', mensaje: "🕯️ Te hiciste pasar por duende repartidor y sustrajiste un paquete de regalos exclusivos, ganaste." },
    { tipo: 'victoria', mensaje: "🌟 Robaste un cargamento de luces navideñas mágicas y las vendiste en el mercado negro, ganaste." },
    { tipo: 'victoria', mensaje: "❄️ Creaste un sitio falso de donaciones navideñas y lograste que cientos de personas donaran, ganaste." },
    { tipo: 'victoria', mensaje: "🎅 Manipulaste un lector de tarjetas en una tienda navideña y vaciaste cuentas, ganaste." },
    { tipo: 'victoria', mensaje: "🦌 Falsificaste entradas VIP para la casa de Santa Claus y accediste a un área con objetos exclusivos, ganaste." },
    { tipo: 'victoria', mensaje: "🎄 Engañaste a un coleccionista vendiéndole una réplica de juguete navideño como original, ganaste." },
    { tipo: 'victoria', mensaje: "✨ Capturaste la contraseña de un elfo en un café navideño y transferiste fondos a tu cuenta, ganaste." },
    { tipo: 'victoria', mensaje: "⛄ Convenciste a un duende de participar en una inversión navideña falsa y retiraste sus ahorros, ganaste." },
    { tipo: 'derrota', mensaje: "🎅 Intentaste vender un árbol de navidad falso, pero el comprador notó el engaño y te denunció, perdiste." },
    { tipo: 'derrota', mensaje: "🦌 Hackeaste la cuenta bancaria de un duende, pero olvidaste ocultar tu IP y fuiste rastreado, perdiste." },
    { tipo: 'derrota', mensaje: "🎄 Robaste un saco de regalos en un taller, pero una cámara mágica capturó todo el acto, perdiste." },
    { tipo: 'derrota', mensaje: "✨ Te infiltraste en la fábrica de juguetes, pero el sistema de seguridad navideño activó la alarma, perdiste." },
    { tipo: 'derrota', mensaje: "⛄ Simulaste ser un duende en el taller, pero Santa Claus te reconoció y llamó a los renos de seguridad, perdiste." }
];