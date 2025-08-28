import UIKit
import TPStreamsSDK
import CoreMedia
import React
import AVFoundation

@objc(TPStreamsRNPlayerView)
class TPStreamsRNPlayerView: UIView {

    private var player: TPAVPlayer?
    private var playerViewController: TPStreamPlayerViewController?
    private var playerStatusObserver: NSKeyValueObservation?
    private var setupScheduled = false
    
    @objc var videoId: NSString = ""
    @objc var accessToken: NSString = ""
    @objc var shouldAutoPlay: Bool = true
    @objc var startAt: Double = 0
    @objc var enableDownload: Bool = false
    @objc var offlineLicenseExpireTime: Double = 0
    @objc var showDefaultCaptions: Bool = false
    @objc var downloadMetadata: NSString?
    
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
    
    override func didSetProps(_ changedProps: [String]!) {
        super.didSetProps(changedProps)
        schedulePlayerSetup()
    }

    private func schedulePlayerSetup() {
        guard !setupScheduled else { return }
        
        setupScheduled = true
        DispatchQueue.main.async { [weak self] in
            self?.setupPlayer()
        }
    }
    
    private func setupPlayer() {
        cleanupPlayer()
        
        player = TPStreamsDownloadManager.shared.isAssetDownloaded(assetID: videoId as String)
            ? createOfflinePlayer()
            : createOnlinePlayer()
        
        guard player != nil else {
            print("Failed to create player - invalid videoId or accessToken")
            setupScheduled = false
            return
        }

        configurePlayerView()
        observePlayerChanges()
        setupScheduled = false
    }
    
    private func cleanupPlayer() {
        removeObservers()
        playerViewController?.view.removeFromSuperview()
        playerViewController?.removeFromParent()
        playerViewController = nil
        player = nil
    }
    
    private func removeObservers() {
        playerStatusObserver?.invalidate()
    }
    
    private func createOfflinePlayer() -> TPAVPlayer? {
        guard videoId.length > 0 else { return nil }
        return TPAVPlayer(offlineAssetId: videoId as String) { [weak self] error in
            self?.handlePlayerError(error, context: "Offline setup")
        }
    }
    
    private func createOnlinePlayer() -> TPAVPlayer? {
        guard videoId.length > 0, accessToken.length > 0 else { return nil }
        return TPAVPlayer(assetID: videoId as String, accessToken: accessToken as String) { [weak self] error in
            self?.handlePlayerError(error, context: "Online setup")
        }
    }
    
    private func handlePlayerError(_ error: Error?, context: String) {
        guard let error = error else { return }
        let nsError = error as NSError
        print("\(context) error: \(error.localizedDescription)")
        onError?([
            "message": "Player initialization failed",
            "code": nsError.code,
            "details": error.localizedDescription
        ])
    }
    
    private func configurePlayerView() {
        guard let player = player else { return }
        
        let configBuilder = createPlayerConfigBuilder()
        let playerVC = TPStreamPlayerViewController()
        playerVC.player = player
        playerVC.config = configBuilder.build()
        
        attachPlayerViewController(playerVC)
        
        if shouldAutoPlay { player.play() }
        playerViewController = playerVC
    }
    
    private func createPlayerConfigBuilder() -> TPStreamPlayerConfigurationBuilder {
        let metadataDict = parseMetadataJSON(from: downloadMetadata)
        let configBuilder = TPStreamPlayerConfigurationBuilder()
            .setPreferredForwardDuration(15)
            .setPreferredRewindDuration(5)
            .setprogressBarThumbColor(.systemBlue)
            .setwatchedProgressTrackColor(.systemBlue)
            .setDownloadMetadata(metadataDict)
        
        if enableDownload {
            configBuilder.showDownloadOption()
        }
        
        return configBuilder
    }
    
    private func attachPlayerViewController(_ playerVC: TPStreamPlayerViewController) {
        guard let parentVC = reactViewController() else { return }
        
        parentVC.addChild(playerVC)
        addSubview(playerVC.view)
        playerVC.view.frame = bounds
        playerVC.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        playerVC.view.isHidden = false
        bringSubviewToFront(playerVC.view)
        playerVC.didMove(toParent: parentVC)
    }
        
    private func observePlayerChanges() {
        setupSeekObserver()
    }
    
    private func setupSeekObserver() {
        guard let player = player, startAt > 0 else { return }
        
        playerStatusObserver = player.observe(\.status, options: [.new]) { [weak self] player, _ in
            guard let self = self, player.status == .readyToPlay else { return }
            self.seekTo(position: self.startAt * 1000.0)
            self.playerStatusObserver?.invalidate()
            self.playerStatusObserver = nil
        }
    }

    private func parseMetadataJSON(from jsonString: NSString?) -> [String: String]? {
        guard let metadataString = jsonString as String? else { return nil }
        
        print("Metadata string: \(metadataString)")
        guard let data = metadataString.data(using: .utf8) else { return nil }
        do {
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: String] {
                return json
            }
        } catch {
            print("Error parsing metadata JSON: \(error)")
        }
        return nil
    }
    
    @objc func seekTo(position: Double) {
        guard position >= 0, let player = player else { return }
        
        let seekTime = CMTime(value: CMTimeValue(position), timescale: 1000)
        player.seek(to: seekTime, toleranceBefore: .zero, toleranceAfter: .zero)
    }
    
    @objc func play() { player?.play() }

    @objc func pause() { player?.pause() }
    
    @objc func setPlaybackSpeed(_ speed: Float) {
        player?.rate = speed
    }
    
    @objc func getCurrentPosition() {
        guard let player = player else {
            onCurrentPosition?(["position": 0])
            return
        }
        let positionMs = CMTimeGetSeconds(player.currentTime()) * 1000
        onCurrentPosition?(["position": positionMs])
    }
    
    @objc func getDuration() {
        guard let duration = player?.currentItem?.duration else {
            onDuration?(["duration": 0])
            return
        }
        let durationMs = CMTimeGetSeconds(duration) * 1000
        onDuration?(["duration": durationMs])
    }
    
    @objc func isPlaying() {
        let isPlaying = player?.timeControlStatus == .playing
        onIsPlaying?(["isPlaying": isPlaying])
    }
    
    @objc func getPlaybackSpeed() {
        onPlaybackSpeed?(["speed": player?.rate ?? 1.0])
    }

    @objc func setNewAccessToken(_ newToken: String) {
        print("New access token set: \(newToken)")
        // TODO: Reinitialize player with new token if needed
    }
    
    deinit {
        removeObservers()
    }
}