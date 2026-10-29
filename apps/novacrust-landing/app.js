// Placeholder values. Replace with real numbers before launch.
const CONFIG = {
  sampleRate: 1500, // NGN per 1 USDC, illustrative only
  feeRate: 0.01, // 1%
  promoFeeFreeUsd: 200, // first $200 fee-free when the offer is applied
  maxUsd: 1_000_000,
};

const $ = (id) => document.getElementById(id);
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 });

const amountEl = $("amount");
const promoEl = $("promo");
const hintEl = $("amount-hint");

function parseAmount(raw) {
  const n = Number(raw.replace(/,/g, "").trim());
  return raw.trim() !== "" && Number.isFinite(n) ? n : NaN;
}

function render() {
  const amount = parseAmount(amountEl.value);
  const valid = amount > 0 && amount <= CONFIG.maxUsd;

  hintEl.hidden = valid || amountEl.value.trim() === "";
  hintEl.textContent = `Enter an amount between 0 and ${usd.format(CONFIG.maxUsd)}.`;
  $("fee-pct").textContent = CONFIG.feeRate * 100;
  $("rate").textContent = `1 USDC = ${ngn.format(CONFIG.sampleRate)}`;

  if (!valid) {
    ["fee", "converted", "receive"].forEach((id) => ($(id).textContent = "—"));
    return;
  }

  const chargeable = promoEl.checked ? Math.max(0, amount - CONFIG.promoFeeFreeUsd) : amount;
  const fee = chargeable * CONFIG.feeRate;
  const converted = amount - fee;

  $("fee").textContent = usd.format(fee);
  $("converted").textContent = usd.format(converted);
  $("receive").textContent = ngn.format(converted * CONFIG.sampleRate);
}

amountEl.addEventListener("input", render);
promoEl.addEventListener("change", render);
$("calc").addEventListener("submit", (e) => e.preventDefault());
render();

// Show the sticky mobile CTA once the hero button has scrolled out of view,
// and hide it again while the calculator's own button is on screen.
const sticky = $("sticky");
const heroCta = document.querySelector(".hero .btn");
const calcCta = document.querySelector("#calc .btn");
if ("IntersectionObserver" in window && heroCta && calcCta) {
  const state = { heroGone: false, calcVisible: false };
  const update = () => {
    const show = state.heroGone && !state.calcVisible;
    sticky.classList.toggle("is-visible", show);
    sticky.setAttribute("aria-hidden", String(!show));
    sticky.querySelector("a").tabIndex = show ? 0 : -1;
  };
  new IntersectionObserver(([e]) => {
    state.heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
    update();
  }).observe(heroCta);
  new IntersectionObserver(([e]) => {
    state.calcVisible = e.isIntersecting;
    update();
  }).observe(calcCta);
}
