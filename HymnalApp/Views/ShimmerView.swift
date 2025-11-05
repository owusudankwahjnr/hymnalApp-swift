//// Views/ShimmerView.swift
//import SwiftUI
//
///// Shimmer effect for loading placeholders.
///// Applied as a modifier to views for a subtle loading animation.
///// Components like ShimmerListRow and ShimmerCard for consistent placeholders across the app.
//
//struct ShimmerEffect: ViewModifier {
//    @State private var phase: CGFloat = 0
//
//    func body(content: Content) -> some View {
//        content
//            .overlay(
//                LinearGradient(
//                    gradient: Gradient(colors: [
//                        .gray.opacity(0.2),
//                        .gray.opacity(0.4),
//                        .gray.opacity(0.2)
//                    ]),
//                    startPoint: .init(x: phase - 0.4, y: 0.5),
//                    endPoint: .init(x: phase + 0.4, y: 0.5)
//                )
//                .mask(content)
//                .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: phase)
//            )
//            .onAppear {
//                phase = 1
//            }
//    }
//}
//
//extension View {
//    func shimmerEffect() -> some View {
//        modifier(ShimmerEffect())
//    }
//}
//
//struct ShimmerListRow: View {
//    var body: some View {
//        VStack(alignment: .leading, spacing: 8) {
//            RoundedRectangle(cornerRadius: 4)
//                .fill(Color.gray.opacity(0.2))
//                .shimmerEffect()
//                .frame(height: 20)
//                .frame(maxWidth: .infinity)
//            RoundedRectangle(cornerRadius: 4)
//                .fill(Color.gray.opacity(0.2))
//                .shimmerEffect()
//                .frame(height: 16)
//                .frame(maxWidth: 150)
//        }
//        .padding(.vertical, 4)
//    }
//}
//
//struct ShimmerCard: View {
//    var body: some View {
//        RoundedRectangle(cornerRadius: 12)
//            .fill(Color.gray.opacity(0.2))
//            .shimmerEffect()
//            .frame(width: 160, height: 100)
//    }
//}
//
//struct ShimmerView_Previews: PreviewProvider {
//    static var previews: some View {
//        VStack {
//            ShimmerListRow()
//            ShimmerCard()
//        }
//        .padding()
//        .previewLayout(.sizeThatFits)
//    }
//}
