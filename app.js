'use strict';

/* =========================================================================
   🛡️ 1. SECURITY LOCK — MUST RUN BEFORE ANYTHING ELSE
========================================================================= */
const SECRET_PIN = "Dz.Vibes.0107@";

function enforceAdminAccessLock() {
  const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';

  if (isAuthenticated) {
    return true;
  }

  const enteredPin = window.prompt("أدخل رمز الدخول السري للوحة التحكم:");

  if (enteredPin === SECRET_PIN) {
    localStorage.setItem('admin_authenticated', 'true');
    return true;
  }

  window.alert("⛔ تم رفض الوصول. رمز الدخول غير صحيح.");
  window.location.href = "https://google.com";
  return false;
}

/* =========================================================================
   ⚙️ 2. SUPABASE CONFIG — HARDCODED PRODUCTION CREDENTIALS
   NOTE: We intentionally name the initialized client "supabaseClient"
   instead of "supabase" to avoid shadowing/overwriting the global
   `supabase` object exposed by the Supabase SDK (window.supabase), which
   would otherwise throw a ReferenceError due to const temporal dead zone
   collision (`const supabase = supabase.createClient(...)`).
========================================================================= */
const SUPABASE_URL = 'https://kbyjyfmifsufxbmhnwnq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xZPIAOb59rGWmUvnI__Pyw_ijtSFRwo';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRODUCTS_TABLE = "products";

/* =========================================================================
   🗂️ CATEGORY DISPLAY LABELS (value -> readable Arabic label)
========================================================================= */
const CATEGORY_LABELS = {
  "digital-subs__digital-key": "اشتراكات رقمية — Digital Key",
  "digital-subs__netflix": "اشتراكات رقمية — Netflix",
  "digital-subs__spotify": "اشتراكات رقمية — Spotify",
  "digital-subs__shahid": "اشتراكات رقمية — Shahid",
  "digital-subs__crunchyroll": "اشتراكات رقمية — Crunchyroll",
  "digital-subs__other": "اشتراكات رقمية — Other",

  "mobile-topup__digital-key": "شحن ألعاب الهاتف — Digital Key",
  "mobile-topup__uid": "شحن ألعاب الهاتف — شحن UID",
  "mobile-topup__card": "شحن ألعاب الهاتف — شحن Card",

  "psn__digital-key": "بلاي ستيشن (PSN) — Digital Key",
  "psn__games": "بلاي ستيشن (PSN) — العاب",
  "psn__gift-card": "بلاي ستيشن (PSN) — Gift Card",

  "xbox__digital-key": "إكس بوكس (Xbox) — Digital Key",
  "xbox__games": "إكس بوكس (Xbox) — العاب",
  "xbox__gift-card": "إكس بوكس (Xbox) — Gift Card",
  "xbox__game-pass": "إكس بوكس (Xbox) — Game Pass",

  "pc__digital-key": "PC ألعاب وحسابات — Digital Key",
  "pc__shared-accounts": "PC ألعاب وحسابات — حسابات مشتركة",
  "pc__online-accounts": "PC ألعاب وحسابات — حسابات online",
  "pc__online-accounts-ar": "PC ألعاب وحسابات — حسابات اونلاين",
  "pc__gift-card": "PC ألعاب وحسابات — Gift Card"
};

function getCategoryLabel(value) {
  if (!value) return "بدون تصنيف";
  return CATEGORY_LABELS[value] || value;
}

/* =========================================================================
   🌐 GLOBAL STATE
========================================================================= */
let currentProductsCache = [];
let isEditingExistingProduct = true;

