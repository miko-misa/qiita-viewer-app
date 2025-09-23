import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchButton } from "./SearchButton";

const meta = {
  title: "Search/SearchButton",
  component: SearchButton,
  args: {
    children: "検索",
  },
} satisfies Meta<typeof SearchButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: "検索中…",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};
