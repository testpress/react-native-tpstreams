#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TPStreamsRNPlayerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(videoId, NSString)
RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(shouldAutoPlay, BOOL)
RCT_EXPORT_VIEW_PROPERTY(startAt, double)
RCT_EXPORT_VIEW_PROPERTY(enableDownload, BOOL)
RCT_EXPORT_VIEW_PROPERTY(offlineLicenseExpireTime, double)
RCT_EXPORT_VIEW_PROPERTY(showDefaultCaptions, BOOL)
RCT_EXPORT_VIEW_PROPERTY(downloadMetadata, NSString)

// Event props
RCT_EXPORT_VIEW_PROPERTY(onCurrentPosition, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onDuration, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onIsPlaying, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlaybackSpeed, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onPlayerStateChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onIsPlayingChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlaybackSpeedChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onIsLoadingChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAccessTokenExpired, RCTDirectEventBlock)

// Player commands
RCT_EXTERN_METHOD(play:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(pause:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(seekTo:(nonnull NSNumber *)node position:(nonnull NSNumber *)position)
RCT_EXTERN_METHOD(setPlaybackSpeed:(nonnull NSNumber *)node speed:(nonnull NSNumber *)speed)
RCT_EXTERN_METHOD(getCurrentPosition:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(getDuration:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(isPlaying:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(getPlaybackSpeed:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(setNewAccessToken:(nonnull NSNumber *)node newToken:(nonnull NSString *)newToken)

@end