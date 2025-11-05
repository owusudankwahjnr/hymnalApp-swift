// HymnalApp.swift (Updated)
// Update your app entry to use the controller with services.

// HymnalApp.swift
import SwiftUI

/// App entry point.
/// Initializes controller with live or mock service based on config.
/// Passes to environment for all views.

@main
struct HymnalApp: App {
    @StateObject private var controller = HymnalController(
        apiService: Config.isMockMode ? MockService() : APIService()
    )

    var body: some Scene {
        WindowGroup {
            LaunchScreenView()
                .environmentObject(controller)
        }
    }
}
