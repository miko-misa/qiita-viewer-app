"use client";

import { type KeyboardEventHandler, useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TagIcon from "@mui/icons-material/Tag";
import {
  Button,
  ChipProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { SearchDateRangeField, type DateRangeValue } from "./SearchDateRangeField";
import { SearchTagList } from "./SearchTagList";
import { buildDetailQuery, type SearchDetailSettings } from "@/features/search/detailSearch";

type SearchDetailDialogProps = {
  open: boolean;
  values: SearchDetailSettings;
  onClose: () => void;
  onSave: (values: SearchDetailSettings, query: string) => void;
};

type EditableStringListProps = {
  label: string;
  description?: string;
  items: string[];
  onAdd: (value: string) => boolean;
  onRemove: (value: string) => void;
  placeholder?: string;
  chipProps?: ChipProps;
  disableDefaultIcon?: boolean;
};

function EditableStringList({
  label,
  description,
  items,
  onAdd,
  onRemove,
  placeholder,
  chipProps,
  disableDefaultIcon,
}: EditableStringListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftValue, setDraftValue] = useState("");

  const submit = () => {
    if (onAdd(draftValue)) {
      setDraftValue("");
      setIsAdding(false);
    }
  };

  const cancel = () => {
    setDraftValue("");
    setIsAdding(false);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  };

  return (
    <Stack spacing={1}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{label}</Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
        <SearchTagList
          tags={items}
          onTagDelete={onRemove}
          chipProps={chipProps}
          disableDefaultIcon={disableDefaultIcon}
          emptyFallback={
            <Typography variant="body2" color="text.secondary">
              まだ{label}がありません
            </Typography>
          }
        />
        {isAdding ? (
          <TextField
            size="small"
            autoFocus
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={() => {
              if (draftValue.trim()) {
                submit();
              } else {
                cancel();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? `${label} を追加`}
            sx={{ minWidth: 160 }}
          />
        ) : (
          <Tooltip title={`${label}を追加`}>
            <IconButton
              aria-label={`${label}を追加`}
              onClick={() => {
                setDraftValue("");
                setIsAdding(true);
              }}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}

export function SearchDetailDialog({ open, values, onClose, onSave }: SearchDetailDialogProps) {
  const [draft, setDraft] = useState<SearchDetailSettings>(values);
  const [tagInputs, setTagInputs] = useState<string[]>([]);
  const [activeTagGroup, setActiveTagGroup] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const normalizedTagGroups =
      values.tagGroups && values.tagGroups.length > 0 ? values.tagGroups : [[]];
    setDraft({
      ...values,
      tagGroups: normalizedTagGroups,
    });
    setTagInputs(normalizedTagGroups.map(() => ""));
    setActiveTagGroup(null);
  }, [open, values]);

  const addKeyword = (field: keyof SearchDetailSettings["keywords"], value: string) => {
    const next = value.trim();
    if (!next || draft.keywords[field].includes(next)) {
      return false;
    }
    setDraft((prev) => ({
      ...prev,
      keywords: {
        ...prev.keywords,
        [field]: [...prev.keywords[field], next],
      },
    }));
    return true;
  };

  const removeKeyword = (field: keyof SearchDetailSettings["keywords"], target: string) => {
    setDraft((prev) => ({
      ...prev,
      keywords: {
        ...prev.keywords,
        [field]: prev.keywords[field].filter((item) => item !== target),
      },
    }));
  };

  const addTagToGroup = (groupIndex: number, value: string) => {
    const next = value.trim();
    if (!next || draft.tagGroups[groupIndex]?.includes(next)) {
      return false;
    }
    setDraft((prev) => ({
      ...prev,
      tagGroups: prev.tagGroups.map((group, idx) =>
        idx === groupIndex ? [...group, next] : group
      ),
    }));
    setTagInputs((prev) => {
      const updated = [...prev];
      while (updated.length <= groupIndex) {
        updated.push("");
      }
      updated[groupIndex] = "";
      return updated;
    });
    return true;
  };

  const handleRemoveTag = (groupIndex: number, target: string) => {
    setDraft((prev) => ({
      ...prev,
      tagGroups: prev.tagGroups.map((group, idx) =>
        idx === groupIndex ? group.filter((item) => item !== target) : group
      ),
    }));
  };

  const handleAddTagGroup = () => {
    setDraft((prev) => {
      const nextGroups = [...prev.tagGroups, []];
      setTagInputs((prevInputs) => [...prevInputs, ""]);
      setActiveTagGroup(nextGroups.length - 1);
      return { ...prev, tagGroups: nextGroups };
    });
  };

  const handleRemoveTagGroup = (groupIndex: number) => {
    setDraft((prev) => {
      const nextGroups = prev.tagGroups.filter((_, idx) => idx !== groupIndex);
      const normalized = nextGroups.length > 0 ? nextGroups : [[]];
      setTagInputs((prevInputs) => {
        const filtered = prevInputs.filter((_, idx) => idx !== groupIndex);
        if (normalized.length > filtered.length) {
          return [...filtered, ""];
        }
        return filtered.length > 0 ? filtered : [""];
      });
      setActiveTagGroup(null);
      return { ...prev, tagGroups: normalized };
    });
  };

  const handleActivateTagInput = (groupIndex: number) => {
    setTagInputs((prev) => {
      const updated = [...prev];
      while (updated.length <= groupIndex) {
        updated.push("");
      }
      return updated;
    });
    setActiveTagGroup(groupIndex);
  };

  const handleTagInputChange = (groupIndex: number, value: string) => {
    setTagInputs((prev) => {
      const updated = [...prev];
      while (updated.length <= groupIndex) {
        updated.push("");
      }
      updated[groupIndex] = value;
      return updated;
    });
  };

  const handleSubmitTag = (groupIndex: number) => {
    const value = tagInputs[groupIndex] ?? "";
    if (addTagToGroup(groupIndex, value)) {
      setActiveTagGroup(null);
    }
  };

  const handleBlurTagInput = (groupIndex: number) => {
    const value = tagInputs[groupIndex] ?? "";
    if (value.trim()) {
      handleSubmitTag(groupIndex);
    } else {
      setActiveTagGroup(null);
    }
  };

  const cancelTagInput = () => {
    setActiveTagGroup(null);
  };

  const handleDateRangeChange = (key: "createdAt" | "updatedAt") => (value: DateRangeValue) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sanitizedDraft = useMemo(() => {
    const nonEmptyTagGroups = draft.tagGroups.filter((group) => group.length > 0);
    return {
      ...draft,
      tagGroups: nonEmptyTagGroups.length > 0 ? nonEmptyTagGroups : [[]],
    };
  }, [draft]);

  const queryPreview = useMemo(() => buildDetailQuery(sanitizedDraft), [sanitizedDraft]);

  const handleSave = () => {
    onSave(sanitizedDraft, queryPreview);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle display="flex" alignItems="center" gap={1}>
        <FilterAltIcon fontSize="small" /> 詳細検索
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          <Divider textAlign="left">キーワードによる絞り込み</Divider>

          <EditableStringList
            key={`free-${open}`}
            label="フリーキーワード"
            description="タイトル・本文・コードのいずれかに含まれる記事が対象になります"
            items={draft.keywords.free}
            onAdd={(value) => addKeyword("free", value)}
            onRemove={(value) => removeKeyword("free", value)}
            placeholder="キーワードを追加"
            disableDefaultIcon
          />
          <EditableStringList
            key={`title-${open}`}
            label="タイトルキーワード"
            description="タイトルに含めたい語句を追加"
            items={draft.keywords.title}
            onAdd={(value) => addKeyword("title", value)}
            onRemove={(value) => removeKeyword("title", value)}
            placeholder="タイトルに含めたい語句を追加"
            disableDefaultIcon
          />
          <EditableStringList
            key={`body-${open}`}
            label="本文キーワード"
            description="本文に含めたい語句を追加"
            items={draft.keywords.body}
            onAdd={(value) => addKeyword("body", value)}
            onRemove={(value) => removeKeyword("body", value)}
            placeholder="本文に含めたい語句を追加"
            disableDefaultIcon
          />
          <EditableStringList
            key={`code-${open}`}
            label="コードキーワード"
            description="コードに含めたい語句を追加"
            items={draft.keywords.code}
            onAdd={(value) => addKeyword("code", value)}
            onRemove={(value) => removeKeyword("code", value)}
            placeholder="コードに含めたい語句を追加"
            disableDefaultIcon
          />

          <Divider textAlign="left">メタデータによる絞り込み</Divider>

          <Stack spacing={1}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">タグ</Typography>
              <Typography variant="caption" color="text.secondary">
                同じ行のタグは AND、行ごとは OR 条件になります
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {draft.tagGroups.map((group, groupIndex) => {
                const tagValue = tagInputs[groupIndex] ?? "";
                const isActive = activeTagGroup === groupIndex;

                return (
                  <Stack
                    key={`tag-group-${groupIndex}`}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <SearchTagList
                      tags={group}
                      onTagDelete={(tag) => handleRemoveTag(groupIndex, tag)}
                      chipProps={{ icon: <TagIcon fontSize="small" /> }}
                      emptyFallback={
                        <Typography variant="body2" color="text.secondary">
                          タグなし
                        </Typography>
                      }
                    />
                    {isActive ? (
                      <TextField
                        size="small"
                        autoFocus
                        value={tagValue}
                        onChange={(event) => handleTagInputChange(groupIndex, event.target.value)}
                        onBlur={() => handleBlurTagInput(groupIndex)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleSubmitTag(groupIndex);
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            cancelTagInput();
                          }
                        }}
                        placeholder="AND でタグを追加"
                        sx={{ minWidth: 160 }}
                      />
                    ) : (
                      <Tooltip title="このグループにタグを追加">
                        <IconButton
                          aria-label="タグを追加"
                          size="small"
                          onClick={() => handleActivateTagInput(groupIndex)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {draft.tagGroups.length > 1 ? (
                      <Tooltip title="この OR 条件を削除">
                        <IconButton
                          aria-label="タググループを削除"
                          size="small"
                          onClick={() => handleRemoveTagGroup(groupIndex)}
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {groupIndex < draft.tagGroups.length - 1 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                        OR
                      </Typography>
                    ) : null}
                  </Stack>
                );
              })}
            </Stack>
            <Button
              type="button"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleAddTagGroup}
              sx={{ alignSelf: "flex-start" }}
            >
              OR 条件を追加
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="ユーザー"
              value={draft.user}
              onChange={(event) => setDraft((prev) => ({ ...prev, user: event.target.value }))}
              placeholder="ユーザー名"
              fullWidth
            />
            <TextField
              label="Organization"
              value={draft.organization}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, organization: event.target.value }))
              }
              placeholder="組織名"
              fullWidth
            />
            <TextField
              label="最低ストック数"
              type="number"
              value={draft.minStocks}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  minStocks: event.target.value.replace(/^-/u, ""),
                }))
              }
              InputProps={{ inputProps: { min: 0 } }}
              placeholder="0"
              fullWidth
            />
          </Stack>

          <Divider textAlign="left">日付による絞り込み</Divider>

          <Stack spacing={2}>
            <SearchDateRangeField
              label="作成日"
              value={draft.createdAt}
              onChange={handleDateRangeChange("createdAt")}
            />
            <SearchDateRangeField
              label="更新日"
              value={draft.updatedAt}
              onChange={handleDateRangeChange("updatedAt")}
            />
          </Stack>

          <Divider textAlign="left">クエリプレビュー</Divider>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              label="生成されたクエリ"
              value={queryPreview}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />
            <Tooltip title="クリップボードにコピー">
              <IconButton
                aria-label="クエリをコピー"
                onClick={() => {
                  if (queryPreview && navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(queryPreview);
                  }
                }}
                disabled={!queryPreview}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
