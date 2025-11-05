//
//  Chorus.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import SwiftData


@Model public class Chorus {
    var id: Int32? = 0
    var text: String?
    @Relationship(inverse: \Hymn.chorus) var hymn: Hymn?
    public init() {

    }
    
}
