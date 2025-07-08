import Foundation
import React

@objc(TPStreams)
class TPStreamsModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func initialize(_ organizationId: String) {
        // Basic initialization - will be implemented in future commits
        print("TPStreams initialized with organization ID: \(organizationId)")
    }
} 