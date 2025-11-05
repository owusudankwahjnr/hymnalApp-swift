//
//  HymnBook.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import SwiftData


@Model public class HymnBook {
    var id: Int32? = 0
    var name: String?
    @Relationship(inverse: \Hymn.hymnBook) var hymns: Hymn?
    public init() {

    }
    
}
