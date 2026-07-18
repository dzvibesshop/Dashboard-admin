/* app.js */

/* ══════════════════════════════════════════════════════════════════════════
   ① SECURITY GATEWAY
   ══════════════════════════════════════════════════════════════════════════ */
const SECRET_PIN = "Dz.Vibes.0107@";

if (localStorage.getItem('admin_authenticated') !== 'true') {
  const userPin = prompt("🔒 يرجى إدخال الرمز السري للوحة التحكم:");
  if (userPin === SECRET_PIN) {
    localStorage.setItem('admin_authenticated', 'true');
  } else {
    alert("❌ رمز خاطئ! وصول مرفوض.");
    window.location.href = "https://google.com";
    throw new Error("Access Denied"); // Stop execution
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('admin_authenticated');
  window.location.reload();
});

/* ══════════════════════════════════════════════════════════════════════════
   ② SUPABASE CONFIG
   ══════════════════════════════════════════════════════════════════════════ */
const SUPABASE_URL      = 'https://kbyjyfmifsufxbmhnwnq.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_xZPIAOb59rGWmUvnI__Pyw_ijtSFRwo';
const supabaseClient    = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ══════════════════════════════════════════════════════════════════════════
   ③ UTILS & TOAST
   ══════════════════════════════════════════════════════════════════════════ */
let toastTimeout;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-lg transition-all z-50 text-white ${
    type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  }`;

  setTimeout(() => {
    toast.classList.remove('-translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-20', 'opacity-0');
  }, 3000);
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

function formatPrice(value) {
  const r = Math.round((parseFloat(value) || 0) * 100) / 100;
  return r % 1 === 0 ? r.toString() : r.toFixed(2);
}

/* ══════════════════════════════════════════════════════════════════════════
   ④ SIDEBAR TABS TOGGLING
   ══════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.sidebar-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active', 'text-white', 'bg-red-600'));
    tab.classList.add('active', 'text-white');

    document.querySelectorAll('.tab-content').forEach(sec => {
      sec.classList.remove('block');
      sec.classList.add('hidden');
    });

    const targetId = tab.dataset.target;
    const targetEl = document.getElementById(targetId);
    targetEl.classList.remove('hidden');
    targetEl.classList.add('block');
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑤ PRODUCTS MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */
let productsData = [];
let currentVariations = [];

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  const loader = document.getElementById('products-loader');

  grid.classList.add('hidden');
  loader.classList.remove('hidden');
  loader.innerHTML = Array(8).fill(`
    <div class="skeleton-card h-80">
      <div class="skeleton-image skeleton-shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w-80 skeleton-shimmer"></div>
        <div class="skeleton-line w-55 skeleton-shimmer"></div>
        <div class="skeleton-btn-row">
          <div class="skeleton-btn skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  `).join('');

  // ✅ تم إزالة .eq('is_available', true) — يجلب جميع المنتجات
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    showToast('خطأ في جلب المنتجات: ' + error.message, 'error');
    return;
  }

  productsData = data || [];
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const loader = document.getElementById('products-loader');

  loader.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = '';

  if (productsData.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-500 font-bold">
        لا توجد منتجات حالياً.
      </div>`;
    return;
  }

  productsData.forEach(row => {
    let meta = {};
    let desc = row.description || '';
    if (desc.startsWith('__meta__')) {
      const newline = desc.indexOf('\n');
      try {
        const jsonStr = newline === -1 ? desc.slice(8) : desc.slice(8, newline);
        meta = JSON.parse(jsonStr);
      } catch (e) {}
    }

    const price    = parseFloat(row.price) || 0;
    // ✅ المنتج متوفر إذا كانت القيمة true صراحةً، وغير متوفر في أي حال أخرى
    const isAvail  = row.is_available === true;
    const isHot    = row.is_hot === true;

    const vars    = row.variations || [];
    const hasVars = Array.isArray(vars) && vars.length > 0;

    // ✅ كلاس إضافي للكارت عند عدم التوفر
    const cardOutOfStockClass = !isAvail ? 'out-of-stock' : '';

    // ✅ زر الشراء — معطل ومغير النص إذا غير متوفر
    const buyBtnHtml = isAvail
      ? `<button
           class="buy-now-btn flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors"
           data-id="${row.id}">
           🛒 شراء الآن
         </button>`
      : `<button
           class="buy-now-btn flex-1 py-2 rounded-lg font-bold cursor-not-allowed disabled-buy-btn"
           data-id="${row.id}"
           disabled
           aria-disabled="true"
           title="هذا المنتج غير متوفر حالياً">
           ❌ غير متوفر حالياً
         </button>`;

    grid.innerHTML += `
      <div class="product-card bg-[#161616] border border-gray-800 rounded-2xl overflow-hidden
                  flex flex-col hover:border-gray-600 transition-colors shadow-lg ${cardOutOfStockClass}">

        <!-- صورة المنتج مع الشارات -->
        <div class="h-40 overflow-hidden relative product-img-wrapper">
          <img
            src="${row.image_url}"
            alt="${row.title}"
            class="w-full h-full object-cover ${!isAvail ? 'product-img-dimmed' : ''}">

          <!-- شارة الأكثر مبيعاً -->
          ${isHot
            ? `<span class="absolute top-2 left-2 bg-orange-600 text-white text-xs
                           font-bold px-2 py-1 rounded">
                🔥 الأكثر مبيعاً
               </span>`
            : ''}

          <!-- ✅ شارة "غير متوفر" الاحترافية -->
          ${!isAvail
            ? `<span class="out-of-stock-badge">غير متوفر</span>`
            : ''}
        </div>

        <!-- تفاصيل المنتج -->
        <div class="p-4 flex flex-col flex-1">
          <h3 class="font-bold text-lg text-white mb-1 line-clamp-1" title="${row.title}">
            ${row.title}
          </h3>
          <p class="text-sm text-gray-400 mb-2">${row.category}</p>

          <div class="text-xl font-black text-red-500 mb-4 mt-auto">
            ${hasVars ? `${vars.length} باقات` : `${formatPrice(price)} DA`}
          </div>

          <!-- أزرار الإجراءات -->
          <div class="flex gap-2">
            ${buyBtnHtml}
            <button
              class="edit-product-btn flex-1 bg-blue-600/20 hover:bg-blue-600
                     text-blue-500 hover:text-white py-2 rounded-lg font-bold transition-colors"
              data-id="${row.id}">
              تعديل
            </button>
            <button
              class="delete-product-btn bg-red-600/20 hover:bg-red-600
                     text-red-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors"
              data-id="${row.id}">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

// ✅ فتح الـ Modal فقط إذا لم يكن الزر معطلاً
document.getElementById('products-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.buy-now-btn');
  if (!btn) return;

  // منع الحدث تماماً إذا كان الزر disabled
  if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }

  const productId = btn.dataset.id;
  openOrderModal(productId); // استبدل باسم دالة الـ Modal الصحيحة في مشروعك
});

