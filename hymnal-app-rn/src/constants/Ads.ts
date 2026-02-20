import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * AD CONFIGURATION
 * 
 * To activate production ads:
 * 1. Set IS_PRODUCTION to true
 * 2. Replace the placeholder IDs with your actual AdMob Ad Unit IDs
 * 
 * IMPORTANT: Do not click on your own production ads!
 */
const IS_PRODUCTION = false; 
export const ENABLE_ADS = false;

export const AD_UNITS = {
    BANNER: IS_PRODUCTION 
        ? (Platform.OS === 'ios' ? 'YOUR_IOS_BANNER_ID' : 'YOUR_ANDROID_BANNER_ID')
        : TestIds.BANNER,
    INTERSTITIAL: IS_PRODUCTION
        ? (Platform.OS === 'ios' ? 'YOUR_IOS_INTERSTITIAL_ID' : 'YOUR_ANDROID_INTERSTITIAL_ID')
        : TestIds.INTERSTITIAL,
};
