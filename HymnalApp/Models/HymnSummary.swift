// Models/HymnSummary.swift
import Foundation

/// Unified model for hymn search results and variants.
struct HymnSummary: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let number: Int
    let hymnBookId: String
    let hymnBookTitle: String
    let variantKey: String?
    
    enum CodingKeys: String, CodingKey {
        case id, title, number
        case hymnBookId = "hymn_book_id"
        case hymnBookTitle = "hymn_book_title"
        case variantKey = "variant_key"
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: HymnSummary, rhs: HymnSummary) -> Bool {
        lhs.id == rhs.id
    }
}

// Alias for clarity in variant contexts

