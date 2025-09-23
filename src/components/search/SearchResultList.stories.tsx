import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  SearchResultList,
  type SearchResultItem,
} from "./SearchResultList";

const sampleItems: SearchResultItem[] = [
  {
    id: "1",
    title: "Next.jsとMUIでQiita検索アプリを作る",
    url: "https://qiita.com/articles/1",
    author: {
      id: "qiita_user",
      name: "Qiita User",
    },
    likesCount: 42,
    stocksCount: 30,
    tags: ["nextjs", "mui", "react"],
    createdAt: "2024-10-01T12:00:00+09:00",
    summary:
      "Next.js App RouterとMUIを組み合わせて、Qiitaの記事検索体験を向上させる手法を紹介します。",
  },
  {
    id: "2",
    title: "React QueryでAPIレスポンスをキャッシュする",
    url: "https://qiita.com/articles/2",
    author: {
      id: "frontend_dev",
      name: "Front End Dev",
    },
    likesCount: 18,
    stocksCount: 12,
    tags: ["react-query", "api", "typescript"],
    createdAt: "2024-09-20T09:30:00+09:00",
    summary:
      "Qiita APIを効率的に扱うためにReact Queryを導入し、キャッシュ戦略やエラーハンドリングを解説します。",
  },
];

const meta = {
  title: "Search/SearchResultList",
  component: SearchResultList,
  args: {
    items: sampleItems,
  },
} satisfies Meta<typeof SearchResultList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: "条件に合う記事が見つかりませんでした",
  },
};

export const WithSelectHandler: Story = {
  args: {
    onSelect: fn(),
  },
};
