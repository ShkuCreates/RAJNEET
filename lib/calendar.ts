export function generateICS(debate: {
  topic: string;
  scheduled_at: Date;
  description?: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startDate = formatDate(debate.scheduled_at);
  const endDate = formatDate(new Date(debate.scheduled_at.getTime() + 60 * 60 * 1000)); // 1 hour duration

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RAJNEET//Debate Calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:RAJNEET Debate: ${debate.topic}`,
    `DESCRIPTION:${debate.description || debate.topic}`,
    "LOCATION:Online",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

export function downloadICS(debate: {
  topic: string;
  scheduled_at: Date;
  description?: string;
}) {
  const icsContent = generateICS(debate);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `raajneet-debate-${Date.now()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