/* =========================================================================
   🚀 INITIALIZATION
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const accessGranted = enforceAdminAccessLock();

  // Block ALL data fetching / UI rendering unless authenticated.
  if (!accessGranted) {
    return;
  }

  if (!supabaseClient) {
    renderTableError("تعذر الاتصال بقاعدة البيانات. تحقق من إعدادات Supabase.");
    return;
  }

  bindStaticEventListeners();
  bindGlobalDelegatedEvents();
  fetchAndRenderProducts();
});

/* =========================================================================
   🔒 LOGOUT
========================================================================= */
function handleLogout() {
  const confirmLogout = window.confirm("هل تريد تسجيل الخروج من لوحة التحكم؟");
  if (confirmLogout) {
    localStorage.removeItem('admin_authenticated');
    window.location.reload();
  }
}

/* =========================================================================
   📡 CORE CRUD — FETCH PRODUCTS
========================================================================= */
async function fetchAndRenderProducts() {
  const container = document.getElementById('products-table-container');
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المنتجات...</p>
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    currentProductsCache = data || [];
    renderProductsTable(currentProductsCache);
    updateStats(currentProductsCache);
  } catch (err) {
    console.error("Error fetching products:", err);
    renderTableError("حدث خطأ أثناء تحميل المنتجات: " + err.message);
  }
}

/* =========================================================================
   🖼️ RENDER TABLE
========================================================================= */
function renderProductsTable(products) {
  const container = document.getElementById('products-table-container');

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        <p>لا توجد منتجات حالياً. ابدأ بإضافة منتج جديد.</p>
      </div>
    `;
    return;
  }

  const rows = products.map(buildProductRowHTML).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>القسم</th>
            <th>السعر (دج)</th>
            <th>ديسكورد</th>
            <th>تيليجرام</th>
            <th>الأكثر مبيعاً</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function buildProductRowHTML(product) {
  const imageUrl = product.image || 'https://via.placeholder.com/46x46/14141c/ff1e27?text=%20';
  const hasDiscount = product.discountedPrice && Number(product.discountedPrice) > 0 &&
    Number(product.discountedPrice) < Number(product.sellingPrice || 0);

  const priceHTML = hasDiscount
    ? `<span class="price-cell"><del>${escapeHTML(product.sellingPrice)} دج</del> <strong>${escapeHTML(product.discountedPrice)} دج</strong></span>`
    : `<span class="price-cell"><strong>${escapeHTML(product.sellingPrice ?? '—')} دج</strong></span>`;

  const discordBadge = product.discord
    ? `<span class="badge badge-success"><i class="fa-brands fa-discord"></i> مفعّل</span>`
    : `<span class="badge badge-neutral">غير مضاف</span>`;

  const telegramBadge = product.telegram
    ? `<span class="badge badge-success"><i class="fa-brands fa-telegram"></i> مفعّل</span>`
    : `<span class="badge badge-neutral">غير مضاف</span>`;

  const topSellerBadge = product.topSeller
    ? `<span class="badge badge-fire"><i class="fa-solid fa-fire"></i> نعم</span>`
    : `<span class="badge badge-neutral">لا</span>`;

  const availableBadge = product.available
    ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> متوفر</span>`
    : `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> غير متوفر</span>`;

  return `
    <tr data-row-id="${product.id}" data-search-blob="${escapeAttr((product.title || '') + ' ' + getCategoryLabel(product.category))}">
      <td>
        <div class="product-title-cell">
          <img class="product-thumb" src="${escapeAttr(imageUrl)}" alt="" onerror="this.src='https://via.placeholder.com/46x46/14141c/ff1e27?text=%20'">
          <span>${escapeHTML(product.title || 'بدون اسم')}</span>
        </div>
      </td>
      <td>${escapeHTML(getCategoryLabel(product.category))}</td>
      <td>${priceHTML}</td>
      <td>${discordBadge}</td>
      <td>${telegramBadge}</td>
      <td>${topSellerBadge}</td>
      <td>${availableBadge}</td>
      <td>
        <div class="actions-cell">
          <button type="button" class="icon-btn edit-btn" data-action="edit-product" data-id="${product.id}" title="تعديل"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="icon-btn delete-btn" data-action="delete-product" data-id="${product.id}" title="حذف"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `;
}

