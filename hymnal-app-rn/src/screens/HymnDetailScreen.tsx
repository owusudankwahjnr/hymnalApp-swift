import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Text, FlatList, Share, Alert, ImageBackground, Platform } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { of as of$ } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { HymnService } from '../services/HymnService';
import Hymn from '../db/models/Hymn';
import HymnBook from '../db/models/HymnBook';
import { HymnContent } from '../components/HymnContent';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useFavorites } from '../context/FavoritesContext';
import { SPACING } from '../constants/theme';
import { VariantRow } from '../components/VariantRow';
import { ReportModal } from '../components/ReportModal';
import { ShareModal } from '../components/ShareModal';
import { useSettings } from '../context/SettingsContext';

interface Props {
    hymn: Hymn;
    hymnBook: HymnBook;
    variants: Hymn[];
}

const HymnDetailScreenComponent: React.FC<Props> = ({ hymn, hymnBook, variants }) => {
    const navigation = useNavigation<any>();
    const [showVariants, setShowVariants] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const { theme } = useSettings();

    React.useLayoutEffect(() => {
        if (hymn && hymnBook) {
            navigation.setOptions({
                headerTitle: () => (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>
                            {hymn.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.textSecondary }} numberOfLines={1}>
                            Hymn #{hymn.number} • {hymnBook.title}
                        </Text>
                    </View>
                ),
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: true,
            });
        }
    }, [navigation, hymn, hymnBook, theme]);

    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    // Use hymn.id from prop
    const isFav = isFavorite(hymn.id);

    const toggleFavorite = () => {
        if (isFav) {
            removeFavorite(hymn.id);
        } else {
            addFavorite(hymn.id);
        }
    };

    const handleShare = () => {
        setShowShare(true);
    };

    const handleReport = () => {
        setShowReport(true);
    };

    if (!hymn) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={{ padding: SPACING.l, alignItems: 'center' }}>
                    <SkeletonLoader width="60%" height={32} style={{ marginBottom: 16 }} />
                    <SkeletonLoader width="30%" height={20} style={{ marginBottom: 32 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <HymnContent hymn={hymn as any} />
            </ScrollView>

            {/* Floating Action Stack */}
            <View style={styles.floatingActions}>
                {hymn.variantKey && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => setShowVariants(true)}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                            <Ionicons name="layers-outline" size={24} color={theme.text} />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Variants</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={24}
                            color={isFav ? theme.error : theme.text}
                        />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Like</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                        <Ionicons name="share-outline" size={24} color={theme.text} />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                        <Ionicons name="flag-outline" size={24} color={theme.text} />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Report</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showVariants}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVariants(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowVariants(false)}
                >
                    <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Version</Text>
                            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Choose a variant of this hymn</Text>
                        </View>

                        {variants && variants.length > 0 ? (
                            <FlatList
                                data={variants}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.variantList}
                                renderItem={({ item }) => {
                                    const isCurrent = item.id === hymn.id;
                                    return (
                                        <VariantRow
                                            hymn={item}
                                            isCurrent={isCurrent}
                                            onPress={() => {
                                                if (!isCurrent) {
                                                    setShowVariants(false);
                                                    navigation.replace('HymnDetail', { hymnId: item.id });
                                                }
                                            }}
                                        />
                                    );
                                }}
                            />
                        ) : (
                            <View style={styles.center}>
                                <Text style={{ color: theme.textSecondary }}>No variants found.</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ReportModal
                visible={showReport}
                onClose={() => setShowReport(false)}
                hymn={hymn}
                hymnBook={hymnBook}
            />

            <ShareModal
                visible={showShare}
                onClose={() => setShowShare(false)}
                hymn={hymn}
                hymnBook={hymnBook}
            />
        </View >
    );
};

const enhance = withObservables(['route'], ({ route }: any) => ({
    hymn: HymnService.getHymn(route.params.hymnId),
    hymnBook: HymnService.getHymn(route.params.hymnId).pipe(
        switchMap(hymn => hymn ? hymn.hymnBook.observe() : of$(null))
    ) as any,
    variants: HymnService.getHymn(route.params.hymnId).pipe(
        switchMap(hymn => {
            if (hymn && hymn.variantKey) {
                return HymnService.getVariants(hymn.variantKey).observe();
            }
            return of$([]);
        })
    ),
}));

export const HymnDetailScreen = enhance(HymnDetailScreenComponent);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    floatingActions: {
        position: 'absolute',
        right: SPACING.m,
        bottom: 50,
        alignItems: 'center',
        gap: SPACING.m,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 4,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: SPACING.xl,
    },
    modalHeader: {
        alignItems: 'center',
        padding: SPACING.m,
        borderBottomWidth: 1,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: SPACING.m,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
    },
    variantList: {
        padding: SPACING.m,
    },
});
