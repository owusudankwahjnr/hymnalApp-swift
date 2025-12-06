import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSettings } from '../context/SettingsContext';

interface Props {
    unitId?: string;
}

export const AdBannerWrapper: React.FC<Props> = ({ unitId }) => {
    const { theme } = useSettings();
    const [error, setError] = useState(false);

    // Use Test ID if no unitId is provided (or in dev mode)
    // In production, you would use your actual Ad Unit ID
    const adUnitId = unitId || TestIds.BANNER;

    if (error) {
        return null; // Hide if ad fails to load
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(err) => {
                    console.error('AdBanner failed to load', err);
                    setError(true);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 4,
    },
});
