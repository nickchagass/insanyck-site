// INSANYCK STEP 8
type EventName =
  | "view_item"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "search"
  | "select_suggestion"
  | "begin_checkout"
  | "purchase";

export function track(_event: EventName, _payload?: Record<string, any>) {
  try {
    if (process.env.NODE_ENV === "development") {
      // Debug em desenvolvimento via console.debug (removido para ESLint)
    }
    // Aqui no futuro podemos enviar para GA/Segment etc.
  } catch {
    // não bloqueia UI
  }
}
