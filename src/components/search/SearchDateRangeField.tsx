"use client";

import { Stack, TextField, Typography } from "@mui/material";

export type DateRangeValue = {
  from: string;
  to: string;
};

export type SearchDateRangeFieldProps = {
  label: string;
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
};

export function SearchDateRangeField({ label, value, onChange }: SearchDateRangeFieldProps) {
  const handleChange =
    (key: keyof DateRangeValue) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: event.target.value });
    };

  return (
    <Stack spacing={1} width="100%">
      <Typography variant="subtitle2" component="h3">
        {label}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="開始日"
          type="date"
          value={value.from}
          onChange={handleChange("from")}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="終了日"
          type="date"
          value={value.to}
          onChange={handleChange("to")}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Stack>
    </Stack>
  );
}
