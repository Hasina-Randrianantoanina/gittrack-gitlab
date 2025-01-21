// pages/index.tsx
import React, { useEffect, useState } from "react";
import {
  getProjects,
  Project,
  getProjectIssues,
  Issue,
  getProjectMembers,
  ProjectMember,
  assignMemberToIssue,
  getProjectMergeRequests,
  MergeRequest,
  getIssueNotes,
  IssueNote,
} from "../lib/gitlab";
import { useRouter } from "next/router";
import {
  Button,
  Container,
  Row,
  Col,
  Tooltip,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import { ViewMode } from "gantt-task-react";
import { FiRefreshCw } from "react-icons/fi";
import {
  FaSortUp,
  FaSortDown,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";
import Link from "next/link";
import { useUserInfo } from "@/hooks/useUserInfo";
import useActiveStates from "@/hooks/useActiveStates";
import ViewSwitcher from "../components/ViewSwitcher";
import MembersList from "../components/MembersList";
import Legend from "../components/Legend";
import GanttContainer from "../components/GanttContainer";
import Image from "next/image";
import NotificationBell from "../components/NotificationBell";
import HelpIcon from "../components/HelpIcon";

const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();
  const { userInfo } = useUserInfo();
  const [sortByDueDate, setSortByDueDate] = useState(false);
  const [filterOpenedIssues, setFilterOpenedIssues] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [reportTooltipOpen, setReportTooltipOpen] = useState(false);
  const [overviewTooltipOpen, setOverviewTooltipOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [notifications, setNotifications] = useState<string[]>([]);

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
          router.push("/login");
          return;
        }
        const data = await getProjects(url, token);
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
          handleProjectClick(data[0].id);
        }
      } catch (error) {
        console.error("Échec de la récupération des projets:", error);
        setError("Échec de la récupération des projets. Veuillez réessayer.");
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
    const fetchIssues = async (projectId: number) => {
      setIssuesLoading(true);
      try {
        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");
        if (!token || !url) {
          router.push("/login");
          return;
        }
        const [issuesData, membersData, mergeRequestsData] = await Promise.all([
          getProjectIssues(projectId, url, token),
          getProjectMembers(projectId, url, token),
          getProjectMergeRequests(projectId, url, token),
        ]);
        setIssues(issuesData);
        setProjectMembers(membersData);
        setMergeRequests(mergeRequestsData);

        // Vérifier les issues sans activité
        const inactiveIssues = await Promise.all(
          issuesData.map(async (issue) => {
            const notes: IssueNote[] = await getIssueNotes(
              projectId,
              issue.iid,
              url,
              token
            );
            return (
              issue.state === "opened" &&
              !issue.due_date &&
              issue.time_stats.time_estimate === 0 &&
              notes.length === 0
            );
          })
        );
        const inactiveIssuesCount = inactiveIssues.filter(Boolean).length;
        console.log("Inactive issues count:", inactiveIssuesCount); // Ajouter un log pour le débogage
        if (inactiveIssuesCount > 0) {
          setNotifications([
            `Il y a ${inactiveIssuesCount} issue(s) en cours sans activité. Veuillez les mettre à jour.`,
          ]);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error(
          "Échec de la récupération des problèmes, des membres ou des merge requests:",
          error
        );
        setError("Échec de la récupération des données. Veuillez réessayer.");
        setIssues([]);
        setProjectMembers([]);
        setMergeRequests([]);
      } finally {
        setIssuesLoading(false);
      }
    };

    if (selectedProjectId) {
      fetchIssues(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleProjectClick = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handleLogout = () => {
    localStorage.removeItem("gitlab_token");
    localStorage.removeItem("gitlab_url");
    router.push("/login");
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    handleProjectClick(project.id);
  };

  const handleAssignMember = async (issueIid: string, userId: number) => {
    if (!selectedProject) return;
    try {
      const token = localStorage.getItem("gitlab_token");
      const url = localStorage.getItem("gitlab_url");
      if (!token || !url) {
        router.push("/login");
        return;
      }
      await assignMemberToIssue(
        selectedProject.id,
        parseInt(issueIid),
        userId,
        url,
        token
      );
      handleProjectClick(selectedProject.id);
    } catch (error) {
      console.error("Erreur lors de l'assignation du membre:", error);
    }
  };

  const activeStates = useActiveStates();

  const refreshGanttData = () => {
    if (selectedProject) {
      handleProjectClick(selectedProject.id);
    }
  };

  const updateWindowDimensions = () => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  if (loading) return <div className="loading">Chargement...</div>;

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
        <Col
          md={4}
          className="text-end d-flex align-items-center justify-content-end"
        >
          <HelpIcon />
          <NotificationBell notifications={notifications} />
          <Button
            color="outline-secondary"
            size="sm"
            onClick={handleLogout}
            className="ms-2"
          >
            Déconnexion
          </Button>
        </Col>
      </Row>

      <Row className="mb-4 align-items-center">
        <Col md={11}>
          <div className="d-flex align-items-center gap-3">
            <label className="fw-bold text-muted mb-0">Projets :</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "300px" }}
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

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {selectedProject && !issuesLoading && (
        <Row className="flex-grow-1 bg-light rounded-3 p-3">
          <Col md={2} className="border-end">
            <MembersList
              projectMembers={projectMembers}
              issues={issues}
              selectedProjectId={selectedProjectId}
            />
          </Col>
          <Col md={10}>
            <h2 className="h4 mb-3 text-primary">
              Diagramme de Gantt : {selectedProject.name}
            </h2>
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
                  backgroundColor: "transparent",
                  color: "#333",
                  border: "1px solid #f8f4e3",
                  transition: "background-color 0.3s ease",
                }}
                size="sm"
                onClick={() => setSortByDueDate((prev) => !prev)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f4e3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
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
                    <Link href="/tasks" passHref>
                      <Button
                        color="primary"
                        size="sm"
                        style={{ marginLeft: "10px" }}
                      >
                        Voir les tâches
                      </Button>
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
            <div className="gantt-container mt-3 bg-white rounded shadow-sm">
              <Legend />
              <GanttContainer
                issues={issues}
                projectMembers={projectMembers}
                selectedProject={selectedProject}
                view={view}
                isChecked={isChecked}
                activeStates={activeStates}
                handleAssignMember={handleAssignMember}
                windowDimensions={windowDimensions}
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
};

export default Home;
