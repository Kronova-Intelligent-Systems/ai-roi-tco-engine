# Android Google Play Store Deployment Guide

## Prerequisites

1. **Google Play Console Account**
   - Registered developer account ($25 one-time fee)
   - Admin access to Play Console
   - Two-factor authentication enabled

2. **Development Environment**
   - Android Studio Hedgehog or later
   - JDK 17+
   - Gradle 8.2+
   - Ruby 3.2+ for Fastlane

3. **Required Files**
   - Release keystore (`.jks` file)
   - Play Store service account JSON key
   - App signing certificate

## Setup Instructions

### 1. Create Release Keystore

```bash
keytool -genkey -v -keystore release-keystore.jks \
  -alias kronova-roi-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

**Important:** Store keystore credentials securely and never commit to version control.

### 2. Configure Keystore

Create `android/keystore.properties`:

```properties
storeFile=release-keystore.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=kronova-roi-release
keyPassword=YOUR_KEY_PASSWORD
