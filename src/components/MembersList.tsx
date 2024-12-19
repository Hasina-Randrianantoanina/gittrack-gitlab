import React, { FC } from "react";
import { ProjectMember } from "../lib/gitlab";
import { Issue } from "../lib/gitlab";

interface MembersListProps {
  projectMembers: ProjectMember[];
  issues: Issue[];
  selectedProjectId: number | null;
}

const MembersList: FC<MembersListProps> = ({
  projectMembers,
  issues,
  selectedProjectId,
}) => {
  const isActiveMember = (member: ProjectMember) => {
    const isAssigned = issues.some((issue) =>
      issue.assignees.some((assignee) => assignee.id === member.id)
    );
    const isOwnerOrCreator =
      member.access_level === 50 || selectedProjectId === member.id;
    return isAssigned || isOwnerOrCreator;
  };

  const getRole = (accessLevel: number): string => {
    switch (accessLevel) {
      case 10:
        return "Guest";
      case 20:
        return "Reporter";
      case 30:
        return "Developer";
      case 40:
        return "Maintainer";
      case 50:
        return "Owner";
      default:
        return "Unknown";
    }
  };

  return (
    <div>
      <h3>Membres du projet</h3>
      <ul>
        {projectMembers.map((member) => (
          <li
            key={member.id}
            className={isActiveMember(member) ? "" : "inactive"}
          >
            {member.name} - {getRole(member.access_level)}
            {selectedProjectId === member.id && " (Créateur)"}
          </li>
        ))}
      </ul>
      <style jsx>{`
        .inactive {
          color: gray;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default MembersList;
