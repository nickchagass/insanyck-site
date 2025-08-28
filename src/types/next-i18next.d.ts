// INSANYCK — i18next lenient typing for CI stabilization
import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    returnNull: false;
    resources: {
      [key: string]: {
        [key: string]: any;
      };
    };
  }
}