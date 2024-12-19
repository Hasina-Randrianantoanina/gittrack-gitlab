import React, { FC } from "react";
import { useLegendContext } from "../context/LegendContext";

const Legend: FC = () => {
  const { activeStates, setActiveStates } = useLegendContext();
  const defaultColors = {
    "En retard": "#ff0000",
    "À faire": "#c1c5c9",
    "En cours": "#0D6EFD",
    Progression: "#008040",
  };
  const feminineLabels = ["Progression"];

  const handleClick = (
    label: "En retard" | "À faire" | "En cours" | "Progression"
  ) => {
    setActiveStates((prevStates) => ({
      ...prevStates,
      [label]: !prevStates[label],
    }));
  };

  const getBackgroundColor = (
    label: "En retard" | "À faire" | "En cours" | "Progression"
  ) => {
    return activeStates[label] ? defaultColors[label] : "#444444";
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: "20px 0",
      }}
    >
      {["En retard", "À faire", "En cours", "Progression"].map((label) => (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: getBackgroundColor(
                label as "En retard" | "À faire" | "En cours" | "Progression"
              ),
              marginRight: "8px",
              cursor: "pointer",
            }}
            onClick={() =>
              handleClick(
                label as "En retard" | "À faire" | "En cours" | "Progression"
              )
            }
          ></div>
          <span>
            {label}{" "}
            {!activeStates[
              label as "En retard" | "À faire" | "En cours" | "Progression"
            ] && (
              <em>
                (
                {feminineLabels.includes(
                  label as "En retard" | "À faire" | "En cours" | "Progression"
                )
                  ? "désactivée"
                  : "désactivé"}
                )
              </em>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
