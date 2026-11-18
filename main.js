import './style.css';
import { createClient } from '@supabase/supabase-js';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const savedCart = (() => { try { return JSON.parse(localStorage.getItem('faizmart_cart') || '[]'); } catch { return []; } })();
const saveCart = () => { try { localStorage.setItem('faizmart_cart', JSON.stringify(state.cart)); } catch {} };
const state = {
  view: 'home', products: [], categories: [], cart: Array.isArray(savedCart) ? savedCart : [], user: null, session: null, otpPhone: '', selectedProductPhoto: null, selectedProductPhotoUrl: null,
  profile: null, seller: null, isAdmin: false, message: '', otpEmail: '',
  search: '', category: '', wishlist: new Set(), addresses: [], orders: [],
  settings: { commission: 10, freeDelivery: 499, flatDelivery: 40, deliveryMode: 'flat', companyName: '' },
  adminOrders: [], adminSellers: [], adminCommissions: [], backendError: ''
};

const demoProducts = [
  { id: 'demo-1', name: 'Ladies Kurti', price: 499, mrp: 799, image_url: 'assets/logo-placeholder.svg', category: 'Ladies', stock: 10 },
  { id: 'demo-2', name: 'Gents Shirt', price: 699, mrp: 999, image_url: 'assets/logo-placeholder.svg', category: 'Gents', stock: 8 },
  { id: 'demo-3', name: 'Kids Dress', price: 399, mrp: 599, image_url: 'assets/logo-placeholder.svg', category: 'Kids', stock: 12 }
];

const money = n => '₹' + Number(n || 0).toFixed(0);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const ready = () => !!supabase;
const msg = (text, type='info') => `<div class="notice ${type}">${esc(text)}</div>`;

