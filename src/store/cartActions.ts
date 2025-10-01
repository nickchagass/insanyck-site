// src/store/cartActions.ts
export type CartItem = {
  id: string;           // productId
  title: string;
  slug: string;
  image?: string;
  variantId: string;
  priceCents: number;
  currency: string;
  qty: number;
};

function isClient() {
  return typeof window !== "undefined";
}

function getStoreMaybe() {
  // @ts-ignore – se sua store global expõe algo em window
  return isClient() ? (window.__INSANYCK_CART || null) : null;
}

function readLocal(): CartItem[] {
  if (!isClient()) return [];
  try { return JSON.parse(localStorage.getItem("ins_cart") || "[]"); } catch { return []; }
}
function writeLocal(items: CartItem[]) {
  if (!isClient()) return;
  localStorage.setItem("ins_cart", JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const store = getStoreMaybe();
  if (store?.add) {
    store.add(item);
    window.dispatchEvent(new CustomEvent("cart:open"));
    return;
  }
  const items = readLocal();
  const key = `${item.id}:${item.variantId}`;
  const found = items.find(i => `${i.id}:${i.variantId}` === key);
  if (found) found.qty += item.qty;
  else items.push(item);
  writeLocal(items);
  window.dispatchEvent(new CustomEvent("cart:open"));
  window.dispatchEvent(new CustomEvent("toast", { detail: { title: "Adicionado ao carrinho" }}));
}

export function buyNow(item: CartItem) {
  // Estratégia simples: adiciona e abre carrinho (ou redireciona se houver checkout)
  addToCart(item);
  // Se existir integração, tente:
  // location.assign("/checkout"); // comentar se não houver checkout ainda
}