import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleTableOfContents } from "./ArticleTableOfContents";

const meta: Meta<typeof ArticleTableOfContents> = {
  title: "Article/ArticleTableOfContents",
  component: ArticleTableOfContents,
  parameters: {
    layout: "centered",
  },
  args: {
    headings: [
      { level: 1, text: "はじめに", slug: "introduction" },
      { level: 2, text: "導入", slug: "getting-started" },
      { level: 2, text: "主要な概念", slug: "main-concepts" },
      { level: 1, text: "まとめ", slug: "summary" },
    ],
    currentSlug: "getting-started",
  },
};

export default meta;

type Story = StoryObj<typeof ArticleTableOfContents>;

export const Default: Story = {
  args: {
    onSelect: (slug: string) => console.log("Select", slug),
  },
};

export const Empty: Story = {
  args: {
    headings: [],
    currentSlug: null,
  },
};
