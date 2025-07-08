#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"
#import "TPStreamsRNPlayerView.h"

@interface TPStreamsRNPlayerViewManager : RCTViewManager
@end

@implementation TPStreamsRNPlayerViewManager

RCT_EXPORT_MODULE(TPStreamsRNPlayerView)

- (UIView *)view
{
  return [TPStreamsRNPlayerView new];
}

@end
