import React from "react";
import { Table, Input } from "reactstrap";
import { Issue } from "../lib/gitlab";

interface IssuesTableProps {
  issues: Issue[];
  titleFilter: string;
  stateFilter: string;
  assigneeFilter: string;
  labelFilter: string;
  setTitleFilter: (value: string) => void;
  setStateFilter: (value: string) => void;
  setAssigneeFilter: (value: string) => void;
  setLabelFilter: (value: string) => void;
}

const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  titleFilter,
  stateFilter,
  assigneeFilter,
  labelFilter,
  setTitleFilter,
  setStateFilter,
  setAssigneeFilter,
  setLabelFilter,
}) => {
  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      issue.state.toLowerCase().includes(stateFilter.toLowerCase()) &&
      (issue.assignee?.name.toLowerCase() || "").includes(
        assigneeFilter.toLowerCase()
      ) &&
      issue.labels.some((label) =>
        label.toLowerCase().includes(labelFilter.toLowerCase())
      )
  );

  return (
    <div className="table-responsive">
      {issues.length > 0 ? (
        <Table striped bordered hover>
          <thead className="table-header">
            <tr>
              <th className="text-center">
                Titre
                <Input
                  type="text"
                  placeholder="Filtrer"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="filter-input mt-2"
                />
              </th>
              <th className="text-center">
                État
                <Input
                  type="text"
                  placeholder="Filtrer"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="filter-input mt-2"
                />
              </th>
              <th className="text-center">
                Assigné à
                <Input
                  type="text"
                  placeholder="Filtrer"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="filter-input mt-2"
                />
              </th>
              <th className="text-center align-middle">Date de création</th>
              <th className="text-center align-middle">
                Date d`&apos;échéance
              </th>
              <th className="text-center align-middle">Temps estimé</th>
              <th className="text-center align-middle">Temps passé</th>
              <th className="text-center align-middle">Écart de temps</th>
              <th className="text-center align-middle">% de temps réalisé</th>
              <th className="text-center">
                Étiquettes
                <Input
                  type="text"
                  placeholder="Filtrer"
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  className="filter-input mt-2"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => {
              const timeEstimate = issue.time_stats.time_estimate;
              const timeSpent = issue.time_stats.total_time_spent;
              const percentComplete =
                timeEstimate > 0
                  ? Math.min(100, (timeSpent / timeEstimate) * 100)
                  : 0;

              return (
                <tr key={issue.id}>
                  <td>{issue.title}</td>
                  <td>
                    {issue.state === "opened"
                      ? "Ouverte"
                      : issue.state === "closed"
                      ? "Fermée"
                      : issue.state}
                  </td>
                  <td>{issue.assignee?.name || "Non assigné"}</td>
                  <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                  <td>
                    {issue.due_date
                      ? new Date(issue.due_date).toLocaleDateString()
                      : "Pas de date"}
                  </td>
                  <td>{(timeEstimate / 3600).toFixed(2)}h</td>
                  <td>{(timeSpent / 3600).toFixed(2)}h</td>
                  <td>{((timeEstimate - timeSpent) / 3600).toFixed(2)}h</td>
                  <td>{percentComplete.toFixed(2)}%</td>
                  <td>{issue.labels.join(", ")}</td>
                </tr>
              );
            })}
            <tr className="table-info">
              <td colSpan={5}>
                <strong>Total cumulé</strong>
              </td>
              <td>
                <strong>
                  {(
                    filteredIssues.reduce(
                      (sum, issue) => sum + issue.time_stats.time_estimate,
                      0
                    ) / 3600
                  ).toFixed(2)}
                  h
                </strong>
              </td>
              <td>
                <strong>
                  {(
                    filteredIssues.reduce(
                      (sum, issue) => sum + issue.time_stats.total_time_spent,
                      0
                    ) / 3600
                  ).toFixed(2)}
                  h
                </strong>
              </td>
              <td>
                <strong>
                  {(
                    (filteredIssues.reduce(
                      (sum, issue) => sum + issue.time_stats.time_estimate,
                      0
                    ) -
                      filteredIssues.reduce(
                        (sum, issue) => sum + issue.time_stats.total_time_spent,
                        0
                      )) /
                    3600
                  ).toFixed(2)}
                  h
                </strong>
              </td>
              <td>
                <strong>
                  {(
                    filteredIssues.reduce(
                      (sum, issue) =>
                        sum +
                        (issue.time_stats.time_estimate > 0
                          ? Math.min(
                              100,
                              (issue.time_stats.total_time_spent /
                                issue.time_stats.time_estimate) *
                                100
                            )
                          : 0),
                      0
                    ) / filteredIssues.length
                  ).toFixed(2)}
                  %
                </strong>
              </td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p>Aucun problème trouvé pour ce projet.</p>
      )}
    </div>
  );
};

export default IssuesTable;
