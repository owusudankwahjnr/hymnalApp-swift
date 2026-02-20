import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { LinearGradient } from 'expo-linear-gradient';

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
    const palette = getMusicPalette(theme.mode);

    return (
        <View style={[styles.container, { borderColor: palette.border }]}>
            <LinearGradient colors={palette.rowGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={[styles.adBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
                <Text style={[styles.adText, { color: palette.textMuted }]}>Sponsor</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: palette.text }]}>
                    Discover Premium Features
                </Text>
                <Text style={[styles.subtitle, { color: palette.textMuted }]}>
                    Support the developer by upgrading
                </Text>
            </View>

            <Ionicons name="open-outline" size={18} color={palette.textMuted} />
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
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    adBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: SPACING.m,
        borderWidth: 1,
    },
    adText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: MUSIC_FONTS.body,
    },
});
