"use client";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Container, Link as MuiLink, Paper, Stack, Typography, Divider } from "@mui/material";
import type { SxProps, Theme, TypographyProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import NextLink from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import React, {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { unified, type Plugin } from "unified";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Root as MdastRoot, Heading as MdastHeading } from "mdast";
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchTagList } from "@/components/search/SearchTagList";
import { formatAuthor } from "@/utils/format";
import type { QiitaItem } from "@/features/search/api/qiita";

type ArticlePageContentProps = {
  item: QiitaItem;
};

const NOTE_DIRECTIVE_KEYWORDS = [
  "info",
  "warn",
  "warning",
  "alert",
  "danger",
  "error",
  "success",
] as const;
type NoteDirectiveKeyword = (typeof NOTE_DIRECTIVE_KEYWORDS)[number];

const resolveNoteDirectiveKeyword = (value?: string): NoteDirectiveKeyword | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return NOTE_DIRECTIVE_KEYWORDS.includes(normalized as NoteDirectiveKeyword)
    ? (normalized as NoteDirectiveKeyword)
    : undefined;
};

const normalizeQiitaNotes = (markdown: string): string => {
  if (!markdown) {
    return markdown;
  }

  return markdown.replace(/^(\s*:::note)([^\r\n]*)$/gim, (_match, prefix, suffix) => {
    const rest = suffix ?? "";
    const trimmed = rest.trim();

    if (trimmed.startsWith("{")) {
      return `${prefix}${suffix}`;
    }

    let variant: NoteDirectiveKeyword = "info";
    let content = "";

    if (trimmed.length > 0) {
      const tokens = trimmed.split(/\s+/);
      const [firstToken, ...otherTokens] = tokens;
      const candidate = resolveNoteDirectiveKeyword(firstToken);

      if (candidate) {
        variant = candidate;
        content = otherTokens.join(" ");
      } else {
        content = trimmed;
      }
    }

    const indent = prefix.match(/^\s*/)?.[0] ?? "";
    const normalizedLine = `${prefix}{.${variant}}`;

    if (content) {
      return `${normalizedLine}\n${indent}${content}`;
    }

    return normalizedLine;
  });
};

const slugify = (text: string) => {
  const base = text
    .normalize("NFKC")
    .trim()
    .replaceAll("\u0000", "")
    .replace(/\s+/g, "-")
    .replace(/[(){}\[\]<>]/g, "")
    .replace(/-+/g, "-");

  const safe = Array.from(base)
    .filter((char) => {
      if (/[\-_.:]/.test(char)) return true;
      const code = char.codePointAt(0);
      if (!code) return false;
      if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))
        return true;
      if (code <= 31 || code === 127) return false;
      return code > 127;
    })
    .join("")
    .toLowerCase();
  return safe || "section";
};

type HeadingEntry = { level: number; text: string; slug: string };

type HeadingSlugPluginOptions = {
  onHeading?: (entry: HeadingEntry, node: MdastHeading) => void;
};

const createHeadingSlugPlugin = (options?: HeadingSlugPluginOptions): Plugin<[], MdastRoot> => {
  return () => (tree: MdastRoot) => {
    const slugCounts: Record<string, number> = {};

    visit(tree, "heading", (node: MdastHeading) => {
      const depth = node.depth ?? 0;
      if (depth < 1 || depth > 6) {
        return;
      }

      const rawText = toString(node).trim();
      if (!rawText) {
        return;
      }

      const baseSlug = slugify(rawText);
      const count = slugCounts[baseSlug] ?? 0;
      const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
      slugCounts[baseSlug] = count + 1;

      const data = (node.data ??= {});
      const hProperties = (data.hProperties ??= {});
      (hProperties as Record<string, unknown>).id = slug;

      options?.onHeading?.({ level: depth, text: rawText, slug }, node);
    });
  };
};

