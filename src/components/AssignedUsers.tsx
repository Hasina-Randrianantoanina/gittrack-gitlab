import React from "react";
import { Table } from "reactstrap";
import { UserInfo } from "../lib/gitlab";

interface AssignedUsersProps {
  userDetails: { [key: number]: UserInfo };
}

const AssignedUsers: React.FC<AssignedUsersProps> = ({ userDetails }) => {
  return (
    <div className="table-responsive">
      {Object.keys(userDetails).length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Nom d&apos;utilisateur</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(userDetails).map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Aucun utilisateur assigné trouvé.</p>
      )}
    </div>
  );
};

export default AssignedUsers;
