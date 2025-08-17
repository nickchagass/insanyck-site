// INSANYCK STEP 8
type EventName =
  | "view_item"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "search"
  | "select_suggestion"
  | "begin_checkout"
  | "purchase";

export function track(event: EventName, payload?: Record<string, any>) {
  try {
    if (process.env.NODE_ENV === "development") {
      console.debug("[INSANYCK][analytics]", event, payload ?? {});
    }
    // Aqui no futuro podemos enviar para GA/Segment etc.
  } catch {
    // não bloqueia UI
  }
}
