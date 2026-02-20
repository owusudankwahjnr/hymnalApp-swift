import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { SPACING } from '../constants/theme';
import Hymn from '../db/models/Hymn';
import { getMusicPalette, MUSIC_FONTS } from '../constants/musicTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    variants: Hymn[];
    currentHymn: Hymn;
    onPress: () => void;
}

export const VariantStickyFooter: React.FC<Props> = ({ variants, currentHymn, onPress }) => {
    const { theme } = useSettings();
    const palette = getMusicPalette(theme.mode);
    const insets = useSafeAreaInsets();

    // Filter out current hymn
    const otherVariants = variants.filter(v => v.id !== currentHymn.id);
    
    if (otherVariants.length === 0) {
        return null;
    }

    const diffTitleVariant = otherVariants.find(v => v.title.trim().toLowerCase() !== currentHymn.title.trim().toLowerCase());
    const sameTitleVariant = otherVariants.find(v => v.title.trim().toLowerCase() === currentHymn.title.trim().toLowerCase());

    let label = 'Also available';
    let titleText = '';

    if (diffTitleVariant && sameTitleVariant) {
        label = 'Also available';
        titleText = `In other books & as "${diffTitleVariant.title}"`;
    } else if (diffTitleVariant) {
        label = 'Also known as';
        titleText = `"${diffTitleVariant.title}"`;
        const moreCount = otherVariants.length - 1;
        if (moreCount > 0) titleText += ` +${moreCount}`;
    } else {
        label = 'Also available in';
        titleText = 'Other Hymn Books';
        const moreCount = otherVariants.length - 1;
        if (moreCount > 0) titleText += ` (+${moreCount})`;
    }

    // Calculate bottom position based on insets. 
    // On Android with hidden nav bar, insets.bottom is usually 0.
    const bottomPosition = Math.max(insets.bottom, 16) + 8;

    return (
        <Animated.View 
            entering={FadeInDown.delay(1000).springify()} 
            exiting={FadeOutDown}
            style={[styles.container, { bottom: bottomPosition }]}
        >
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={onPress}
                style={[
                    styles.pill, 
                    { 
                        borderColor: palette.border,
                        shadowColor: palette.shadow
                    }
                ]}
            >
                <LinearGradient colors={palette.rowGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
                <View style={[styles.iconBubble, { backgroundColor: palette.surfaceMuted }]}>
                    <Ionicons name="git-branch-outline" size={20} color={palette.textMuted} />
                </View>
                
                <View style={styles.textContainer}>
                    <Text style={[styles.label, { color: palette.textMuted }]}>
                        {label}
                    </Text>
                    <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
                        {titleText}
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
        paddingHorizontal: SPACING.l,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        maxWidth: 400,
        width: '100%',
        overflow: 'hidden',
    },
    iconBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 11,
        fontFamily: MUSIC_FONTS.ui,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 15,
        fontFamily: MUSIC_FONTS.ui,
    },
});
