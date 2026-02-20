/**
 * LRC (Lyric) file parser utility
 * Parses standard LRC format with timestamps like [mm:ss.xx]
 */

export interface LyricLine {
    time: number;  // Time in seconds
    text: string;  // Lyric text
}

export interface LRCMetadata {
    title?: string;
    artist?: string;
    album?: string;
    by?: string;
    offset?: number;
}

export interface ParsedLRC {
    metadata: LRCMetadata;
    lyrics: LyricLine[];
}

/**
 * Parse LRC timestamp [mm:ss.xx] to seconds
 */
const parseTimestamp = (timestamp: string): number => {
    // Match [mm:ss.xx] or [mm:ss] format
    const match = timestamp.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/);
    if (!match) return -1;

    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const centiseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;

    return minutes * 60 + seconds + centiseconds / 1000;
};

/**
 * Check if a line is a metadata tag
 */
const isMetadataLine = (line: string): boolean => {
    const metadataTags = ['ti:', 'ar:', 'al:', 'by:', 'offset:', 'length:', 're:', 've:'];
    const content = line.toLowerCase();
    return metadataTags.some(tag => content.includes(`[${tag}`));
};

/**
 * Parse metadata from LRC line
 */
const parseMetadata = (line: string): Partial<LRCMetadata> => {
    const titleMatch = line.match(/\[ti:(.*?)\]/i);
    const artistMatch = line.match(/\[ar:(.*?)\]/i);
    const albumMatch = line.match(/\[al:(.*?)\]/i);
    const byMatch = line.match(/\[by:(.*?)\]/i);
    const offsetMatch = line.match(/\[offset:(.*?)\]/i);

    const metadata: Partial<LRCMetadata> = {};
    if (titleMatch) metadata.title = titleMatch[1].trim();
    if (artistMatch) metadata.artist = artistMatch[1].trim();
    if (albumMatch) metadata.album = albumMatch[1].trim();
    if (byMatch) metadata.by = byMatch[1].trim();
    if (offsetMatch) metadata.offset = parseInt(offsetMatch[1], 10);

    return metadata;
};

/**
 * Parse a single LRC line into LyricLine(s)
 * Handles multiple timestamps on the same line
 */
const parseLine = (line: string): LyricLine[] => {
    const results: LyricLine[] = [];
    
    // Match all timestamps in the line
    const timestampRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]/g;
    const timestamps: number[] = [];
    let match;
    
    while ((match = timestampRegex.exec(line)) !== null) {
        const time = parseTimestamp(`[${match[1]}]`);
        if (time >= 0) {
            timestamps.push(time);
        }
    }
    
    // Extract the text (everything after the last timestamp)
    const text = line.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
    
    // Create a LyricLine for each timestamp
    timestamps.forEach(time => {
        results.push({ time, text });
    });
    
    return results;
};

/**
 * Parse LRC content string into structured data
 */
export const parseLRC = (lrcContent: string): ParsedLRC => {
    const lines = lrcContent.split(/\r?\n/);
    const metadata: LRCMetadata = {};
    const lyrics: LyricLine[] = [];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Check for metadata
        if (isMetadataLine(trimmedLine)) {
            const parsed = parseMetadata(trimmedLine);
            Object.assign(metadata, parsed);
            continue;
        }
        
        // Parse lyric lines
        const parsedLines = parseLine(trimmedLine);
        lyrics.push(...parsedLines);
    }
    
    // Sort by time
    lyrics.sort((a, b) => a.time - b.time);
    
    // Apply offset if specified
    if (metadata.offset) {
        const offsetSeconds = metadata.offset / 1000;
        lyrics.forEach(lyric => {
            lyric.time += offsetSeconds;
        });
    }
    
    // Filter out empty text lines but keep instrumental breaks
    const filteredLyrics = lyrics.filter(lyric => {
        // Keep lines with text, filter out attribution/metadata-like content
        if (!lyric.text) return false;
        if (lyric.text.toLowerCase().includes('rentanadviser')) return false;
        return true;
    });
    
    return { metadata, lyrics: filteredLyrics };
};

/**
 * Convert LyricLine array to JSON string (for storage/passing)
 */
export const lyricsToJSON = (lyrics: LyricLine[]): string => {
    return JSON.stringify(lyrics);
};

/**
 * Parse JSON string back to LyricLine array
 */
export const lyricsFromJSON = (jsonString: string): LyricLine[] => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return [];
    }
};

/**
 * Format seconds to mm:ss display format
 */
export const formatLyricTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
