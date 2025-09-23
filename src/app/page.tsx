import type { Metadata } from "next";

import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: {
    absolute: "Search | Qiita Viewer App",
  },
};

export default function Page() {
  return <SearchPageClient />;
}
