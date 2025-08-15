# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React Native library that provides a video player component for TPStreams. The library includes:

- Video player component with native iOS/Android implementations
- Download management with real-time progress tracking
- React Native New Architecture (Fabric/TurboModules) support
- TypeScript/Codegen-based native bridge specifications

## Development Commands

### Setup and Installation
```sh
yarn                    # Install dependencies (required - this is a Yarn workspace)
```

### Common Development Tasks
```sh
# Type checking and linting
yarn typecheck         # Run TypeScript compiler
yarn lint              # Run ESLint
yarn lint --fix        # Fix ESLint errors automatically

# Testing
yarn test              # Run Jest tests

# Building
yarn clean             # Clean build artifacts
yarn prepare           # Build library with react-native-builder-bob

# Release
yarn release           # Release new version with release-it
```

### Example App Development
```sh
# Run the example app
yarn example start     # Start Metro bundler
yarn example android   # Run on Android
yarn example ios       # Run on iOS

# Build example app
yarn example build:android  # Build Android APK
yarn example build:ios      # Build iOS app
```

### iOS Development
```sh
# Install CocoaPods dependencies (run in example directory)
cd example && bundle install      # Install Ruby gems (first time only)
cd example && bundle exec pod install  # Install iOS dependencies
```

## High-Level Architecture

### Core Components Structure

**Library Entry Point (`src/index.tsx`)**
- Exports main `TPStreamsPlayerView` component
- Exports download management functions
- Exports initialization module `TPStreams.initialize()`

**Player Architecture (`src/TPStreamsPlayer.tsx`)**
- React wrapper around native Fabric component
- Promise-based API using native event callbacks
- Imperative ref API for player controls (play, pause, seek, etc.)
- Event handling for player state changes

**Download System (`src/TPStreamsDownload.tsx`)**
- NativeEventEmitter-based real-time progress updates
- Promise-based download management functions
- Progress listener lifecycle management

**Native Bridge Specifications (`spec/`)**
- `NativeTPStreams.ts` - TurboModule for initialization
- `NativeTPStreamsDownloads.ts` - TurboModule for downloads
- `TPStreamsPlayerViewNativeComponent.ts` - Fabric view component

### Platform Implementation

**iOS (`ios/` directory)**
- Swift/Objective-C++ implementations
- Fabric view components and TurboModules
- CocoaPods integration via `TPStreams.podspec`

**Android (`android/` directory)**
- Kotlin/Java implementations using New Architecture
- Fabric view and TurboModule implementations
- Gradle build with TPStreamsAndroidPlayer dependency

### Build System

**React Native New Architecture**
- Uses Codegen for generating native interfaces
- Fabric for view components, TurboModules for logic
- Configuration in `codegenConfig` (package.json)

**Builder Bob Configuration**
- Builds library for module format with ESM support
- Separate TypeScript build configuration (`tsconfig.build.json`)
- Output to `lib/` directory

**Monorepo Structure**
- Yarn workspaces with example app in `example/`
- Shared dependencies and development tools
- Turbo for build caching (Android/iOS builds)

### Code Quality Tools

**ESLint + Prettier**
- Modern flat config in `eslint.config.mjs`
- React Native specific rules with Prettier integration
- Pre-commit hooks via Lefthook

**TypeScript**
- Strict mode enabled with comprehensive type checking
- Path mapping for local imports
- Separate build configuration for library output

**Git Hooks (Lefthook)**
- Pre-commit: TypeScript + ESLint checks
- Commit message: Conventional commits validation

### Key Development Patterns

**Promise-Based Native Bridge**
The player component uses a unique pattern where native commands return data via events rather than direct promise returns. The TypeScript wrapper creates promises and resolves them when corresponding events are received.

**Real-Time Progress System**
Downloads use a listener-based system where you start/stop listening via methods, and updates come through NativeEventEmitter. This enables efficient real-time UI updates.

**Imperative Component API**
The player exposes methods via useImperativeHandle, allowing parent components to control playback programmatically while maintaining React patterns.

## Example App Context

The example app demonstrates library usage and serves as a development testbed. It:
- Initializes TPStreams with test organization ID ('9q94nm')
- Provides real implementations of player and download features
- Runs on both iOS and Android with New Architecture enabled
- Uses the library via local workspace dependency

## Release Process

The library uses conventional commits and automated releasing:
- Commits follow conventional format (feat/fix/chore/docs/etc.)
- `yarn release` handles version bumping, tagging, and publishing
- GitHub releases and npm publishing are automated
- Version bumping follows semantic versioning

## Important Notes

- **Yarn Required**: This project uses Yarn workspaces - npm cannot be used for development
- **New Architecture**: Library is built for React Native New Architecture (Fabric/TurboModules)
- **Native Dependencies**: Changes to native code require rebuilding the example app
- **TypeScript First**: All APIs are fully typed with comprehensive TypeScript support
