# PWA (Progressive Web App) Setup Guide

## Overview

The Kronova AI ROI Calculator is configured as a Progressive Web App with offline support, installability, and push notifications.

## Features

### 1. Service Worker
- **Caching Strategy**: Network-first for API calls, cache-first for static assets
- **Offline Support**: Fallback to cached content when offline
- **Background Sync**: Queue API calls when offline, sync when connection restored
- **Push Notifications**: Real-time updates and alerts

### 2. App Installation
- **Install Prompt**: Custom banner for installation
- **Add to Home Screen**: iOS and Android support
- **Standalone Mode**: Runs like a native app without browser UI

### 3. Manifest Configuration
- **App Name**: Kronova AI ROI Calculator
- **Theme Color**: #0A0A0A (Black)
- **Icons**: 8 sizes from 72x72 to 512x512
- **Shortcuts**: Quick access to calculator and solutions
- **Screenshots**: Mobile and desktop previews

## Testing PWA Features

### Local Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Service Worker**
   - Open Chrome DevTools → Application → Service Workers
   - Verify registration status
   - Test offline mode by checking "Offline" in Network tab

3. **Test Installation**
   - Chrome DevTools → Application → Manifest
   - Click "Add to homescreen"
   - Verify app opens in standalone mode

### Production Testing

1. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

2. **Lighthouse Audit**
   - Run Lighthouse in Chrome DevTools
   - Check PWA score (target: 100/100)
   - Verify all PWA criteria are met

3. **Real Device Testing**
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Add to Home Screen

## PWA Checklist

- [x] Valid manifest.json with all required fields
- [x] Service worker registered and active
- [x] HTTPS enabled (required for PWA)
- [x] Offline fallback page
- [x] Icons for all sizes (72x72 to 512x512)
- [x] Theme color defined
- [x] Viewport meta tag configured
- [x] Apple touch icons for iOS
- [x] Installation prompt handler
- [x] Background sync for offline data
- [x] Push notification support
- [x] App shortcuts configured
- [x] Share target API implemented

## Browser Support

### Desktop
- Chrome 67+
- Edge 79+
- Safari 15.4+ (limited)
- Firefox 97+ (limited)

### Mobile
- Chrome Android 67+
- Safari iOS 15.4+
- Samsung Internet 8.0+
- UC Browser Android (limited)

## Troubleshooting

### Service Worker Not Registering
```javascript
// Check browser support
if ('serviceWorker' in navigator) {
  console.log('Service Worker supported');
}

// Check for errors
navigator.serviceWorker.register('/service-worker.js')
  .catch(err => console.error('Registration failed:', err));
```

### Offline Mode Not Working
- Verify service worker is active
- Check cache names match in code
- Clear browser cache and re-register
- Check Network tab for failed requests

### Install Prompt Not Showing
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify all PWA criteria are met
- Test on supported browser
- Clear "beforeinstallprompt" dismissal

### Push Notifications Not Working
- Check notification permissions
- Verify VAPID keys are configured
- Test on supported platform (not iOS Safari)
- Check service worker is active

## Performance Optimization

### Cache Strategy
- **API Calls**: Network first (max 5 minutes cache)
- **HTML Pages**: Network first (1 hour cache)
- **Static Assets**: Cache first (1 year cache)
- **Images**: Cache first with size limit

### Cache Limits
- API Cache: 50 MB
- Runtime Cache: 100 MB
- Total Storage: 250 MB

### Cache Cleanup
```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Security Considerations

1. **HTTPS Only**: PWA requires secure context
2. **Content Security Policy**: Restrict script sources
3. **Service Worker Scope**: Limited to origin
4. **Permission Prompts**: Require user consent
5. **Data Encryption**: Sensitive data encrypted at rest

## Analytics

Track PWA metrics:
- Installation rate
- Offline usage
- Service worker hit rate
- Push notification engagement
- App launch frequency

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Workbox (Advanced)](https://developers.google.com/web/tools/workbox)
