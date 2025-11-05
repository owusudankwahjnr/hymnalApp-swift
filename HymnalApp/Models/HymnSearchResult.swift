//
//  HymnSearchResult.swift
//  Hymnals
//
//  Created by KOD on 31/10/2025.
//

// Models/HymnSearchResult.swift
import Foundation

/// Summary of a hymn for list and search results (HymnSearchResult).
/// Used for both search results and variant results since schemas are identical.
struct HymnSearchResult: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let number: Int
    let hymnBookId: String
    let hymnBookTitle: String
    let variantKey: String?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
