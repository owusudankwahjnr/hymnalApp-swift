//
//  Config.swift
//  Hymnals
//
//  Created by KOD on 31/10/2025.
//

// Config/Config.swift
import Foundation

/// Central configuration for the app.
/// This file holds constants like API base URL, cache settings, and environment flags.
/// Keeping them here makes it easy to switch between dev/prod or toggle features.

struct Config {
    /// Base URL for the Hymnal API.
    /// In a real app, you'd use environment variables or .xcconfig for different schemes (debug/release).
    static let apiBaseURL = URL(string: "http://localhost:8000/api/v1/hymnal")!  // Update to your production URL
    
    /// Flag to toggle mock mode globally.
    /// Set to true for previews, testing, or offline development.
    /// In production, this could be controlled via launch arguments or user settings.
    static let isMockMode = false  // Change to true to force mock data
    
    /// Cache expiration time in seconds (e.g., 1 day).
    /// Used to decide when to refresh cached data even if offline fallback is active.
    static let cacheExpiration: TimeInterval = 86_400
    
    /// Default page limit for paginated API calls.
    static let defaultPageLimit = 10
}
