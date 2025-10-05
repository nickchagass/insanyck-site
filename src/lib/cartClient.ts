// Client-only micro cart (sem deps). SSR-safe.
export type CartItem = {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  qty: number;
  image?: string;
  variantId?: string;
  sku?: string;
};

const KEY = "insanyck:cart";

function safeWindow(): Window | null {
  return typeof window !== "undefined" ? window : null;
}

export function getCart(): CartItem[] {
  const w = safeWindow();
  if (!w) return [];
  try {
    const raw = w.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(KEY, JSON.stringify(items));
  w.dispatchEvent(new CustomEvent("insanyck:cart:update", { detail: { count: items.reduce((a, b) => a + b.qty, 0) } }));
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const idx = items.findIndex(i => (i.variantId && i.variantId === item.variantId) || (i.sku && i.sku === item.sku) || i.id === item.id);
  if (idx >= 0) items[idx].qty += item.qty;
  else items.push(item);
  saveCart(items);
}

export function buyNow(item: CartItem) {
  addToCart({ ...item, qty: Math.max(1, item.qty) });
  // Se já existir /checkout funcional, redirecione:
  if (safeWindow()) {
    location.href = "/checkout";
  }
}