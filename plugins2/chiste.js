let handler = async (m, { conn, usedPrefix }) => {
    if (!db.data.chats[m.chat].economy && m.isGroup) {
        return m.reply(`🎄 *¡Oh no!* Los chistes navideños están *congelados* en este grupo.\n\n🎅 Un *elfo administrador* puede descongelarlos con:\n» *${usedPrefix}economy on*`)
    }
    
    let user = global.db.data.users[m.sender]
    const cooldown = 10 * 1000 // 10 segundos de cooldown
    
    user.lastjoke = user.lastjoke || 0
    
    if (Date.now() < user.lastjoke) {
        const tiempoRestante = formatTime(user.lastjoke - Date.now())
        return conn.reply(m.chat, `⛄ *¡Espera un momento!* Necesitas descansar *${tiempoRestante}* para contar otro chiste navideño.`, m)
    }
    
    user.lastjoke = Date.now() + cooldown
    
    const joke = pickRandom(chistesNavidad)
    const respuesta = `🎅 *¡Chiste Navideño!*\n\n${joke.chiste}\n\n🎄 ${joke.respuesta ? `*Respuesta:* ${joke.respuesta}` : '¡Espero que te hayas reído!'}\n\n✨ *¡Felices fiestas!*`
    
    await conn.reply(m.chat, respuesta, m)
}

handler.help = ['chiste', 'chistenavi']
handler.tags = ['fun', 'navidad']
handler.command = ['chiste', 'chistenavi']
handler.group = true

export default handler

function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const parts = []
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
    parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
    return parts.join(' ')
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}

