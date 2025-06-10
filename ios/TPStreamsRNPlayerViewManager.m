#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(TPStreamsRNPlayerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(videoId, NSString)
RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)

@end
