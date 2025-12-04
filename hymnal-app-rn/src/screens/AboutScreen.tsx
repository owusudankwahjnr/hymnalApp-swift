import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

export const AboutScreen = () => {
    const navigation = useNavigation();
    const { theme } = useSettings();

    const handleEmailPress = () => {
        Linking.openURL('mailto:contact@hymnalapp.com');
    };

    const handleWebsitePress = () => {
        Linking.openURL('https://hymnalapp.com');
    };

    const renderInfoRow = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string, onPress?: () => void) => (
        <TouchableOpacity
            style={[styles.infoRow, { backgroundColor: theme.card }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.infoLeft}>
                <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15` }]}>
                    <Ionicons name={icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
            </View>
            <View style={styles.infoRight}>
                <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
                {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} style={{ marginLeft: 8 }} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>

            <ScrollView contentContainerStyle={styles.content}>
                {/* App Icon and Name */}
                <View style={styles.heroSection}>
                    <View style={[styles.appIconContainer, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                        <Ionicons name="musical-notes" size={64} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.appName, { color: theme.text }]}>Hymnal App</Text>
                    <Text style={[styles.tagline, { color: theme.textSecondary }]}>Your Digital Hymnal Companion</Text>
                </View>

                {/* App Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APP INFORMATION</Text>
                    <View style={styles.infoContainer}>
                        {renderInfoRow('code-slash-outline', 'Version', '1.0.0')}
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        {renderInfoRow('phone-portrait-outline', 'Platform', 'iOS & Android')}
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        {renderInfoRow('calendar-outline', 'Release Date', 'December 2024')}
                    </View>
                </View>

                {/* Developer Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DEVELOPER</Text>
                    <View style={styles.infoContainer}>
                        {renderInfoRow('person-outline', 'Developer', 'KOD')}
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        {renderInfoRow('mail-outline', 'Email', 'contact@hymnalapp.com', handleEmailPress)}
                    </View>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>KEY FEATURES</Text>
                    <View style={[styles.featuresContainer, { backgroundColor: theme.card }]}>
                        {[
                            { icon: 'cloud-offline-outline' as keyof typeof Ionicons.glyphMap, text: 'Offline Access' },
                            { icon: 'search-outline' as keyof typeof Ionicons.glyphMap, text: 'Deep Search (Verses & Chorus)' },
                            { icon: 'heart-outline' as keyof typeof Ionicons.glyphMap, text: 'Favorites Management' },
                            { icon: 'share-social-outline' as keyof typeof Ionicons.glyphMap, text: 'Share Hymns' },
                            { icon: 'moon-outline' as keyof typeof Ionicons.glyphMap, text: 'Dark Mode Support' },
                            { icon: 'library-outline' as keyof typeof Ionicons.glyphMap, text: 'Multiple Hymn Books' },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}15` }]}>
                                    <Ionicons name={feature.icon} size={18} color={theme.primary} />
                                </View>
                                <Text style={[styles.featureText, { color: theme.text }]}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        Made with ❤️ for worship and praise
                    </Text>
                    <Text style={[styles.copyright, { color: theme.textSecondary }]}>
                        © {new Date().getFullYear()} KOD. All rights reserved.
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
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.l,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    appIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
    },
    tagline: {
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: SPACING.m,
        marginLeft: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    infoLabel: {
        fontSize: 17,
        fontFamily: FONTS.regular,
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 17,
        fontFamily: FONTS.regular,
    },
    separator: {
        height: 1,
        marginLeft: 56,
    },
    featuresContainer: {
        borderRadius: 12,
        padding: SPACING.m,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.s,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    featureText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    footerText: {
        fontSize: 15,
        marginBottom: SPACING.s,
        fontFamily: FONTS.regular,
    },
    copyright: {
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
});
