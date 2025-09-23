"use client";

import { type ReactNode, useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";

import {
  SearchButton,
  SearchInput,
  SearchResultList,
  type SearchResultItem,
} from "@/components/search";
import {
  fetchQiitaItems,
  qiitaApiConstants,
  type QiitaItem,
} from "@/features/search/api/qiita";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchDetailDialog } from "@/components/search/SearchDetailDialog";
import {
  defaultSearchDetailSettings,
  type SearchDetailSettings,
} from "@/features/search/detailSearch";
import { qiitaSettingsState } from "@/state/qiitaSettings";

function buildSummary(body: string | undefined) {
  if (!body) {
    return undefined;
  }

  const collapsed = body.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return undefined;
  }

  return collapsed.length > 140 ? `${collapsed.slice(0, 140)}…` : collapsed;
}

export function SearchPageClient() {
  const [keywordInput, setKeywordInput] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [settings, setSettings] = useRecoilState(qiitaSettingsState);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState(settings.apiKey);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailSettings, setDetailSettings] = useState<SearchDetailSettings>(
    defaultSearchDetailSettings,
  );
  const queryClient = useQueryClient();

  const hasApiKey = settings.apiKey.trim().length > 0;
  const perPage = qiitaApiConstants.DEFAULT_PER_PAGE;

  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<QiitaItem[], Error>({
    queryKey: ["qiitaItems", activeKeyword, settings.apiKey, perPage],
    enabled: activeKeyword.length > 0 && hasApiKey,
    queryFn: ({ pageParam = 1 }) => {
      const pageNumber = typeof pageParam === "number" ? pageParam : 1;

      return fetchQiitaItems({
        keyword: activeKeyword,
        apiKey: settings.apiKey,
        page: pageNumber,
        perPage,
      });
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < perPage ? undefined : allPages.length + 1,
    staleTime: 1000 * 60,
    initialPageParam: 1,
  });

  const searchResults: SearchResultItem[] = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    return data.pages.flatMap((page) =>
      page.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        author: {
          id: item.user?.id,
          name: item.user?.name,
        },
        likesCount: item.likes_count,
        stocksCount: item.stocks_count,
        tags: item.tags.map((tag) => tag.name),
        createdAt: item.created_at,
        summary: buildSummary(item.body),
      })),
    );
  }, [data]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const trimmed = keywordInput.trim();
    if (!trimmed || !hasApiKey) {
      return;
    }

    if (trimmed === activeKeyword) {
      void queryClient.invalidateQueries({
        queryKey: ["qiitaItems", trimmed, settings.apiKey, perPage],
      });
      return;
    }

    setActiveKeyword(trimmed);
  };

  const handleOpenSettings = () => {
    setDraftApiKey(settings.apiKey);
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    setSettings({ apiKey: draftApiKey.trim() });
    setIsSettingsOpen(false);
  };

  const trimmedKeyword = keywordInput.trim();
  const hasKeyword = trimmedKeyword.length > 0;
  const canSearch = hasKeyword && hasApiKey;

  let resultsContent: ReactNode = null;

  if (!hasApiKey) {
    resultsContent = (
      <Alert severity="info">
        Qiita APIキーを設定すると検索できます。右上の歯車アイコンから設定してください。
      </Alert>
    );
  } else if (!activeKeyword) {
    resultsContent = (
      <Typography color="text.secondary" variant="body2">
        キーワードを入力して検索を開始してください。
      </Typography>
    );
  } else if (isPending) {
    resultsContent = (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress aria-label="検索中" />
      </Box>
    );
  } else if (isError) {
    resultsContent = (
      <Alert severity="error">
        {error?.message ?? "検索に失敗しました。時間を置いて再度お試しください。"}
      </Alert>
    );
  } else {
    resultsContent = (
      <Stack spacing={2}>
        <SearchResultList
          items={searchResults}
          emptyMessage="条件に合う記事が見つかりませんでした"
        />
        {hasNextPage ? (
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "読み込み中…" : `次の${perPage}件を読み込む`}
            </Button>
          </Box>
        ) : null}
        {isFetching && !isFetchingNextPage ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} aria-label="更新中" />
          </Box>
        ) : null}
      </Stack>
    );
  }

  return (
    <>
      <AppHeader
        title="Qiita Viewer App"
        onClickSettings={handleOpenSettings}
        settingsTooltip="Qiita APIキーを設定"
      />
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 4 },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" width="100%">
          <Stack
            component="form"
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "flex-start" }}
            justifyContent="center"
            sx={{ width: "100%", maxWidth: 720, mx: "auto" }}
            onSubmit={handleSubmit}
          >
            <SearchInput
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              helperText={hasApiKey ? undefined : "APIキーを設定すると検索できます"}
              sx={{ flexGrow: 1, m: 0.5 }}
            />
            <Button
              type="button"
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setIsDetailDialogOpen(true)}
              sx={{
                alignSelf: { xs: "stretch", sm: "flex-start" },
                whiteSpace: "nowrap",
                minWidth: { sm: 140 },
                px: { sm: 3 },
                height: 56,
              }}
            >
              詳細検索
            </Button>
            <Tooltip
              title={!hasApiKey ? "APIキーを設定してください" : !hasKeyword ? "キーワードを入力してください" : "検索"}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  width: { xs: "100%", sm: "auto" },
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                }}
              >
                <SearchButton
                  startIcon={<SearchIcon />}
                  size="large"
                  disabled={!canSearch}
                  fullWidth
                  sx={{
                    minWidth: { sm: 140 },
                    alignSelf: { xs: "stretch", sm: "flex-start" },
                    height: 56,
                  }}
                />
              </Box>
            </Tooltip>
          </Stack>

          <Stack
            spacing={2}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", md: 960, lg: 1100 },
              mx: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Typography variant="h6" component="h2">
              検索結果
            </Typography>
            {activeKeyword && hasApiKey && !isPending && !isError ? (
              <Typography variant="body2" color="text.secondary">
                「{activeKeyword}」の検索結果 {searchResults.length} 件（1ページ {perPage} 件）
              </Typography>
            ) : null}
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                {resultsContent}
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Container>

      <SearchDetailDialog
        open={isDetailDialogOpen}
        values={detailSettings}
        onClose={() => setIsDetailDialogOpen(false)}
        onSave={(next, query) => {
          setDetailSettings(next);
          setKeywordInput(query);
          setIsDetailDialogOpen(false);
        }}
      />

      <Dialog open={isSettingsOpen} onClose={handleCloseSettings} maxWidth="xs" fullWidth>
        <DialogTitle>Qiita APIキー</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            APIキーを設定すると検索が可能になります。Qiita で発行した個人用アクセストークンを入力してください。
          </Typography>
          <TextField
            label="APIキー"
            fullWidth
            value={draftApiKey}
            onChange={(event) => setDraftApiKey(event.target.value)}
            type="password"
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>キャンセル</Button>
          <Button onClick={handleSaveSettings} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
