# FAIZMART INDIA SHOPPING — V50

Android e-commerce marketplace app for customers, sellers and admin, using the live Supabase project.

## Customer shopping
- Live product and category catalogue from Supabase
- Product search and category filters
- Add to cart, quantity controls and cart saved on the device
- Checkout with saved delivery address and COD
- Server-side order creation checks product availability, current price and stock, then deducts stock
- Customer order history and status
- Wishlist

## Seller marketplace
- Email OTP sign-in; mobile OTP UI is present
- Seller registration and admin approval
- Approved sellers can add products with phone-gallery photos
- Product photos are resized/compressed before upload to the public `product-images` Supabase Storage bucket
- Seller can edit product name, description, category, price, MRP, stock and active/hidden status
- Seller can view own products, orders and earnings

## Admin
- Admin role is checked in Supabase, not taken from user-editable profile metadata
- Seller approval / suspension
- Order status management
- Delivery charge settings (flat fee and free-delivery threshold)
- Default marketplace commission is 10%; seller commissions and payouts are recorded when orders are placed

## Current connected backend status (2026-11-18)
- 8 active sample products and 15 active categories are in the live database
- 1 admin profile and 1 approved seller are present
- `product-images` bucket exists with public-read and approved-seller/admin upload policies
- No seller-uploaded objects were present during the last backend check; real gallery upload still needs an on-device test
- COD RPC passed a transaction test; the test transaction was rolled back, so it created no real order and did not reduce stock
- GitHub Actions run 105 built the APK successfully; the build uses a cached debug signing key

## OTP and production setup
- Email OTP code is present. Configure a production SMTP sender in Supabase and test actual inbox delivery before launch.
- Mobile OTP code is present, but real SMS delivery requires Supabase Phone Auth and an SMS provider. Configure provider credentials privately in Supabase; never commit secrets to GitHub or share them in chat. India SMS may require TRAI/DLT compliance and provider charges.
- Online payment gateways, courier booking/tracking APIs, cashback wallet and automated refunds are not integrated yet. COD is the current checkout method.
- Public production release requires a privately stored release keystore; current GitHub artifact is a debug APK.

## Brand
The repository uses the supplied FAIZMART logo at `public/assets/faizmart-logo.jpg` for in-app branding and Android launcher icon generation.

## Build
GitHub Actions → **FAIZMART INDIA SHOPPING V50 APK** → download the APK and source ZIP artifacts from the latest successful run.
