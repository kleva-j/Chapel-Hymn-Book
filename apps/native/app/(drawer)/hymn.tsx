import type { Hymn } from "@/data/models";

import { Stack, useLocalSearchParams } from "expo-router";
import { Container } from "@/components/container";
import { HymnViewer } from "@/features/hymns";
import { useStore } from "tinybase/ui-react";
import { TABLE_NAME } from "@/data/database";
import { Text } from "react-native";

export default function HymnPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const store = useStore();

  const row = store?.getRow(TABLE_NAME, id);
  const hymn = row
    ? ({
        ...row,
        id: Number(row.id),
        number: Number(row.number),
        verses: JSON.parse(row.verses as string),
      } as Hymn)
    : undefined;

  if (!hymn) {
    return (
      <>
        <Stack.Screen options={{ title: "Hymn Not Found" }} />
        <Container className="flex-1 justify-center items-center bg-white p-5">
          <Text className="text-gray-400 font-bold text-lg mb-2">
            Hymn Not Found
          </Text>
          <Text className="text-gray-500 text-center">
            The hymn you're looking for doesn't seem to exist.
          </Text>
        </Container>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `CHB ${hymn.number}` }} />
      <HymnViewer hymn={hymn} />
    </>
  );
}
