import UIKit
import TPStreamsSDK

@objc(TPStreamsRNPlayerView)
class TPStreamsRNPlayerView: UIView {

    private var player: TPAVPlayer?
    private var playerViewController: TPStreamPlayerViewController?

    private var _videoId: NSString = ""
    private var _accessToken: NSString = ""

@objc var videoId: NSString {
  get { _videoId }
  set {
    print(newValue)
    _videoId = newValue ?? ""
    checkAndSetupPlayer()
  }
}

@objc var accessToken: NSString {
  get { _accessToken }
  set {
    print(newValue)
    _accessToken = newValue ?? ""
    checkAndSetupPlayer()
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

    private func checkAndSetupPlayer() {
        if videoId.length > 0 && accessToken.length > 0 {
            setupPlayer()
        }
    }

private func setupPlayer() {
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
                self.addSubview(vc.view)
                vc.view.frame = self.bounds
                vc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                vc.didMove(toParent: parentVC)
            }
            self.player?.play()


        self.playerViewController = vc
    }
}
