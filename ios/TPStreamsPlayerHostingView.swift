import SwiftUI
import UIKit
import AVKit

@objcMembers
public class TPStreamsPlayerHostingView: UIView {
    private var hostingController: UIHostingController<AnyView>?
    private var currentSourceUrl: String = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }
    
    public override func layoutSubviews() {
        super.layoutSubviews()
        updateVideoView()
    }
    
    private func setup() {
        let controller = UIHostingController(rootView: AnyView(VideoPlayerView(videoURL: URL(string: currentSourceUrl)!, frame: frame)))
        controller.view.backgroundColor = UIColor.clear
        hostingController = controller

        addSubview(controller.view)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
        controller.view.topAnchor.constraint(equalTo: topAnchor),
        controller.view.bottomAnchor.constraint(equalTo: bottomAnchor),
        controller.view.leadingAnchor.constraint(equalTo: leadingAnchor),
        controller.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
    }
    
    private func updateVideoView() {
        guard bounds.width > 0 && bounds.height > 0 else { return }
        
        if let videoURL = URL(string: currentSourceUrl) {
            hostingController?.rootView = AnyView(VideoPlayerView(videoURL: videoURL, frame: bounds))
        }
    }

    public func setSourceUrl(_ url: String) {
        currentSourceUrl = url
        updateVideoView()
    }
}

private struct VideoPlayerView: View {
  let videoURL: URL
  let frame: CGRect
  
  var body: some View {
    VideoPlayer(player: AVPlayer(url: videoURL))
      .frame(width: frame.width, height: frame.height)
      .clipped()
      .contentShape(Rectangle())
      .onAppear {
        AVPlayer(url: videoURL).play()
      }
  }
}