import type { Metadata } from "next";

import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
};

export default function Page() {
  return <SearchPageClient />;
}
