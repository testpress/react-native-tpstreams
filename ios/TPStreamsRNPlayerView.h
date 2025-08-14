#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

#ifndef TPStreamsRNPlayerViewNativeComponent_h
#define TPStreamsRNPlayerViewNativeComponent_h

NS_ASSUME_NONNULL_BEGIN

@class TPStreamPlayerHostingView;

@interface TPStreamsRNPlayerView : RCTViewComponentView

@property (nonatomic, strong) TPStreamPlayerHostingView *playerHostingView;

- (void)play;
- (void)pause;
- (void)seekTo:(double)position;
- (void)setPlaybackSpeed:(float)speed;
- (void)getCurrentPosition:(RCTResponseSenderBlock)callback;
- (void)getDuration:(RCTResponseSenderBlock)callback;
- (void)isPlaying:(RCTResponseSenderBlock)callback;
- (void)getPlaybackSpeed:(RCTResponseSenderBlock)callback;
- (void)setNewAccessToken:(NSString *)newToken;

@end

NS_ASSUME_NONNULL_END

#endif /* TPStreamsRNPlayerViewNativeComponent_h */