// Opening the Product Modal
document.getElementById('add-product-btn').addEventListener('click', () => {
  openProductModal();
});

function openProductModal(productId = null) {
  const modal        = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  const title        = document.getElementById('product-modal-title');
  const form         = document.getElementById('product-form');

  form.reset();
  currentVariations = [];

  if (productId) {
    const product = productsData.find(p => p.id == productId);
    if (!product) return;

    title.textContent = 'تعديل المنتج';
    document.getElementById('p-id').value        = product.id;
    document.getElementById('p-title').value     = product.title || '';
    document.getElementById('p-category').value  = product.category || 'pc';
    document.getElementById('p-image').value     = product.image_url || '';
    document.getElementById('p-price').value     = product.price || '';

    let meta = {};
    let desc = product.description || '';
    if (desc.startsWith('__meta__')) {
      const newline = desc.indexOf('\n');
      try {
        const jsonStr = newline === -1 ? desc.slice(8) : desc.slice(8, newline);
        meta = JSON.parse(jsonStr);
        desc = newline === -1 ? '' : desc.slice(newline + 1);
      } catch (e) {}
    }

    document.getElementById('p-desc').value     = desc;
    document.getElementById('p-cost').value     = meta.cost || '';
    document.getElementById('p-profit').value   = meta.profitPercent || '';
    document.getElementById('p-discount').value = meta.discountPercent || '';
    document.getElementById('p-telegram').value = meta.telegramUsername || '';

    document.getElementById('p-available').checked = product.is_available === true;
    document.getElementById('p-hot').checked        = product.is_hot === true;
    document.getElementById('p-discord').value      = product.discord_link || '';

    let rawVars = product.variations;
    if (typeof rawVars === 'string') {
      try { rawVars = JSON.parse(rawVars); } catch(e) { rawVars = []; }
    }
    currentVariations = Array.isArray(rawVars) ? [...rawVars] : [];

  } else {
    title.textContent = 'إضافة منتج جديد';
    document.getElementById('p-id').value = '';
    document.getElementById('p-available').checked = true;
  }

  renderModalVariations();

  modal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function closeProductModal() {
  const modal        = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');

  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

document.querySelectorAll('.close-modal-btn').forEach(btn => {
  btn.addEventListener('click', closeProductModal);
});

/* ─── Variations UI ─── */
function renderModalVariations() {
  const container = document.getElementById('variations-container');
  const msg       = document.getElementById('no-vars-msg');

  if (currentVariations.length === 0) {
    container.innerHTML = '';
    msg.classList.remove('hidden');
    return;
  }
  msg.classList.add('hidden');

  container.innerHTML = currentVariations.map(v => `
    <div class="flex flex-col md:flex-row gap-3 items-center bg-[#1a1a1a] p-3 rounded-lg
                border border-gray-700 shadow-inner" data-var-id="${v.id}">
      <input type="text"
             class="var-name w-full md:w-1/2 p-2 bg-[#0f0f0f] rounded border border-gray-600
                    focus:border-red-500 outline-none text-white text-sm"
             placeholder="اسم الباقة" value="${v.name || ''}">

      <div class="flex w-full md:w-1/2 gap-3 items-center">
        <input type="number"
               class="var-price flex-1 p-2 bg-[#0f0f0f] rounded border border-gray-600
                      focus:border-red-500 outline-none text-white text-sm"
               placeholder="السعر" step="0.01" value="${v.price || ''}">

        <label class="flex items-center gap-1 cursor-pointer whitespace-nowrap">
          <input type="checkbox" class="var-avail w-4 h-4 accent-red-600"
                 ${v.is_available !== false ? 'checked' : ''}>
          <span class="text-sm font-bold">متوفر</span>
        </label>

        <button type="button"
                class="delete-var-btn bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                title="حذف الباقة">🗑️</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('add-var-btn').addEventListener('click', () => {
  currentVariations.push({ id: generateId(), name: '', price: 0, is_available: true });
  renderModalVariations();
  const container = document.getElementById('variations-container');
  container.scrollTop = container.scrollHeight;
});

/* ─── Save Product ─── */
document.getElementById('save-product-btn').addEventListener('click', async () => {
  const form = document.getElementById('product-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const id = document.getElementById('p-id').value;

  const metaObj = {
    cost:             parseFloat(document.getElementById('p-cost').value) || 0,
    profitPercent:    parseFloat(document.getElementById('p-profit').value) || 0,
    discountPercent:  parseFloat(document.getElementById('p-discount').value) || 0,
    telegramUsername: document.getElementById('p-telegram').value.trim()
  };

  const rawDesc        = document.getElementById('p-desc').value.trim();
  const finalDescription = `__meta__${JSON.stringify(metaObj)}\n${rawDesc}`;
  const cleanedVars    = currentVariations.filter(v => v.name && v.name.trim() !== '');

  const payload = {
    title:        document.getElementById('p-title').value.trim(),
    category:     document.getElementById('p-category').value.trim(),
    image_url:    document.getElementById('p-image').value.trim(),
    price:        parseFloat(document.getElementById('p-price').value) || 0,
    description:  finalDescription,
    is_available: document.getElementById('p-available').checked,
    is_hot:       document.getElementById('p-hot').checked,
    discord_link: document.getElementById('p-discord').value.trim(),
    variations:   cleanedVars
  };

  const saveBtn = document.getElementById('save-product-btn');
  saveBtn.textContent = 'جاري الحفظ...';
  saveBtn.disabled    = true;

  try {
    let result;
    if (id) {
      result = await supabaseClient.from('products').update(payload).eq('id', id);
    } else {
      result = await supabaseClient.from('products').insert([payload]);
    }
    if (result.error) throw result.error;

    showToast('✅ تم حفظ المنتج بنجاح!');
    closeProductModal();
    loadProducts();
  } catch (err) {
    showToast('❌ حدث خطأ أثناء الحفظ: ' + err.message, 'error');
  } finally {
    saveBtn.textContent = 'حفظ المنتج';
    saveBtn.disabled    = false;
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑥ PROMO CODES MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */
let promoData = [];

async function loadPromos() {
  const tbody = document.getElementById('promo-tbody');
  const loader = document.getElementById('promo-loader');

  tbody.innerHTML = '';
  loader.classList.remove('hidden');

  const { data, error } = await supabaseClient
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    showToast('خطأ في جلب الكوبونات: ' + error.message, 'error');
    return;
  }

  promoData = data || [];
  renderPromos();
}

function renderPromos() {
  const tbody = document.getElementById('promo-tbody');
  const loader = document.getElementById('promo-loader');
  loader.classList.add('hidden');

  if (promoData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-8 text-center text-gray-500 font-bold">
          لا توجد أكواد خصم حالياً.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = promoData.map(row => `
    <tr class="hover:bg-gray-800/50 transition-colors">
      <td class="p-4 font-mono font-bold text-white text-lg">${row.code}</td>
      <td class="p-4 font-bold text-red-500">${row.discount_percent}%</td>
      <td class="p-4">
        ${row.is_active !== false
          ? `<span class="bg-green-900/40 text-green-500 px-3 py-1 rounded-full text-sm
                         font-bold border border-green-800">مفعل</span>`
          : `<span class="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-sm
                         font-bold border border-gray-700">معطل</span>`}
      </td>
      <td class="p-4 text-left">
        <button class="edit-promo-btn bg-blue-600/20 hover:bg-blue-600 text-blue-500
                       hover:text-white p-2 rounded transition-colors ml-2"
                data-id="${row.id}">✏️</button>
        <button class="delete-promo-btn bg-red-600/20 hover:bg-red-600 text-red-500
                       hover:text-white p-2 rounded transition-colors"
                data-id="${row.id}">🗑️</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('add-promo-btn').addEventListener('click', () => openPromoModal());

function openPromoModal(promoId = null) {
  const modal        = document.getElementById('promo-modal');
  const modalContent = document.getElementById('promo-modal-content');
  const title        = document.getElementById('promo-modal-title');
  const form         = document.getElementById('promo-form');

  form.reset();

  if (promoId) {
    const promo = promoData.find(p => p.id == promoId);
    if (!promo) return;

    title.textContent = 'تعديل الكوبون';
    document.getElementById('pr-id').value       = promo.id;
    document.getElementById('pr-code').value     = promo.code || '';
    document.getElementById('pr-discount').value = promo.discount_percent || '';
    document.getElementById('pr-active').checked = promo.is_active !== false;
  } else {
    title.textContent = 'إضافة كوبون جديد';
    document.getElementById('pr-id').value = '';
    document.getElementById('pr-active').checked = true;
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function closePromoModal() {
  const modal        = document.getElementById('promo-modal');
  const modalContent = document.getElementById('promo-modal-content');

  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');

  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

document.querySelectorAll('.close-promo-btn').forEach(btn => {
  btn.addEventListener('click', closePromoModal);
});

document.getElementById('save-promo-btn').addEventListener('click', async () => {
  const form = document.getElementById('promo-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const id = document.getElementById('pr-id').value;
  const payload = {
    code:             document.getElementById('pr-code').value.trim().toUpperCase(),
    discount_percent: parseFloat(document.getElementById('pr-discount').value) || 0,
    is_active:        document.getElementById('pr-active').checked
  };

  const saveBtn = document.getElementById('save-promo-btn');
  saveBtn.textContent = 'جاري الحفظ...';
  saveBtn.disabled    = true;

  try {
    let result;
    if (id) {
      result = await supabaseClient.from('promo_codes').update(payload).eq('id', id);
    } else {
      result = await supabaseClient.from('promo_codes').insert([payload]);
    }
    if (result.error) throw result.error;

    showToast('✅ تم حفظ الكوبون بنجاح!');
    closePromoModal();
    loadPromos();
  } catch (err) {
    showToast('❌ حدث خطأ أثناء الحفظ: ' + err.message, 'error');
  } finally {
    saveBtn.textContent = 'حفظ الكوبون';
    saveBtn.disabled    = false;
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑦ STORE SETTINGS MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */
async function loadStoreSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      document.getElementById('setting-maintenance').checked = data.is_maintenance || false;
      document.getElementById('setting-telegram').value      = data.telegram_link || '';
      document.getElementById('setting-discord').value       = data.discord_link || '';
      document.getElementById('setting-banner').value        = data.announcement_text || '';
    }
  } catch (err) {
    console.warn("Store settings table might not exist yet.", err);
  }
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('save-settings-btn');
  btn.innerHTML = 'جاري الحفظ ⏳';
  btn.disabled  = true;

  const payload = {
    id:                1,
    is_maintenance:    document.getElementById('setting-maintenance').checked,
    telegram_link:     document.getElementById('setting-telegram').value.trim(),
    discord_link:      document.getElementById('setting-discord').value.trim(),
    announcement_text: document.getElementById('setting-banner').value.trim()
  };

  try {
    const { error } = await supabaseClient.from('store_settings').upsert([payload]);
    if (error) throw error;
    showToast('✅ تم تحديث إعدادات المتجر بنجاح!');
  } catch (err) {
    showToast('❌ حدث خطأ أثناء الحفظ: ' + err.message, 'error');
  } finally {
    btn.innerHTML = '💾 حفظ التغييرات';
    btn.disabled  = false;
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑧ EVENT DELEGATION
   ══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('click', async (e) => {

  // ✅ زر شراء الآن — التحقق المزدوج من التعطيل قبل فتح الـ Modal
  if (e.target.closest('.buy-now-btn')) {
    const btn = e.target.closest('.buy-now-btn');
    if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      e.stopImmediatePropagation();
      return; // لا شيء يحدث
    }
    // إذا كان متوفراً، افتح الـ Modal هنا
    // openOrderModal(btn.dataset.id);
  }

  // Delete Product
  if (e.target.closest('.delete-product-btn')) {
    const id = e.target.closest('.delete-product-btn').dataset.id;
    if (confirm('⚠️ هل أنت متأكد أنك تريد حذف هذا المنتج نهائياً؟')) {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) showToast('خطأ: ' + error.message, 'error');
      else { showToast('تم حذف المنتج.'); loadProducts(); }
    }
  }

  // Edit Product
  if (e.target.closest('.edit-product-btn')) {
    const id = e.target.closest('.edit-product-btn').dataset.id;
    openProductModal(id);
  }

  // Delete Promo
  if (e.target.closest('.delete-promo-btn')) {
    const id = e.target.closest('.delete-promo-btn').dataset.id;
    if (confirm('⚠️ هل أنت متأكد أنك تريد حذف هذا الكوبون؟')) {
      const { error } = await supabaseClient.from('promo_codes').delete().eq('id', id);
      if (error) showToast('خطأ: ' + error.message, 'error');
      else { showToast('تم حذف الكوبون.'); loadPromos(); }
    }
  }

  // Edit Promo
  if (e.target.closest('.edit-promo-btn')) {
    const id = e.target.closest('.edit-promo-btn').dataset.id;
    openPromoModal(id);
  }

  // Delete Variation inside Product Modal
  if (e.target.closest('.delete-var-btn')) {
    const varId = e.target.closest('[data-var-id]').dataset.varId;
    currentVariations = currentVariations.filter(v => v.id !== varId);
    renderModalVariations();
  }
});

// Update Variations array on Input change
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('var-name')) {
    const id = e.target.closest('[data-var-id]').dataset.varId;
    const v  = currentVariations.find(x => x.id === id);
    if (v) v.name = e.target.value;
  }
  if (e.target.classList.contains('var-price')) {
    const id = e.target.closest('[data-var-id]').dataset.varId;
    const v  = currentVariations.find(x => x.id === id);
    if (v) v.price = parseFloat(e.target.value) || 0;
  }
});

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('var-avail')) {
    const id = e.target.closest('[data-var-id]').dataset.varId;
    const v  = currentVariations.find(x => x.id === id);
    if (v) v.is_available = e.target.checked;
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑨ INITIALIZATION
   ══════════════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadPromos();
  loadStoreSettings();
});