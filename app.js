/* ==========================================================================
   DZ VIBES SHOP — app.js  (Storefront — Customer Edition)
                                  Supabase Backend + Promo Codes + Variations
                                  + Full Sub-Category Filtering System
                                  + Variation Picker Popup Modal
                                  + Store Settings / Maintenance Mode Support
                                  ✅ FIXED: is_available / is_hot / discord_link
                                            / variations / promo_codes mapping
   ========================================================================== */

/* ══════════════════════════════════════════════════════════════════════════
   ① SUPABASE CONFIG
   ══════════════════════════════════════════════════════════════════════════ */
const SUPABASE_URL      = 'https://kbyjyfmifsufxbmhnwnq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xZPIAOb59rGWmUvnI__Pyw_ijtSFRwo';

// ✅ FIXED: createClient يأخذ URL بدون /rest/v1/ لأن المكتبة تضيفها تلقائياً
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ══════════════════════════════════════════════════════════════════════════
   ② CONFIGURATION
   ══════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  INSTAGRAM_URL:     "https://www.instagram.com/dzvibes_shop/",
  TELEGRAM_URL:      "https://t.me/DzVibesShop",
  TELEGRAM_USERNAME: "DzVibesShop",
  DISCORD_INVITE:    "https://discord.gg/DEZUUhJKma"
};

/* ── Discord Webhook URL ─────────────────────────────────────────────────── */
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1526595172257890495/z4h2S55tHBplz3uoa5cvQwiCmHuWZ_BA7Ru6QBkNH8iEYjqZwpirDO5ZkFQ0H4OVzhT8";

/* ── Category metadata ───────────────────────────────────────────────────── */
const CATEGORY_META = {
  subscriptions: { label: "🔌 اشتراكات رقمية",    color: 0xff1a1a },
  mobile:        { label: "📱 شحن ألعاب الهاتف",   color: 0xe60000 },
  playstation:   { label: "🎮 بلاي ستايشن (PSN)",  color: 0xb30000 },
  xbox:          { label: "💚 إكس بوكس (Xbox)",    color: 0xff4d4d },
  pc:            { label: "🖥️ ألعاب وحسابات PC",  color: 0x800000 },

  pc_digital_keys:     { label: "🔑 Digital Key",         color: 0x800000 },
  pc_shared_accounts:  { label: "👥 حسابات مشتركة",       color: 0x800000 },
  pc_online_accounts:  { label: "🌐 حسابات online",       color: 0x800000 },
  pc_offline_accounts: { label: "🖥️ حسابات اوفلاين",      color: 0x800000 },
  pc_gift_cards:       { label: "💳 Gift Card",           color: 0x800000 },

  xbox_digital_keys: { label: "🔑 Digital Key", color: 0xff4d4d },
  xbox_games:        { label: "🎮 ألعاب",       color: 0xff4d4d },
  xbox_gift_cards:   { label: "💳 Gift Card",   color: 0xff4d4d },
  xbox_game_pass:    { label: "💚 Game Pass",   color: 0xff4d4d },

  psn_digital_keys: { label: "🔑 Digital Key", color: 0xb30000 },
  psn_games:        { label: "🎮 ألعاب",       color: 0xb30000 },
  psn_gift_cards:   { label: "💳 Gift Card",   color: 0xb30000 },

  mobile_digital_keys: { label: "🔑 Digital Key", color: 0xe60000 },
  mobile_uid:          { label: "🆔 شحن UID",     color: 0xe60000 },
  mobile_card:         { label: "💳 شحن Card",    color: 0xe60000 },

  sub_digital_keys: { label: "🔑 Digital Key", color: 0xff1a1a },
  sub_netflix:      { label: "🎬 Netflix",     color: 0xff1a1a },
  sub_spotify:      { label: "🎵 Spotify",     color: 0xff1a1a },
  sub_shahid:       { label: "💜 Shahid",      color: 0xff1a1a },
  sub_crunchyroll:  { label: "🧡 Crunchyroll", color: 0xff1a1a },
  sub_other:        { label: "🛠️ Other",       color: 0xff1a1a }
};

/* ══════════════════════════════════════════════════════════════════════════
   ②.5 DYNAMIC STYLES — Storefront Variation Chips
   ══════════════════════════════════════════════════════════════════════════ */
function injectVariationDynamicStyles() {
  if (document.getElementById('dzvibes-variations-style')) return;
  const style = document.createElement('style');
  style.id = 'dzvibes-variations-style';
  style.textContent = `
    .variation-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0 14px;
    }
    .variation-chip {
      background: #1a1a1a;
      border: 1px solid #444;
      color: #fff;
      padding: 7px 15px;
      border-radius: 20px;
      font-size: 12.5px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .variation-chip:hover:not(.disabled) {
      border-color: #ff1a1a;
      background: #2a1010;
    }
    .variation-chip.selected {
      background: #ff1a1a;
      border-color: #ff1a1a;
      color: #fff;
      font-weight: 700;
      box-shadow: 0 0 0 2px rgba(255,26,26,0.25);
    }
    .variation-chip.disabled {
      opacity: 0.4;
      text-decoration: line-through;
      cursor: not-allowed;
      background: #111;
    }
  `;
  document.head.appendChild(style);
}
injectVariationDynamicStyles();

/* ══════════════════════════════════════════════════════════════════════════
   ②.6 DYNAMIC STYLES — Sub-Category Filter Bar
   ══════════════════════════════════════════════════════════════════════════ */
function injectSubcategoryStyles() {
  if (document.getElementById('dzvibes-subcat-style')) return;
  const style = document.createElement('style');
  style.id = 'dzvibes-subcat-style';
  style.textContent = `
    .subcat-bar {
      display: flex;
      justify-content: flex-start;
      direction: rtl;
      gap: 10px;
      align-items: center;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 4px 2px 16px;
      margin: 0 0 20px;
    }
    .subcat-bar::-webkit-scrollbar {
      display: none;
      height: 0;
    }
    .subcat-chip {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #161616;
      border: 1.5px solid #3a3a3a;
      color: #cfcfcf;
      padding: 9px 20px;
      border-radius: 24px;
      font-size: 13.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.22s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .subcat-chip:hover {
      border-color: #ff1a1a;
      color: #fff;
      background: #201010;
    }
    .subcat-chip.active {
      background: linear-gradient(135deg, #ff1a1a, #a00000);
      border-color: #ff1a1a;
      color: #fff;
      font-weight: 800;
      box-shadow: 0 0 14px rgba(255, 26, 26, 0.55), 0 0 0 1px rgba(255,26,26,0.35) inset;
    }
    @media (max-width: 640px) {
      .subcat-chip {
        padding: 8px 16px;
        font-size: 12.5px;
      }
    }
  `;
  document.head.appendChild(style);
}
injectSubcategoryStyles();

/* ══════════════════════════════════════════════════════════════════════════
   ②.7 DYNAMIC STYLES — Variation Picker Modal
   ══════════════════════════════════════════════════════════════════════════ */
