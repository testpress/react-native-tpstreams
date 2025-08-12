import Foundation
import React
import TPStreamsSDK

@objc(TPStreamsDownloads)
class TPStreamsDownloadsModule: NSObject, RCTEventEmitterProtocol {
    
    private var hasListeners = false
    private var downloadClient: TPDownloadClient {
        return TPDownloadClient.shared
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    override func supportedEvents() -> [String] {
        return [
            "onDownloadProgressChanged",
            "onDownloadStateChanged",
            "onDownloadCompleted",
            "onDownloadError"
        ]
    }
    
    @objc
    override func startObserving() {
        hasListeners = true
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDownloadProgress(_:)),
            name: .TPDownloadProgressChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDownloadStateChanged(_:)),
            name: .TPDownloadStateChanged,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleDownloadError(_:)),
            name: .TPDownloadError,
            object: nil
        )
    }
    
    @objc
    override func stopObserving() {
        hasListeners = false
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc
    func getAll(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            let downloads = downloadClient.getAllDownloads()
            let result = downloads.map { convertDownloadItemToDict($0) }
            resolve(result)
        } catch {
            reject("DOWNLOAD_ITEMS_ERROR", "Failed to get downloads: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func get(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if let download = downloadClient.getDownload(videoId: videoId) {
                resolve(convertDownloadItemToDict(download))
            } else {
                resolve(nil)
            }
        } catch {
            reject("DOWNLOAD_ITEM_ERROR", "Failed to get download: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func pause(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            try downloadClient.pauseDownload(videoId: videoId)
            resolve(nil)
        } catch {
            reject("DOWNLOAD_PAUSE_ERROR", "Failed to pause download: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func resume(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            try downloadClient.resumeDownload(videoId: videoId)
            resolve(nil)
        } catch {
            reject("DOWNLOAD_RESUME_ERROR", "Failed to resume download: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func remove(_ videoId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            try downloadClient.removeDownload(videoId: videoId)
            resolve(nil)
        } catch {
            reject("DOWNLOAD_REMOVE_ERROR", "Failed to remove download: \(error.localizedDescription)", error)
        }
    }
    
    @objc
    func addListener(_ eventName: String) {
        // Required for RCTEventEmitter
    }
    
    @objc
    func removeListeners(_ count: NSNumber) {
        // Required for RCTEventEmitter
    }
    
    // MARK: - Notification Handlers
    
    @objc
    private func handleDownloadProgress(_ notification: Notification) {
        guard hasListeners else { return }
        
        if let downloads = notification.object as? [TPDownloadItem] {
            let downloadMaps = downloads.map { convertDownloadItemToDict($0) }
            sendEvent(withName: "onDownloadProgressChanged", body: downloadMaps)
        }
    }
    
    @objc
    private func handleDownloadStateChanged(_ notification: Notification) {
        guard hasListeners else { return }
        
        if let download = notification.object as? TPDownloadItem {
            let downloadMap = convertDownloadItemToDict(download)
            sendEvent(withName: "onDownloadStateChanged", body: downloadMap)
            
            // Also emit completed event if download is complete
            if download.state == .completed {
                sendEvent(withName: "onDownloadCompleted", body: downloadMap)
            }
        }
    }
    
    @objc
    private func handleDownloadError(_ notification: Notification) {
        guard hasListeners else { return }
        
        if let userInfo = notification.userInfo,
           let videoId = userInfo["videoId"] as? String,
           let error = userInfo["error"] as? Error,
           let errorCode = userInfo["errorCode"] as? Int {
            
            let errorMap: [String: Any] = [
                "videoId": videoId,
                "message": error.localizedDescription,
                "code": errorCode
            ]
            
            sendEvent(withName: "onDownloadError", body: errorMap)
        }
    }
    
    // MARK: - Helper Methods
    
    private func convertDownloadItemToDict(_ item: TPDownloadItem) -> [String: Any] {
        var dict: [String: Any] = [
            "videoId": item.videoId,
            "title": item.title,
            "totalBytes": item.totalBytes,
            "downloadedBytes": item.downloadedBytes,
            "progressPercentage": item.progressPercentage,
            "state": item.state.rawValue
        ]
        
        if let thumbnailUrl = item.thumbnailUrl {
            dict["thumbnailUrl"] = thumbnailUrl
        }
        
        return dict
    }
}

// Protocol to avoid direct dependency on RCTEventEmitter
@objc protocol RCTEventEmitterProtocol {
    func supportedEvents() -> [String]
    func startObserving()
    func stopObserving()
    func sendEvent(withName name: String, body: Any?)
}