function renderTableError(message) {
  const container = document.getElementById('products-table-container');
  container.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

/* =========================================================================
   📊 STATS
========================================================================= */
function updateStats(products) {
  const total = products.length;
  const available = products.filter(p => p.available).length;
  const topSellers = products.filter(p => p.topSeller).length;
  const withDiscord = products.filter(p => p.discord && p.discord.trim() !== '').length;

  animateStatValue('stat-total', total);
  animateStatValue('stat-available', available);
  animateStatValue('stat-top', topSellers);
  animateStatValue('stat-discord', withDiscord);
}

function animateStatValue(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = targetValue;
}

/* =========================================================================
   🔎 TABLE SEARCH
========================================================================= */
function filterProductsTable(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const rows = document.querySelectorAll('.products-table tbody tr');

  rows.forEach(row => {
    const blob = (row.getAttribute('data-search-blob') || '').toLowerCase();
    row.style.display = blob.includes(normalizedQuery) ? '' : 'none';
  });
}

/* =========================================================================
   🧩 EDIT MODAL — OPEN / CLOSE
========================================================================= */
function openEditModal(productId) {
  const product = currentProductsCache.find(p => String(p.id) === String(productId));
  if (!product) {
    window.alert("تعذر العثور على بيانات هذا المنتج.");
    return;
  }

  isEditingExistingProduct = true;

  document.getElementById('editModalHeading').textContent = "تعديل المنتج";
  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-title').value = product.title || '';
  document.getElementById('edit-category').value = product.category || '';
  document.getElementById('edit-image').value = product.image || '';
  document.getElementById('edit-cost').value = product.cost ?? '';
  document.getElementById('edit-sellingPrice').value = product.sellingPrice ?? '';
  document.getElementById('edit-discountedPrice').value = product.discountedPrice ?? '';
  document.getElementById('edit-description').value = product.description || '';
  document.getElementById('edit-telegram').value = product.telegram || '';
  document.getElementById('edit-discord').value = product.discord || '';
  document.getElementById('edit-topSeller').checked = !!product.topSeller;
  document.getElementById('edit-available').checked = product.available !== false;

  renderVariationsList(parseVariations(product.variations));
  updatePricePreview();
  showEditModal();
}

function openAddProductModal() {
  isEditingExistingProduct = false;

  document.getElementById('editModalHeading').textContent = "إضافة منتج جديد";
  document.getElementById('editProductForm').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-available').checked = true;

  renderVariationsList([]);
  updatePricePreview();
  showEditModal();
}

function showEditModal() {
  const overlay = document.getElementById('editProductModalOverlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  const overlay = document.getElementById('editProductModalOverlay');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('editProductForm').reset();
  document.getElementById('editVariationsList').innerHTML = '';
}

/* =========================================================================
   🧬 VARIATIONS MANAGEMENT
========================================================================= */
function parseVariations(rawVariations) {
  if (!rawVariations) return [];
  if (Array.isArray(rawVariations)) return rawVariations;
  if (typeof rawVariations === 'string') {
    try {
      const parsed = JSON.parse(rawVariations);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return rawVariations.split(',').map(v => v.trim()).filter(Boolean);
    }
  }
  return [];
}

function renderVariationsList(variations) {
  const list = document.getElementById('editVariationsList');

  if (!variations || variations.length === 0) {
    list.innerHTML = `<p class="variations-empty" id="variations-empty-hint">لا توجد متغيرات مضافة حالياً.</p>`;
    return;
  }

  list.innerHTML = variations.map((value, index) => buildVariationRowHTML(value, index)).join('');
}

function buildVariationRowHTML(value, index) {
  return `
    <div class="variation-row" data-variation-index="${index}">
      <input type="text" class="input-field variation-input" value="${escapeAttr(value)}" placeholder="مثال: باقة 60 شدة - 500 دج">
      <button type="button" class="remove-variation-btn" data-action="remove-variation" data-index="${index}" title="حذف"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `;
}

function addVariationField() {
  const list = document.getElementById('editVariationsList');
  const emptyHint = document.getElementById('variations-empty-hint');
  if (emptyHint) emptyHint.remove();

  const currentCount = list.querySelectorAll('.variation-row').length;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildVariationRowHTML('', currentCount).trim();
  list.appendChild(wrapper.firstChild);
}

function removeVariationField(index) {
  const list = document.getElementById('editVariationsList');
  const row = list.querySelector(`.variation-row[data-variation-index="${index}"]`);
  if (row) row.remove();

  // Re-index remaining rows to keep data-index consistent
  const remainingRows = list.querySelectorAll('.variation-row');
  remainingRows.forEach((r, i) => {
    r.setAttribute('data-variation-index', i);
    const btn = r.querySelector('.remove-variation-btn');
    if (btn) btn.setAttribute('data-index', i);
  });

  if (remainingRows.length === 0) {
    list.innerHTML = `<p class="variations-empty" id="variations-empty-hint">لا توجد متغيرات مضافة حالياً.</p>`;
  }
}

function collectVariationsFromForm() {
  const inputs = document.querySelectorAll('#editVariationsList .variation-input');
  const values = [];
  inputs.forEach(input => {
    const val = input.value.trim();
    if (val !== '') values.push(val);
  });
  return values;
}

/* =========================================================================
   💰 LIVE PRICE PREVIEW (DA — Algerian Dinar)
========================================================================= */
function updatePricePreview() {
  const cost = parseFloat(document.getElementById('edit-cost').value);
  const sellingPrice = parseFloat(document.getElementById('edit-sellingPrice').value);
  const discountedPrice = parseFloat(document.getElementById('edit-discountedPrice').value);
  const previewEl = document.getElementById('edit-pricePreview');

  if (isNaN(sellingPrice) && isNaN(discountedPrice)) {
    previewEl.textContent = "لا يوجد بيانات كافية";
    return;
  }

  let previewText = '';

  if (!isNaN(discountedPrice) && discountedPrice > 0 && !isNaN(sellingPrice) && discountedPrice < sellingPrice) {
    const discountPercent = (((sellingPrice - discountedPrice) / sellingPrice) * 100).toFixed(0);
    previewText = `السعر النهائي: ${discountedPrice} دج (بدلاً من ${sellingPrice} دج) — خصم ${discountPercent}%`;
  } else if (!isNaN(sellingPrice)) {
    previewText = `السعر النهائي: ${sellingPrice} دج`;
  }

  if (!isNaN(cost) && !isNaN(sellingPrice)) {
    const effectivePrice = (!isNaN(discountedPrice) && discountedPrice > 0) ? discountedPrice : sellingPrice;
    const profit = (effectivePrice - cost).toFixed(2);
    previewText += ` | الربح التقديري: ${profit} دج`;
  }

  previewEl.textContent = previewText || "لا يوجد بيانات كافية";
}

/* =========================================================================
   💾 SAVE HANDLER (CREATE / UPDATE)
========================================================================= */
async function _handleEditModalSave() {
  const saveBtn = document.getElementById('editModalSaveBtn');
  const productId = document.getElementById('edit-id').value;

  const title = document.getElementById('edit-title').value.trim();
  if (!title) {
    window.alert("يرجى إدخال اسم المنتج.");
    return;
  }

  const payload = {
    title: title,
    category: document.getElementById('edit-category').value,
    image: document.getElementById('edit-image').value.trim(),
    cost: parseFloatOrNull(document.getElementById('edit-cost').value),
    sellingPrice: parseFloatOrNull(document.getElementById('edit-sellingPrice').value),
    discountedPrice: parseFloatOrNull(document.getElementById('edit-discountedPrice').value),
    description: document.getElementById('edit-description').value.trim(),
    telegram: document.getElementById('edit-telegram').value.trim(),
    discord: document.getElementById('edit-discord').value.trim(),
    topSeller: document.getElementById('edit-topSeller').checked,
    available: document.getElementById('edit-available').checked,
    variations: collectVariationsFromForm()
  };

  const originalHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>جاري الحفظ...</span>';
  saveBtn.disabled = true;

  try {
    let error;

    if (isEditingExistingProduct && productId) {
      const result = await supabaseClient
        .from(PRODUCTS_TABLE)
        .update(payload)
        .eq('id', productId);
      error = result.error;
    } else {
      const result = await supabaseClient
        .from(PRODUCTS_TABLE)
        .insert([payload]);
      error = result.error;
    }

    if (error) throw error;

    saveBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>تم الحفظ</span>';
    await fetchAndRenderProducts();

    setTimeout(() => {
      closeEditModal();
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
    }, 500);

  } catch (err) {
    console.error("Error saving product:", err);
    window.alert("حدث خطأ أثناء الحفظ: " + err.message);
    saveBtn.innerHTML = originalHTML;
    saveBtn.disabled = false;
  }
}

function parseFloatOrNull(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/* =========================================================================
   🗑️ DELETE PRODUCT
========================================================================= */
async function deleteProduct(productId) {
  const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.");
  if (!confirmDelete) return;

  const row = document.querySelector(`tr[data-row-id="${productId}"]`);
  if (row) row.style.opacity = '0.4';

  try {
    const { error } = await supabaseClient
      .from(PRODUCTS_TABLE)
      .delete()
      .eq('id', productId);

    if (error) throw error;

    await fetchAndRenderProducts();
  } catch (err) {
    console.error("Error deleting product:", err);
    window.alert("حدث خطأ أثناء حذف المنتج: " + err.message);
    if (row) row.style.opacity = '1';
  }
}

/* =========================================================================
   ⚡ GLOBAL DISCORD BULK CONTROLLER
========================================================================= */
async function applyGlobalDiscordToAll() {
  const input = document.getElementById('global-discord-input');
  const btn = document.getElementById('btn-apply-global-discord');
  const statusEl = document.getElementById('global-controller-status');
  const discordValue = input.value.trim();

  if (!discordValue) {
    window.alert("يرجى إدخال رابط ديسكورد أولاً قبل التطبيق على الجميع.");
    return;
  }

  const confirmApply = window.confirm(`سيتم تطبيق الرابط التالي على جميع المنتجات:\n${discordValue}\nهل تريد المتابعة؟`);
  if (!confirmApply) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>جاري التحديث...</span>';
  btn.disabled = true;
  setStatusMessage(statusEl, "جاري تطبيق الرابط على جميع المنتجات...", '');

  try {
    const { error } = await supabaseClient
      .from(PRODUCTS_TABLE)
      .update({ discord: discordValue })
      .not('id', 'is', null); // matches all rows

    if (error) throw error;

    setStatusMessage(statusEl, "✅ تم تطبيق الرابط على جميع المنتجات بنجاح.", 'success');
    await fetchAndRenderProducts();
  } catch (err) {
    console.error("Error applying global discord:", err);
    setStatusMessage(statusEl, "❌ حدث خطأ أثناء التحديث: " + err.message, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

async function clearGlobalDiscordFromAll() {
  const btn = document.getElementById('btn-clear-global-discord');
  const statusEl = document.getElementById('global-controller-status');

  const confirmClear = window.confirm("سيتم حذف روابط ديسكورد من جميع المنتجات نهائياً. هل تريد المتابعة؟");
  if (!confirmClear) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>جاري الحذف...</span>';
  btn.disabled = true;
  setStatusMessage(statusEl, "جاري حذف الروابط من جميع المنتجات...", '');

  try {
    const { error } = await supabaseClient
      .from(PRODUCTS_TABLE)
      .update({ discord: null })
      .not('id', 'is', null); // matches all rows

    if (error) throw error;

    setStatusMessage(statusEl, "✅ تم حذف روابط ديسكورد من جميع المنتجات بنجاح.", 'success');
    document.getElementById('global-discord-input').value = '';
    await fetchAndRenderProducts();
  } catch (err) {
    console.error("Error clearing global discord:", err);
    setStatusMessage(statusEl, "❌ حدث خطأ أثناء الحذف: " + err.message, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function setStatusMessage(element, message, type) {
  element.textContent = message;
  element.className = 'controller-status' + (type ? ' ' + type : '');
}

/* =========================================================================
   🎛️ STATIC EVENT LISTENERS
========================================================================= */
function bindStaticEventListeners() {
  const refreshBtn = document.getElementById('btn-refresh');
  const logoutBtn = document.getElementById('btn-logout');
  const searchInput = document.getElementById('table-search-input');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => fetchAndRenderProducts());
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterProductsTable(e.target.value));
  }

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Prevent native form submission (Enter key inside inputs)
  const form = document.getElementById('editProductForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      _handleEditModalSave();
    });
  }
}

/* =========================================================================
   🔗 EVENT DELEGATION (FROZEN BUTTONS FIX)
   All modal + dynamic table interactions are routed through document-level
   delegation, ensuring dynamically injected elements always stay responsive.
========================================================================= */
function bindGlobalDelegatedEvents() {

  document.addEventListener('click', (event) => {

    // ---------- Global Discord Controller ----------
    if (event.target.closest('#btn-apply-global-discord')) {
      applyGlobalDiscordToAll();
      return;
    }

    if (event.target.closest('#btn-clear-global-discord')) {
      clearGlobalDiscordFromAll();
      return;
    }

    // ---------- Add Product ----------
    if (event.target.closest('#btn-add-product')) {
      openAddProductModal();
      return;
    }

    // ---------- Table Row Actions (Edit / Delete) ----------
    const editTrigger = event.target.closest('[data-action="edit-product"]');
    if (editTrigger) {
      const id = editTrigger.getAttribute('data-id');
      openEditModal(id);
      return;
    }

    const deleteTrigger = event.target.closest('[data-action="delete-product"]');
    if (deleteTrigger) {
      const id = deleteTrigger.getAttribute('data-id');
      deleteProduct(id);
      return;
    }

    // ---------- Modal Controls ----------
    if (event.target.closest('#editModalCloseBtn')) {
      closeEditModal();
      return;
    }

    if (event.target.closest('#editModalCancelBtn')) {
      closeEditModal();
      return;
    }

    if (event.target.closest('#editModalSaveBtn')) {
      _handleEditModalSave();
      return;
    }

    if (event.target.closest('#editAddVariationBtn')) {
      addVariationField();
      return;
    }

    // ---------- Remove a Variation Row ----------
    const removeVariationTrigger = event.target.closest('[data-action="remove-variation"]');
    if (removeVariationTrigger) {
      const index = removeVariationTrigger.getAttribute('data-index');
      removeVariationField(index);
      return;
    }

    // ---------- Click Outside Modal (on overlay) closes it ----------
    if (event.target.id === 'editProductModalOverlay') {
      closeEditModal();
      return;
    }
  });

  // ---------- Live Price Preview (input delegation) ----------
  document.addEventListener('input', (event) => {
    if (
      event.target.id === 'edit-cost' ||
      event.target.id === 'edit-sellingPrice' ||
      event.target.id === 'edit-discountedPrice'
    ) {
      updatePricePreview();
    }
  });

  // ---------- Escape key closes modal ----------
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const overlay = document.getElementById('editProductModalOverlay');
      if (overlay && overlay.style.display === 'flex') {
        closeEditModal();
      }
    }
  });
}

/* =========================================================================
   🧰 UTILITIES
========================================================================= */
function escapeHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHTML(value);
}
