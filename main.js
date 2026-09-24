import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const state = {
  view: 'home', products: [], categories: [], cart: [], user: null, session: null,
  profile: null, seller: null, isAdmin: false, message: '', otpEmail: '',
  search: '', category: '', wishlist: new Set(), addresses: [], orders: [],
  settings: { commission: 10, freeDelivery: 499, flatDelivery: 40, deliveryMode: 'flat', companyName: '' },
  adminOrders: [], adminSellers: [], adminCommissions: []
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
  root.innerHTML = `<header><div class="topbar"><div class="brand">FAIZMART INDIA SHOPPING</div><button class="menu" id="menu">☰</button></div>
    <nav id="nav"><button data-nav="home">Home</button><button data-nav="products">Products</button><button data-nav="orders">My Orders</button><button data-nav="seller">Seller Panel</button><button data-nav="admin">Admin</button><button data-nav="cart">Cart (${state.cart.reduce((n,p)=>n+(p.qty||1),0)})</button><button data-nav="auth">${state.user?'Account':'Login'}</button></nav></header>
    <main>${page()}</main><footer>FAIZMART INDIA SHOPPING • Online marketplace</footer>`;
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
  return `<section class="hero"><div><span class="pill">${live?'LIVE ONLINE STORE':'ONLINE SHOPPING'}</span><h1>FAIZMART INDIA SHOPPING</h1><p>Customers shop online, sellers manage products, and admin controls the marketplace from one system.</p><button class="primary" data-go="products">Start Shopping</button></div><div class="hero-card"><b>10%</b><span>Default admin commission</span><small>Saved online when configured</small></div></section>
  <section><div class="section-head"><div><h2>Shop by Category</h2><p>Start with Ladies, Gents and Kids; more categories can be added.</p></div></div><div class="chips">${state.categories.map(c=>`<button data-cat="${esc(c.name)}">${esc(c.icon||'🛍️')} ${esc(c.name)}</button>`).join('')||['Ladies','Gents','Kids','Home & Kitchen','Electronics'].map(c=>`<button data-cat="${c}">${c}</button>`).join('')}</div></section>
  <section><h2>Marketplace Features</h2><div class="grid cards">${['Email OTP customer login','Seller onboarding + approval','Gallery image upload','Online cart + COD order','10% commission calculation','Delivery charge rules','Addresses + wishlist','Order tracking + status'].map(x=>`<div class="card"><b>${x}</b><p>Connected to the online project where permissions allow.</p></div>`).join('')}</div></section>`;
}
function products(){
  const list = (state.products.length?state.products:demoProducts).filter(p=>!state.category || p.category===state.category || p.category?.toLowerCase()===state.category.toLowerCase()).filter(p=>!state.search || `${p.name} ${p.category} ${p.description||''}`.toLowerCase().includes(state.search.toLowerCase()));
  return `<section><div class="section-head"><div><h2>Products</h2><p>${ready()?'Live online catalog':'Demo catalog — connect Supabase to use real data.'}</p></div><input id="search" value="${esc(state.search)}" placeholder="Search products..."></div><div class="chips"><button data-cat="">All</button>${state.categories.map(c=>`<button data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</div><div class="grid products">${list.map(productCard).join('')||'<div class="card"><h3>No products found</h3><p>Try another search or category.</p></div>'}</div></section>`;
}
function productCard(p){
  const wished = state.wishlist.has(String(p.id));
  return `<article class="product"><div class="image-wrap"><img src="${esc(p.image_url||'assets/logo-placeholder.svg')}" onerror="this.src='assets/logo-placeholder.svg'"><button class="heart" data-wish="${esc(p.id)}">${wished?'♥':'♡'}</button></div><div class="pbody"><span>${esc(p.category||'General')}</span><h3>${esc(p.name)}</h3><div><strong>${money(p.price)}</strong>${p.mrp?` <del>${money(p.mrp)}</del>`:''}</div><small>Stock: ${p.stock??0}</small><button class="primary add" data-id="${esc(p.id)}" ${Number(p.stock||0)<=0?'disabled':''}>Add to cart</button></div></article>`;
}
function auth(){
  if(state.user) return `<section class="panel"><h2>My Account</h2>${msg(`Logged in as ${state.user.email||'customer'}`,'success')}<div class="grid two"><div class="card"><h3>Profile</h3><p>Role: <b>${esc(state.profile?.role||'customer')}</b></p><button id="logout">Logout</button></div><div class="card"><h3>Quick Links</h3><button data-go="orders">My Orders</button><button data-go="seller">Seller Panel</button><button data-go="cart">Cart</button></div></div></section>`;
  return `<section class="panel"><h2>Email OTP Login</h2><p>Gmail/email पर 6-digit OTP भेजकर login करें.</p><div class="card form"><input id="auth-email" type="email" placeholder="Gmail / Email" value="${esc(state.otpEmail)}"><button class="primary" id="send-otp" ${ready()?'':'disabled'}>Send OTP</button><div class="otp-row"><input id="auth-otp" inputmode="numeric" maxlength="6" placeholder="6-digit OTP"><button id="verify-otp" ${ready()?'':'disabled'}>Verify OTP</button></div><div id="auth-msg">${ready()?'':'Supabase connection settings are missing.'}</div></div></section>`;
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
  <div class="grid two"><div class="card"><h3>Marketplace Settings</h3><label>Commission %<input id="commission" type="number" min="0" max="100" value="${state.settings.commission}"></label><label>Free delivery above ₹<input id="free-delivery" type="number" min="0" value="${state.settings.freeDelivery}"></label><label>Flat delivery ₹<input id="flat-delivery" type="number" min="0" value="${state.settings.flatDelivery}"></label><label>Delivery mode<select id="delivery-mode"><option value="flat" ${state.settings.deliveryMode==='flat'?'selected':''}>Flat</option><option value="distance" ${state.settings.deliveryMode==='distance'?'selected':''}>Distance</option><option value="weight" ${state.settings.deliveryMode==='weight'?'selected':''}>Weight</option><option value="company" ${state.settings.deliveryMode==='company'?'selected':''}>Company</option></select></label><label>Courier/company name<input id="company-name" value="${esc(state.settings.companyName)}"></label><button class="primary" id="save-settings">Save Online</button><div id="admin-msg"></div></div>
  <div class="card"><h3>Seller Management</h3><div id="seller-list">${state.adminSellers.map(s=>`<div class="list-row"><span><b>${esc(s.business_name||'Shop')}</b><small>${esc(s.email||'')} • ${esc(s.status)}</small></span><select data-seller-status="${s.id}"><option ${s.status==='pending'?'selected':''}>pending</option><option ${s.status==='approved'?'selected':''}>approved</option><option ${s.status==='suspended'?'selected':''}>suspended</option></select></div>`).join('')||'<p>No sellers yet.</p>'}</div></div></div>
  <div class="card"><h3>Recent Orders</h3>${state.adminOrders.slice(0,20).map(adminOrderRow).join('')||'<p>No orders yet.</p>'}</div><div class="card"><h3>Commission Ledger</h3>${state.adminCommissions.slice(0,30).map(c=>`<div class="list-row"><span>Order item ${esc(c.order_item_id)}<small>${esc(c.status)}</small></span><b>${money(c.commission_amount)}</b></div>`).join('')||'<p>Commission ledger will fill when eligible seller orders are placed.</p>'}</div></section>`;
}
function adminOrderRow(o){return `<div class="list-row"><span><b>${esc(o.order_no)}</b><small>${esc(o.customer_name||'')} • ${esc(o.phone||'')} • ${esc(o.payment_method||'COD')}</small></span><span><b>${money(o.total)}</b><select data-order-status="${o.id}"><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='Processing'?'selected':''}>Processing</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select></span></div>`}
function cart(){
  const subtotal=state.cart.reduce((s,p)=>s+Number(p.price)*Number(p.qty||1),0); const delivery=subtotal>=Number(state.settings.freeDelivery)?0:Number(state.settings.flatDelivery); const total=subtotal+delivery;
  return `<section class="panel"><h2>Your Cart</h2>${state.cart.length?state.cart.map((p,i)=>`<div class="cart-row"><img src="${esc(p.image_url||'assets/logo-placeholder.svg')}"><span><b>${esc(p.name)}</b><small>${money(p.price)} each</small></span><input data-qty="${i}" type="number" min="1" max="99" value="${p.qty||1}"><b>${money(Number(p.price)*(p.qty||1))}</b><button data-remove="${i}">Remove</button></div>`).join(''):'<p>Your cart is empty.</p>'}<hr><div class="summary"><span>Subtotal</span><b>${money(subtotal)}</b><span>Delivery</span><b>${money(delivery)}</b><span>Total</span><b>${money(total)}</b></div>${state.cart.length?`<button class="primary" id="checkout">Checkout / COD Order</button>`:''}<div id="cart-msg"></div></section>`;
}
function checkoutForm(){return `<div class="card form" id="checkout-form"><h3>Delivery Address</h3><input id="cname" placeholder="Full name" value="${esc(state.profile?.full_name||'')}"><input id="cmobile" placeholder="Mobile number" value="${esc(state.profile?.mobile||'')}"><textarea id="caddress" placeholder="House / street / area"></textarea><div class="grid two"><input id="ccity" placeholder="City"><input id="cstate" placeholder="State"></div><input id="cpincode" inputmode="numeric" placeholder="Pincode"><button class="primary" id="confirm-order">Confirm COD Order</button><button id="cancel-checkout">Cancel</button><div id="checkout-msg"></div></div>`}
function orders(){
  if(!state.user) return `<section class="panel"><h2>My Orders</h2>${msg('पहले login करें.')}<button class="primary" data-go="auth">Login</button></section>`;
  return `<section class="panel"><div class="section-head"><div><h2>My Orders</h2><p>आपके online orders और status.</p></div><button id="refresh-orders">Refresh</button></div>${state.orders.map(o=>`<div class="order-card"><div><b>${esc(o.order_no)}</b><span>${esc(o.status)}</span></div><p>${esc(o.address||'')} • ${esc(o.city||'')} ${esc(o.pincode||'')}</p><strong>${money(o.total)}</strong></div>`).join('')||'<p>No orders found.</p>'}</section>`;
}

