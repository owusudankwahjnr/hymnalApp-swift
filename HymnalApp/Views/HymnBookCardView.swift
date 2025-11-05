//
//  HymnBookCardView.swift
//  Hymnals
//
//  Created by KOD on 01/11/2025.
//

// Views/HymnBookCardView.swift
import SwiftUI

struct HymnBookCardView: View {
    let hymnBook: HymnBook
    @State private var isLoading = true
    @State private var imageLoadFailed = false
    
    private let mediaBaseURL = Config.apiBaseURL
        .deletingLastPathComponent()
        .deletingLastPathComponent()

    var body: some View {
        VStack(spacing: 8) {
            // Thumbnail with background
            ZStack {
                // Background: blurred image or gradient
                if !imageLoadFailed, let path = hymnBook.thumbnailPath,
                   let url = URL(string: mediaBaseURL.absoluteString + path) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            Color.clear
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .blur(radius: isLoading ? 10 : 0)
                                .opacity(isLoading ? 0.6 : 1)
                        case .failure:
                            Image(systemName: "book.fill")
                                .imageScale(.large)
                                .foregroundColor(.secondary)
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .frame(height: 90)
                    .clipped()
                    .overlay(
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.black.opacity(0.1),
                                        Color.clear
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    )
                } else {
                    // Fallback gradient
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [.blue.opacity(0.3), .purple.opacity(0.2)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            Image(systemName: "book.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.white.opacity(0.7))
                        )
                }

                // Overlay: subtle shine
                Rectangle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(colors: [.white.opacity(0.2), .clear]),
                            center: .topLeading,
                            startRadius: 0,
                            endRadius: 80
                        )
                    )
                    .mask(
                        Rectangle()
                            .frame(width: 80, height: 80)
                            .offset(x: -20, y: -20)
                    )
            }
            .frame(height: 90)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color(.separator), lineWidth: 0.5)
            )

            // Title
            Text(hymnBook.title)
                .font(.headline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .padding(.horizontal, 4)
                .opacity(isLoading ? 0 : 1)
                .animation(.easeInOut(duration: 0.3).delay(0.1), value: isLoading)
        }
        .frame(width: 160, height: 130)
        .padding(8)
        .background(Color.clear)
        .onAppear {
            // Simulate load delay for fade-in
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isLoading = false
                }
            }
        }
//        .onTapGesture {
//            let impact = UIImpactFeedbackGenerator(style: .light)
//            impact.impactOccurred()
//        }
    }
}
