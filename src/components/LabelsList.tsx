import React from "react";

interface Label {
  id: number;
  name: string;
}

interface LabelsListProps {
  labels: Label[];
}

const LabelsList: React.FC<LabelsListProps> = ({ labels }) => {
  return (
    <ul className="list-unstyled">
      {labels.length > 0 ? (
        labels.map((label) => <li key={label.id}>{label.name}</li>)
      ) : (
        <p>Aucun label trouvé.</p>
      )}
    </ul>
  );
};

export default LabelsList;
