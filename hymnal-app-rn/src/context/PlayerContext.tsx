import React, { createContext, useContext, useState, useEffect } from 'react';
import TrackPlayer, { State, Event, useTrackPlayerEvents } from 'react-native-track-player';

const fallbackAudio = require('../../assets/audio/my-love-westlife.mp3');

interface PlayerContextType {
    isPlaying: boolean;
    currentTrack: any | null;
    playTrack: (track: any) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    seekTo: (seconds: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any | null>(null);

    useEffect(() => {
        const setupPlayer = async () => {
            try {
                await TrackPlayer.setupPlayer();
                await TrackPlayer.updateOptions({
                    // stopWithApp: true, // Deprecated/Invalid
                    capabilities: [
                        // Capability.Play,
                        // Capability.Pause,
                        // Capability.SkipToNext,
                        // Capability.SkipToPrevious,
                        // Capability.SeekTo,
                    ],
                    compactCapabilities: [
                        // Capability.Play,
                        // Capability.Pause,
                    ],
                });
            } catch (e) {
                // Player might already be initialized
                console.log('Player setup error or already initialized', e);
            }
        };

        setupPlayer();
    }, []);

    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackState) {
            setIsPlaying(event.state === State.Playing);
        }
        if (event.type === Event.PlaybackTrackChanged) {
            if (event.nextTrack) {
                const track = await TrackPlayer.getTrack(event.nextTrack);
                setCurrentTrack((prev) => ({
                    ...(track as any),
                    mediaType: (track as any)?.mediaType ?? prev?.mediaType ?? 'music',
                }));
            }
        }
    });

    const playTrack = async (track: any) => {
        const mediaType = track.mediaType || 'music';
        await TrackPlayer.reset();
        await TrackPlayer.add({
            id: track.id,
            url: track.audioUrl || track.url || fallbackAudio, // Local fallback for dev
            title: track.title,
            artist: track.artist || 'Unknown Artist',
            artwork: track.albumArt || track.artwork || 'https://via.placeholder.com/150',
            duration: track.duration,
            lyrics: track.lyrics,
            mediaType,
        });
        console.log('[PlayerContext] Added track with lyrics:', track.lyrics ? 'Yes' : 'No', track.lyrics);
        await TrackPlayer.play();
        setCurrentTrack({ ...track, mediaType });
        setIsPlaying(true);
    };

    const pause = async () => {
        await TrackPlayer.pause();
    };

    const resume = async () => {
        await TrackPlayer.play();
    };

    const seekTo = async (seconds: number) => {
        await TrackPlayer.seekTo(seconds);
    };

    return (
        <PlayerContext.Provider value={{ isPlaying, currentTrack, playTrack, pause, resume, seekTo }}>
            {children}
        </PlayerContext.Provider>
    );
};
