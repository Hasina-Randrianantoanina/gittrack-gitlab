import React, { FC } from "react";
import { Button, ButtonGroup, FormGroup, Label, Input } from "reactstrap";
import { ViewMode } from "gantt-task-react";

interface ViewSwitcherProps {
  onViewModeChange: (viewMode: ViewMode) => void;
  onViewListChange: (isChecked: boolean) => void;
  isChecked: boolean;
}

const ViewSwitcher: FC<ViewSwitcherProps> = ({
  onViewModeChange,
  onViewListChange,
  isChecked,
}) => {
  return (
    <div className="d-flex align-items-center mb-3">
      <ButtonGroup className="me-3">
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Day)}
          outline
        >
          Jour
        </Button>
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Week)}
          outline
        >
          Semaine
        </Button>
        <Button
          color="primary"
          onClick={() => onViewModeChange(ViewMode.Month)}
          outline
        >
          Mois
        </Button>
      </ButtonGroup>
      <FormGroup switch>
        <Input
          type="switch"
          id="taskListSwitch"
          name="taskListSwitch"
          checked={isChecked}
          onChange={() => onViewListChange(!isChecked)}
        />
        <Label check for="taskListSwitch">
          Afficher la liste des tâches
        </Label>
      </FormGroup>
    </div>
  );
};

export default ViewSwitcher;
