import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

export const AcknowledgementsScreen = () => {
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

    const acknowledgements = [
        {
            title: 'Hymn Books',
            items: [
                {
                    name: 'Hymn Collections',
                    description: 'A comprehensive collection of hymns and spiritual songs compiled from various standard denominational hymn books and public domain sources used in Christian worship.',
                    source: 'Various Collections',
                },
            ],
        },
        {
            title: 'Content Sources',
            items: [
                {
                    name: 'Internet Archives',
                    description: 'Hymn texts and lyrics sourced from various online archives and public domain collections.',
                    source: 'Multiple Sources',
                },
                {
                    name: 'Community Contributions',
                    description: 'Hymn translations and corrections provided by community members and church organizations.',
                    source: 'Community',
                },
            ],
        },
    ];

    const renderAcknowledgementCard = (item: { name: string; description: string; source: string }) => (
        <View key={item.name} style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                    <Ionicons name="book-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.cardTitleContainer}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.sourceBadge, { backgroundColor: `${theme.primary}10` }]}>
                        <Text style={[styles.sourceText, { color: theme.primary }]}>{item.source}</Text>
                    </View>
                </View>
            </View>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{item.description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>


            <ScrollView contentContainerStyle={styles.content}>
                {/* Introduction */}
                <View style={[styles.introCard, { backgroundColor: theme.card }]}>
                    <View style={[styles.introIcon, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="heart" size={32} color={theme.primary} />
                    </View>
                    <Text style={[styles.introTitle, { color: theme.text }]}>With Gratitude</Text>
                    <Text style={[styles.introText, { color: theme.textSecondary }]}>
                        This app was made possible through the compilation of hymns and spiritual songs from various sources.
                        We are deeply grateful to all who have preserved these sacred texts and made them available for worship and praise.
                    </Text>
                </View>

                {/* Acknowledgement Sections */}
                {acknowledgements.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            {section.title.toUpperCase()}
                        </Text>
                        {section.items.map(renderAcknowledgementCard)}
                    </View>
                ))}

                {/* Disclaimer */}
                <View style={[styles.disclaimerCard, { backgroundColor: `${theme.primary}08` }]}>
                    <View style={styles.disclaimerHeader}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                        <Text style={[styles.disclaimerTitle, { color: theme.primary }]}>Copyright Notice</Text>
                    </View>
                    <Text style={[styles.disclaimerText, { color: theme.text }]}>
                        All hymn content in this application is sourced from public domain materials and freely available internet resources.
                        If you believe any content infringes on copyright, please contact us immediately so we can address the concern.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        Thank you to all contributors and sources
                    </Text>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        who help preserve these sacred hymns
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
    introCard: {
        borderRadius: 16,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    introIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
        marginBottom: SPACING.s,
    },
    introText: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
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
    card: {
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.s,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        fontFamily: FONTS.bold,
        marginBottom: SPACING.xs,
    },
    sourceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 6,
    },
    sourceText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 15,
        lineHeight: 21,
        fontFamily: FONTS.regular,
        marginLeft: 52, // Align with title (36 + 16)
    },
    disclaimerCard: {
        borderRadius: 12,
        padding: SPACING.m,
        marginTop: SPACING.m,
        marginBottom: SPACING.xl,
    },
    disclaimerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    disclaimerTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: FONTS.bold,
        marginLeft: SPACING.s,
    },
    disclaimerText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: FONTS.regular,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.m,
        marginBottom: SPACING.xl,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 4,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
});
