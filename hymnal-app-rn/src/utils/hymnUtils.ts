import Hymn from '../db/models/Hymn';

export const getHymnMatchType = (hymn: Hymn, query: string): 'verse' | 'chorus' | undefined => {
    if (!query) return undefined;

    const lowerQuery = query.toLowerCase();
    const content = hymn.parsedContent;

    // Check verses safely
    if (content.verses && Array.isArray(content.verses)) {
        const verseMatch = content.verses.some((v: any) =>
            v && typeof v.verse_content === 'string' && v.verse_content.toLowerCase().includes(lowerQuery)
        );
        if (verseMatch) {
            return 'verse';
        }
    }

    // Check chorus safely if no verse match
    if (typeof content.chorus === 'string') {
        const chorusMatch = content.chorus.toLowerCase().includes(lowerQuery);
        if (chorusMatch) {
            return 'chorus';
        }
    }

    return undefined;
};
