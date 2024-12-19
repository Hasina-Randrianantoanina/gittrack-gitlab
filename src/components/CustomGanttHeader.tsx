import React, { FC } from "react";

interface CustomGanttHeaderProps {
  headerHeight: number;
  rowWidth: string;
}

const CustomGanttHeader: FC<CustomGanttHeaderProps> = ({
  headerHeight,
  rowWidth,
}) => {
  return (
    <div
      className="custom-gantt-header"
      style={{ height: headerHeight, display: "flex", alignItems: "center" }}
    >
      <div style={{ width: rowWidth, textAlign: "center" }}>Tâche</div>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: "150px", textAlign: "center" }}>Début</div>
        <div style={{ width: "150px", textAlign: "center" }}>Fin</div>
        <div style={{ width: "200px", textAlign: "center" }}>
          Personne en charge
        </div>
      </div>
    </div>
  );
};

export default CustomGanttHeader;
