// src/pages/index.tsx
"use client"; // Indique que ce composant est un composant client

import { useEffect, useState } from "react";
import { getProjects, Project } from "../lib/gitlab"; // Assurez-vous que ce chemin est correct

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My GitLab Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <a
                href={project.web_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
