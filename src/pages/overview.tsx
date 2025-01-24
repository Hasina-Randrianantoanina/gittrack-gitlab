// pages/overview.tsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  Spinner,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Dashboard from "../components/Dashboard";
import CalendarComponent from "../components/Calendar";
import {
  getProjects,
  getProjectIssues,
  getProjectMergeRequests,
  Project,
  Issue,
  MergeRequest,
} from "../lib/gitlab";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import DateRangeFilter from "../components/DateRangeFilter";

const OverviewPage: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [assignees, setAssignees] = useState<{ name: string; id: number }[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");
        if (!token || !url) {
          // Rediriger vers la page de connexion si le token ou l'URL ne sont pas définis
          router.push("/login");
          return;
        }
        console.log("Fetching user info from:", url);
        const projectsData = await getProjects(url, token);
        setProjects(projectsData);

        const allIssues: Issue[] = [];
        const allMergeRequests: MergeRequest[] = [];

        await Promise.all(
          projectsData.map(async (project) => {
            const [projectIssues, projectMRs] = await Promise.all([
              getProjectIssues(project.id, url, token),
              getProjectMergeRequests(project.id, url, token),
            ]);
            allIssues.push(...projectIssues);
            allMergeRequests.push(...projectMRs);
          })
        );

        setIssues(allIssues);
        setMergeRequests(allMergeRequests);

        // Extraire les personnes en charge des issues
        const uniqueAssignees = new Map<number, { name: string; id: number }>();
        allIssues.forEach((issue) => {
          issue.assignees.forEach((assignee) => {
            uniqueAssignees.set(assignee.id, {
              name: assignee.name,
              id: assignee.id,
            });
          });
        });
        setAssignees(Array.from(uniqueAssignees.values()));
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterIssuesByDateRange = (issue: Issue) => {
    if (!startDate || !endDate) return true;
    const issueDate = new Date(issue.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return issueDate >= start && issueDate <= end;
  };

  const filterMergeRequestsByDateRange = (mr: MergeRequest) => {
    if (!startDate || !endDate) return true;
    const mrDate = new Date(mr.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mrDate >= start && mrDate <= end;
  };

  const filteredIssues = issues
    .filter(filterIssuesByDateRange)
    .filter(
      (issue) => !projectFilter || issue.project_id.toString() === projectFilter
    )
    .filter(
      (issue) =>
        !assigneeFilter ||
        issue.assignees.some((assignee) => assignee.name === assigneeFilter)
    );

  const filteredMergeRequests = mergeRequests
    .filter(filterMergeRequestsByDateRange)
    .filter(
      (mr) => !projectFilter || mr.project_id.toString() === projectFilter
    );

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .cursor-pointer {
          cursor: pointer !important;
        }
      `}</style>
      <Container fluid className="py-4">
        {/* Bouton de retour */}
        <div className="d-flex justify-content-start my-3">
          <Button
            color="secondary"
            onClick={() => router.push("/")} // Utilisation de router.push pour rediriger
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Retour
          </Button>
        </div>
        <h1 className="mb-4">Vue d&apos;ensemble</h1>
        <Nav tabs className="mb-4">
          <NavItem>
            <NavLink
              className={`${
                activeTab === "dashboard" ? "active" : ""
              } cursor-pointer`}
              onClick={() => setActiveTab("dashboard")}
            >
              Tableau de bord
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`${
                activeTab === "calendar" ? "active" : ""
              } cursor-pointer`}
              onClick={() => setActiveTab("calendar")}
            >
              Calendrier
            </NavLink>
          </NavItem>
        </Nav>
        {activeTab === "dashboard" && (
          <Row>
            <Col md={12}>
              <Dashboard projects={projects} />
            </Col>
          </Row>
        )}
        {activeTab === "calendar" && (
          <Row>
            <Col md={12}>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                clearDates={clearDates}
              />
              <FormGroup>
                <Label for="projectFilter">Filtrer par projet</Label>
                <Input
                  type="select"
                  id="projectFilter"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <option value="">Tous les projets</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id.toString()}>
                      {project.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="assigneeFilter">
                  Filtrer par personne en charge
                </Label>
                <Input
                  type="select"
                  id="assigneeFilter"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                >
                  <option value="">Toutes les personnes</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.name}>
                      {assignee.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <h2 className="mb-3">Calendrier des Issues et Merge Requests</h2>
              <CalendarComponent
                issues={filteredIssues}
                mergeRequests={filteredMergeRequests}
                projectFilter={projectFilter}
                assigneeFilter={assigneeFilter}
              />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default OverviewPage;
