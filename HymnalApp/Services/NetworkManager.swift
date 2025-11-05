import Foundation

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case requestFailed(String)
    case decodingError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .requestFailed(let message):
            return "Request failed: \(message)"
        case .decodingError(let message):
            return "Decoding failed: \(message)"
        }
    }
}

class NetworkManager {
    static let shared = NetworkManager()
    private let baseURL = "https://hymnal-api.onrender.com" // Update for device testing
//    private let baseURL = "http://127.0.0.1:8000"

    private init() {}

    func get<T: Codable>(endpoint: String, parameters: [String: Any] = [:]) async throws -> T {
        guard var components = URLComponents(string: "\(baseURL)\(endpoint)") else {
            throw NetworkError.invalidURL
        }

        if !parameters.isEmpty {
            components.queryItems = parameters.map { URLQueryItem(name: $0.key, value: "\($0.value)") }
        }

        guard let url = components.url else {
            throw NetworkError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.requestFailed("Invalid response")
        }

//        print("HTTP \(httpResponse.statusCode) for URL: \(url), data: \(String(data: data, encoding: .utf8) ?? "nil")")

        if httpResponse.statusCode == 404 {
            if T.self == [Hymn].self {
                return [] as! T // Handle 404 as empty list for hymns
            }
            throw NetworkError.requestFailed("Resource not found")
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw NetworkError.requestFailed("HTTP \(httpResponse.statusCode)")
        }

        if data.isEmpty, T.self == [Hymn].self {
//            print("Empty response for URL: \(url)")
            return [] as! T // Handle empty data as empty list
        }

        do {
            let decoded = try JSONDecoder().decode(T.self, from: data)
            return decoded
        } catch {
            throw NetworkError.decodingError("Decoding failed: \(error.localizedDescription), data: \(String(data: data, encoding: .utf8) ?? "nil")")
        }
    }
}
