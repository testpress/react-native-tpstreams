#import "TPStreamsRNPlayerView.h"

#import <react/renderer/components/TPStreamsPlayerViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/TPStreamsPlayerViewSpec/EventEmitters.h>
#import <react/renderer/components/TPStreamsPlayerViewSpec/Props.h>
#import <react/renderer/components/TPStreamsPlayerViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface TPStreamsRNPlayerView () <RCTTPStreamsRNPlayerViewViewProtocol>
@end

@implementation TPStreamsRNPlayerView {
    UIView * _view;
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

    _view = [[UIView alloc] init];
    self.contentView = _view;
  }

  return self;
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
