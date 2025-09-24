import axios from "axios";

export type QiitaTag = {
  name: string;
};

export type QiitaItem = {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  stocks_count: number;
  tags: QiitaTag[];
  created_at: string;
  body: string;
  rendered_body?: string;
  user: {
    id: string;
    name?: string;
  };
};

const qiitaClient = axios.create({
  baseURL: "https://qiita.com/api/v2",
});

const DEFAULT_PER_PAGE = 50;

export async function fetchQiitaItems({
  keyword,
  apiKey,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
}: {
  keyword: string;
  apiKey?: string;
  page?: number;
  perPage?: number;
}) {
  const response = await qiitaClient.get<QiitaItem[]>("/items", {
    params: {
      page,
      per_page: perPage,
      query: keyword,
    },
    headers:
      apiKey && apiKey.length > 0
        ? {
            Authorization: `Bearer ${apiKey}`,
          }
        : undefined,
  });

  return response.data;
}

export async function fetchQiitaItem({ id, apiKey }: { id: string; apiKey?: string }) {
  const response = await qiitaClient.get<QiitaItem>(`/items/${id}`, {
    headers:
      apiKey && apiKey.length > 0
        ? {
            Authorization: `Bearer ${apiKey}`,
          }
        : undefined,
  });

  return response.data;
}

export const qiitaApiConstants = {
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE: 100,
} as const;
