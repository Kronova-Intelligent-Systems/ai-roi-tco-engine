# iOS App Store Deployment Guide

## Prerequisites

1. **Apple Developer Account**
   - Enrolled in Apple Developer Program ($99/year)
   - Admin access to App Store Connect
   - Two-factor authentication enabled

2. **Development Environment**
   - macOS with Xcode 15+
   - Ruby 3.2+ for Fastlane
   - CocoaPods installed
   - Valid code signing certificates

3. **Required Credentials**
   - Apple ID email
   - App-specific password
   - Team ID
   - Bundle identifier: `com.kronova.roicalculator`

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
# Install Fastlane
sudo gem install fastlane

# Install CocoaPods
sudo gem install cocoapods

# Install project dependencies
cd ios
bundle install
pod install
\`\`\`

### 2. Configure Environment Variables

Create `.env` file in the `ios` directory:

\`\`\`bash
APPLE_ID=your-apple-id@email.com
ITC_TEAM_ID=your-itc-team-id
TEAM_ID=your-team-id
MATCH_GIT_URL=git@github.com:your-org/certificates.git
MATCH_PASSWORD=your-match-password
FASTLANE_PASSWORD=your-apple-id-password
APP_SPECIFIC_PASSWORD=your-app-specific-password
SLACK_WEBHOOK_URL=your-slack-webhook (optional)
\`\`\`

### 3. Setup Code Signing

\`\`\`bash
cd ios
bundle exec fastlane match appstore
\`\`\`

This will:
- Download or create distribution certificates
- Download or create App Store provisioning profiles
- Install them in your keychain

### 4. Configure App Store Connect

1. **Create App**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Fill in:
     - Platform: iOS
     - Name: Kronova AI ROI Calculator
     - Primary Language: English (U.S.)
     - Bundle ID: com.kronova.roicalculator
     - SKU: kronova-roi-calculator

2. **App Information**
   - Category: Business, Productivity
   - Subcategory: Finance
   - Content Rights: Check if you own rights

3. **Pricing**
   - Price: Free
   - Availability: All territories

4. **Privacy Policy**
   - URL: https://kronova.com/privacy

## Deployment Process

### Beta (TestFlight)

Deploy to TestFlight for internal/external testing:

\`\`\`bash
cd ios
bundle exec fastlane beta
\`\`\`

This will:
1. Increment build number
2. Build the app for App Store distribution
3. Upload to TestFlight
4. Notify via Slack (if configured)

### Production (App Store)

Deploy to App Store for public release:

\`\`\`bash
cd ios
bundle exec fastlane release
\`\`\`

This will:
1. Increment version and build numbers
2. Build the app for App Store distribution
3. Upload to App Store Connect
4. Submit for review
5. Create git tag
6. Push changes to repository

### Manual Build

Build without deploying:

\`\`\`bash
cd ios
xcodebuild -workspace KronovaROI.xcworkspace \
           -scheme KronovaROI \
           -configuration Release \
           -archivePath build/KronovaROI.xcarchive \
           archive
\`\`\`

## Testing

### Unit Tests

\`\`\`bash
cd ios
bundle exec fastlane test
\`\`\`

### UI Tests

\`\`\`bash
cd ios
xcodebuild test \
  -workspace KronovaROI.xcworkspace \
  -scheme KronovaROIUITests \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
\`\`\`

### Beta Testing Flow

1. **Internal Testing** (up to 100 testers)
   - Add testers in App Store Connect
   - No review required
   - Instant distribution

2. **External Testing** (up to 10,000 testers)
   - Submit for Beta App Review
   - Requires privacy policy
   - 24-48 hour review

## Screenshots

### Required Sizes

- iPhone 6.7": 1290 x 2796 (iPhone 15 Pro Max)
- iPhone 6.5": 1284 x 2778 (iPhone 14 Pro Max)
- iPhone 5.5": 1242 x 2208 (iPhone 8 Plus)
- iPad Pro 12.9": 2048 x 2732

### Generate Screenshots

\`\`\`bash
cd ios
bundle exec fastlane screenshots
\`\`\`

This will:
- Run UI tests on multiple devices
- Capture screenshots
- Add device frames
- Save to `ios/fastlane/screenshots`

## App Review Process

### Submission Checklist

- [ ] App tested on physical devices
- [ ] All required screenshots uploaded
- [ ] App description and keywords set
- [ ] Privacy policy URL provided
- [ ] Support URL configured
- [ ] Demo account credentials (if required)
- [ ] Export compliance completed
- [ ] Content rating questionnaire filled

### Review Timeline

- **Expedited Review**: 1-2 days (requires justification)
- **Standard Review**: 2-5 days
- **Rejection**: Address issues and resubmit

### Common Rejection Reasons

1. **Incomplete Information**
   - Missing demo credentials
   - Broken links in metadata

2. **Performance Issues**
   - App crashes on launch
   - Broken features

3. **Design Issues**
   - UI not optimized for iPad
   - Poor user experience

4. **Privacy Concerns**
   - Missing privacy policy
   - Undisclosed data collection

## Continuous Integration

The project includes GitHub Actions workflow for automated deployment:

\`\`\`yaml
# .github/workflows/ios-deploy.yml
\`\`\`

### Trigger Deployment

**TestFlight (Beta):**
\`\`\`bash
git push origin main
\`\`\`

**App Store (Production):**
\`\`\`bash
git tag ios-v1.0.0
git push origin ios-v1.0.0
\`\`\`

## Versioning

### Version Numbers

Format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

Example: `1.0.0` → `1.1.0` (new features)

### Build Numbers

Auto-incremented on each deployment:
- TestFlight: Build 1, 2, 3...
- Production: Build 1.0.0, 1.0.1, 1.0.2...

## Monitoring

### Crash Reports

View in App Store Connect:
- Crashes and Energy
- Feedback
- User reviews

### Analytics

Track metrics:
- Downloads
- Impressions
- Conversion rate
- Retention
- Session duration

## Troubleshooting

### Code Signing Issues

\`\`\`bash
# Reset certificates
cd ios
bundle exec fastlane match nuke distribution

# Re-create certificates
bundle exec fastlane match appstore
\`\`\`

### Build Failures

\`\`\`bash
# Clean build
cd ios
xcodebuild clean

# Reset CocoaPods
pod deintegrate
pod install
\`\`\`

### Upload Errors

\`\`\`bash
# Validate build
xcrun altool --validate-app \
  -f build/KronovaROI.ipa \
  -t ios \
  -u $APPLE_ID \
  -p $APP_SPECIFIC_PASSWORD
\`\`\`

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Fastlane Documentation](https://docs.fastlane.tools/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

## Support

For deployment issues:
- Email: appstore@kronova.com
- Slack: #ios-deployment
- Documentation: https://docs.kronova.com/ios
\`\`\`
