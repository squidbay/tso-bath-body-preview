// Tso Bath & Body preview — menu, bag, product states, chat, forms, tabs, search.
// No third-party scripts, no tracking, no network requests beyond this site's own files.
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.body.dataset.root || '';
  const ICON = {
    check: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    spinner: '<svg class="icon spin" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/></svg>',
    alert: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/></svg>',
    trash: '<svg class="icon icon-sm" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    minus: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: state lives for this page only */ } },
  };
  let memBag = null;
  const getBag = () => memBag || (memBag = store.get('tso-bag', {}));
  const setBag = (b) => { memBag = b; store.set('tso-bag', b); renderCount(); };
  const bagItems = () => Object.values(getBag()).reduce((a, b) => a + b, 0);

  let products = null;
  const loadProducts = () => products ? Promise.resolve(products)
    : fetch(root + 'assets/js/products.json').then((r) => r.json()).then((d) => (products = d));

  function renderCount() {
    const n = bagItems();
    $$('[data-bag-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    $$('.util-bag').forEach((a) => a.setAttribute('aria-label', n ? `Bag, ${n} ${n === 1 ? 'item' : 'items'}` : 'Bag, empty'));
    $$('[data-bag-items]').forEach((el) => { el.textContent = n; });
  }
  renderCount();

  // ---------- toast ----------
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(html, ms = 4000) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { toastEl.hidden = true; }, ms);
  }

  // ---------- header: sticky blur, dropdown, drawer ----------
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $$('.has-menu').forEach((li) => {
    const btn = $('.menu-toggle', li);
    const set = (open) => { li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
    let hoverAt = 0;
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(Date.now() - hoverAt < 500 ? true : !li.classList.contains('open')); });
    li.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { hoverAt = Date.now(); set(true); } });
    li.addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) set(false); });
    li.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
    document.addEventListener('click', (e) => { if (!li.contains(e.target)) set(false); });
  });

  const drawer = $('#drawer');
  const scrim = $('.drawer-scrim');
  const openers = $$('[data-menu-open]');
  let lastFocus = null;
  let lockY = 0;
  function lock(on) {
    if (on) { lockY = window.scrollY; document.body.classList.add('locked'); }
    else { document.body.classList.remove('locked'); window.scrollTo(0, lockY); }
  }
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open; scrim.hidden = !open;
    openers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
    lock(open);
    if (open) { lastFocus = document.activeElement; drawer.focus(); }
    else if (lastFocus) lastFocus.focus();
  }
  openers.forEach((b) => b.addEventListener('click', () => setDrawer(true)));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && !drawer.hidden) setDrawer(false);
    if (e.key === 'Tab' && drawer && !drawer.hidden) {
      const f = $$('a,button', drawer); const first = f[0]; const last = f[f.length - 1];
      if (document.activeElement === drawer) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width:1180px)').addEventListener('change', (m) => { if (m.matches && drawer && !drawer.hidden) setDrawer(false); });
  $$('#drawer a').forEach((a) => a.addEventListener('click', () => { if (a.hash && a.pathname === location.pathname) setDrawer(false); }));

  // ---------- add to bag ----------
  function addToBag(slug, qty, btn) {
    return loadProducts().then((p) => {
      const max = p[slug] ? p[slug].max : 0;
      const bag = getBag();
      const have = bag[slug] || 0;
      const next = Math.min(max, have + qty);
      if (next === have) {
        toast(`${ICON.alert}<span>Only ${max} available — already in your bag.</span> <a class="link" href="${root}bag/">View bag</a>`);
        return false;
      }
      bag[slug] = next; setBag(bag);
      toast(`${ICON.check}<span>Added to bag ·</span> <a class="link" href="${root}bag/">View bag</a>`);
      return true;
    });
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    const slug = btn.dataset.add;
    let qty = 1;
    if (btn.hasAttribute('data-add-qty')) { const q = $('[data-qty]'); qty = Math.max(1, parseInt(q && q.value, 10) || 1); }
    const label = btn.innerHTML;
    btn.disabled = true; btn.classList.add('is-loading'); btn.innerHTML = `${ICON.spinner}Adding…`;
    setTimeout(() => {
      addToBag(slug, qty, btn).then((ok) => {
        btn.classList.remove('is-loading');
        btn.innerHTML = ok ? `${ICON.check}Added` : label;
        setTimeout(() => { btn.innerHTML = label; btn.disabled = false; }, ok ? 1600 : 0);
      });
    }, 600);
  });

  // Notify me (out of stock): inline email capture.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-notify]');
    if (!btn) return;
    const host = btn.closest('.card-body, .pdp-info') || btn.parentElement;
    if (host.querySelector('.notify-form')) { host.querySelector('.notify-form input').focus(); return; }
    if (btn.closest('.sticky-buy')) { const b = $('.pdp-info [data-notify]'); if (b) { b.scrollIntoView({ block: 'center' }); b.click(); } return; }
    const f = document.createElement('form');
    f.className = 'notify-form form'; f.noValidate = true; f.style.marginTop = '12px'; f.style.gap = '8px';
    const id = 'n-' + btn.dataset.notify + '-' + Math.random().toString(36).slice(2, 6);
    f.innerHTML = `<label class="label" for="${id}">Email me when it’s back</label><input class="input" id="${id}" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com"><button class="btn btn-primary btn-block" type="submit">Notify me</button><p class="field-msg" aria-live="polite"></p>`;
    btn.replaceWith(f);
    $('input', f).focus();
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const inp = $('input', f); const msg = $('.field-msg', f);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { inp.setAttribute('aria-invalid', 'true'); msg.className = 'field-msg bad'; msg.innerHTML = `${ICON.alert}Enter a valid email address.`; return; }
      inp.removeAttribute('aria-invalid');
      f.innerHTML = `<p class="field-msg ok">${ICON.check}That address works. Back-in-stock alerts aren’t connected in this preview, so nothing was stored.</p>`;
    });
  });

  // ---------- quantity steppers ----------
  function wireStepper(st, onChange) {
    const input = $('[data-qty], .step-val', st);
    const max = parseInt(st.dataset.max, 10) || 1;
    const sync = () => {
      let v = parseInt(input.value, 10); if (!(v >= 1)) v = 1; if (v > max) v = max; input.value = v;
      $('[data-step="-1"]', st).disabled = v <= 1; $('[data-step="1"]', st).disabled = v >= max;
      if (onChange) onChange(v);
    };
    $$('[data-step]', st).forEach((b) => b.addEventListener('click', () => { input.value = (parseInt(input.value, 10) || 1) + parseInt(b.dataset.step, 10); sync(); }));
    input.addEventListener('change', sync);
    sync();
  }
  $$('[data-stepper]').forEach((st) => wireStepper(st));

  // ---------- PDP gallery, sticky buy bar ----------
  const gallery = $('[data-gallery]');
  if (gallery) {
    $$('[data-thumb]', gallery).forEach((t) => t.addEventListener('click', () => {
      $$('[data-thumb]', gallery).forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
      $$('[data-slide]', gallery).forEach((s) => { s.hidden = s.dataset.slide !== t.dataset.thumb; });
    }));
  }
  const sticky = $('[data-sticky-buy]');
  const mainBuy = $('.pdp-info .buy-row, .pdp-info > [data-notify]');
  if (sticky && mainBuy && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $$('button', sticky).forEach((b) => { b.tabIndex = show ? 0 : -1; });
      document.body.classList.toggle('sticky-on', show && getComputedStyle(sticky).display !== 'none');
    }).observe(mainBuy);
  }

  // ---------- accordions ----------
  $$('[data-accordion] .acc-btn').forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
  }));

  // ---------- filters ----------
  const filter = $('[data-filter]');
  if (filter) {
    const cards = $$('.product-grid [data-product]');
    const count = $('[data-result-count]');
    const empty = $('[data-filter-empty]');
    $$('[data-filter-key]', filter).forEach((chip) => chip.addEventListener('click', () => {
      const k = chip.dataset.filterKey;
      $$('[data-filter-key]', filter).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      let n = 0;
      cards.forEach((c) => { const show = k === 'all' || c.dataset.collection === k || c.dataset.category === k; c.hidden = !show; if (show) n++; });
      count.textContent = `${n} ${n === 1 ? 'product' : 'products'}`;
      empty.hidden = n > 0;
    }));
  }

  // ---------- search ----------
  const sform = $('[data-search]');
  if (sform) {
    const data = JSON.parse($('#search-data').textContent);
    const input = $('input', sform);
    const cards = $$('[data-search-grid] [data-product]');
    const count = $('[data-search-count]'); const empty = $('[data-search-empty]');
    const run = () => {
      const q = input.value.trim().toLowerCase();
      let n = 0;
      cards.forEach((c) => {
        const d = data.find((x) => x.slug === c.dataset.product);
        const hay = `${d.name} ${d.collection} ${d.type}`.toLowerCase().replace(/[’']/g, '');
        const show = !q || q.split(/\s+/).every((w) => hay.includes(w.replace(/[’']/g, '')));
        c.hidden = !show; if (show) n++;
      });
      count.textContent = q ? `${n} ${n === 1 ? 'result' : 'results'} for “${input.value.trim()}”` : `${n} products`;
      $('[data-search-term]').textContent = input.value.trim();
      empty.hidden = n > 0;
      try { const u = new URL(location.href); if (q) u.searchParams.set('q', input.value.trim()); else u.searchParams.delete('q'); history.replaceState(null, '', u); } catch (e) { /* ignore */ }
    };
    const initial = new URLSearchParams(location.search).get('q');
    if (initial) input.value = initial;
    input.addEventListener('input', run);
    sform.addEventListener('submit', (e) => { e.preventDefault(); run(); input.blur(); });
    run();
  }

  // ---------- help tabs ----------
  const tabs = $('[data-tabs]');
  if (tabs) {
    const all = $$('[role="tab"]', tabs);
    const select = (key, focus) => {
      all.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
    };
    all.forEach((t, i) => {
      t.addEventListener('click', () => { select(t.dataset.tab); history.replaceState(null, '', '#' + t.dataset.tab); });
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(all[(i + d + all.length) % all.length].dataset.tab, true); }
      });
    });
    const fromHash = () => { const k = location.hash.slice(1); if (all.some((t) => t.dataset.tab === k)) select(k); };
    window.addEventListener('hashchange', fromHash);
    fromHash();
    $$('[data-tab-link]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); select(a.dataset.tabLink, true); history.replaceState(null, '', '#' + a.dataset.tabLink); }));
  }

  // ---------- forms ----------
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function fieldError(input, msg) {
    const id = input.id + '-err';
    let el = document.getElementById(id);
    if (!msg) { input.removeAttribute('aria-invalid'); if (el) el.remove(); return true; }
    input.setAttribute('aria-invalid', 'true');
    if (!el) { el = document.createElement('p'); el.className = 'err'; el.id = id; input.insertAdjacentElement('afterend', el); input.setAttribute('aria-describedby', id); }
    el.innerHTML = ICON.alert + msg;
    return false;
  }
  $$('[data-optin]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('input', f); const msg = $('.field-msg', f);
    if (!EMAIL.test(inp.value.trim())) { inp.setAttribute('aria-invalid', 'true'); msg.className = 'field-msg bad'; msg.innerHTML = ICON.alert + 'Enter a valid email address.'; inp.focus(); return; }
    inp.removeAttribute('aria-invalid');
    msg.className = 'field-msg ok'; msg.innerHTML = ICON.check + 'That address works. Sign-up isn’t connected in this preview, so nothing was stored.';
  }));
  const contact = $('[data-contact]');
  if (contact) contact.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = [fieldError($('#c-name'), $('#c-name').value.trim() ? '' : 'Enter your name.'),
      fieldError($('#c-email'), EMAIL.test($('#c-email').value.trim()) ? '' : 'Enter a valid email address.'),
      fieldError($('#c-msg'), $('#c-msg').value.trim() ? '' : 'Enter a message.')].every(Boolean);
    const m = $('[data-form-msg]', contact);
    if (!ok) { m.className = 'field-msg'; m.textContent = ''; $('[aria-invalid="true"]', contact).focus(); return; }
    m.className = 'field-msg ok'; m.innerHTML = ICON.check + 'Your message is complete, but this preview isn’t connected yet, so it was not sent. Your entries are still here.';
  });

  // ---------- bag page ----------
  const bagWrap = $('[data-bag]');
  if (bagWrap) {
    loadProducts().then((p) => {
      const lines = $('[data-bag-lines]');
      const warn = $('[data-bag-warning]');
      const notes = [];
      const bag = getBag();
      Object.keys(bag).forEach((slug) => {
        if (!p[slug]) { delete bag[slug]; return; }
        if (bag[slug] > p[slug].max) {
          if (p[slug].max === 0) notes.push(`${p[slug].name} is out of stock and was removed.`);
          else notes.push(`Only ${p[slug].max} of ${p[slug].name} available — quantity reduced from ${bag[slug]}.`);
          bag[slug] = p[slug].max;
          if (!bag[slug]) delete bag[slug];
        }
      });
      setBag(bag);
      if (notes.length) { warn.hidden = false; $('[data-bag-warning-text]').innerHTML = `<strong>Low stock.</strong> ${notes.join(' ')}`; }
      const render = () => {
        const b = getBag(); const keys = Object.keys(b);
        bagWrap.hidden = keys.length === 0; $('[data-bag-empty]').hidden = keys.length > 0;
        if (!keys.length) warn.hidden = true;
        lines.innerHTML = keys.map((slug) => {
          const d = p[slug];
          return `<li class="bag-line" data-line="${slug}">
  ${d.img ? `<div class="slot slot-photo" style="aspect-ratio:1/1"><img src="${d.img}" alt="${d.name}" loading="lazy"></div>` : `<div class="slot" style="aspect-ratio:1/1" role="img" aria-label="${d.name}"><span class="slot-id">${d.slot}</span></div>`}
  <div>
    <p class="eyebrow eyebrow-${d.key}">${d.collection.toUpperCase()}</p>
    <h2><a href="${root}products/${slug}/">${d.name}</a></h2>
    ${d.tallow ? `<p class="card-meta" style="margin:0">${d.tallow}</p>` : ''}
    <div class="line-actions">
      <div class="stepper" data-max="${d.max}"><button type="button" class="step-btn" data-step="-1" aria-label="Decrease quantity of ${d.name}">${ICON.minus}</button><input class="step-val" type="number" inputmode="numeric" min="1" max="${d.max}" value="${b[slug]}" aria-label="Quantity of ${d.name}"><button type="button" class="step-btn" data-step="1" aria-label="Increase quantity of ${d.name}">${ICON.plus}</button></div>
      <button type="button" class="remove" data-remove="${slug}">${ICON.trash}Remove</button>
    </div>
  </div>
  <p class="price">$—.—</p>
  ${b[slug] >= d.max ? `<p class="line-msg">${ICON.alert}Only ${d.max} available.</p>` : ''}
</li>`;
        }).join('');
        $$('.bag-line', lines).forEach((li) => {
          const slug = li.dataset.line;
          wireStepper($('.stepper', li), (v) => {
            const bb = getBag(); if (bb[slug] !== v) { bb[slug] = v; setBag(bb); render(); }
          });
        });
        $$('[data-remove]', lines).forEach((btn) => btn.addEventListener('click', () => {
          const bb = getBag(); const name = p[btn.dataset.remove].name; delete bb[btn.dataset.remove]; setBag(bb); render();
          toast(`<span>${name} removed.</span>`, 3000);
          const next = $('[data-remove]', lines) || $('[data-bag-empty] a'); if (next) next.focus();
        }));
        renderCount();
      };
      render();
    });
  }

  // ---------- checkout ----------
  const ship = $('[data-ship-form]');
  if (ship) {
    loadProducts().then((p) => {
      const b = getBag(); const keys = Object.keys(b);
      if (!keys.length) { $('[data-checkout]').hidden = true; $('[data-checkout-empty]').hidden = false; return; }
      $('[data-mini-lines]').innerHTML = keys.map((k) => `<li><span>${p[k].name} × ${b[k]}</span><span>$—.—</span></li>`).join('');
    });
    if (new URLSearchParams(location.search).get('payment') === 'failed') $('[data-pay-error]').hidden = false;
    const country = $('#s-country');
    const checks = {
      's-email': (v) => EMAIL.test(v) ? '' : 'Enter a valid email address.',
      's-first': (v) => v ? '' : 'Enter your first name.',
      's-last': (v) => v ? '' : 'Enter your last name.',
      's-addr': (v) => v ? '' : 'Enter your street address.',
      's-city': (v) => v ? '' : 'Enter your city.',
      's-state': (v) => /^[A-Za-z]{2}$/.test(v) ? '' : 'Enter a 2-letter state code.',
      's-zip': (v) => /^\d{5}$/.test(v) ? '' : 'Enter a 5-digit ZIP code.',
      's-country': (v) => v === 'US' ? '' : 'We don’t ship to this destination yet. Tso Bath & Body currently ships within the United States only.',
    };
    Object.keys(checks).forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener(id === 's-country' ? 'change' : 'blur', () => { if (id === 's-country' || el.value) fieldError(el, checks[id](el.value.trim())); });
    });
    $('#s-state').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    $('#s-zip').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); });
    const modal = $('[data-stripe]');
    ship.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(checks).map((id) => fieldError(document.getElementById(id), checks[id](document.getElementById(id).value.trim()))).every(Boolean);
      if (!ok) { $('[aria-invalid="true"]', ship).focus(); return; }
      store.set('tso-order-email', $('#s-email').value.trim());
      modal.hidden = false; lock(true); $('[data-pay="ok"]', modal).focus();
    });
    const closeModal = () => { modal.hidden = true; lock(false); };
    modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    $$('[data-pay]', modal).forEach((b) => b.addEventListener('click', () => {
      const r = b.dataset.pay;
      if (r === 'ok') {
        const no = 'TSO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        store.set('tso-order-no', no); setBag({}); location.href = root + 'order-confirmed/';
      } else if (r === 'fail') { closeModal(); $('[data-pay-error]').hidden = false; $('[data-pay-error]').scrollIntoView({ block: 'center' }); }
      else closeModal();
    }));
  }
  const orderNo = $('[data-order-no]');
  if (orderNo) {
    orderNo.textContent = store.get('tso-order-no', 'TSO-XXXXXX');
    $('[data-order-email]').textContent = store.get('tso-order-email', 'you@email.com');
  }

  // ---------- General Tso chat ----------
  const chat = $('#chat');
  const launcher = $('.chat-launch');
  if (chat && launcher) {
    const log = $('[data-chat-log]');
    const input = $('#chat-input');
    const cat = $('.chat-log .msg-bot').firstElementChild.outerHTML;
    let chatOpener = null;
    const setChat = (open) => {
      chat.hidden = !open;
      document.body.classList.toggle('chat-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      const full = open && matchMedia('(max-width:639px) and (orientation:portrait), (max-width:479px), (orientation:landscape) and (max-height:600px)').matches;
      if (open !== document.body.classList.contains('locked') && (full || !open)) lock(full);
      if (open) { chatOpener = document.activeElement; $('.chat-dot', launcher).hidden = true; store.set('tso-chat-seen', true); setTimeout(() => (matchMedia('(hover:hover) and (pointer:fine)').matches ? input : chat).focus({ preventScroll: true }), 50); }
      else if (chatOpener && chatOpener.focus) chatOpener.focus();
    };
    $$('[data-chat-open]').forEach((b) => b.addEventListener('click', () => { if (drawer && !drawer.hidden) setDrawer(false); setChat(true); }));
    $('[data-chat-close]').addEventListener('click', () => setChat(false));
    chat.addEventListener('keydown', (e) => { if (e.key === 'Escape') setChat(false); });
    if (store.get('tso-chat-seen', false)) $('.chat-dot', launcher).hidden = true;
    if (!store.get('tso-pill-shown', false)) {
      setTimeout(() => { launcher.classList.add('expanded'); store.set('tso-pill-shown', true); }, 6000);
      window.addEventListener('scroll', () => launcher.classList.remove('expanded'), { passive: true });
    }
    const add = (html, who) => { const d = document.createElement('div'); d.className = 'msg msg-' + who; d.innerHTML = (who === 'bot' ? cat : '') + `<p>${html}</p>`; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
    const card = (slug, eyebrow, name, stock) => `<div class="msg-card"><p class="eyebrow">${eyebrow}</p><p class="msg-title">${name}</p><p>$—.— · ${stock}</p>${stock === 'Out of stock' ? `<a class="btn btn-secondary btn-block" href="${root}products/${slug}/">View product</a>` : `<button class="btn btn-primary btn-block" type="button" data-add="${slug}">Add to Bag</button>`}</div>`;
    const P = 'products/';
    const answers = [
      { re: /tallow/i, html: `Our soaps are made with beef tallow. Nine Lives Musk™ and Wonton’ in the Tub™ share the same tallow base; only the color and scent change. Full records: <a class="link" href="${root}help/#ingredients">Ingredients &amp; Care →</a>`, cards: [card('nine-lives-musk', 'BARRACKS · TALLOW SOAP', 'Nine Lives Musk™', 'In stock'), card('wonton-in-the-tub', 'FORTUNE · TALLOW SOAP', 'Wonton’ in the Tub™', 'Low stock · 3 left')] },
      { re: /vegan|animal|ingredient|lard/i, html: `Both of our soaps — Nine Lives Musk™ and Wonton’ in the Tub™ — are made with beef tallow (animal-derived). Same base; they differ only in color and scent. Full records: <a class="link" href="${root}help/#ingredients">Ingredients &amp; Care →</a>` },
      { re: /order|refund|return|track|late|damag|wrong/i, html: `Handing you to the team. Reply within — business days. <a class="link" href="${root}help/#contact">Contact form</a>`, note: 'Order issues always escalate; I can’t look up orders here.' },
      { re: /ship|deliver|canada|international|ups/i, html: `Tso Bath &amp; Body currently ships within the United States only, via UPS. <a class="link" href="${root}help/#shipping">Shipping &amp; Returns →</a>` },
      { re: /\b(him|his|he|brother|army|veteran|military|dad|father|husband|boys?|men|man|barracks|soldier|navy|marines?)\b/i, html: 'Barracks Collection, then. Two options:', cards: [card('the-exploding-dumpling', 'BARRACKS · BATH BOMB', 'The Exploding Dumpling™', 'Out of stock'), card('nine-lives-musk', 'BARRACKS · TALLOW SOAP', 'Nine Lives Musk™', 'In stock')] },
      { re: /\b(her|she|mom|mother|sister|wife|girls?|women|woman|fortune collection|friend|gift)\b/i, html: 'Fortune Collection — every soak ends with a fortune. Two options:', cards: [card('fortune-cookie-bath-bomb', 'FORTUNE · BATH BOMB', 'Fortune Cookie Bath Bomb™', 'In stock'), card('wonton-in-the-tub', 'FORTUNE · TALLOW SOAP', 'Wonton’ in the Tub™', 'Low stock · 3 left')] },
      { re: /fortune|dispatch|reveal|message|surprise/i, html: 'Fortune Collection bath bombs carry a fortune; Barracks Collection bath bombs carry a Mission Dispatch.' },
      { re: /\bmade\b|fort wayne|handmade/i, html: 'Handmade in Fort Wayne, Indiana.' },
    ];
    const reply = (text) => {
      add(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), 'user');
      $('[data-chat-chips]').hidden = true;
      const t = document.createElement('div'); t.className = 'msg msg-bot'; t.innerHTML = cat + '<div class="typing" aria-label="General Tso is typing"><i></i><i></i><i></i></div>';
      log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        t.remove();
        const a = answers.find((x) => x.re.test(text));
        if (a) {
          add(a.html, 'bot');
          if (a.note) add(a.note, 'bot');
          (a.cards || []).forEach((c) => { const d = document.createElement('div'); d.innerHTML = c; log.appendChild(d.firstElementChild); });
        } else {
          add(`I only answer from approved Tso records, and I don’t have one for that yet. Try <a class="link" href="${root}help/#faq">the FAQ</a>, or I can hand you to the team: <a class="link" href="${root}help/#contact">Contact form</a>.`, 'bot');
        }
        log.scrollTop = log.scrollHeight;
      }, 1200);
    };
    $$('[data-ask]').forEach((b) => b.addEventListener('click', () => reply(b.dataset.ask)));
    $('[data-chat-form]').addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; reply(v); });
  }
})();
