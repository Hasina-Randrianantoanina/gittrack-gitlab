// src/pages/index.tsx
"use client";

import { useEffect, useState } from "react";
import { getProjects, Project, getProjectIssues, Issue } from "../lib/gitlab";
import { useRouter } from "next/router";
import { Button, Container, Row, Col } from "reactstrap";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { parseISO, addDays, isAfter } from "date-fns";

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
          styles: { backgroundColor: "#E0E0E0" },
        },
      ];
    }

    return issues.map((issue) => {
      const startDate = issue.created_at
        ? parseISO(issue.created_at)
        : new Date();
      const endDate = issue.due_date
        ? parseISO(issue.due_date)
        : addDays(startDate, 7);

      const isOverdue =
        isAfter(new Date(), endDate) && issue.state !== "closed";
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Container fluid className="vh-100 d-flex flex-column p-3">
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
        <Row className="flex-grow-1">
          <Col>
            <h2 className="h3 mb-3">Gantt Chart for {selectedProject.name}</h2>
            <div className="gantt-container">
              <Gantt
                tasks={prepareGanttData()}
                viewMode={
                  windowDimensions.width < 768 ? ViewMode.Day : ViewMode.Month
                }
                onDateChange={(task: Task, children: Task[]) => {
                  console.log(task, children);
                }}
                onProgressChange={(task: Task, children: Task[]) => {
                  console.log(task, children);
                }}
                onSelect={(task: Task) => console.log(task)}
                ganttHeight={windowDimensions.height * 0.6}
                columnWidth={
                  windowDimensions.width < 768
                    ? 50
                    : Math.max(200, windowDimensions.width * 0.08)
                }
                listCellWidth={`${Math.max(
                  200,
                  windowDimensions.width * 0.2
                )}px`}
                rowHeight={40}
                barFill={80}
                barProgressColor="#007bff"
                barBackgroundColor="#E0E0E0"
                handleWidth={8}
                todayColor="rgba(252, 248, 227, 0.5)"
                projectProgressColor="#ff9e0d"
                rtl={false}
              />
            </div>
          </Col>
        </Row>
      )}
      {issuesLoading && <div className="loading">Loading issues...</div>}
    </Container>
  );
}
