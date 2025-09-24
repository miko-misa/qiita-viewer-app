This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 実装済みの主な仕様

- **検索ページ (`/`)**: Qiita API を用いた記事検索・詳細条件の設定・ページング付き一覧表示。
- **記事詳細ページ (`/[id]`)**: Markdown + Qiita ノート (`:::note`) + KaTeX レンダリング、目次ナビゲーション、コードハイライトに対応。
- **共通レイアウト**: 固定ヘッダー (`AppHeader`) とヒーローセクション (`PageHero`) を導入し、検索／記事ページ双方で再利用。
- **UI コンポーネント**: 目次 (`ArticleTableOfContents`) や各種フォームコンポーネントを Storybook で管理し、UI 回帰を確認しやすく整備。

## 主な依存関係

| 区分 | パッケージ | 役割 |
| ---- | ---------- | ---- |
| UI/スタイル | `@mui/material`, `@mui/icons-material`, `@emotion/*` | マテリアルデザインをベースにしたレイアウトとアイコン提供 |
| 状態管理 | `recoil`, `recoil-persist`, `@tanstack/react-query` | API キーなどのグローバル状態、検索結果のキャッシュを管理 |
| Markdown/表示 | `react-markdown`, `remark-gfm`, `remark-directive`, `remark-math`, `rehype-raw`, `rehype-sanitize`, `react-syntax-highlighter`, `react-katex`, `katex` | Qiita 記事の Markdown 表示、Qiita ノート、コードハイライト、TeX 表示を実現 |
| ネットワーク | `axios` | Qiita API との通信 |
| 開発支援 | `storybook`, `@storybook/*`, `eslint`, `prettier`, `vitest`, `playwright` など | UI ドキュメント、Lint、フォーマッタ、テスト環境 |

## 複数人による共同作業の指針

- **ブランチ運用**: 作業内容に応じたブランチを `feat/*`, `fix/*`, `chore/*` といった命名で作成し、`main` への取り込みは Pull Request 経由で行う。
- **Lint/Typecheck**: PR 提出前に `npm run lint` と `npm run typecheck` を必ず実行し、エラー・警告を解消する。コンポーネントを追加した際は Storybook (`npm run storybook`) で外観を確認する。
- **コンポーネント共通化**: ヘッダーは `AppHeader`、ページ冒頭は `PageHero` を使用し、UI コードを重複させない。汎用的な UI は `src/components` 配下で共有する。
- **Storybook/テスト**: UI コンポーネントを追加したら Story を用意し、インタラクションが共有できる状態を保つ。ロジックを含む処理は可能な限りユニットテストでカバーする。
- **PR 作成**: 変更目的・影響範囲・確認手順を PR の説明欄にまとめ、必要に応じてスクリーンショットや Storybook のリンクを添付する。
- **コミット方針**: `feat:`, `fix:`, `refactor:` などのプレフィックスを付け、論理的に独立した変更ごとにコミットを分割する。

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
