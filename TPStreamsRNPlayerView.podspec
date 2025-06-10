require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "TPStreamsRNPlayerView"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]
  s.swift_version = '5.0'

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/testpress/react-native-tpstreams.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.private_header_files = "ios/**/*.h"
  s.pod_target_xcconfig = {
      'DEFINES_MODULE' => 'YES',
      'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES'
    }
  s.dependency "TPStreamsSDK"

  # Ensure the module is not built as a framework to avoid bridging header conflicts
  s.static_framework = true

 install_modules_dependencies(s)
end
