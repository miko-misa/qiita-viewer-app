"use client";

import { Box, Link as MuiLink } from "@mui/material";

export type TableOfContentsHeading = {
  level: number;
  text: string;
  slug: string;
};

type ArticleTableOfContentsProps = {
  headings: TableOfContentsHeading[];
  currentSlug: string | null;
  onSelect: (slug: string) => void;
};

export function ArticleTableOfContents({
  headings,
  currentSlug,
  onSelect,
}: ArticleTableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: "none", lg: "block" },
        position: "sticky",
        top: 96,
        maxHeight: "calc(100vh - 140px)",
        overflowY: "hidden",
        pr: 1,
        alignSelf: "start",
      }}
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          position: "relative",
          pl: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            left: "15px",
            top: "12px",
            bottom: "12px",
            width: "1.5px",
            backgroundColor: (theme) => theme.palette.grey[400],
          },
        }}
      >
        {headings.map((heading) => {
          const isActive =
            currentSlug === heading.slug || currentSlug === `user-content-${heading.slug}`;

          return (
            <Box key={heading.slug} component="li" sx={{ position: "relative", mb: 1 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: "0px",
                  top: heading.level === 1 ? "7.5px" : "9.5px",
                  width: heading.level === 1 ? "11px" : "7px",
                  height: heading.level === 1 ? "11px" : "7px",
                  borderRadius: "50%",
                  backgroundColor: (theme) =>
                    isActive ? theme.palette.primary.main : theme.palette.grey[400],
                  border: (theme) => `1.5px solid ${theme.palette.grey[50]}`,
                  transform: heading.level === 1 ? "translateX(-5.5px)" : "translateX(-3.5px)",
                  transition: "all 0.2s ease",
                  zIndex: 1,
                }}
              />
              <MuiLink
                component="button"
                type="button"
                aria-current={isActive ? "true" : undefined}
                variant="body2"
                color="text.secondary"
                underline="none"
                sx={{
                  display: "block",
                  py: 0.5,
                  pl: 2,
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  color: (theme) =>
                    isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  fontWeight: isActive ? 600 : 400,
                }}
                onClick={() => onSelect(heading.slug)}
              >
                {heading.text}
              </MuiLink>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
