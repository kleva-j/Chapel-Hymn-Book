/**
 * Core data models for the Hymn Book application
 */

import { Schema } from "effect";

export class Hymn extends Schema.Class<Hymn>("Hymn")({
  id: Schema.Number,
  title: Schema.NonEmptyString,
  number: Schema.Number,
  content: Schema.NonEmptyString,
  verses: Schema.Array(Schema.NonEmptyString),
  chorus: Schema.optional(Schema.NonEmptyString),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {}

const SEARCH_CRITERIA = {
  TITLE: "title",
  NUMBER: "number",
  CONTENT: "content",
} as const;

export const SearchType = Schema.Literal(...Object.values(SEARCH_CRITERIA));

export class SearchCriteria extends Schema.Class<SearchCriteria>(
  "SearchCriteria",
)({
  query: Schema.NonEmptyString,
  searchType: SearchType,
}) {}

export class AppState extends Schema.Class<AppState>("AppState")({
  currentHymn: Schema.optional(Hymn),
  searchResults: Schema.Array(Hymn),
  isLoading: Schema.Boolean,
}) {}
