"use client";

import { useMemo } from "react";

import DOMPurify from "dompurify";
import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Chip, Container, Link as MuiLink, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import type { QiitaItem } from "@/features/search/api/qiita";

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
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Stack spacing={1.5}>
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
              著者: {item.user?.name ?? item.user?.id ?? "不明"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              投稿日: {formatDateTime(item.created_at)}
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
          {item.tags.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {item.tags.map((tag) => (
                <Chip key={tag.name} label={`#${tag.name}`} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : null}
        </Stack>

        <Box
          sx={{
            typography: "body1",
            wordBreak: "break-word",
            "& pre": {
              whiteSpace: "pre-wrap",
              backgroundColor: (theme) => theme.palette.grey[100],
              borderRadius: 1,
              p: 2,
            },
            "& code": {
              fontFamily: "monospace",
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
  );
}
