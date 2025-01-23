// components/DateRangeFilter.tsx
import React from "react";
import { FormGroup, Label, Input, Button } from "reactstrap";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  clearDates: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  clearDates,
}) => {
  return (
    <div>
      <FormGroup>
        <Label for="startDate">Date de début</Label>
        <Input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label for="endDate">Date de fin</Label>
        <Input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </FormGroup>
      <Button color="secondary" onClick={clearDates}>
        Réinitialiser les dates
      </Button>
    </div>
  );
};

export default DateRangeFilter;
