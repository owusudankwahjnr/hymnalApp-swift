import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSettings } from '../context/SettingsContext';
import { AD_UNITS, ENABLE_ADS } from '../constants/Ads';

interface Props {
    unitId?: string;
}

export const AdBannerWrapper: React.FC<Props> = ({ unitId }) => {
    const { theme } = useSettings();
    const [error, setError] = useState(false);

    if (!ENABLE_ADS) {
        return null;
    }

    // Use centralized ID if no specific unitId is provided
    const adUnitId = unitId || AD_UNITS.BANNER;

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
