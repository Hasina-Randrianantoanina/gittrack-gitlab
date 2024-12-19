import React, { FC } from "react";
import { Task } from "react-gantt-chart";

interface CustomTask extends Task {
  assignee?: { name: string; avatar_url: string };
}

interface CustomTooltipProps {
  task: CustomTask;
  fontSize: string;
  fontFamily: string;
}

const CustomTooltipContent: FC<CustomTooltipProps> = ({
  task,
  fontSize,
  fontFamily,
}) => {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString();

  return (
    <div
      style={{
        fontSize,
        fontFamily,
        padding: "10px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div>
        <strong>Tâche:</strong> {task.name}
      </div>
      <div>
        <strong>Début:</strong> {formatDate(task.start as Date)}
      </div>
      <div>
        <strong>Fin:</strong> {formatDate(task.end as Date)}
      </div>
      <div>
        <strong>Progrès:</strong> {task.progress}%
      </div>
      <div>
        <strong>Assignée à:</strong> {task.assignee?.name || "Aucun"}
      </div>
    </div>
  );
};

export default CustomTooltipContent;
