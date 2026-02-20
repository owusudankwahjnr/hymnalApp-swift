import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActionSheetIOS } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { ReportModal } from '../components/ReportModal';
import { AdBannerWrapper } from '../components/AdBannerWrapper';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { MusicBackground } from '../components/MusicBackground';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme, themeMode, setThemeMode } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const [showReport, setShowReport] = useState(false);

    const handleAboutPress = () => {
        navigation.navigate('About' as never);
    };

    const handleTermsPress = () => {
        navigation.navigate('Terms' as never);
    };

    const handleReportPress = () => {
        setShowReport(true);
    };

    const handleAcknowledgementsPress = () => {
        navigation.navigate('Acknowledgements' as never);
    };

    const handleThemeChange = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'System Default', 'Light', 'Dark'],
                    cancelButtonIndex: 0,
                    title: 'Choose Appearance',
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) setThemeMode('system');
                    if (buttonIndex === 2) setThemeMode('light');
                    if (buttonIndex === 3) setThemeMode('dark');
                }
            );
        } else {
            Alert.alert(
                'Choose Appearance',
                'Select your preferred theme',
                [
                    { text: 'System Default', onPress: () => setThemeMode('system') },
                    { text: 'Light', onPress: () => setThemeMode('light') },
                    { text: 'Dark', onPress: () => setThemeMode('dark') },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }
    };

    const getThemeLabel = () => {
        if (themeMode === 'system') return 'System Default';
        if (themeMode === 'light') return 'Light';
        if (themeMode === 'dark') return 'Dark';
        return 'System';
    };

    const renderSectionHeader = (title: string) => (
        <Text style={[styles.sectionHeader, { color: palette.textMuted }]}>{title}</Text>
    );

    const renderItem = (icon: keyof typeof Ionicons.glyphMap, title: string, subtitle?: string, onPress?: () => void, rightElement?: React.ReactNode) => (
        <TouchableOpacity
            style={[styles.itemContainer, { borderColor: palette.border, backgroundColor: palette.surface }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.85}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { borderColor: palette.border }]}>
                    <Ionicons name={icon} size={20} color={palette.textMuted} />
                </View>
                <View style={styles.itemText}>
                    <Text style={[styles.itemTitle, { color: palette.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.itemSubtitle, { color: palette.textMuted }]}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />}
        </TouchableOpacity>
    );

    return (
        <MusicBackground variant="library" style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: palette.divider }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: palette.text }]}>Settings</Text>
                    <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>Personalize your experience</Text>
                </View>
                <View style={[styles.headerBadge, { backgroundColor: palette.surface }]}>
                    <Ionicons name="sparkles" size={16} color={palette.textMuted} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSectionHeader('General')}
                <View style={[styles.section, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                    {renderItem('information-circle-outline', 'About App / Developer', 'The vision and team', handleAboutPress)}
                    <View style={[styles.separator, { backgroundColor: palette.divider }]} />
                    {renderItem('heart-circle-outline', 'Acknowledgements', 'Thanks and credits', handleAcknowledgementsPress)}
                    <View style={[styles.separator, { backgroundColor: palette.divider }]} />
                    {renderItem('document-text-outline', 'Terms and Conditions', 'Legal and usage', handleTermsPress)}
                </View>

                {renderSectionHeader('Appearance')}
                <View style={[styles.section, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                    {renderItem(
                        'moon-outline',
                        'Appearance',
                        getThemeLabel(),
                        handleThemeChange,
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.inlineValue, { color: palette.textMuted }]}>{getThemeLabel()}</Text>
                            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
                        </View>
                )}
                </View>

                {renderSectionHeader('Support')}
                <View style={[styles.section, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                    {renderItem('bug-outline', 'Report a Bug', 'Help us improve', handleReportPress)}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: palette.textMuted }]}>Hymnal App v1.0.0</Text>
                    <Text style={[styles.footerText, { color: palette.textMuted }]}>Made with care by KOD</Text>
                </View>
            </ScrollView>

            <ReportModal
                visible={showReport}
                onClose={() => setShowReport(false)}
            />
            <AdBannerWrapper />
        </SafeAreaView>
        </MusicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safe: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: MUSIC_FONTS.display,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
        marginTop: 6,
    },
    headerBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: SPACING.m,
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
        marginLeft: SPACING.s,
        letterSpacing: 0.2,
    },
    section: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: SPACING.m,
        borderWidth: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
        borderWidth: 1,
    },
    itemText: {
        gap: 4,
    },
    itemTitle: {
        fontSize: 17,
        fontFamily: MUSIC_FONTS.ui,
    },
    itemSubtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
    },
    separator: {
        height: 1,
        marginLeft: 56, // Align with text start
    },
    inlineValue: {
        marginRight: 8,
        fontSize: 14,
        fontFamily: MUSIC_FONTS.body,
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        marginBottom: 4,
        fontFamily: MUSIC_FONTS.body,
    },
});
