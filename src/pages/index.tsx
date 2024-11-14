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
    width: 0,
    height: 0,
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

  if (loading) return <div>Loading...</div>;

  return (
    <Container
      fluid
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
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
        <Row style={{ flexGrow: 1, marginTop: "20px" }}>
          <Col>
            <h2>Gantt Chart for {selectedProject.name}</h2>
            <div
              style={{
                overflowX: "auto",
                width: "100%",
                height: "calc(100vh - 200px)",
              }}
            >
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
                ganttHeight={windowDimensions.height * 0.7}
                columnWidth={Math.max(250, windowDimensions.width * 0.1)}
                listCellWidth={Math.max(300, windowDimensions.width * 0.2)}
                rowHeight={50}
                barFill={80}
                barProgressColor="#007bff"
                barBackgroundColor="#E0E0E0"
                handleWidth={10}
                todayColor="rgba(252, 248, 227, 0.5)"
                projectProgressColor="#ff9e0d"
                progressBarCornerRadius={4}
                rtl={false}
              />
            </div>
          </Col>
        </Row>
      )}
      {issuesLoading && <div>Loading issues...</div>}
    </Container>
  );
}
