import type { Hymn } from "@/data/models";

import { TABLE_NAME } from "@/data/database";
import { useStore } from "tinybase/ui-react";
import { HymnList } from "@/features/hymns";
import { router } from "expo-router";
import { useCallback } from "react";

export default function Home() {
  const store = useStore();

  const sortedRowIds = store?.getSortedRowIds(TABLE_NAME) ?? [];

  const hymns = sortedRowIds
    .map((id) => store?.getRow(TABLE_NAME, id))
    .filter((row): row is NonNullable<typeof row> => !!row)
    .map((row) => ({
      ...row,
      id: Number(row.id),
      number: Number(row.number),
      verses: JSON.parse(row.verses as string),
    })) as Hymn[];

  const handleHymnPress = useCallback((hymn: Hymn) => {
    router.push(`/hymn?id=${hymn.id}`);
  }, []);

  return <HymnList hymns={hymns} onHymnPress={handleHymnPress} />;
}
