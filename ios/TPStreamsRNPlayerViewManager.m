#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(TPStreamsRNPlayerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(videoId, NSString)
RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(shouldAutoPlay, BOOL)
RCT_EXPORT_VIEW_PROPERTY(startAt, double)
RCT_EXPORT_VIEW_PROPERTY(enableDownload, BOOL)
RCT_EXPORT_VIEW_PROPERTY(offlineLicenseExpireTime, double)
RCT_EXPORT_VIEW_PROPERTY(showDefaultCaptions, BOOL)
RCT_EXPORT_VIEW_PROPERTY(downloadMetadata, NSString)

@end