// Views/HymnListView.swift
import SwiftUI

struct HymnListView: View {
    @EnvironmentObject private var controller: HymnalController
    @State private var searchText = ""
    @State private var hymns: [HymnSummary] = []
    @State private var isLoading = true
    @State private var isLoadingMore = false
    @State private var currentSkip = 0
    @State private var hasMore = true
    let hymnBookId: String
    let hymnBookName: String
    private let limit = Config.defaultPageLimit

    var body: some View {
        ZStack(alignment: .top) {
            // Background
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            // Content
            ScrollView {
                LazyVStack(spacing: 8) {
                    // Search bar (floating)
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
                        .padding(.top, 8)

                    // Content
                    if isLoading {
                        ForEach(0..<10, id: \.self) { _ in
                            ShimmerListRow()
                                .padding(.horizontal, 16)
                        }
                    } else if let error = controller.errorMessage {
                        ErrorView(error: error) {
                            Task { await loadHymns() }
                        }
                        .padding(.horizontal, 16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    } else if hymns.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "doc.text")
                                .font(.system(size: 48))
                                .foregroundColor(.secondary)
                            Text("No hymns found")
                                .font(.title3)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(.horizontal, 16)
                    } else {
                        ForEach(hymns) { hymn in
                            NavigationLink(value: hymn) {
                                HymnRowView(hymn: hymn)
                                    .padding(.horizontal, 16)
                                    .transition(.opacity.combined(with: .scale))
                            }
                            .buttonStyle(.plain)
                            .onAppear {
                                if hymn.id == hymns.last?.id && hasMore && !isLoadingMore {
                                    Task { await loadMore() }
                                }
                            }
                        }

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
                Color.clear
                    .frame(height: 40) // Prevent bottom clipping
            }
        }
        .navigationTitle(hymnBookName)
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: HymnSummary.self) { summary in
            HymnDetailView(summary: summary)
        }
        .onAppear {
            Task { await loadHymns() }
        }
        .onChange(of: searchText) { _ in
            Task { await loadHymns() }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: hymns)
    }

    private func loadHymns() async {
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
                query: searchText,
                hymnBookId: hymnBookId,
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

// MARK: - Previews

struct HymnListView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            HymnListView(hymnBookId: "1", hymnBookName: "Example Book")
                .environmentObject(HymnalController(apiService: MockService()))
        }
    }
}
