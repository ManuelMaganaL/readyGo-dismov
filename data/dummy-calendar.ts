import type { Activity } from "@/types";

/** Actividades para el día "Hoy" en la vista del calendario */
export const calendarTodayDummy: Activity[] = [
  { id: 1, title: "Desayuno", time_start: "7:00", time_end: "8:00", checkboxes: [] },
  { id: 2, title: "Work", time_start: "9:00", time_end: "13:00", checkboxes: [] },
  { id: 3, title: "Almuerzo", time_start: "13:30", time_end: "14:30", checkboxes: [] },
  { id: 4, title: "College", time_start: "15:00", time_end: "17:30", checkboxes: [] },
  { id: 5, title: "Gym", time_start: "18:00", time_end: "19:00", checkboxes: [] },
  { id: 6, title: "Cena", time_start: "20:00", time_end: "21:00", checkboxes: [] },
  { id: 7, title: "Estudio", time_start: "21:00", time_end: "22:30", checkboxes: [] },
];

/** Actividades para el día "Mañana" en la vista del calendario */
export const calendarTomorrowDummy: Activity[] = [
  { id: 10, title: "Desayuno", time_start: "7:30", time_end: "8:30", checkboxes: [] },
  { id: 11, title: "Reunión equipo", time_start: "9:00", time_end: "10:30", checkboxes: [] },
  { id: 12, title: "Call cliente", time_start: "11:00", time_end: "11:45", checkboxes: [] },
  { id: 13, title: "Almuerzo", time_start: "13:00", time_end: "14:00", checkboxes: [] },
  { id: 14, title: "Proyecto", time_start: "14:30", time_end: "17:00", checkboxes: [] },
  { id: 15, title: "Médico", time_start: "17:30", time_end: "18:30", checkboxes: [] },
  { id: 16, title: "Compras", time_start: "19:00", time_end: "20:00", checkboxes: [] },
  { id: 17, title: "Netflix", time_start: "21:00", time_end: "22:30", checkboxes: [] },
];
