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
}
