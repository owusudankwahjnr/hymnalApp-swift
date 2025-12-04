
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

export const TermsScreen = () => {
    const navigation = useNavigation();
    const { theme } = useSettings();
    // Hide bottom tab bar when this screen is focused
    useEffect(() => {
        const parent = navigation.getParent?.();
        parent?.setOptions({ tabBarStyle: { display: 'none' } });
        return () => {
            parent?.setOptions({ tabBarStyle: undefined });
        };
    }, [navigation]);

    const lastUpdated = 'December 1, 2024';

    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By downloading, installing, or using the Hymnal App, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.',
        },
        {
            title: '2. Use License',
            content: 'Permission is granted to temporarily download one copy of the materials (information or software) on Hymnal App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
        },
        {
            title: '3. Content & Copyright',
            content: 'The hymns, lyrics, and texts contained within this application are sourced from public domain collections and various hymn books. While we strive for accuracy, we acknowledge that some texts may vary from specific printed editions. All app-specific code, design, and original content are copyright of the developer.',
        },
        {
            title: '4. User Conduct',
            content: 'You agree to use the app only for lawful purposes. You are prohibited from using the app to transmit or post any material that is defamatory, offensive, or in violation of any applicable laws.',
        },
        {
            title: '5. Privacy Policy',
            content: 'We respect your privacy. This app does not collect personal data or track user activity for commercial purposes. Any settings or favorites are stored locally on your device.',
        },
        {
            title: '6. Disclaimer',
            content: 'The materials on Hymnal App are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
        },
        {
            title: '7. Limitations',
            content: 'In no event shall the developer or suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Hymnal App.',
        },
        {
            title: '8. Modifications',
            content: 'We may revise these terms of service for the app at any time without notice. By using this app you are agreeing to be bound by the then current version of these terms of service.',
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>


            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.lastUpdatedContainer, { backgroundColor: `${theme.primary} 10` }]}>
                    <Ionicons name="time-outline" size={16} color={theme.primary} />
                    <Text style={[styles.lastUpdatedText, { color: theme.primary }]}>Last Updated: {lastUpdated}</Text>
                </View>

                <Text style={[styles.introText, { color: theme.textSecondary }]}>
                    Please read these terms and conditions carefully before using our application.
                </Text>

                {sections.map((section, index) => (
                    <View key={index} style={[styles.section, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                        <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        If you have any questions about these Terms, please contact us via the "Report a Bug" feature or email.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: FONTS.bold,
    },
    content: {
        padding: SPACING.l,
    },
    lastUpdatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: SPACING.l,
    },
    lastUpdatedText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: FONTS.medium,
    },
    introText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: SPACING.xl,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
    section: {
        marginBottom: SPACING.m,
        padding: SPACING.m,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: SPACING.s,
        fontFamily: FONTS.bold,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: FONTS.regular,
    },
    footer: {
        marginTop: SPACING.l,
        marginBottom: SPACING.xl,
        padding: SPACING.m,
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: FONTS.regular,
        fontStyle: 'italic',
    },
});
