// Controllers/HymnalController.swift
import Foundation
import Combine

class HymnalController: ObservableObject {
    @Published var hymnBooks: [HymnBook] = []
    @Published var favoriteHymnIds: Set<String> = []
    @Published var errorMessage: String? = nil
    @Published var lastUpdated: Date? = nil
    @Published var isOffline: Bool = false
    
    private let apiService: HymnalAPIService
    private let localStorage: LocalStorageService
    private let networkMonitor: NetworkMonitor
    private var cancellables = Set<AnyCancellable>()
    
    private let hymnBooksCacheFile = "hymnBooks"
    private let favoritesCacheFile = "favorites"
    
    init(apiService: HymnalAPIService = APIService(),
         localStorage: LocalStorageService = LocalStorageService(),
         networkMonitor: NetworkMonitor = .shared) {
        self.apiService = apiService
        self.localStorage = localStorage
        self.networkMonitor = networkMonitor
        
        // ✅ Fixed: assign(to:on:) with key path and stored cancellable
        let cancellable = networkMonitor.$isConnected
            .map { !$0 }
            .assign(to: \.isOffline, on: self)
        
        cancellables.insert(cancellable)
        
        Task { await loadHymnBooks(policy: .cacheFirst) }
        loadFavoritesFromCache()
    }
    
    func loadHymnBooks(policy: CachePolicy = .cacheFirst) async {
        do {
            hymnBooks = try await fetchWithCache(
                networkFetch: { try await self.apiService.fetchHymnBooks() },
                cacheLoad: { try self.localStorage.load([HymnBook].self, from: self.hymnBooksCacheFile) },
                cacheSave: { try self.localStorage.save($0, to: self.hymnBooksCacheFile) },
                policy: policy
            )
            lastUpdated = Date()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func searchHymnSummaries(query: String?, hymnBookId: String?, skip: Int, limit: Int, policy: CachePolicy = .cacheFirst) async throws -> [HymnSummary] {
        if policy == .offlineOnly || (policy == .cacheFirst && isOffline) {
            throw APIError.offline
        }
        return try await apiService.searchHymns(query: query, hymnBookId: hymnBookId, skip: skip, limit: limit)
    }
    
    func getHymn(id: String, policy: CachePolicy = .cacheFirst) async throws -> Hymn {
        if policy == .offlineOnly || (policy == .cacheFirst && isOffline) {
            throw APIError.offline
        }
        return try await apiService.fetchHymn(id: id)
    }
    
    func getVariants(id: String, policy: CachePolicy = .cacheFirst) async throws -> [HymnSummary] {
        if policy == .offlineOnly || (policy == .cacheFirst && isOffline) {
            throw APIError.offline
        }
        return try await apiService.fetchVariants(id: id)
    }
    
    func toggleFavorite(hymnId: String) {
        if favoriteHymnIds.contains(hymnId) {
            favoriteHymnIds.remove(hymnId)
        } else {
            favoriteHymnIds.insert(hymnId)
        }
        saveFavoritesToCache()
    }
    
    func isFavorite(hymnId: String) -> Bool {
        favoriteHymnIds.contains(hymnId)
    }
    
    private func fetchWithCache<T: Codable>(
        networkFetch: @escaping () async throws -> T,
        cacheLoad: () throws -> T,
        cacheSave: @escaping (T) throws -> Void,
        policy: CachePolicy
    ) async throws -> T {
        switch policy {
        case .networkOnly:
            let data = try await networkFetch()
            try? cacheSave(data)
            return data
        case .cacheFirst:
            if let cached = try? cacheLoad() {
                if !isOffline {
                    Task {
                        do {
                            let fresh = try await networkFetch()
                            try cacheSave(fresh)
                            DispatchQueue.main.async { self.objectWillChange.send() }
                        } catch { /* Log */ }
                    }
                }
                return cached
            } else if !isOffline {
                let data = try await networkFetch()
                try cacheSave(data)
                return data
            } else {
                throw APIError.offline
            }
        case .offlineOnly:
            return try cacheLoad()
        }
    }
    
    private func saveFavoritesToCache() {
        try? localStorage.save(Array(favoriteHymnIds), to: favoritesCacheFile)
    }
    
    private func loadFavoritesFromCache() {
        if let cached: [String] = try? localStorage.load([String].self, from: favoritesCacheFile) {
            favoriteHymnIds = Set(cached)
        }
    }
}

enum CachePolicy {
    case networkOnly
    case cacheFirst
    case offlineOnly
}
