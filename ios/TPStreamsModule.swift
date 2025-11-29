import Foundation
import React
import TPStreamsSDK

@objc(TPStreams)
class TPStreamsModule: NSObject {

   private var isInitialized = false

   @objc func initialize(_ organizationId: NSString) {
     if !isInitialized {
       DispatchQueue.main.async {
        TPStreamsSDK.initialize(withOrgCode: organizationId as String)
        self.isInitialized = true
        self.initializeDownloadModule()
       }
     }
   }

   private func initializeDownloadModule() {
     _ = TPStreamsDownloadModule.shared
     ensureDownloadModuleInitialized()
   }
   
   private func ensureDownloadModuleInitialized() {
        guard let bridge = RCTBridge.current() else {
            return
        }

        if let module = bridge.module(for: TPStreamsDownloadModule.self) as? TPStreamsDownloadModule {
            module.initializeModule()
        }
    }

   @objc
   static func requiresMainQueueSetup() -> Bool {
     return true
   }
}