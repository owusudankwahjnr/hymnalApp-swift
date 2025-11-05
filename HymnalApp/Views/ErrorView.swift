//
//  ErrorView.swift
//  Hymnals
//
//  Created by KOD on 31/10/2025.
//

// Views/ErrorView.swift
import SwiftUI

/// Reusable error view component.
/// Displays message and retry button.
/// Used across views for consistent error handling.

struct ErrorView: View {
    let error: String
    let retryAction: () -> Void

    var body: some View {
        VStack {
            Text(error)
                .foregroundColor(.red)
                .padding()
            Button("Retry") {
                retryAction()
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
    }
}
