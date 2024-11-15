// src/pages/index.tsx
"use client";

import React, { useEffect, useState, FC } from "react";
import { getProjects, Project, getProjectIssues, Issue } from "../lib/gitlab";
import { useRouter } from "next/router";
import { Button, ButtonGroup, FormGroup, Label, Input , Container, Row, Col } from "reactstrap";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  parseISO,
  addDays,
  isAfter,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale";

const formatDate = (date: Date) => format(date, "dd/MM/yyyy", { locale: fr });

const ganttLocale = "fr";

interface CustomTooltipProps {
  task: Task;
  fontSize: string;
  fontFamily: string;
}

const CustomTooltipContent: FC<CustomTooltipProps> = ({
  task,
  fontSize,
  fontFamily,
}) => {
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
        <strong>Début:</strong> {formatDate(task.start)}
      </div>
      <div>
        <strong>Fin:</strong> {formatDate(task.end)}
      </div>
      <div>
        <strong>Progrès:</strong> {task.progress}%
      </div>
    </div>
  );
};

interface HeaderProps {
  headerHeight: number;
  headerWidth: number;
  scrollY: number;
}

const CustomHeader: FC<HeaderProps> = ({
  headerHeight,
  headerWidth,
  scrollY,
}) => {
  const style = {
    height: headerHeight,
    width: headerWidth,
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    transform: `translateY(${scrollY}px)`,
  };

  const date = new Date();
  const dayName = format(date, "EEE", { locale: fr }); // Nom du jour abrégé
  const dayNumber = format(date, "d");

  return (
    <div style={style}>
      <div style={{ fontSize: "0.8em", marginBottom: "2px" }}>{dayName}</div>
      <div style={{ fontWeight: "bold" }}>{dayNumber}</div>
    </div>
  );
};

interface ViewSwitcherProps {
  onViewModeChange: (viewMode: ViewMode) => void;
  onViewListChange: (isChecked: boolean) => void;
  isChecked: boolean;
}

const ViewSwitcher: FC<ViewSwitcherProps> = ({
  onViewModeChange,
  onViewListChange,
  isChecked,
}) => {
  return (
    <div className="d-flex align-items-center mb-3">
      <ButtonGroup className="me-3">
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Day)}
          outline
        >
          Jour
        </Button>
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Week)}
          outline
        >
          Semaine
        </Button>
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Month)}
          outline
        >
          Mois
        </Button>
      </ButtonGroup>
      <FormGroup check className="mb-0">
        <Label check>
          <Input
            type="checkbox"
            checked={isChecked}
            onChange={() => onViewListChange(!isChecked)}
          />{" "}
          Afficher la liste des tâches
        </Label>
      </FormGroup>
    </div>
  );
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
          fetchIssues(data[0].id);
        }
      } catch (error) {
        console.error("Échec de la récupération des projets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const updateWindowDimensions = () => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const fetchIssues = async (projectId: number) => {
    setIssuesLoading(true);
    try {
      const issuesData = await getProjectIssues(projectId);
      setIssues(issuesData);
    } catch (error) {
      console.error("Échec de la récupération des problèmes:", error);
      setIssues([]);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gitlab_token");
    localStorage.removeItem("gitlab_url");
    router.push("/login");
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    fetchIssues(project.id);
  };

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
        },
      ];
    }

    return issues.map((issue) => {
      const startDate = issue.created_at
        ? parseISO(issue.created_at)
        : monthStart;
      const endDate = issue.due_date
        ? parseISO(issue.due_date)
        : addDays(startDate, 7);

      const isOverdue = isAfter(today, endDate) && issue.state !== "closed";
      const isNotStarted =
        issue.state === "opened" && issue.time_stats.total_time_spent === 0;

      return {
        id: issue.iid.toString(),
        name: issue.title,
        start: startDate,
        end: endDate,
        progress: 0,
        type: "task",
        project: selectedProject?.name || "",
        styles: {
          backgroundColor: isOverdue
            ? "#FFCCCB"
            : isNotStarted
            ? "#90EE90"
            : "#007bff",
          backgroundSelectedColor: isOverdue
            ? "#FF6961"
            : isNotStarted
            ? "#32CD32"
            : "#0056b3",
        },
      };
    });
  };

  let columnWidth = 60; // Augmenté pour le mode jour
  if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  if (loading) return <div className="loading">Chargement...</div>;

  // Légende des couleurs pour le diagramme de Gantt
  const Legend = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "20px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#FFCCCB",
              marginRight: "8px",
            }}
          ></div>
          <span>En retard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#90EE90",
              marginRight: "8px",
            }}
          ></div>
          <span>A faire</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#007bff",
              marginRight: "8px",
            }}
          ></div>
          <span>En cours</span>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column p-3">
      <Row className="mb-3">
        <Col>
          <h1>Filtres par projet</h1>
        </Col>
        <Col xs="auto">
          <Button color="info" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <select
            className="form-select"
            onChange={(e) => {
              const project = projects.find(
                (p) => p.id === parseInt(e.target.value)
              );
              if (project) handleProjectChange(project);
            }}
            value={selectedProject?.id}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Col>
      </Row>

      {selectedProject && !issuesLoading && (
        <Row className="flex-grow-1">
          <Col>
            <h2 className="h3 mb-3">
              Diagramme de Gantt pour {selectedProject.name}
            </h2>
            <ViewSwitcher
              onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
              onViewListChange={(isChecked: boolean) => setIsChecked(isChecked)}
              isChecked={isChecked}
            />
            <div className="gantt-container">
              <Legend />
              <Gantt
                tasks={prepareGanttData()}
                viewMode={view}
                onDateChange={(task: Task) => {
                  console.log("On date change Id:" + task.id);
                  // Ajoutez ici la logique pour mettre à jour les tâches
                }}
                onDelete={(task: Task) => {
                  const conf = window.confirm(
                    "Êtes-vous sûr de vouloir supprimer la tâche " +
                      task.name +
                      " ?"
                  );
                  if (conf) {
                    // Ajoutez ici la logique pour supprimer la tâche
                  }
                  return conf;
                }}
                onProgressChange={(task: Task) => {
                  console.log("On progress change Id:" + task.id);
                  // Ajoutez ici la logique pour mettre à jour la progression
                }}
                onDoubleClick={(task: Task) => {
                  alert("On Double Click event Id:" + task.id);
                }}
                onSelect={(task: Task, isSelected: boolean) => {
                  console.log(
                    task.name +
                      " has " +
                      (isSelected ? "selected" : "unselected")
                  );
                }}
                onExpanderClick={(task: Task) => {
                  console.log("On expander click Id:" + task.id);
                  // Ajoutez ici la logique pour gérer l'expansion
                }}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={columnWidth}
                ganttHeight={windowDimensions.height * 0.6}
                headerHeight={60} // Augmenté pour donner plus d'espace à l'en-tête
                rowHeight={40}
                barFill={80}
                barProgressColor="#007bff"
                barBackgroundColor="#E0E0E0"
                handleWidth={8}
                todayColor="rgba(252,248,227,0.5)"
                projectProgressColor="#ff9e0d"
                rtl={false}
                TooltipContent={CustomTooltipContent}
                HeaderContent={CustomHeader}
                locale={ganttLocale}
                timeStep={86400000}
                arrowColor="#ccc"
                fontSize={12}
              />
            </div>
          </Col>
        </Row>
      )}

      {issuesLoading && (
        <div className="loading">Chargement des problèmes...</div>
      )}
    </Container>
  );
}
