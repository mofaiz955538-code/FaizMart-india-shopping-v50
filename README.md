# FAIZMART INDIA SHOPPING — V50

APK-buildable Android shopping app backed by the live Supabase project.

## Connected application features
- Live product and category catalog from Supabase
- Customer email OTP authentication
- Mobile OTP request and verification code in the app (SMS delivery requires Supabase Phone Auth plus an SMS provider)
- Customer cart saved on the device between app sessions
- COD order placement through a database RPC, with server-side price and stock checks
- Customer order history
- Seller registration and admin approval
- Seller product creation with product-image upload to Supabase Storage
- Admin seller/order management, delivery settings, and 10% default commission setting
- GitHub Actions workflow that builds a debug APK artifact

## Phone OTP: testing and production
- To test without paying for SMS, configure a test phone number and fixed OTP code in Supabase Dashboard → Authentication → Providers → Phone. This is only for the exact test number/code configured there; it does not send real SMS.
- For customer-wide live OTP, enable Phone provider and configure a supported SMS provider (for example Twilio, Vonage, or MessageBird) in Supabase Auth. Provider account credentials must be entered privately in the Supabase dashboard, never committed to GitHub or shared in chat. SMS provider charges and India TRAI/DLT requirements must be checked before launch.
- The app already calls Supabase `signInWithOtp({ phone })` and `verifyOtp({ phone, token, type: 'sms' })`; a successful send cannot be verified until the provider is configured.
- Configure a production email sender/SMTP and verify email OTP delivery.

## Brand logo
The user's exact FM / shopping-cart FAIZMART logo is preserved in the earlier V50 Android source ZIP. The current GitHub Actions workflow creates a fresh Capacitor Android project from the web source; launcher/splash resource integration of that exact binary logo is still a required build step and must not be represented as complete until a new APK is built and inspected.

## Production checks still required
- Verify customer login, seller approval, product photo upload, COD order, stock deduction, and admin actions with real accounts on a device.
- Configure production hosting and Android release signing before public launch.
- Online payments and courier integrations are not enabled; COD is the current checkout method.

## Build
GitHub Actions → **FAIZMART INDIA SHOPPING V50 APK** → download the artifact from a successful run.
The workflow currently builds a debug APK using Java 21 and uploads it as a workflow artifact.
