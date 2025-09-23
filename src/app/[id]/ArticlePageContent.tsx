"use client";

import { useMemo } from "react";

import DOMPurify from "dompurify";
import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Container, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import type { QiitaItem } from "@/features/search/api/qiita";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchTagList } from "@/components/search";
import { formatAuthor } from "@/utils/format";

export type ArticlePageContentProps = {
  item: QiitaItem;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function ArticlePageContent({ item }: ArticlePageContentProps) {
  const sanitizedBody = useMemo(() => DOMPurify.sanitize(item.body ?? ""), [item.body]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <AppHeader title="Qiita Viewer App" />
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          py: { xs: 4, md: 6 },
        }}
      >
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Typography variant="h4" component="h1" sx={{ wordBreak: "break-word" }}>
              {item.title}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.5, sm: 1.5 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexWrap="wrap"
            >
              <Typography variant="body2" color="text.secondary">
                {formatAuthor(item.user)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(item.created_at)}
              </Typography>
              <MuiLink
                component={NextLink}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                alignItems="center"
                gap={0.5}
                variant="body2"
              >
                Qiitaで開く
                <LaunchIcon fontSize="inherit" />
              </MuiLink>
            </Stack>

            <SearchTagList tags={item.tags.map((tag) => tag.name)} />
          </Stack>

          <Paper
            elevation={0}
            sx={{
              typography: "body1",
              px: { xs: 2, sm: 3 },
              py: { xs: 2.5, sm: 3 },
              wordBreak: "break-word",
              backgroundColor: "background.paper",
              "& pre": {
                whiteSpace: "pre-wrap",
                backgroundColor: (theme) => theme.palette.grey[100],
                borderRadius: 1,
                p: 2,
                overflowX: "auto",
              },
              "& code": {
                fontFamily: 'var(--font-geist-mono, "Roboto Mono", monospace)',
                backgroundColor: (theme) => theme.palette.grey[200],
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
              },
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </Stack>
      </Container>
    </Box>
  );
}