const chistesNavidad = [
    {
        chiste: "¿Qué le dijo un pavo a otro pavo en Nochebuena?",
        respuesta: "¡Nos vemos en el horno!"
    },
    {
        chiste: "¿Por qué Santa Claus es tan bueno en el fútbol?",
        respuesta: "¡Porque sabe hacer regalos perfectos!"
    },
    {
        chiste: "¿Qué le dice un árbol de Navidad a otro?",
        respuesta: "¡Por favor, no me abraces!"
    },
    {
        chiste: "¿Cómo se llama el elfo que sabe contar chistes?",
        respuesta: "¡El-elfo-humorístico!"
    },
    {
        chiste: "¿Por qué los renos de Santa no usan GPS?",
        respuesta: "¡Porque ya saben la ruta de memori-a!"
    },
    {
        chiste: "¿Qué le dijo el carbón al niño travieso?",
        respuesta: "¡Este año me toca a mí!"
    },
    {
        chiste: "¿Cómo saluda Papá Noel a sus elfos?",
        respuesta: "¡Hola, hola, hola, hola, hola! (uno por cada elfo)"
    },
    {
        chiste: "¿Qué estudia un elfo en la universidad?",
        respuesta: "¡Juguetería avanzada!"
    },
    {
        chiste: "¿Por qué Santa siempre sabe quién se porta bien?",
        respuesta: "¡Tiene el mejor WiFi del Polo Norte!"
    },
    {
        chiste: "¿Qué le dijo el muñeco de nieve al otro?",
        respuesta: "¡Huele a zanahoria!"
    },
    {
        chiste: "¿Cómo se llama el reno más pequeño de Santa?",
        respuesta: "¡Mini-dolfo!"
    },
    {
        chiste: "¿Qué hace un elfo cuando se aburre?",
        respuesta: "¡Juega al es-condite con los regalos!"
    },
    {
        chiste: "¿Por qué Santa lleva un saco rojo?",
        respuesta: "¡Para que los regalos no se enfríen!"
    },
    {
        chiste: "¿Qué le dijo la bola de Navidad al árbol?",
        respuesta: "¡Déjame colgar contigo!"
    },
    {
        chiste: "¿Cómo sabe Santa tu dirección?",
        respuesta: "¡Tiene el mejor servicio de paquetería!"
    },
    {
        chiste: "¿Qué hace un elfo en el gimnasio?",
        respuesta: "¡Entrenar para levantar sacos de regalos!"
    },
    {
        chiste: "¿Por qué los regalos nunca juegan al escondite?",
        respuesta: "¡Porque siempre los encuentran!"
    },
    {
        chiste: "¿Qué le dijo un adorno a otro?",
        respuesta: "¡No me mires, soy nuevo aquí!"
    },
    {
        chiste: "¿Cómo se despiden los elfos?",
        respuesta: "¡Nos vemos en el taller!"
    },
    {
        chiste: "¿Qué hace Santa cuando llueve?",
        respuesta: "¡Usa su imper-meable!"
    },
    {
        chiste: "¿Por qué el árbol de Navidad no puede mentir?",
        respuesta: "¡Porque siempre está lleno de luz!"
    },
    {
        chiste: "¿Qué le dijo el regalo al papel de regalo?",
        respuesta: "¡Me siento bien envuelto contigo!"
    },
    {
        chiste: "¿Cómo se llama el elfo más rápido?",
        respuesta: "¡Velocielfo!"
    },
    {
        chiste: "¿Qué hace un reno en verano?",
        respuesta: "¡Se toma unas vacaciones en la playa!"
    },
    {
        chiste: "¿Por qué Santa nunca se pierde?",
        respuesta: "¡Porque sigue la estrella de Belén!"
    },
    {
        chiste: "¿Qué le dijo la chimenea a Santa?",
        respuesta: "¡Pasa, que aquí cabemos todos!"
    },
    {
        chiste: "¿Cómo se saludan dos muñecos de nieve?",
        respuesta: "¡Con un abrazo congelante!"
    },
    {
        chiste: "¿Qué estudian los renos en la escuela?",
        respuesta: "¡Geografía para no perderse!"
    },
    {
        chiste: "¿Por qué los elfos son buenos cocineros?",
        respuesta: "¡Porque saben preparar galletas mágicas!"
    },
    {
        chiste: "¿Qué hace Santa en su tiempo libre?",
        respuesta: "¡Lee las cartas en modo avión!"
    },
    {
        chiste: "¿Cómo se llama el elfo más musical?",
        respuesta: "¡El-fa mayor!"
    },
    {
        chiste: "¿Por qué las galletas navideñas son tan educadas?",
        respuesta: "¡Porque siempre dicen 'por favor' antes de ser comidas!"
    },
    {
        chiste: "¿Qué le dijo el acebo al muérdago?",
        respuesta: "¡Deja de colgar de mi!"
    },
    {
        chiste: "¿Cómo se llama el reno más fashion?",
        respuesta: "¡Reno-dolfo Armani!"
    },
    {
        chiste: "¿Por qué Santa usa botas negras?",
        respuesta: "¡Para no dejar huellas en la nieve!"
    },
    {
        chiste: "¿Qué hace un elfo cuando se enoja?",
        respuesta: "¡Se pone rojo como un adorno!"
    },
    {
        chiste: "¿Cómo se llama el taller de Santa en inglés?",
        respuesta: "¡Santa's Workshop-ington!"
    },
    {
        chiste: "¿Por qué los regalos son buenos amigos?",
        respuesta: "¡Porque siempre están para ti!"
    },
    {
        chiste: "¿Qué le dijo el calcetín a la chimenea?",
        respuesta: "¡Espero que este año me llenes bien!"
    },
    {
        chiste: "¿Cómo se llama el elfo más sabio?",
        respuesta: "¡El-filósofo!"
    },
    {
        chiste: "¿Por qué Santa nunca se resfría?",
        respuesta: "¡Porque lleva bufanda de magia!"
    },
    {
        chiste: "¿Qué hace un reno cuando se aburre?",
        respuesta: "¡Juega a las carreras con los copos de nieve!"
    },
    {
        chiste: "¿Cómo se saludan los copos de nieve?",
        respuesta: "¡Con un frío 'hola'!"
    },
    {
        chiste: "¿Por qué los elfos son buenos en matemáticas?",
        respuesta: "¡Porque saben contar regalos rápidamente!"
    },
    {
        chiste: "¿Qué le dijo la estrella al árbol?",
        respuesta: "¡Estoy sobre ti siempre!"
    },
    {
        chiste: "¿Cómo se llama el muñeco de nieve más famoso?",
        respuesta: "¡Frosty el popular!"
    },
    {
        chiste: "¿Por qué Santa nunca juega a las cartas?",
        respuesta: "¡Porque siempre tiene trineos mejores!"
    },
    {
        chiste: "¿Qué hace un elfo en la playa?",
        respuesta: "¡Construye castillos de juguetes!"
    },
    {
        chiste: "¿Cómo se llama el regalo más tímido?",
        respuesta: "¡El que se esconde debajo del árbol!"
    },
    {
        chiste: "¿Por qué los renos tienen nariz roja?",
        respuesta: "¡Porque usan demasiado blush!"
    },
    {
        chiste: "¿Qué le dijo el chocolate caliente a la galleta?",
        respuesta: "¡Juntos somos la mejor combinación!"
    },
    {
        chiste: "¿Cómo se llama el elfo más fuerte?",
        respuesta: "¡El-fortachón!"
    },
    {
        chiste: "¿Por qué Santa siempre está feliz?",
        respuesta: "¡Porque reparte alegría todo el año!"
    },
    {
        chiste: "¿Qué hace un muñeco de nieve en verano?",
        respuesta: "¡Se va de vacaciones al congelador!"
    }
]