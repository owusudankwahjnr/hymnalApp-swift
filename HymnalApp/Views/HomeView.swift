// Views/HomeView.swift
import SwiftUI
import UIKit

// MARK: - Navigation Payload

struct HymnBookNavigationTarget: Hashable {
    let id: String
    let name: String
}

// MARK: - Home View

struct HomeView: View {
    @EnvironmentObject private var controller: HymnalController
    @State private var searchText = ""
    @State private var navigationPath = NavigationPath()
    @State private var showOfflineBanner = false
    
    private let columns = [
        GridItem(.flexible(minimum: 140, maximum: 200), spacing: 20),
        GridItem(.flexible(minimum: 140, maximum: 200), spacing: 20)
    ]
    
    var filteredHymnBooks: [HymnBook] {
        if searchText.isEmpty {
            return controller.hymnBooks
        } else {
            return controller.hymnBooks.filter { $0.title.localizedStandardContains(searchText) }
        }
    }
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
            stackContent
                .navigationTitle("Hymnbooks")
                .navigationBarTitleDisplayMode(.large)
                // ✅ Updated destination to use structured payload
                .navigationDestination(for: HymnBookNavigationTarget.self) { target in
                    HymnListView(hymnBookId: target.id, hymnBookName: target.name)
                        .onAppear {
                            print("📖 Navigated to HymnListView for book: \(target.name) (ID: \(target.id))")
                        }
                }
                .navigationDestination(for: HymnSummary.self) { summary in
                    HymnDetailView(summary: summary)
                }
                .onAppear {
                    if controller.hymnBooks.isEmpty {
                        Task { await controller.loadHymnBooks() }
                    }
                    showOfflineBanner = controller.isOffline
                }
                .onChange(of: controller.isOffline) { isOffline in
                    withAnimation {
                        showOfflineBanner = isOffline
                    }
                }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: filteredHymnBooks)
    }
    
    private var stackContent: some View {
        ZStack(alignment: .bottom) {
            // Background
            Color(.systemGroupedBackground)
                .ignoresSafeArea()
            
            // Main Content
            mainVStack
            
            // Offline Banner (bottom)
            if let lastUpdated = controller.lastUpdated, controller.isOffline {
                offlineBanner(lastUpdated)
                    .transition(
                        .move(edge: .bottom)
                        .combined(with: .opacity)
                    )
                    .zIndex(1)
            }
        }
    }
    
    private var mainVStack: some View {
        VStack(spacing: 0) {
            // Floating Search Bar
            SearchBar(text: $searchText)
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 4)
                .background(
                    Material.ultraThin
                        .shadow(.drop(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 4))
                )
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .padding(.horizontal, 16)
                .padding(.top, 8)
            
            // Content
            contentGroup
                .frame(maxWidth: .infinity)
        }
    }
    
    private var contentGroup: some View {
        Group {
            if controller.hymnBooks.isEmpty && controller.errorMessage == nil {
                LoadingView()
            } else if let error = controller.errorMessage {
                ErrorView(error: error) {
                    Task { await controller.loadHymnBooks() }
                }
                .padding(.horizontal, 16)
            } else {
                hymnBooksScrollView
            }
        }
    }
    
    private var hymnBooksScrollView: some View {
        ScrollView {
            LazyVGrid(
                columns: columns,
                alignment: .center,
                spacing: 24
            ) {
                ForEach(filteredHymnBooks) { hymnBook in
                    // ✅ Pass both ID and name via structured navigation value
                    NavigationLink(value: HymnBookNavigationTarget(id: hymnBook.id, name: hymnBook.title)) {
                        HymnBookCardView(hymnBook: hymnBook)
                            .transition(
                                .opacity
                                .combined(with: .scale(scale: 0.9))
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                    .scaleEffect(searchText.isEmpty ? 1 : 0.98)
                    .animation(
                        .spring(response: 0.4, dampingFraction: 0.8),
                        value: searchText
                    )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
        }
        .safeAreaInset(edge: .bottom) {
            Color.clear
                .frame(height: 60) // Adjust height as needed to clear the tab bar
        }
    }
    
    @ViewBuilder
    private func offlineBanner(_ lastUpdated: Date) -> some View {
        HStack {
            Image(systemName: "wifi.slash")
                .font(.caption2)
            Text("Last updated: \(lastUpdated, formatter: dateFormatter)")
                .font(.caption)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(Color.gray.opacity(0.2))
        )
        .foregroundColor(.secondary)
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }
    
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter
    }()
}

// MARK: - Loading & Error Views

private struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(.primary)
            
            Text("Loading hymnbooks…")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Previews

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
            .environmentObject(HymnalController(apiService: MockService()))
    }
}
