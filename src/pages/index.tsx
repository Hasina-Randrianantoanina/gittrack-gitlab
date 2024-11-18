// src/pages/index.tsx
"use client";

import React, { useEffect, useState, FC } from "react";
import {
  getProjects,
  Project,
  getProjectIssues,
  Issue,
  getProjectMembers,
  ProjectMember,
  assignMemberToIssue,
} from "../lib/gitlab";
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
  task: Task & { assignees?: string };
  fontSize: string;
  fontFamily: string;
  onAssign: (taskId: string, userId: number) => void;
  projectMembers: ProjectMember[];
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
      <div>
        <strong>Assignée à:</strong> {task.assignees || "Aucun"}
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
  const style: React.CSSProperties = {
    height: headerHeight,
    width: headerWidth,
    display: "flex",
    flexDirection: "column",
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

const CustomGanttHeader: FC<{
  headerHeight: number;
  rowWidth: string;
}> = ({ headerHeight, rowWidth }) => {
  return (
    <div
      className="custom-gantt-header"
      style={{
        height: headerHeight,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: rowWidth,
          textAlign: "center",
          // fontWeight: "bold",
        }}
      >
        Issue
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            // fontWeight: "bold",
          }}
        >
          Début
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            // fontWeight: "bold",
          }}
        >
          Fin
        </div>
      </div>
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
       {/*  <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Year)}
          outline
        >
          Année
        </Button> */}
      </ButtonGroup>
      <FormGroup switch>
        <Input
          type="switch"
          id="taskListSwitch"
          name="taskListSwitch"
          checked={isChecked}
          onChange={() => onViewListChange(!isChecked)}
        />
        <Label check for="taskListSwitch">
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
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
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
      const [issuesData, membersData] = await Promise.all([
        getProjectIssues(projectId),
        getProjectMembers(projectId),
      ]);
      setIssues(issuesData);
      setProjectMembers(membersData);
    } catch (error) {
      console.error(
        "Échec de la récupération des problèmes ou des membres:",
        error
      );
      setIssues([]);
      setProjectMembers([]);
    } finally {
      setIssuesLoading(false);
    }
  };

  // fonction pour convertir le niveau d'accès en rôle
  const getRole = (accessLevel: number): string => {
    switch (accessLevel) {
      case 10:
        return "Guest";
      case 20:
        return "Reporter";
      case 30:
        return "Developer";
      case 40:
        return "Maintainer";
      case 50:
        return "Owner";
      case 5:
        return "Minimal Access";
      default:
        return "Unknown";
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

  const handleAssignMember = async (issueIid: string, userId: number) => {
    if (!selectedProject) return;
    try {
      await assignMemberToIssue(selectedProject.id, parseInt(issueIid), userId);
      fetchIssues(selectedProject.id);
    } catch (error) {
      console.error("Erreur lors de l'assignation du membre:", error);
    }
  };

  const prepareGanttData = (): (Task & { assignees?: string })[] => {
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
        assignees: issue.assignees.map((a) => a.name).join(", "),
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

  const MembersList = () => (
    <div>
      <h3>Membres du projet</h3>
      <ul>
        {projectMembers.map((member) => (
          <li key={member.id}>
            {member.name} - {getRole(member.access_level)}
            {selectedProject?.creator_id === member.id && " (Créateur)"}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Container fluid className="vh-100 d-flex flex-column py-4 px-5">
      <Row className="mb-4 align-items-center">
        <Col md={11}>
          <div className="d-flex align-items-center gap-3">
            <label
              className="fw-bold text-muted mb-0"
              style={{ minWidth: "70px" }}
            >
              Projets :
            </label>
            {[
              "Sélectionner projet",
              "Due Date",
              "Opened Issues",
              "Gantlab Legacy",
            ].map((label, index) => (
              <select
                key={index}
                className="form-select form-select-sm"
                style={{ width: "22%" }}
                onChange={
                  index === 0
                    ? (e) => {
                        const project = projects.find(
                          (p) => p.id === parseInt(e.target.value)
                        );
                        if (project) handleProjectChange(project);
                      }
                    : undefined
                }
                value={index === 0 ? selectedProject?.id || "" : ""}
              >
                <option value="" disabled>
                  {label}
                </option>
                {index === 0 &&
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            ))}
          </div>
        </Col>
        <Col md={1} className="text-end">
          <Button color="danger" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Col>
      </Row>

      {selectedProject && !issuesLoading && (
        <Row className="flex-grow-1 bg-light rounded-3 p-3">
          <Col md={3} className="border-end">
            <MembersList />
          </Col>
          <Col md={9}>
            <h2 className="h4 mb-3 text-primary">
              Diagramme de Gantt : {selectedProject.name}
            </h2>
            <ViewSwitcher
              onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
              onViewListChange={(isChecked: boolean) => setIsChecked(isChecked)}
              isChecked={isChecked}
            />
            <div className="gantt-container mt-3 bg-white rounded shadow-sm">
              <Legend />
              <Gantt
                tasks={prepareGanttData()}
                viewMode={view}
                onDateChange={(task: Task) => {
                  console.log("On date change Id:" + task.id);
                }}
                onDelete={(task: Task) => {
                  return window.confirm(
                    `Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?`
                  );
                }}
                onProgressChange={(task: Task) => {
                  console.log("On progress change Id:" + task.id);
                }}
                onDoubleClick={(task: Task) => {
                  alert("On Double Click event Id:" + task.id);
                }}
                onSelect={(task: Task, isSelected: boolean) => {
                  console.log(
                    `${task.name} has ${isSelected ? "selected" : "unselected"}`
                  );
                }}
                onExpanderClick={(task: Task) => {
                  console.log("On expander click Id:" + task.id);
                }}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={columnWidth}
                ganttHeight={windowDimensions.height * 0.65}
                headerHeight={60}
                rowHeight={40}
                barFill={80}
                barProgressColor="#007bff"
                barBackgroundColor="#E0E0E0"
                handleWidth={8}
                todayColor="rgba(252,248,227,0.5)"
                projectProgressColor="#ff9e0d"
                rtl={false}
                TooltipContent={(props) => (
                  <CustomTooltipContent
                    {...props}
                    onAssign={handleAssignMember}
                    projectMembers={projectMembers}
                  />
                )}
                HeaderContent={CustomHeader}
                locale={ganttLocale}
                timeStep={86400000}
                arrowColor="#ccc"
                fontSize={12}
                TaskListHeader={CustomGanttHeader}
              />
            </div>
          </Col>
        </Row>
      )}

      {issuesLoading && (
        <div className="loading position-absolute top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement ...</span>
          </div>
        </div>
      )}
    </Container>
  );
}
