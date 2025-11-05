// Views/SearchView.swift
import SwiftUI

/// Global search view for hymns.
/// Supports filtering by hymn book, infinite scrolling, and favorites.
/// Uses controller for data fetching with cache policy.
/// Handles loading, error, and empty states gracefully.

struct SearchView: View {
    @EnvironmentObject private var controller: HymnalController
    @State private var searchQuery: String = ""
    @State private var selectedHymnBookId: String? = nil
    @State private var hymns: [HymnSummary] = []
    @State private var isLoading = true
    @State private var isLoadingMore = false
    @State private var currentSkip = 0
    @State private var hasMore = true
    @State private var path = NavigationPath()
    private let limit = Config.defaultPageLimit

    var body: some View {
        NavigationStack(path: $path) {
            ZStack(alignment: .top) {
                // Background
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()

                // Fixed header + scrollable content
                VStack(spacing: 0) {
                    // ——— STICKY HEADER ———
                    VStack(spacing: 0) {
                        // Floating Search Bar
                        SearchBar(text: $searchQuery)
                            .padding(.horizontal, 16)
                            .padding(.top, 8)
                            .padding(.bottom, 4)
                            .background(
                                Material.regular
                                    .shadow(.drop(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 2))
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .padding(.horizontal, 16)

                        // Hymn Book Category Bar
                        HymnBookCategoryBar(
                            hymnBooks: controller.hymnBooks,
                            selectedId: $selectedHymnBookId
                        )
                        .padding(.horizontal, 16)
                        .padding(.vertical, 4)
                    }
                    .background(Color(.systemGroupedBackground))
                    .zIndex(1)

                    // ——— SCROLLABLE CONTENT ———
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            if isLoading && hymns.isEmpty {
                                // Loading shimmer
                                ForEach(0..<10, id: \.self) { _ in
                                    ShimmerListRow()
                                        .padding(.horizontal, 16)
                                }
                            } else if let error = controller.errorMessage {
                                // Error state
                                ErrorView(error: error) {
                                    Task { await search() }
                                }
                                .padding(.horizontal, 16)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            } else if hymns.isEmpty {
                                // Empty state
                                VStack(spacing: 12) {
                                    Image(systemName: "magnifyingglass")
                                        .font(.system(size: 48))
                                        .foregroundColor(.secondary)
                                    Text("No results")
                                        .font(.title3)
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .padding(.horizontal, 16)
                                .padding(.top, 20)
                            } else {
                                // Hymn rows
                                ForEach(hymns) { hymn in
                                    Button {
                                        path.append(hymn)
                                    } label: {
                                        HymnRowView(hymn: hymn)
                                            .padding(.horizontal, 16)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .contentShape(Rectangle()) // Ensures full-row tap
                                    }
                                    .buttonStyle(.plain)
                                    .onAppear {
                                        if hymn.id == hymns.last?.id, hasMore, !isLoadingMore {
                                            Task { await loadMore() }
                                        }
                                    }
                                }

                                // Loading more indicator
                                if isLoadingMore {
                                    HStack {
                                        Spacer()
                                        Text("Loading more hymns…")
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
                        Color.clear.frame(height: 40)
                    }
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: HymnSummary.self) { summary in
                HymnDetailView(summary: summary)
            }
            .onAppear {
                Task { await search() }
            }
            .onChange(of: searchQuery) { newValue in
                Task { await search() }
            }
            .onChange(of: selectedHymnBookId) { newValue in
                Task { await search() }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: hymns)
        }
    }

    private func search() async {
        isLoading = true
        currentSkip = 0
        hasMore = true
        hymns = []
        await loadMore()
        isLoading = false
    }

    private func loadMore() async {
        guard hasMore && !isLoadingMore else { return }
        isLoadingMore = true
        do {
            let newHymns = try await controller.searchHymnSummaries(
                query: searchQuery,
                hymnBookId: selectedHymnBookId,
                skip: currentSkip,
                limit: limit
            )
            hymns.append(contentsOf: newHymns)
            currentSkip += limit
            hasMore = newHymns.count == limit
        } catch {
            controller.errorMessage = error.localizedDescription
        }
        isLoadingMore = false
    }
}

// MARK: - Hymn Book Category Bar

private struct HymnBookCategoryBar: View {
    let hymnBooks: [HymnBook]
    @Binding var selectedId: String?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                CategoryPill(
                    title: "All Hymn Books",
                    isSelected: selectedId == nil
                ) {
                    selectedId = nil
                }

                ForEach(hymnBooks, id: \.id) { book in
                    CategoryPill(
                        title: book.title,
                        isSelected: selectedId == book.id
                    ) {
                        selectedId = book.id
                    }
                }
            }
            .padding(.vertical, 4)
        }
    }
}

// MARK: - Category Pill

private struct CategoryPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .lineLimit(1)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .foregroundColor(foregroundColor)
                .background(backgroundView)
        }
        .buttonStyle(.plain)
    }

    private var foregroundColor: Color {
        isSelected ? .white : .primary
    }

    @ViewBuilder
    private var backgroundView: some View {
        if isSelected {
            Capsule()
                .fill(Color.accentColor)
        } else {
            Capsule()
                .strokeBorder(
                    Color.primary.opacity(0.3),
                    lineWidth: 1
                )
                .background(Capsule().fill(Color.clear))
        }
    }
}

// MARK: - Previews

struct SearchView_Previews: PreviewProvider {
    static var previews: some View {
        SearchView()
            .environmentObject(HymnalController(apiService: MockService()))
    }
}
