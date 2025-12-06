import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SPACING, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Note: True Native Ads require a lot of native setup. 
// For "Native-like" ads using standard ad networks (like AdMob's Native Advanced), 
// we would wrap the specialized NativeAdView component. 
// However, for this MVP/Implementation Plan, we are using a "Native-feel" placeholder 
// or standard component structure that would hold the Native Ad data.
//
// Since 'react-native-google-mobile-ads' Native Ads require specific native view hierarchy,
// we will implement a stub here that *looks* like the native ad row, 
// and in a full production native ad integration, you'd replace the Texts with <HeadlinesView>, etc.
// 
// For now, let's assume we might serve a "Premium App" promo or a placeholder 
// that mimics the visual style of HymnRow to be non-intrusive.

export const NativeAdRow: React.FC = () => {
    const { theme } = useSettings();

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.adBadge}>
                <Text style={styles.adText}>Ad</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Discover Premium Features
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Support the developer by upgrading
                </Text>
            </View>

            <Ionicons name="open-outline" size={20} color={theme.textSecondary} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.s,
        borderRadius: 12,
        borderWidth: 1,
        // Make it slightly distinct but seamless
        opacity: 0.9,
    },
    adBadge: {
        backgroundColor: '#f0ad4e', // subtle orange/gold
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: SPACING.m,
    },
    adText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
});
