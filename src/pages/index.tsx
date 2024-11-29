// src/pages/index.tsx
"use client";

import React, { useEffect, useState, FC} from "react";
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
import {
  Button,
  ButtonGroup,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
  Tooltip,
} from "reactstrap";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
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
import Image from "next/image";
import { FiRefreshCw} from "react-icons/fi";
import {
  FaSortUp,
  FaSortDown,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";
import Link from "next/link"; 
import { useUserInfo } from "@/hooks/useUserInfo";

const formatDate = (date: Date) => format(date, "dd/MM/yyyy", { locale: fr });

const ganttLocale = "fr";

interface Task extends GanttTask {
  assignee?: {
    name: string;
    avatar_url: string;
  };
}

interface CustomTooltipProps {
  task: Task;
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
        <strong>Assignée à:</strong> {task.assignee?.name || "Aucun"}
      </div>
    </div>
  );
};

const CustomGanttHeader: FC<{ headerHeight: number; rowWidth: string }> = ({
  headerHeight,
  rowWidth,
}) => {
  return (
    <div
      className="custom-gantt-header"
      style={{
        height: headerHeight,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: rowWidth, textAlign: "center" }}>Tâche</div>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: "150px", textAlign: "center" }}>Début</div>
        <div style={{ width: "150px", textAlign: "center" }}>Fin</div>
        <div style={{ width: "200px", textAlign: "center" }}>
          Personne en charge
        </div>
      </div>
    </div>
  );
};

