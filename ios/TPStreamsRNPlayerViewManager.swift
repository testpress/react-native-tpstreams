import Foundation
import React
import CoreMedia
import AVFoundation

@objc(TPStreamsRNPlayerViewManager)
class TPStreamsRNPlayerViewManager: RCTViewManager {
    override func view() -> UIView! {
        return TPStreamsRNPlayerView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // Expose props to React Native
    @objc func propConfig(
        _ name: String,
        config: RCTBridge,
        defaultView: UIView,
        defaultProps: NSDictionary,
        didSetProps: @escaping ([NSString]) -> Void
    ) -> [NSString] {
        return [
            "videoId" as NSString,
            "accessToken" as NSString,
            "shouldAutoPlay" as NSString,
            "startAt" as NSString,
            "enableDownload" as NSString,
            "offlineLicenseExpireTime" as NSString,
            "showDefaultCaptions" as NSString,
            "downloadMetadata" as NSString
        ]
    }
    
    // MARK: - Player Commands - Simply delegate to the view
    
    @objc func seekTo(_ node: NSNumber, position: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.seekTo(position: position.doubleValue)
        }
    }
    
    @objc func play(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.play()
        }
    }
    
    @objc func pause(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.pause()
        }
    }
    
    @objc func setPlaybackSpeed(_ node: NSNumber, speed: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.setPlaybackSpeed(speed.floatValue)
        }
    }
    
    // MARK: - Methods that trigger events - Simply delegate to the view
    
    @objc func getCurrentPosition(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
      
            component?.getCurrentPosition()
        }
    }
    
    @objc func getDuration(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.getDuration()
        }
    }
    
    @objc func isPlaying(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.isPlaying()
        }
    }
    
    @objc func getPlaybackSpeed(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.getPlaybackSpeed()
        }
    }

    @objc func setNewAccessToken(_ node: NSNumber, newToken: NSString) {
        DispatchQueue.main.async {
            let component = self.bridge.uiManager.view(
                forReactTag: node
            ) as? TPStreamsRNPlayerView
            
            component?.setNewAccessToken(newToken as String)
        }
    }
}