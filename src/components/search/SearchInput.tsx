"use client";

import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";

export type SearchInputProps = TextFieldProps;

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((props, ref) => {
  const {
    label = "キーワード",
    variant = "outlined",
    fullWidth = true,
    placeholder = "Qiita記事を検索",
    ...rest
  } = props;

  return (
    <TextField
      {...rest}
      inputRef={ref}
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      placeholder={placeholder}
    />
  );
});

SearchInput.displayName = "SearchInput";
