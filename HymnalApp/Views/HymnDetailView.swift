// Views/HymnDetailView.swift
import SwiftUI

struct HymnDetailView: View {
    private let id: String
    private let title: String
    private let number: Int

    @EnvironmentObject private var controller: HymnalController
    @State private var hymn: Hymn?
    @State private var error: String?
    @State private var isLoading = true
    @State private var fontSize: CGFloat = 18
    @State private var variants: [HymnSummary] = []
    @State private var showVariantsSheet = false

    init(hymn: Hymn) {
        self.id = hymn.id
        self.title = hymn.title
        self.number = hymn.number
        _hymn = State(initialValue: hymn)
    }

    init(summary: HymnSummary) {
        self.id = summary.id
        self.title = summary.title
        self.number = summary.number
    }

    var body: some View {
        Group {
            if isLoading && hymn == nil {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = error {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.yellow)
                    
                    Text("Failed to load hymn")
                        .font(.title2)
                        .fontWeight(.semibold)
                    
                    Text(error)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Button("Retry") {
                        Task { await loadHymnAndVariants() }
                    }
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 8)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding()
            } else if let hymn = hymn {
                HymnContentView(hymn: hymn, fontSize: $fontSize)
                    .overlay(
                        makeBottomControls(showVariantsButton: !variants.isEmpty),
                        alignment: .bottom
                    )
                    .overlay(
                        makeFloatingActionButtons(),
                        alignment: .bottomTrailing
                    )
                    .sheet(isPresented: $showVariantsSheet) {
                        NavigationStack {
                            VariantsListView(variants: variants, hymnId: id)
                                .navigationTitle("Variants")
                                .navigationBarTitleDisplayMode(.inline)
                        }
                    }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No content available")
                        .font(.title2)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await loadHymnAndVariants()
            }
        }
    }

    private func loadHymnAndVariants() async {
        isLoading = true
        error = nil
        do {
            hymn = try await controller.getHymn(id: id)
            variants = try await controller.getVariants(id: id)
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            hymn = nil
            variants = []
        }
    }

    @ViewBuilder
    private func makeBottomControls(showVariantsButton: Bool) -> some View {
        HStack {
            // Unified font control: A– / A+
            FontSizeControl(fontSize: $fontSize)
                .frame(maxWidth: 0.4)

            Spacer()

            // Variants button (transparent icon) - REMOVED from here
        }
        .frame(maxWidth: .infinity, maxHeight: 44)
        .padding(.bottom, 8)
    }
    
    @ViewBuilder
    private func makeFloatingActionButtons() -> some View {
        VStack(spacing: 16) {
            // Variants button (clean, no background)
            Button {
                showVariantsSheet = true
            } label: {
                Image(systemName: "square.stack.fill")
                    .font(.title3)
                    .foregroundColor(.primary)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Color.clear))
            }
            .accessibilityLabel("View Variants")
            
            // Favorite button (with circular red background)
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    controller.toggleFavorite(hymnId: id)
                }
            } label: {
                Image(systemName: controller.isFavorite(hymnId: id) ? "heart.fill" : "heart")
                    .font(.title3)
                    .foregroundColor(.red)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle()
                            .fill(Color.red.opacity(0.12))
                    )
            }
            .accessibilityLabel(controller.isFavorite(hymnId: id) ? "Remove from Favorites" : "Add to Favorites")
        }
        .padding(.trailing, 16)
        .padding(.bottom, 70) // Position above bottom controls
    }
}

// MARK: - Font Size Control

private struct FontSizeControl: View {
    @Binding var fontSize: CGFloat

    var body: some View {
        HStack(spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    fontSize = max(14, fontSize - 1)
                }
            } label: {
                Text("A–")
                    .font(.caption)
                    .frame(maxWidth: 0.5, maxHeight: .infinity)
                    .contentShape(Rectangle())
            }
            .buttonStyle(FontSizeButtonStyle())

