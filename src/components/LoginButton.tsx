// src/components/LoginButton.tsx
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button disabled>Carregando...</button>;

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span>Olá, {session.user?.name || session.user?.email}!</span>
        <button
          className="bg-red-500 text-white rounded px-4 py-2"
          onClick={() => signOut()}
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <button
      className="bg-blue-500 text-white rounded px-4 py-2"
      onClick={() => signIn()} // abre a tela do NextAuth
    >
      Entrar
    </button>
  );
}
