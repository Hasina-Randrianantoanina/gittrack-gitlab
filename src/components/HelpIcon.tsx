import React, { useState } from "react";
import { FaQuestion } from "react-icons/fa"; // Change the icon here
import { useRouter } from "next/router";
import { Tooltip } from "reactstrap";

interface HelpIconProps {
  size?: number;
  color?: string;
}

const HelpIcon: React.FC<HelpIconProps> = ({
  size = 16,
  color = "#000",
}) => {
  const router = useRouter();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push("/help");
  };

  const toggleTooltip = () => {
    setTooltipOpen(!tooltipOpen);
  };

  return (
    <div
      className="btn btn-light"
      onClick={handleClick}
      id="helpIcon"
      onMouseEnter={() => {
        setIsHovered(true);
        toggleTooltip();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        toggleTooltip();
      }}
    >
      <FaQuestion size={size} color={color} /> {/* Use the new icon here */}
      <Tooltip
        placement="bottom"
        isOpen={tooltipOpen}
        target="helpIcon"
        toggle={toggleTooltip}
      >
        Centre d&apos;aide
      </Tooltip>
    </div>
  );
};

export default HelpIcon;
