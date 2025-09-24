import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppHeader } from "./AppHeader";

const meta: Meta<typeof AppHeader> = {
  title: "Layout/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Qiita Viewer App",
  },
};

export default meta;

type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {};

export const WithSettings: Story = {
  args: {
    onClickSettings: () => alert("open settings"),
    settingsTooltip: "設定",
  },
};
