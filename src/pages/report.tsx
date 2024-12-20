import React, { useEffect, useState } from "react";
import {
  getProjects,
  getProjectIssues,
  fetchUserById,
  getProjectDetails,
  getProjectMilestones,
  getProjectLabels,
  getProjectIssuesStatistics,
  getProjectEvents,
  Project,
  Issue,
  UserInfo,
  Milestone,
  IssuesStatistics,
  Event,
} from "../lib/gitlab";
import { Container, Row, Col, Button } from "reactstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import withPermission from "@/components/withPermission";
import ProjectList from "../components/ProjectList";
import ProjectDetails from "../components/ProjectDetails";
import IssuesTable from "../components/IssuesTable";
import MilestonesTable from "../components/MilestonesTable";
import LabelsList from "../components/LabelsList";
import IssuesStatisticsTable from "../components/IssuesStatistics";
import AssignedUsers from "../components/AssignedUsers";
import ActivityHistory from "../components/ActivityHistory";

const ReportPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<{ [key: number]: UserInfo }>(
    {}
  );
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [labels, setLabels] = useState<{ id: number; name: string }[]>([]);
  const [issuesStatistics, setIssuesStatistics] =
    useState<IssuesStatistics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");

        if (!token || !url) {
          router.push("/login");
          return;
        }

        if (!url.startsWith("https://")) {
          throw new Error("GITLAB_API_URL must use HTTPS");
        }

        console.log("Fetching user info from:", url);
        const data = await getProjects(url, token);
        setProjects(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchIssuesAndDetails = async () => {
      if (!selectedProjectId) return;

      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");

        if (!token || !url) {
          router.push("/login");
          return;
        }

        if (!url.startsWith("https://")) {
          throw new Error("GITLAB_API_URL must use HTTPS");
        }

        const data = await getProjectIssues(selectedProjectId, url, token);
        setIssues(data);

        const details = await getProjectDetails(selectedProjectId, url, token);
        setProjectDetails(details);

        const milestonesData = await getProjectMilestones(
          selectedProjectId,
          url,
          token
        );
        setMilestones(milestonesData);

        const labelsData = await getProjectLabels(
          selectedProjectId,
          url,
          token
        );
        setLabels(labelsData);

        const statisticsData = await getProjectIssuesStatistics(
          selectedProjectId,
          url,
          token
        );
        setIssuesStatistics(statisticsData);

        const eventsData = await getProjectEvents(
          selectedProjectId,
          url,
          token
        );
        setEvents(eventsData);

        const userIds = data.flatMap((issue) =>
          issue.assignees.map((assignee) => assignee.id)
        );
        const uniqueUserIds = Array.from(new Set(userIds));

        const userPromises = uniqueUserIds.map((id) =>
          fetchUserById(id, url, token)
        );
        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as { [key: number]: UserInfo });
        setUserDetails(userMap);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des issues et détails:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIssuesAndDetails();
  }, [selectedProjectId]);

  const handleRowClick = (projectId: number) => {
    setActiveRow(projectId);
    setSelectedProjectId(projectId);
  };

  if (loading)
    return (
      <div className="loading position-absolute top-50 start-50 translate-middle">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement ...</span>
        </div>
      </div>
    );

  return (
    <Container fluid>
      <div className="d-flex justify-content-start my-3">
        <Button
          color="secondary"
          onClick={() => router.push("/")}
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Retour
        </Button>
      </div>
      <h1 className="text-left my-4">Rapports des activités</h1>
      <Row>
        <Col xs={12} md={4} className="mb-4">
          <h2 className="h5">Projets</h2>
          <ProjectList
            projects={projects}
            activeRow={activeRow}
            hoveredRow={hoveredRow}
            onRowClick={handleRowClick}
            onMouseEnter={setHoveredRow}
            onMouseLeave={() => setHoveredRow(null)}
          />
        </Col>
        <Col xs={12} md={8}>
          <ProjectDetails projectDetails={projectDetails} />
          <h2 className="h5 mb-3">Issues du Projet</h2>
          <IssuesTable
            issues={issues}
            titleFilter={titleFilter}
            stateFilter={stateFilter}
            assigneeFilter={assigneeFilter}
            labelFilter={labelFilter}
            setTitleFilter={setTitleFilter}
            setStateFilter={setStateFilter}
            setAssigneeFilter={setAssigneeFilter}
            setLabelFilter={setLabelFilter}
          />
          <h2 className="h5">Milestones Associés</h2>
          <MilestonesTable milestones={milestones} />
          <h2 className="h5">Labels des Issues</h2>
          <LabelsList labels={labels} />
          <h2 className="h5">Statistiques des Issues</h2>
          <IssuesStatisticsTable issuesStatistics={issuesStatistics} />
          <h2 className="h5">Détails des Utilisateurs Assignés</h2>
          <AssignedUsers userDetails={userDetails} />
          <h2 className="h5">Historique des Activités</h2>
          <ActivityHistory events={events} />
        </Col>
      </Row>
    </Container>
  );
};

export default withPermission(ReportPage, "read_public_issues");
