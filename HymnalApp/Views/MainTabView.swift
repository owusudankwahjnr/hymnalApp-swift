// Views/MainTabView.swift
import SwiftUI

/// Main tab navigation for the app.
/// Routes to hymn books, search, and favorites.
/// Accent color for consistency.

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Hymnbooks", systemImage: "square.grid.2x2")
                }
            
            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
            
            FavoritesView()
                .tabItem {
                    Label("Favorites", systemImage: "heart")
                }
        }
        .accentColor(.blue)
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
            .environmentObject(HymnalController(apiService: MockService()))
    }
}