function injectVariationModalStyles() {
  if (document.getElementById('dzvibes-varmodal-style')) return;
  const style = document.createElement('style');
  style.id = 'dzvibes-varmodal-style';
  style.textContent = `
    #variationPickerOverlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.28s ease, visibility 0.28s ease;
      padding: 16px;
      box-sizing: border-box;
    }
    #variationPickerOverlay.show {
      opacity: 1;
      visibility: visible;
    }
    #variationPickerModal {
      background: #111111;
      border: 1px solid #2a2a2a;
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #ff1a1a #1a1a1a;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,26,26,0.08);
      transform: translateY(28px) scale(0.97);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s ease;
      opacity: 0;
      position: relative;
      direction: rtl;
    }
    #variationPickerOverlay.show #variationPickerModal {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    #variationPickerModal::-webkit-scrollbar { width: 5px; }
    #variationPickerModal::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 10px; }
    #variationPickerModal::-webkit-scrollbar-thumb { background: #ff1a1a; border-radius: 10px; }
    #varModalCloseBtn {
      position: absolute;
      top: 14px;
      left: 14px;
      background: #1e1e1e;
      border: 1px solid #333;
      color: #aaa;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
      z-index: 2;
      flex-shrink: 0;
    }
    #varModalCloseBtn:hover { background: #ff1a1a; color: #fff; border-color: #ff1a1a; }
    .var-modal-image-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      border-radius: 20px 20px 0 0;
      flex-shrink: 0;
    }
    .var-modal-image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .var-modal-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%);
    }
    .var-modal-image-title {
      position: absolute;
      bottom: 14px;
      right: 16px;
      left: 50px;
      color: #fff;
      font-size: 17px;
      font-weight: 800;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      line-height: 1.3;
      font-family: inherit;
    }
    .var-modal-cat-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255, 26, 26, 0.85);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
      font-family: inherit;
    }
    .var-modal-body { padding: 20px 18px 24px; }
    .var-modal-section-label {
      font-size: 14px;
      font-weight: 700;
      color: #aaa;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .var-modal-section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(to left, transparent, #2a2a2a);
    }
    .var-modal-packages-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .var-modal-pkg-btn {
      width: 100%;
      background: #181818;
      border: 1.5px solid #2e2e2e;
      color: #e0e0e0;
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.2s ease;
      text-align: right;
      -webkit-tap-highlight-color: transparent;
      position: relative;
      overflow: hidden;
    }
    .var-modal-pkg-btn::before {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: transparent;
      border-radius: 0 12px 12px 0;
      transition: background 0.2s ease;
    }
    .var-modal-pkg-btn:hover:not(.var-pkg-disabled) {
      border-color: #ff1a1a;
      background: #1f1010;
      color: #fff;
      transform: translateX(-2px);
    }
    .var-modal-pkg-btn:hover:not(.var-pkg-disabled)::before { background: #ff1a1a; }
    .var-modal-pkg-btn.var-pkg-selected {
      background: linear-gradient(135deg, #1e0a0a 0%, #2a0f0f 100%);
      border-color: #ff1a1a;
      color: #fff;
      box-shadow: 0 0 0 1px rgba(255,26,26,0.3), 0 4px 20px rgba(255,26,26,0.15);
    }
    .var-modal-pkg-btn.var-pkg-selected::before { background: #ff1a1a; }
    .var-modal-pkg-btn.var-pkg-disabled {
      opacity: 0.38;
      cursor: not-allowed;
      text-decoration: line-through;
      background: #0f0f0f;
      border-color: #222;
    }
    .var-pkg-name { display: flex; align-items: center; gap: 10px; flex: 1; }
    .var-pkg-icon { font-size: 18px; flex-shrink: 0; }
    .var-pkg-name-text { font-size: 15px; font-weight: 700; }
    .var-pkg-price-tag {
      background: rgba(255, 26, 26, 0.12);
      border: 1px solid rgba(255, 26, 26, 0.25);
      color: #ff6b6b;
      font-size: 13px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }
    .var-modal-pkg-btn.var-pkg-selected .var-pkg-price-tag {
      background: rgba(255, 26, 26, 0.25);
      color: #ff9999;
      border-color: rgba(255, 26, 26, 0.5);
    }
    .var-pkg-selected-check {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      background: #ff1a1a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #fff;
      opacity: 0;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }
    .var-modal-pkg-btn.var-pkg-selected .var-pkg-selected-check { opacity: 1; }
    .var-pkg-unavailable-tag {
      font-size: 10px;
      font-weight: 600;
      color: #666;
      background: #1a1a1a;
      border: 1px solid #333;
      padding: 2px 8px;
      border-radius: 10px;
      margin-right: 6px;
    }
    .var-modal-price-section {
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .var-modal-price-left { display: flex; flex-direction: column; gap: 3px; }
    .var-modal-price-label {
      font-size: 12px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .var-modal-selected-name { font-size: 13px; color: #aaa; font-weight: 500; }
    #varModalSelectedName { color: #ff9999; font-weight: 700; }
    .var-modal-price-value {
      font-size: 28px;
      font-weight: 900;
      color: #ff4d4d;
      font-family: inherit;
      letter-spacing: -0.5px;
    }
    #varModalPriceValue { transition: all 0.2s ease; }
    .var-modal-promo-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }
    .var-modal-promo-row input {
      flex: 1;
      background: #161616;
      border: 1.5px solid #2a2a2a;
      color: #fff;
      border-radius: 10px;
      padding: 11px 14px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
      direction: ltr;
      text-align: right;
    }
    .var-modal-promo-row input:focus { border-color: #ff1a1a; }
    .var-modal-promo-row input::placeholder { color: #444; text-align: right; }
    .var-modal-promo-apply-btn {
      background: #1e1e1e;
      border: 1.5px solid #333;
      color: #ccc;
      border-radius: 10px;
      padding: 11px 18px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .var-modal-promo-apply-btn:hover { background: #ff1a1a; border-color: #ff1a1a; color: #fff; }
    .var-modal-promo-msg {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 14px;
      min-height: 18px;
      text-align: right;
      padding-right: 4px;
    }
    .var-modal-promo-msg.success { color: #4caf50; }
    .var-modal-promo-msg.error   { color: #ff4d4d; }
    .var-modal-confirm-section { display: flex; flex-direction: column; gap: 10px; }
    .var-modal-confirm-btn {
      width: 100%;
      background: linear-gradient(135deg, #ff1a1a 0%, #cc0000 100%);
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 20px rgba(255, 26, 26, 0.35);
      -webkit-tap-highlight-color: transparent;
    }
    .var-modal-confirm-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(255, 26, 26, 0.5);
      background: linear-gradient(135deg, #ff3333 0%, #e60000 100%);
    }
    .var-modal-confirm-btn:active:not(:disabled) { transform: translateY(0); }
    .var-modal-confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .var-modal-confirm-btn svg { flex-shrink: 0; }
    .var-modal-secondary-btns { display: flex; gap: 8px; }
    .var-modal-ig-btn,
    .var-modal-dc-btn {
      flex: 1;
      border: none;
      border-radius: 12px;
      padding: 13px 16px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .var-modal-ig-btn { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); color: #fff; }
    .var-modal-ig-btn:hover { opacity: 0.88; transform: translateY(-1px); }
    .var-modal-dc-btn { background: #5865f2; color: #fff; }
    .var-modal-dc-btn:hover { background: #4752c4; transform: translateY(-1px); }
    .var-modal-hint { text-align: center; font-size: 12.5px; color: #555; margin-top: 6px; }
    @media (max-width: 520px) {
      .var-modal-image-wrap { height: 160px; }
      .var-modal-image-title { font-size: 15px; }
      .var-modal-price-value { font-size: 24px; }
      .var-modal-confirm-btn { font-size: 15px; padding: 14px 20px; }
    }
  `;
  document.head.appendChild(style);
}
injectVariationModalStyles();

/* ══════════════════════════════════════════════════════════════════════════
   ②.8 DYNAMIC STYLES — Maintenance Screen + Announcement Bar
   ══════════════════════════════════════════════════════════════════════════ */
function injectMaintenanceAndAnnouncementStyles() {
  if (document.getElementById('dzvibes-maintenance-style')) return;
  const style = document.createElement('style');
  style.id = 'dzvibes-maintenance-style';
  style.textContent = `
    .announcement-bar {
      display: none;
      width: 100%;
      background: linear-gradient(90deg, #a00000, #ff1a1a, #a00000);
      color: #fff;
      text-align: center;
      font-size: 13.5px;
      font-weight: 700;
      padding: 10px 16px;
      box-sizing: border-box;
      letter-spacing: 0.3px;
      direction: rtl;
      box-shadow: 0 2px 12px rgba(255,26,26,0.35);
    }
    .maintenance-screen {
      max-width: 640px;
      margin: 80px auto;
      padding: 50px 30px;
      text-align: center;
      direction: rtl;
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 24px;
      box-shadow: 0 24px 70px rgba(0,0,0,0.6);
    }
    .maintenance-icon {
      font-size: 64px;
      margin-bottom: 18px;
      animation: maintenance-bounce 1.8s ease-in-out infinite;
    }
    @keyframes maintenance-bounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }
    .maintenance-title { font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 12px; }
    .maintenance-subtitle { font-size: 15px; color: #aaa; line-height: 1.7; margin: 0 0 22px; }
    .maintenance-announcement {
      background: #1e1010;
      border: 1px solid #ff1a1a55;
      color: #ff9999;
      font-size: 13.5px;
      font-weight: 600;
      border-radius: 12px;
      padding: 12px 16px;
      margin: 0 0 26px;
    }
    .maintenance-socials { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    @media (max-width: 640px) {
      .maintenance-screen { margin: 40px 16px; padding: 36px 20px; }
      .maintenance-icon { font-size: 52px; }
      .maintenance-title { font-size: 21px; }
    }
  `;
  document.head.appendChild(style);
}
injectMaintenanceAndAnnouncementStyles();

