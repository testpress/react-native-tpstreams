import Foundation
import React
import TPStreamsSDK

@objc(TPStreams)
class TPStreamsModule: NSObject {

   private var isInitialized = false

   @objc func initialize(_ organizationId: NSString) {
     if !isInitialized {
       print("Initializing TPStreamsSDK with org code: \(organizationId)")
       DispatchQueue.main.async {
        TPStreamsSDK.initialize(withOrgCode: organizationId as String)
        self.isInitialized = true
       }
     }
   }

   @objc
   static func requiresMainQueueSetup() -> Bool {
     return true
   }
}