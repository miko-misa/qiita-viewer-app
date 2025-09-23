import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchTagList } from "./SearchTagList";

const meta = {
  title: "Search/SearchTagList",
  component: SearchTagList,
  args: {
    tags: ["nextjs", "react", "qiita"],
  },
} satisfies Meta<typeof SearchTagList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomChip: Story = {
  args: {
    chipProps: {
      color: "primary",
      variant: "outlined",
    },
  },
};

export const Empty: Story = {
  args: {
    tags: [],
    emptyFallback: "タグはありません",
  },
};
