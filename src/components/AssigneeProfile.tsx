import React, { FC } from "react";
import Image from "next/image";

interface AssigneeProfileProps {
  assignee?: { name: string; avatar_url: string };
}

const AssigneeProfile: FC<AssigneeProfileProps> = ({ assignee }) => {
  if (!assignee) return <div>Non assigné</div>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src={assignee.avatar_url}
        alt={assignee.name}
        width={24}
        height={24}
        style={{ borderRadius: "50%", marginRight: 8 }}
      />
      <span>{assignee.name}</span>
    </div>
  );
};

export default AssigneeProfile;
