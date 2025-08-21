import Foundation
import React

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
}