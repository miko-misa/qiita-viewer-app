"use client";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Box, List, ListItem, ListItemButton, Stack, Typography } from "@mui/material";

import { SearchTagList } from "./SearchTagList";

export type SearchResultItem = {
  id: string;
  title: string;
  url: string;
  author: string;
  likesCount: number;
  tags: string[];
  createdAt: string;
  summary?: string;
};

export type SearchResultListProps = {
  items: SearchResultItem[];
  emptyMessage?: string;
  onSelect?: (item: SearchResultItem) => void;
};

const formatDate = (value: string) => {
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

export function SearchResultList({
  items,
  emptyMessage = "検索結果がありません",
  onSelect,
}: SearchResultListProps) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {items.map((item) => {
        const actionProps = onSelect
          ? { component: "div" as const, onClick: () => onSelect(item) }
          : {
              component: "a" as const,
              href: item.url,
              target: "_blank",
              rel: "noopener noreferrer",
            };

        return (
          <ListItem key={item.id} disableGutters disablePadding>
            <ListItemButton
              {...actionProps}
              alignItems="flex-start"
              sx={{
                alignItems: "stretch",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.5, sm: 2 },
              }}
            >
              <Stack spacing={1.5} width="100%">
                <Box
                  display="flex"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ flexGrow: 1, minWidth: 200 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    投稿者: {item.author}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ marginLeft: { xs: 0, sm: "auto" } }}
                  >
                    <FavoriteBorderIcon fontSize="small" color="error" />
                    <Typography variant="body2" color="text.secondary">
                      {item.likesCount}
                    </Typography>
                  </Stack>
                </Box>

                {item.summary ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {item.summary}
                  </Typography>
                ) : null}

                <SearchTagList tags={item.tags} />

                <Typography variant="caption" color="text.secondary">
                  公開日: {formatDate(item.createdAt)}
                </Typography>
              </Stack>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
