import UIKit
import SwiftUI
import TPStreamsSDK

@objc public class TPStreamPlayerHostingView: UIView {
    private var hostingController: UIHostingController<TPStreamPlayerView>?
    private var player: TPAVPlayer?
    
    @objc public var videoId: String = "" {
        didSet {
            updatePlayer()
        }
    }
    
    @objc public var accessToken: String = "" {
        didSet {
            updatePlayer()
        }
    }
    
    @objc public var shouldAutoPlay: Bool = true {
        didSet {
            if let player = player {
                if shouldAutoPlay {
                    player.play()
                } else {
                    player.pause()
                }
            }
        }
    }
    
    @objc public var startAt: Double = 0 {
        didSet {
            if let player = player {
                player.seek(to: CMTime(seconds: startAt, preferredTimescale: 1000))
            }
        }
    }
    
    @objc public var enableDownload: Bool = false
    @objc public var offlineLicenseExpireTime: Double = 1296000 // 15 days in seconds
    @objc public var showDefaultCaptions: Bool = false
    @objc public var downloadMetadata: String = ""
    
    // Event callbacks
    @objc public var onCurrentPosition: RCTDirectEventBlock?
    @objc public var onDuration: RCTDirectEventBlock?
    @objc public var onIsPlaying: RCTDirectEventBlock?
    @objc public var onPlaybackSpeed: RCTDirectEventBlock?
    @objc public var onPlayerStateChanged: RCTDirectEventBlock?
    @objc public var onIsPlayingChanged: RCTDirectEventBlock?
    @objc public var onPlaybackSpeedChanged: RCTDirectEventBlock?
    @objc public var onIsLoadingChanged: RCTDirectEventBlock?
    @objc public var onError: RCTDirectEventBlock?
    @objc public var onAccessTokenExpired: RCTDirectEventBlock?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupObservers()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupObservers()
    }
    
    private func setupObservers() {
        // Setup observers for player events
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerStateChanged(_:)),
            name: .TPPlayerStateChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(isPlayingChanged(_:)),
            name: .TPIsPlayingChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playbackSpeedChanged(_:)),
            name: .TPPlaybackSpeedChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(isLoadingChanged(_:)),
            name: .TPIsLoadingChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerError(_:)),
            name: .TPPlayerError,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(accessTokenExpired(_:)),
            name: .TPAccessTokenExpired,
            object: nil
        )
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
        player?.pause()
        player = nil
    }
    
    private func updatePlayer() {
        guard !videoId.isEmpty && !accessToken.isEmpty else {
            return
        }
        
        // Create a new player with the updated videoId and accessToken
        player = TPAVPlayer(
            assetID: videoId,
            accessToken: accessToken,
            enableDownload: enableDownload,
            offlineLicenseExpireTime: offlineLicenseExpireTime,
            showDefaultCaptions: showDefaultCaptions,
            downloadMetadata: downloadMetadata
        )
        
        if shouldAutoPlay {
            player?.play()
        }
        
        if startAt > 0 {
            player?.seek(to: CMTime(seconds: startAt, preferredTimescale: 1000))
        }
        
        // Create the SwiftUI view
        let playerView = TPStreamPlayerView(player: player!)
        
        // Create the hosting controller
        let hostingController = UIHostingController(rootView: playerView)
        hostingController.view.backgroundColor = .clear
        
        // Remove previous hosting controller's view if it exists
        self.hostingController?.view.removeFromSuperview()
        self.hostingController?.removeFromParent()
        
        // Add the new hosting controller's view
        self.hostingController = hostingController
        
        if let parentViewController = findViewController() {
            parentViewController.addChild(hostingController)
            addSubview(hostingController.view)
            hostingController.view.frame = bounds
            hostingController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            hostingController.didMove(toParent: parentViewController)
        } else {
            // Fallback if we can't find a view controller
            addSubview(hostingController.view)
            hostingController.view.frame = bounds
            hostingController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        }
    }
    
    override public func layoutSubviews() {
        super.layoutSubviews()
        hostingController?.view.frame = bounds
    }
    
    // Helper method to find the parent view controller
    private func findViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let nextResponder = responder?.next {
            if let viewController = nextResponder as? UIViewController {
                return viewController
            }
            responder = nextResponder
        }
        return nil
    }
    
    // MARK: - Player Control Methods
    
    @objc public func play() {
        player?.play()
    }
    
    @objc public func pause() {
        player?.pause()
    }
    
    @objc public func seekTo(_ position: Double) {
        player?.seek(to: CMTime(seconds: position / 1000, preferredTimescale: 1000))
    }
    
    @objc public func setPlaybackSpeed(_ speed: Float) {
        player?.rate = speed
    }
    
    @objc public func getCurrentPosition(_ callback: @escaping RCTResponseSenderBlock) {
        if let player = player, let currentItem = player.currentItem {
            let position = CMTimeGetSeconds(currentItem.currentTime()) * 1000
            callback([NSNull(), position])
        } else {
            callback([NSNull(), 0])
        }
    }
    
    @objc public func getDuration(_ callback: @escaping RCTResponseSenderBlock) {
        if let player = player, let currentItem = player.currentItem {
            let duration = CMTimeGetSeconds(currentItem.duration) * 1000
            callback([NSNull(), duration])
        } else {
            callback([NSNull(), 0])
        }
    }
    
    @objc public func isPlaying(_ callback: @escaping RCTResponseSenderBlock) {
        if let player = player {
            callback([NSNull(), player.rate > 0])
        } else {
            callback([NSNull(), false])
        }
    }
    
    @objc public func getPlaybackSpeed(_ callback: @escaping RCTResponseSenderBlock) {
        if let player = player {
            callback([NSNull(), player.rate])
        } else {
            callback([NSNull(), 1.0])
        }
    }
    
    @objc public func setNewAccessToken(_ newToken: String) {
        accessToken = newToken
        player?.updateAccessToken(newToken)
    }
    
    // MARK: - Notification Handlers
    
    @objc private func playerStateChanged(_ notification: Notification) {
        guard let playerState = notification.userInfo?["state"] as? Int else { return }
        onPlayerStateChanged?(["playbackState": playerState])
    }
    
    @objc private func isPlayingChanged(_ notification: Notification) {
        guard let isPlaying = notification.userInfo?["isPlaying"] as? Bool else { return }
        onIsPlayingChanged?(["isPlaying": isPlaying])
    }
    
    @objc private func playbackSpeedChanged(_ notification: Notification) {
        guard let speed = notification.userInfo?["speed"] as? Double else { return }
        onPlaybackSpeedChanged?(["speed": speed])
    }
    
    @objc private func isLoadingChanged(_ notification: Notification) {
        guard let isLoading = notification.userInfo?["isLoading"] as? Bool else { return }
        onIsLoadingChanged?(["isLoading": isLoading])
    }
    
    @objc private func playerError(_ notification: Notification) {
        guard let error = notification.userInfo?["error"] as? Error,
              let code = notification.userInfo?["code"] as? Int else { return }
        
        let details = notification.userInfo?["details"] as? String
        var errorInfo: [String: Any] = [
            "message": error.localizedDescription,
            "code": code
        ]
        
        if let details = details {
            errorInfo["details"] = details
        }
        
        onError?(errorInfo)
    }
    
    @objc private func accessTokenExpired(_ notification: Notification) {
        guard let videoId = notification.userInfo?["videoId"] as? String else { return }
        onAccessTokenExpired?(["videoId": videoId])
    }
}
