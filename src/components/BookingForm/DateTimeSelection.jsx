
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DateTimeSelection = ({ date, setDate, time, setTime }) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={today}
          required
        />
      </div>
      <div>
        <Label htmlFor="time">Time</Label>
        <Select
          value={time}
          onValueChange={setTime}
          required
        >
          <SelectTrigger id="time">
            <SelectValue placeholder="Select a time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="08:00">8:00 AM</SelectItem>
            <SelectItem value="09:00">9:00 AM</SelectItem>
            <SelectItem value="10:00">10:00 AM</SelectItem>
            <SelectItem value="11:00">11:00 AM</SelectItem>
            <SelectItem value="12:00">12:00 PM</SelectItem>
            <SelectItem value="13:00">1:00 PM</SelectItem>
            <SelectItem value="14:00">2:00 PM</SelectItem>
            <SelectItem value="15:00">3:00 PM</SelectItem>
            <SelectItem value="16:00">4:00 PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DateTimeSelection;
  