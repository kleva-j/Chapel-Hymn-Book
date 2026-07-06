import { Text, type TextProps } from "react-native";

/**
 * Render `text` with the first case-insensitive occurrence of `query`
 * wrapped in a bold-emphasized inner `<Text>`. Used by the hymn list to
 * visually anchor why a search row matched.
 *
 * Empty query, or no match, falls through to a plain `<Text>` so the
 * component is safe to drop into a list row that may or may not be in
 * "search mode."
 *
 * Only the first occurrence is highlighted on purpose — hymn titles are
 * short and a single highlight reads cleanly. Multi-match support is a
 * Phase 4 polish concern.
 */
export interface HighlightedTextProps extends Omit<TextProps, "children"> {
  readonly text: string;
  readonly query: string;
  readonly highlightClassName?: string;
}

export function HighlightedText({
  text,
  query,
  highlightClassName = "font-bold",
  ...rest
}: HighlightedTextProps) {
  const trimmed = query.trim();
  if (!trimmed) return <Text {...rest}>{text}</Text>;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <Text {...rest}>{text}</Text>;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + trimmed.length);
  const after = text.slice(idx + trimmed.length);

  return (
    <Text {...rest}>
      {before}
      <Text className={highlightClassName}>{match}</Text>
      {after}
    </Text>
  );
}