const extractHeadings = (markdown: string): HeadingEntry[] => {
  const headings: HeadingEntry[] = [];

  if (!markdown) {
    return headings;
  }

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(
        createHeadingSlugPlugin({
          onHeading: (entry) => {
            headings.push(entry);
          },
        })
      );

    const tree = processor.parse(markdown) as MdastRoot;
    processor.runSync(tree);
  } catch (error) {
    console.warn("Failed to parse headings", error);
  }

  return headings;
};

const markdownSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), "className", "data-title"],
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
    h5: [...(defaultSchema.attributes?.h5 ?? []), "id"],
    h6: [...(defaultSchema.attributes?.h6 ?? []), "id"],
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-/]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className", /^language-/]],
  },
};

// Qiita の :::note ディレクティブを div.qiita-note に変換
type MinimalDirective = {
  type: string;
  name?: string;
  attributes?: Record<string, unknown>;
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  label?: string;
};

const remarkNotePlugin: Plugin<[], MdastRoot> = () => (tree) => {
  visit(tree as unknown as MdastRoot, "containerDirective", (n) => {
    const node = n as unknown as MinimalDirective;
    if (node.name !== "note") return;
    const attrs = node.attributes ?? {};
    const cls = String(
      (attrs as Record<string, unknown>).class ?? (attrs as Record<string, unknown>).className ?? ""
    );
    let rawType: string | undefined = typeof attrs.type === "string" ? attrs.type : undefined;
    if (!rawType) {
      const m = /(info|warning|warn|alert|danger|error|success)/i.exec(cls);
      if (m) rawType = m[1].toLowerCase();
    }
    // パターン: 先頭行が "<type> <本文>" の場合に type を推定し、本文から type トークンを取り除く
    if (!rawType) {
      type UnknownNode = { type?: string; children?: unknown[]; value?: unknown };
      const parentChildren = (node as unknown as { children?: unknown[] }).children ?? [];
      const first = Array.isArray(parentChildren) ? (parentChildren[0] as UnknownNode) : undefined;
      if (first?.type === "paragraph") {
        const firstChild = Array.isArray(first.children)
          ? (first.children[0] as UnknownNode)
          : undefined;
        if (firstChild?.type === "text" && typeof firstChild.value === "string") {
          const m = /^(info|warning|warn|alert|danger|error|success)\s+(.*)$/i.exec(
            firstChild.value.trim()
          );
          if (m) {
            rawType = m[1].toLowerCase();
            const rest = m[2];
            firstChild.value = rest; // 本文から type トークンを削除
          }
        }
      }
    }
    rawType ||= "info";
    const typeMap: Record<string, "info" | "warning" | "alert" | "success"> = {
      info: "info",
      warn: "warning",
      warning: "warning",
      danger: "alert",
      error: "alert",
      alert: "alert",
      success: "success",
    };
    const type = typeMap[rawType] ?? "info";
    const title =
      (typeof (attrs as Record<string, unknown>).title === "string" &&
        (attrs as Record<string, string>).title) ||
      node.label ||
      undefined;
    node.data ||= {};
    node.data.hName = "div";
    node.data.hProperties = {
      className: ["qiita-note", `qiita-note--${type}`],
      "data-title": title,
    } as Record<string, unknown>;
  });
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  node?: unknown;
};

const getNodeText = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => getNodeText(child)).join("");
  }

  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    if (props && "children" in props) {
      return getNodeText(props.children);
    }
  }

  return "";
};

