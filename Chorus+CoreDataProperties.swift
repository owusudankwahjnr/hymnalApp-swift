//
//  Chorus+CoreDataProperties.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import CoreData


extension Chorus {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<Chorus> {
        return NSFetchRequest<Chorus>(entityName: "Chorus")
    }

    @NSManaged public var id: Int32
    @NSManaged public var text: String?
    @NSManaged public var hymn: Hymn?

}

extension Chorus : Identifiable {

}