async function sendOtp(email){const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});return error}
async function verifyOtp(email,token){const {data,error}=await supabase.auth.verifyOtp({email,token,type:'email'});if(!error){state.session=data.session;state.user=data.user;await hydrateUser()}return error}
async function hydrateUser(){
  if(!supabase||!state.user)return;
  const [{data:profile},{data:seller},{data:addrs}] = await Promise.all([
    supabase.from('profiles').select('*').eq('id',state.user.id).maybeSingle(),
    supabase.from('sellers').select('*').eq('user_id',state.user.id).maybeSingle(),
    supabase.from('addresses').select('*').eq('user_id',state.user.id).order('created_at',{ascending:false})
  ]);
  state.profile=profile; state.seller=seller; state.addresses=addrs||[];
  const {data:isAdmin}=await supabase.rpc('is_admin'); state.isAdmin=!!isAdmin;
  if(state.isAdmin) await loadAdmin();
  await loadWishlist(); await loadOrders();
}
async function loadProducts(){if(!supabase){render();return}const [{data:p},{data:c},{data:s}] = await Promise.all([
  supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:false}),
  supabase.from('categories').select('*').eq('active',true).order('name'),
  supabase.from('store_settings').select('*').maybeSingle()
]); state.products=p||[];state.categories=c||[];
  if(s) state.settings={...state.settings,freeDelivery:Number(s.free_delivery_threshold||state.settings.freeDelivery)};
  const {data:d}=await supabase.from('v50_delivery_settings').select('*').maybeSingle(); if(d)state.settings={...state.settings,freeDelivery:Number(d.free_delivery_above),flatDelivery:Number(d.flat_charge),deliveryMode:d.mode,companyName:d.company_name||''};
  render();
}
async function loadWishlist(){if(!supabase||!state.user)return;const {data}=await supabase.from('wishlists').select('product_id').eq('user_id',state.user.id);state.wishlist=new Set((data||[]).map(x=>String(x.product_id)));}
async function loadOrders(){if(!supabase||!state.user)return;const {data}=await supabase.from('orders').select('*').eq('user_id',state.user.id).order('created_at',{ascending:false});state.orders=data||[];}
async function loadAdmin(){
  if(!state.isAdmin)return;
  const [{data:orders},{data:sellers},{data:comm}]=await Promise.all([
    supabase.from('orders').select('*').order('created_at',{ascending:false}),
    supabase.from('sellers').select('*').order('created_at',{ascending:false}),
    supabase.from('v50_admin_commissions').select('*').order('created_at',{ascending:false})
  ]); state.adminOrders=orders||[];state.adminSellers=sellers||[];state.adminCommissions=comm||[];
}
async function registerSeller(){
  const data={business_name:document.querySelector('#shop').value.trim(),owner_name:document.querySelector('#owner').value.trim(),phone:document.querySelector('#smobile').value.trim(),email:document.querySelector('#semail').value.trim()}; const out=document.querySelector('#seller-msg');
  if(!data.business_name){out.innerHTML=msg('Shop/business name जरूरी है.','error');return}
  const {error}=await supabase.rpc('register_seller',{payload:data}); out.innerHTML=error?msg(error.message,'error'):msg('Seller application saved. Admin approval के बाद product listing चालू होगी.','success'); if(!error){await hydrateUser();render()}
}
async function uploadProduct(file){if(!supabase||!state.user)throw new Error('Login first.');if(!file?.type.startsWith('image/'))throw new Error('Only image files are allowed.');if(file.size>6*1024*1024)throw new Error('Image 6 MB से छोटी रखें.');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${state.user.id}/${crypto.randomUUID()}-${safe}`;const {error}=await supabase.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(error)throw error;return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;}
function sellerProductForm(){return `<div class="card form"><h3>Add Product</h3><input id="pname" placeholder="Product name"><textarea id="pdesc" placeholder="Description"></textarea><div class="grid two"><input id="pcat" placeholder="Category"><input id="pprice" type="number" min="0" placeholder="Selling price"></div><div class="grid two"><input id="pmrp" type="number" min="0" placeholder="MRP"><input id="pstock" type="number" min="0" placeholder="Stock"></div><label class="file">Product photo <input id="pfile" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary" id="save-product">Upload & Save Product</button><div id="product-msg"></div></div>`}
async function saveSellerProduct(){
  const out=document.querySelector('#product-msg'); if(!state.seller||state.seller.status!=='approved'){out.innerHTML=msg('Seller approval required.','error');return}
  try{const file=document.querySelector('#pfile').files[0];const image_url=await uploadProduct(file);const row={name:document.querySelector('#pname').value.trim(),description:document.querySelector('#pdesc').value.trim(),category:document.querySelector('#pcat').value.trim()||'General',price:Number(document.querySelector('#pprice').value),mrp:Number(document.querySelector('#pmrp').value||0),stock:Number(document.querySelector('#pstock').value||0),image_url,seller_id:state.seller.id,active:true};if(!row.name||!row.price){throw new Error('Name और price जरूरी हैं.')}const {error}=await supabase.from('products').insert(row);if(error)throw error;out.innerHTML=msg('Product uploaded and saved online.','success');await loadProducts();}
  catch(e){out.innerHTML=msg(e.message||'Upload failed.','error')}
}
async function placeOrder(){
  const out=document.querySelector('#checkout-msg');const payload={customer_name:document.querySelector('#cname').value.trim(),mobile:document.querySelector('#cmobile').value.trim(),address:document.querySelector('#caddress').value.trim(),city:document.querySelector('#ccity').value.trim(),state:document.querySelector('#cstate').value.trim(),pincode:document.querySelector('#cpincode').value.trim(),items:state.cart.map(p=>({product_id:Number(p.id),quantity:Number(p.qty||1)}))};
  if(!payload.customer_name||!payload.mobile||!payload.address){out.innerHTML=msg('Name, mobile और address जरूरी हैं.','error');return}
  const {data,error}=await supabase.rpc('place_order',{payload}); if(error){out.innerHTML=msg(error.message,'error');return}
  state.cart=[];await loadProducts();await loadOrders();document.querySelector('#cart-msg').innerHTML=msg(`Order ${data.order_number||data.order_no||''} placed. Total ${money(data.total)}.`,`success`);render();
}
async function saveSettings(){const out=document.querySelector('#admin-msg');const rate=Number(document.querySelector('#commission').value),free=Number(document.querySelector('#free-delivery').value),flat=Number(document.querySelector('#flat-delivery').value),mode=document.querySelector('#delivery-mode').value,company=document.querySelector('#company-name').value.trim();
  if(rate<0||rate>100||free<0||flat<0){out.innerHTML=msg('Settings values सही भरें.','error');return}
  const {error}=await supabase.from('v50_delivery_settings').update({mode,flat_charge:flat,free_delivery_above:free,company_name:company,updated_at:new Date().toISOString()}).eq('id',1);if(error){out.innerHTML=msg(error.message,'error');return}
  const s=await supabase.from('store_settings').update({updated_at:new Date().toISOString()}).eq('id',1); // legacy store setting is retained; delivery values are authoritative here.
  state.settings={...state.settings,commission:rate,freeDelivery:free,flatDelivery:flat,deliveryMode:mode,companyName:company};out.innerHTML=msg('Delivery settings saved online. Commission rate is displayed for future seller settlements.','success');
}
async function updateSellerStatus(id,status){const {error}=await supabase.from('sellers').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else{await loadAdmin();render()}}
async function updateOrderStatus(id,status){const {error}=await supabase.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else{await loadAdmin();render()}}
async function toggleWish(id){if(!state.user){state.view='auth';render();return}const existing=state.wishlist.has(String(id));if(existing){await supabase.from('wishlists').delete().eq('user_id',state.user.id).eq('product_id',Number(id));state.wishlist.delete(String(id));}else{const {error}=await supabase.from('wishlists').insert({user_id:state.user.id,product_id:Number(id)});if(!error)state.wishlist.add(String(id));}render()}

function bindPage(){
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.view=b.dataset.go;render()});
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;state.view='products';render()});
  document.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const p=[...state.products,...demoProducts].find(x=>String(x.id)===String(b.dataset.id));if(!p)return;const found=state.cart.find(x=>String(x.id)===String(p.id));if(found)found.qty=(found.qty||1)+1;else state.cart.push({...p,qty:1});render()});
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.cart.splice(Number(b.dataset.remove),1);render()});
  document.querySelectorAll('[data-qty]').forEach(b=>b.onchange=()=>{const i=Number(b.dataset.qty);state.cart[i].qty=Math.max(1,Math.min(99,Number(b.value)||1));render()});
  document.querySelectorAll('[data-wish]').forEach(b=>b.onclick=()=>toggleWish(b.dataset.wish));
  const search=document.querySelector('#search');if(search)search.oninput=()=>{state.search=search.value;render();const el=document.querySelector('#search');el?.focus();el?.setSelectionRange(state.search.length,state.search.length)};
  const send=document.querySelector('#send-otp');if(send)send.onclick=async()=>{const email=document.querySelector('#auth-email').value.trim(),m=document.querySelector('#auth-msg');if(!email){m.textContent='Email required.';return}state.otpEmail=email;send.disabled=true;const e=await sendOtp(email);m.textContent=e?e.message:'OTP sent. Inbox/Spam check करें.';send.disabled=false};
  const verify=document.querySelector('#verify-otp');if(verify)verify.onclick=async()=>{const token=document.querySelector('#auth-otp').value.trim(),m=document.querySelector('#auth-msg');const e=await verifyOtp(state.otpEmail,token);m.textContent=e?e.message:'Verified.';if(!e)render()};
  document.querySelector('#logout')?.addEventListener('click',async()=>{await supabase.auth.signOut();state.user=null;state.session=null;state.profile=null;state.seller=null;state.isAdmin=false;render()});
  document.querySelector('#seller-register')?.addEventListener('click',registerSeller);
  document.querySelector('[data-action="add-product"]')?.addEventListener('click',()=>{document.querySelector('#seller-area').innerHTML=sellerProductForm();document.querySelector('#save-product').onclick=saveSellerProduct});
  document.querySelector('[data-action="seller-products"]')?.addEventListener('click',async()=>{const {data}=await supabase.from('products').select('*').eq('seller_id',state.seller.id).order('created_at',{ascending:false});document.querySelector('#seller-area').innerHTML=`<div class="card"><h3>My Products</h3>${(data||[]).map(p=>`<div class="list-row"><span><b>${esc(p.name)}</b><small>${esc(p.category)} • Stock ${p.stock}</small></span><b>${money(p.price)}</b></div>`).join('')||'<p>No products.</p>'}</div>`});
  document.querySelector('[data-action="seller-orders"]')?.addEventListener('click',async()=>{const {data}=await supabase.from('order_items').select('order_id,product_name,qty,price,seller_id,orders(order_no,status,created_at)').eq('seller_id',state.seller.id).order('id',{ascending:false});document.querySelector('#seller-area').innerHTML=`<div class="card"><h3>My Orders</h3>${(data||[]).map(x=>`<div class="list-row"><span><b>${esc(x.orders?.order_no||x.order_id)}</b><small>${esc(x.product_name)} × ${x.qty} • ${esc(x.orders?.status||'')}</small></span><b>${money(Number(x.price)*Number(x.qty))}</b></div>`).join('')||'<p>No seller orders.</p>'}</div>`});
  document.querySelector('[data-action="seller-earnings"]')?.addEventListener('click',async()=>{const {data}=await supabase.from('seller_payouts').select('*').eq('seller_id',state.seller.id).order('created_at',{ascending:false});const gross=(data||[]).reduce((s,x)=>s+Number(x.gross_amount||0),0),comm=(data||[]).reduce((s,x)=>s+Number(x.commission_amount||0),0),net=(data||[]).reduce((s,x)=>s+Number(x.net_amount||0),0);document.querySelector('#seller-area').innerHTML=`<div class="grid stats"><div class="stat"><span>Gross</span><b>${money(gross)}</b></div><div class="stat"><span>Commission</span><b>${money(comm)}</b></div><div class="stat"><span>Seller Net</span><b>${money(net)}</b></div></div>`});
  document.querySelector('#save-settings')?.addEventListener('click',saveSettings);
  document.querySelectorAll('[data-seller-status]').forEach(x=>x.onchange=()=>updateSellerStatus(x.dataset.sellerStatus,x.value));
  document.querySelectorAll('[data-order-status]').forEach(x=>x.onchange=()=>updateOrderStatus(x.dataset.orderStatus,x.value));
  document.querySelector('#checkout')?.addEventListener('click',()=>{if(!state.user){state.view='auth';render();return}document.querySelector('#cart-msg').insertAdjacentHTML('beforeend',checkoutForm());document.querySelector('#confirm-order').onclick=placeOrder;document.querySelector('#cancel-checkout').onclick=()=>document.querySelector('#checkout-form')?.remove()});
  document.querySelector('#refresh-orders')?.addEventListener('click',async()=>{await loadOrders();render()});
}

if(supabase){supabase.auth.getSession().then(async({data})=>{state.session=data.session;state.user=data.session?.user||null;if(state.user)await hydrateUser();render()});supabase.auth.onAuthStateChange(async(_e,s)=>{state.session=s;state.user=s?.user||null;if(state.user)await hydrateUser();render()})}
render();loadProducts();
