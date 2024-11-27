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

const OverviewPage: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);

        const allIssues: Issue[] = [];
        const allMergeRequests: MergeRequest[] = [];

        await Promise.all(
          projectsData.map(async (project) => {
            const [projectIssues, projectMRs] = await Promise.all([
              getProjectIssues(project.id),
              getProjectMergeRequests(project.id),
            ]);
            allIssues.push(...projectIssues);
            allMergeRequests.push(...projectMRs);
          })
        );

        setIssues(allIssues);
        setMergeRequests(allMergeRequests);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <h2 className="mb-3">Calendrier des Issues et Merge Requests</h2>
              <CalendarComponent
                issues={issues}
                mergeRequests={mergeRequests}
              />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default OverviewPage;
