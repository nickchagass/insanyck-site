// INSANYCK STEP 8
// INSANYCK CHECKOUT-RESURRECTION — Fixed address form with proper data collection
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AccountLayout from "@/components/AccountLayout";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import AddressFormModal, { AddressFormData } from "@/components/Account/AddressFormModal";

type Address = {
  id: string;
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const { t } = useTranslation(["account"]);
  const [items, setItems] = useState<Address[]>([]);
  const [busy, setBusy] = useState(false);
  // INSANYCK CHECKOUT-RESURRECTION — Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // INSANYCK i18n FIX: Traduzir título aqui
  const pageTitle = t("addresses.title", "Endereços");

  async function load() {
    const res = await fetch("/api/account/addresses");
    if (res.ok) {
      const data = await res.json();
      setItems(data.addresses ?? []);
    }
  }
  useEffect(() => {
    load();
  }, []);

  // INSANYCK CHECKOUT-RESURRECTION — Proper form submission
  async function handleSubmit(data: AddressFormData) {
    setBusy(true);
    try {
      const body = {
        ...data,
        isDefault: items.length === 0 ? true : data.isDefault,
      };

      const res = await fetch(
        editingAddress
          ? `/api/account/addresses/${editingAddress.id}`
          : "/api/account/addresses",
        {
          method: editingAddress ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        await load();
        setIsModalOpen(false);
        setEditingAddress(null);
      }
    } finally {
      setBusy(false);
    }
  }

  function handleCreate() {
    setEditingAddress(null);
    setIsModalOpen(true);
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setIsModalOpen(true);
  }

  async function onSetDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await load();
  }

  async function onDelete(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <>
      <Head>
        <title>{pageTitle} — INSANYCK</title>
      </Head>
      <AccountLayout title={pageTitle}>
        <div className="flex items-center justify-between">
          <p className="text-white/70">{t("account:addresses.subtitle", "Gerencie seus endereços de entrega.")}</p>
          <button
            className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            onClick={handleCreate}
            disabled={busy}
          >
            {t("account:addresses.add", "Adicionar endereço")}
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {items.length === 0 ? (
            <p className="text-white/60">{t("account:addresses.empty", "Você ainda não adicionou endereços.")}</p>
          ) : (
            items.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/10 p-4 flex items-center justify-between">
                <div className="text-white/80">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-white/60 text-sm">
                    {a.street}, {a.number} — {a.district} — {a.city}/{a.state} — {a.cep}
                  </div>
                  {a.isDefault && (
                    <span className="inline-block mt-2 text-xs rounded-full px-2 py-1 bg-white/10 text-white/80">
                      {t("account:addresses.default", "Padrão")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => handleEdit(a)}
                  >
                    {t("account:addresses.edit", "Editar")}
                  </button>
                  {!a.isDefault && (
                    <button
                      className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => onSetDefault(a.id)}
                    >
                      {t("account:addresses.setDefault", "Tornar padrão")}
                    </button>
                  )}
                  <button
                    className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => onDelete(a.id)}
                  >
                    {t("account:addresses.remove", "Remover")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* INSANYCK CHECKOUT-RESURRECTION — Address Form Modal */}
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingAddress || undefined}
          mode={editingAddress ? "edit" : "create"}
        />
      </AccountLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: "/conta/login", permanent: false }, props: {} as any };
  }
  return {
    props: await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "account"]),
  };
};
