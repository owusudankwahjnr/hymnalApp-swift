import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

import { useSettings } from '../context/SettingsContext';

interface Props {
    onFinish?: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const { theme } = useSettings();

    useEffect(() => {
        // Optional: Add entrance animation or just wait
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.centerContainer}>
                <Image
                    source={require('../../assets/splash-icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.bottomContainer}>
                <Text style={styles.fromText}>FROM</Text>
                <Text style={styles.kodText}>KOD</Text>
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // Match app.json splash background
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 30,
    },
    bottomContainer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    fromText: {
        fontSize: 12,
        color: '#888888',
        letterSpacing: 2,
        marginBottom: 4,
    },
    kodText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary, // Or a specific brand color
        letterSpacing: 4,
    },
});
