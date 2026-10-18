"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">HRIS</h1>
          <p className="text-brand-100 mt-1">Sistem Informasi Sumber Daya Manusia</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">Masuk ke akun Anda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 border-t pt-4">
            <p className="font-medium mb-1">Akun demo (setelah menjalankan seed):</p>
            <p>admin@hris.com / password123 (Admin)</p>
            <p>hr@hris.com / password123 (HR)</p>
            <p>manager@hris.com / password123 (Manager)</p>
            <p>budi@hris.com / password123 (Employee)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
