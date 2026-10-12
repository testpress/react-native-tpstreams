# Development Setup Guide

This guide covers setting up your local environment to develop, test, and contribute to the **`react-native-tpstreams`** SDK.

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Recommended Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (see [`.nvmrc`](../.nvmrc)) | Use `nvm use` to match the exact version |
| **Yarn** | Yarn Berry (v3.6+ bundled) | Yarn is the established convention across this repository for workspaces. Do not use `npm` for local development. |
| **JDK** | JDK 17 | Required for Android builds |
| **Android Studio** | Latest stable | Android SDK, Command-line Tools, NDK |
| **Xcode** | Latest stable (macOS only) | Required for iOS development and CocoaPods |
| **Ruby & Bundler** | `>= 2.6.10` | For managing CocoaPods dependencies in `example/` |

---

## 1. Initial Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:testpress/react-native-tpstreams.git
   cd react-native-tpstreams
   ```

2. **Use the required Node.js version:**
   ```bash
   nvm use
   ```

3. **Install dependencies:**
   This is a monorepo managed with Yarn workspaces. Run `yarn` from the repository root:
   ```bash
   yarn
   ```
   > **Note:** Yarn is the required convention for this codebase. Never run `npm install` locally, as it will ignore workspace hoisting configurations and corrupt the lockfile.

4. **Verify Git hooks:**
   The repository uses [Lefthook](../lefthook.yml) for git hooks. It automatically verifies ESLint, TypeScript types, and conventional commit messages before commits are accepted.

---

## 2. Project Architecture & Workspaces

The repository is structured into two main packages:

* **`/` (Root):** The core SDK source code located in `src/`, native Android code in `android/`, and native iOS code in `ios/`.
* **`example/`:** A sample React Native application used to develop, test, and demonstrate SDK features.

---

## 3. Running the Example App

The example application connects directly to the local SDK source code. Any JavaScript changes are reflected immediately in Metro; native changes require a rebuild.

### A. Start the Metro Bundler
From the repository root:
```bash
yarn example start
```

### B. Running on Android
1. Start an Android emulator or connect a physical device with USB debugging enabled.
2. In a separate terminal, run:
   ```bash
   yarn example android
   ```
   *To open and edit native Kotlin/Java code, open the `example/android` directory in **Android Studio**.*

### C. Running on iOS (macOS only)
1. **Install CocoaPods dependencies (first time only):**
   ```bash
   cd example
   bundle install
   bundle exec pod install
   cd ..
   ```
2. Start the iOS simulator and launch the app:
   ```bash
   yarn example ios
   ```
   *To open and edit native iOS code in Xcode, open `example/ios/TpstreamsExample.xcworkspace` in **Xcode** (source files are located under `Pods > Development Pods > react-native-tpstreams`).*

---

## 4. Common Development Commands

All development tasks can be run directly from the repository root:

```bash
# Type checking
yarn typecheck              # Run TypeScript compiler checks

# Linting
yarn lint                   # Run ESLint across codebase
yarn lint --fix             # Auto-fix linting issues

# Unit Tests
yarn test                   # Run Jest unit test suite

# Building the SDK
yarn clean                  # Clean build artifacts
yarn prepare                # Build the library with react-native-builder-bob
```

---

## 5. Commit Guidelines

All commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) format. This is enforced by `commitlint` via Lefthook:

```text
<type>(<optional scope>): <description>
```

**Common types:**
* `feat`: A new feature
* `fix`: A bug fix
* `chore`: Maintenance, dependency updates, or release prep
* `docs`: Documentation updates
* `refactor`: Code change that neither fixes a bug nor adds a feature
* `test`: Adding or correcting tests
* `ci`: Changes to CI/CD workflows
