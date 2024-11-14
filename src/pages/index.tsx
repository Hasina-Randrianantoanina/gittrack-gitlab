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
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
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
        <Row style={{ flexGrow: 1 }}>
          <Col>
            <h2>Gantt Chart for {selectedProject.name}</h2>
            <div style={{ overflowX: "auto", width: "100%" }}>
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
                ganttHeight={1000} // Set the height of the Gantt chart
                columnWidth={350} // Increase column width
                listCellWidth="500px" // Set the width of the task list
                rowHeight={50} // Increase row height
                barFill={80} // Percentage of the bar height
                barProgressColor="#007bff" // Color for the progress part of the bar
                barBackgroundColor="#E0E0E0" // Background color for the non-progress part of the bar
                handleWidth={10} // Width of the progress handle
                todayColor="rgba(252, 248, 227, 0.5)" // Highlight color for today's date
                projectProgressColor="#ff9e0d" // Color for project progress
                progressBarCornerRadius={4} // Rounded corners for progress bars
                rtl={false} // Set to true for right-to-left languages
              />
            </div>
          </Col>
        </Row>
      )}
      {issuesLoading && <div>Loading issues...</div>}
    </Container>
  );
}
