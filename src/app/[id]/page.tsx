import axios from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { fetchQiitaItem } from "@/features/search/api/qiita";
import { ArticlePageContent } from "./ArticlePageContent";

type ArticlePageParams = {
  id?: string;
};

type ArticlePageProps = {
  params: Promise<ArticlePageParams>;
};

const resolveId = async (paramsPromise: Promise<ArticlePageParams>) => {
  const resolvedParams = await paramsPromise;
  const id = resolvedParams.id?.trim();
  return id && id.length > 0 ? id : null;
};

const getQiitaItem = cache(async (id: string) => fetchQiitaItem({ id }));

export async function generateMetadata({
  params,
}: {
  params: Promise<ArticlePageParams>;
}): Promise<Metadata> {
  const id = await resolveId(params);

  if (!id) {
    return { title: "Qiita Viewer App" };
  }

  try {
    const item = await getQiitaItem(id);
    return { title: `${item.title} | Qiita Viewer App` };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { title: "Qiita Viewer App" };
    }

    throw error;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const id = await resolveId(params);

  if (!id) {
    notFound();
  }

  try {
    const item = await getQiitaItem(id);

    return <ArticlePageContent item={item} />;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }
}
