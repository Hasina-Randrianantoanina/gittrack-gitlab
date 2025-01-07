// components/NotificationBell.tsx
import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { FaBell } from "react-icons/fa";

interface NotificationBellProps {
  notifications: string[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle tag="button" className="btn btn-light">
        <FaBell />
        {notifications.length > 0 && (
          <span className="badge bg-danger ms-2">{notifications.length}</span>
        )}
      </DropdownToggle>
      <DropdownMenu>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <DropdownItem key={index}>{notification}</DropdownItem>
          ))
        ) : (
          <DropdownItem>Aucune notification</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationBell;
