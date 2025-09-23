import axios from "axios";
import { notFound } from "next/navigation";

import { fetchQiitaItem } from "@/features/search/api/qiita";
import { ArticlePageContent } from "./ArticlePageContent";

type ArticlePageProps = {
  params: {
    id?: string;
  };
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const id = params.id?.trim();

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
