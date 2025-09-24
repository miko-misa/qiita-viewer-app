"use client";

import SettingsIcon from "@mui/icons-material/Settings";
import { AppBar, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import type { AppBarProps } from "@mui/material";
import type { ReactNode } from "react";

export type AppHeaderProps = {
  title?: string;
  onClickSettings?: () => void;
  settingsTooltip?: ReactNode;
  position?: AppBarProps["position"];
};

export function AppHeader({
  title = "Qiita Viewer App",
  onClickSettings,
  settingsTooltip = "設定",
  position = "sticky",
}: AppHeaderProps) {
  return (
    <AppBar position={position} color="primary" enableColorOnDark>
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
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
