import { Suspense } from "react";
import type { Metadata } from "next";

import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: {
    absolute: "Search | Qiita Viewer App",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div aria-label="読み込み中">Loading...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
