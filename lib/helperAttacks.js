export const entregarAtaquesPorRango = (user) => {
  let xp = global.db.data.ataquesXP || [];
  let rango = global.getRango(user.exp || 0);
  if (!user.unlockedAttacks) user.unlockedAttacks = [];

  for (let ataque of xp) {
    if (ataque.rango <= rango && !user.unlockedAttacks.includes(ataque.nombre)) {
      user.unlockedAttacks.push(ataque.nombre);
    }
  }
};