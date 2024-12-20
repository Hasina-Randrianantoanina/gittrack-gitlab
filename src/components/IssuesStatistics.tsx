import React from "react";
import { Table } from "reactstrap";
import { IssuesStatistics } from "../lib/gitlab";

interface IssuesStatisticsProps {
  issuesStatistics: IssuesStatistics | null;
}

const IssuesStatisticsTable: React.FC<IssuesStatisticsProps> = ({
  issuesStatistics,
}) => {
  if (!issuesStatistics) return null;

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Total</th>
            <th>Ouverts</th>
            <th>Fermés</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{issuesStatistics.total_count}</td>
            <td>{issuesStatistics.opened_count}</td>
            <td>{issuesStatistics.closed_count}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default IssuesStatisticsTable;
