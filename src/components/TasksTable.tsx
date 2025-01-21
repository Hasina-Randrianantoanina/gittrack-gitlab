// components/TasksTable.tsx
import React from "react";
import { Table, Button } from "reactstrap";
import { Issue, Project, ProjectMember } from "../lib/gitlab";
import * as XLSX from "xlsx";

interface TasksTableProps {
  issues: Issue[];
  projectMembers: ProjectMember[];
  projects: Project[];
  startDate: string;
  endDate: string;
}

const TasksTable: React.FC<TasksTableProps> = ({
  issues,
  projectMembers,
  projects,
  startDate,
  endDate,
}) => {
  const filterIssuesByDateRange = (issue: Issue) => {
    const issueDate = new Date(issue.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return issueDate >= start && issueDate <= end;
  };

  const filteredIssues = issues.filter(filterIssuesByDateRange);

  const exportToExcel = () => {
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

  return (
    <div className="table-responsive">
      <Button color="primary" onClick={exportToExcel} className="mb-3">
        Exporter en Excel
      </Button>
      {filteredIssues.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tâche</th>
              <th>Assigné à</th>
              <th>Projet</th>
              <th>Date de création</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => {
              const project = projects.find((p) => p.id === issue.project_id);
              const assignee = issue.assignees.length
                ? projectMembers.find((m) => m.id === issue.assignees[0].id)
                : null;
              return (
                <tr key={issue.id}>
                  <td>{issue.title}</td>
                  <td>{assignee ? assignee.name : "Non assigné"}</td>
                  <td>{project ? project.name : "Projet inconnu"}</td>
                  <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>Aucune tâche trouvée pour cette plage de dates.</p>
      )}
    </div>
  );
};

export default TasksTable;
