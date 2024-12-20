import React from "react";
import { Project } from "../lib/gitlab";

interface ProjectDetailsProps {
  projectDetails: Project | null;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectDetails }) => {
  if (!projectDetails) return null;

  return (
    <>
      <h2 className="h5">
        Détails du Projet : <strong>{projectDetails.name}</strong>
      </h2>
      <p>
        <strong>Description :</strong> {projectDetails.description}
      </p>
      <p>
        <strong>Créé le :</strong>{" "}
        {projectDetails.created_at
          ? new Date(projectDetails.created_at).toLocaleDateString()
          : "Date inconnue"}
      </p>
    </>
  );
};

export default ProjectDetails;
