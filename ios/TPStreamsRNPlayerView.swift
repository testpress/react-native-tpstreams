import UIKit
import TPStreamsSDK
import CoreMedia
import React
import AVFoundation

@objc(TPStreamsRNPlayerView)
class TPStreamsRNPlayerView: UIView {

    private var player: TPAVPlayer?
    private var playerViewController: TPStreamPlayerViewController?

    private var _videoId: NSString = ""
    private var _accessToken: NSString = ""
    private var _shouldAutoPlay: Bool = true
    private var _startAt: Double = 0
    private var _enableDownload: Bool = false
    private var _offlineLicenseExpireTime: Double = 0
    private var _showDefaultCaptions: Bool = false
    private var _downloadMetadata: String?
    private var setupScheduled = false
    private var playerStatusObserver: NSKeyValueObservation?
    
    @objc var onCurrentPosition: RCTDirectEventBlock?
    @objc var onDuration: RCTDirectEventBlock?
    @objc var onIsPlaying: RCTDirectEventBlock?
    @objc var onPlaybackSpeed: RCTDirectEventBlock?
    @objc var onPlayerStateChanged: RCTDirectEventBlock?
    @objc var onIsPlayingChanged: RCTDirectEventBlock?
    @objc var onPlaybackSpeedChanged: RCTDirectEventBlock?
    @objc var onIsLoadingChanged: RCTDirectEventBlock?
    @objc var onError: RCTDirectEventBlock?
    @objc var onAccessTokenExpired: RCTDirectEventBlock?

    @objc var videoId: NSString {
        get { _videoId }
        set {
            _videoId = newValue
            schedulePlayerSetup()
        }
    }

    @objc var accessToken: NSString {
        get { _accessToken }
        set {
            _accessToken = newValue
            schedulePlayerSetup()
        }
    }
    
    @objc var shouldAutoPlay: Bool {
        get { _shouldAutoPlay }
        set {
            _shouldAutoPlay = newValue
        }
    }
    
    @objc var startAt: Double {
        get { _startAt }
        set {
            _startAt = newValue
        }
    }
    
    @objc var enableDownload: Bool {
        get { _enableDownload }
        set {
            _enableDownload = newValue
        }
    }
    
    @objc var offlineLicenseExpireTime: Double {
        get { _offlineLicenseExpireTime }
        set {
            _offlineLicenseExpireTime = newValue
        }
    }
    
    @objc var showDefaultCaptions: Bool {
        get { _showDefaultCaptions }
        set {
            _showDefaultCaptions = newValue
        }
    }
    
    @objc var downloadMetadata: NSString? {
        get { _downloadMetadata as NSString? }
        set {
            _downloadMetadata = newValue as String?
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .black
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .black
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        playerViewController?.view.frame = bounds
    }

    private func schedulePlayerSetup() {
        guard videoId.length > 0, accessToken.length > 0 else { return }

        if setupScheduled { return }
        setupScheduled = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.setupPlayer()
        }
    }

    private func setupPlayer() {
        playerViewController?.view.removeFromSuperview()
        playerViewController?.removeFromParent()
        playerViewController = nil
        player = nil
        playerStatusObserver?.invalidate()

        player = TPAVPlayer(assetID: videoId as String, accessToken: accessToken as String) { error in
            if let error = error {
                print("Online setup error: \(error.localizedDescription)")
                let nsError = error as NSError
                self.onError?([
                    "message": "Player initialization failed",
                    "code": nsError.code,
                    "details": error.localizedDescription
                ])
            }
        }
        
        if startAt > 0 {
            playerStatusObserver = player?.observe(\.status, options: [.new]) { [weak self] player, _ in
                guard let self = self, player.status == .readyToPlay else { return }
                self.seekTo(position: self.startAt*1000.0)
                self.playerStatusObserver?.invalidate()
                self.playerStatusObserver = nil
            }
        }

        let configBuilder = TPStreamPlayerConfigurationBuilder()
            .setPreferredForwardDuration(15)
            .setPreferredRewindDuration(5)
            .setprogressBarThumbColor(.systemBlue)
            .setwatchedProgressTrackColor(.systemBlue)
        
        if enableDownload {
            configBuilder.showDownloadOption()
        }
        
        let config = configBuilder.build()

        let vc = TPStreamPlayerViewController()
        vc.player = player
        vc.config = config

        if let parentVC = self.reactViewController() {
            parentVC.addChild(vc)
            addSubview(vc.view)
            vc.view.frame = bounds
            vc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            vc.view.isHidden = false
            bringSubviewToFront(vc.view)
            vc.didMove(toParent: parentVC)
        }

        if shouldAutoPlay {
            player?.play()
        }
        
        playerViewController = vc
    }
    
    @objc func seekTo(position: Double) {
        guard position >= 0, let player = player else { return }
        
        let seekTime = CMTime(value: CMTimeValue(position), timescale: 1000)
        player.seek(to: seekTime, toleranceBefore: .zero, toleranceAfter: .zero)
    }
    
    @objc func play() {
        player?.play()
    }
    
    @objc func pause() {
        player?.pause()
    }
    
    @objc func setPlaybackSpeed(_ speed: Float) {
        player?.rate = speed
    }
    
    @objc func getCurrentPosition() {
        guard let player = player else {
            onCurrentPosition?(["position": 0])
            return
        }
        
        let currentTime = player.currentTime()
        let positionMs = CMTimeGetSeconds(currentTime) * 1000
        onCurrentPosition?(["position": positionMs])
    }
    
    @objc func getDuration() {
        guard let player = player, let currentItem = player.currentItem else {
            onDuration?(["duration": 0])
            return
        }
        
        let durationMs = CMTimeGetSeconds(currentItem.duration) * 1000
        onDuration?(["duration": durationMs])
    }
    
    @objc func isPlaying() {
        guard let player = player else {
            onIsPlaying?(["isPlaying": false])
            return
        }
        
        let isPlaying = player.timeControlStatus == .playing
        onIsPlaying?(["isPlaying": isPlaying])
    }
    
    @objc func getPlaybackSpeed() {
        let speed = player?.rate ?? 1.0
        onPlaybackSpeed?(["speed": speed])
    }

    @objc func setNewAccessToken(_ newToken: String) {
        print("TPStreamsRNPlayerView: setNewAccessToken called with token: \(newToken)")
    }

    deinit {
        playerStatusObserver?.invalidate()
    }
}