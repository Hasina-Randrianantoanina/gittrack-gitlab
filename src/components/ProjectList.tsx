import React from "react";
import { Table, Button } from "reactstrap";
import { Project } from "../lib/gitlab";
import { FaInfoCircle, FaEye } from "react-icons/fa";

interface ProjectListProps {
  projects: Project[];
  activeRow: number | null;
  hoveredRow: number | null;
  onRowClick: (projectId: number) => void;
  onMouseEnter: (projectId: number) => void;
  onMouseLeave: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  activeRow,
  hoveredRow,
  onRowClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>Nom du Projet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              onClick={() => onRowClick(project.id)}
              onMouseEnter={() => onMouseEnter(project.id)}
              onMouseLeave={onMouseLeave}
              style={{
                backgroundColor:
                  activeRow === project.id || hoveredRow === project.id
                    ? "#ffeb3b"
                    : "transparent",
                cursor: "pointer",
              }}
            >
              <td>{project.name}</td>
              <td>
                <Button
                  color={activeRow === project.id ? "success" : "primary"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(project.id);
                  }}
                  className="d-flex align-items-center px-2 py-1"
                >
                  {activeRow === project.id ? (
                    <>
                      <FaInfoCircle size={18} className="me-2" />
                      {project.name}
                    </>
                  ) : (
                    <>
                      <FaEye size={18} className="me-2" />
                      Voir
                    </>
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjectList;
