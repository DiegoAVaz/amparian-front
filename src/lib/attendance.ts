// Janela em que o organizador pode lançar a presença (RC-02): do início do evento até 30 dias
// depois do fim — ou do início, se o evento não tiver data de fim. É a mesma regra da API, que é
// quem decide; aqui ela serve para a tela não oferecer uma ação que a API vai recusar.

export const ATTENDANCE_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AttendanceWindow =
  | { state: "not-open"; opensAt: Date }
  | { state: "open"; closesAt: Date }
  | { state: "closed"; closedAt: Date };

export function attendanceWindow(
  startsAt: string,
  endsAt: string | null,
  now: Date = new Date(),
): AttendanceWindow {
  const start = new Date(startsAt);
  const reference = endsAt ? new Date(endsAt) : start;
  const closesAt = new Date(reference.getTime() + ATTENDANCE_WINDOW_DAYS * DAY_MS);

  if (now < start) return { state: "not-open", opensAt: start };
  if (now > closesAt) return { state: "closed", closedAt: closesAt };
  return { state: "open", closesAt };
}
