import Foundation
import React
import TPStreamsSDK

@objc(TPStreams)
class TPStreams: NSObject {

  private var isInitialized = false

  @objc func initialize(_ orgCode: NSString) {
    if !isInitialized {
      TPStreamsSDK.initialize(withOrgCode: orgCode as String)
      isInitialized = true
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
