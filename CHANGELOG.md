# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.14] - 2026-04-24
### Added
- Add clock drift diagnostics to error reports in SDK (via TPStreams Android Player **1.1.13-beta.2**)

## [1.1.13] - 2026-03-10
### Fixed
- Replace `currentActivity` usage to ensure compatibility with React Native (#52)

## [1.1.12] - 2026-03-10
### Changed
- Update TPStreams Android Player to **1.1.10** to include audio recording protection for DRM-protected videos (#85)

## [1.1.11] - 2026-03-05
### Changed
- Internal release for dependency synchronization

## [1.1.10] - 2026-03-09
### Added
- Expose granular download lifecycle events (via TPStreams Android SDK **1.1.9**) (#51)
- Expose public `startDownload` API in `DownloadClient` (via TPStreams Android SDK **1.1.9**) (#50, #82)
- Add support for event-driven download notifications (#83)

## [1.1.9] - 2026-01-31
### Fixed
- Add consumer ProGuard rules to fix release build crash (#49)

## [1.1.8] - 2026-01-27
### Changed
- Update TPStreams Android Player to **1.1.7** to include automatic retry mechanism for network failures (#79)

## [1.1.7] - 2026-01-13
### Fixed
- Prevent ExoPlayer surface timeout during view lifecycle changes (#48)
- Fix bottom sheet scrolling to prevent content cut-off (via TPStreams Android SDK **1.1.6**) (#78)
### Changed
- Update TPStreams Android Player to **1.1.6** to include modernized bottom sheet styling (#75)

## [1.1.6] - 2026-01-08
### Changed
- Update TPStreams Android Player to **1.1.5** to include:
  - Playlist navigation fixes (#74)
  - Loading UI improvements (#73)

## [1.1.5] - 2025-12-31
### Fixed
- Fix initial video stretching by forcing measurement updates (#47)

## [1.1.4] - 2025-12-16
### Added
- Add support for launching player in fullscreen mode (via TPStreams Android SDK **1.1.4**) (#46, #72)
- Implement live chat component (#45)
- Support for live stream playback (via TPStreams Android SDK **1.1.2**) (#71)
### Changed
- Update TPStreams Android Player to **1.1.3** for live stream UI fixes

## [1.1.3] - 2025-12-05
### Changed
- Update iOSPlayerSDK version to 1.2.15

## [1.1.2] - 2025-12-04
### Fixed
- Add license acquisition status mappings for download in iOS
### Changed
- Update TPStreams Android Player to **1.1.1** to fix external listener preservation for token refresh

## [1.1.1] - 2025-12-01
### Fixed
- Add native loading indicator to player view (iOS)
- Refactor download module initialization from the `playerView` manager

## [1.1.0] - 2025-11-19
### Fixed
- Implement `onError` handler for TPStreams Android SDK error reporting (via SDK **1.1.0**)
- Ensure proper `onAccessTokenExpiry` event emission (#43)
- Sanitize offline license duration with upper bound validation (#44)

## [1.0.8] - 2025-10-31
### Fixed
- Fix iOS build workflow by updating CocoaPods dependencies
- Remove initial playback speed emission in TPStreams Android Player (#42)

## [1.0.7] - 2025-10-07
### Added
- Add support for offline DRM license expiry and renewal (iOS) (#41)

## [1.0.6] - 2025-09-25
### Changed
- Update README (#40)
### Added
- Add support for player event listeners in native (iOS) (#39)

## [1.0.5] - 2025-09-23
### Changed
- Update iOSPlayerSDK to version 1.2.10

## [1.0.4] - 2025-09-22
### Fixed
- Allow flexible metadata types to support complex data structures (#38)
- Trigger download state event when starting progress listener (iOS)

[1.1.14]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.13...v1.1.14
[1.1.13]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.12...v1.1.13
[1.1.12]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.11...v1.1.12
[1.1.11]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.10...v1.1.11
[1.1.10]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.9...v1.1.10
[1.1.9]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.8...v1.1.9
[1.1.8]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.7...v1.1.8
[1.1.7]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.6...v1.1.7
[1.1.6]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/testpress/react-native-tpstreams/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.8...v1.1.0
[1.0.8]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/testpress/react-native-tpstreams/compare/v1.0.3...v1.0.4
