import type { Hymn } from "@/data/models";

import { useRow, useSortedRowIds } from "tinybase/ui-react";
import { TABLE_NAME, rowToHymn } from "@/data/database";
import { HymnList } from "@/features/hymns";
import { router } from "expo-router";
import { useCallback } from "react";

export default function Home() {
  const sortedRowIds = useSortedRowIds(TABLE_NAME);

  const hymns = sortedRowIds
    .map((id) => useRow(TABLE_NAME, id))
    .map(rowToHymn)
    .filter((hymn): hymn is Hymn => !!hymn)
    .sort((a, b) => a.id - b.id);

  const handleHymnPress = useCallback((hymn: Hymn) => {
    router.push(`/hymn?id=${hymn.id}`);
  }, []);

  return <HymnList hymns={hymns} onHymnPress={handleHymnPress} />;
}
