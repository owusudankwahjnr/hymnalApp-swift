//
//  APIError.swift
//  Hymnals
//
//  Created by KOD on 31/10/2025.
//

// Utils/APIError.swift
import Foundation

/// Standardized errors for API interactions.
/// This enum covers common failure cases, making error handling consistent across services.
/// Use it in throws clauses and for user-facing messages.

enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case invalidResponse(statusCode: Int)
    case decodingError(Error)
    case noData
    case cacheMiss
    case cacheExpired
    case offline
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL."
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse(let statusCode):
            return "Invalid response from server (status: \(statusCode))."
        case .decodingError(let error):
            return "Failed to parse data: \(error.localizedDescription)"
        case .noData:
            return "No data available."
        case .cacheMiss:
            return "No cached data found."
        case .cacheExpired:
            return "Cached data has expired."
        case .offline:
            return "No internet connection. Using offline data if available."
        }
    }
}
