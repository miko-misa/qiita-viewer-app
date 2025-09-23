import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Search/SearchInput",
  component: SearchInput,
  args: {
    label: "キーワード",
  },
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithHelperText: Story = {
  args: {
    helperText: "タグやキーワードを入力",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    helperText: "検索の準備が完了していません",
  },
};
