export interface StickyNotesNote {
    id: string;
    name: string;
    content: string;
}

export interface StickyNotesSettings {
    notes: StickyNotesNote[];
}