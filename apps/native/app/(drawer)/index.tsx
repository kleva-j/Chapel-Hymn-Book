import type { Hymn } from "@/data/models";

import { seedHymns } from "@/data/database";
import { HymnList } from "@/features/hymns";
import { router } from "expo-router";
import { useCallback } from "react";

import { Container } from "@/components/container";

export default function Home() {
  const handleHymnPress = useCallback((hymn: Hymn) => {
    router.push(`/hymn?id=${hymn.id}`);
  }, []);

  return (
    <Container className="px-4">
      <HymnList hymns={seedHymns} onHymnPress={handleHymnPress} />
    </Container>
  );
}
