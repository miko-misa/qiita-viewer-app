"use client";

import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageHeroProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  maxWidth?: number | string;
  spacing?: number;
};

export function PageHero({
  title,
  description,
  actions,
  children,
  align = "center",
  maxWidth = 840,
  spacing = 2,
}: PageHeroProps) {
  const alignItems = align === "center" ? "center" : "flex-start";
  const textAlign = align === "center" ? "center" : "left";

  return (
    <Stack spacing={spacing} sx={{ width: "100%", maxWidth, mx: "auto", alignItems, textAlign }}>
      {typeof title === "string" ? (
        <Typography variant="h4" component="h1" sx={{ wordBreak: "break-word" }}>
          {title}
        </Typography>
      ) : (
        title
      )}

      {description ? (
        typeof description === "string" ? (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        ) : (
          description
        )
      ) : null}

      {actions ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={align === "center" ? "center" : "flex-start"}
          sx={{ width: "100%" }}
        >
          {actions}
        </Stack>
      ) : null}

      {children ? <Box sx={{ width: "100%" }}>{children}</Box> : null}
    </Stack>
  );
}
