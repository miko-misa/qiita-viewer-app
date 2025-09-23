"use client";

import { Button, type ButtonProps } from "@mui/material";

export type SearchButtonProps = ButtonProps;

export function SearchButton(props: SearchButtonProps) {
  const { children = "検索", variant = "contained", type = "submit", ...rest } = props;

  return (
    <Button {...rest} variant={variant} type={type}>
      {children}
    </Button>
  );
}
