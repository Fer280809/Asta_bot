export const getTienda = () => {
  let ataques = global.db.data.ataquesTienda || [];
  let mejoras = global.db.data.mejorasTienda || [];
  return { ataques, mejoras };
};