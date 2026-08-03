import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSharedValue } from "react-native-reanimated";
import PokeCard, {
  CardData,
  colorForType,
  SwipeDirection,
} from "../../src/components/PokeCard";

const PAGE_SIZE = 20;
const PREFETCH_THRESHOLD = 3;
const MAX_VISIBLE_CARDS = 2;
const INITIAL_URL = `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}`;

type PokeListResponse = {
  next: string | null;
  results: { name: string; url: string }[];
};

type PokeDetailResponse = {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
};

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchPokemonCard(pokemon: {
  name: string;
  url: string;
}): Promise<CardData> {
  const response = await fetch(pokemon.url);
  if (!response.ok) {
    throw new Error(`PokeAPI error (${response.status})`);
  }

  const detail: PokeDetailResponse = await response.json();

  const mainType =
    detail.types.find((entry) => entry.slot === 1)?.type.name ??
    detail.types[0]?.type.name ??
    "normal";

  return {
    id: String(detail.id),
    name: capitalize(detail.name),
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
    type: mainType,
    color: colorForType(mainType),
  };
}

async function fetchPokemonPage(url: string): Promise<{
  cards: CardData[];
  nextUrl: string | null;
}> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI error (${response.status})`);
  }

  const json: PokeListResponse = await response.json();
  const cards = await Promise.all(json.results.map(fetchPokemonCard));

  return { cards, nextUrl: json.next };
}

export default function Screen06() {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(() => new Set());
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const topTranslateX = useSharedValue(0);

  const {
    data,
    error,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam }) => fetchPokemonPage(pageParam),
    initialPageParam: INITIAL_URL,
    getNextPageParam: (lastPage) => lastPage.nextUrl ?? undefined,
  });

  const cards = (data?.pages.flatMap((page) => page.cards) ?? []).filter(
    (card) => !swipedIds.has(card.id),
  );

  useEffect(() => {
    if (
      cards.length <= PREFETCH_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [cards.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onSwiped = useCallback((id: string, direction: SwipeDirection) => {
    setSwipedIds((prev) => new Set(prev).add(id));
    if (direction === 1) {
      setKnownCount((count) => count + 1);
    } else {
      setUnknownCount((count) => count + 1);
    }
  }, []);

  const stack = cards.slice(0, MAX_VISIBLE_CARDS);
  const topCardId = stack[0]?.id;

  useLayoutEffect(() => {
    topTranslateX.value = 0;
  }, [topCardId, topTranslateX]);

  const renderItem: ListRenderItem<CardData> = useCallback(
    ({ item, index }) => (
      <PokeCard
        item={item}
        isTop={index === 0}
        stackTranslateX={topTranslateX}
        onSwiped={onSwiped}
      />
    ),
    [topTranslateX, onSwiped],
  );

  if (isPending) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#94a3b8" />
          <Text style={styles.status}>Loading Pokémon…</Text>
        </View>
      </View>
    );
  }

  if (error && cards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.empty}>
            {error instanceof Error ? error.message : "Failed to load Pokémon"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Do you know this Pokémon?</Text>
      <View style={styles.counters}>
        <View style={styles.counterPill}>
          <Text style={styles.counterValue}>{knownCount}</Text>
          <Text style={styles.counterLabel}>Known</Text>
        </View>
        <View style={styles.counterPill}>
          <Text style={styles.counterValue}>{unknownCount}</Text>
          <Text style={styles.counterLabel}>Unknown</Text>
        </View>
      </View>
      <View style={styles.deck}>
        {cards.length === 0 ? (
          isFetchingNextPage || hasNextPage ? (
            <>
              <ActivityIndicator size="large" color="#94a3b8" />
              <Text style={styles.status}>Loading more Pokémon…</Text>
            </>
          ) : (
            <Text style={styles.empty}>No more Pokémon</Text>
          )
        ) : (
          <>
            <FlatList
              data={stack}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              CellRendererComponent={({ children, index, style, ...props }) => (
                <View
                  style={[style, styles.cell, { zIndex: stack.length - index }]}
                  pointerEvents={index === 0 ? "box-none" : "none"}
                  {...props}
                >
                  {children}
                </View>
              )}
            />
            {isFetchingNextPage && (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color="#94a3b8" />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  counters: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingTop: 12,
  },
  counterPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  deck: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    height: "80%",
    ...StyleSheet.absoluteFill,
  },
  listContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    color: "#94a3b8",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    color: "#f8fafc",
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 120,
  },
});
