// Loosen TFunction just enough to accept string keys
import "i18next";

declare module "i18next" {
  interface _TFunction {
    (_key: string, _options?: any): string;
    (_keys: string[], _options?: any): string;
  }
}