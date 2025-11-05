// Views/HymnRowView.swift
import SwiftUI
import UIKit

struct HymnRowView: View {
    let hymn: HymnSummary
    @EnvironmentObject private var controller: HymnalController
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        HStack(spacing: 12) {
            // Accent stripe (left edge)
            Rectangle()
                .fill(accentColor)
                .frame(width: 4)
                .clipShape(RoundedRectangle(cornerRadius: 2, style: .circular))
                .padding(.vertical, 2)

            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(hymn.title)
                    .font(.title3)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                
                Text("Hymn #\(hymn.number) • \(hymn.hymnBookTitle)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Favorite button
            Button {
                let impact = UIImpactFeedbackGenerator(style: .light)
                impact.impactOccurred()
                controller.toggleFavorite(hymnId: hymn.id)
            } label: {
                Image(systemName: controller.isFavorite(hymnId: hymn.id) ? "heart.fill" : "heart")
                    .font(.subheadline)
                    .foregroundColor(.red)
                    .frame(width: 32, height: 32)
                    .background(
                        Circle()
                            .fill(Color.red.opacity(controller.isFavorite(hymnId: hymn.id) ? 0.15 : 0.08))
                    )
            }
            .accessibilityLabel(controller.isFavorite(hymnId: hymn.id) ? "Remove from Favorites" : "Add to Favorites")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
        )
        .contentShape(RoundedRectangle(cornerRadius: 14))
//        .onTapGesture {
//            let impact = UIImpactFeedbackGenerator(style: .light)
//            impact.impactOccurred()
//        }
    }

    private var accentColor: Color {
        // Use hymn number to generate consistent accent (optional)
        // For now, use a soft system blue
        return Color(.systemBlue).opacity(0.6)
    }
}

// MARK: - Shimmer Placeholder

struct ShimmerListRow: View {
    var body: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(Color.gray.opacity(0.2))
                .frame(width: 4)
                .clipShape(RoundedRectangle(cornerRadius: 2))
                .padding(.vertical, 2)

            VStack(alignment: .leading, spacing: 6) {
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 18)
                    .cornerRadius(4)
                
                Rectangle()
                    .fill(Color.gray.opacity(0.15))
                    .frame(height: 14)
                    .cornerRadius(4)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Circle()
                .fill(Color.gray.opacity(0.1))
                .frame(width: 32, height: 32)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(.systemBackground))
        )
        .redacted(reason: .placeholder)
        .shimmering()
    }
}

// MARK: - Shimmer Extension

extension View {
    @ViewBuilder
    func shimmering(active: Bool = true) -> some View {
        if active {
            self
                .overlay(
                    GeometryReader { geometry in
                        let gradient = LinearGradient(
                            gradient: Gradient(
                                colors: [
                                    Color.black.opacity(0.04),
                                    Color.black.opacity(0.12),
                                    Color.black.opacity(0.04)
                                ]
                            ),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        
                        Rectangle()
                            .fill(gradient)
                            .frame(width: 120, height: geometry.size.height)
                            .offset(x: -120)
                            .animation(
                                Animation.easeInOut(duration: 1.2).repeatForever(autoreverses: false),
                                value: UUID()
                            )
                    }
                    .mask(self)
                )
        } else {
            self
        }
    }
}
