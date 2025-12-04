import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, ActionSheetIOS } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { ReportModal } from '../components/ReportModal';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme, themeMode, setThemeMode } = useSettings();
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
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>
    );

    const renderItem = (icon: keyof typeof Ionicons.glyphMap, title: string, onPress?: () => void, rightElement?: React.ReactNode) => (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.card }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                    <Ionicons name={icon} size={22} color={theme.primary} />
                </View>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSectionHeader('General')}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    {renderItem('information-circle-outline', 'About App / Developer', handleAboutPress)}
                    <View style={[styles.separator, { backgroundColor: theme.border }]} />
                    {renderItem('heart-circle-outline', 'Acknowledgements', handleAcknowledgementsPress)}
                    <View style={[styles.separator, { backgroundColor: theme.border }]} />
                    {renderItem('document-text-outline', 'Terms and Conditions', handleTermsPress)}
                </View>

                {renderSectionHeader('Appearance')}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    {renderItem(
                        'moon-outline',
                        'Appearance',
                        handleThemeChange,
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: theme.textSecondary, marginRight: 8, fontSize: 17 }}>{getThemeLabel()}</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </View>
                    )}
                </View>

                {renderSectionHeader('Support')}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    {renderItem('bug-outline', 'Report a Bug', handleReportPress)}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>Hymnal App v1.0.0</Text>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>Made with ❤️ by KOD</Text>
                </View>
            </ScrollView>

            <ReportModal
                visible={showReport}
                onClose={() => setShowReport(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
    },
    content: {
        padding: SPACING.m,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
        marginLeft: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.m,
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
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    itemTitle: {
        fontSize: 17,
        fontFamily: FONTS.regular,
    },
    separator: {
        height: 1,
        marginLeft: 56, // Align with text start
    },
    footer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        marginBottom: 4,
    },
});
