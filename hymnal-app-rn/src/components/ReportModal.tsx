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
                style={[{ flex: 1 }, { backgroundColor: theme.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
                    <View style={[styles.container, { backgroundColor: theme.background }]}>
                        <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>Report an Issue</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close-circle" size={30} color={theme.textSecondary} />
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
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>What's the issue?</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeCard,
                                        { backgroundColor: theme.card },
                                        reportType === 'hymn_issue' && { borderColor: theme.primary, backgroundColor: `${theme.primary}05` }
                                    ]}
                                    onPress={() => setReportType('hymn_issue')}
                                    disabled={!hymn}
                                >
                                    <View style={[
                                        styles.iconCircle,
                                        { backgroundColor: theme.background },
                                        reportType === 'hymn_issue' && { backgroundColor: `${theme.primary}15` }
                                    ]}>
                                        <Ionicons
                                            name="musical-notes"
                                            size={24}
                                            color={reportType === 'hymn_issue' ? theme.primary : theme.textSecondary}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.typeTitle,
                                        { color: theme.text },
                                        reportType === 'hymn_issue' && { color: theme.primary }
                                    ]}>
                                        Hymn Content
                                    </Text>
                                    <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>
                                        Typos, wrong lyrics, or missing verses.
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeCard,
                                        { backgroundColor: theme.card },
                                        reportType === 'app_bug' && { borderColor: theme.primary, backgroundColor: `${theme.primary}05` }
                                    ]}
                                    onPress={() => setReportType('app_bug')}
                                >
                                    <View style={[
                                        styles.iconCircle,
                                        { backgroundColor: theme.background },
                                        reportType === 'app_bug' && { backgroundColor: `${theme.primary}15` }
                                    ]}>
                                        <Ionicons
                                            name="bug"
                                            size={24}
                                            color={reportType === 'app_bug' ? theme.primary : theme.textSecondary}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.typeTitle,
                                        { color: theme.text },
                                        reportType === 'app_bug' && { color: theme.primary }
                                    ]}>
                                        App Bug
                                    </Text>
                                    <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>
                                        Crashes, glitches, or feedback.
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {hymn && reportType === 'hymn_issue' && (
                                <View style={[styles.hymnPreview, { backgroundColor: theme.card }]}>
                                    <Ionicons name="document-text-outline" size={20} color={theme.textSecondary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.previewTitle, { color: theme.text }]}>{hymn.title}</Text>
                                        <Text style={[styles.previewSubtitle, { color: theme.textSecondary }]}>Hymn #{hymn.number} • {hymnBook?.title}</Text>
                                    </View>
                                </View>
                            )}

                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                                placeholder="Please describe the issue in detail..."
                                placeholderTextColor={theme.textSecondary}
                                multiline
                                numberOfLines={6}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                                keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
                            />

                            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={handleSend}>
                                <Text style={styles.sendButtonText}>Send Report</Text>
                                <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>

                            <View style={{ height: Platform.OS === 'ios' ? 150 : 200 }} />
                        </KeyboardAwareScrollView>
                    </View>
                </SafeAreaView>
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
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
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
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'flex-start',
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
        fontWeight: 'bold',
        marginBottom: 4,
    },
    typeDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    hymnPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.l,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    previewSubtitle: {
        fontSize: 14,
    },
    input: {
        borderRadius: 16,
        padding: SPACING.m,
        height: 150,
        fontSize: 16,
        marginBottom: SPACING.xl,
        borderWidth: 1,
    },
    sendButton: {
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
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
