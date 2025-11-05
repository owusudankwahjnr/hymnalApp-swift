// Views/FavoritesView.swift
import SwiftUI

/// View for displaying favorite hymns.
/// Filters from search results based on local favorites.
/// Supports search within favorites, infinite scroll.
/// Note: For large datasets, consider a dedicated favorites endpoint in API.

struct FavoritesView: View {
    @EnvironmentObject private var controller: HymnalController
    @State private var searchText = ""
    @State private var favoriteHymns: [HymnSummary] = []
    @State private var isLoading = true
    @State private var isLoadingMore = false
    @State private var currentSkip = 0
    @State private var hasMore = true
    private let limit = Config.defaultPageLimit

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                // Background
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                // Fixed header + scrollable content
                VStack(spacing: 0) {
                    // ——— STICKY SEARCH BAR ———
                    SearchBar(text: $searchText)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 4)
                        .background(
                            Material.regular
                                .shadow(.drop(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 2))
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal, 16)
                        .zIndex(1)
                        .background(Color(.systemGroupedBackground))
                    
                    // ——— SCROLLABLE CONTENT ———
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            if isLoading && favoriteHymns.isEmpty {
                                ForEach(0..<10, id: \.self) { _ in
                                    ShimmerListRow()
                                        .padding(.horizontal, 16)
                                }
                            } else if let error = controller.errorMessage {
                                ErrorView(error: error) {
                                    Task { await loadFavorites() }
                                }
                                .padding(.horizontal, 16)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            } else if favoriteHymns.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "heart.fill")
                                        .font(.system(size: 48))
                                        .foregroundColor(.secondary)
                                    Text(searchText.isEmpty ? "No favorite hymns yet." : "No matching favorite hymns.")
                                        .font(.title3)
                                        .foregroundColor(.secondary)
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .padding(.horizontal, 16)
                                .padding(.top, 20)
                            } else {
                                ForEach(favoriteHymns) { hymn in
                                    NavigationLink(value: hymn) {
                                        HymnRowView(hymn: hymn)
                                            .padding(.horizontal, 16)
                                            .transition(.opacity.combined(with: .scale))
                                    }
                                    .buttonStyle(.plain)
                                    .onAppear {
                                        if hymn.id == favoriteHymns.last?.id && hasMore && !isLoadingMore {
                                            Task { await loadMore() }
                                        }
                                    }
                                }
                                
                                if isLoadingMore {
                                    HStack {
                                        Spacer()
                                        Text("Loading more favorites…")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                            .padding(.vertical, 12)
                                        Spacer()
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }
                            
                            Spacer(minLength: 60)
                        }
                        .padding(.top, 8)
                    }
                    .safeAreaInset(edge: .bottom) {
                        Color.clear.frame(height: 40) // Prevent bottom clipping
                    }
                }
            }
            .navigationTitle("Favorites")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: HymnSummary.self) { summary in
                HymnDetailView(summary: summary)
            }
            .onAppear {
                Task { await loadFavorites() }
            }
            .onChange(of: searchText) { _ in
                Task { await loadFavorites() }
            }
            .onChange(of: controller.favoriteHymnIds) { _ in
                Task { await loadFavorites() }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: favoriteHymns)
        }}

    private func loadFavorites() async {
        isLoading = true
        currentSkip = 0
        hasMore = true
        favoriteHymns = []
        await loadMore()
        isLoading = false
    }

    private func loadMore() async {
        guard hasMore && !isLoadingMore else { return }
        isLoadingMore = true
        do {
            let allSummaries = try await controller.searchHymnSummaries(
                query: searchText,
                hymnBookId: nil,
                skip: currentSkip,
                limit: limit
            )
            let newFavorites = allSummaries.filter { controller.favoriteHymnIds.contains($0.id) }
            favoriteHymns.append(contentsOf: newFavorites)
            currentSkip += limit
            // Stop if we didn’t get a full page OR no new favorites were found
            hasMore = allSummaries.count == limit
        } catch {
            controller.errorMessage = error.localizedDescription
        }
        isLoadingMore = false
    }
}

// MARK: - Previews

struct FavoritesView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            FavoritesView()
                .environmentObject(HymnalController(apiService: MockService()))
        }
    }
}
