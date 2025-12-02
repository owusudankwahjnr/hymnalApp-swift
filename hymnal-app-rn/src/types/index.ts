export interface Verse {
  verse_tag: string;
  verse_name: string;
  verse_content: string;
}

export interface HymnContent {
  verses: Verse[];
  chorus?: string;
}

export interface Hymn {
  id: string;
  title: string;
  number: number;
  hymn_book_id: string;
  variant_key?: string | null;
  content: HymnContent;
}

export interface HymnBook {
  id: string;
  title: string;
  thumbnail_path?: string | null;
  hymns?: Hymn[];
}

export interface HymnSummary {
  id: string;
  title: string;
  number: number;
  hymn_book_id: string;
  hymn_book_title: string;
  variant_key?: string | null;
}
