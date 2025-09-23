"use client";

import NumbersIcon from "@mui/icons-material/Numbers";
import type { ReactNode } from "react";
import { Stack, Chip, type ChipProps } from "@mui/material";

export type SearchTagListProps = {
  tags: string[];
  chipProps?: ChipProps;
  emptyFallback?: ReactNode;
  onTagDelete?: (tag: string) => void;
  disableDefaultIcon?: boolean;
};

export function SearchTagList({
  tags,
  chipProps,
  emptyFallback,
  onTagDelete,
  disableDefaultIcon = false,
}: SearchTagListProps) {
  if (tags.length === 0) {
    return emptyFallback ?? null;
  }

  const { sx: chipSx, icon, onDelete: chipOnDelete, ...restChipProps } = chipProps ?? {};

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          size="small"
          icon={disableDefaultIcon ? icon : (icon ?? <NumbersIcon fontSize="small" />)}
          label={tag}
          {...restChipProps}
          sx={{
            fontFamily: 'var(--font-geist-mono, "Roboto Mono", monospace)',
            ...chipSx,
          }}
          onDelete={onTagDelete ? () => onTagDelete(tag) : chipOnDelete}
        />
      ))}
    </Stack>
  );
}
