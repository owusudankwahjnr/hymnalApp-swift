// Mocks/MockService.swift
import Foundation

/// Conforms to HymnalAPIService using local JSON mocks.
/// Use for previews, testing, or offline dev—mimics real API structure.

class MockService: HymnalAPIService {
    /// Load mock data from bundle JSON files.
    private func loadMock<T: Decodable>(_ fileName: String) -> T {
        guard let url = Bundle.main.url(forResource: fileName, withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            fatalError("Mock file \(fileName).json not found.")
        }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            fatalError("Failed to decode mock: \(error)")
        }
    }
    
    func fetchHymnBooks() async throws -> [HymnBook] {
        return loadMock("MockHymnBooks")
    }
    
    func searchHymns(query: String?, hymnBookId: String?, skip: Int, limit: Int) async throws -> [HymnSummary] {
        let all: [HymnSummary] = loadMock("MockHymnSummaries")
        // Simple mock filtering/pagination—real logic would be more robust.
        let filtered = all.filter { summary in
            (query == nil || summary.title.lowercased().contains((query ?? "").lowercased())) &&
            (hymnBookId == nil || summary.hymnBookId == hymnBookId)
        }
        let start = min(skip, filtered.count)
        let end = min(start + limit, filtered.count)
        return Array(filtered[start..<end])
    }
    
    func fetchHymn(id: String) async throws -> Hymn {
        let all: [Hymn] = loadMock("MockHymns")
        guard let hymn = all.first(where: { $0.id == id }) else {
            throw APIError.noData
        }
        return hymn
    }
    
    func fetchVariants(id: String) async throws -> [HymnSummary] {
        return loadMock("MockHymnVariants")
    }
}
