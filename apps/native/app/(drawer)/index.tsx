import type { Hymn } from "@/data/models";

import { TABLE_NAME, rowToHymn } from "@/data/database";
import { useTable } from "tinybase/ui-react";
import { HymnList } from "@/features/hymns";
import { router } from "expo-router";
import { useCallback } from "react";

export default function Home() {
  const table = useTable(TABLE_NAME);

  const hymns = Object.values(table)
    .map(rowToHymn)
    .filter((hymn): hymn is Hymn => !!hymn)
    .sort((a, b) => a.number - b.number);

  const handleHymnPress = useCallback((hymn: Hymn) => {
    router.push(`/hymn?id=${hymn.id}`);
  }, []);

  return <HymnList hymns={hymns} onHymnPress={handleHymnPress} />;
}
