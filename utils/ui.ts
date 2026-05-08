// Genera un color para una actividad basado en su ID
export const getActivityColor = (seed: string | number, colors: any) => {
  const swatches = [
    "#FF7A59", // Coral
    "#5DA9FF", // Sky Blue
    "#B45DFF", // Purple
    "#46C9B8", // Teal
    "#31A24C", // Green
    "#FFB547", // Orange
    "#FF5E7E", // Pink Rose
    "#6366F1", // Indigo
    "#F59E0B", // Amber
    "#10B981", // Mint
    "#8B5CF6", // Violet
    "#EF4444", // Soft Red
    "#34D399", // Emerald
    colors.main,
  ];

  const key = String(seed);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return swatches[hash % swatches.length];
};

// Calcula el color de texto (blanco o oscuro) basado en el color de fondo para legibilidad
export const getReadableTextColor = (backgroundColor: string, colors: any) => {
  const hex = backgroundColor.replace("#", "");
  const expanded = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex;

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? colors.accent : "#FFFFFF";
};