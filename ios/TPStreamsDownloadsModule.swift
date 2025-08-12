import Foundation
import React

@objc(TPStreamsDownloads)
class TPStreamsDownloadsModule: NSObject, RCTEventEmitterProtocol {
    
    private var hasListeners = false
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func supportedEvents() -> [String] {
        return [
            "onDownloadProgressChanged"
        ]
    }
    
    @objc
    func startObserving() {
        hasListeners = true
        // TODO: Add observer for download progress changes
    }
    
    @objc
    func stopObserving() {
        hasListeners = false
        // TODO: Remove observer
    }

    @objc
    func sendEvent(withName name: String, body: Any?) {
        // This method is required by RCTEventEmitterProtocol
        // It should send events to React Native when hasListeners is true
        if hasListeners {
            // TODO: Implement actual event sending logic
            // For now, this satisfies the protocol requirement
        }
    }
    
    // MARK: - Native Methods (TODO: Implement with TPDownloadClient)
    
    @objc
    func getAll(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // TODO: Get all downloads from TPDownloadClient.shared.getAllDownloads()
        resolve([])
    }
    
    @objc
    func get(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // TODO: Get download by videoId from TPDownloadClient.shared.getDownload(videoId:)
        resolve(nil)
    }
    
    @objc
    func pause(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // TODO: Pause download using TPDownloadClient.shared.pauseDownload(videoId:)
        resolve(nil)
    }
    
    @objc
    func resume(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // TODO: Resume download using TPDownloadClient.shared.resumeDownload(videoId:)
        resolve(nil)
    }
    
    @objc
    func remove(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // TODO: Remove download using TPDownloadClient.shared.removeDownload(videoId:)
        resolve(nil)
    }
    
    @objc
    func addListener(_ eventName: String) {
        // Required for RCTEventEmitter
    }
    
    @objc
    func removeListeners(_ count: NSNumber) {
        // Required for RCTEventEmitter
    }
}

// Protocol to avoid direct dependency on RCTEventEmitter
@objc protocol RCTEventEmitterProtocol {
    func supportedEvents() -> [String]
    func startObserving()
    func stopObserving()
    func sendEvent(withName name: String, body: Any?)
}
