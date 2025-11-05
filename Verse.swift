//
//  Verse.swift
//  Hymnals
//
//  Created by KOD on 02/06/2025.
//
//

import Foundation
import SwiftData


@Model public class Verse {
    var id: Int32? = 0
    var text: String?
    var order: Int32? = 0
    var hymn: Hymn?
    public init() {

    }
    
}
