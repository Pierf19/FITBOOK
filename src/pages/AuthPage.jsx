import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";

export default function AuthPage() {
	const [mode, setMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuthActions();
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");

		if (mode === "register" && name.trim().length < 2) {
			setError("Nama minimal 2 karakter.");
			return;
		}

		if (!email.includes("@")) {
			setError("Email tidak valid.");
			return;
		}

		if (password.length < 8) {
			setError("Password minimal 8 karakter.");
			return;
		}

		setLoading(true);
		try {
			await signIn("password", { 
				email, 
				password, 
				flow: mode === "login" ? "signIn" : "signUp",
				name: mode === "register" ? name.trim() : undefined,
				role: mode === "register" ? "user" : undefined
			});
			navigate("/admin", { replace: true });
		} catch (err) {
            let msg = err.message ?? "Autentikasi gagal.";
            if (msg.includes("Invalid password")) {
                msg = "Password minimal 8 karakter dan harus mengandung huruf kecil, huruf besar, angka, serta simbol khusus (seperti @, !, #).";
            } else if (msg.includes("already exists")) {
                msg = "Email ini sudah terdaftar! Silakan pindah ke mode 'Masuk'.";
            } else if (msg.includes("Invalid email")) {
                msg = "Format email tidak valid.";
            } else if (msg.includes("InvalidSecret")) {
                msg = "Password salah. Silakan periksa kembali ketikan Anda.";
            } else if (msg.includes("InvalidAccountId")) {
                msg = "Email tidak terdaftar atau salah.";
            }
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-[calc(100vh-73px)] flex flex-col md:flex-row">
			<div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 border-r border-[#222]">
				<div className="w-full max-w-sm space-y-8">
					<div>
						<h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none mb-4 whitespace-pre-line">
							{mode === "login" ? "SELAMAT\nDATANG" : "BUAT\nAKUN"}
						</h1>
						<p className="text-gray-400 text-sm">
							Masuk untuk mulai booking sesi latihan dengan trainer terbaik.
						</p>
					</div>

					{error && (
						<div className="bg-red-900/50 border border-red-500 text-red-200 text-sm rounded-lg px-4 py-3">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{mode === "register" && (
							<>
								<div className="space-y-1.5">
									<label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase">
										Nama Lengkap
									</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Nama kamu"
										className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#cdff00] transition-colors"
										required
									/>
								</div>
							</>
						)}

						<div className="space-y-1.5">
							<label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="email@kamu.com"
								className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#cdff00] transition-colors"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="********"
								className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#cdff00] transition-colors"
								required
							/>
							{mode === "register" && (
								<ul className="text-[10px] text-gray-500 list-disc pl-4 mt-1 space-y-0.5">
									<li>Minimal 8 karakter</li>
									<li>Minimal 1 huruf besar (A-Z) dan 1 huruf kecil (a-z)</li>
									<li>Minimal 1 angka (0-9)</li>
									<li>Minimal 1 simbol khusus (misal: @, !, #)</li>
								</ul>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#cdff00] text-black py-3 rounded-md font-bold hover:bg-[#b8e600] transition-colors disabled:opacity-60"
						>
							{loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
						</button>
					</form>

					<p className="text-sm text-gray-500 text-center">
						{mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"} {" "}
						<button
							onClick={() => {
								setMode(mode === "login" ? "register" : "login");
								setError("");
							}}
							className="text-[#cdff00] font-bold hover:underline"
						>
							{mode === "login" ? "Daftar Sekarang" : "Masuk"}
						</button>
					</p>
				</div>
			</div>

			<div className="hidden md:flex w-full md:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden bg-[#0a0a0a]">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(205,255,0,0.05)_0%,transparent_70%)]" />
				<div className="max-w-md relative z-10 text-center">
					<h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
						LATIHAN LEBIH <span className="text-[#cdff00]">CERDAS</span>
					</h2>
					<p className="text-gray-400 leading-relaxed text-sm">
						Booking trainer profesional, jadwal fleksibel, dan pantau progres kebugaran kamu dalam satu platform.
					</p>
				</div>
			</div>
		</div>
	);
}
