import UIKit
import TPStreamsSDK

@objc(TPStreamsRNPlayerView)
class TPStreamsRNPlayerView: UIView {

    private var player: TPAVPlayer?
    private var playerViewController: TPStreamPlayerViewController?

    private var _videoId: NSString = ""
    private var _accessToken: NSString = ""
    private var setupScheduled = false

    @objc var videoId: NSString {
        get { _videoId }
        set {
            _videoId = newValue
            schedulePlayerSetup()
        }
    }

    @objc var accessToken: NSString {
        get { _accessToken }
        set {
            _accessToken = newValue
            schedulePlayerSetup()
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .black
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .black
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        playerViewController?.view.frame = bounds
    }

    private func schedulePlayerSetup() {
        guard videoId.length > 0, accessToken.length > 0 else { return }

        if setupScheduled { return }
        setupScheduled = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.setupPlayer()
        }
    }

    private func setupPlayer() {
        // Remove previous playerViewController if any
        playerViewController?.view.removeFromSuperview()
        playerViewController?.removeFromParent()
        playerViewController = nil
        player = nil

        player = TPAVPlayer(assetID: videoId as String, accessToken: accessToken as String) { error in
            if let error = error {
                print("Online setup error: \(error.localizedDescription)")
            }
        }

        let config = TPStreamPlayerConfigurationBuilder()
            .setPreferredForwardDuration(15)
            .setPreferredRewindDuration(5)
            .setprogressBarThumbColor(.systemBlue)
            .setwatchedProgressTrackColor(.systemBlue)
            .showDownloadOption()
            .build()

        let vc = TPStreamPlayerViewController()
        vc.player = player
        vc.config = config

        if let parentVC = self.reactViewController() {
            parentVC.addChild(vc)
            addSubview(vc.view)
            vc.view.frame = bounds
            vc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            vc.view.isHidden = false
            bringSubviewToFront(vc.view)
            vc.didMove(toParent: parentVC)
        }

        player?.play()
        playerViewController = vc
    }
}
