import React from "react";
import { Table } from "reactstrap";
import { Event } from "../lib/gitlab";

interface ActivityHistoryProps {
  events: Event[];
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ events }) => {
  return (
    <div className="table-responsive">
      {events.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Auteur</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.created_at).toLocaleDateString()}</td>
                <td>{event.action_name}</td>
                <td>{event.author?.name || "Inconnu"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Aucune activité trouvée.</p>
      )}
    </div>
  );
};

export default ActivityHistory;
