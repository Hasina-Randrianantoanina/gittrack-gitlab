// src/pages/index.tsx
"use client";

import { useEffect, useState } from "react";
import { getProjects, Project, getProjectIssues, Issue } from "../lib/gitlab";
import { useRouter } from "next/router";
import { Button, Container, Row, Col } from "reactstrap";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { parseISO, addDays } from "date-fns";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
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
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const fetchIssues = async (projectId: number) => {
    setIssuesLoading(true);
    try {
      const issuesData = await getProjectIssues(projectId);
      setIssues(issuesData);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
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
    if (issues.length === 0) {
      return [
        {
          id: "default",
          name: "No issues found",
          start: new Date(),
          end: addDays(new Date(), 1),
          progress: 0,
          type: "task",
          project: selectedProject?.name || "",
        },
      ];
    }

    return issues.map((issue) => {
      const startDate = issue.created_at
        ? parseISO(issue.created_at)
        : new Date();
      const endDate = issue.due_date
        ? parseISO(issue.due_date)
        : addDays(startDate, 7); // 7 days later if no due date

      return {
        id: issue.iid.toString(),
        name: issue.title,
        start: startDate,
        end: endDate,
        progress: 0,
        type: "task",
        project: selectedProject?.name || "",
      };
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h1>GitLab Projects</h1>
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
        <Row>
          <Col>
            <h2>Gantt Chart for {selectedProject.name}</h2>
            <Gantt
              tasks={prepareGanttData()}
              viewMode={ViewMode.Month}
              onDateChange={(task: Task, children: Task[]) => {
                console.log(task, children);
              }}
              onProgressChange={(task: Task, children: Task[]) => {
                console.log(task, children);
              }}
              onSelect={(task: Task) => console.log(task)}
            />
          </Col>
        </Row>
      )}
      {issuesLoading && <div>Loading issues...</div>}
    </Container>
  );
}
