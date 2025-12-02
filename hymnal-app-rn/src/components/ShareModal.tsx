import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, Platform, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';

interface Props {
    visible: boolean;
    onClose: () => void;
    hymn: Hymn;
    hymnBook?: HymnBook;
}

export const ShareModal: React.FC<Props> = ({ visible, onClose, hymn, hymnBook }) => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const viewShotRef = useRef(null);
    const { theme } = useSettings();

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
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
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
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not share hymn.');
        }
    };

    const handleSharePress = () => {
        if (selectedKeys.size === 0) {
            Alert.alert('Selection Required', 'Please select at least one verse or chorus to share.');
            return;
        }

        if (selectedKeys.size > 1) {
            if (Platform.OS === 'ios') {
                Alert.alert(
                    'Share Options',
                    'How would you like to share?',
                    [
                        { text: 'Text Only', onPress: () => performShare('text') },
                        { text: 'Image Only', onPress: () => performShare('image') },
                        { text: 'Text & Image', onPress: () => performShare('both') },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
            } else {
                // Android supports max 3 buttons in Alert
                Alert.alert(
                    'Share Options',
                    'How would you like to share?',
                    [
                        { text: 'Text Only', onPress: () => performShare('text') },
                        { text: 'Image Only', onPress: () => performShare('image') },
                        { text: 'Text & Image', onPress: () => performShare('both') },
                    ],
                    { cancelable: true }
                );
            }
        } else {
            // Default behavior for single selection (Both/Image)
            performShare('both');
        }
    };

    const renderSelectionItem = (key: string, label: string, content: string) => {
        const isSelected = selectedKeys.has(key);
        return (
            <TouchableOpacity
                style={[
                    styles.selectionItem,
                    { backgroundColor: theme.card },
                    isSelected && { borderColor: theme.primary, backgroundColor: `${theme.primary}10` }
                ]}
                onPress={() => toggleSelection(key)}
            >
                <View style={[
                    styles.checkbox,
                    { borderColor: theme.textSecondary },
                    isSelected && { borderColor: theme.primary, backgroundColor: theme.primary }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.selectionLabel,
                        { color: theme.text },
                        isSelected && { color: theme.primary }
                    ]}>{label}</Text>
                    <Text style={[styles.selectionPreview, { color: theme.textSecondary }]} numberOfLines={1}>{content.replace(/\n/g, ' ')}</Text>
                </View>
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
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Share Lyrics</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={30} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Verses / Chorus</Text>

                    <View style={styles.selectionList}>
                        {hymn.parsedContent.verses.map((verse: any, index: number) => (
                            <React.Fragment key={`verse-${index}`}>
                                {renderSelectionItem(
                                    `verse-${index}`,
                                    `Verse ${verse.verse_name}`,
                                    verse.verse_content
                                )}
                            </React.Fragment>
                        ))}

                        {hymn.parsedContent.chorus && (
                            renderSelectionItem(
                                'chorus',
                                'Chorus',
                                hymn.parsedContent.chorus
                            )
                        )}
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Preview</Text>

                    <View style={styles.previewContainer}>
                        <View style={styles.shareCard}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardTitle}>{hymn.title}</Text>
                                    <Text style={styles.cardSubtitle}>Hymn #{hymn.number} • {hymnBook?.title}</Text>
                                </View>
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('../../assets/icon.png')}
                                        style={styles.logo}
                                    />
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.lyricsText}>
                                    {selectedContent}
                                </Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.footerLogo}
                                />
                                <Text style={styles.footerText}>Hymnal</Text>
                            </View>
                        </View>
                    </View>

                    {/* Hidden Capture View (Square) */}
                    {/* On Android, 'left: -10000' can cause the view to not render. 
                        Using 'collapsable={false}' and ensuring it's technically in the view hierarchy helps. 
                        Or we can use opacity: 0 but position it absolutely. */}
                    <View
                        collapsable={false}
                        style={{
                            position: 'absolute',
                            left: -10000,
                            top: 0,
                            opacity: 1, // Must be 1 for capture to work reliably on some Android versions
                        }}
                    >
                        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                            <View style={[styles.shareCard, { borderRadius: 0 }]}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.cardTitle}>{hymn.title}</Text>
                                        <Text style={styles.cardSubtitle}>Hymn #{hymn.number} • {hymnBook?.title}</Text>
                                    </View>
                                    <View style={styles.logoContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
                                            style={styles.logo}
                                        />
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={styles.lyricsText}>
                                        {selectedContent}
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Image
                                        source={require('../../assets/icon.png')}
                                        style={styles.footerLogo}
                                    />
                                    <Text style={styles.footerText}>Hymnal</Text>
                                </View>
                            </View>
                        </ViewShot>
                    </View>

                    <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={handleSharePress}>
                        <Text style={styles.shareButtonText}>Share</Text>
                        <Ionicons name="share-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </ScrollView>
            </View>
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
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    selectionList: {
        marginBottom: SPACING.xl,
    },
    selectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        marginBottom: SPACING.s,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        marginRight: SPACING.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    selectionPreview: {
        fontSize: 12,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    shareCard: {
        width: 320,
        backgroundColor: '#1A1A1A', // Dark theme for the card looks premium
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
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
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
        maxWidth: 220,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#AAAAAA',
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
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontWeight: '500',
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
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    shareButton: {
        borderRadius: 16,
        padding: SPACING.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
