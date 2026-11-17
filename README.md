# FAIZMART INDIA SHOPPING — V50

APK-buildable Android shopping app backed by the live Supabase project.

## Connected application features
- Live product and category catalog from Supabase
- Customer email OTP authentication
- Mobile OTP interface (requires an SMS provider to be enabled and configured in Supabase Auth)
- Customer cart saved on the device between app sessions
- COD order placement through a database RPC, with server-side price and stock checks
- Customer order history
- Seller registration and admin approval
- Seller product creation with product-image upload to Supabase Storage
- Admin seller/order management, delivery settings, and 10% default commission setting
- GitHub Actions workflow that builds a debug APK artifact

## Production setup still required
- Configure an SMS provider in Supabase Auth before mobile OTP can send messages. Provider credentials and any SMS charges are controlled by the provider.
- Verify the live customer, seller, and admin flows with real accounts on a device.
- Configure a production email sender/SMTP and review email OTP templates and deliverability.
- Configure a production hosting domain and app-store signing/release process before public launch.
- Online payments and courier integrations are not enabled; COD is the current checkout method.

## Build
GitHub Actions → **FAIZMART INDIA SHOPPING V50 APK** → download the artifact from a successful run.
The workflow builds a debug APK using Java 21 and uploads it as a workflow artifact.