/* ══════════════════════════════════════════════════════════════════════════
   ②.14 BUILD & INJECT THE VARIATION PICKER MODAL INTO THE DOM
   ══════════════════════════════════════════════════════════════════════════ */
function buildVariationPickerModalDOM() {
  if (document.getElementById('variationPickerOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'variationPickerOverlay';

  overlay.innerHTML = `
    <div id="variationPickerModal" role="dialog" aria-modal="true" aria-labelledby="varModalTitle">
      <button type="button" id="varModalCloseBtn" aria-label="إغلاق">✕</button>
      <div class="var-modal-image-wrap">
        <img id="varModalImage" src="" alt="">
        <div class="var-modal-image-overlay"></div>
        <span id="varModalCatBadge" class="var-modal-cat-badge"></span>
        <div id="varModalTitle" class="var-modal-image-title"></div>
      </div>
      <div class="var-modal-body">
        <div class="var-modal-section-label">📦 اختر الباقة المناسبة</div>
        <div class="var-modal-packages-list" id="varModalPackagesList"></div>
        <div class="var-modal-price-section">
          <div class="var-modal-price-left">
            <span class="var-modal-price-label">السعر المحدد</span>
            <span class="var-modal-selected-name">الباقة: <span id="varModalSelectedName">—</span></span>
          </div>
          <div class="var-modal-price-value" id="varModalPriceValue">— DA</div>
        </div>
        <div class="var-modal-section-label">🎟️ كود الخصم</div>
        <div class="var-modal-promo-row">
          <input type="text" id="varModalPromoInput" placeholder="أدخل كود الخصم" maxlength="20">
          <button type="button" class="var-modal-promo-apply-btn" id="varModalPromoApplyBtn">تطبيق</button>
        </div>
        <div class="var-modal-promo-msg" id="varModalPromoMsg"></div>
        <div class="var-modal-confirm-section">
          <button type="button" class="var-modal-confirm-btn" id="varModalTelegramBtn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            تأكيد الطلب عبر تيليغرام
          </button>
          <div class="var-modal-secondary-btns">
            <button type="button" class="var-modal-ig-btn" id="varModalInstagramBtn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              انستغرام
            </button>
            <button type="button" class="var-modal-dc-btn" id="varModalDiscordBtn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.082.114 18.105.134 18.12a19.919 19.919 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              ديسكورد
            </button>
          </div>
          <div class="var-modal-hint" id="varModalHint">⬆️ يرجى اختيار باقة أولاً لتفعيل الطلب</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  bindVariationModalEvents();
}

/* ══════════════════════════════════════════════════════════════════════════
   ③ SUPABASE PRODUCT HELPERS
   ✅ FIXED: يستخدم أسماء الأعمدة الصحيحة من قاعدة البيانات
   ══════════════════════════════════════════════════════════════════════════ */

async function fetchProducts() {
  // ✅ استخدام النجمة (*) لجلب كل الأعمدة المتوفرة مباشرة بدون تسمية يدوية
  const { data, error } = await supabaseClient
    .from('products')
    .select('*') 
    .eq('is_available', true)
    .order('id', { ascending: true });

  if (error) {
    console.error('fetchProducts error:', error.message);
    showToast('⚠️ تعذّر تحميل المنتجات. تحقق من الاتصال');
    return [];
  }

  return (data || []).map(mapDbRowToProduct);
}

/* ══════════════════════════════════════════════════════════════════════════
   parseVariations — يحلل حقل variations من JSONB
   ✅ FIXED: يتعامل مع is_available داخل كل variation object
   ══════════════════════════════════════════════════════════════════════════ */
function parseVariations(raw) {
  if (!raw) return [];

  let arr = raw;

  // إذا كان string يجب parse أولاً
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch (_) {
      return [];
    }
  }

  if (!Array.isArray(arr)) return [];

  return arr
    .map(v => {
      if (!v || typeof v !== 'object') return null;

      return {
        // ✅ FIXED: نقرأ id أو نولّد واحداً جديداً
        id: v.id ? String(v.id) : generateId(),

        // ✅ FIXED: نقبل name أو value كاسم للـ variation
        name: String(v.name || v.value || '').trim(),

        // ✅ FIXED: السعر الخاص بهذه الـ variation
        price: parseFloat(v.price) || 0,

        // ✅ FIXED: is_available داخل JSONB (قد يكون is_available أو available)
        // نقبل كلا الاسمين للتوافق مع أي بيانات مُدخلة
        is_available: v.is_available !== false && v.available !== false
      };
    })
    .filter(v => v !== null && v.name !== '');
}

/* ══════════════════════════════════════════════════════════════════════════
   mapDbRowToProduct — يحوّل صف قاعدة البيانات إلى كائن JavaScript
   ✅ FIXED:
     - row.name        → title    (عمود الاسم في DB هو "name" وليس "title")
     - row.is_available → available (Boolean)
     - row.is_hot       → topSeller (Boolean)
     - row.discord_link → discordLink (Text)
     - row.variations   → variations (JSONB parsed array)
     - row.image_url    → image
   ══════════════════════════════════════════════════════════════════════════ */
function mapDbRowToProduct(row) {
  // استخراج meta المخفية في حقل description (إن وُجدت)
  let meta        = {};
  let description = row.description || '';

  if (description.startsWith('__meta__')) {
    const newlineIndex = description.indexOf('\n');
    try {
      const jsonStr = newlineIndex === -1
        ? description.slice(8)
        : description.slice(8, newlineIndex);
      meta        = JSON.parse(jsonStr);
      description = newlineIndex === -1 ? '' : description.slice(newlineIndex + 1);
    } catch (_) {
      // meta تالفة — تجاهل
    }
  }

  return {
    id:    row.id,

    // ✅ FIXED: العمود في DB اسمه "name" وليس "title"
    title: row.name || '',

    category:  row.category  || '',

    // ✅ FIXED: العمود في DB اسمه "image_url"
    image:     row.image_url || '',

    price:           parseFloat(row.price) || 0,

    // هذه الحقول مُخزنة في meta داخل description
    cost:            parseFloat(meta.cost)           || 0,
    profitPercent:   parseFloat(meta.profitPercent)  || 0,
    discountPercent: parseFloat(meta.discountPercent)|| 0,

    description:     description,

    telegramUsername: row.telegram_username || meta.telegramUsername || '',

    // ✅ FIXED: العمود الصحيح في DB هو "discord_link" (snake_case)
    discordLink: row.discord_link || '',

    // ✅ FIXED: العمود الصحيح في DB هو "is_hot" (Boolean)
    topSeller: row.is_hot === true,

    // ✅ FIXED: العمود الصحيح في DB هو "is_available" (Boolean)
    available: row.is_available === true,

    // ✅ FIXED: العمود الصحيح في DB هو "variations" (JSONB)
    variations: parseVariations(row.variations)
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   ④ PROMO CODE HELPERS — Supabase
   ✅ يستخدم أسماء الأعمدة الصحيحة: code / discount_percent / is_active
   ══════════════════════════════════════════════════════════════════════════ */

async function fetchPromoCodes() {
  const { data, error } = await supabaseClient
    .from('promo_codes')
    .select('id, code, discount_percent, is_active')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchPromoCodes error:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    id:            row.id,
    // ✅ FIXED: العمود في DB هو "code"
    code:          row.code          || '',
    // ✅ FIXED: العمود في DB هو "discount_percent"
    discountValue: parseFloat(row.discount_percent) || 0,
    // ✅ FIXED: العمود في DB هو "is_active"
    isActive:      row.is_active !== false
  }));
}

/* ── Helper: توليد ID فريد ── */
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

/* ══════════════════════════════════════════════════════════════════════════
   ④.5 STORE SETTINGS HELPERS — Supabase
   ══════════════════════════════════════════════════════════════════════════ */

async function fetchStoreSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('fetchStoreSettings warning:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.warn('fetchStoreSettings unexpected error:', err);
    return null;
  }
}

function isMaintenanceModeActive(settings) {
  if (!settings) return false;

  if (typeof settings.store_status === 'string') {
    return settings.store_status.trim().toLowerCase() === 'maintenance';
  }
  if (typeof settings.is_maintenance === 'boolean') {
    return settings.is_maintenance === true;
  }
  if (typeof settings.maintenance_mode === 'boolean') {
    return settings.maintenance_mode === true;
  }

  return false;
}

function applyStoreSettingsToStorefront(settings) {
  if (!settings) return;

  if (settings.telegram_bot_link &&
      typeof settings.telegram_bot_link === 'string' &&
      settings.telegram_bot_link.trim()) {
    const link = settings.telegram_bot_link.trim();
    CONFIG.TELEGRAM_URL = link;
    const usernameMatch = link.match(/t\.me\/([^/?]+)/i);
    if (usernameMatch && usernameMatch[1]) {
      CONFIG.TELEGRAM_USERNAME = usernameMatch[1];
    }
  }

  if (settings.discord_server_link &&
      typeof settings.discord_server_link === 'string' &&
      settings.discord_server_link.trim()) {
    CONFIG.DISCORD_INVITE = settings.discord_server_link.trim();
  }

  document.querySelectorAll('a[href*="t.me/DzVibesShop"]').forEach(a => {
    a.href = CONFIG.TELEGRAM_URL;
  });
  document.querySelectorAll('a[href*="discord.gg/DEZUUhJKma"]').forEach(a => {
    a.href = CONFIG.DISCORD_INVITE;
  });

  if (settings.announcement_text &&
      typeof settings.announcement_text === 'string' &&
      settings.announcement_text.trim()) {
    showAnnouncementBanner(settings.announcement_text.trim());
  }
}

function showAnnouncementBanner(text) {
  let bar = document.getElementById('announcementBar');

  if (!bar) {
    bar = document.createElement('div');
    bar.id        = 'announcementBar';
    bar.className = 'announcement-bar';

    const header = document.querySelector('.site-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(bar, header.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  bar.textContent   = `📢 ${text}`;
  bar.style.display = 'block';
}

function showMaintenanceScreen(settings) {
  const main = document.querySelector('main');
  if (!main) return;

  const announcement = (settings && typeof settings.announcement_text === 'string')
    ? settings.announcement_text.trim()
    : '';

  main.innerHTML = `
    <div class="maintenance-screen">
      <div class="maintenance-icon">🚧</div>
      <h1 class="maintenance-title">المتجر في صيانة مؤقتة</h1>
      <p class="maintenance-subtitle">
        نعمل حالياً على تحسين تجربتك! سنعود قريباً بمنتجات وعروض أفضل 🔥<br>
        We're currently under maintenance. We'll be back soon!
      </p>
      ${announcement ? `<div class="maintenance-announcement">📢 ${escapeHtml(announcement)}</div>` : ''}
      <div class="maintenance-socials">
        <a href="${CONFIG.INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-instagram">
          تواصل عبر انستغرام
        </a>
        <a href="${CONFIG.TELEGRAM_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-telegram">
          تواصل عبر تيليغرام
        </a>
        <a href="${CONFIG.DISCORD_INVITE}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-discord">
          انضم لسيرفرنا
        </a>
      </div>
    </div>
  `;

  const searchWrapperEl = document.getElementById('searchWrapper');
  if (searchWrapperEl) searchWrapperEl.style.display = 'none';
}

/* ══════════════════════════════════════════════════════════════════════════
   ⑤ PRICING ENGINE
   ══════════════════════════════════════════════════════════════════════════ */
const calculateBasePrice = (cost, profit) =>
  (parseFloat(cost) || 0) * (1 + (parseFloat(profit) || 0) / 100);

const calculateFinalPrice = (cost, profit, discount) => {
  const base = calculateBasePrice(cost, profit);
  const d    = parseFloat(discount) || 0;
  return d > 0 ? base * (1 - d / 100) : base;
};

const formatPrice = (v) => {
  const r = Math.round(v * 100) / 100;
  return r % 1 === 0 ? r.toString() : r.toFixed(2);
};

/* ══════════════════════════════════════════════════════════════════════════
   ⑥ ROUTER + STORE INITIALIZATION
   ══════════════════════════════════════════════════════════════════════════ */
const homeView      = document.getElementById('home-view');
const searchWrapper = document.getElementById('searchWrapper');

function router() {
  refreshSubcategoryBar();
  renderProductsGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function initStorefront() {
  const settings = await fetchStoreSettings();
  applyStoreSettingsToStorefront(settings);

  if (isMaintenanceModeActive(settings)) {
    showMaintenanceScreen(settings);
    return;
  }

  router();
}

window.addEventListener('DOMContentLoaded', initStorefront);

document.getElementById('logoHome').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑦ CATEGORY FILTER STATE
   ══════════════════════════════════════════════════════════════════════════ */
let activeCategory    = 'all';
let activeSubCategory = 'all';

const MAIN_CATEGORIES = {
  pc: {
    legacyValue: 'pc',
    subcats: [
      { value: 'all',                 label: 'الكل 🌟',             all: true },
      { value: 'pc_digital_keys',     label: 'Digital Key 🔑' },
      { value: 'pc_shared_accounts',  label: 'حسابات مشتركة 👥' },
      { value: 'pc_online_accounts',  label: 'حسابات online 🌐' },
      { value: 'pc_offline_accounts', label: 'حسابات اوفلاين 🖥️' },
      { value: 'pc_gift_cards',       label: 'Gift Card 💳' }
    ]
  },
  xbox: {
    legacyValue: 'xbox',
    subcats: [
      { value: 'all',               label: 'الكل 🌟',       all: true },
      { value: 'xbox_digital_keys', label: 'Digital Key 🔑' },
      { value: 'xbox_games',        label: 'ألعاب 🎮' },
      { value: 'xbox_gift_cards',   label: 'Gift Card 💳' },
      { value: 'xbox_game_pass',    label: 'Game Pass 💚' }
    ]
  },
  playstation: {
    legacyValue: 'playstation',
    subcats: [
      { value: 'all',              label: 'الكل 🌟',        all: true },
      { value: 'psn_digital_keys', label: 'Digital Key 🔑' },
      { value: 'psn_games',        label: 'ألعاب 🎮' },
      { value: 'psn_gift_cards',   label: 'Gift Card 💳' }
    ]
  },
  mobile: {
    legacyValue: 'mobile',
    subcats: [
      { value: 'all',                 label: 'الكل 🌟',       all: true },
      { value: 'mobile_digital_keys', label: 'Digital Key 🔑' },
      { value: 'mobile_uid',          label: 'شحن UID 🆔' },
      { value: 'mobile_card',         label: 'شحن Card 💳' }
    ]
  },
  subscriptions: {
    legacyValue: 'subscriptions',
    subcats: [
      { value: 'all',              label: 'الكل 🌟',         all: true },
      { value: 'sub_digital_keys', label: 'Digital Key 🔑' },
      { value: 'sub_netflix',      label: 'Netflix 🎬' },
      { value: 'sub_spotify',      label: 'Spotify 🎵' },
      { value: 'sub_shahid',       label: 'Shahid 💜' },
      { value: 'sub_crunchyroll',  label: 'Crunchyroll 🧡' },
      { value: 'sub_other',        label: 'Other 🛠️' }
    ]
  }
};

function getMainCategoryKeys(mainCat) {
  const cfg = MAIN_CATEGORIES[mainCat];
  if (!cfg) return [mainCat];
  return [cfg.legacyValue, ...cfg.subcats.filter(s => !s.all).map(s => s.value)];
}

let subcategoryBarEl = null;

function buildSubcategoryBar(mainCat) {
  const cfg = MAIN_CATEGORIES[mainCat];
  const bar = document.createElement('div');
  bar.id        = 'subcategoryBar';
  bar.className = 'subcat-bar';

  if (!cfg) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return bar;
  }

  bar.style.display = 'flex';
  bar.innerHTML = cfg.subcats.map(sub => `
    <button type="button"
            class="subcat-chip${sub.all ? ' active' : ''}"
            data-subcat="${sub.value}">${sub.label}</button>
  `).join('');
  return bar;
}

function refreshSubcategoryBar() {
  const existing = document.getElementById('subcategoryBar');
  if (existing) existing.remove();

  const bar = buildSubcategoryBar(activeCategory);
  productsGrid.parentNode.insertBefore(bar, productsGrid);
  subcategoryBarEl = bar;

  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('.subcat-chip');
    if (!chip) return;

    bar.querySelectorAll('.subcat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    activeSubCategory = chip.dataset.subcat;
    renderProductsGrid(document.getElementById('searchInput').value);
  });
}

document.querySelectorAll('.cat-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    activeCategory    = btn.dataset.cat;
    activeSubCategory = 'all';

    refreshSubcategoryBar();
    renderProductsGrid(document.getElementById('searchInput').value);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   ⑧ SKELETON LOADER
   ══════════════════════════════════════════════════════════════════════════ */
const skeletonGrid      = document.getElementById('skeletonGrid');
const productsGrid      = document.getElementById('productsGrid');
const emptyState        = document.getElementById('emptyState');
const emptyTitle        = document.getElementById('emptyTitle');
const emptyMsg          = document.getElementById('emptyMsg');
const productCountBadge = document.getElementById('productCountBadge');

refreshSubcategoryBar();

const SKELETON_COUNT    = 6;
const SKELETON_DELAY_MS = 650;

function buildSkeletonCard() {
  const sk = document.createElement('div');
  sk.className = 'skeleton-card';
  sk.innerHTML = `
    <div class="skeleton-image skeleton-shimmer"></div>
    <div class="skeleton-body">
      <div class="skeleton-line w-80 skeleton-shimmer"></div>
      <div class="skeleton-line w-55 skeleton-shimmer"></div>
      <div class="skeleton-line w-40 skeleton-shimmer"></div>
      <div class="skeleton-btn-row">
        <div class="skeleton-btn skeleton-shimmer"></div>
        <div class="skeleton-btn skeleton-shimmer"></div>
        <div class="skeleton-btn skeleton-shimmer"></div>
      </div>
    </div>`;
  return sk;
}

async function renderProductsGrid(filterText = '') {
  productsGrid.style.display  = 'none';
  emptyState.style.display    = 'none';
  skeletonGrid.style.display  = 'grid';
  skeletonGrid.innerHTML      = '';
  productCountBadge.textContent = '';

  for (let i = 0; i < SKELETON_COUNT; i++) {
    skeletonGrid.appendChild(buildSkeletonCard());
  }

  const [allProducts] = await Promise.all([
    fetchProducts(),
    new Promise(resolve => setTimeout(resolve, SKELETON_DELAY_MS))
  ]);

  _cachedProducts = allProducts;

  skeletonGrid.style.display = 'none';
  productsGrid.style.display = 'grid';
  _doRender(allProducts, filterText);
}

/* ══════════════════════════════════════════════════════════════════════════
   ⑨ STORE FRONT — RENDER PRODUCTS
   ══════════════════════════════════════════════════════════════════════════ */
function _doRender(allProducts, filterText = '') {
  const term = filterText.trim().toLowerCase();
  let filtered;

  if (activeCategory === 'all') {
    filtered = allProducts;
  } else if (MAIN_CATEGORIES[activeCategory]) {
    const keys = getMainCategoryKeys(activeCategory);
    filtered = allProducts.filter(p => keys.includes(p.category));
    if (activeSubCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeSubCategory);
    }
  } else {
    filtered = allProducts.filter(p => p.category === activeCategory);
  }

  if (term) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(term)
    );
  }

  productsGrid.innerHTML   = '';
  emptyState.style.display = 'none';

  if (allProducts.length === 0) {
    emptyState.style.display      = 'block';
    emptyTitle.textContent        = 'لا توجد منتجات بعد';
    emptyMsg.textContent          = 'تحقق لاحقاً — فريقنا يُعدّ عروضاً رائعة لك!';
    productCountBadge.textContent = '';
    productsGrid.style.display    = 'none';
    return;
  }

  if (filtered.length === 0) {
    emptyState.style.display      = 'block';
    emptyTitle.textContent        = 'لا توجد منتجات مطابقة';
    emptyMsg.textContent          = term
      ? 'جرّب كلمة بحث مختلفة أو غيّر القسم.'
      : 'لا توجد منتجات في هذا القسم بعد.';
    productCountBadge.textContent = '';
    productsGrid.style.display    = 'none';
    return;
  }

  productsGrid.style.display    = 'grid';
  productCountBadge.textContent = `${filtered.length} منتج`;
  filtered.forEach(p => productsGrid.appendChild(buildProductCard(p)));
}

/* Search input */
document.getElementById('searchInput').addEventListener('input', (e) =>
  renderProductsGrid(e.target.value)
);

/* ══════════════════════════════════════════════════════════════════════════
   ORDER LINK RESOLVER
   ══════════════════════════════════════════════════════════════════════════ */
function resolveOrderLink(platform, product, message) {
  const encoded = encodeURIComponent(message);
  switch (platform) {
    case 'instagram':
      return CONFIG.INSTAGRAM_URL;

    case 'telegram': {
      const user = (product.telegramUsername && product.telegramUsername.trim())
        ? product.telegramUsername.trim()
        : CONFIG.TELEGRAM_USERNAME;
      return `https://t.me/${user}?text=${encoded}`;
    }

    case 'discord':
      // ✅ يستخدم discordLink الذي جاء من discord_link في DB
      if (product.discordLink && product.discordLink.trim() &&
          product.discordLink.trim() !== '#') {
        return product.discordLink.trim();
      }
      return CONFIG.DISCORD_INVITE;

    default:
      return CONFIG.DISCORD_INVITE;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   DISCORD WEBHOOK
   ══════════════════════════════════════════════════════════════════════════ */
async function sendDiscordWebhookEmbed(product, finalPrice, appliedPromo, variation) {
  if (!DISCORD_WEBHOOK_URL) return;

  const catMeta  = CATEGORY_META[product.category] || { label: '—', color: 0x5865f2 };
  const priceStr = `${formatPrice(finalPrice)} DA${appliedPromo
    ? `  *(كود: ${appliedPromo.code} -${appliedPromo.discountValue}%)*`
    : ''}`;

  const fields = [
    { name: '📦 المنتج', value: product.title, inline: true }
  ];

  if (variation) {
    fields.push({ name: '🎁 الباقة', value: variation.name, inline: true });
  }

  fields.push({ name: '🏷️ القسم', value: catMeta.label, inline: true });
  fields.push({ name: '💰 السعر',  value: priceStr,        inline: false });

  const payload = {
    username:   'Dz Vibes Bot',
    avatar_url: 'https://i.imgur.com/4M34hi2.png',
    embeds: [{
      title:       `🛒 طلب جديد — ${product.title}`,
      description: 'وصل طلب جديد عبر Dz Vibes Shop!',
      color:       15073024,
      thumbnail:   product.image ? { url: product.image } : undefined,
      fields:      fields,
      footer:      { text: 'Dz Vibes Shop Notification System' },
      timestamp:   new Date().toISOString()
    }]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Discord webhook error:', err);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   ORDER MESSAGE BUILDER
   ══════════════════════════════════════════════════════════════════════════ */
function buildOrderMessage(product, finalPrice, appliedPromo, variation) {
  const catMeta = product.category ? CATEGORY_META[product.category] : null;
  let msg  = `🛒 طلب جديد من Dz Vibes Shop\n`;
  msg     += `----------------------------\n`;
  msg     += `📦 المنتج: ${product.title}\n`;
  if (variation) msg += `🎁 الباقة: ${variation.name}\n`;
  if (catMeta)   msg += `🏷️ القسم: ${catMeta.label}\n`;
  msg     += `💰 السعر النهائي: ${formatPrice(finalPrice)} DA\n`;
  if (appliedPromo)
    msg += `🎟️ كود الخصم: ${appliedPromo.code} (-${appliedPromo.discountValue}%)\n`;
  msg     += `----------------------------\n`;
  msg     += `أرجو تأكيد الطلب. شكراً!`;
  return msg;
}

/* ══════════════════════════════════════════════════════════════════════════
   HTML ESCAPE UTILITIES
   ══════════════════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}

/* ══════════════════════════════════════════════════════════════════════════
   BUILD PRODUCT CARD
   ══════════════════════════════════════════════════════════════════════════ */
function buildProductCard(product) {
  const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;

  const basePriceNoVar  = calculateBasePrice(product.cost, product.profitPercent);
  const finalPriceNoVar = calculateFinalPrice(product.cost, product.profitPercent, product.discountPercent);
  const hasDiscount     = !hasVariations && parseFloat(product.discountPercent) > 0;

  // ✅ FIXED: يستخدم product.available (الذي جاء من is_available في DB)
  const isAvail = hasVariations
    ? product.variations.some(v => v.is_available)
    : product.available;

  const initialPrice = hasVariations ? 0 : finalPriceNoVar;

  const orderMsg      = buildOrderMessage(product, initialPrice, null, null);
  const instagramHref = CONFIG.INSTAGRAM_URL;
  const telegramHref  = resolveOrderLink('telegram', product, orderMsg);

  // ✅ FIXED: يستخدم product.discordLink (الذي جاء من discord_link في DB)
  const discordHref = (product.discordLink && product.discordLink.trim() &&
                       product.discordLink.trim() !== '#')
                       ? product.discordLink.trim()
                       : CONFIG.DISCORD_INVITE;

  const card = document.createElement('div');
  card.className  = 'product-card' + (isAvail ? '' : ' unavailable');
  card.dataset.id = product.id;

  let badges = '';
  // ✅ FIXED: يستخدم product.topSeller (الذي جاء من is_hot في DB)
  if (product.topSeller) badges += `<span class="badge badge-hot">🔥 HOT</span>`;
  if (hasDiscount)        badges += `<span class="badge badge-sale">💥 SALE</span>`;
  if (!isAvail)           badges += `<span class="badge badge-outofstock">غير متوفر</span>`;

  const catMeta = product.category ? CATEGORY_META[product.category] : null;
  const catChip = catMeta
    ? `<span class="card-cat-chip" data-cat="${escapeAttr(product.category)}">${catMeta.label}</span>`
    : '';

  const igSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

  const tgSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

  const dcSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.082.114 18.105.134 18.12a19.919 19.919 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;

  /* ── منتج له variations → زر واحد فقط ── */
  if (hasVariations) {
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${escapeHtml(product.image)}"
             alt="${escapeHtml(product.title)}"
             onerror="this.src='https://via.placeholder.com/400x250/141414/555?text=No+Image'">
        ${badges}
        ${catChip}
      </div>
      <div class="product-body">
        <div class="product-title">${escapeHtml(product.title)}</div>
        <button type="button" class="btn btn-learn-more" data-learn-more>
          📄 معرفة المزيد حول المنتج
        </button>
        <div class="order-buttons" style="margin-top:12px;">
          <button type="button"
                  class="btn btn-variation-picker"
                  data-open-variation-modal
                  data-product-id="${escapeHtml(String(product.id))}"
                  ${isAvail ? '' : 'disabled'}>
            🛒 اختر الباقة المناسبة
          </button>
        </div>
      </div>
    `;
    return card;
  }

  /* ── منتج بدون variations → بطاقة عادية ── */
  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${escapeHtml(product.image)}"
           alt="${escapeHtml(product.title)}"
           onerror="this.src='https://via.placeholder.com/400x250/141414/555?text=No+Image'">
      ${badges}
      ${catChip}
    </div>
    <div class="product-body">
      <div class="product-title">${escapeHtml(product.title)}</div>
      <button type="button" class="btn btn-learn-more" data-learn-more>
        📄 معرفة المزيد حول المنتج
      </button>
      <div class="price-row">
        ${hasDiscount
          ? `<span class="price-original">${formatPrice(basePriceNoVar)} DA</span>`
          : ''}
        <span class="price-final" data-final-price="${initialPrice}">
          ${formatPrice(initialPrice)} DA
        </span>
        <span class="applied-promo-tag" data-promo-tag></span>
      </div>
      <div class="promo-apply-row">
        <input type="text" placeholder="كود الخصم"
               data-promo-input maxlength="20" ${isAvail ? '' : 'disabled'}>
        <button class="btn btn-apply btn-sm" data-apply-promo
                ${isAvail ? '' : 'disabled'}>تطبيق</button>
      </div>
      <div class="promo-msg" data-promo-msg></div>
      <div class="order-buttons">
        <a href="${instagramHref}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn btn-instagram card-order-btn"
           data-order="instagram"
           data-product-id="${escapeHtml(String(product.id))}"
           title="تواصل عبر انستغرام">
          ${igSvg} انستغرام
        </a>
        <a href="${isAvail ? escapeHtml(telegramHref) : 'https://t.me/DzVibesShop'}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn btn-telegram card-order-btn${isAvail ? '' : ' btn-disabled-look'}"
           data-order="telegram"
           data-product-id="${escapeHtml(String(product.id))}"
           title="اطلب عبر التيليغرام"
           ${isAvail ? '' : 'aria-disabled="true"'}>
          ${tgSvg} تيليغرام
        </a>
        <a href="${escapeHtml(discordHref)}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn btn-discord card-order-btn"
           data-order="discord"
           data-product-id="${escapeHtml(String(product.id))}"
           title="اطلب عبر الديسكورد">
          ${dcSvg} ديسكورد
        </a>
      </div>
    </div>
  `;

  return card;
}

/* ══════════════════════════════════════════════════════════════════════════
   EVENT DELEGATION — product card clicks
   ══════════════════════════════════════════════════════════════════════════ */
let _cachedProducts = [];

productsGrid.addEventListener('click', async (e) => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  const productId = card.dataset.id;

  /* ── زر "اختر الباقة المناسبة" ── */
  if (e.target.closest('[data-open-variation-modal]')) {
    const product = _cachedProducts.find(p => String(p.id) === String(productId));
    if (!product) return;
    openVariationPickerModal(product);
    return;
  }

  /* ── زر تطبيق كود الخصم (بطاقات بدون variations) ── */
  if (e.target.closest('[data-apply-promo]')) {
    handleApplyPromo(card, productId);
    return;
  }

  /* ── أزرار الطلب (بطاقات بدون variations) ── */
  const orderLink = e.target.closest('.card-order-btn');
  if (orderLink) {
    const platform = orderLink.dataset.order;

    if (platform === 'discord') {
      e.preventDefault();
      const product = _cachedProducts.find(p => String(p.id) === String(productId));
      if (!product) return;
      const finalPrice   = parseFloat(card.querySelector('.price-final').dataset.finalPrice);
      const appliedPromo = appliedPromosPerCard[productId] || null;
      sendDiscordWebhookEmbed(product, finalPrice, appliedPromo, null);
      // ✅ FIXED: يستخدم product.discordLink (من discord_link في DB)
      const discordUrl = (product.discordLink && product.discordLink.trim() &&
                          product.discordLink.trim() !== '#')
                          ? product.discordLink.trim()
                          : CONFIG.DISCORD_INVITE;
      window.open(discordUrl, '_blank');
      return;
    }

    if (platform === 'telegram') {
      e.preventDefault();
      const product = _cachedProducts.find(p => String(p.id) === String(productId));
      if (!product) return;
      // ✅ FIXED: يستخدم product.available (من is_available في DB)
      if (!product.available) {
        showToast('⚠️ هذا المنتج غير متوفر حالياً.');
        return;
      }
      const finalPrice   = parseFloat(card.querySelector('.price-final').dataset.finalPrice);
      const appliedPromo = appliedPromosPerCard[productId] || null;
      const msg          = buildOrderMessage(product, finalPrice, appliedPromo, null);
      const url          = resolveOrderLink('telegram', product, msg);
      window.open(url, '_blank');
      return;
    }

    return;
  }

  /* ── زر "معرفة المزيد" ── */
  if (e.target.closest('[data-learn-more]')) {
    let product = _cachedProducts.find(p => String(p.id) === String(productId));
    if (!product) {
      const all = await fetchProducts();
      _cachedProducts = all;
      product = all.find(p => String(p.id) === String(productId));
    }
    if (!product) return;

    const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;
    const finalPrice = hasVariations
      ? 0
      : parseFloat(card.querySelector('.price-final').dataset.finalPrice);

    openProductDetailsModal(product, finalPrice, null);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   PROMO CODE — card level
   ══════════════════════════════════════════════════════════════════════════ */
const appliedPromosPerCard = {};

async function handleApplyPromo(card, productId) {
  const input    = card.querySelector('[data-promo-input]');
  const msgEl    = card.querySelector('[data-promo-msg]');
  const applyBtn = card.querySelector('[data-apply-promo]');
  const code     = input.value.trim().toUpperCase();

  if (!code) {
    showPromoMsg(msgEl, 'يرجى إدخال كود.', false);
    return;
  }

  applyBtn.disabled    = true;
  applyBtn.textContent = '...';
  msgEl.textContent    = '';

  const promos = await fetchPromoCodes();

  applyBtn.disabled    = false;
  applyBtn.textContent = 'تطبيق';

  const match = promos.find(p => p.code.toUpperCase() === code);

  if (!match || !match.isActive || !(match.discountValue > 0)) {
    showPromoMsg(msgEl, 'كود غير صالح / Invalid code', false);
    delete appliedPromosPerCard[productId];
    updateCardPriceDisplay(card, productId);
    return;
  }

  appliedPromosPerCard[productId] = match;
  showPromoMsg(msgEl, `✅ "${match.code}" مطبّق: -${match.discountValue}%`, true);
  updateCardPriceDisplay(card, productId);
}

function showPromoMsg(el, text, success) {
  el.textContent = text;
  el.className   = 'promo-msg ' + (success ? 'success' : 'error');
}

function updateCardPriceDisplay(card, productId) {
  const product = _cachedProducts.find(p => String(p.id) === String(productId));
  if (!product) return;

  const base    = calculateFinalPrice(product.cost, product.profitPercent, product.discountPercent);
  const priceEl = card.querySelector('.price-final');
  const tagEl   = card.querySelector('[data-promo-tag]');
  const applied = appliedPromosPerCard[productId];
  let displayed = base;

  if (applied) {
    displayed           = base * (1 - applied.discountValue / 100);
    tagEl.textContent   = `كود: ${applied.code}`;
    tagEl.style.display = 'inline-block';
  } else {
    tagEl.style.display = 'none';
  }

  priceEl.textContent        = `${formatPrice(displayed)} DA`;
  priceEl.dataset.finalPrice = displayed;
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIATION PICKER MODAL — STATE & LOGIC
   ══════════════════════════════════════════════════════════════════════════ */
let _varModal = {
  product:           null,
  selectedVariation: null,
  appliedPromo:      null,
  displayedPrice:    0
};

function openVariationPickerModal(product) {
  buildVariationPickerModalDOM();

  const overlay    = document.getElementById('variationPickerOverlay');
  const imgEl      = document.getElementById('varModalImage');
  const titleEl    = document.getElementById('varModalTitle');
  const catBadgeEl = document.getElementById('varModalCatBadge');
  const pkgListEl  = document.getElementById('varModalPackagesList');
  const nameEl     = document.getElementById('varModalSelectedName');
  const priceEl    = document.getElementById('varModalPriceValue');
  const promoInput = document.getElementById('varModalPromoInput');
  const promoMsg   = document.getElementById('varModalPromoMsg');
  const tgBtn      = document.getElementById('varModalTelegramBtn');
  const hintEl     = document.getElementById('varModalHint');

  // إعادة تهيئة الحالة
  _varModal = {
    product:           product,
    selectedVariation: null,
    appliedPromo:      null,
    displayedPrice:    0
  };

  imgEl.src           = product.image;
  imgEl.alt           = product.title;
  titleEl.textContent = product.title;

  const catMeta = product.category ? CATEGORY_META[product.category] : null;
  if (catMeta) {
    catBadgeEl.textContent   = catMeta.label;
    catBadgeEl.style.display = 'inline-block';
  } else {
    catBadgeEl.style.display = 'none';
  }

  promoInput.value    = '';
  promoMsg.textContent = '';
  promoMsg.className  = 'var-modal-promo-msg';

  nameEl.textContent  = '—';
  priceEl.textContent = '— DA';

  tgBtn.disabled        = true;
  hintEl.style.display  = 'block';

  // بناء قائمة الباقات
  pkgListEl.innerHTML = '';

  if (!Array.isArray(product.variations) || product.variations.length === 0) {
    pkgListEl.innerHTML = `<p style="color:#555;text-align:center;padding:20px 0;">لا توجد باقات متاحة لهذا المنتج.</p>`;
  } else {
    product.variations.forEach(v => {
      // ✅ FIXED: يستخدم v.is_available (الحقل الصحيح داخل JSONB)
      const isDisabled = !v.is_available;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'var-modal-pkg-btn' + (isDisabled ? ' var-pkg-disabled' : '');
      btn.dataset.variationId = String(v.id);
      btn.disabled = isDisabled;

      btn.innerHTML = `
        <div class="var-pkg-name">
          <span class="var-pkg-icon">📦</span>
          <span class="var-pkg-name-text">${escapeHtml(v.name)}</span>
          ${isDisabled ? `<span class="var-pkg-unavailable-tag">غير متوفر</span>` : ''}
        </div>
        <span class="var-pkg-price-tag">${formatPrice(v.price)} DA</span>
        <span class="var-pkg-selected-check">✓</span>
      `;

      if (!isDisabled) {
        btn.addEventListener('click', () => _varModalSelectPackage(v));
      }

      pkgListEl.appendChild(btn);
    });
  }

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function _varModalSelectPackage(variation) {
  _varModal.selectedVariation = variation;

  const pkgListEl = document.getElementById('varModalPackagesList');
  pkgListEl.querySelectorAll('.var-modal-pkg-btn').forEach(btn => {
    btn.classList.toggle(
      'var-pkg-selected',
      btn.dataset.variationId === String(variation.id)
    );
  });

  _varModalRecalcPrice();

  const tgBtn  = document.getElementById('varModalTelegramBtn');
  const hintEl = document.getElementById('varModalHint');
  if (tgBtn)  tgBtn.disabled      = false;
  if (hintEl) hintEl.style.display = 'none';
}

function _varModalRecalcPrice() {
  if (!_varModal.selectedVariation) return;

  const base  = parseFloat(_varModal.selectedVariation.price) || 0;
  const promo = _varModal.appliedPromo;
  const final = promo ? base * (1 - promo.discountValue / 100) : base;

  _varModal.displayedPrice = final;

  const nameEl  = document.getElementById('varModalSelectedName');
  const priceEl = document.getElementById('varModalPriceValue');

  if (nameEl)  nameEl.textContent  = _varModal.selectedVariation.name;
  if (priceEl) {
    priceEl.textContent     = `${formatPrice(final)} DA`;
    priceEl.style.transform = 'scale(1.08)';
    priceEl.style.color     = '#ff4d4d';
    setTimeout(() => { priceEl.style.transform = 'scale(1)'; }, 180);
  }
}

function closeVariationPickerModal() {
  const overlay = document.getElementById('variationPickerOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  document.body.style.overflow = '';

  _varModal = {
    product:           null,
    selectedVariation: null,
    appliedPromo:      null,
    displayedPrice:    0
  };
}

function bindVariationModalEvents() {
  const overlay       = document.getElementById('variationPickerOverlay');
  const closeBtn      = document.getElementById('varModalCloseBtn');
  const promoInput    = document.getElementById('varModalPromoInput');
  const promoApplyBtn = document.getElementById('varModalPromoApplyBtn');
  const tgBtn         = document.getElementById('varModalTelegramBtn');
  const igBtn         = document.getElementById('varModalInstagramBtn');
  const dcBtn         = document.getElementById('varModalDiscordBtn');

  closeBtn.addEventListener('click', closeVariationPickerModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeVariationPickerModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) {
      closeVariationPickerModal();
    }
  });

  promoApplyBtn.addEventListener('click', async () => {
    const code     = promoInput.value.trim().toUpperCase();
    const promoMsg = document.getElementById('varModalPromoMsg');

    if (!code) {
      promoMsg.textContent = 'يرجى إدخال كود الخصم.';
      promoMsg.className   = 'var-modal-promo-msg error';
      return;
    }

    promoApplyBtn.disabled    = true;
    promoApplyBtn.textContent = '...';
    promoMsg.textContent      = '';

    const promos = await fetchPromoCodes();

    promoApplyBtn.disabled    = false;
    promoApplyBtn.textContent = 'تطبيق';

    const match = promos.find(p => p.code.toUpperCase() === code);

    if (!match || !match.isActive || !(match.discountValue > 0)) {
      promoMsg.textContent   = 'كود غير صالح / Invalid code';
      promoMsg.className     = 'var-modal-promo-msg error';
      _varModal.appliedPromo = null;
      _varModalRecalcPrice();
      return;
    }

    _varModal.appliedPromo = match;
    promoMsg.textContent   = `✅ "${match.code}" مطبّق: -${match.discountValue}%`;
    promoMsg.className     = 'var-modal-promo-msg success';
    _varModalRecalcPrice();
  });

  tgBtn.addEventListener('click', () => {
    if (!_varModal.product || !_varModal.selectedVariation) {
      showToast('⚠️ يرجى اختيار باقة أولاً.');
      return;
    }
    const { product, selectedVariation, appliedPromo, displayedPrice } = _varModal;
    const msg = buildOrderMessage(product, displayedPrice, appliedPromo, selectedVariation);
    const url = resolveOrderLink('telegram', product, msg);
    sendDiscordWebhookEmbed(product, displayedPrice, appliedPromo, selectedVariation);
    window.open(url, '_blank');
    closeVariationPickerModal();
  });

  igBtn.addEventListener('click', () => {
    if (_varModal.product && _varModal.selectedVariation) {
      sendDiscordWebhookEmbed(
        _varModal.product,
        _varModal.displayedPrice,
        _varModal.appliedPromo,
        _varModal.selectedVariation
      );
    }
    window.open(CONFIG.INSTAGRAM_URL, '_blank');
    closeVariationPickerModal();
  });

  dcBtn.addEventListener('click', () => {
    if (!_varModal.product || !_varModal.selectedVariation) {
      showToast('⚠️ يرجى اختيار باقة أولاً.');
      return;
    }
    const { product, selectedVariation, appliedPromo, displayedPrice } = _varModal;
    sendDiscordWebhookEmbed(product, displayedPrice, appliedPromo, selectedVariation);
    // ✅ FIXED: يستخدم product.discordLink (من discord_link في DB)
    const discordUrl = (product.discordLink && product.discordLink.trim() &&
                        product.discordLink.trim() !== '#')
                        ? product.discordLink.trim()
                        : CONFIG.DISCORD_INVITE;
    window.open(discordUrl, '_blank');
    closeVariationPickerModal();
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCT DETAILS MODAL
   ══════════════════════════════════════════════════════════════════════════ */
const productDetailsModalOverlay = document.getElementById('productDetailsModal');
const modalProductImage          = document.getElementById('modalProductImage');
const modalProductTitle          = document.getElementById('modalProductTitle');
const modalProductDescription    = document.getElementById('modalProductDescription');
const modalProductPrice          = document.getElementById('modalProductPrice');
const modalOutOfStockNote        = document.getElementById('modalOutOfStockNote');
const productModalCloseBtn       = document.getElementById('productModalCloseBtn');
const modalCategoryBadge         = document.getElementById('modalCategoryBadge');
const modalInstagramBtn          = document.getElementById('modalInstagramBtn');
const modalTelegramBtn           = document.getElementById('modalTelegramBtn');
const modalDiscordBtn            = document.getElementById('modalDiscordBtn');

let currentModalContext = null;

function openProductDetailsModal(product, finalPrice, variation = null) {
  const appliedPromo = appliedPromosPerCard[product.id] || null;
  currentModalContext = { product, finalPrice, appliedPromo, variation };

  modalProductImage.src         = product.image;
  modalProductImage.alt         = product.title;
  modalProductTitle.textContent = product.title;
  modalProductDescription.textContent = product.description?.trim()
    ? product.description
    : 'لا يوجد وصف إضافي لهذا المنتج حالياً.\nNo additional description provided yet.';

  const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;

  if (hasVariations) {
    modalProductPrice.textContent = `${product.variations.length} باقة/باقات متاحة — اختر من البطاقة المنبثقة`;
  } else {
    modalProductPrice.textContent = variation
      ? `${formatPrice(finalPrice)} DA — ${variation.name}`
      : `${formatPrice(finalPrice)} DA`;
  }

  const catMeta = product.category ? CATEGORY_META[product.category] : null;
  if (catMeta) {
    modalCategoryBadge.textContent   = catMeta.label;
    modalCategoryBadge.style.display = 'inline-block';
  } else {
    modalCategoryBadge.style.display = 'none';
  }

  const orderMsg = buildOrderMessage(product, finalPrice, appliedPromo, variation);
  modalInstagramBtn.href = CONFIG.INSTAGRAM_URL;
  modalInstagramBtn.setAttribute('target', '_blank');
  modalInstagramBtn.setAttribute('rel', 'noopener noreferrer');

  if (hasVariations) {
    modalTelegramBtn.href = '#';
    modalDiscordBtn.href  = '#';

    modalTelegramBtn.onclick = (e) => {
      e.preventDefault();
      closeProductDetailsModal();
      openVariationPickerModal(product);
    };

    modalDiscordBtn.onclick = (e) => {
      e.preventDefault();
      closeProductDetailsModal();
      openVariationPickerModal(product);
    };

    modalOutOfStockNote.style.display = 'none';
    modalTelegramBtn.classList.remove('btn-disabled-look');
    modalTelegramBtn.removeAttribute('aria-disabled');
    modalTelegramBtn.style.opacity = '';
  } else {
    const telegramUrl = resolveOrderLink('telegram', product, orderMsg);
    modalTelegramBtn.href = telegramUrl;
    modalTelegramBtn.setAttribute('target', '_blank');
    modalTelegramBtn.setAttribute('rel', 'noopener noreferrer');
    modalTelegramBtn.onclick = null;

    // ✅ FIXED: يستخدم product.discordLink (من discord_link في DB)
    const discordUrl = (product.discordLink && product.discordLink.trim() &&
                        product.discordLink.trim() !== '#')
                        ? product.discordLink.trim()
                        : CONFIG.DISCORD_INVITE;
    modalDiscordBtn.href = discordUrl;
    modalDiscordBtn.setAttribute('target', '_blank');
    modalDiscordBtn.setAttribute('rel', 'noopener noreferrer');

    modalDiscordBtn.onclick = (e) => {
      e.preventDefault();
      sendDiscordWebhookEmbed(product, finalPrice, appliedPromo, variation);
      window.open(discordUrl, '_blank');
    };

    // ✅ FIXED: يستخدم product.available (من is_available في DB)
    if (product.available) {
      modalOutOfStockNote.style.display = 'none';
      modalTelegramBtn.classList.remove('btn-disabled-look');
      modalTelegramBtn.removeAttribute('aria-disabled');
      modalTelegramBtn.style.pointerEvents = '';
      modalTelegramBtn.style.opacity       = '';
    } else {
      modalOutOfStockNote.style.display = 'block';
      modalTelegramBtn.classList.add('btn-disabled-look');
      modalTelegramBtn.setAttribute('aria-disabled', 'true');
      modalTelegramBtn.style.opacity = '0.45';
    }

    modalDiscordBtn.classList.remove('btn-disabled-look');
    modalDiscordBtn.removeAttribute('aria-disabled');
    modalDiscordBtn.style.pointerEvents = '';
    modalDiscordBtn.style.opacity       = '';
  }

  productDetailsModalOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProductDetailsModal() {
  productDetailsModalOverlay.classList.remove('show');
  document.body.style.overflow = '';
  currentModalContext = null;
}

productModalCloseBtn.addEventListener('click', closeProductDetailsModal);
productDetailsModalOverlay.addEventListener('click', (e) => {
  if (e.target === productDetailsModalOverlay) closeProductDetailsModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && productDetailsModalOverlay.classList.contains('show'))
    closeProductDetailsModal();
});

/* ══════════════════════════════════════════════════════════════════════════
   VARIATION PICKER BUTTON STYLE
   ══════════════════════════════════════════════════════════════════════════ */
function injectVariationPickerBtnStyle() {
  if (document.getElementById('dzvibes-varpickerbtn-style')) return;
  const style = document.createElement('style');
  style.id = 'dzvibes-varpickerbtn-style';
  style.textContent = `
    .btn-variation-picker {
      width: 100%;
      background: linear-gradient(135deg, #ff1a1a 0%, #cc0000 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 15px;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.22s ease;
      box-shadow: 0 4px 18px rgba(255, 26, 26, 0.3);
      -webkit-tap-highlight-color: transparent;
      letter-spacing: 0.2px;
    }
    .btn-variation-picker:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(255, 26, 26, 0.5);
      background: linear-gradient(135deg, #ff3333 0%, #e60000 100%);
    }
    .btn-variation-picker:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(255, 26, 26, 0.3);
    }
    .btn-variation-picker:disabled {
      opacity: 0.38;
      cursor: not-allowed;
      box-shadow: none;
      background: #333;
    }
  `;
  document.head.appendChild(style);
}
injectVariationPickerBtnStyle();

/* ══════════════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════════════ */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}