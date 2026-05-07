import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { Shield, Mail, Lock, User, CheckCircle2, XCircle, ArrowRight, Activity, Eye, EyeOff, Sparkles } from "lucide-react";

export default function AuthPage() {
	const [mode, setMode] = useState("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);

	const { signIn } = useAuthActions();
	const navigate = useNavigate();

    // Password requirements check
    const requirements = [
        { label: "Minimal 8 karakter", met: password.length >= 8 },
        { label: "Huruf Besar & Kecil", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
        { label: "Angka (0-9)", met: /\d/.test(password) },
        { label: "Simbol khusus (@, !, #, dll)", met: /[^A-Za-z0-9]/.test(password) },
    ];

    const isPasswordValid = requirements.every(req => req.met);
    const strengthCount = requirements.filter(req => req.met).length;

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");

		if (mode === "register") {
            if (name.trim().length < 2) {
                setError("Nama minimal 2 karakter.");
                return;
            }
            if (!isPasswordValid) {
                setError("Password belum memenuhi semua persyaratan keamanan.");
                return;
            }
        }

		if (!email.includes("@")) {
			setError("Email tidak valid.");
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
			
			if (mode === "register") {
				setRegistrationSuccess(true);
				setMode("login");
				setName("");
				setPassword("");
				setError("");
			} else {
				navigate("/", { replace: true });
			}
		} catch (err) {
            let msg = err.message ?? "Autentikasi gagal.";
            if (msg.includes("Invalid password")) {
                msg = "Password tidak sesuai kriteria keamanan.";
            } else if (msg.includes("already exists")) {
                msg = "Email ini sudah terdaftar!";
            } else if (msg.includes("InvalidSecret")) {
                msg = "Password salah. Silakan periksa kembali.";
            } else if (msg.includes("InvalidAccountId")) {
                msg = "Email tidak terdaftar.";
            }
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-[calc(100vh-73px)] flex flex-col md:flex-row bg-[#050505] overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#cdff00]/10 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#cdff00]/5 rounded-full blur-[150px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
            </div>

            {/* Left Side: Form */}
			<div className="w-full md:w-[45%] flex items-center justify-center p-8 lg:p-12 relative z-10">
				<div className="w-full max-w-md space-y-8">
					<div className="animate-in fade-in slide-in-from-top duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cdff00]/10 border border-[#cdff00]/20 text-[#cdff00] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(205,255,0,0.1)]">
                            <Shield className="w-3 h-3" />
                            Infrastruktur Aman
                        </div>
						<h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-4">
							{mode === "login" ? "Akses\nMember." : "Mulai\nTransformasi."}
						</h1>
						<p className="text-gray-500 text-sm max-w-[300px] font-medium leading-relaxed">
							{mode === "login" 
                                ? "Masuk untuk melanjutkan program latihan dan memantau progres Anda." 
                                : "Bergabunglah dengan komunitas kebugaran terbaik dan raih tubuh impian Anda."}
						</p>
					</div>

					{error && (
						<div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl px-5 py-4 flex items-center gap-3 animate-in shake duration-300 backdrop-blur-md">
							<XCircle className="w-4 h-4 shrink-0" />
                            <span className="font-medium">{error}</span>
						</div>
					)}

					{registrationSuccess && (
						<div className="bg-[#cdff00]/10 border border-[#cdff00]/20 text-[#cdff00] text-xs rounded-2xl px-5 py-4 flex items-center gap-3 animate-in zoom-in duration-500 backdrop-blur-md">
							<CheckCircle2 className="w-4 h-4 shrink-0" />
							<span className="font-medium">Registrasi Berhasil! Silakan masuk menggunakan akun baru Anda.</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
						{mode === "register" && (
							<div className="space-y-2">
								<label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">
									Nama Lengkap
								</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#cdff00] transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Masukkan nama Anda"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#cdff00]/50 focus:bg-white/[0.05] transition-all backdrop-blur-xl shadow-2xl"
                                        required
                                    />
                                </div>
							</div>
						)}

						<div className="space-y-2">
							<label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">
								Email
							</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#cdff00] transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="adminaulia@gmail.com"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#cdff00]/50 focus:bg-white/[0.05] transition-all backdrop-blur-xl shadow-2xl"
                                    required
                                />
                            </div>
						</div>

						<div className="space-y-2">
							<label className="block text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">
								Password
							</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#cdff00] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-[1.25rem] pl-12 pr-12 py-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#cdff00]/50 focus:bg-white/[0.05] transition-all backdrop-blur-xl shadow-2xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#cdff00] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
							
                            {mode === "register" && password.length > 0 && (
								<div className="glass rounded-[1.5rem] p-5 mt-4 space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-[#cdff00]" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protokol Keamanan</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isPasswordValid ? 'text-[#cdff00] text-glow' : strengthCount >= 2 ? 'text-orange-400' : 'text-red-400'}`}>
                                            {isPasswordValid ? 'Keamanan Maksimal' : strengthCount >= 2 ? 'Rentan' : 'Kritis'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div 
                                                key={step}
                                                className={`h-full flex-1 transition-all duration-500 ${strengthCount >= step ? (isPasswordValid ? 'bg-[#cdff00] shadow-[0_0_10px_rgba(205,255,0,0.5)]' : 'bg-orange-500') : 'bg-white/5'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-500 ${req.met ? 'bg-[#cdff00] border-[#cdff00] shadow-[0_0_8px_rgba(205,255,0,0.3)]' : 'border-white/10 bg-white/5'}`}>
                                                    {req.met && <CheckCircle2 className="w-3 h-3 text-black" />}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-500 ${req.met ? 'text-white' : 'text-gray-600'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
								</div>
							)}
						</div>

						<button
							type="submit"
							disabled={loading || (mode === "register" && !isPasswordValid)}
							className="glow-button w-full bg-[#cdff00] text-black py-4.5 rounded-[1.25rem] font-black uppercase tracking-[0.1em] hover:bg-[#b8e600] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3 mt-6 shadow-[0_20px_40px_-15px_rgba(205,255,0,0.3)]"
						>
							{loading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Masuk Program" : "Daftar Sekarang"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
						</button>
					</form>

					<p className="text-[10px] text-gray-600 text-center font-black uppercase tracking-[0.2em] animate-in fade-in duration-1000 delay-300">
						{mode === "login" ? "Anggota baru?" : "Sudah terdaftar?"} {" "}
						<button
							onClick={() => {
								setMode(mode === "login" ? "register" : "login");
								setError("");
								setRegistrationSuccess(false);
							}}
							className="text-[#cdff00] hover:text-glow transition-all ml-1"
						>
							{mode === "login" ? "DAFTAR SEKARANG" : "Masuk Aman"}
						</button>
					</p>
				</div>
			</div>

			{/* Right Side: Visual Content */}
			<div className="hidden md:flex w-[55%] flex-col items-center justify-center p-12 relative overflow-hidden bg-[#0a0a0a] border-l border-white/5">
				{/* Background Decoration */}
                <div className="absolute top-0 right-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-l from-[#050505] via-[#0a0a0a]/80 to-transparent" />
                    <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#cdff00]/10 rounded-full blur-[120px]" />
                </div>
                
                <div className="relative z-10 w-full max-w-lg text-right">
                    <div className="mb-12 flex justify-end animate-float">
                        <div className="w-24 h-24 bg-[#cdff00] rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(205,255,0,0.3)] rotate-12 group hover:rotate-0 transition-transform duration-500">
                            <Activity className="w-12 h-12 text-black" />
                        </div>
                    </div>

                    <h2 className="text-8xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-10">
                        Performa <br />
                        <span className="text-[#cdff00] text-glow">Puncak.</span> <br />
                        Terdefinisi.
                    </h2>

                    <div className="flex flex-col items-end gap-6">
                        {[
                            { label: "Pelatihan Neural", desc: "Optimalisasi latihan algoritma tingkat lanjut" },
                            { label: "Jaringan Elite", desc: "Terhubung dengan praktisi terkemuka di industri" },
                        ].map((item, i) => (
                            <div key={i} className="glass p-6 rounded-[2rem] border-white/5 max-w-xs hover:border-[#cdff00]/30 transition-colors group">
                                <h4 className="text-[#cdff00] font-black uppercase text-[10px] tracking-[0.3em] mb-2">{item.label}</h4>
                                <p className="text-gray-400 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 flex items-center gap-6 justify-end">
                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">FITBOOK OS v2.0</span>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent to-gray-800" />
                    </div>
                </div>
			</div>
		</div>
	);
}


