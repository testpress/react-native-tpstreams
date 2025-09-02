import Foundation
import React
import TPStreamsSDK

private enum PlayerConstants {
    static let statusNotDownloaded = "NotDownloaded"
    static let statusDownloading = "Downloading"
    static let statusPaused = "Paused"
    static let statusCompleted = "Completed"
    static let statusFailed = "Failed"
    static let statusUnknown = "Unknown"
}

protocol TokenRequestDelegate: AnyObject {
    func requestToken(for assetId: String, completion: @escaping (String?) -> Void)
}

@objc(TPStreamsDownload)
class TPStreamsDownloadModule: RCTEventEmitter, TPStreamsDownloadDelegate {
    
    private let downloadManager = TPStreamsDownloadManager.shared
    private var isListening = false
    private var tokenDelegate: TokenRequestDelegate?
    static var shared: TPStreamsDownloadModule?
    
    override init() {
        super.init()
        downloadManager.setTPStreamsDownloadDelegate(tpStreamsDownloadDelegate: self)
        TPStreamsDownloadModule.shared = self
    }

    func setAccessTokenDelegate(_ delegate: TokenRequestDelegate) {
        self.tokenDelegate = delegate
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func addDownloadProgressListener(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        isListening = true
        resolve(nil)
    }
    
    @objc
    func removeDownloadProgressListener(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        isListening = false
        resolve(nil)
    }
    
    func onProgressChange(assetId: String, percentage: Double) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onStateChange(status: Status, offlineAsset: OfflineAsset) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onDelete(assetId: String) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onStart(offlineAsset: OfflineAsset) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onComplete(offlineAsset: OfflineAsset) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onPause(offlineAsset: OfflineAsset) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onResume(offlineAsset: OfflineAsset) {
        if isListening {
            notifyDownloadsChange()
        }
    }
    
    func onCanceled(assetId: String) {
        if isListening {
            notifyDownloadsChange()
        }
    }

    func onRequestNewAccessToken(assetId: String, completion: @escaping (String?) -> Void) {
         if let delegate = tokenDelegate {
            delegate.requestToken(for: assetId, completion: completion)
        } else {
            completion(nil)
        }
    }
    
    private func notifyDownloadsChange() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let downloadAssets = self.getAllDownloadItems()
            self.sendEvent(withName: "onDownloadProgressChanged", body: downloadAssets)
        }
    }
    
    private func getAllDownloadItems() -> [[String: Any]] {
        let offlineAssets = downloadManager.getAllOfflineAssets()
        return offlineAssets.map { mapOfflineAssetToDict($0) }
    }
    
    private func mapOfflineAssetToDict(_ asset: OfflineAsset) -> [String: Any] {
        var item: [String: Any] = [:]
        item["videoId"] = asset.assetId
        item["title"] = asset.title
        item["thumbnailUrl"] = asset.thumbnailURL
        item["totalBytes"] = asset.size
        item["downloadedBytes"] = calculateDownloadedBytes(size: asset.size, progress: asset.percentageCompleted)
        item["progressPercentage"] = asset.percentageCompleted
        item["state"] = mapDownloadStatus(Status(rawValue: asset.status))
        item["metadata"] = asset.metadata ?? "{}"
        
        return item
    }

    private func calculateDownloadedBytes(size: Any?, progress: Any?) -> Int64 {
        guard let totalBytes = size as? Double,
            let progressPercentage = progress as? Double else {
            return 0
        }
        return Int64((progressPercentage / 100.0) * totalBytes)
    }
    
    @objc
    func pauseDownload(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            self.downloadManager.pauseDownload(videoId)
            resolve(nil)
        }
    }
    
    @objc
    func resumeDownload(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            self.downloadManager.resumeDownload(videoId)
            resolve(nil)
        }
    }
    
    @objc
    func removeDownload(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            if self.downloadManager.isAssetDownloaded(assetID: videoId) {
                self.downloadManager.deleteDownload(videoId)
            } else {
                self.downloadManager.cancelDownload(videoId)
            }
            resolve(nil)
        }
    }
    
    @objc
    func isDownloaded(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            resolve(self?.downloadManager.isAssetDownloaded(assetID: videoId) ?? false)
        }
    }
    
    @objc
    func isDownloading(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            let offlineAssets = self.downloadManager.getAllOfflineAssets()
            let isDownloading = offlineAssets.contains { asset in
                asset.assetId == videoId && Status(rawValue: asset.status) == .inProgress
            }
            resolve(isDownloading)
        }
    }
    
    @objc
    func isPaused(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            let offlineAssets = self.downloadManager.getAllOfflineAssets()
            let isPaused = offlineAssets.contains { asset in
                asset.assetId == videoId && Status(rawValue: asset.status) == .paused
            }
            resolve(isPaused)
        }
    }
    
    @objc
    func getDownloadStatus(_ videoId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            let offlineAssets = self.downloadManager.getAllOfflineAssets()
            
            if let asset = offlineAssets.first(where: { $0.assetId == videoId }) {
                resolve(mapDownloadStatus(Status(rawValue: asset.status)))
            } else {
                resolve(PlayerConstants.statusNotDownloaded)
            }
        }
    }
    
    @objc
    func getAllDownloads(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            let downloadItems = self.getAllDownloadItems()
            resolve(downloadItems)
        }
    }

    private func mapDownloadStatus(_ status: Status?) -> String {
        guard let status = status else { return PlayerConstants.statusUnknown }
        
        switch status {
        case .inProgress:
            return PlayerConstants.statusDownloading
        case .paused:
            return PlayerConstants.statusPaused
        case .finished:
            return PlayerConstants.statusCompleted
        case .failed:
            return PlayerConstants.statusFailed
        default:
            return PlayerConstants.statusNotDownloaded
        }
    }

    @objc
    override func supportedEvents() -> [String] {
        return ["onDownloadProgressChanged"]
    }
    
    @objc
    override func addListener(_ eventName: String) {
        super.addListener(eventName)
    }
    
    @objc
    override func removeListeners(_ count: Double) {
        super.removeListeners(count)
        
        if count >= 1 && isListening {
            isListening = false
        }
    }
}
