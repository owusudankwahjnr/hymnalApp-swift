import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, Platform, Share, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNITS, ENABLE_ADS } from '../constants/Ads';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { LinearGradient } from 'expo-linear-gradient';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { MusicBackground } from './MusicBackground';

interface Props {
    visible: boolean;
    onClose: () => void;
    hymn: Hymn;
    hymnBook?: HymnBook;
}

export const ShareModal: React.FC<Props> = ({ visible, onClose, hymn, hymnBook }) => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    // Defined color themes for preview
    const PREVIEW_THEMES = [
        { id: 'dark', bg: '#1A1A1A', text: '#FFFFFF', subText: '#AAAAAA' },
        { id: 'light', bg: '#FFFFFF', text: '#000000', subText: '#666666' },
        { id: 'navy', bg: '#0F172A', text: '#FFFFFF', subText: '#94A3B8' },
        { id: 'sepia', bg: '#F5E6D3', text: '#4A3B2A', subText: '#8C7B6A' },
        { id: 'forest', bg: '#1A2F1A', text: '#FFFFFF', subText: '#A3BFA3' },
        { id: 'red', bg: '#3D0C0C', text: '#FFFFFF', subText: '#C4A3A3' },
    ];
    const [selectedThemeId, setSelectedThemeId] = useState<string>('dark');
    const activeTheme = PREVIEW_THEMES.find(t => t.id === selectedThemeId) || PREVIEW_THEMES[0];

    // Calculate Pro Width: wider but with breathing room, capped max width
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 420);

    const viewShotRef = useRef(null);
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [interstitial, setInterstitial] = useState<any>(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        if (!ENABLE_ADS) return;

        const ad = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
            requestNonPersonalizedAdsOnly: true,
        });

        const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });

        const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            // Reload or just clean up
            setAdLoaded(false);
            // Optionally reload for next time: ad.load(); 
            // But since modal might close, we'll just let next open handle it if we want.
        });

        ad.load();
        setInterstitial(ad);

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, []);

    // Set default selection to first verse when opening
    useEffect(() => {
        if (visible && hymn) {
            const firstVerse = hymn.parsedContent.verses[0];
            if (firstVerse) {
                setSelectedKeys(new Set([`verse-0`]));
            }
        }
    }, [visible, hymn]);

    const toggleSelection = (key: string) => {
        const newSelection = new Set(selectedKeys);
        if (newSelection.has(key)) {
            // Prevent deselecting if it's the last one
            if (newSelection.size > 1) {
                newSelection.delete(key);
            } else {
                // Feedback to user (optional toast or shake, but ignoring is standard for this pattern)
                return;
            }
        } else {
            newSelection.add(key);
        }
        
        // Add haptic feedback for pro feel
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        setSelectedKeys(newSelection);
    };

    const getSelectedContent = () => {
        const parts: string[] = [];

        // Iterate in order: Verses then Chorus (or however they appear, but usually we want to respect hymn structure if possible)
        // For simplicity, we'll iterate through verses indices and check if selected, then check chorus.
        // Actually, let's just loop through verses and check keys.

        hymn.parsedContent.verses.forEach((verse: any, index: number) => {
            if (selectedKeys.has(`verse-${index}`)) {
                parts.push(verse.verse_content);
            }
        });

        if (selectedKeys.has('chorus') && hymn.parsedContent.chorus) {
            parts.push(hymn.parsedContent.chorus);
        }

        return parts.join('\n\n');
    };

    const selectedContent = getSelectedContent();


    // ...

    const performShare = async (mode: 'text' | 'image' | 'both') => {
        try {
            const message = `🎵 ${hymn.title} (Hymn #${hymn.number})\n\n"${selectedContent}"\n\nCheck out this hymn on the Hymnal App: hymnalapp://hymn/${hymn.id}`;

            if (mode === 'text') {
                await Share.share({
                    message,
                    title: hymn.title,
                });
                return;
            }

            // For image or both, we need to capture
            const uri = await captureRef(viewShotRef, {
                format: 'jpg',
                quality: 0.9,
            });

            if (Platform.OS === 'android') {
                // Android: expo-sharing is best for images. 
                // It doesn't support "both" (text + image) well in one go via standard intents usually.
                // We'll just share the image for 'image' and 'both' modes on Android for now, 
                // or we could try Share.share({ url: uri, message }) but it often fails to attach image.
                // Sticking to Sharing.shareAsync for reliability with images.
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/jpeg',
                    dialogTitle: `Share ${hymn.title}`,
                });
            } else {
                // iOS
                if (mode === 'image') {
                    await Share.share({
                        url: uri,
                        title: hymn.title,
                    });
                } else {
                    // Both
                    await Share.share({
                        url: uri,
                        message,
                        title: hymn.title,
                    });
                }
            }

            // Show Interstitial Ad after share is done (or dismissed)
            // This is the "Value Exchange" moment
            if (adLoaded && interstitial) {
                setTimeout(() => {
                    try {
                        interstitial.show();
                    } catch (e) {
                        console.log('Ad show failed', e);
                    }
                }, 500); // Small delay to allow share sheet to close completely
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not share hymn.');
        }
    };

    const [shareFormat, setShareFormat] = useState<'image' | 'text' | 'both'>('image');
    
    // Animation for Format Selector
    const formatTranslateX = useSharedValue(0);
    const SELECTOR_PADDING = 4;
    const SELECTOR_WIDTH = SCREEN_WIDTH - (SPACING.l * 2);
    const TAB_WIDTH = (SELECTOR_WIDTH - (SELECTOR_PADDING * 2)) / 3;

    useEffect(() => {
        const index = shareFormat === 'image' ? 0 : shareFormat === 'text' ? 1 : 2;
        formatTranslateX.value = withSpring(index * TAB_WIDTH, {
            damping: 20,
            stiffness: 180,
            mass: 0.8,
        });
    }, [shareFormat, TAB_WIDTH]);

    const animatedPillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: formatTranslateX.value }],
    }));

    const handleFormatChange = (format: 'image' | 'text' | 'both') => {
        if (format !== shareFormat) {
            setShareFormat(format);
            Haptics.selectionAsync(); // Light haptic for switching
        }
    };
    const handleSharePress = () => {
        if (selectedKeys.size === 0) {
            Alert.alert('Selection Required', 'Please select at least one verse or chorus to share.');
            return;
        }

        // Direct Share using selected format
        performShare(shareFormat);
    };

    const handleShareLink = async () => {
        try {
            const deepLink = `hymnalapp://hymn/${hymn.id}`;
            const hymnTitle = `Hymn #${hymn.number} - ${hymn.title}`;
            const bookName = hymnBook?.title || 'Hymnals';
            
            const message = `Check out ${hymnTitle} from ${bookName} in the Hymnals app!\n\nOpen in App: ${deepLink}`;
            
            await Share.share({
                message,
                title: hymnTitle,
            });
        } catch (error) {
            console.error('Error sharing link:', error);
        }
    };

    const handleCopyLink = async () => {
        try {
            const deepLink = `hymnalapp://hymn/${hymn.id}`;
            await Clipboard.setStringAsync(deepLink);
            Alert.alert('Link Copied', 'Hymn link copied to clipboard.');
        } catch (error) {
            console.error('Error copying link:', error);
            Alert.alert('Error', 'Could not copy link.');
        }
    };

    const renderSelectionItem = (key: string, shortLabel: string) => {
        const isSelected = selectedKeys.has(key);
        
        return (
            <TouchableOpacity
                style={[
                    styles.gridItem,
                    { borderColor: isSelected ? palette.accent : palette.border }
                ]}
                onPress={() => toggleSelection(key)}
            >
                <LinearGradient
                    colors={isSelected ? [palette.accent, palette.accentSecondary] : palette.rowGradient}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                <Text style={[
                    styles.gridLabel,
                    { color: isSelected ? '#FFFFFF' : palette.textMuted },
                    isSelected && { color: '#FFFFFF' }
                ]}>{shortLabel.toUpperCase()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <MusicBackground variant="player" style={styles.container}>
                <View style={[styles.header, { borderBottomColor: palette.divider, backgroundColor: palette.glassStrong }]}>
                    <Text style={[styles.headerTitle, { color: palette.text }]}>Share Lyrics</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: palette.glassStrong }]}>
                        <Ionicons name="close" size={20} color={palette.textMuted} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={[styles.sectionTitle, { color: palette.text }]}>Select Verses / Chorus</Text>

                    <View style={styles.selectionGrid}>
                        {hymn.parsedContent.verses.map((verse: any, index: number) => (
                            <React.Fragment key={`verse-${index}`}>
                                {renderSelectionItem(
                                    `verse-${index}`,
                                    verse.verse_tag
                                )}
                            </React.Fragment>
                        ))}

                        {hymn.parsedContent.chorus && (
                            renderSelectionItem(
                                'chorus',
                                'CH'
                            )
                        )}
                    </View>

                    <Text style={[styles.sectionTitle, { color: palette.text }]}>Preview</Text>

                    <View style={styles.previewContainer}>
                        {/* Single Preview Card with Active Theme */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[
                                styles.previewWrapper,
                                { borderColor: palette.border }
                            ]}
                        >
                            <View style={[styles.shareCard, { backgroundColor: activeTheme.bg, width: CARD_WIDTH }]}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={[styles.cardTitle, { color: activeTheme.text }]} numberOfLines={1}>{hymn.title}</Text>
                                        <Text style={[styles.cardSubtitle, { color: activeTheme.subText }]}>Hymn #{hymn.number}</Text>
                                    </View>
                                    <View style={styles.logoContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
                                            style={styles.logo}
                                        />
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={[styles.lyricsText, { color: activeTheme.text, fontSize: 16, lineHeight: 24 }]} numberOfLines={20}>
                                        {selectedContent}
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Image
                                        source={require('../../assets/icon.png')}
                                        style={styles.footerLogo}
                                    />
                                    <Text style={[styles.footerText, { color: activeTheme.text }]}>Hymnals</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Color Circles Selector */}
                    <View style={styles.colorSelector}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorList}>
                            {PREVIEW_THEMES.map((t) => {
                                const isSelected = selectedThemeId === t.id;
                                return (
                                    <TouchableOpacity
                                        key={t.id}
                                        onPress={() => setSelectedThemeId(t.id)}
                                        style={[
                                            styles.colorCircle,
                                            { backgroundColor: t.bg, borderColor: isSelected ? palette.accent : palette.border },
                                            isSelected && styles.colorCircleSelected
                                        ]}
                                    >
                                        {isSelected && <Ionicons name="checkmark" size={16} color={t.text} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Hidden Capture View (Uses Active Theme) */}
                    <View
                        collapsable={false}
                        style={{
                            position: 'absolute',
                            left: -10000,
                            top: 0,
                            opacity: 1,
                        }}
                    >
                        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                            <View style={[styles.shareCard, { borderRadius: 0, backgroundColor: activeTheme.bg, width: CARD_WIDTH }]}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={[styles.cardTitle, { color: activeTheme.text }]}>{hymn.title}</Text>
                                        <Text style={[styles.cardSubtitle, { color: activeTheme.subText }]}>Hymn #{hymn.number} • {hymnBook?.title}</Text>
                                    </View>
                                    <View style={styles.logoContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
                                            style={styles.logo}
                                        />
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={[styles.lyricsText, { color: activeTheme.text }]}>
                                        {selectedContent}
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Image
                                        source={require('../../assets/icon.png')}
                                        style={styles.footerLogo}
                                    />
                                    <Text style={[styles.footerText, { color: activeTheme.text }]}>Hymnals</Text>
                                </View>
                            </View>
                        </ViewShot>
                    </View>

                     {/* Format Selector */}
                    <Text style={[styles.sectionTitle, { color: palette.text, marginTop: 0 }]}>Format</Text>
                    <View style={[styles.formatSelector, { backgroundColor: palette.glass, borderColor: palette.border }]}>
                        {/* Animated Selection Pill */}
                        <Animated.View 
                            style={[
                                styles.formatPill, 
                                { 
                                    backgroundColor: palette.accent,
                                    width: TAB_WIDTH,
                                }, 
                                animatedPillStyle
                            ]} 
                        />
                        
                        <TouchableOpacity 
                            style={styles.formatOption}
                            onPress={() => handleFormatChange('image')}
                        >
                            <Ionicons 
                                name="image-outline" 
                                size={18} 
                                color={shareFormat === 'image' ? '#FFFFFF' : palette.textMuted} 
                            />
                            <Text style={[
                                styles.formatText, 
                                { color: shareFormat === 'image' ? '#FFFFFF' : palette.textMuted }
                            ]}>Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.formatOption}
                            onPress={() => handleFormatChange('text')}
                        >
                            <Ionicons 
                                name="document-text-outline" 
                                size={18} 
                                color={shareFormat === 'text' ? '#FFFFFF' : palette.textMuted} 
                            />
                            <Text style={[
                                styles.formatText, 
                                { color: shareFormat === 'text' ? '#FFFFFF' : palette.textMuted }
                            ]}>Text</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.formatOption}
                            onPress={() => handleFormatChange('both')}
                        >
                            <Ionicons 
                                name="layers-outline" 
                                size={18} 
                                color={shareFormat === 'both' ? '#FFFFFF' : palette.textMuted} 
                            />
                            <Text style={[
                                styles.formatText, 
                                { color: shareFormat === 'both' ? '#FFFFFF' : palette.textMuted }
                            ]}>Both</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Link Actions */}
                    <View style={styles.linkActionsContainer}>
                        <TouchableOpacity 
                            style={[styles.linkActionButton, { backgroundColor: palette.glassStrong, borderColor: palette.border }]} 
                            onPress={handleShareLink}
                        >
                            <Ionicons name="link-outline" size={18} color={palette.accent} />
                            <Text style={[styles.linkActionText, { color: palette.accent }]}>Share Link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.linkActionButton, { backgroundColor: palette.glassStrong, borderColor: palette.border }]} 
                            onPress={handleCopyLink}
                        >
                            <Ionicons name="copy-outline" size={18} color={palette.accent} />
                            <Text style={[styles.linkActionText, { color: palette.accent }]}>Copy Link</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.shareButton, { shadowColor: palette.shadow }]} onPress={handleSharePress}>
                        <LinearGradient colors={[palette.accent, palette.accentSecondary]} style={StyleSheet.absoluteFill} />
                        <Text style={styles.shareButtonText}>Share</Text>
                        <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </ScrollView>
            </MusicBackground>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: MUSIC_FONTS.display,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    selectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: SPACING.xl,
    },
    gridItem: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    gridLabel: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.ui,
        letterSpacing: 0.8,
    },
    selectionPreview: {
        fontSize: 12,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 40, // Increased from SPACING.xl
    },
    shareCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        // Internal shadow for core content
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    cardHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: MUSIC_FONTS.display,
        color: '#FFFFFF',
        marginBottom: 4,
        maxWidth: 260,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#AAAAAA',
        fontFamily: MUSIC_FONTS.body,
    },
    logoContainer: {
        // Optional top logo
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
    cardBody: {
        marginBottom: 32,
        width: '100%',
    },
    lyricsText: {
        fontSize: 20,
        lineHeight: 30,
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: MUSIC_FONTS.body,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    footerLogo: {
        width: 20,
        height: 20,
        borderRadius: 5,
        marginRight: 8,
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    shareButton: {
        borderRadius: 18,
        padding: SPACING.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: MUSIC_FONTS.ui,
    },
    previewScroll: {
        marginBottom: SPACING.xl,
    },
    previewScrollContent: {
        paddingHorizontal: SPACING.s,
        paddingBottom: SPACING.m,
        paddingTop: SPACING.m,
    },
    checkmarkBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    colorSelector: {
        marginBottom: 24, // Reduced from 40
    },
    colorList: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 12, // More breathing room
        alignItems: 'center',
    },
    colorCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginHorizontal: 10, // Slightly more space
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorCircleSelected: {
        transform: [{ scale: 1.1 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    // Ensure previewWrapper doesn't rely on scrollview content container
    previewWrapper: {
        borderRadius: 26,
        borderWidth: 1, // subtle border
        borderColor: 'transparent',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    formatSelector: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        padding: 4,
        height: 48,
        position: 'relative',
    },
    formatPill: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    formatOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        gap: 6,
    },
    formatText: {
        fontFamily: MUSIC_FONTS.ui,
        fontSize: 14,
    },
    linkActionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    linkActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 8,
    },
    linkActionText: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
});
