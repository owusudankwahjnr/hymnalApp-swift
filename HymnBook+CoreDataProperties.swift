//
//  HymnBook+CoreDataProperties.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import CoreData


extension HymnBook {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<HymnBook> {
        return NSFetchRequest<HymnBook>(entityName: "HymnBook")
    }

    @NSManaged public var id: Int32
    @NSManaged public var name: String?
    @NSManaged public var hymns: Hymn?

}

extension HymnBook : Identifiable {

}
