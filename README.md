# FAIZMART INDIA SHOPPING — V50

APK-build-ready Android project for **FAIZMART INDIA SHOPPING V50**.

## Included
- Android Gradle project
- Java 17 + Android Gradle Plugin 8.6.1
- WebView-based customer shopping app
- Product browsing, search and categories
- Cart and COD checkout
- My Orders and order status management
- Admin/Seller product entry with price/stock/photo URL
- WhatsApp order handoff
- Local device storage for the prototype
- GitHub Actions workflow that builds a debug APK automatically
- Brand logo asset in `app/src/main/assets/logo.svg`

## Important
This V50 build is APK-ready, but the current shopping data is stored locally on the device. A real multi-device online database, seller OTP verification, payments and production authentication must be connected separately before production launch.

## Build
Run `gradle :app:assembleDebug`, or use the GitHub Actions **Build V50 APK** workflow. The generated APK is uploaded as a workflow artifact.
