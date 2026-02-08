import { Stack, useLocalSearchParams } from "expo-router";
import { Container } from "@/components/container";
import { HymnViewer } from "@/features/hymns";
import { seedHymns } from "@/data/database";
import { Text } from "react-native";

function useHymnById(id: number) {
  const hymn = seedHymns.find((h) => h.id === id);
  return { hymn };
}

export default function Hymn() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { hymn } = useHymnById(Number(id));

  // if (isLoading) {
  //   return (
  //     <Container className="flex-1 justify-center items-center bg-white p-5">
  //       <ActivityIndicator size="large" color="#6B7280" />
  //       <Text className="mt-4 text-gray-500 font-medium">Loading hymn...</Text>
  //     </Container>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <Container className="flex-1 justify-center items-center bg-white p-5">
  //       <Text className="text-red-500 font-bold text-lg mb-2">Oops!</Text>
  //       <Text className="text-gray-600 text-center">
  //         Something went wrong while loading the hymn. Please try again later.
  //       </Text>
  //     </Container>
  //   );
  // }

  if (!hymn) {
    return (
      <Container className="flex-1 justify-center items-center bg-white p-5">
        <Text className="text-gray-400 font-bold text-lg mb-2">
          Hymn Not Found
        </Text>
        <Text className="text-gray-500 text-center">
          The hymn you're looking for doesn't seem to exist.
        </Text>
      </Container>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `CHB ${hymn.number}` }} />
      <HymnViewer hymn={hymn} />
    </>
  );
}
