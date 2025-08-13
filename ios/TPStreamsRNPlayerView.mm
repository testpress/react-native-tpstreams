#import "TPStreamsRNPlayerView.h"

#import <react/renderer/components/TPStreamsSpec/ComponentDescriptors.h>
#import <react/renderer/components/TPStreamsSpec/EventEmitters.h>
#import <react/renderer/components/TPStreamsSpec/Props.h>
#import <react/renderer/components/TPStreamsSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "TPStreams-Swift.h"

using namespace facebook::react;

@interface TPStreamsRNPlayerView () <RCTTPStreamsRNPlayerViewViewProtocol>
@end

@implementation TPStreamsRNPlayerView {
    TPStreamsPlayerHostingView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<TPStreamsRNPlayerViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const TPStreamsRNPlayerViewProps>();
    _props = defaultProps;

    _view = [[TPStreamsPlayerHostingView alloc] initWithFrame:frame];
    self.contentView = _view;
  }

  return self;
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _view.frame = self.bounds;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<TPStreamsRNPlayerViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<TPStreamsRNPlayerViewProps const>(props);
    
    // Process props update here when needed
    
    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> TPStreamsRNPlayerViewCls(void)
{
    return TPStreamsRNPlayerView.class;
}

@end
