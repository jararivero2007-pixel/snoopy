/* ==========================================================
   La Caseta — interacciones
   ========================================================== */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Catálogo ----------
  const VARIANTS = {
    clasico:    { name: "Snoopy Clásico",    label: "Clásico",    icon: "🦴", color: "#E03A2F", price: 29.9, old: null,
                  blurb: "El de toda la vida: orejitas negras, collar rojo y cara de “hoy no me levanto”." },
    aviador:    { name: "Snoopy Aviador",    label: "Aviador",    icon: "✈️", color: "#8B5A2B", price: 34.9, old: 39.9,
                  blurb: "Gafas de piloto, bufanda al viento y ganas de surcar los cielos sobre su caseta." },
    astronauta: { name: "Snoopy Astronauta", label: "Astronauta", icon: "🚀", color: "#7CC6FE", price: 36.9, old: null,
                  blurb: "Casco extraíble y traje bordado. Pequeño paso para un perro, gran abrazo para ti." },
    navidad:    { name: "Snoopy Navidad",    label: "Navidad",    icon: "🎄", color: "#7DBE4B", price: 32.9, old: null,
                  blurb: "Gorrito y bufanda de punto. Viene con ganas de villancicos (no canta, tranquilo)." },
  };
  const SIZES = {
    S: { label: "Pequeño · 20 cm", delta: -8, ruler: 34 },
    M: { label: "Mediano · 30 cm", delta: 0,  ruler: 50 },
    L: { label: "Grande · 45 cm",  delta: 15, ruler: 68 },
  };
  const GIFT_PRICE = 3;
  const FREE_SHIP = 35;

  const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  const money = (n) => fmt.format(n);

  // ---------- Estado ----------
  const form = $("[data-buy-form]");
  const state = { variant: "clasico", size: "M" };
  const unitPrice = () => VARIANTS[state.variant].price + SIZES[state.size].delta;

  // ---------- Producto: atuendo y tamaño ----------
  const mainImg = $("[data-main-img]");
  const hugBtn = $("[data-hug]");
  const priceEl = $("[data-price]");
  const PLACEHOLDER = "assets/img/placeholder.svg";

  function renderProduct({ animate = true } = {}) {
    const v = VARIANTS[state.variant];
    const s = SIZES[state.size];
    const price = unitPrice();

    $("[data-product-name]").textContent = v.name;
    $("[data-variant-label]").textContent = v.label;
    $("[data-size-label]").textContent = s.label;
    $("[data-blurb]").textContent = v.blurb;
    priceEl.textContent = money(price);

    const old = $("[data-old-price]");
    old.hidden = !v.old;
    if (v.old) old.textContent = money(v.old + s.delta);

    $("[data-ruler]").style.setProperty("--h", s.ruler + "px");
    $("[data-sticky-name]").textContent = `${v.name} · ${state.size}`;
    $("[data-sticky-price]").textContent = money(price);

    // Imagen: se espera assets/img/<variante>.jpg
    const src = `assets/img/${state.variant}.jpg`;
    if (!mainImg.src.endsWith(src)) {
      mainImg.src = src;
      mainImg.alt = `Peluche ${v.name}, sentado`;
    }

    if (animate && !reduceMotion) {
      replay(hugBtn, "is-swapping");
      replay(priceEl, "changed");
    }
  }

  // Si aún no existe la foto de una variante, mostramos el marcador ilustrado
  mainImg.addEventListener("error", () => {
    if (!mainImg.src.endsWith(PLACEHOLDER)) mainImg.src = PLACEHOLDER;
  });
  if (mainImg.complete && mainImg.naturalWidth === 0) mainImg.src = PLACEHOLDER;

  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // reinicia la animación
    el.classList.add(cls);
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "variant") state.variant = e.target.value;
    if (e.target.name === "size") state.size = e.target.value;
    if (e.target.name === "variant" || e.target.name === "size") renderProduct();
  });

  // ---------- Vistas de la galería ----------
  const stage = $("[data-stage]");
  $$(".thumb").forEach((t) =>
    t.addEventListener("click", () => {
      $$(".thumb").forEach((x) => x.classList.toggle("is-active", x === t));
      stage.dataset.view = t.dataset.view;
    })
  );

  // ---------- Abrazo (mantener pulsado) ----------
  const heartsBox = $("[data-hearts]");
  const hugCountEl = $("[data-hug-count]");
  let hugs = 0;
  let hugTimer = null;

  function spawnHeart() {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = ["♥", "❤", "♡"][Math.floor(Math.random() * 3)];
    h.style.left = 20 + Math.random() * 60 + "%";
    h.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
    h.style.setProperty("--rot", (Math.random() * 60 - 30).toFixed(0) + "deg");
    heartsBox.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }

  function startHug(e) {
    if (e.type === "keydown" && e.key !== " " && e.key !== "Enter") return;
    if (e.type === "keydown") e.preventDefault();
    if (hugTimer) return;
    hugBtn.classList.add("is-hugging");
    hugs++;
    hugCountEl.textContent = hugs;
    spawnHeart();
    if (!reduceMotion) hugTimer = setInterval(spawnHeart, 180);
    else hugTimer = -1;
    if (navigator.vibrate) navigator.vibrate(15);
  }
  function endHug() {
    if (hugTimer > 0) clearInterval(hugTimer);
    hugTimer = null;
    hugBtn.classList.remove("is-hugging");
  }
  hugBtn.addEventListener("pointerdown", startHug);
  hugBtn.addEventListener("keydown", startHug);
  ["pointerup", "pointerleave", "pointercancel", "keyup", "blur"].forEach((ev) => hugBtn.addEventListener(ev, endHug));
  hugBtn.addEventListener("contextmenu", (e) => e.preventDefault());

  // ---------- Cantidad ----------
  const qtyInput = form.elements.qty;
  const clampQty = (n) => Math.min(10, Math.max(1, Number.isFinite(n) ? n : 1));
  $$("[data-qty]").forEach((b) =>
    b.addEventListener("click", () => {
      qtyInput.value = clampQty(parseInt(qtyInput.value, 10) + Number(b.dataset.qty));
    })
  );
  qtyInput.addEventListener("blur", () => (qtyInput.value = clampQty(parseInt(qtyInput.value, 10))));

  // ---------- Carrito ----------
  const STORAGE_KEY = "lacaseta-cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { cart = []; }
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {} };

  const cartEl = $("#cart");
  const cartBtn = $(".cart-btn");
  const backdrop = $("[data-cart-backdrop]");
  let lastFocus = null;

  function lineTotal(item) {
    return (item.price + (item.gift ? GIFT_PRICE : 0)) * item.qty;
  }

  function renderCart() {
    const list = $("[data-cart-items]");
    list.innerHTML = "";
    let total = 0;
    let count = 0;
    cart.forEach((item, i) => {
      const v = VARIANTS[item.variant];
      total += lineTotal(item);
      count += item.qty;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <span class="cart-item-icon" style="--sw:${v.color}" aria-hidden="true">${v.icon}</span>
        <div>
          <p class="cart-item-name"></p>
          <p class="cart-item-meta"></p>
        </div>
        <div class="cart-item-side">
          <strong>${money(lineTotal(item))}</strong><br>
          <button type="button" class="cart-item-remove" data-remove="${i}">Quitar</button>
        </div>`;
      $(".cart-item-name", li).textContent = v.name;
      $(".cart-item-meta", li).textContent =
        `Talla ${item.size} · ${item.qty} ud.` + (item.gift ? " · 🎁 regalo" : "");
      list.appendChild(li);
    });

    $("[data-cart-empty]").hidden = cart.length > 0;
    $("[data-cart-total]").textContent = money(total);
    $("[data-checkout]").disabled = cart.length === 0;

    const countEl = $("[data-cart-count]");
    if (countEl.textContent !== String(count)) {
      countEl.textContent = count;
      replay(countEl, "bump");
    }

    const missing = Math.max(0, FREE_SHIP - total);
    $("[data-ship-text]").textContent = missing > 0
      ? `Te faltan ${money(missing)} para el envío gratis`
      : "¡Bien! Tienes envío gratis 🎉";
    $("[data-ship-bar]").style.width = Math.min(100, (total / FREE_SHIP) * 100) + "%";
  }

  function addToCart(originEl) {
    const qty = clampQty(parseInt(qtyInput.value, 10));
    const gift = form.elements.gift.checked;
    const existing = cart.find((it) => it.variant === state.variant && it.size === state.size && it.gift === gift);
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else cart.push({ variant: state.variant, size: state.size, qty, gift, price: unitPrice() });
    save();
    renderCart();
    burst(originEl);
    toast(`${VARIANTS[state.variant].name} (${state.size}) añadido a tu caseta`);
  }

  function burst(el) {
    if (reduceMotion || !el) return;
    const r = el.getBoundingClientRect();
    const b = document.createElement("span");
    b.className = "burst";
    b.textContent = ["¡WOOF!", "¡GUAU!", "¡YUPI!"][Math.floor(Math.random() * 3)];
    b.setAttribute("aria-hidden", "true");
    b.style.left = r.left + r.width / 2 + "px";
    b.style.top = r.top + "px";
    document.body.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
  }

  function openCart() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    cartEl.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    cartBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("[data-cart-close]").focus(), 50);
  }
  function closeCart() {
    backdrop.hidden = true;
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    cartBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addToCart($("[data-add]"));
  });
  $("[data-sticky-add]").addEventListener("click", (e) => addToCart(e.currentTarget));
  cartBtn.addEventListener("click", openCart);
  $("[data-cart-close]").addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartEl.classList.contains("is-open")) closeCart();
    // Trampa de foco dentro del carrito
    if (e.key === "Tab" && cartEl.classList.contains("is-open")) {
      const focusables = $$("button:not([disabled]), a[href]", cartEl);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $("[data-cart-items]").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    cart.splice(Number(btn.dataset.remove), 1);
    save();
    renderCart();
    $("[data-cart-close]").focus();
  });
  $("[data-checkout]").addEventListener("click", () => {
    // Punto de integración con la pasarela de pago (Shopify, Stripe Checkout, etc.)
    toast("Aquí conectaremos la pasarela de pago 💳");
  });

  // ---------- Toast ----------
  const toastEl = $("[data-toast]");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  // ---------- Barra fija en móvil ----------
  const sticky = $("[data-sticky]");
  const buybox = $(".buybox");
  let pastBuybox = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      // Visible solo cuando el panel de compra ya ha quedado por encima
      pastBuybox = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sticky.classList.toggle("is-visible", pastBuybox);
      sticky.setAttribute("aria-hidden", String(!pastBuybox));
      $("[data-sticky-add]").tabIndex = pastBuybox ? 0 : -1;
    }).observe(buybox);
  }

  // ---------- Revelado al hacer scroll ----------
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Quiz ----------
  const quiz = $("[data-quiz]");
  const steps = $$(".quiz-step", quiz);
  const bar = $("[data-quiz-bar]");
  const RESULT_TEXT = {
    clasico: "Tranquilo, fiel y experto en siestas. Un clásico nunca falla.",
    aviador: "Espíritu aventurero y bufanda al viento. ¡Despega!",
    astronauta: "Curiosidad infinita y la cabeza en las estrellas.",
    navidad: "Mantita, chocolate y abrazos largos. Tu temporada favorita, todo el año.",
  };
  let answers = [];
  let result = "clasico";

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    bar.style.width = (i / (steps.length - 1)) * 100 + "%";
    const firstBtn = $("button", steps[i]);
    if (firstBtn && answers.length) firstBtn.focus({ preventScroll: true });
  }

  quiz.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-answer]");
    if (!opt) return;
    answers.push(opt.dataset.answer);
    if (answers.length < steps.length - 1) return showStep(answers.length);

    // El atuendo más votado; en empate, gana la última respuesta
    const tally = {};
    answers.forEach((a) => (tally[a] = (tally[a] || 0) + 1));
    const max = Math.max(...Object.values(tally));
    result = [...answers].reverse().find((a) => tally[a] === max);

    $("[data-result-name]").textContent = `¡${VARIANTS[result].label}! ${VARIANTS[result].icon}`;
    $("[data-result-text]").textContent = RESULT_TEXT[result];
    showStep(steps.length - 1);
  });

  $("[data-quiz-reset]").addEventListener("click", () => {
    answers = [];
    showStep(0);
    $("button", steps[0]).focus();
  });

  $("[data-quiz-apply]").addEventListener("click", () => {
    const radio = form.querySelector(`input[name="variant"][value="${result}"]`);
    radio.checked = true;
    state.variant = result;
    renderProduct();
    $("#producto").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    toast(`Te hemos preparado el ${VARIANTS[result].name}`);
  });

  // ---------- Init ----------
  renderProduct({ animate: false });
  renderCart();
})();
