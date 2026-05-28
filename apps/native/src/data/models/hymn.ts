/**
 * Core data models for the Hymn Book application
 */

export interface Hymn {
  readonly id: number;
  readonly title: string;
  readonly number: number;
  readonly language: string | null;
  readonly content: string;
  readonly verses: ReadonlyArray<string>;
  readonly chorus?: string; // Optional chorus for hymns that have one
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SearchCriteria {
  readonly query: string;
  readonly searchType: "title" | "number" | "content" | "language";
}

export interface AppState {
  readonly currentHymn: Hymn | null;
  readonly searchResults: ReadonlyArray<Hymn>;
  readonly isLoading: boolean;
}
