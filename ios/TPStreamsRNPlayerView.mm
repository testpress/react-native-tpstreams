#import "TPStreamsRNPlayerView.h"
#import <TPStreamsRNPlayerView-Swift.h>

#import <react/renderer/components/TPStreamsSpec/ComponentDescriptors.h>
#import <react/renderer/components/TPStreamsSpec/EventEmitters.h>
#import <react/renderer/components/TPStreamsSpec/Props.h>
#import <react/renderer/components/TPStreamsSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TPStreamsRNPlayerView () <RCTTPStreamsRNPlayerViewViewProtocol>
@end

@implementation TPStreamsRNPlayerView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<TPStreamsRNPlayerViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TPStreamsRNPlayerViewProps>();
    _props = defaultProps;

    _playerHostingView = [[TPStreamPlayerHostingView alloc] initWithFrame:CGRectZero];
    self.contentView = _playerHostingView;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<TPStreamsRNPlayerViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<TPStreamsRNPlayerViewProps const>(props);
    
    // Update video properties
    if (oldViewProps.videoId != newViewProps.videoId) {
        NSString *videoId = [NSString stringWithUTF8String:newViewProps.videoId.c_str()];
        self.playerHostingView.videoId = videoId;
    }
    
    if (oldViewProps.accessToken != newViewProps.accessToken) {
        NSString *accessToken = [NSString stringWithUTF8String:newViewProps.accessToken.c_str()];
        self.playerHostingView.accessToken = accessToken;
    }
    
    if (oldViewProps.shouldAutoPlay != newViewProps.shouldAutoPlay) {
        self.playerHostingView.shouldAutoPlay = newViewProps.shouldAutoPlay;
    }
    
    if (oldViewProps.startAt != newViewProps.startAt) {
        self.playerHostingView.startAt = newViewProps.startAt;
    }
    
    if (oldViewProps.enableDownload != newViewProps.enableDownload) {
        self.playerHostingView.enableDownload = newViewProps.enableDownload;
    }
    
    if (oldViewProps.offlineLicenseExpireTime != newViewProps.offlineLicenseExpireTime) {
        self.playerHostingView.offlineLicenseExpireTime = newViewProps.offlineLicenseExpireTime;
    }
    
    if (oldViewProps.showDefaultCaptions != newViewProps.showDefaultCaptions) {
        self.playerHostingView.showDefaultCaptions = newViewProps.showDefaultCaptions;
    }
    
    if (oldViewProps.downloadMetadata != newViewProps.downloadMetadata) {
        NSString *metadata = [NSString stringWithUTF8String:newViewProps.downloadMetadata.c_str()];
        self.playerHostingView.downloadMetadata = metadata;
    }
    
    // Set event callbacks
    if (newViewProps.onCurrentPosition) {
        self.playerHostingView.onCurrentPosition = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onCurrentPosition(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onDuration) {
        self.playerHostingView.onDuration = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onDuration(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onIsPlaying) {
        self.playerHostingView.onIsPlaying = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onIsPlaying(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onPlaybackSpeed) {
        self.playerHostingView.onPlaybackSpeed = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onPlaybackSpeed(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onPlayerStateChanged) {
        self.playerHostingView.onPlayerStateChanged = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onPlayerStateChanged(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onIsPlayingChanged) {
        self.playerHostingView.onIsPlayingChanged = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onIsPlayingChanged(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onPlaybackSpeedChanged) {
        self.playerHostingView.onPlaybackSpeedChanged = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onPlaybackSpeedChanged(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onIsLoadingChanged) {
        self.playerHostingView.onIsLoadingChanged = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onIsLoadingChanged(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onError) {
        self.playerHostingView.onError = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onError(RawEvent(event));
            }
        };
    }
    
    if (newViewProps.onAccessTokenExpired) {
        self.playerHostingView.onAccessTokenExpired = ^(NSDictionary *event) {
            if (self->_eventEmitter) {
                std::dynamic_pointer_cast<const TPStreamsRNPlayerViewEventEmitter>(self->_eventEmitter)->onAccessTokenExpired(RawEvent(event));
            }
        };
    }
    
    [super updateProps:props oldProps:oldProps];
}

#pragma mark - Player Control Methods

- (void)play
{
    [self.playerHostingView play];
}

- (void)pause
{
    [self.playerHostingView pause];
}

- (void)seekTo:(double)position
{
    [self.playerHostingView seekTo:position];
}

- (void)setPlaybackSpeed:(float)speed
{
    [self.playerHostingView setPlaybackSpeed:speed];
}

- (void)getCurrentPosition:(RCTResponseSenderBlock)callback
{
    [self.playerHostingView getCurrentPosition:callback];
}

- (void)getDuration:(RCTResponseSenderBlock)callback
{
    [self.playerHostingView getDuration:callback];
}

- (void)isPlaying:(RCTResponseSenderBlock)callback
{
    [self.playerHostingView isPlaying:callback];
}

- (void)getPlaybackSpeed:(RCTResponseSenderBlock)callback
{
    [self.playerHostingView getPlaybackSpeed:callback];
}

- (void)setNewAccessToken:(NSString *)newToken
{
    [self.playerHostingView setNewAccessToken:newToken];
}

Class<RCTComponentViewProtocol> TPStreamsRNPlayerViewCls(void)
{
    return TPStreamsRNPlayerView.class;
}

@end
