// lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Traduções organizadas por namespace (permite crescer para outros módulos)
const resources = {
  pt: {
    checkout: {
      review: "Revisar pedido",
      irParaPagamento: "Ir para pagamento",
      sucesso: "Pagamento aprovado!",
      confirmacao: "Obrigado por comprar INSANYCK.",
      voltar: "Voltar",
      formPagamento: "Formulário de Pagamento",
      pagarAgora: "Pagar agora",
      processando: "Processando...",
      total: "Total",
      cor: "Cor",
      tamanho: "Tamanho",
    },
    menu: {
      home: "Início",
      colecao: "Coleção",
      manifesto: "Manifesto",
      blog: "Blog",
      contato: "Contato",
      cliente: "Área do Cliente",
      carrinho: "Carrinho"
    }
  },
  en: {
    checkout: {
      review: "Review Order",
      irParaPagamento: "Proceed to Payment",
      sucesso: "Payment Successful!",
      confirmacao: "Thank you for shopping INSANYCK.",
      voltar: "Back",
      formPagamento: "Payment Form",
      pagarAgora: "Pay now",
      processando: "Processing...",
      total: "Total",
      cor: "Color",
      tamanho: "Size",
    },
    menu: {
      home: "Home",
      colecao: "Collection",
      manifesto: "Manifest",
      blog: "Blog",
      contato: "Contact",
      cliente: "Client Area",
      carrinho: "Cart"
    }
  }
};

i18n
  .use(LanguageDetector) // detecta idioma do browser automaticamente
  .use(initReactI18next)
  .init({
    resources,
    ns: ["checkout", "menu"], // namespaces para organização modular
    defaultNS: "checkout",
    fallbackLng: "pt",
    detection: {
      // Prioridade: querystring, localStorage, cookie, navegador
      order: ["querystring", "localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false, // React já faz escaping
    },
    debug: process.env.NODE_ENV === "development"
  });

export default i18n;
