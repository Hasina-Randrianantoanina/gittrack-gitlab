import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr"; // Importez la locale française de moment
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Issue, MergeRequest } from "../lib/gitlab";

moment.locale("fr"); // Définissez la locale française pour moment
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface CalendarProps {
  issues: Issue[];
  mergeRequests: MergeRequest[];
}

const messages = {
  allDay: "Toute la journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement dans cette plage.",
  showMore: (total: number) => `+ ${total} événement(s) supplémentaire(s)`,
};

const CalendarComponent: React.FC<CalendarProps> = ({
  issues,
  mergeRequests,
}) => {
  const events: CalendarEvent[] = [
    ...issues.map((issue) => ({
      id: issue.id,
      title: `Issue : ${issue.title}`,
      start: new Date(issue.created_at),
      end: issue.due_date
        ? new Date(issue.due_date)
        : new Date(issue.created_at),
    })),
    ...mergeRequests.map((mr) => ({
      id: mr.id,
      title: `Fusion : ${mr.title}`,
      start: new Date(mr.created_at),
      end: mr.merge_when_pipeline_succeeds
        ? new Date(mr.created_at)
        : new Date(),
    })),
  ];

  return (
    <div style={{ height: "500px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        messages={messages}
        formats={{
          monthHeaderFormat: "MMMM YYYY",
          weekdayFormat: "dddd",
          dayHeaderFormat: "dddd D MMMM",
          dayRangeHeaderFormat: ({ start, end }) =>
            `${moment(start).format("D MMMM")} - ${moment(end).format(
              "D MMMM YYYY"
            )}`,
          agendaDateFormat: "dddd D MMMM",
          agendaTimeFormat: "HH:mm",
          agendaTimeRangeFormat: ({ start, end }) =>
            `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
        }}
        views={["month", "week", "day", "agenda"]}
      />
    </div>
  );
};

export default CalendarComponent;
