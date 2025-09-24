"use client";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import LaunchIcon from "@mui/icons-material/Launch";
import { Link as MuiLink, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { SearchTagList } from "@/components/search/SearchTagList";
import type { QiitaItem } from "@/features/search/api/qiita";
import { formatAuthor } from "@/utils/format";

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

type ArticleHeaderProps = {
  item: QiitaItem;
};

export function ArticleHeader({ item }: ArticleHeaderProps) {
  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 840, mx: "auto" }}>
      <Typography variant="h4" component="h1" sx={{ wordBreak: "break-word" }}>
        {item.title}
      </Typography>

      <Stack spacing={1.5} sx={{ width: "100%" }}>
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

        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ color: "text.secondary" }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FavoriteBorderIcon fontSize="small" color="error" />
            <Typography variant="body2" color="text.secondary">
              {item.likes_count}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <BookmarkBorderIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {item.stocks_count}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <SearchTagList tags={item.tags.map((tag) => tag.name)} />
    </Stack>
  );
}

