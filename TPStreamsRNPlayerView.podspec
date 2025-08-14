require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "TPStreamsRNPlayerView"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/testpress/react-native-tpstreams.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.private_header_files = "ios/**/*.h"
  
  s.swift_version = '5.0'
  
  # Set up the bridging header
  s.pod_target_xcconfig = {
    'SWIFT_OBJC_BRIDGING_HEADER' => '$(PODS_TARGET_SRCROOT)/ios/TPStreamsRNPlayerView-Bridging-Header.h',
    'CLANG_ENABLE_MODULES' => 'YES'
  }
  
  # Ensure the module is not built as a framework to avoid bridging header conflicts
  s.static_framework = true
  
  # Add dependency on TPStreamsSDK
  s.dependency 'TPStreamsSDK'

 install_modules_dependencies(s)
end
