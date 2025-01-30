// components/TasksOverview.tsx
import React from "react";
import { Table, Button } from "reactstrap";
import { Issue, Project, ProjectMember } from "../lib/gitlab";
import * as XLSX from "xlsx";

interface TasksOverviewProps {
  issues: Issue[];
  projects: Project[];
  projectMembers: ProjectMember[];
  startDate: string;
  endDate: string;
}

const TasksOverview: React.FC<TasksOverviewProps> = ({
  issues,
  projects,
  projectMembers,
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
  console.log("Filtered Issues:", filteredIssues); // Ajout de log

  const groupedIssues = filteredIssues.reduce((acc, issue) => {
    issue.assignees.forEach((assignee) => {
      const member = projectMembers.find((m) => m.id === assignee.id);
      if (member) {
        if (!acc[member.name]) {
          acc[member.name] = [];
        }
        acc[member.name].push(issue);
      }
    });
    return acc;
  }, {} as { [key: string]: Issue[] });
  console.log("Grouped Issues:", groupedIssues); // Ajout de log

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      filteredIssues.map((issue) => ({
        Projet:
          projects.find((p) => p.id === issue.project_id)?.name ||
          "Projet inconnu",
        Tâche: issue.title,
        "Date de création": new Date(issue.created_at).toLocaleDateString(),
        "Date d'échéance": issue.due_date
          ? new Date(issue.due_date).toLocaleDateString()
          : "Pas de date",
        État: issue.state,
        "Assigné à": issue.assignees
          .map((assignee) => assignee.name)
          .join(", "),
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
      {Object.keys(groupedIssues).length > 0 ? (
        Object.keys(groupedIssues).map((memberName) => (
          <div key={memberName}>
            <h3>{memberName}</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Tâche</th>
                  <th>Date de création</th>
                  <th>Date d&apos;échéance</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {groupedIssues[memberName].map((issue) => {
                  const project = projects.find(
                    (p) => p.id === issue.project_id
                  );
                  return (
                    <tr key={issue.id}>
                      <td>{project ? project.name : "Projet inconnu"}</td>
                      <td>{issue.title}</td>
                      <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                      <td>
                        {issue.due_date
                          ? new Date(issue.due_date).toLocaleDateString()
                          : "Pas de date"}
                      </td>
                      <td>{issue.state}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ))
      ) : (
        <p>Aucune tâche trouvée pour cette plage de dates.</p>
      )}
    </div>
  );
};

export default TasksOverview;
