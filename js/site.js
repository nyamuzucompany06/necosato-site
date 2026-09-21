/* =========================================================
   ASSET PATHS
========================================================= */
const ASSET_PATHS = {
  catCard1: "assets/images/catCard1.png",
  catCard2: "assets/images/catCard2.png",
  catCard3: "assets/images/catCard3.png"
};

/* =========================================================
   API HELPERS (Cloudflare Pages Functions + D1 + R2)
   公開サイト側は読み取り専用。データの登録・編集は管理画面から行う。
========================================================= */
const DEFAULT_SETTINGS = {
  wishlistUrl:"https://www.amazon.jp/hz/wishlist/ls/",
  signatureUrl:"https://www.change.org/",
  instagramUrl:"https://www.instagram.com/",
  lineUrl:"https://line.me/",
  phone:"090-6610-2948",
  representative:"野田 ひとみ"
};

async function loadCats(){
  try{
    const res = await fetch("/api/cats");
    if(res.ok) return await res.json();
  }catch(e){ console.error("load cats failed", e); }
  return [];
}
async function loadSettings(){
  try{
    const res = await fetch("/api/settings");
    if(res.ok) return await res.json();
  }catch(e){ console.error("load settings failed", e); }
  return DEFAULT_SETTINGS;
}

/* =========================================================
   APP STATE

/* =========================================================
   APP STATE
========================================================= */
const state = {
  cats: [],
  settings: {},
  filterStatus: "すべて",
  filterGender: "すべて",
  page: 1,
  pageSize: 6,
  loading: true
};

