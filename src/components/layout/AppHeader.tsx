"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import type { AppBarProps } from "@mui/material";
import type { ReactNode } from "react";

export type AppHeaderProps = {
  title?: string;
  onClickSettings?: () => void;
  settingsTooltip?: ReactNode;
  position?: AppBarProps["position"];
  onClickBack?: () => void;
  backTooltip?: ReactNode;
};

export function AppHeader({
  title = "Qiita Viewer App",
  onClickSettings,
  settingsTooltip = "設定",
  position = "sticky",
  onClickBack,
  backTooltip = "戻る",
}: AppHeaderProps) {
  return (
    <AppBar position={position} color="primary" enableColorOnDark>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
          {onClickBack ? (
            <Tooltip title={backTooltip}>
              <IconButton color="inherit" aria-label="戻る" onClick={onClickBack} edge="start">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          ) : null}
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {onClickSettings ? (
          <Tooltip title={settingsTooltip}>
            <IconButton color="inherit" aria-label="設定" onClick={onClickSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
