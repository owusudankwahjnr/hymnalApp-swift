// Protocols/HymnalAPIService.swift
import Foundation

protocol HymnalAPIService {
    func fetchHymnBooks() async throws -> [HymnBook]
    func searchHymns(query: String?, hymnBookId: String?, skip: Int, limit: Int) async throws -> [HymnSummary]
    func fetchHymn(id: String) async throws -> Hymn
    func fetchVariants(id: String) async throws -> [HymnSummary]
}
