import { Stack, useLocalSearchParams } from "expo-router";
import { TABLE_NAME, rowToHymn } from "@/data/database";
import { Container } from "@/components/container";
import { HymnViewer } from "@/features/hymns";
import { useRow } from "tinybase/ui-react";
import { router } from "expo-router";
import { Text } from "react-native";
import { useEffect } from "react";

export default function HymnPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const safeId = Array.isArray(id) ? id[0] : id;
  const row = useRow(TABLE_NAME, safeId);
  const hymn = rowToHymn(row);

  useEffect(() => {
    if (!safeId) router.replace("/");
  }, [safeId]);

  if (!hymn) {
    return (
      <>
        <Stack.Screen options={{ title: "Hymn Not Found" }} />
        <Container className="flex-1 justify-center items-center bg-white dark:bg-black p-5">
          <Text className="text-gray-400 font-bold text-lg mb-2 dark:text-gray-400">
            Hymn Not Found
          </Text>
          <Text className="text-gray-500 text-center dark:text-gray-400">
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
