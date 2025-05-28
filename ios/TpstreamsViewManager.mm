#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface TpstreamsViewManager : RCTViewManager
@end

@implementation TpstreamsViewManager

RCT_EXPORT_MODULE(TpstreamsView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(color, NSString)

@end
