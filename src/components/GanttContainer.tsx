import React, { FC } from "react";
import { Gantt, ViewMode, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Issue, Project, ProjectMember } from "../lib/gitlab";
import CustomTooltipContent from "./CustomTooltipContent";
import CustomGanttHeader from "./CustomGanttHeader";
import AssigneeProfile from "./AssigneeProfile";
import {
  parseISO,
  addDays,
  isAfter,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale";

interface Task extends GanttTask {
  assignee?: { name: string; avatar_url: string };
  dependencies?: string[];
  dependency?: string;
  dependencyStyle?: object;
}

interface GanttContainerProps {
  issues: Issue[];
  projectMembers: ProjectMember[];
  selectedProject: Project | null;
  view: ViewMode;
  isChecked: boolean;
  activeStates: Record<
    "En retard" | "À faire" | "En cours" | "Progression",
    boolean
  >;
  handleAssignMember: (issueIid: string, userId: number) => void;
  windowDimensions: { width: number; height: number };
}

const formatDate = (date: Date) => format(date, "dd/MM/yyyy", { locale: fr });

const GanttContainer: FC<GanttContainerProps> = ({
  issues,
  projectMembers,
  selectedProject,
  view,
  isChecked,
  activeStates,
  handleAssignMember,
  windowDimensions,
}) => {
  const prepareGanttData = (): Task[] => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    if (issues.length === 0) {
      return [
        {
          id: "default",
          name: "Aucune tâche trouvée",
          start: monthStart,
          end: monthEnd,
          progress: 0,
          type: "task",
          project: selectedProject?.name || "",
          styles: { backgroundColor: "#E0E0E0" },
          assignee: undefined,
        },
      ];
    }

    const sortedIssues = () => {
      const sorted = [...issues];
      return sorted;
    };

    const sorted = sortedIssues();
    const validTasks = sorted
      .map((issue) => {
        if (!issue || !issue.created_at) return null;

        let startDate: Date;
        try {
          startDate = parseISO(issue.created_at);
        } catch (error) {
          console.error("Erreur de parsing de date:", error);
          return null;
        }

        if (!startDate || isNaN(startDate.getTime())) startDate = new Date();
        const endDate = addDays(startDate, 7);

        const isOverdue = isAfter(today, endDate) && issue.state !== "closed";
        const isNotStarted =
          issue.state === "opened" && issue.time_stats.total_time_spent === 0;

        let taskState:
          | "En retard"
          | "À faire"
          | "En cours"
          | "Progression"
          | null = null;
        if (isOverdue) taskState = "En retard";
        else if (isNotStarted) taskState = "À faire";
        else if (issue.state === "opened") taskState = "En cours";
        else if (issue.state === "closed") taskState = "Progression";

        if (taskState !== null && !activeStates[taskState]) return null;

        let progress = 0;
        if (!isNotStarted) {
          if (issue.time_stats.time_estimate > 0)
            progress = Math.min(
              100,
              (issue.time_stats.total_time_spent /
                issue.time_stats.time_estimate) *
                100
            );
          else if (issue.state === "closed") progress = 100;
          else {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsedDuration = today.getTime() - startDate.getTime();
            progress = Math.min(100, (elapsedDuration / totalDuration) * 100);
          }
        }

        const roundedProgress = Math.round(progress);
        const taskName = isNotStarted
          ? issue.title
          : `${issue.title} (${roundedProgress}%)`;
        const dependencies = extractDependencies(issue.description).map((id) =>
          id.toString()
        );

        return {
          id: issue.iid.toString(),
          name: taskName,
          start: startDate,
          end: endDate,
          progress: roundedProgress,
          type: "task",
          project: selectedProject?.name || "",
          assignee:
            issue.assignees.length > 0
              ? {
                  name: issue.assignees[0].name,
                  avatar_url: issue.assignees[0].avatar_url,
                }
              : undefined,
          styles: {
            backgroundColor: isOverdue
              ? "#ff0000"
              : isNotStarted
              ? "#c1c5c9"
              : "#0D6EFD",
            backgroundSelectedColor: isOverdue
              ? "#FF6961"
              : isNotStarted
              ? "#32CD32"
              : "#0056b3",
            progressColor: "#008040",
            progressSelectedColor: "#FACA22",
          },
          dependencies,
          dependency: dependencies.length > 0 ? dependencies[0] : undefined,
          dependencyStyle: { color: "#ff0000" },
        };
      })
      .filter((task): task is Task => task !== null);

    return validTasks.length > 0
      ? validTasks
      : [
          {
            id: "default",
            name: "Aucune tâche trouvée",
            start: monthStart,
            end: monthEnd,
            progress: 0,
            type: "task",
            project: selectedProject?.name || "",
            styles: { backgroundColor: "#E0E0E0" },
            assignee: undefined,
          },
        ];
  };

  const extractDependencies = (description: string): number[] => {
    const dependencyRegex = /Issue #(\d+)/g;
    const matches = description.match(dependencyRegex);
    return matches
      ? matches.map((match) => parseInt(match.split("#")[1], 10))
      : [];
  };

  let columnWidth = 60;
  if (view === ViewMode.Month) columnWidth = 300;
  else if (view === ViewMode.Week) columnWidth = 250;

  return (
    <div className="gantt-container mt-3 bg-white rounded shadow-sm">
      <Gantt
        tasks={prepareGanttData()}
        viewMode={view}
        onDateChange={(task: Task) =>
          console.log("On date change Id:" + task.id)
        }
        onDelete={(task: Task) =>
          window.confirm(
            `Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?`
          )
        }
        onProgressChange={(task: Task) =>
          console.log("On progress change Id:" + task.id)
        }
        onDoubleClick={(task: Task) =>
          alert("On Double Click event Id:" + task.id)
        }
        onSelect={(task: Task, isSelected: boolean) =>
          console.log(
            `${task.name} has ${isSelected ? "selected" : "unselected"}`
          )
        }
        onExpanderClick={(task: Task) =>
          console.log("On expander click Id:" + task.id)
        }
        listCellWidth={isChecked ? "300px" : ""}
        columnWidth={columnWidth}
        ganttHeight={windowDimensions.height * 0.65}
        headerHeight={60}
        rowHeight={60}
        barFill={70}
        barCornerRadius={5}
        barProgressColor="#0D6EFD"
        barBackgroundColor="#E0E0E0"
        handleWidth={8}
        todayColor="rgba(252,248,227,0.5)"
        projectProgressColor="#ff9e0d"
        rtl={false}
        TooltipContent={(props) => <CustomTooltipContent {...props} />}
        locale="fr"
        timeStep={86400000}
        arrowColor="#ccc"
        fontSize="12px"
        TaskListHeader={CustomGanttHeader}
        TaskListTable={(props) => (
          <div>
            {props.tasks.map((task: Task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: props.rowHeight,
                }}
              >
                <div style={{ width: props.rowWidth, padding: "0 10px" }}>
                  {task.name}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: "150px", textAlign: "center" }}>
                    {formatDate(task.start)}
                  </div>
                  <div style={{ width: "150px", textAlign: "center" }}>
                    {formatDate(task.end)}
                  </div>
                  <div style={{ width: "200px", textAlign: "center" }}>
                    <AssigneeProfile assignee={task.assignee} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default GanttContainer;
