# FAIZMART INDIA SHOPPING — FINAL MASTER

यह master project live Supabase database structure के साथ काम करने के लिए तैयार किया गया है।

## इसमें क्या तैयार है
- Customer email OTP login/logout
- Live products + categories
- Search/category filter
- Cart quantity, wishlist
- Customer address और COD checkout
- Online order creation through `place_order`
- Customer order history
- Seller registration through `register_seller`
- Seller approval status
- Approved seller product photo upload to `product-images`
- Seller product list, seller orders और earnings/payout view
- Admin role check through database `is_admin()`
- Admin seller approval/suspension
- Admin order status update
- Admin commission ledger view
- Delivery settings: flat/distance/weight/company mode fields

## जरूरी बात
यह source code production marketplace की मुख्य application layer तैयार करता है। Online payment gateway settlement, OTP provider configuration, courier API credentials/KYC और final Android signing अभी external service/configuration steps हैं; इन्हें code में fake या secret key के साथ नहीं जोड़ा गया है।

## Supabase
`.env.example` में project URL और publishable key रखी गई है। Publishable/anon key frontend में उपयोग हो सकती है जब RLS सही हो। **Service-role/secret key को कभी ZIP, GitHub या frontend में न रखें।**

Live database में `products.active` field उपयोग होती है और code उसी field के अनुसार catalog पढ़ता है। Product images `product-images` bucket में seller के user-id folder में जाती हैं।

## चलाने का तरीका
1. इस project folder में `.env` बनाएं और `.env.example` की values रखें।
2. `npm install`
3. `npm run build`
4. `npm run dev`

GitHub/APK build के लिए repository में project files (unzip किए हुए) रखें; ZIP को backup के रूप में भी रखा जा सकता है।
