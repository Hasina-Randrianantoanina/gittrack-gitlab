// components/DateRangeFilter.tsx
import React from "react";
import { FormGroup, Label, Input } from "reactstrap";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
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
    </div>
  );
};

export default DateRangeFilter;
