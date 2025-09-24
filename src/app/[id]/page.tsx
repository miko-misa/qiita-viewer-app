import axios from "axios";
import { notFound } from "next/navigation";

import { fetchQiitaItem } from "@/features/search/api/qiita";
import { ArticlePageContent } from "./ArticlePageContent";

type ArticlePageParams = {
  id?: string;
};

type ArticlePageProps = {
  params: Promise<ArticlePageParams>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id?.trim();

  if (!id) {
    notFound();
  }

  try {
    const item = await fetchQiitaItem({ id });

    return <ArticlePageContent item={item} />;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }
}
