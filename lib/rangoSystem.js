export const getRango = (exp) => {
  if (exp < 100) return 1;
  if (exp < 300) return 10;
  if (exp < 600) return 30;
  if (exp <= 800) return 50;
  if (exp <= 1200) return 75;
  if (exp <= 2000) return 100;
  return Math.min(Math.floor(exp / 20), 200);
};