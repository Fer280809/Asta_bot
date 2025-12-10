var handler = async (m, { conn, participants, usedPrefix, command }) => {
  try {
    let texto = []
    texto.push('╔═══════════════════')
    texto.push('       🛡️  ALERTA  DE  PDF  🛡️')
    texto.push('╠═══════════════════\n')
    texto.push('🕵️‍♂️  *MatrixPDF*\n')
    texto.push('• ¿Qué es?')
    texto.push('  ➜ Una herramienta que puede transformar PDFs aparentemente legítimos en cebos interactivos.\n')
    texto.push('• Riesgos')
    texto.push('  ➜ Redirecciones a sitios con 🦠 *malware*')
    texto.push('  ➜ Páginas de 🎣 *phishing*')
    texto.push('  ➜ Mensajes / botones falsos dentro del PDF\n')
    texto.push('• Recomendación')
    texto.push('  ➜ No abras adjuntos sospechosos. Verifica remitentes y evita clicar prompts dentro del PDF.\n')
    texto.push('🔗 Más info:')
    texto.push('  https://www.varonis.com/blog/matrixpdf\n')
    texto.push('\n╚═══════════════════')
    texto = texto.join('\n')

    await conn.reply(m.chat, texto, m)

  } catch (e) {
    conn.reply(m.chat, `⚠︎ Ocurrió un error al enviar la alerta.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

handler.help = ['matrixpdf']
handler.tags = ['info', 'seguridad']
handler.command = ['matrixpdf', 'alertamatrix', 'pdfmalicioso']

export default handler