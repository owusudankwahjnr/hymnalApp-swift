// Views/LaunchScreenView.swift
import SwiftUI

/// Minimal, premium launch screen that mirrors native iOS app launch behavior.
/// Displays only the AppIcon with a subtle scale + fade-in animation.
/// Automatically transitions to MainTabView after 2 seconds with a smooth crossfade.

struct LaunchScreenView: View {
    @State private var isTransitioning = false
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0.0

    var body: some View {
        ZStack {
            // Adaptive system background (light/dark mode)
            Color(.systemBackground)
                .ignoresSafeArea()
            
            // Centered AppIcon from asset catalog
            Image("logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 120, height: 120)
                .scaleEffect(logoScale)
                .opacity(logoOpacity)
                .animation(
                    .spring(response: 0.6, dampingFraction: 0.75, blendDuration: 0.3),
                    value: logoScale
                )
        }
        .onAppear {
            // Animate logo in
            withAnimation {
                logoScale = 1.0
                logoOpacity = 1.0
            }
            
            // Schedule transition to main app
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation(.easeInOut(duration: 0.35)) {
                    isTransitioning = true
                }
            }
        }
        .fullScreenCover(
            isPresented: $isTransitioning,
            content: {
                MainTabView()
                    .transition(.opacity.combined(with: .scale))
            }
        )
    }
}

// MARK: - Previews

struct LaunchScreenView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            LaunchScreenView()
                .preferredColorScheme(.light)
                .previewDisplayName("Light Mode")
            
            LaunchScreenView()
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark Mode")
        }
    }
}
