// Models/Hymn.swift
import Foundation

struct Hymn: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let number: Int
    let hymnBookId: String
    let variantKey: String?
    let content: HymnContent
    
    enum CodingKeys: String, CodingKey {
        case id, title, number
        case hymnBookId = "hymn_book_id"
        case variantKey = "variant_key"
        case content
    }
    
    struct HymnContent: Codable {
        let verses: [Verse]
        let chorus: String?
        
        enum CodingKeys: String, CodingKey {
            case verses, chorus
        }
    }
    
    struct Verse: Codable, Hashable {
        let tag: String       // e.g., "v1"
        let name: String      // e.g., "1", "Chorus", etc.
        let content: String   // actual lyrics
        
        enum CodingKeys: String, CodingKey {
            case tag = "verse_tag"
            case name = "verse_name"
            case content = "verse_content"
        }
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Hymn, rhs: Hymn) -> Bool {
        lhs.id == rhs.id
    }
}
