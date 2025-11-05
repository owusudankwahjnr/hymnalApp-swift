//
//  Hymn.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import SwiftData


@Model public class Hymn {
    var id: Int32? = 0
    var number: Int32? = 0
    var title: String?
    var hymnBookId: Int32? = 0
    var hymnBook: HymnBook?
    @Relationship(inverse: \Verse.hymn) var verses: Verse?
    var chorus: Chorus?
    public init() {

    }
    
}
