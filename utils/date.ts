const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);


// Formatea una fecha en formato largo de tipo "Lunes, 7 de mayo"
export const formatLongDate = (date: Date): string => {
  const formatted = date.toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return capitalize(formatted);
};

// Formatea el mes y año de una fecha (ej. "Mayo 2026")
export const formatMonthYear = (date: Date): string => {
  const formatted = date.toLocaleString("es-ES", { month: "long", year: "numeric" });
  return capitalize(formatted);
};

// Obtiene los días del mes para una grilla de calendario, incluyendo días de meses adyacentes
export function getMonthDays(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // Sunday = 0
  const startDate = new Date(year, month, 1 - startDay);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = startDay + daysInMonth;
  const numWeeks = Math.ceil(totalCells / 7);
  const length = numWeeks * 7;

  return Array.from({ length }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      key: date.toISOString(),
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

// Obtiene una semana de días alrededor de una fecha base para el componente de calendario rápido
export function getWeekDays(baseDate: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
  const result = [];

  for (let offset = -2; offset <= 4; offset++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + offset);

    let dayChar = formatter.format(date)[0].toUpperCase();
    if (date.getDay() === 3) { // Miércoles -> X
      dayChar = 'X';
    }

    result.push({
      dayChar,
      dayNumber: date.getDate(),
      date,
    });
  }

  return result;
}

// Convierte un string de tiempo (HH:MM) a minutos totales del día
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
};

// Calcula la duración en minutos entre dos horas
export const getActivityDurationMinutes = (timeStart: string, timeEnd: string): number => {
  return Math.max(15, timeToMinutes(timeEnd) - timeToMinutes(timeStart));
};

// Convierte una fecha a string YYYY-MM-DD respetando la zona horaria local
export const formatToISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};