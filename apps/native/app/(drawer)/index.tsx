import type { Hymn } from "@/data/models";

import { seedHymns } from "@/data/database";
import { HymnList } from "@/features/hymns";
import { router } from "expo-router";
import { useCallback } from "react";

export default function Home() {
  const handleHymnPress = useCallback((hymn: Hymn) => {
    router.push(`/hymn?id=${hymn.id}`);
  }, []);

  return <HymnList hymns={seedHymns} onHymnPress={handleHymnPress} />;
}
