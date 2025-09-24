import { Button } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageHero } from "./PageHero";

const meta: Meta<typeof PageHero> = {
  title: "Layout/PageHero",
  component: PageHero,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Qiita Viewer App",
    description: "Qiitaの記事をAPI経由で検索し、リッチに閲覧できるビューワーです。",
  },
};

export default meta;

type Story = StoryObj<typeof PageHero>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    actions: [
      <Button key="primary" variant="contained" color="primary">
        始める
      </Button>,
      <Button key="secondary" variant="outlined" color="primary">
        詳細を見る
      </Button>,
    ],
  },
};

export const LeftAligned: Story = {
  args: {
    align: "left",
    children: (
      <Button variant="contained" color="secondary">
        アクション
      </Button>
    ),
  },
};
