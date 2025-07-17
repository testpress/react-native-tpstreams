import Foundation
import React
import TPStreamsSDK

@objc(TPStreams)
class TPStreamsModule: NSObject {

   private var isInitialized = false

   @objc func initialize(_ organizationId: NSString) {
     if !isInitialized {
       TPStreamsSDK.initialize(withOrgCode: organizationId as String)
       isInitialized = true
     }
   }

   @objc
   static func requiresMainQueueSetup() -> Bool {
     return false
   }
}
