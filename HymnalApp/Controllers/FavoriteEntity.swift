// Controllert/FavoriiteEntity.swift
import Foundation
import CoreData

@objc(FavoriteEntity)
public class FavoriteEntity: NSManagedObject {
    @NSManaged public var hymnId: Int64
}

extension FavoriteEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<FavoriteEntity> {
        return NSFetchRequest<FavoriteEntity>(entityName: "FavoriteEntity")
    }
}
