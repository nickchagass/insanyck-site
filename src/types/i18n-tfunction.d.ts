// Loosen TFunction just enough to accept string keys
import "i18next";

declare module "i18next" {
  interface TFunction {
    (key: string, options?: any): string;
    (keys: string[], options?: any): string;
  }
}