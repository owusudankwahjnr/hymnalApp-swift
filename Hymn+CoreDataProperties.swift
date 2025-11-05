//
//  Hymn+CoreDataProperties.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import CoreData


extension Hymn {

    @nonobjc public class func fetchRequest() -> NSFetchRequest<Hymn> {
        return NSFetchRequest<Hymn>(entityName: "Hymn")
    }

    @NSManaged public var id: Int32
    @NSManaged public var number: Int32
    @NSManaged public var title: String?
    @NSManaged public var hymnBookId: Int32
    @NSManaged public var hymnBook: HymnBook?
    @NSManaged public var verses: Verse?
    @NSManaged public var chorus: Chorus?

}

extension Hymn : Identifiable {

}