function showToast(msg){
  let t = document.getElementById("toast");
  if(!t){
    t = document.createElement("div");
    t.id="toast"; t.className="toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* =========================================================
   RENDER FUNCTIONS
========================================================= */
function renderHeader(){
  return `
  <header class="site-header">
    <div class="header-inner">
      <img class="logo logo-desktop" src="assets/images/logo.png" alt="necosato">
      <img class="logo-mobile" src="assets/images/mascot.png" alt="necosato">
      <nav class="main-nav">
        <a href="#about" class="nav-hide-mobile">活動について</a>
        <a href="#cats">猫を見る</a>
        <a href="#support">支援する</a>
        <a href="#contact" class="nav-contact-only">お問い合わせ</a>
      </nav>
      <div class="header-icons">
        <a href="${state.settings.instagramUrl||'#'}" target="_blank" rel="noopener" aria-label="Instagram"><img src="assets/images/iconInsta.png" alt=""></a>
        <a href="${state.settings.lineUrl||'#'}" target="_blank" rel="noopener" aria-label="公式LINE"><img src="assets/images/iconSNS.png" alt=""></a>
      </div>
    </div>
  </header>`;
}

function renderHero(){
  return `
  <section class="hero" id="top">
    <div class="wrap hero-grid">
      <div>
        <div class="eyebrow hero-eyebrow"><img src="assets/images/pawRed.png" alt="">nyamuzu company</div>
        <h1 class="hero-title">この子たちの、<br><span class="accent">あたらしい家族を</span><br>さがしています。</h1>
        <p class="hero-desc">ねこさとは、行き場のない猫達を保護し、里親さんとの出会いをつなぐ団体です。一匹一匹の性格や体調に向き合いながら、幸せな暮らしへの一歩をお手伝いしています。</p>
        <div class="hero-buttons">
          <a class="img-btn btn-red" href="#cats"><img src="assets/images/frameGoCats.png" alt=""><span class="btn-label">猫たちに会いに行く →</span></a>
          <a class="img-btn btn-white" href="#support"><img src="assets/images/frameKnowSupport.png" alt=""><span class="btn-label">支援について知る</span></a>
        </div>
      </div>
      <div class="hero-photos">
        <img class="hp1" src="assets/images/cat1.png" alt="">
        <img class="hp2" src="assets/images/cat2.png" alt="">
        <img class="hp3" src="assets/images/cat3.png" alt="">
      </div>
    </div>
  </section>`;
}

function renderAbout(){
  return `
  <section class="about" id="about">
    <div class="wrap about-grid">
      <div class="about-text-top">
        <div class="eyebrow about-eyebrow"><img src="assets/images/pawRed.png" alt="">about us</div>
        <div class="heading-text-wrap with-hook">
          <img class="heading-squiggle" src="assets/images/decoAbout.png" alt="">
          <h2 class="heading-text">ねこさとってどんな団体？</h2>
        </div>
      </div>
      <div class="about-visual">
        <div class="mascot-frame"><img src="assets/images/mascot.png" alt="necosato"></div>
      </div>
      <div class="about-text-bottom">
        <p class="about-desc">わたしたちは、地域で暮らす行き場のない猫たちを保護し、健康チェックや不妊去勢手術を行ったうえで、新しい里親さんとの出会いの場をつくっています。ボランティアと寄付、そして里親さんの温かい手によって、一匹でも多くの猫が安心できる居場所を見つけられるよう活動しています。</p>
        <div class="steps">
          <div class="step"><div class="step-num">1</div><div class="step-text"><div class="step-title">保護活動</div><div class="step-sub">行き場を失った猫の保護・一時預かり</div></div></div>
          <div class="step"><div class="step-num">2</div><div class="step-text"><div class="step-title">健康管理</div><div class="step-sub">ワクチン接種・不妊去勢手術の実施</div></div></div>
          <div class="step"><div class="step-num">3</div><div class="step-text"><div class="step-title">里親探し</div><div class="step-sub">猫たちの新しい家族探し</div></div></div>
        </div>
      </div>
    </div>
  </section>`;
}

function getFilteredCats(){
  return state.cats.filter(c=>{
    const okStatus = state.filterStatus === "すべて" || c.status === state.filterStatus;
    const okGender = state.filterGender === "すべて" || c.gender === state.filterGender;
    return okStatus && okGender;
  });
}

function renderCatCard(cat){
  const photoSrc = ASSET_PATHS[cat.image] || cat.image || "assets/images/mascot.png";
  return `
  <div class="cat-card">
    <img class="cat-card-image" src="${photoSrc}" alt="${cat.name||''}" draggable="false">
  </div>`;
}

function renderPlaceholderCard(){
  return `<div class="cat-card placeholder"><img src="assets/images/logo.png" alt=""></div>`;
}

function renderCats(){
  const filtered = getFilteredCats();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  if(state.page > totalPages) state.page = totalPages;
  const startIdx = (state.page-1)*state.pageSize;
  const pageCats = filtered.slice(startIdx, startIdx+state.pageSize);
  const fillers = Math.max(0, state.pageSize - pageCats.length);

  const tabs = ["すべて","募集中","里親決定"];
  const tabsHtml = tabs.map(t=>`
    <button class="${state.filterStatus===t?'active':''}" data-tab="${t}">
      ${t}${state.filterStatus===t?`<img class="underline" src="assets/images/decoAll.png" alt="">`:""}
    </button>`).join("");

  const pagBtns = [];
  pagBtns.push(`<button class="nav-btn" id="pg-prev" ${state.page===1?"disabled":""}>‹ 前へ</button>`);
  for(let i=1;i<=totalPages;i++){
    if(i===1||i===totalPages||Math.abs(i-state.page)<=1){
      pagBtns.push(`<button class="${i===state.page?'active':''}" data-page="${i}">${i}</button>`);
    } else if(pagBtns[pagBtns.length-1] && !pagBtns[pagBtns.length-1].includes("dots")){
      pagBtns.push(`<span class="dots">…</span>`);
    }
  }
  pagBtns.push(`<button class="nav-btn" id="pg-next" ${state.page===totalPages?"disabled":""}>次へ ›</button>`);

  return `
  <section class="cats" id="cats">
    <div class="wrap">
      <div class="cats-head">
        <div>
          <div class="eyebrow about-eyebrow eyebrow-helpcats"><img src="assets/images/pawYellow.png" alt="">help cats</div>
          <div class="heading-text-wrap with-hook cats-heading">
            <img class="heading-squiggle" src="assets/images/decoCats.png" alt="">
            <h2 class="heading-text">里親募集中の猫たち</h2>
          </div>
        </div>
        <p class="cats-desc">現在${state.cats.length}匹以上の子たちが新しい家族を待っています。気になる子がいたら、まずはお気軽にお問い合わせください。</p>
      </div>
      <div class="cats-controls">
        <div class="status-tabs">${tabsHtml}</div>
        <div class="mobile-filter-row">
          <div class="filter-select-group">
            <span>絞り込み</span>
            <select class="status-select-mobile">
              <option ${state.filterStatus==="すべて"?"selected":""}>すべて</option>
              <option ${state.filterStatus==="募集中"?"selected":""}>募集中</option>
              <option ${state.filterStatus==="里親決定"?"selected":""}>里親決定</option>
            </select>
          </div>
          <div class="filter-select-group">
            <span>性別</span>
            <select class="gender-select-input">
              <option ${state.filterGender==="すべて"?"selected":""}>すべて</option>
              <option ${state.filterGender==="女の子"?"selected":""}>女の子</option>
              <option ${state.filterGender==="男の子"?"selected":""}>男の子</option>
            </select>
          </div>
        </div>
        <div class="gender-filter">
          <select class="gender-select-input">
            <option ${state.filterGender==="すべて"?"selected":""}>すべて</option>
            <option ${state.filterGender==="女の子"?"selected":""}>女の子</option>
            <option ${state.filterGender==="男の子"?"selected":""}>男の子</option>
          </select>
        </div>
      </div>
      <div class="cats-grid">
        ${pageCats.map(renderCatCard).join("")}
        ${Array(fillers).fill(0).map(renderPlaceholderCard).join("")}
      </div>
      <div class="pagination">${pagBtns.join("")}</div>
    </div>
  </section>`;
}

function renderSupport(){
  const s = state.settings;
  return `
  <section class="support" id="support">
    <div class="wrap">
      <div class="support-header">
        <div class="eyebrow about-eyebrow"><img src="assets/images/pawRed.png" alt="">support</div>
        <div class="heading-text-wrap with-hook support-heading">
          <img class="heading-squiggle" src="assets/images/decoSupport.png" alt="">
          <h2 class="heading-text">できることから、支援を</h2>
        </div>
      </div>
      <p class="support-lead">みなさまのご支援が猫たちの毎日を支えています。</p>
      <div class="support-boxes">
        <div class="support-box">
          <div class="support-icon"><img src="assets/images/iconWishlist.png" alt=""></div>
          <div class="support-text"><div class="support-title">寄付</div><div class="support-sub">フード・猫砂・タオル等を直接おとどけいただけます</div></div>
          <a class="img-btn" href="${s.wishlistUrl}" target="_blank" rel="noopener"><img src="assets/images/frameWishlist.png" alt="ほしいものリストへ"></a>
        </div>
        <div class="support-box">
          <div class="support-icon"><img src="assets/images/iconSignature.png" alt=""></div>
          <div class="support-text"><div class="support-title">オンライン署名にご協力ください</div><div class="support-sub">飼い主のいない猫の不妊去勢手術への助成拡充など、行政による支援強化を求める署名活動を行っています。</div></div>
          <a class="img-btn" href="${s.signatureUrl}" target="_blank" rel="noopener"><img src="assets/images/frameSignature.png" alt="署名サイトへ"></a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderContact(){
  const s = state.settings;
  return `
  <section class="contact" id="contact">
    <div class="wrap">
      <div class="contact-inner">
        <div class="contact-header">
          <div class="eyebrow about-eyebrow"><img src="assets/images/pawRed.png" alt="">contact us</div>
          <div class="heading-text-wrap contact-heading">
            <h2 class="heading-text">お問い合わせ</h2>
            <img class="heading-squiggle" src="assets/images/decoContact.png" alt="">
          </div>
          <p class="contact-desc">SNSやお電話にてお問合せをお待ちしております。</p>
        </div>
        <div class="contact-body">
          <div class="follow-note">
            <img class="follow-doodle" src="assets/images/decoFollow.png" alt="">
            <p class="follow-text">猫たちの最新情報も発信しています。<br><span class="peek-line">のぞいてみてね</span></p>
          </div>
          <div class="contact-methods">
            <div class="sns-buttons">
              <a class="sns-btn insta" href="${s.instagramUrl}" target="_blank" rel="noopener"><img src="assets/images/iconInstaColor.png" alt="">Instagramはこちら</a>
              <a class="sns-btn line" href="${s.lineUrl}" target="_blank" rel="noopener"><img src="assets/images/iconSNSColor.png" alt="">公式LINEはこちら</a>
            </div>
            <div class="or-divider"><span class="divider-line"></span><span>または</span><span class="divider-line"></span></div>
            <div class="phone-box">
              <img class="phone-icon" src="assets/images/iconContact.png" alt="">
              <div>
                <div class="phone-label">その他問い合わせ先</div>
                <div class="phone-num">${s.phone||""}</div>
                <div class="phone-rep">代表：${s.representative||""}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFooter(){
  return `
  <footer class="site-footer">
    <img class="logo-white" src="assets/images/logoWhite.png" alt="necosato">
    <nav>
      <a href="#about">活動について</a>
      <a href="#cats">猫を見る</a>
      <a href="#support">支援する</a>
      <a href="#contact">お問い合わせ</a>
    </nav>
  </footer>`;
}

function renderSite(){
  return `
    ${renderHeader()}
    ${renderHero()}
    ${renderAbout()}
    ${renderCats()}
    ${renderSupport()}
    ${renderContact()}
    ${renderFooter()}
  `;
}

/* =========================================================
   RENDER: ADMIN

/* =========================================================
   RENDER + EVENTS
========================================================= */
function render(){
  const app = document.getElementById("app");
  if(state.loading){
    app.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);">読み込み中...</div>`;
    return;
  }
  app.innerHTML = renderSite();
  bindEvents();
}

function bindEvents(){
  document.querySelectorAll(".status-tabs button").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.filterStatus = btn.dataset.tab; state.page=1; render(); document.getElementById("cats").scrollIntoView(); });
  });
  document.querySelectorAll(".gender-select-input").forEach(sel=>{
    sel.addEventListener("change", ()=>{ state.filterGender = sel.value; state.page=1; render(); });
  });
  document.querySelectorAll(".status-select-mobile").forEach(sel=>{
    sel.addEventListener("change", ()=>{ state.filterStatus = sel.value; state.page=1; render(); });
  });
  const prev = document.getElementById("pg-prev");
  const next = document.getElementById("pg-next");
  if(prev) prev.addEventListener("click", ()=>{ if(state.page>1){state.page--; render(); document.getElementById("cats").scrollIntoView();} });
  if(next) next.addEventListener("click", ()=>{ state.page++; render(); document.getElementById("cats").scrollIntoView(); });
  document.querySelectorAll("[data-page]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.page = parseInt(btn.dataset.page,10); render(); document.getElementById("cats").scrollIntoView(); });
  });
  bindCatZoom();
}

