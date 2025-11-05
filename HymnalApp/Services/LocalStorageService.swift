// Services/LocalStorageService.swift
import Foundation

class LocalStorageService {
    private let fileManager = FileManager.default
    private let documentsURL: URL
    
    init() {
        documentsURL = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    func save<T: Encodable>(_ data: T, to fileName: String) throws {
        let wrapper = EncodeCacheWrapper(data: data, timestamp: Date())
        let url = documentsURL.appendingPathComponent(fileName).appendingPathExtension("json")
        let jsonData = try JSONEncoder().encode(wrapper)
        try jsonData.write(to: url)
    }
    
    func load<T: Decodable>(_ type: T.Type, from fileName: String, expiration: TimeInterval = Config.cacheExpiration) throws -> T {
        let url = documentsURL.appendingPathComponent(fileName).appendingPathExtension("json")
        guard fileManager.fileExists(atPath: url.path) else { throw APIError.cacheMiss }
        
        let data = try Data(contentsOf: url)
        let wrapper = try JSONDecoder().decode(DecodeCacheWrapper<T>.self, from: data)
        
        if Date().timeIntervalSince(wrapper.timestamp) > expiration {
            throw APIError.cacheExpired
        }
        
        return wrapper.data
    }
    
    private struct EncodeCacheWrapper<T: Encodable>: Encodable {
        let data: T
        let timestamp: Date
    }

    private struct DecodeCacheWrapper<T: Decodable>: Decodable {
        let data: T
        let timestamp: Date
    }
}
