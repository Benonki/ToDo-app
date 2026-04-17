import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import "./index.css";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="wrapper">
      <Calendar
        onChange={(value) => value instanceof Date && setSelectedDate(value)}
        value={selectedDate}
        locale="pl-PL"
      />

      <div className="details">
        <h2 className="weekday">
          {selectedDate.toLocaleDateString("pl-PL", {
            weekday: "long",
          })}
        </h2>

        <h1 className="day">
          {selectedDate.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
          })}
        </h1>

        <p className="year">{selectedDate.getFullYear()}</p>
      </div>
    </div>
  );
}