/* =========================================================
   CAT PHOTO LONG-PRESS ZOOM (Instagram風プレビュー)
========================================================= */
let catZoomOverlay = null;

function ensureCatZoomOverlay(){
  if(catZoomOverlay) return catZoomOverlay;
  catZoomOverlay = document.createElement("div");
  catZoomOverlay.className = "cat-zoom-overlay";
  catZoomOverlay.innerHTML = `<button type="button" class="cat-zoom-close" aria-label="閉じる">×</button><img class="cat-zoom-img" alt="">`;
  document.body.appendChild(catZoomOverlay);
  catZoomOverlay.querySelector(".cat-zoom-close").addEventListener("click", (e)=>{ e.stopPropagation(); hideCatZoom(); });
  return catZoomOverlay;
}

function showCatZoom(src, alt){
  const overlay = ensureCatZoomOverlay();
  const img = overlay.querySelector("img");
  img.src = src;
  img.alt = alt || "";
  overlay.classList.add("show");
}

function hideCatZoom(){
  if(catZoomOverlay) catZoomOverlay.classList.remove("show");
}

function bindCatZoom(){
  document.querySelectorAll(".cat-card-image").forEach(img=>{
    let pressTimer = null;
    let zoomed = false;
    const start = (e)=>{
      zoomed = false;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(()=>{
        zoomed = true;
        showCatZoom(img.src, img.alt);
      }, 350);
    };
    const stop = ()=>{
      clearTimeout(pressTimer);
      if(zoomed) hideCatZoom();
      zoomed = false;
    };
    img.addEventListener("pointerdown", start);
    img.addEventListener("pointerup", stop);
    img.addEventListener("pointerleave", stop);
    img.addEventListener("pointercancel", stop);
    img.addEventListener("contextmenu", (e)=>{ if(zoomed) e.preventDefault(); });
  });
  // 拡大表示中に画面のどこを触っても閉じる
  const overlay = ensureCatZoomOverlay();
  overlay.addEventListener("pointerdown", hideCatZoom);
}

/* =========================================================
   INIT
========================================================= */
(async function init(){
  render();
  const [cats, settings] = await Promise.all([loadCats(), loadSettings()]);
  state.cats = cats;
  state.settings = settings;
  state.loading = false;
  render();
})();
