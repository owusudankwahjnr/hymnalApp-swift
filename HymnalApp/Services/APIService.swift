// Services/APIService.swift
import Foundation

class APIService: HymnalAPIService {
    private let rootURL = Config.apiBaseURL // Should be "https://your-api.com/api/v1"
    private var hymnalBaseURL: URL { rootURL }
    private let session = URLSession.shared
    
    func fetchHymnBooks() async throws -> [HymnBook] {
        let url = hymnalBaseURL.appendingPathComponent("hymn_books")
        return try await performRequest(url)
    }
    
    func searchHymns(query: String?, hymnBookId: String?, skip: Int, limit: Int) async throws -> [HymnSummary] {
        var components = URLComponents(url: hymnalBaseURL.appendingPathComponent("search"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = []
        
        if let query = query, !query.isEmpty {
            items.append(URLQueryItem(name: "title", value: query))
        }
        if let hymnBookId = hymnBookId {
            items.append(URLQueryItem(name: "hymn_book_id", value: hymnBookId))
        }
        // Always include skip and limit for pagination
        items.append(URLQueryItem(name: "skip", value: String(skip)))
        items.append(URLQueryItem(name: "limit", value: String(limit)))
        
        components.queryItems = items
        guard let url = components.url else { throw APIError.invalidURL }
        return try await performRequest(url)
    }
    
    func fetchHymn(id: String) async throws -> Hymn {
        let url = hymnalBaseURL.appendingPathComponent("hymns/\(id)")
        return try await performRequest(url)
    }
    
    func fetchVariants(id: String) async throws -> [HymnSummary] {
        let url = hymnalBaseURL.appendingPathComponent("hymns/\(id)/variants")
        return try await performRequest(url)
    }
    
    private func performRequest<T: Decodable>(_ url: URL) async throws -> T {
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse(statusCode: 0)
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse(statusCode: httpResponse.statusCode)
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }
}
