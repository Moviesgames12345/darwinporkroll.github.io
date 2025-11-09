(function(){
  const MENU = [
    {id:'bm-pork', cat:'Banh Mi', name:'Crispy Roast Pork Banh Mi', desc:'Pâté, mayo, cucumber, pickles, coriander, chili', price:9.5},
    {id:'bm-chicken', cat:'Banh Mi', name:'Grilled Chicken Banh Mi', desc:'Lemongrass chicken, salad, house sauce', price:9.0},
    {id:'pho-beef', cat:'Pho', name:'Beef Pho', desc:'12-hour beef broth, rice noodles, herbs', price:15.0},
    {id:'pho-chicken', cat:'Pho', name:'Chicken Pho', desc:'Light chicken broth, rice noodles, herbs', price:14.0},
    {id:'rice-porkchop', cat:'Rice', name:'Grilled Pork Chop Rice', desc:'Broken rice, fried egg, pickles', price:16.0},
    {id:'rice-tofu', cat:'Rice', name:'Lemongrass Tofu Rice', desc:'Vegetarian option', price:14.5},
    {id:'drink-coffee', cat:'Drink', name:'Vietnamese Iced Coffee', desc:'Strong + sweet', price:6.0},
    {id:'drink-tea', cat:'Drink', name:'Iced Lemon Tea', desc:'Refreshing', price:5.0}
  ];

  const els = {
    menuList: document.getElementById('menu-list'),
    cartEmpty: document.getElementById('cart-empty'),
    cartItems: document.getElementById('cart-items'),
    cartSummary: document.getElementById('cart-summary'),
    subtotal: document.getElementById('subtotal'),
    gst: document.getElementById('gst'),
    total: document.getElementById('total'),
    name: document.getElementById('cust-name'),
    phone: document.getElementById('cust-phone'),
    date: document.getElementById('pickup-date'),
    time: document.getElementById('pickup-time'),
    notes: document.getElementById('cust-notes'),
    btnSms: document.getElementById('btn-sms'),
    btnWa: document.getElementById('btn-wa'),
    btnCopy: document.getElementById('btn-copy'),
    btnPrint: document.getElementById('btn-print'),
  };

  const BUSINESS_MOBILE = '0473027083'; // AU mobile; shown on contact page
  const BUSINESS_MOBILE_INTL = '61473027083'; // for WhatsApp wa.me links

  let cart = loadCart();

  function formatCurrency(n){
    try { return new Intl.NumberFormat('en-AU', {style:'currency', currency:'AUD'}).format(n); }
    catch(e) { return '$' + (Math.round(n*100)/100).toFixed(2); }
  }

  function loadCart(){
    try { return JSON.parse(localStorage.getItem('dpr-cart') || '{}'); }
    catch(e){ return {}; }
  }
  function saveCart(){
    try { localStorage.setItem('dpr-cart', JSON.stringify(cart)); } catch(e){}
  }

  function renderMenu(){
    if(!els.menuList) return;
    const frag = document.createDocumentFragment();
    MENU.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-md p-4 flex flex-col';
      card.innerHTML = `
        <div class="flex-1">
          <div class="flex items-baseline justify-between">
            <h3 class="font-semibold text-gray-900">${item.name}</h3>
            <div class="text-red-600 font-bold ml-2">${formatCurrency(item.price)}</div>
          </div>
          <p class="text-sm text-gray-600 mt-1">${item.desc || ''}</p>
        </div>
        <div class="mt-3">
          <button data-add="${item.id}" class="btn-primary w-full text-center">Add</button>
        </div>`;
      frag.appendChild(card);
    });
    els.menuList.appendChild(frag);

    els.menuList.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-add]');
      if(!btn) return;
      const id = btn.getAttribute('data-add');
      const itm = MENU.find(x=>x.id===id);
      if(!itm) return;
      const existing = cart[id] || {id: itm.id, name: itm.name, price: itm.price, qty:0};
      existing.qty += 1;
      cart[id] = existing;
      saveCart();
      renderCart();
    });
  }

  function computeTotals(){
    let subtotal = 0;
    Object.values(cart).forEach(row => { subtotal += row.price * row.qty; });
    const gst = +(subtotal * 0.10).toFixed(2);
    const total = +(subtotal + gst).toFixed(2);
    return {subtotal, gst, total};
  }

  function renderCart(){
    const items = Object.values(cart).filter(x=>x.qty>0);
    if(items.length === 0){
      els.cartEmpty.classList.remove('hidden');
      els.cartItems.classList.add('hidden');
      els.cartSummary.classList.add('hidden');
    } else {
      els.cartEmpty.classList.add('hidden');
      els.cartItems.classList.remove('hidden');
      els.cartSummary.classList.remove('hidden');
    }

    els.cartItems.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach(row => {
      const li = document.createElement('li');
      li.className = 'py-3 flex items-center justify-between';
      li.innerHTML = `
        <div>
          <div class="font-medium text-gray-900">${row.name}</div>
          <div class="text-sm text-gray-600">${formatCurrency(row.price)} ea</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 rounded-md border" data-dec="${row.id}">-</button>
          <span class="w-6 text-center">${row.qty}</span>
          <button class="px-2 py-1 rounded-md border" data-inc="${row.id}">+</button>
          <div class="w-20 text-right font-medium">${formatCurrency(row.price*row.qty)}</div>
          <button class="text-gray-400 hover:text-red-600" title="Remove" data-del="${row.id}">×</button>
        </div>`;
      frag.appendChild(li);
    });
    els.cartItems.appendChild(frag);

    const {subtotal, gst, total} = computeTotals();
    els.subtotal.textContent = formatCurrency(subtotal);
    els.gst.textContent = formatCurrency(gst);
    els.total.textContent = formatCurrency(total);

    const disabled = items.length === 0;
    toggleCtas(disabled);
  }

  function toggleCtas(disable){
    [els.btnSms, els.btnWa, els.btnCopy, els.btnPrint].forEach(b=>{
      if(!b) return;
      if(disable){
        b.setAttribute('aria-disabled','true');
        b.classList.add('opacity-50','pointer-events-none');
      } else {
        b.removeAttribute('aria-disabled');
        b.classList.remove('opacity-50','pointer-events-none');
      }
    });
  }

  function buildOrderText(){
    const items = Object.values(cart).filter(x=>x.qty>0);
    const {subtotal, gst, total} = computeTotals();
    const name = els.name.value.trim();
    const phone = els.phone.value.trim();
    const date = els.date.value;
    const time = els.time.value;
    const notes = els.notes.value.trim();

    const lines = [];
    lines.push('Darwin Pork Roll Order');
    lines.push('');
    items.forEach(x=> lines.push(`• ${x.name} x ${x.qty} — ${formatCurrency(x.price*x.qty)}`));
    lines.push('');
    lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
    lines.push(`GST (10%): ${formatCurrency(gst)}`);
    lines.push(`Total: ${formatCurrency(total)}`);
    lines.push('');
    if(name) lines.push(`Name: ${name}`);
    if(phone) lines.push(`Mobile: ${phone}`);
    if(date || time) lines.push(`Pickup: ${[date,time].filter(Boolean).join(' ')}`);
    if(notes) { lines.push('Notes:'); lines.push(notes); }
    lines.push('');
    lines.push('Thank you!');
    return lines.join('\n');
  }

  function updateLinks(){
    const text = encodeURIComponent(buildOrderText());
    // SMS link (mobile only on most platforms)
    els.btnSms.href = `sms:${BUSINESS_MOBILE}?&body=${text}`;
    // WhatsApp link
    els.btnWa.href = `https://wa.me/${BUSINESS_MOBILE_INTL}?text=${text}`;
  }

  function attachCartHandlers(){
    els.cartItems.addEventListener('click', (e)=>{
      const dec = e.target.closest('[data-dec]');
      const inc = e.target.closest('[data-inc]');
      const del = e.target.closest('[data-del]');
      let id;
      if(dec){ id = dec.getAttribute('data-dec'); if(cart[id]) cart[id].qty = Math.max(0, cart[id].qty-1); }
      else if(inc){ id = inc.getAttribute('data-inc'); if(cart[id]) cart[id].qty += 1; }
      else if(del){ id = del.getAttribute('data-del'); delete cart[id]; }
      else return;
      saveCart();
      renderCart();
    });
  }

  function attachCtas(){
    if(els.btnCopy){
      els.btnCopy.addEventListener('click', async ()=>{
        try { await navigator.clipboard.writeText(buildOrderText()); alert('Order summary copied.'); }
        catch(e){ alert('Unable to copy.'); }
      });
    }
    if(els.btnPrint){
      els.btnPrint.addEventListener('click', ()=>{
        const text = buildOrderText();
        const w = window.open('', '_blank');
        if(!w) return window.print();
        w.document.write(`<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; white-space:pre-wrap;">${text.replace(/</g,'&lt;')}</pre>`);
        w.document.close();
        w.focus();
        w.print();
      });
    }
    // Update links whenever details change
    ['input','change'].forEach(ev=>{
      [els.name, els.phone, els.date, els.time, els.notes].forEach(el=>{
        if(!el) return; el.addEventListener(ev, updateLinks);
      });
    });
  }

  function initDefaults(){
    const now = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth()+1);
    const dd = pad(now.getDate());
    if(els.date && !els.date.value) els.date.value = `${yyyy}-${mm}-${dd}`;
    const in30 = new Date(now.getTime()+30*60*1000);
    if(els.time && !els.time.value) els.time.value = `${pad(in30.getHours())}:${pad(in30.getMinutes())}`;
  }

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    renderMenu();
    renderCart();
    attachCartHandlers();
    attachCtas();
    initDefaults();
    updateLinks();
  });
})();