            Divider()
                .frame(height: 16)

            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    fontSize = min(28, fontSize + 1)
                }
            } label: {
                Text("A+")
                    .font(.caption)
                    .frame(maxWidth: 0.5, maxHeight: .infinity)
                    .contentShape(Rectangle())
            }
            .buttonStyle(FontSizeButtonStyle())
        }
        .frame(height: 32)
        .clipShape(Capsule())
        .accessibilityLabel("Adjust font size")
    }
}

private struct FontSizeButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                configuration.isPressed
                    ? Color.secondary.opacity(0.1)
                    : Color.clear
            )
            .foregroundColor(.primary)
    }
}

// MARK: - Hymn Content View

private struct HymnContentView: View {
    let hymn: Hymn
    @Binding var fontSize: CGFloat

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 6) {
                    Text(hymn.title)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                    
                    Text("Hymn #\(hymn.number)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)

                ForEach(0 ..< hymn.content.verses.count, id: \.self) { index in
                    let verse = hymn.content.verses[index]
                    
                    HymnSection(
                        label: verse.name.isEmpty ? "Verse \(index + 1)" : verse.tag.uppercased(),
                        content: verse.content,
                        fontSize: fontSize,
                        isChorus: false
                    )

                    if let chorus = hymn.content.chorus {
                        HymnSection(
                            label: "Chorus",
                            content: chorus,
                            fontSize: fontSize,
                            isChorus: true
                        )
                    }
                }
                
                Spacer(minLength: 100)
            }
        }
    }
}

// MARK: - Variants List View

private struct VariantsListView: View {
    let variants: [HymnSummary]
    let hymnId: String

    var body: some View {
        if variants.isEmpty {
            VStack(spacing: 12) {
                Image(systemName: "square.stack")
                    .font(.system(size: 48))
                    .foregroundColor(.secondary)
                Text("No variants found")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            List(variants) { variant in
                NavigationLink {
                    HymnDetailView(summary: variant)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(variant.title)
                            .font(.headline)
                            .lineLimit(2)
                        Text("Hymn #\(variant.number) • \(variant.hymnBookTitle)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .listStyle(.insetGrouped)
        }
    }
}

// MARK: - Hymn Section

private struct HymnSection: View {
    let label: String
    let content: String
    let fontSize: CGFloat
    let isChorus: Bool

    var body: some View {
        VStack(alignment: .center, spacing: 8) {
            Text(label)
                .font(.system(size: fontSize + 2, weight: isChorus ? .medium : .semibold))
                .foregroundColor(isChorus ? .blue : .primary)
                .padding(.horizontal, 16)

            Text(content)
                .font(.system(size: fontSize, weight: .regular))
                .foregroundColor(.primary)
                .multilineTextAlignment(.center)
                .lineSpacing(6)
                .padding(.horizontal, 24)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, isChorus ? 12 : 16)
        .background(
            isChorus
            ? RoundedRectangle(cornerRadius: 14)
                .fill(Color.blue.opacity(0.08))
            : nil
        )
        .padding(.horizontal, 16)
    }
}

// MARK: - Previews

struct HymnDetailView_Previews: PreviewProvider {
    static var previews: some View {
        let mockHymn = Hymn(
            id: "1",
            title: "Amazing Grace",
            number: 101,
            hymnBookId: "1",
            variantKey: nil,
            content: Hymn.HymnContent(
                verses: [
                    Hymn.Verse(tag: "v1", name: "1", content: "Amazing grace! How sweet the sound\nThat saved a wretch like me!"),
                    Hymn.Verse(tag: "v2", name: "2", content: "Twas grace that taught my heart to fear,\nAnd grace my fears relieved;")
                ],
                chorus: "Chorus goes here...\nSing it loud!"
            )
        )
        
        return NavigationStack {
            HymnDetailView(hymn: mockHymn)
                .environmentObject(HymnalController(apiService: MockService()))
        }
    }
}
