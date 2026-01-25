"use client";

import { useState, useEffect } from "react";

interface BirthdayInputProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
}

export function BirthdayInput({ value, onChange, disabled = false }: BirthdayInputProps) {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Parse existing value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(date.getDate().toString());
        setMonth((date.getMonth() + 1).toString());
        setYear(date.getFullYear().toString());
      }
    }
  }, [value]);

  // Update parent when values change
  useEffect(() => {
    if (day && month && year) {
      const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        onChange(dateStr);
      }
    }
  }, [day, month, year, onChange]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="flex gap-2">
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        disabled={disabled}
        className="w-20 rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
      >
        <option value="">Day</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        disabled={disabled}
        className="w-32 rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
      >
        <option value="">Month</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        disabled={disabled}
        className="w-24 rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