function render() {
  const root = document.querySelector('#root');
  root.innerHTML = `<header><div class="topbar"><div class="brand"><img class="brand-logo" src="assets/faizmart-logo.jpg" alt="FAIZMART logo">FAIZMART INDIA SHOPPING</div><button class="menu" id="menu">☰</button></div>
    <nav id="nav"><button data-nav="home">Home</button><button data-nav="products">Products</button><button data-nav="orders">My Orders</button><button data-nav="seller">Seller Panel</button><button data-nav="admin">Admin</button><button data-nav="cart">Cart (${state.cart.reduce((n,p)=>n+(p.qty||1),0)})</button><button data-nav="auth">${state.user?'Account':'Login'}</button></nav></header>
    <main>${page()}</main><footer>FAIZMART INDIA SHOPPING • Online marketplace</footer>`;
  document.querySelector('#app-splash')?.remove();
  document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { state.view=b.dataset.nav; render(); });
  document.querySelector('#menu')?.addEventListener('click',()=>document.querySelector('#nav').classList.toggle('open'));
  bindPage();
}
function page(){
  if(state.view==='home') return home(); if(state.view==='products') return products(); if(state.view==='auth') return auth();
  if(state.view==='seller') return seller(); if(state.view==='admin') return admin(); if(state.view==='cart') return cart(); if(state.view==='orders') return orders();
  return home();
}
function home(){
  const live = ready() && state.products.length;
  return `<section class="hero"><div><span class="pill">${live?'LIVE ONLINE STORE':'ONLINE SHOPPING'}</span><h1>FAIZMART INDIA SHOPPING</h1><p>Customers shop online, sellers manage products, and admin controls the marketplace from one system.</p>${state.backendError?msg('Online data warning: '+state.backendError,'error'):''}<button class="primary" data-go="products">Start Shopping</button></div><div class="hero-card"><b>${state.settings.commission}%</b><span>Marketplace commission</span><small>Saved in the live database</small></div></section>
  <section><div class="section-head"><div><h2>Shop by Category</h2><p>Start with Ladies, Gents and Kids; more categories can be added.</p></div></div><div class="chips">${state.categories.map(c=>`<button data-cat="${esc(c.name)}">${esc(c.icon||'🛍️')} ${esc(c.name)}</button>`).join('')||['Ladies','Gents','Kids','Home & Kitchen','Electronics'].map(c=>`<button data-cat="${c}">${c}</button>`).join('')}</div></section>
  <section><h2>Marketplace Features</h2><div class="grid cards">${['Email OTP customer login','Seller onboarding + approval','Gallery image upload','Online cart + COD order','10% commission calculation','Delivery charge rules','Addresses + wishlist','Order tracking + status'].map(x=>`<div class="card"><b>${x}</b><p>Connected to the online project where permissions allow.</p></div>`).join('')}</div></section>`;
}
function products(){
  const list = state.products.filter(p=>!state.category || p.category===state.category || p.category?.toLowerCase()===state.category.toLowerCase()).filter(p=>!state.search || `${p.name} ${p.category} ${p.description||''}`.toLowerCase().includes(state.search.toLowerCase()));
  return `<section><div class="section-head"><div><h2>Products</h2><p>${ready()?'Live online catalog':'Online database is not configured.'}</p>${state.backendError?msg(state.backendError,'error'):''}</div><input id="search" value="${esc(state.search)}" placeholder="Search products..."></div><div class="chips"><button data-cat="">All</button>${state.categories.map(c=>`<button data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</div><div class="grid products">${list.map(productCard).join('')||'<div class="card"><h3>No products found</h3><p>Try another search or category.</p></div>'}</div></section>`;
}
function productCard(p){
  const wished = state.wishlist.has(String(p.id));
  return `<article class="product"><div class="image-wrap"><img src="${esc(p.image_url||'assets/logo-placeholder.svg')}" onerror="this.src='assets/logo-placeholder.svg'"><button class="heart" data-wish="${esc(p.id)}">${wished?'♥':'♡'}</button></div><div class="pbody"><span>${esc(p.category||'General')}</span><h3>${esc(p.name)}</h3><div><strong>${money(p.price)}</strong>${p.mrp?` <del>${money(p.mrp)}</del>`:''}</div><small>Stock: ${p.stock??0}</small><button class="primary add" data-id="${esc(p.id)}" ${Number(p.stock||0)<=0?'disabled':''}>Add to cart</button></div></article>`;
}
function auth(){
  if(state.user) return `<section class="panel"><h2>My Account</h2>${msg(`Logged in as ${state.user.email||'customer'}`,'success')}<div class="grid two"><div class="card"><h3>Profile</h3><p>Role: <b>${esc(state.profile?.role||'customer')}</b></p><button id="logout">Logout</button></div><div class="card"><h3>Quick Links</h3><button data-go="orders">My Orders</button><button data-go="seller">Seller Panel</button><button data-go="cart">Cart</button></div></div></section>`;
  return `<section class="panel"><h2>Login / OTP</h2><div class="card form"><h3>Email OTP</h3><p>Gmail/email पर 6-digit OTP भेजकर login करें.</p><input id="auth-email" type="email" placeholder="Gmail / Email" value="${esc(state.otpEmail)}"><button class="primary" id="send-otp" ${ready()?'':'disabled'}>Send Email OTP</button><div class="otp-row"><input id="auth-otp" inputmode="numeric" maxlength="6" placeholder="6-digit email OTP"><button id="verify-otp" ${ready()?'':'disabled'}>Verify Email OTP</button></div><div id="auth-msg">${ready()?'':'Supabase connection settings are missing.'}</div></div><div class="card form"><h3>Mobile OTP</h3><p>India mobile number डालें. SMS OTP के लिए Supabase में phone provider चालू होना जरूरी है.</p><input id="auth-phone" type="tel" inputmode="tel" placeholder="10-digit mobile / +91 number" value="${esc(state.otpPhone||'')}"><button class="primary" id="send-phone-otp" ${ready()?'':'disabled'}>Send Mobile OTP</button><div class="otp-row"><input id="auth-phone-otp" inputmode="numeric" maxlength="6" placeholder="6-digit SMS OTP"><button id="verify-phone-otp" ${ready()?'':'disabled'}>Verify Mobile OTP</button></div><div id="phone-auth-msg">SMS provider setup may be required.</div></div></section>`;
}
function seller(){
  if(!state.user) return `<section class="panel"><h2>Seller Panel</h2>${msg('Seller बनने के लिए पहले customer login करें.')}<button class="primary" data-go="auth">Login / OTP</button></section>`;
  const s=state.seller;
  return `<section class="panel"><div class="section-head"><div><h2>Seller Panel</h2><p>Registration, approval, products, stock and earnings.</p></div><span class="status ${s?.status||'new'}">${esc(s?.status||'Not registered')}</span></div>
  <div class="grid two"><div class="card"><h3>${s?'Seller Profile':'Seller Registration'}</h3><input id="shop" placeholder="Business / Shop name" value="${esc(s?.business_name||'')}"><input id="owner" placeholder="Owner name" value="${esc(s?.owner_name||'')}"><input id="smobile" placeholder="Mobile" value="${esc(s?.phone||'')}"><input id="semail" type="email" placeholder="Email" value="${esc(s?.email||state.user.email||'')}"><button class="primary" id="seller-register">${s?'Update Seller':'Register Seller'}</button><div id="seller-msg"></div></div>
  <div class="card"><h3>Seller Dashboard</h3>${s?.status==='approved'?`<button data-action="add-product">＋ Add Product</button><button data-action="seller-products">My Products</button><button data-action="seller-orders">My Orders</button><button data-action="seller-earnings">Sales & Earnings</button>`:'<p>Admin approval के बाद product add करने का option खुलेगा.</p>'}</div></div><div id="seller-area"></div></section>`;
}
function admin(){
  if(!state.user) return `<section class="panel"><h2>Admin Panel</h2>${msg('Admin panel खोलने के लिए admin account से login करें.') }<button class="primary" data-go="auth">Login</button></section>`;
  if(!state.isAdmin) return `<section class="panel"><h2>Admin Panel</h2>${msg('यह account admin नहीं है. Admin access केवल database में admin role वाले account को मिलेगा.','error')}</section>`;
  return `<section class="panel"><div class="section-head"><div><h2>Admin Panel</h2><p>Seller approval, products, orders, commission and delivery controls.</p></div></div>
  <div class="grid stats"><div class="stat"><span>Orders</span><b>${state.adminOrders.length}</b></div><div class="stat"><span>Sellers</span><b>${state.adminSellers.length}</b></div><div class="stat"><span>Commission</span><b>${money(state.adminCommissions.reduce((s,x)=>s+Number(x.commission_amount||0),0))}</b></div><div class="stat"><span>Rate</span><b>${state.settings.commission}%</b></div></div>
  <div class="grid two"><div class="card"><h3>Marketplace Settings</h3><label>Commission %<input id="commission" type="number" min="0" max="100" value="${state.settings.commission}"></label><label>Free delivery above ₹<input id="free-delivery" type="number" min="0" value="${state.settings.freeDelivery}"></label><label>Flat delivery ₹<input id="flat-delivery" type="number" min="0" value="${state.settings.flatDelivery}"></label><label>Delivery mode<select id="delivery-mode"><option value="flat" selected>Flat (currently supported)</option></select></label><small>Distance / weight / courier calculation will be enabled after courier and location services are connected.</small><label>Courier/company name<input id="company-name" value="${esc(state.settings.companyName)}"></label><button class="primary" id="save-settings">Save Online</button><div id="admin-msg"></div></div>
  <div class="card"><h3>Seller Management</h3><div id="seller-list">${state.adminSellers.map(s=>`<div class="list-row"><span><b>${esc(s.business_name||'Shop')}</b><small>${esc(s.email||'')} • ${esc(s.status)}</small></span><select data-seller-status="${s.id}"><option ${s.status==='pending'?'selected':''}>pending</option><option ${s.status==='approved'?'selected':''}>approved</option><option ${s.status==='suspended'?'selected':''}>suspended</option></select></div>`).join('')||'<p>No sellers yet.</p>'}</div></div></div>
  <div class="card"><h3>Recent Orders</h3>${state.adminOrders.slice(0,20).map(adminOrderRow).join('')||'<p>No orders yet.</p>'}</div><div class="card"><h3>Commission Ledger</h3>${state.adminCommissions.slice(0,30).map(c=>`<div class="list-row"><span>Order item ${esc(c.order_item_id)}<small>${esc(c.status)}</small></span><b>${money(c.commission_amount)}</b></div>`).join('')||'<p>Commission ledger will fill when eligible seller orders are placed.</p>'}</div></section>`;
}
function adminOrderRow(o){return `<div class="list-row"><span><b>${esc(o.order_no)}</b><small>${esc(o.customer_name||'')} • ${esc(o.phone||'')} • ${esc(o.payment_method||'COD')}</small></span><span><b>${money(o.total)}</b><select data-order-status="${o.id}"><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='Processing'?'selected':''}>Processing</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select></span></div>`}
function cart(){
  const subtotal=state.cart.reduce((s,p)=>s+Number(p.price)*Number(p.qty||1),0); const delivery=subtotal>=Number(state.settings.freeDelivery)?0:Number(state.settings.flatDelivery); const total=subtotal+delivery;
  return `<section class="panel"><h2>Your Cart</h2>${state.cart.length?state.cart.map((p,i)=>`<div class="cart-row"><img src="${esc(p.image_url||'assets/logo-placeholder.svg')}"><span><b>${esc(p.name)}</b><small>${money(p.price)} each</small></span><input data-qty="${i}" type="number" min="1" max="99" value="${p.qty||1}"><b>${money(Number(p.price)*(p.qty||1))}</b><button data-remove="${i}">Remove</button></div>`).join(''):'<p>Your cart is empty.</p>'}<hr><div class="summary"><span>Subtotal</span><b>${money(subtotal)}</b><span>Delivery</span><b>${money(delivery)}</b><span>Total</span><b>${money(total)}</b></div>${state.cart.length?`<button class="primary" id="checkout">Checkout / COD Order</button>`:''}<div id="cart-msg"></div></section>`;
}
function checkoutForm(){
  const saved=state.addresses.find(a=>a.is_default)||state.addresses[0]||{};
  return `<div class="card form" id="checkout-form"><h3>Delivery Address</h3>${state.addresses.length?'<small>आपका सेव किया हुआ पता नीचे भरा गया है; जरूरत हो तो बदलें.</small>':''}<input id="cname" placeholder="Full name" value="${esc(saved.full_name||state.profile?.full_name||'')}"><input id="cmobile" placeholder="Mobile number" value="${esc(saved.phone||state.profile?.mobile||'')}"><textarea id="caddress" placeholder="House / street / area">${esc(saved.address_line||'')}</textarea><div class="grid two"><input id="ccity" placeholder="City" value="${esc(saved.city||'')}"><input id="cstate" placeholder="State" value="${esc(saved.state||'')}"></div><input id="cpincode" inputmode="numeric" maxlength="6" placeholder="6-digit Pincode" value="${esc(saved.pincode||'')}"><button class="primary" id="confirm-order">Confirm COD Order</button><button id="cancel-checkout">Cancel</button><div id="checkout-msg"></div></div>`
}
function orders(){
  if(!state.user) return `<section class="panel"><h2>My Orders</h2>${msg('पहले login करें.')}<button class="primary" data-go="auth">Login</button></section>`;
  return `<section class="panel"><div class="section-head"><div><h2>My Orders</h2><p>आपके online orders और status.</p></div><button id="refresh-orders">Refresh</button></div><div id="orders-msg"></div>${state.orders.map(o=>`<div class="order-card"><div><b>${esc(o.order_no)}</b><span>${esc(o.status)}</span></div><p>${esc(o.address||'')} • ${esc(o.city||'')} ${esc(o.pincode||'')}</p><strong>${money(o.total)}</strong></div>`).join('')||'<p>No orders found.</p>'}</section>`;
}

async function sendOtp(email){const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});return error}
async function verifyOtp(email,token){const {data,error}=await supabase.auth.verifyOtp({email,token,type:'email'});if(!error){state.session=data.session;state.user=data.user}return error}
function normalizeIndianPhone(value){const digits=String(value||'').replace(/\D/g,'');if(digits.length===10)return '+91'+digits;if(digits.length===12&&digits.startsWith('91'))return '+'+digits;if(String(value||'').trim().startsWith('+')&&digits.length>=10&&digits.length<=15)return '+'+digits;throw new Error('Valid mobile number with country code is required.')}
async function sendPhoneOtp(phone){const {error}=await supabase.auth.signInWithOtp({phone,options:{shouldCreateUser:true}});return error}
async function verifyPhoneOtp(phone,token){const {data,error}=await supabase.auth.verifyOtp({phone,token,type:'sms'});if(!error){state.session=data.session;state.user=data.user}return error}
async function hydrateUser(){
  if(!supabase||!state.user)return;
  const [{data:profile,error:profileError},{data:seller,error:sellerError},{data:addrs,error:addressError}] = await Promise.all([
    supabase.from('profiles').select('*').eq('id',state.user.id).maybeSingle(),
    supabase.from('sellers').select('*').eq('user_id',state.user.id).maybeSingle(),
    supabase.from('addresses').select('*').eq('user_id',state.user.id).order('created_at',{ascending:false})
  ]);
  const accountError=profileError||sellerError||addressError;
  if(accountError)throw new Error('Account data: '+accountError.message);
  state.profile=profile; state.seller=seller; state.addresses=addrs||[];
  const {data:isAdmin,error:adminError}=await supabase.rpc('is_admin');
  if(adminError)throw new Error('Admin permission check: '+adminError.message);
  state.isAdmin=!!isAdmin;
  if(state.isAdmin) await loadAdmin();
  await loadWishlist(); await loadOrders();
}
async function loadProducts({renderAfter=true}={}){
  if(!supabase){state.backendError='Supabase URL or publishable key is missing from this build.';if(renderAfter)render();return}
  try{
    const [productsResult,categoriesResult,deliveryResult,storeResult]=await Promise.all([
      supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:false}),
      supabase.from('categories').select('*').eq('active',true).order('name'),
      supabase.from('v50_delivery_settings').select('*').eq('id',1).maybeSingle(),
      supabase.from('v50_store_settings').select('admin_commission_rate').eq('id',1).maybeSingle()
    ]);
    const firstError=productsResult.error||categoriesResult.error||deliveryResult.error||storeResult.error;
    state.backendError=firstError?firstError.message:'';
    state.products=productsResult.data||[];
    state.categories=categoriesResult.data||[];
    if(deliveryResult.data)state.settings={...state.settings,freeDelivery:Number(deliveryResult.data.free_delivery_above),flatDelivery:Number(deliveryResult.data.flat_charge),deliveryMode:deliveryResult.data.mode,companyName:deliveryResult.data.company_name||''};
    if(storeResult.data)state.settings.commission=Number(storeResult.data.admin_commission_rate||10);
  }catch(error){
    state.backendError=error?.message||'Supabase से online data लोड नहीं हो पाया.';
    state.products=[];state.categories=[];
  }finally{
    if(renderAfter)render();
  }
}
async function loadWishlist(){if(!supabase||!state.user)return;const {data,error}=await supabase.from('wishlists').select('product_id').eq('user_id',state.user.id);if(error)throw new Error('Wishlist: '+error.message);state.wishlist=new Set((data||[]).map(x=>String(x.product_id)));}
async function loadOrders(){if(!supabase||!state.user)return;const {data,error}=await supabase.from('orders').select('*').eq('user_id',state.user.id).order('created_at',{ascending:false});if(error)throw new Error('Orders: '+error.message);state.orders=data||[];}
async function loadAdmin(){
  if(!state.isAdmin)return;
  const [{data:orders,error:ordersError},{data:sellers,error:sellersError},{data:comm,error:commissionError}]=await Promise.all([
    supabase.from('orders').select('*').order('created_at',{ascending:false}),
    supabase.from('sellers').select('*').order('created_at',{ascending:false}),
    supabase.from('seller_payouts').select('*').order('created_at',{ascending:false})
  ]);
  const adminDataError=ordersError||sellersError||commissionError;
  if(adminDataError)throw new Error('Admin data: '+adminDataError.message);
  state.adminOrders=orders||[];state.adminSellers=sellers||[];state.adminCommissions=comm||[];
}
async function registerSeller(){
  const data={business_name:document.querySelector('#shop').value.trim(),owner_name:document.querySelector('#owner').value.trim(),phone:document.querySelector('#smobile').value.trim(),email:document.querySelector('#semail').value.trim()}; const out=document.querySelector('#seller-msg');
  if(!data.business_name){out.innerHTML=msg('Shop/business name जरूरी है.','error');return}
  const {error}=await supabase.rpc('register_seller',{payload:data}); out.innerHTML=error?msg(error.message,'error'):msg('Seller application saved. Admin approval के बाद product listing चालू होगी.','success'); if(!error){await hydrateUser();render()}
}
async function prepareProductImage(sourceFile){
  if(!sourceFile)throw new Error('गैलरी से फोटो चुनें.');
  const name=(sourceFile.name||'').toLowerCase();
  const ext=(name.split('.').pop()||'').toLowerCase();
  const inferredType=({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif'})[ext]||'';
  const type=(sourceFile.type||inferredType).toLowerCase();
  const heic=type==='image/heic'||type==='image/heif'||ext==='heic'||ext==='heif';
  if(!['image/jpeg','image/png','image/webp'].includes(type)&&!heic)throw new Error('कृपया JPG, PNG या WEBP फोटो चुनें.');
  let output=sourceFile;
  if(!output.type&&inferredType&&!heic)output=new File([sourceFile],sourceFile.name||`faizmart-product.${ext}`,{type:inferredType,lastModified:sourceFile.lastModified||Date.now()});
  if(typeof createImageBitmap==='function'){
    let bitmap;
    try{bitmap=await createImageBitmap(sourceFile)}catch(e){if(heic)throw new Error('HEIC फोटो नहीं खुली. कृपया JPG फोटो चुनें.')}
    if(bitmap){
      const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('फोटो तैयार नहीं हो सकी.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.86));
      if(!blob)throw new Error('फोटो JPG में नहीं बदल सकी.');
      output=new File([blob],`faizmart-product-${Date.now()}.jpg`,{type:'image/jpeg',lastModified:Date.now()});
    }
  }else if(heic)throw new Error('इस browser में HEIC conversion उपलब्ध नहीं है. JPG फोटो चुनें.');
  else{
    const previewUrl=URL.createObjectURL(sourceFile);
    try{
      const image=new Image();image.src=previewUrl;
      if(typeof image.decode==='function')await image.decode();
      else await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('फोटो खुल नहीं सकी.'));});
      const scale=Math.min(1,1800/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('फोटो तैयार नहीं हो सकी.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.86));
      if(!blob)throw new Error('फोटो JPG में नहीं बदल सकी.');
      output=new File([blob],`faizmart-product-${Date.now()}.jpg`,{type:'image/jpeg',lastModified:Date.now()});
    }finally{URL.revokeObjectURL(previewUrl);}
  }
  if(output.size>6*1024*1024)throw new Error('फोटो 6 MB से बड़ी है. छोटी फोटो चुनें.');
  return output;
}
function showProductPhoto(file){
  state.selectedProductPhoto=file;
  if(state.selectedProductPhotoUrl){URL.revokeObjectURL(state.selectedProductPhotoUrl);state.selectedProductPhotoUrl=null;}
  const preview=document.querySelector('#product-preview');
  if(preview){const url=URL.createObjectURL(file);state.selectedProductPhotoUrl=url;preview.innerHTML=`<img alt="Product photo preview" style="max-width:180px;max-height:180px;object-fit:contain;border-radius:12px" src="${url}"><small>फोटो तैयार है.</small>`;}
  const out=document.querySelector('#product-msg');if(out)out.innerHTML=msg('फोटो चुन ली गई है. अब प्रोडक्ट सेव करें.','success');
}
async function pickProductPhoto(){
  try{
    const photo=await Camera.getPhoto({quality:86,allowEditing:false,resultType:CameraResultType.Uri,source:CameraSource.Photos,width:1800,height:1800,promptLabelHeader:'प्रोडक्ट की फोटो चुनें',promptLabelPhoto:'गैलरी से चुनें'});
    if(!photo?.webPath)throw new Error('गैलरी से फोटो नहीं मिली.');
    const response=await fetch(photo.webPath);if(!response.ok)throw new Error('चुनी हुई फोटो पढ़ी नहीं जा सकी.');
    const blob=await response.blob(),mime=blob.type?.startsWith('image/')?blob.type:(photo.format==='png'?'image/png':'image/jpeg');
    const source=new File([blob],`faizmart-gallery-${Date.now()}.${mime==='image/png'?'png':'jpg'}`,{type:mime,lastModified:Date.now()});
    showProductPhoto(await prepareProductImage(source));
  }catch(e){
    const cancelled=/cancel|canceled|cancelled/i.test(e?.message||'');
    if(!cancelled){const input=document.querySelector('#pfile'),out=document.querySelector('#product-msg');if(input){if(out)out.innerHTML=msg('गैलरी नहीं खुली. नीचे “फोन से फोटो चुनें” विकल्प इस्तेमाल करें.','info');input.click();}else if(out)out.innerHTML=msg('गैलरी नहीं खुली: '+(e.message||'दोबारा कोशिश करें.'),'error');}
  }
}
async function uploadProduct(file){
  if(!supabase||!state.user)throw new Error('पहले अपने खाते में Login करें.');
  if(!file)throw new Error('मोबाइल गैलरी से प्रोडक्ट की फोटो चुनें.');
  const imageLike=['image/jpeg','image/png','image/webp'].includes(file.type)||/\.(jpe?g|png|webp)$/i.test(file.name||'');
  if(!imageLike)throw new Error('कृपया JPG, PNG, WEBP फोटो चुनें.');
  if(file.size>6*1024*1024)throw new Error('फोटो 6 MB से छोटी रखें.');
  const safe=(file.name||'product-image').replace(/[^a-zA-Z0-9._-]/g,'_');
  const path=`${state.user.id}/${crypto.randomUUID()}-${safe}`;
  const ext=(safe.split('.').pop()||'').toLowerCase();
  const contentType=file.type||({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext]||'');
  if(!['image/jpeg','image/png','image/webp'].includes(contentType))throw new Error('फोटो JPG, PNG या WEBP format में रखें. HEIC फोटो को पहले JPG में बदलें.');
  const {error}=await supabase.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType});
  if(error){
    if(error.message?.toLowerCase().includes('row-level security')||error.statusCode==='403')throw new Error('फोटो स्टोरेज की अनुमति नहीं मिली. Seller approval और product-images Storage policy जाँचें.');
    throw new Error('फोटो ऑनलाइन अपलोड नहीं हुई: '+error.message);
  }
  return {url:supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl,path};
}
function sellerProductForm(product=null){const editing=!!product;return `<div class="card form" id="seller-product-editor"><h3>${editing?'प्रोडक्ट बदलें':'नया प्रोडक्ट जोड़ें'}</h3><input type="hidden" id="editing-product-id" value="${editing?esc(product.id):''}"><input type="hidden" id="editing-product-image" value="${editing?esc(product.image_url||''):''}"><label>प्रोडक्ट का नाम<input id="pname" required maxlength="120" placeholder="जैसे Ladies Kurti" value="${editing?esc(product.name||''):''}"></label><label>विवरण<textarea id="pdesc" maxlength="2000" placeholder="प्रोडक्ट की जानकारी">${editing?esc(product.description||''):''}</textarea></label><div class="grid two"><label>कैटेगरी<input id="pcat" required maxlength="80" placeholder="Ladies / Gents / Kids" value="${editing?esc(product.category||''):''}"></label><label>बेचने की कीमत (₹)<input id="pprice" type="number" min="1" step="0.01" required inputmode="decimal" placeholder="Selling price" value="${editing?esc(product.price):''}"></label></div><div class="grid two"><label>MRP (₹)<input id="pmrp" type="number" min="0" step="0.01" inputmode="decimal" placeholder="MRP (optional)" value="${editing?esc(product.mrp||''):''}"></label><label>स्टॉक<input id="pstock" type="number" min="0" step="1" required inputmode="numeric" value="${editing?esc(product.stock??1):'1'}"></label></div><label class="inline-check"><input id="pactive" type="checkbox" ${!editing||product.active?'checked':''}> बिक्री के लिए उपलब्ध</label><div class="gallery-picker"><button type="button" id="pick-gallery">📷 मोबाइल गैलरी से फोटो चुनें</button><small>नई फोटो चुनना जरूरी नहीं है; पुरानी फोटो बनी रहेगी. JPG, PNG, WEBP/HEIC फोटो चुनें.</small><label for="pfile">फोन से फोटो चुनें</label><input id="pfile" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"></div><div id="product-preview" class="product-upload-preview">${editing&&product.image_url?'<img src="'+esc(product.image_url)+'" alt="Product photo preview">':'<small>फोटो चुनने पर उसका preview यहाँ दिखेगा.</small>'}</div><button class="primary" id="save-product">${editing?'प्रोडक्ट अपडेट करें':'फोटो अपलोड करें और प्रोडक्ट सेव करें'}</button><div id="product-msg" aria-live="polite"></div></div>`}
function bindSellerProductForm(){
  document.querySelector('#save-product')?.addEventListener('click',saveSellerProduct);
  document.querySelector('#pick-gallery')?.addEventListener('click',pickProductPhoto);
  document.querySelector('#pfile')?.addEventListener('change',async event=>{
    const input=event.target,file=input.files?.[0],preview=document.querySelector('#product-preview');
    if(!file){state.selectedProductPhoto=null;return}
    if(preview)preview.innerHTML=msg('फोटो तैयार हो रही है…');
    try{showProductPhoto(await prepareProductImage(file))}
    catch(e){input.value='';state.selectedProductPhoto=null;if(preview)preview.innerHTML=msg(e.message||'फोटो पढ़ी नहीं जा सकी.','error')}
  });
}
async function saveSellerProduct(){
  const out=document.querySelector('#product-msg'),button=document.querySelector('#save-product');
  if(!out||!button)return;
  if(!supabase||!state.user){out.innerHTML=msg('पहले Login करें.','error');return}
  if(!state.seller||state.seller.status!=='approved'){out.innerHTML=msg('Admin approval के बाद ही प्रोडक्ट जोड़ा जा सकता है.','error');return}
  const editingId=document.querySelector('#editing-product-id')?.value||'';
  const name=document.querySelector('#pname').value.trim();
  const category=document.querySelector('#pcat').value.trim()||'General';
  const description=document.querySelector('#pdesc').value.trim();
  const price=Number(document.querySelector('#pprice').value);
  const mrp=Number(document.querySelector('#pmrp').value||0);
  const stock=Number(document.querySelector('#pstock').value);
  const active=!!document.querySelector('#pactive')?.checked;
  const file=state.selectedProductPhoto||document.querySelector('#pfile').files?.[0];
  let imageUrl=document.querySelector('#editing-product-image')?.value||'';
  if(!name){out.innerHTML=msg('प्रोडक्ट का नाम भरें.','error');return}
  if(!Number.isFinite(price)||price<=0){out.innerHTML=msg('बेचने की सही कीमत भरें.','error');return}
  if(!Number.isFinite(mrp)||mrp<0||(mrp>0&&mrp<price)){out.innerHTML=msg('MRP खाली छोड़ें या बेचने की कीमत के बराबर/अधिक रखें.','error');return}
  if(!Number.isInteger(stock)||stock<0){out.innerHTML=msg('स्टॉक 0 या उससे अधिक पूरा नंबर होना चाहिए.','error');return}
  if(!editingId&&!file){out.innerHTML=msg('नया प्रोडक्ट जोड़ने के लिए फोटो चुनें.','error');return}
  if(file&&!file.type.startsWith('image/')){out.innerHTML=msg('कृपया सही image file चुनें.','error');return}
  button.disabled=true;button.textContent=editingId?'अपडेट हो रहा है…':'अपलोड हो रहा है…';out.innerHTML=msg(file?'फोटो और प्रोडक्ट ऑनलाइन सेव हो रहे हैं.':'प्रोडक्ट ऑनलाइन अपडेट हो रहा है. कृपया इंतजार करें.');
  let uploadedPath=null;
  try{
    if(file){const uploaded=await uploadProduct(file);uploadedPath=uploaded.path;imageUrl=uploaded.url}
    if(!imageUrl)throw new Error('प्रोडक्ट की फोटो चुनें.');
    const row={name,description,category,price,mrp,stock,image_url:imageUrl,seller_id:state.seller.id,active,updated_at:new Date().toISOString()};
    const result=editingId
      ? await supabase.from('products').update(row).eq('id',Number(editingId)).eq('seller_id',state.seller.id).select('id,name').single()
      : await supabase.from('products').insert(row).select('id,name').single();
    if(result.error)throw new Error('प्रोडक्ट डेटाबेस में सेव नहीं हुआ: '+result.error.message);
    await loadProducts({renderAfter:false});
    state.selectedProductPhoto=null;
    if(state.selectedProductPhotoUrl){URL.revokeObjectURL(state.selectedProductPhotoUrl);state.selectedProductPhotoUrl=null;}
    document.querySelector('#pfile').value='';
    document.querySelector('#editing-product-image').value=imageUrl;
    out.innerHTML=msg((editingId?'प्रोडक्ट अपडेट हो गया.':'प्रोडक्ट और उसकी फोटो ऑनलाइन सेव हो गए.')+' प्रोडक्ट ID: '+result.data.id,'success');
  }catch(e){
    if(uploadedPath){const {error:removeError}=await supabase.storage.from('product-images').remove([uploadedPath]);if(removeError)console.warn('Uploaded image cleanup failed:',removeError.message)}
    out.innerHTML=msg(e.message||'प्रोडक्ट सेव नहीं हुआ. कृपया दोबारा कोशिश करें.','error');
  }finally{button.disabled=false;button.textContent=editingId?'प्रोडक्ट अपडेट करें':'फोटो अपलोड करें और प्रोडक्ट सेव करें'}
}
async function placeOrder(){
  const out=document.querySelector('#checkout-msg'),button=document.querySelector('#confirm-order');
  if(!out||!button||!supabase||!state.user){if(out)out.innerHTML=msg('Order करने के लिए पहले Login करें.','error');return}
  const payload={customer_name:document.querySelector('#cname').value.trim(),mobile:document.querySelector('#cmobile').value.trim(),address:document.querySelector('#caddress').value.trim(),city:document.querySelector('#ccity').value.trim(),state:document.querySelector('#cstate').value.trim(),pincode:document.querySelector('#cpincode').value.trim(),items:state.cart.map(p=>({product_id:Number(p.id),quantity:Number(p.qty||1)}))};
  const phoneDigits=payload.mobile.replace(/\D/g,'');
  if(!payload.customer_name||!payload.mobile||!payload.address){out.innerHTML=msg('नाम, मोबाइल और पूरा पता भरना जरूरी है.','error');return}
  if(phoneDigits.length!==10&&!(phoneDigits.length===12&&phoneDigits.startsWith('91'))){out.innerHTML=msg('10 अंकों का सही भारतीय मोबाइल नंबर भरें.','error');return}
  if(!/^\d{6}$/.test(payload.pincode)){out.innerHTML=msg('डिलीवरी के लिए 6 अंकों का पिनकोड भरें.','error');return}
  if(!payload.items.length){out.innerHTML=msg('आपका Cart खाली है.','error');return}
  button.disabled=true;button.textContent='Order सेव हो रहा है…';out.innerHTML=msg('आपका COD order ऑनलाइन सेव हो रहा है. कृपया इंतजार करें.');
  try{
    const {data,error}=await supabase.rpc('place_order',{payload});
    if(error)throw error;
    if(!data?.id)throw new Error('Order response नहीं मिला. Orders में जाँचें; दोबारा तुरंत order न करें.');
    const known=state.addresses.some(a=>String(a.full_name||'').trim()===payload.customer_name&&String(a.phone||'').trim()===payload.mobile&&String(a.address_line||'').trim()===payload.address&&String(a.pincode||'')===payload.pincode);
    if(!known){const {error:addressError}=await supabase.from('addresses').insert({user_id:state.user.id,full_name:payload.customer_name,phone:payload.mobile,address_line:payload.address,city:payload.city||null,state:payload.state||null,pincode:payload.pincode,is_default:state.addresses.length===0});if(!addressError){state.addresses.push({full_name:payload.customer_name,phone:payload.mobile,address_line:payload.address,city:payload.city,state:payload.state,pincode:payload.pincode,is_default:state.addresses.length===0})}else console.warn('Order placed but address was not saved:',addressError.message)}
    state.cart=[];saveCart();await loadProducts({renderAfter:false});await loadOrders();state.view='orders';render();
    const notice=document.querySelector('#orders-msg');if(notice)notice.innerHTML=msg(`Order ${data.order_number||data.order_no||''} सफलतापूर्वक दर्ज हुआ. कुल ${money(data.total)}.`,'success');
  }catch(e){out.innerHTML=msg(e.message||'Order नहीं हो पाया. कृपया दोबारा कोशिश करें.','error')}
  finally{const current=document.querySelector('#confirm-order');if(current){current.disabled=false;current.textContent='Confirm COD Order'}}
}
async function saveSettings(){const out=document.querySelector('#admin-msg');const rate=Number(document.querySelector('#commission').value),free=Number(document.querySelector('#free-delivery').value),flat=Number(document.querySelector('#flat-delivery').value),mode=document.querySelector('#delivery-mode').value,company=document.querySelector('#company-name').value.trim();
  if(rate<0||rate>100||free<0||flat<0){out.innerHTML=msg('Settings values सही भरें.','error');return}
  const {error}=await supabase.from('v50_delivery_settings').update({mode,flat_charge:flat,free_delivery_above:free,company_name:company,updated_at:new Date().toISOString()}).eq('id',1);if(error){out.innerHTML=msg(error.message,'error');return}
  const {error:commissionError}=await supabase.from('v50_store_settings').update({admin_commission_rate:rate,updated_at:new Date().toISOString()}).eq('id',1);if(commissionError){out.innerHTML=msg('Delivery saved, but commission setting failed: '+commissionError.message,'error');return}
  state.settings={...state.settings,commission:rate,freeDelivery:free,flatDelivery:flat,deliveryMode:mode,companyName:company};out.innerHTML=msg('Delivery and admin commission settings saved online. New seller registrations will use this commission rate.','success');
}
async function updateSellerStatus(id,status){const {error}=await supabase.from('sellers').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else{await loadAdmin();render()}}
async function updateOrderStatus(id,status){const {error}=await supabase.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else{await loadAdmin();render()}}
async function toggleWish(id){if(!state.user){state.view='auth';render();return}const existing=state.wishlist.has(String(id));if(existing){await supabase.from('wishlists').delete().eq('user_id',state.user.id).eq('product_id',Number(id));state.wishlist.delete(String(id));}else{const {error}=await supabase.from('wishlists').insert({user_id:state.user.id,product_id:Number(id)});if(!error)state.wishlist.add(String(id));}render()}

