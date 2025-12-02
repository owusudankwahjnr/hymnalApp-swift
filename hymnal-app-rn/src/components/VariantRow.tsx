import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { SPACING } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

interface Props {
    hymn: Hymn;
    hymnBook: HymnBook;
    isCurrent: boolean;
    onPress: () => void;
}

const VariantRowComponent: React.FC<Props> = ({ hymn, hymnBook, isCurrent, onPress }) => {
    const { theme } = useSettings();

    return (
        <TouchableOpacity
            style={[
                styles.variantRow,
                { backgroundColor: theme.card },
                isCurrent && { borderColor: theme.primary, backgroundColor: `${theme.primary}10` }
            ]}
            onPress={onPress}
        >
            <View style={{ flex: 1 }}>
                <Text style={[
                    styles.variantTitle,
                    { color: theme.text },
                    isCurrent && { color: theme.primary }
                ]}>
                    {hymn.title}
                </Text>
                <Text style={[styles.variantSubtitle, { color: theme.textSecondary }]}>
                    Hymn {hymn.number} • {hymnBook?.title || 'Unknown Book'}
                </Text>
            </View>
            {isCurrent && (
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    variantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    variantTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    variantSubtitle: {
        fontSize: 12,
    },
});

export const VariantRow = withObservables(['hymn'], ({ hymn }: { hymn: Hymn }) => ({
    hymn,
    hymnBook: hymn.hymnBook,
}))(VariantRowComponent);
