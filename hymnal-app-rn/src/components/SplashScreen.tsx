import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { useSettings } from '../context/SettingsContext';
import { SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
    const { theme } = useSettings();
    const logoScale = useSharedValue(0.8);
    const logoOpacity = useSharedValue(0);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    useEffect(() => {
        logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        logoOpacity.value = withTiming(1, { duration: 800 });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Centered Logo */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image 
                    source={require('../../assets/icon.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Bottom Signature (Meta-style) */}
            <Animated.View 
                entering={FadeIn.delay(800).duration(1000)}
                style={styles.footer}
            >
                <Text style={[styles.fromText, { color: theme.textSecondary }]}>FROM</Text>
                <Text style={[styles.kodText, { color: theme.text }]}>KOD</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        // Optional: add a subtle shadow to the logo if desired
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 24, // Matches standard app icon curvature
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    fromText: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 2,
        marginBottom: 4,
        opacity: 0.6,
    },
    kodText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
});