const AssigneeProfile: FC<{
  assignee?: { name: string; avatar_url: string };
}> = ({ assignee }) => {
  if (!assignee) return <div>Non assigné</div>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src={assignee.avatar_url}
        alt={assignee.name}
        width={24}
        height={24}
        style={{ borderRadius: "50%", marginRight: 8 }}
      />
      <span>{assignee.name}</span>
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
  const { userInfo} = useUserInfo();
  const [sortByDueDate, setSortByDueDate] = useState(false);
  const [filterOpenedIssues, setFilterOpenedIssues] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [reportTooltipOpen, setReportTooltipOpen] = useState(false);
  const [overviewTooltipOpen, setOverviewTooltipOpen] = useState(false);

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const toggleReportTooltip = () => setReportTooltipOpen(!reportTooltipOpen);
  const toggleOverviewTooltip = () =>
    setOverviewTooltipOpen(!overviewTooltipOpen);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");
        if (!token || !url) {
          throw new Error("Token or URL not defined");
        }
        const data = await getProjects(url, token);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
         const token = localStorage.getItem("gitlab_token");
         const url = localStorage.getItem("gitlab_url");
         if (!token || !url) {
           throw new Error("Token or URL not defined");
         }
         console.log("Fetching user info from:", url);
        // const userInfoData = await getUserInfo(url, token);
        // setUserInfo(userInfoData);

        // Le reste de votre code pour récupérer les projets, etc.
        const projectsData = await getProjects(url, token);
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
          fetchIssues(projectsData[0].id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      const token = localStorage.getItem("gitlab_token");
      const url = localStorage.getItem("gitlab_url");
      if (!token || !url) {
        throw new Error("Token or URL not defined");
      }
      console.log("Fetching user info from:", url);
      const [issuesData, membersData] = await Promise.all([
        getProjectIssues(projectId, url, token),
        getProjectMembers(projectId, url, token),
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
      const token = localStorage.getItem("gitlab_token");
      const url = localStorage.getItem("gitlab_url");
      if (!token || !url) {
        throw new Error("Token or URL not defined");
      }
      console.log("Fetching user info from:", url);
      await assignMemberToIssue(
        selectedProject.id,
        parseInt(issueIid),
        userId,
        url,
        token
      );
      fetchIssues(selectedProject.id);
    } catch (error) {
      console.error("Erreur lors de l'assignation du membre:", error);
    }
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
          assignee: undefined,
        },
      ];
    }

    // Utilisez les issues triées
    const sorted = sortedIssues();

    return sorted.map((issue) => {
      const startDate = issue.created_at
        ? parseISO(issue.created_at)
        : monthStart;
      const endDate = issue.due_date
        ? parseISO(issue.due_date)
        : addDays(startDate, 7);
      const isOverdue = isAfter(today, endDate) && issue.state !== "closed";
      const isNotStarted =
        issue.state === "opened" && issue.time_stats.total_time_spent === 0;

      // Calcul du pourcentage de progression
      let progress = 0;
      if (!isNotStarted) {
        if (issue.time_stats.time_estimate > 0) {
          progress = Math.min(
            100,
            (issue.time_stats.total_time_spent /
              issue.time_stats.time_estimate) *
              100
          );
        } else if (issue.state === "closed") {
          progress = 100;
        } else {
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsedDuration = today.getTime() - startDate.getTime();
          progress = Math.min(100, (elapsedDuration / totalDuration) * 100);
        }
      }

      const roundedProgress = Math.round(progress);

      // Inclure le pourcentage dans le nom de la tâche
      const taskName = isNotStarted
        ? issue.title
        : `${issue.title} (${roundedProgress}%)`;

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
              backgroundColor: "#ff0000",
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
              backgroundColor: "#c1c5c9",
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
              backgroundColor: "#0D6EFD",
              marginRight: "8px",
            }}
          ></div>
          <span>En cours</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#008040",
              marginRight: "8px",
            }}
          ></div>
          <span>Progression</span>
        </div>
      </div>
    );
  };

  const MembersList = () => {
    const isActiveMember = (member: ProjectMember) => {
      const isAssigned = issues.some((issue) =>
        issue.assignees.some((assignee) => assignee.id === member.id)
      );

      const isOwnerOrCreator =
        member.access_level === 50 || selectedProject?.creator_id === member.id;

      return isAssigned || isOwnerOrCreator;
    };

    return (
      <div>
        <h3>Membres du projet</h3>
        <ul>
          {projectMembers.map((member) => (
            <li
              key={member.id}
              className={isActiveMember(member) ? "" : "inactive"}
            >
              {member.name} - {getRole(member.access_level)}
              {selectedProject?.creator_id === member.id && " (Créateur)"}
            </li>
          ))}
        </ul>
        <style jsx>{`
          .inactive {
            color: gray; /* Change la couleur du texte des utilisateurs inactifs */
            opacity: 0.6; /* Optionnel : rend le texte plus transparent */
          }
        `}</style>
      </div>
    );
  };

  const sortedIssues = () => {
    let sorted = [...issues];

    // Tri par Due Date
    if (sortByDueDate) {
      sorted.sort((a, b) => {
        const dueDateA = a.due_date ? parseISO(a.due_date) : new Date(Infinity);
        const dueDateB = b.due_date ? parseISO(b.due_date) : new Date(Infinity);

        return dueDateA.getTime() - dueDateB.getTime();
      });
    }

    // Filtrage pour les Opened Issues
    if (filterOpenedIssues) {
      sorted = sorted.filter((issue) => issue.state === "opened");
    }

    return sorted;
  };

  const refreshGanttData = () => {
    if (selectedProject) {
      fetchIssues(selectedProject.id);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column py-4 px-5">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          {userInfo && <h2 className="h4 mb-0">Bienvenue, {userInfo.name}</h2>}
        </Col>
        <Col
          md={4}
          className="text-center d-flex align-items-center justify-content-center"
        >
          <Image
            src="https://about.gitlab.com/images/press/logo/svg/gitlab-icon-rgb.svg"
            alt="GitLab"
            width={30}
            height={30}
            className="me-2"
            style={{ filter: "grayscale(100%)" }}
          />
          <span className="text-secondary">
            {localStorage.getItem("gitlab_url")}
          </span>
        </Col>
        <Col md={4} className="text-end">
          <Button color="outline-secondary" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Col>
      </Row>

      <Row className="mb-4 align-items-center">
        <Col md={11}>
          <div className="d-flex align-items-center gap-3">
            <label className="fw-bold text-muted mb-0">Projets :</label>

            {/* Sélecteur de projet */}
            <select
              className="form-select form-select-sm"
              style={{ width: "300px" }} // Ajustez la largeur selon vos besoins
              onChange={(e) => {
                const project = projects.find(
                  (p) => p.id === parseInt(e.target.value)
                );
                if (project) handleProjectChange(project);
              }}
              value={selectedProject?.id || ""}
            >
              <option value="" disabled>
                Sélectionner projet
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>

      {selectedProject && !issuesLoading && (
        <Row className="flex-grow-1 bg-light rounded-3 p-3">
          <Col md={2} className="border-end">
            <MembersList />
          </Col>
          <Col md={10}>
            <h2 className="h4 mb-3 text-primary">
              Diagramme de Gantt : {selectedProject.name}
            </h2>

            {/* Contrôles supplémentaires */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <ViewSwitcher
                onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
                onViewListChange={(isChecked: boolean) =>
                  setIsChecked(isChecked)
                }
                isChecked={isChecked}
              />
              <Button
                style={{
                  backgroundColor: "transparent", // Couleur de fond transparente
                  color: "#333", // Couleur du texte
                  border: "1px solid #f8f4e3", // Bordure beige clair pour le bouton
                  transition: "background-color 0.3s ease", // Transition douce pour l'effet de survol
                }}
                size="sm"
                onClick={() => setSortByDueDate((prev) => !prev)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f4e3")
                } // Couleur beige clair au survol
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                } // Retour à transparent lorsque le curseur quitte
              >
                Trier par Due Date{" "}
                {sortByDueDate ? <FaSortDown /> : <FaSortUp />}
              </Button>
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="filterOpenedIssues"
                  checked={filterOpenedIssues}
                  onChange={() => setFilterOpenedIssues((prev) => !prev)}
                />
                <Label check for="filterOpenedIssues">
                  Afficher uniquement les issues ouvertes
                </Label>
              </FormGroup>
              <Row className="mb-4">
                <Col>
                  <div className="d-flex align-items-center">
                    <Button
                      id="refreshButton"
                      color="link"
                      className="p-0 ms-2"
                      onClick={refreshGanttData}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px solid #f8f4e3",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={toggleTooltip}
                      onMouseLeave={toggleTooltip}
                    >
                      <FiRefreshCw size={18} color="#6c757d" />
                    </Button>
                    {document.getElementById("refreshButton") && (
                      <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen}
                        target="refreshButton"
                        toggle={toggleTooltip}
                      >
                        Rafraîchir le tableau Gantt
                      </Tooltip>
                    )}

                    <Link href="/report" passHref>
                      <FaClipboardList
                        id="reportIcon"
                        size={18}
                        color="#6c757d"
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                        onMouseEnter={toggleReportTooltip}
                        onMouseLeave={toggleReportTooltip}
                      />
                    </Link>

                    <Link href="/overview" passHref>
                      <FaChartBar
                        id="overviewIcon"
                        size={18}
                        color="#6c757d"
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                        onMouseEnter={toggleOverviewTooltip}
                        onMouseLeave={toggleOverviewTooltip}
                      />
                    </Link>

                    {document.getElementById("reportIcon") && (
                      <Tooltip
                        placement="bottom"
                        isOpen={reportTooltipOpen}
                        target="reportIcon"
                        toggle={toggleReportTooltip}
                      >
                        Accéder aux rapports détaillés
                      </Tooltip>
                    )}

                    {document.getElementById("overviewIcon") && (
                      <Tooltip
                        placement="bottom"
                        isOpen={overviewTooltipOpen}
                        target="overviewIcon"
                        toggle={toggleOverviewTooltip}
                      >
                        Voir la vue d&apos;ensemble
                      </Tooltip>
                    )}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Conteneur du Gantt */}
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
                listCellWidth={isChecked ? "300px" : ""}
                columnWidth={columnWidth}
                ganttHeight={windowDimensions.height * 0.65}
                headerHeight={60}
                rowHeight={60}
                barFill={65}
                barProgressColor="#0D6EFD"
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
                locale={ganttLocale}
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
                        <div
                          style={{ width: props.rowWidth, padding: "0 10px" }}
                        >
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
