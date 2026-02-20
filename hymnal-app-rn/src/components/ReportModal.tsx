import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Linking, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
    hymn?: Hymn;
    hymnBook?: HymnBook;
}

type ReportType = 'hymn_issue' | 'app_bug' | 'other';

const ReportModalComponent: React.FC<Props> = ({ visible, onClose, hymn, hymnBook }) => {
    const [reportType, setReportType] = useState<ReportType>('hymn_issue');
    const [description, setDescription] = useState('');
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);

    const handleSend = async () => {
        const subject = reportType === 'hymn_issue'
            ? `Report: Hymn Issue - ${hymn?.title} (#${hymn?.number})`
            : `Report: App Bug / Feedback`;

        const body = `
Report Type: ${reportType === 'hymn_issue' ? 'Hymn Issue' : 'App Bug/Feedback'}
${hymn ? `Hymn: ${hymn.title} (#${hymn.number})` : ''}
${hymnBook ? `Book: ${hymnBook.title}` : ''}

Description:
${description}

--------------------------------
Device: ${Platform.OS} ${Platform.Version}
App Version: 1.0.0
`;

        const isAvailable = await MailComposer.isAvailableAsync();

        if (isAvailable) {
            await MailComposer.composeAsync({
                recipients: ['example@gmail.com'],
                subject: subject,
                body: body,
            });
            onClose();
        } else {
            const url = `mailto:example@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
                await Linking.openURL(url);
                onClose();
            } else {
                Alert.alert('Error', 'Could not open email client.');
            }
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={[{ flex: 1 }, { backgroundColor: palette.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <MusicBackground variant="player" style={{ flex: 1 }}>
                    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                        <View style={styles.container}>
                            <View style={[styles.header, { borderBottomColor: palette.divider, backgroundColor: palette.glassStrong }]}>
                                <Text style={[styles.headerTitle, { color: palette.text }]}>Report an Issue</Text>
                                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: palette.glassStrong }]}>
                                    <Ionicons name="close" size={20} color={palette.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <KeyboardAwareScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={styles.content}
                                enableOnAndroid={true}
                                enableAutomaticScroll={true}
                                extraScrollHeight={Platform.OS === 'ios' ? 200 : 250}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={[styles.sectionTitle, { color: palette.text }]}>What's the issue?</Text>
                                <View style={styles.typeContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeCard,
                                            { borderColor: reportType === 'hymn_issue' ? palette.accent : palette.border },
                                            !hymn && styles.typeCardDisabled,
                                        ]}
                                        onPress={() => setReportType('hymn_issue')}
                                        disabled={!hymn}
                                    >
                                        <LinearGradient
                                            colors={reportType === 'hymn_issue' ? [palette.accent + '26', palette.accentSecondary + '20'] : palette.rowGradient}
                                            style={StyleSheet.absoluteFill}
                                            pointerEvents="none"
                                        />
                                        <View style={[
                                            styles.iconCircle,
                                            { backgroundColor: reportType === 'hymn_issue' ? palette.accent + '25' : palette.glass }
                                        ]}>
                                            <Ionicons
                                                name="musical-notes"
                                                size={22}
                                                color={reportType === 'hymn_issue' ? palette.accent : palette.textMuted}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.typeTitle,
                                            { color: reportType === 'hymn_issue' ? palette.accent : palette.text }
                                        ]}>
                                            Hymn Content
                                        </Text>
                                        <Text style={[styles.typeDescription, { color: palette.textMuted }]}>
                                            Typos, wrong lyrics, or missing verses.
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.typeCard,
                                            { borderColor: reportType === 'app_bug' ? palette.accentSecondary : palette.border },
                                        ]}
                                        onPress={() => setReportType('app_bug')}
                                    >
                                        <LinearGradient
                                            colors={reportType === 'app_bug' ? [palette.accentSecondary + '26', palette.accent + '20'] : palette.rowGradient}
                                            style={StyleSheet.absoluteFill}
                                            pointerEvents="none"
                                        />
                                        <View style={[
                                            styles.iconCircle,
                                            { backgroundColor: reportType === 'app_bug' ? palette.accentSecondary + '25' : palette.glass }
                                        ]}>
                                            <Ionicons
                                                name="bug"
                                                size={22}
                                                color={reportType === 'app_bug' ? palette.accentSecondary : palette.textMuted}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.typeTitle,
                                            { color: reportType === 'app_bug' ? palette.accentSecondary : palette.text }
                                        ]}>
                                            App Bug
                                        </Text>
                                        <Text style={[styles.typeDescription, { color: palette.textMuted }]}>
                                            Crashes, glitches, or feedback.
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {hymn && reportType === 'hymn_issue' && (
                                    <View style={[styles.hymnPreview, { borderColor: palette.border }]}>
                                        <LinearGradient colors={palette.cardGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
                                        <View style={[styles.previewIcon, { backgroundColor: palette.accent + '20' }]}>
                                            <Ionicons name="document-text-outline" size={18} color={palette.accent} />
                                        </View>
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[styles.previewTitle, { color: palette.text }]}>{hymn.title}</Text>
                                            <Text style={[styles.previewSubtitle, { color: palette.textMuted }]}>Hymn #{hymn.number} • {hymnBook?.title}</Text>
                                        </View>
                                    </View>
                                )}

                                <Text style={[styles.sectionTitle, { color: palette.text }]}>Details</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: palette.glassStrong, color: palette.text, borderColor: palette.border }]}
                                    placeholder="Please describe the issue in detail..."
                                    placeholderTextColor={palette.textMuted}
                                    multiline
                                    numberOfLines={6}
                                    value={description}
                                    onChangeText={setDescription}
                                    textAlignVertical="top"
                                    keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
                                />

                                <TouchableOpacity style={[styles.sendButton, { shadowColor: palette.shadow }]} onPress={handleSend}>
                                    <LinearGradient colors={[palette.accent, palette.accentSecondary]} style={StyleSheet.absoluteFill} />
                                    <Text style={styles.sendButtonText}>Send Report</Text>
                                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>

                                <View style={{ height: Platform.OS === 'ios' ? 150 : 200 }} />
                            </KeyboardAwareScrollView>
                        </View>
                    </SafeAreaView>
                </MusicBackground>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Export the component directly without withObservables since hymn and hymnBook are optional
export const ReportModal = ReportModalComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
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
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    typeCard: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    typeCardDisabled: {
        opacity: 0.5,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    typeTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: 4,
    },
    typeDescription: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: MUSIC_FONTS.body,
    },
    hymnPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.l,
        borderWidth: 1,
        overflow: 'hidden',
    },
    previewIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewTitle: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
    },
    previewSubtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
    },
    input: {
        borderRadius: 18,
        padding: SPACING.m,
        height: 150,
        fontSize: 16,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        fontFamily: MUSIC_FONTS.body,
    },
    sendButton: {
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
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: MUSIC_FONTS.ui,
    },
});
