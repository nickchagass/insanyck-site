// i18n Custom Types (lenient but typed)
import "i18next";

declare module "i18next" {
  interface _CustomTypeOptions {
    resources: Record<string, Record<string, string>>;
    defaultNS: "common";
    returnNull: false;
    nsSeparator: ":";     // usamos "namespace:key"
    keySeparator: ".";    // "path.to.key"
  }
}