const CodeBlock = ({ node, inline, className, children, ...props }: MarkdownCodeProps) => {
  void node;
  const languageMatch = /language-([\w+-]+)/.exec(className ?? "");
  const language = languageMatch?.[1];

  // タイトルの抽出: language-javascript:example.js のような形式から example.js を取得
  const titleMatch = /language-[\w+-]+:(.+)/.exec(className ?? "");
  const title = titleMatch?.[1];

  // インラインコードの判定: inlineプロパティがtrueの場合、または改行を含まない短いコード
  const code = Array.isArray(children)
    ? children.map((child) => String(child)).join("")
    : String(children ?? "");
  const isInline = inline === true || (inline !== false && !code.includes("\n") && !language);

  if (!isInline) {
    return (
      <Box
        sx={(theme) => ({
          backgroundColor: theme.palette.grey[900],
          borderRadius: 1.5,
          overflow: "hidden",
          my: 2.5,
          boxShadow: theme.shadows[1],
        })}
      >
        {title && (
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[800],
              color: theme.palette.grey[300],
              px: 2.5,
              py: 1,
              borderBottom: `1px solid ${theme.palette.grey[700]}`,
              fontSize: "0.875rem",
              fontFamily: 'var(--font-geist-mono, "Roboto Mono", monospace)',
              display: "flex",
              alignItems: "center",
              gap: 1,
            })}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "error.main",
                flexShrink: 0,
              }}
            />
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "warning.main",
                flexShrink: 0,
              }}
            />
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "success.main",
                flexShrink: 0,
                mr: 1,
              }}
            />
            {title}
          </Box>
        )}
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "18px 20px",
            background: "transparent",
            fontSize: 14,
            lineHeight: 1.7,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-geist-mono, "Roboto Mono", monospace)',
            },
            ...props,
          }}
          showLineNumbers
        >
          {code.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </Box>
    );
  }

  return (
    <Box
      component="code"
      sx={(theme) => {
        const isLight = theme.palette.mode === "light";
        const backgroundColor = alpha(
          isLight ? theme.palette.grey[500] : theme.palette.grey[300],
          isLight ? 0.16 : 0.24
        );
        const textColor = isLight ? theme.palette.text.primary : theme.palette.grey[100];

        return {
          display: "inline",
          fontFamily: 'var(--font-geist-mono, "Roboto Mono", monospace)',
          backgroundColor,
          color: textColor,
          px: 0.5,
          py: "1px",
          borderRadius: 0.75,
          fontSize: "0.95em",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
        };
      }}
      {...props}
    >
      {code}
    </Box>
  );
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
  const rawMarkdownSource = item.body ?? item.rendered_body ?? "";
  const markdownSource = useMemo(() => normalizeQiitaNotes(rawMarkdownSource), [rawMarkdownSource]);
  const headings = useMemo(() => extractHeadings(markdownSource), [markdownSource]);
  const tableOfContents = useMemo(
    () => headings.filter((heading) => heading.level === 1 || heading.level === 2),
    [headings]
  );
  const remarkHeadingPlugins = useMemo(
    () => [remarkGfm, remarkDirective, remarkNotePlugin, createHeadingSlugPlugin()],
    []
  );
  const activeHeading = useRef<string | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Array<{ slug: string; top: number }>>([]);

  const markdownSlugCounts: Record<string, number> = {};

  const buildHeading = (
    variant: TypographyProps["variant"],
    component: "h2" | "h3" | "h4" | "h5" | "h6",
    sx: SxProps<Theme>
  ) => {
    const HeadingComponent = ({
      children,
      node,
      ...props
    }: {
      children?: ReactNode;
      node?: { properties?: { id?: string } };
    } & ComponentPropsWithoutRef<"div">) => {
      const propsId: string | undefined = node?.properties?.id;
      const id =
        propsId ??
        (() => {
          const text = getNodeText(children) || "section";
          const baseSlug = slugify(text);
          const count = markdownSlugCounts[baseSlug] ?? 0;
          const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
          markdownSlugCounts[baseSlug] = count + 1;
          return slug;
        })();

      return (
        <Typography
          id={id}
          variant={variant}
          component={component}
          sx={{ scrollMarginTop: { xs: 72, md: 96 }, ...sx }}
          {...props}
        >
          {children}
        </Typography>
      );
    };

    HeadingComponent.displayName = `MarkdownHeading-${component}`;

    return HeadingComponent;
  };

  const getTopWithin = (el: HTMLElement, container: HTMLElement) => {
    let top = 0;
    let node: HTMLElement | null = el;
    while (node && node !== container) {
      top += node.offsetTop;
      node = (node.offsetParent as HTMLElement) ?? null;
    }
    return top;
  };

  const recalcPositions = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || tableOfContents.length === 0) {
      positionsRef.current = [];
      return;
    }
    const list: Array<{ slug: string; top: number }> = [];
    for (const h of tableOfContents) {
      const el =
        (document.getElementById(h.slug) as HTMLElement | null) ||
        (document.getElementById(`user-content-${h.slug}`) as HTMLElement | null);
      if (!el) continue;
      const top = getTopWithin(el as HTMLElement, container);
      list.push({ slug: el.id, top });
    }
    list.sort((a, b) => a.top - b.top);
    positionsRef.current = list;
  }, [tableOfContents]);

  const updateActiveByScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const headerOffset = window.innerWidth >= 900 ? 96 : 72;
    const viewportHeight = container.clientHeight;
    const extraOffset = Math.max(viewportHeight * 0.18, 96);
    const activationY = container.scrollTop + headerOffset + extraOffset;

    let next: string | null = positionsRef.current[0]?.slug ?? null;
    for (const pos of positionsRef.current) {
      if (pos.top <= activationY) next = pos.slug;
      else break;
    }

    if (next && next !== activeHeading.current) {
      activeHeading.current = next;
      setCurrentSlug(next);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveByScroll);
    };

    recalcPositions();
    updateActiveByScroll();

    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      recalcPositions();
      updateActiveByScroll();
    });
    if (contentRef.current) ro.observe(contentRef.current);

    const onResize = () => {
      recalcPositions();
      updateActiveByScroll();
    };
    window.addEventListener("resize", onResize);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [recalcPositions, updateActiveByScroll, tableOfContents.length]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      recalcPositions();
      updateActiveByScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [markdownSource, tableOfContents.length, recalcPositions, updateActiveByScroll]);

  const markdownComponents: Components = {
    div: ({ className, children, ...props }) => {
      const cn = className ?? "";
      const isNote = typeof cn === "string" && cn.includes("qiita-note");
      if (!isNote) {
        return (
          <Box component="div" {...props}>
            {children as ReactNode}
          </Box>
        );
      }

      const m = cn.match(/qiita-note--([a-z]+)/);
      const noteType = (m?.[1] ?? "info") as "info" | "warning" | "alert" | "success" | string;
      const dataTitle = (props as Record<string, unknown>)["data-title"] as string | undefined;

      const resolvePalette = (theme: Theme) => {
        switch (noteType) {
          case "warning":
          case "warn":
            return theme.palette.warning;
          case "alert":
          case "danger":
          case "error":
            return theme.palette.error;
          case "success":
            return theme.palette.success;
          case "info":
          default:
            return theme.palette.info;
        }
      };

      return (
        <Box
          component="div"
          sx={(theme) => {
            const palette = resolvePalette(theme);
            const backgroundColor = alpha(
              palette.main,
              theme.palette.mode === "light" ? 0.08 : 0.18
            );
            const borderColor = alpha(palette.main, theme.palette.mode === "light" ? 0.28 : 0.45);
            const accentColor = alpha(palette.main, theme.palette.mode === "light" ? 0.6 : 0.75);
            return {
              backgroundColor,
              border: `1px solid ${borderColor}`,
              borderLeftColor: accentColor,
              borderLeftWidth: 4,
              borderLeftStyle: "solid",
              color: theme.palette.text.primary,
              p: 2,
              pl: 2.5,
              my: 2,
              borderRadius: 1.5,
            };
          }}
        >
          {dataTitle ? (
            <Typography variant="subtitle2" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
              {dataTitle}
            </Typography>
          ) : null}
          <Box sx={{ "&:first-of-type": { mt: 0 }, "&:last-of-type": { mb: 0 } }}>
            {children as ReactNode}
          </Box>
        </Box>
      );
    },
    h1: buildHeading("h4", "h2", { mt: 4, mb: 2, fontWeight: 700 }),
    h2: buildHeading("h5", "h3", { mt: 4, mb: 1.5, fontWeight: 700 }),
    h3: buildHeading("h6", "h4", { mt: 3, mb: 1.25, fontWeight: 600 }),
    h4: buildHeading("subtitle1", "h5", { mt: 2.5, mb: 1.25, fontWeight: 600 }),
    h5: buildHeading("subtitle2", "h6", { mt: 2, mb: 1, fontWeight: 500 }),
    h6: buildHeading("subtitle2", "h6", { mt: 1.5, mb: 1, fontWeight: 500, fontStyle: "italic" }),
    p: ({ node, children, ...props }) => {
      const mdNode = node as { children?: Array<{ tagName?: string }> } | undefined;
      const isStandaloneCodeBlock = Boolean(
        mdNode?.children && mdNode.children.length === 1 && mdNode.children[0]?.tagName === "code"
      );

      if (isStandaloneCodeBlock) {
        return <>{children as ReactNode}</>;
      }

      return (
        <Typography variant="body1" component="p" sx={{ my: 2, lineHeight: 1.8 }} {...props}>
          {children}
        </Typography>
      );
    },
    a: ({ node, href, children, ...props }) => {
      void node;
      const isExternal = href ? /^https?:\/\//.test(href) : false;
      return (
        <MuiLink
          href={href ?? "#"}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          color="primary"
          underline="hover"
          {...props}
        >
          {children}
        </MuiLink>
      );
    },
    blockquote: ({ node, ...props }) => {
      void node;
      return (
        <Box
          component="blockquote"
          sx={(theme) => ({
            borderLeft: `4px solid ${theme.palette.primary.light}`,
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.text.secondary,
            p: 2,
            pl: 3,
            my: 2.5,
            borderRadius: 1,
          })}
          {...props}
        />
      );
    },
    ul: ({ node, ...props }) => {
      void node;
      return <Box component="ul" sx={{ pl: 3, my: 2, listStyleType: "disc" }} {...props} />;
    },
    ol: ({ node, ...props }) => {
      void node;
      return <Box component="ol" sx={{ pl: 3, my: 2, listStyleType: "decimal" }} {...props} />;
    },
    li: ({ node, ...props }) => {
      void node;
      return <Box component="li" sx={{ my: 0.75 }} {...props} />;
    },
    hr: ({ node, ...props }) => {
      void node;
      return (
        <Box
          component="hr"
          sx={(theme) => ({ border: 0, borderTop: `1px solid ${theme.palette.divider}`, my: 4 })}
          {...props}
        />
      );
    },
    img: ({ node, alt, ...props }) => {
      void node;
      return (
        <Box
          component="img"
          alt={alt ?? ""}
          sx={{ maxWidth: "100%", borderRadius: 1, my: 2 }}
          loading="lazy"
          {...props}
        />
      );
    },
    table: ({ node, ...props }) => {
      void node;
      return (
        <Box sx={{ overflowX: "auto", my: 3 }}>
          <Box
            component="table"
            sx={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: 320,
              "& th, & td": {
                border: (theme) => `1px solid ${theme.palette.divider}`,
                px: 1.5,
                py: 1,
                textAlign: "left",
                verticalAlign: "top",
              },
              "& th": {
                backgroundColor: (theme) => theme.palette.action.hover,
                fontWeight: 600,
              },
            }}
            {...props}
          />
        </Box>
      );
    },
    code: CodeBlock,
  } satisfies Components;

  const hasTableOfContents = tableOfContents.length > 0;

  const scrollToSlug = useCallback((slug: string) => {
    const target =
      (document.getElementById(slug) as HTMLElement | null) ||
      (document.getElementById(`user-content-${slug}`) as HTMLElement | null);

    if (!target) return;

    const container = scrollContainerRef.current;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReduce ? "auto" : "smooth";

    if (container && container.contains(target)) {
      const headerOffset = window.innerWidth >= 900 ? 96 : 72;
      const top = getTopWithin(target, container) - headerOffset;
      container.scrollTo({ top, behavior });
      return;
    }

    target.scrollIntoView({ behavior, block: "start", inline: "nearest" });
  }, []);

  useEffect(() => {
    if (!hasTableOfContents) return;
    const hash =
      typeof window !== "undefined" ? decodeURIComponent(window.location.hash.slice(1)) : "";
    if (!hash) return;
    const id = requestAnimationFrame(() => scrollToSlug(hash));
    return () => cancelAnimationFrame(id);
  }, [hasTableOfContents, scrollToSlug]);

  const handleTocClick = useCallback(
    (slug: string) => {
      scrollToSlug(slug);
      window.history.replaceState(null, "", `#${slug}`);
    },
    [scrollToSlug]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[50],
        overflow: "hidden",
      }}
    >
      <AppHeader title="Qiita Viewer App" position="fixed" />
      <Box
        component="main"
        sx={{
          flex: 1,
          height: "100%",
          pt: { xs: "64px", md: "72px" },
          display: "flex",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            py: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: { xs: "block", lg: "grid" },
              gridTemplateColumns: { lg: "minmax(0, 1fr) 260px" },
              gap: { lg: 6 },
              alignItems: "flex-start",
              position: "relative",
              flex: 1,
              minHeight: 0,
            }}
          >
            <Box
              ref={scrollContainerRef}
              sx={{
                height: "100%",
                overflowY: "auto",
                pr: { lg: 2 },
                minHeight: 0,
                scrollBehavior: "smooth",
                scrollPaddingTop: { xs: 64, md: 72 },
              }}
            >
              <Stack
                spacing={4}
                alignItems="center"
                sx={{ width: "100%", minHeight: "100%", py: { xs: 2, md: 3 } }}
              >
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

                    <Stack
                      direction="row"
                      spacing={2.5}
                      alignItems="center"
                      sx={{ color: "text.secondary" }}
                    >
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

                  <SearchTagList tags={item.tags.map((tag: { name: string }) => tag.name)} />
                </Stack>

                <Paper
                  elevation={0}
                  ref={contentRef}
                  sx={{
                    typography: "body1",
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 2.5, sm: 3, md: 4 },
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    width: "100%",
                    maxWidth: 840,
                    mx: "auto",
                    boxShadow: { md: 2 },
                    borderRadius: 2,
                  }}
                >
                  {markdownSource ? (
                    <ReactMarkdown
                      remarkPlugins={remarkHeadingPlugins}
                      rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
                      components={markdownComponents}
                    >
                      {markdownSource}
                    </ReactMarkdown>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      表示できる本文がありません。
                    </Typography>
                  )}
                </Paper>
              </Stack>
            </Box>

            {hasTableOfContents ? (
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
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  目次
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                  {tableOfContents.map((heading) => (
                    <Box
                      key={heading.slug}
                      component="li"
                      sx={{
                        position: "relative",
                        mb: 1,
                      }}
                    >
                      {/* 円（レベル1は大きく、レベル2は小さく、両方とも同じ位置） */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: "0px",
                          top: heading.level === 1 ? "7.5px" : "9.5px",
                          width: heading.level === 1 ? "11px" : "7px",
                          height: heading.level === 1 ? "11px" : "7px",
                          borderRadius: "50%",
                          backgroundColor: (theme) =>
                            currentSlug === heading.slug ||
                            currentSlug === `user-content-${heading.slug}`
                              ? theme.palette.primary.main
                              : theme.palette.grey[400],
                          border: (theme) => `1.5px solid ${theme.palette.grey[50]}`,
                          transform: heading.level === 1 ? "translateX(-6px)" : "translateX(-4px)",
                          transition: "all 0.2s ease",
                          zIndex: 1,
                        }}
                      />
                      <MuiLink
                        component="button"
                        aria-current={
                          currentSlug === heading.slug ||
                          currentSlug === `user-content-${heading.slug}`
                            ? "true"
                            : undefined
                        }
                        type="button"
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
                            currentSlug === heading.slug ||
                            currentSlug === `user-content-${heading.slug}`
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                          fontWeight:
                            currentSlug === heading.slug ||
                            currentSlug === `user-content-${heading.slug}`
                              ? 600
                              : 400,
                        }}
                        onClick={() => handleTocClick(heading.slug)}
                      >
                        {heading.text}
                      </MuiLink>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
