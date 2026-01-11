export function dateToHijri(date: Date) {
  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return hijriDate;
}
