/* Sistema Unificado de Logos - Por @Rayo-ofc */
/* Soporta: Ephoto360, TextPro, PhotoOxy */

import axios from 'axios';
import FormData from 'form-data';
import cheerio from 'cheerio';

// ========================================
// CONFIGURACIÓN DE TODOS LOS EFECTOS
// ========================================

const efectos = {
  // 🎮 GAMING - EPHOTO360
  'naruto': { 
    url: 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html',
    api: 'ephoto'
  },
  'dragonball': { 
    url: 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
    api: 'ephoto'
  },
  'pubg': { 
    url: 'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html',
    api: 'ephoto'
  },
  'amongus': { 
    url: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
    api: 'ephoto'
  },
  'minion': { 
    url: 'https://en.ephoto360.com/create-minions-text-effect-online-858.html',
    api: 'ephoto'
  },
  
  // 🎮 GAMING - TEXTPRO
  'minecraft': { 
    url: 'https://textpro.me/create-a-minecraft-text-effect-819.html',
    api: 'textpro'
  },
  'battlefield': { 
    url: 'https://textpro.me/battlefield-4-text-effect-online-free-1002.html',
    api: 'textpro'
  },
  'cod': { 
    url: 'https://textpro.me/call-of-duty-text-effect-online-902.html',
    api: 'textpro'
  },
  'freefire': { 
    url: 'https://textpro.me/create-free-fire-text-effect-online-911.html',
    api: 'textpro'
  },
  'gamelogo': { 
    url: 'https://textpro.me/video-game-classic-8-bit-text-effect-1037.html',
    api: 'textpro'
  },
  
  // ✨ EFECTOS NEON - EPHOTO360
  'neon': { 
    url: 'https://en.ephoto360.com/neon-light-text-effect-online-882.html',
    api: 'ephoto'
  },
  'neonglitch': { 
    url: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    api: 'ephoto'
  },
  'neoncity': { 
    url: 'https://en.ephoto360.com/neon-city-text-effect-online-803.html',
    api: 'ephoto'
  },
  'neonmaker': { 
    url: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    api: 'ephoto'
  },
  'multicolor': { 
    url: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
    api: 'ephoto'
  },
  'colorful': { 
    url: 'https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html',
    api: 'ephoto'
  },
  
  // ✨ EFECTOS NEON - TEXTPRO
  'neondevil': { 
    url: 'https://textpro.me/create-neon-devil-wings-text-effect-online-free-1014.html',
    api: 'textpro'
  },
  'neonlight': { 
    url: 'https://textpro.me/neon-light-text-effect-online-879.html',
    api: 'textpro'
  },
  'neongalaxy': { 
    url: 'https://textpro.me/create-galaxy-3d-text-effect-online-free-1020.html',
    api: 'textpro'
  },
  'neoncolor': { 
    url: 'https://textpro.me/neon-text-effect-online-963.html',
    api: 'textpro'
  },
  
  // 🌟 BRILLO Y RESPLANDOR - EPHOTO360
  'glow': { 
    url: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    api: 'ephoto'
  },
  'glowing': { 
    url: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    api: 'ephoto'
  },
  'stars': { 
    url: 'https://en.ephoto360.com/stars-night-online-1-85.html',
    api: 'ephoto'
  },
  'gradient': { 
    url: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
    api: 'ephoto'
  },
  'gold': { 
    url: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    api: 'ephoto'
  },
  'silver3d': { 
    url: 'https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html',
    api: 'ephoto'
  },
  
  // 🌟 3D Y METALICO - TEXTPRO
  'vintage3d': { 
    url: 'https://textpro.me/create-realistic-vintage-style-light-bulb-1000.html',
    api: 'textpro'
  },
  'stone3d': { 
    url: 'https://textpro.me/3d-stone-text-effect-online-free-1003.html',
    api: 'textpro'
  },
  'metal3d': { 
    url: 'https://textpro.me/create-a-metallic-text-effect-free-online-1041.html',
    api: 'textpro'
  },
  'chrome3d': { 
    url: 'https://textpro.me/create-chrome-text-effect-online-free-1023.html',
    api: 'textpro'
  },
  'box3d': { 
    url: 'https://textpro.me/create-3d-box-text-effect-online-1098.html',
    api: 'textpro'
  },
  'steel': { 
    url: 'https://textpro.me/metal-dark-gold-text-effect-online-939.html',
    api: 'textpro'
  },
  
  // 🎬 CINE Y SERIES - EPHOTO360
  'harry': { 
    url: 'https://en.ephoto360.com/create-harry-potter-text-effect-online-853.html',
    api: 'ephoto'
  },
  'marvel': { 
    url: 'https://en.ephoto360.com/create-marvel-studios-logo-style-text-effect-online-710.html',
    api: 'ephoto'
  },
  'blackpink': { 
    url: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
    api: 'ephoto'
  },
  'bplogo': { 
    url: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
    api: 'ephoto'
  },
  'bornpink': { 
    url: 'https://en.ephoto360.com/create-blackpinks-born-pink-album-logo-online-1012.html',
    api: 'ephoto'
  },
  'signatures': { 
    url: 'https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-805.html',
    api: 'ephoto'
  },
  '1917': { 
    url: 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    api: 'ephoto'
  },
  'deadpool': { 
    url: 'https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html',
    api: 'ephoto'
  },
  
  // 🔥 EFECTOS NATURALES - EPHOTO360
  'fire': { 
    url: 'https://en.ephoto360.com/create-awesome-fire-text-effect-online-877.html',
    api: 'ephoto'
  },
  'ice': { 
    url: 'https://en.ephoto360.com/create-ice-cold-text-effect-online-870.html',
    api: 'ephoto'
  },
  'rainy': { 
    url: 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html',
    api: 'ephoto'
  },
  'clouds': { 
    url: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    api: 'ephoto'
  },
  'sky': { 
    url: 'https://en.ephoto360.com/create-a-cloud-text-effect-in-the-sky-618.html',
    api: 'ephoto'
  },
  'underwater': { 
    url: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    api: 'ephoto'
  },
  
  // 🔥 EFECTOS NATURALES - TEXTPRO
  'thunder': { 
    url: 'https://textpro.me/create-thunder-text-effect-online-881.html',
    api: 'textpro'
  },
  'magma': { 
    url: 'https://textpro.me/create-a-magma-hot-text-effect-online-1030.html',
    api: 'textpro'
  },
  'lava': { 
    url: 'https://textpro.me/lava-text-effect-online-914.html',
    api: 'textpro'
  },
  'water': { 
    url: 'https://textpro.me/create-a-water-splash-text-effect-online-1061.html',
    api: 'textpro'
  },
  'ice3d': { 
    url: 'https://textpro.me/ice-cold-text-effect-862.html',
    api: 'textpro'
  },
  'snow': { 
    url: 'https://textpro.me/create-snow-text-effects-online-1085.html',
    api: 'textpro'
  },
  
  // 👻 HORROR Y TERROR - TEXTPRO
  'horror': { 
    url: 'https://textpro.me/horror-blood-text-effect-online-883.html',
    api: 'textpro'
  },
  'zombie': { 
    url: 'https://textpro.me/green-horror-style-text-effect-online-1036.html',
    api: 'textpro'
  },
  'halloween': { 
    url: 'https://textpro.me/halloween-fire-text-effect-940.html',
    api: 'textpro'
  },
  'demon': { 
    url: 'https://textpro.me/create-a-demon-text-effect-online-free-1064.html',
    api: 'textpro'
  },
  
  // 🏖️ PLAYA Y VERANO - EPHOTO360
  'beach': { 
    url: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    api: 'ephoto'
  },
  'sand': { 
    url: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    api: 'ephoto'
  },
  'wetsand': { 
    url: 'https://en.ephoto360.com/write-in-wet-sand-text-effect-online-878.html',
    api: 'ephoto'
  },
  
  // 🌌 ESPACIAL Y TECH - EPHOTO360
  'galaxy': { 
    url: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
    api: 'ephoto'
  },
  'galaxystyle': { 
    url: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    api: 'ephoto'
  },
  'matrix': { 
    url: 'https://en.ephoto360.com/matrix-text-effect-154.html',
    api: 'ephoto'
  },
  'glitch': { 
    url: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    api: 'ephoto'
  },
  'pixel': { 
    url: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    api: 'ephoto'
  },
  
  // 🎨 ARTE Y DISEÑO - EPHOTO360
  'watercolor': { 
    url: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    api: 'ephoto'
  },
  'graffiti': { 
    url: 'https://en.ephoto360.com/graffiti-color-199.html',
    api: 'ephoto'
  },
  'cartoon': { 
    url: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    api: 'ephoto'
  },
  'papercut': { 
    url: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    api: 'ephoto'
  },
  'typography': { 
    url: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    api: 'ephoto'
  },
  'paintcolor': { 
    url: 'https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-810.html',
    api: 'ephoto'
  },
  'multilayer': { 
    url: 'https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-809.html',
    api: 'ephoto'
  },
  'comic3d': { 
    url: 'https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html',
    api: 'ephoto'
  },
  
  // 🎨 ARTE Y DISEÑO - TEXTPRO
  'sketch': { 
    url: 'https://textpro.me/create-a-sketch-text-effect-online-1044.html',
    api: 'textpro'
  },
  'pencil': { 
    url: 'https://textpro.me/create-a-pencil-drawing-text-effect-1026.html',
    api: 'textpro'
  },
  'graffiti3d': { 
    url: 'https://textpro.me/create-wonderful-graffiti-art-text-effect-1011.html',
    api: 'textpro'
  },
  'blackpinktxt': { 
    url: 'https://textpro.me/create-blackpink-logo-style-online-1001.html',
    api: 'textpro'
  },
  'glitter': { 
    url: 'https://textpro.me/purple-shiny-metal-text-effect-898.html',
    api: 'textpro'
  },
  'christmas': { 
    url: 'https://textpro.me/christmas-tree-text-effect-online-free-1097.html',
    api: 'textpro'
  },
  
  // 👑 ELEGANTE Y REAL - EPHOTO360
  'royal': { 
    url: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    api: 'ephoto'
  },
  'steeleph': { 
    url: 'https://en.ephoto360.com/steel-text-effect-online-843.html',
    api: 'ephoto'
  },
  'angel': { 
    url: 'https://en.ephoto360.com/angel-wing-effect-329.html',
    api: 'ephoto'
  },
  
  // 🎯 ESPECIALES - EPHOTO360
  'glass': { 
    url: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    api: 'ephoto'
  },
  'foggy': { 
    url: 'https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-808.html',
    api: 'ephoto'
  },
  'hologram': { 
    url: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    api: 'ephoto'
  },
  'equalizer': { 
    url: 'https://en.ephoto360.com/music-equalizer-text-effect-259.html',
    api: 'ephoto'
  },
  'flag': { 
    url: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    api: 'ephoto'
  },
  'flag3d': { 
    url: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    api: 'ephoto'
  },
  'eraser': { 
    url: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    api: 'ephoto'
  },
  'bear': { 
    url: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    api: 'ephoto'
  },
  'rainbow': { 
    url: 'https://en.ephoto360.com/create-rainbow-shine-text-effect-online-874.html',
    api: 'ephoto'
  },
  'balloon3d': { 
    url: 'https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-811.html',
    api: 'ephoto'
  },
  'quotes': { 
    url: 'https://en.ephoto360.com/make-quotes-with-your-photos-online-812.html',
    api: 'ephoto'
  },
  'pornhub': { 
    url: 'https://en.ephoto360.com/create-pornhub-style-logos-online-free-771.html',
    api: 'ephoto'
  },
  
  // 🎯 ESPECIALES - TEXTPRO
  'matrixtxt': { 
    url: 'https://textpro.me/matrix-style-text-effect-online-884.html',
    api: 'textpro'
  },
  'circuit': { 
    url: 'https://textpro.me/create-a-circuit-technology-text-effect-online-1059.html',
    api: 'textpro'
  },
  'transformer': { 
    url: 'https://textpro.me/create-a-transformer-text-effect-online-1035.html',
    api: 'textpro'
  },
  'blood': { 
    url: 'https://textpro.me/blood-text-on-the-frosted-glass-941.html',
    api: 'textpro'
  },
  'glowingtxt': { 
    url: 'https://textpro.me/create-glowing-neon-light-text-effect-online-free-1061.html',
    api: 'textpro'
  },
  'toxic': { 
    url: 'https://textpro.me/toxic-text-effect-online-901.html',
    api: 'textpro'
  },
  'joker': { 
    url: 'https://textpro.me/create-logo-joker-online-934.html',
    api: 'textpro'
  },
  'lionlogo': { 
    url: 'https://textpro.me/create-lion-logo-mascot-online-938.html',
    api: 'textpro'
  },
  'ninja': { 
    url: 'https://textpro.me/create-ninja-logo-online-935.html',
    api: 'textpro'
  },
  'pornhubtxt': { 
    url: 'https://textpro.me/pornhub-style-logo-online-generator-free-977.html',
    api: 'textpro'
  },
  'tiktok': { 
    url: 'https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html',
    api: 'textpro'
  },
  'rainbowtxt': { 
    url: 'https://textpro.me/rainbow-equalizer-text-effect-902.html',
    api: 'textpro'
  },
  'gradienttxt': { 
    url: 'https://textpro.me/create-gradient-text-effect-online-free-1002.html',
    api: 'textpro'
  },
  'hologramtxt': { 
    url: 'https://textpro.me/holographic-3d-text-effect-975.html',
    api: 'textpro'
  },
  'glitch3d': { 
    url: 'https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html',
    api: 'textpro'
  },
  
  // 🎄 AÑO NUEVO 2025 - EPHOTO360
  'newyear2025': { 
    url: 'https://en.ephoto360.com/create-a-video-greeting-card-for-the-new-year-2025-1088.html',
    api: 'ephoto'
  },
  'golden2025': { 
    url: 'https://en.ephoto360.com/christmas-and-new-year-glittering-3d-golden-text-effect-1087.html',
    api: 'ephoto'
  }
};

