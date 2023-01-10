let idGen = 0;
const Id = () => idGen++;

export const createPawn = (color) => ({
  id: String(Id()),
  color,
});