function bindPage(){
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.view=b.dataset.go;render()});
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;state.view='products';render()});
  document.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const p=state.products.find(x=>String(x.id)===String(b.dataset.id));if(!p)return;const found=state.cart.find(x=>String(x.id)===String(p.id));if(found){if(Number(found.qty||1)>=Number(p.stock||0)){alert('इस प्रोडक्ट का उपलब्ध स्टॉक इतना ही है.');return}found.qty=(found.qty||1)+1}else state.cart.push({...p,qty:1});saveCart();render()});
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.cart.splice(Number(b.dataset.remove),1);saveCart();render()});
  document.querySelectorAll('[data-qty]').forEach(b=>b.onchange=()=>{const i=Number(b.dataset.qty),item=state.cart[i],max=Math.max(1,Number(item?.stock)||1);state.cart[i].qty=Math.max(1,Math.min(max,99,Number(b.value)||1));saveCart();render()});
  document.querySelectorAll('[data-wish]').forEach(b=>b.onclick=()=>toggleWish(b.dataset.wish));
  const search=document.querySelector('#search');if(search)search.oninput=()=>{state.search=search.value;render();const el=document.querySelector('#search');el?.focus();el?.setSelectionRange(state.search.length,state.search.length)};
  const send=document.querySelector('#send-otp');if(send)send.onclick=async()=>{
    const email=document.querySelector('#auth-email').value.trim(),m=document.querySelector('#auth-msg');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){m.textContent='सही Gmail / Email address भरें.';return}
    state.otpEmail=email;send.disabled=true;m.textContent='OTP भेजा जा रहा है…';
    try{const e=await sendOtp(email);m.textContent=e?'OTP नहीं भेजा गया: '+e.message:'Email OTP भेजने का अनुरोध सफल हुआ. Inbox और Spam देखें.'}
    catch(e){m.textContent='Email OTP error: '+(e.message||'कृपया दोबारा कोशिश करें.')}
    finally{send.disabled=false}
  };
  const verify=document.querySelector('#verify-otp');if(verify)verify.onclick=async()=>{
    const token=document.querySelector('#auth-otp').value.trim(),m=document.querySelector('#auth-msg');
    if(!/^\d{6}$/.test(token)){m.textContent='6 अंकों का OTP भरें.';return}
    if(!state.otpEmail){m.textContent='पहले Email OTP भेजें.';return}
    verify.disabled=true;
    try{const e=await verifyOtp(state.otpEmail,token);m.textContent=e?'OTP verify नहीं हुआ: '+e.message:'Email verified.';if(!e)render()}
    catch(e){m.textContent='Verification error: '+(e.message||'OTP दोबारा जाँचें.')}
    finally{verify.disabled=false}
  };
  const sendPhone=document.querySelector('#send-phone-otp');if(sendPhone)sendPhone.onclick=async()=>{
    const m=document.querySelector('#phone-auth-msg');
    try{state.otpPhone=normalizeIndianPhone(document.querySelector('#auth-phone').value);sendPhone.disabled=true;m.textContent='SMS OTP भेजा जा रहा है…';const e=await sendPhoneOtp(state.otpPhone);m.textContent=e?'SMS OTP नहीं भेजा गया: '+e.message:'SMS OTP भेजने का अनुरोध सफल हुआ. Messages देखें.'}
    catch(e){const detail=String(e?.message||'');m.textContent=/phone_provider_disabled|unsupported phone provider/i.test(detail)?'मोबाइल OTP अभी चालू नहीं है: Supabase में SMS provider (जैसे Twilio) जोड़ना बाकी है. Provider सेट होने तक SMS नहीं आएगा.':'Mobile OTP error: '+(detail||'SMS provider settings जाँचें.')}
    finally{sendPhone.disabled=false}
  };
  const verifyPhone=document.querySelector('#verify-phone-otp');if(verifyPhone)verifyPhone.onclick=async()=>{
    const m=document.querySelector('#phone-auth-msg'),token=document.querySelector('#auth-phone-otp').value.trim();
    if(!/^\d{6}$/.test(token)){m.textContent='6 अंकों का SMS OTP भरें.';return}
    if(!state.otpPhone){m.textContent='पहले Mobile OTP भेजें.';return}
    verifyPhone.disabled=true;
    try{const e=await verifyPhoneOtp(state.otpPhone,token);m.textContent=e?'Mobile OTP verify नहीं हुआ: '+e.message:'Mobile number verified.';if(!e)render()}
    catch(e){m.textContent='Mobile verification error: '+(e.message||'OTP दोबारा जाँचें.')}
    finally{verifyPhone.disabled=false}
  };
  document.querySelector('#logout')?.addEventListener('click',async()=>{await supabase.auth.signOut();state.user=null;state.session=null;state.profile=null;state.seller=null;state.isAdmin=false;render()});
  document.querySelector('#seller-register')?.addEventListener('click',registerSeller);
  document.querySelector('[data-action="add-product"]')?.addEventListener('click',()=>{
    const area=document.querySelector('#seller-area');area.innerHTML=sellerProductForm();bindSellerProductForm();
  });
  document.querySelector('[data-action="seller-products"]')?.addEventListener('click',async()=>{
    const area=document.querySelector('#seller-area');area.innerHTML='<div class="card"><p>आपके प्रोडक्ट लोड हो रहे हैं…</p></div>';
    try{
      const {data,error}=await supabase.from('products').select('*').eq('seller_id',state.seller.id).order('created_at',{ascending:false});
      if(error)throw error;
      area.innerHTML=`<div class="card"><h3>मेरे प्रोडक्ट (${(data||[]).length})</h3>${(data||[]).map(p=>`<div class="list-row seller-product-row"><img src="${esc(p.image_url||'assets/logo-placeholder.svg')}" onerror="this.src='assets/logo-placeholder.svg'" alt="${esc(p.name)}" style="width:64px;height:64px;object-fit:contain;border-radius:10px;background:#f4f4f5"><span><b>${esc(p.name)}</b><small>${esc(p.category||'General')} • Stock: ${Number(p.stock)||0} • ${p.active?'Active':'Hidden'}</small></span><b>${money(p.price)}</b><button type="button" data-edit-product="${esc(p.id)}">Edit</button></div>`).join('')||'<p>अभी कोई प्रोडक्ट नहीं जोड़ा गया है. ऊपर Add Product दबाकर पहला प्रोडक्ट जोड़ें.</p>'}</div>`;
      area.querySelectorAll('[data-edit-product]').forEach(button=>button.addEventListener('click',()=>{
        const product=(data||[]).find(item=>String(item.id)===button.dataset.editProduct);if(!product)return;
        area.querySelector('#seller-product-editor')?.remove();area.insertAdjacentHTML('beforeend',sellerProductForm(product));bindSellerProductForm();
      }));
    }catch(e){area.innerHTML=`<div class="card">${msg('प्रोडक्ट सूची नहीं खुली: '+(e.message||'कृपया दोबारा कोशिश करें.'),'error')}</div>`}
  });
  document.querySelector('[data-action="seller-orders"]')?.addEventListener('click',async()=>{const {data}=await supabase.from('order_items').select('order_id,product_name,qty,price,seller_id,orders(order_no,status,created_at)').eq('seller_id',state.seller.id).order('id',{ascending:false});document.querySelector('#seller-area').innerHTML=`<div class="card"><h3>My Orders</h3>${(data||[]).map(x=>`<div class="list-row"><span><b>${esc(x.orders?.order_no||x.order_id)}</b><small>${esc(x.product_name)} × ${x.qty} • ${esc(x.orders?.status||'')}</small></span><b>${money(Number(x.price)*Number(x.qty))}</b></div>`).join('')||'<p>No seller orders.</p>'}</div>`});
  document.querySelector('[data-action="seller-earnings"]')?.addEventListener('click',async()=>{const {data}=await supabase.from('seller_payouts').select('*').eq('seller_id',state.seller.id).order('created_at',{ascending:false});const gross=(data||[]).reduce((s,x)=>s+Number(x.gross_amount||0),0),comm=(data||[]).reduce((s,x)=>s+Number(x.commission_amount||0),0),net=(data||[]).reduce((s,x)=>s+Number(x.net_amount||0),0);document.querySelector('#seller-area').innerHTML=`<div class="grid stats"><div class="stat"><span>Gross</span><b>${money(gross)}</b></div><div class="stat"><span>Commission</span><b>${money(comm)}</b></div><div class="stat"><span>Seller Net</span><b>${money(net)}</b></div></div>`});
  document.querySelector('#save-settings')?.addEventListener('click',saveSettings);
  document.querySelectorAll('[data-seller-status]').forEach(x=>x.onchange=()=>updateSellerStatus(x.dataset.sellerStatus,x.value));
  document.querySelectorAll('[data-order-status]').forEach(x=>x.onchange=()=>updateOrderStatus(x.dataset.orderStatus,x.value));
  document.querySelector('#checkout')?.addEventListener('click',()=>{if(!state.user){state.view='auth';render();return}document.querySelector('#cart-msg').insertAdjacentHTML('beforeend',checkoutForm());document.querySelector('#confirm-order').onclick=placeOrder;document.querySelector('#cancel-checkout').onclick=()=>document.querySelector('#checkout-form')?.remove()});
  document.querySelector('#refresh-orders')?.addEventListener('click',async()=>{await loadOrders();render()});
}

if(supabase){
  let lastHydratedUserId=null;
  supabase.auth.onAuthStateChange((_event,session)=>{
    state.session=session||null;
    state.user=session?.user||null;
    const userId=state.user?.id||null;
    if(!userId){
      lastHydratedUserId=null;
      state.profile=null;state.seller=null;state.isAdmin=false;
      state.addresses=[];state.orders=[];state.wishlist=new Set();
      state.adminOrders=[];state.adminSellers=[];state.adminCommissions=[];
      render();
      return;
    }
    if(lastHydratedUserId===userId){render();return}
    lastHydratedUserId=userId;
    state.profile=null;state.seller=null;state.isAdmin=false;
    state.addresses=[];state.orders=[];state.wishlist=new Set();
    setTimeout(async()=>{
      try{await hydrateUser()}
      catch(error){
        lastHydratedUserId=null;
        state.backendError='Login हो गया, लेकिन account data लोड नहीं हुआ: '+(error?.message||'कृपया दोबारा कोशिश करें.');
      }
      render();
    },0);
  });
}
render();loadProducts();
