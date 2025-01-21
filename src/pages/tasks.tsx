// pages/tasks.tsx
import React, { useEffect, useState } from "react";
import {
  getProjects,
  Project,
  getProjectIssues,
  Issue,
  getProjectMembers,
  ProjectMember,
} from "../lib/gitlab";
import { useRouter } from "next/router";
import { Button, Container, Row, Col, Alert } from "reactstrap";
import DateRangeFilter from "../components/DateRangeFilter";
import TasksTable from "../components/TasksTable";
import * as XLSX from "xlsx";

const TasksPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

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
  }, []);

  useEffect(() => {
    const fetchIssues = async (projectId: number) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");
        if (!token || !url) {
          router.push("/login");
          return;
        }
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
        setError("Échec de la récupération des données. Veuillez réessayer.");
        setIssues([]);
        setProjectMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProject) {
      fetchIssues(selectedProject.id);
    }
  }, [selectedProject]);

  const handleProjectClick = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) setSelectedProject(project);
  };

  const exportToExcel = () => {
    const filteredIssues = issues.filter((issue) => {
      const issueDate = new Date(issue.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return issueDate >= start && issueDate <= end;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      filteredIssues.map((issue) => ({
        Tâche: issue.title,
        "Assigné à": issue.assignees.length
          ? projectMembers.find((m) => m.id === issue.assignees[0].id)?.name
          : "Non assigné",
        Projet:
          projects.find((p) => p.id === issue.project_id)?.name ||
          "Projet inconnu",
        "Date de création": new Date(issue.created_at).toLocaleDateString(),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Tâches");
    XLSX.writeFile(wb, "tâches.xlsx");
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <Container fluid className="vh-100 d-flex flex-column py-4 px-5">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h2 className="h4 mb-0">Tâches assignées par membre</h2>
        </Col>
        <Col md={4} className="text-center">
          <Button color="primary" onClick={exportToExcel} className="ms-2">
            Exporter en Excel
          </Button>
        </Col>
        <Col md={4} className="text-end">
          <Button
            color="outline-secondary"
            size="sm"
            onClick={() => router.push("/")}
            className="ms-2"
          >
            Retour à l&apos;accueil
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

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
                if (project) handleProjectClick(project.id);
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

      <Row className="flex-grow-1 bg-light rounded-3 p-3">
        <Col md={12}>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <TasksTable
            issues={issues}
            projectMembers={projectMembers}
            projects={projects}
            startDate={startDate}
            endDate={endDate}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default TasksPage;