// ========================================
// HANDLER PRINCIPAL
// ========================================

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `*⚠️ Ingresa un texto*\n*Ejemplo:* ${usedPrefix + command} Mi Texto`,
      m
    );
  }

  const efecto = efectos[command.toLowerCase()];

  if (!efecto) {
    return m.reply('❌ Comando no encontrado: ' + command);
  }

  m.reply(`⏳ Creando tu logo con ${efecto.api.toUpperCase()}, espera...`);

  try {
    let imageUrl;
    
    // Seleccionar API según el efecto
    if (efecto.api === 'ephoto') {
      imageUrl = await ephoto(efecto.url, text);
    } else if (efecto.api === 'textpro') {
      imageUrl = await textpro(efecto.url, text);
    }

    if (!imageUrl) {
      throw new Error('No se pudo generar la imagen.');
    }

    await conn.sendMessage(
      m.chat,
      { image: { url: imageUrl } },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error ${efecto.api}:`, error);
    await m.reply(
      `❌ Error generando el logo. Puede que el efecto ya no esté disponible.\n*Detalles:* ${error.message || error}`
    );
  }
};

// ========================================
// FUNCIÓN PARA EPHOTO360
// ========================================

async function ephoto(url, text) {
  try {
    const pageResponse = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(pageResponse.data);
    const token = $('input[name=token]').val();
    const buildServer = $('input[name=build_server]').val();
    const buildServerId = $('input[name=build_server_id]').val();

    if (!token || !buildServer || !buildServerId) return null;

    const formData = new FormData();
    formData.append('text[]', text);
    formData.append('token', token);
    formData.append('build_server', buildServer);
    formData.append('build_server_id', buildServerId);

    const formResponse = await axios({
      url: url,
      method: 'POST',
      data: formData,
      headers: {
        'Accept': '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'cookie': pageResponse.headers['set-cookie']?.join(' '),
        ...formData.getHeaders()
      }
    });

    const $form = cheerio.load(formResponse.data);
    const formValue = $form('input[name=form_value_input]').val();
    const params = JSON.parse(formValue || '{}');

    if (!params || !params.text) return null;

    params['text[]'] = params.text;
    delete params.text;

    const createResponse = await axios.post(
      'https://en.ephoto360.com/effect/create-image',
      new URLSearchParams(params),
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'cookie': pageResponse.headers['set-cookie'].join(' ')
        }
      }
    );

    if (!createResponse.data || !createResponse.data.image) return null;

    return buildServer + createResponse.data.image;
  } catch (error) {
    console.error('Error en ephoto:', error);
    return null;
  }
}

// ========================================
// FUNCIÓN PARA TEXTPRO
// ========================================

async function textpro(url, text) {
  try {
    const pageResponse = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(pageResponse.data);
    const token = $('input[name=token]').val();
    const buildServer = $('input[name=build_server]').val();
    const buildServerId = $('input[name=build_server_id]').val();

    if (!token || !buildServer || !buildServerId) return null;

    const formData = new FormData();
    formData.append('text[]', text);
    formData.append('token', token);
    formData.append('build_server', buildServer);
    formData.append('build_server_id', buildServerId);

    const formResponse = await axios({
      url: url,
      method: 'POST',
      data: formData,
      headers: {
        'Accept': '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'cookie': pageResponse.headers['set-cookie']?.join('; '),
        ...formData.getHeaders()
      }
    });

    const $form = cheerio.load(formResponse.data);
    const formValue = $form('input[name=form_value_input]').val();
    const params = JSON.parse(formValue || '{}');

    if (!params || !params.text) return null;

    params['text[]'] = params.text;
    delete params.text;

    const createResponse = await axios.post(
      'https://textpro.me/effect/create-image',
      new URLSearchParams(params),
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'cookie': pageResponse.headers['set-cookie']?.join('; ')
        }
      }
    );

    if (!createResponse.data || !createResponse.data.image) return null;

    return buildServer + createResponse.data.image;
  } catch (error) {
    console.error('Error en textpro:', error);
    return null;
  }
}

// ========================================
// EXPORTAR
// ========================================

handler.command = Object.keys(efectos);
handler.tags = ['logos'];
handler.help = Object.keys(efectos);

export default handler;