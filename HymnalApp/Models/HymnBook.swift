// Models/HymnBook.swift
import Foundation

struct HymnBook: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let thumbnailPath: String?
    
    enum CodingKeys: String, CodingKey {
        case id, title
        case thumbnailPath = "thumbnail_path"
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: HymnBook, rhs: HymnBook) -> Bool {
        lhs.id == rhs.id
    }
}
