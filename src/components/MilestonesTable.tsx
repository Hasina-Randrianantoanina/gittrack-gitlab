import React from "react";
import { Table } from "reactstrap";
import { Milestone } from "../lib/gitlab";

interface MilestonesTableProps {
  milestones: Milestone[];
}

const MilestonesTable: React.FC<MilestonesTableProps> = ({ milestones }) => {
  return (
    <div className="table-responsive">
      {milestones.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date d&apos;échéance</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((milestone) => (
              <tr key={milestone.id}>
                <td>{milestone.title}</td>
                <td>
                  {milestone.due_date
                    ? new Date(milestone.due_date).toLocaleDateString()
                    : "Date inconnue"}
                </td>
                <td>{milestone.state}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Aucun jalon trouvé.</p>
      )}
    </div>
  );
};

export default MilestonesTable;
