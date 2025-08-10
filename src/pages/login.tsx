// src/pages/login.tsx
import { useState } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  // Lida com erro enviado pela URL (?error=...)
  const errorParam = router.query.error;
  useState(() => {
    if (errorParam) setErro("E-mail ou senha inválidos.");
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/"); // ou redirecione para onde quiser
    } else {
      setErro("E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
      <div className="bg-neutral-900 border border-yellow-400/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Entrar na INSANYCK</h2>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition mb-6"
        >
          <svg width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.4 33.8 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.8 4.5 29.7 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.4 0 20.1-7.7 20.1-20 0-1.3-.1-2.2-.3-3.5z"></path><path fill="#34A853" d="M6.7 14.1l7 5.1C15.3 16.5 19.3 13 24 13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.8 4.5 29.7 2.5 24 2.5c-7.8 0-14.5 4.6-17.8 11.6z"></path><path fill="#FBBC05" d="M24 43.5c5.5 0 10.4-1.8 14.1-5l-6.5-5.3c-2 1.5-4.7 2.6-7.6 2.6-5.8 0-10.6-3.9-12.3-9.1l-7 5.4C8.6 39.3 15.7 43.5 24 43.5z"></path><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.4 33.8 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.3-6.3C34.8 4.5 29.7 2.5 24 2.5c-7.8 0-14.5 4.6-17.8 11.6z"></path></g></svg>
          Entrar com Google
        </button>

        <div className="mb-6 text-center text-gray-400">ou entre com e-mail</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
          />
          <input
            type="password"
            required
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
          />
          {erro && <div className="text-red-500 font-bold text-center">{erro}</div>}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
