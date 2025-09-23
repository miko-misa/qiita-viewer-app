"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Container, Stack, Typography } from "@mui/material";

import {
  type SearchResultItem,
  SearchButton,
  SearchInput,
  SearchResultList,
} from "@/components/search";

const dummyResults: SearchResultItem[] = [
  {
    id: "1",
    title: "Next.jsとQiita APIで検索アプリを作る",
    url: "https://qiita.com/articles/1",
    author: "frontend_dev",
    likesCount: 24,
    tags: ["nextjs", "qiita", "api"],
    createdAt: "2024-10-15T10:00:00+09:00",
    summary:
      "Qiita API v2を活用してNext.js App Routerで検索アプリを構築する手順をまとめました。",
  },
  {
    id: "2",
    title: "React QueryでQiita記事を快適に取得",
    url: "https://qiita.com/articles/2",
    author: "react_fan",
    likesCount: 18,
    tags: ["react-query", "typescript"],
    createdAt: "2024-09-28T08:30:00+09:00",
    summary:
      "データ取得の状態管理にReact Queryを導入し、キャッシュとエラーハンドリングを最適化する方法を紹介します。",
  },
  {
    id: "3",
    title: "MUIで作る使いやすい検索フォーム",
    url: "https://qiita.com/articles/3",
    author: "mui_master",
    likesCount: 12,
    tags: ["mui", "ui", "design"],
    createdAt: "2024-08-05T14:45:00+09:00",
    summary:
      "MUIコンポーネントを組み合わせて、アクセシブルでレスポンシブな検索フォームを構築するポイントを整理しました。",
  },
];

export default function Home() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, md: 8 },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={{ xs: 4, md: 6 }} alignItems="center" width="100%">
        <Stack
          component="form"
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="center"
          sx={{ width: "100%", maxWidth: 720, mx: "auto" }}
        >
          <SearchInput />
          <SearchButton
            startIcon={<SearchIcon />}
            size="large"
            sx={{
              minWidth: { sm: 140 },
              alignSelf: { xs: "stretch", sm: "center" },
            }}
          />
        </Stack>

        <Stack
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: 960, lg: 1100 },
            mx: "auto",
          }}
        >
          <Typography variant="h6" component="h2">
            検索結果
          </Typography>
          <SearchResultList items={dummyResults} />
        </Stack>
      </Stack>
    </Container>
  );
}
