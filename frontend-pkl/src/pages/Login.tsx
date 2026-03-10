import bgImage from '../assets/bgr.png'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const {
    navigate,
    errorMsg, successMsg, setErrorMsg, // Ditambahkan setErrorMsg
    isLoginMode, isOtpMode, 
    registeredEmail, otpCode, setOtpCode, isVerifying,
    // Ekstraksi state & fungsi baru untuk lupa password
    isForgotMode, setIsForgotMode, forgotStep, setForgotStep,
    forgotEmail, setForgotEmail, forgotNewPass, setForgotNewPass,
    handleRequestForgotOTP, handleResetPassword,
    register, handleSubmit, errors, isSubmitting,
    onSubmit, handleVerifyOTP, toggleMode
  } = useAuth()

  // JIKA SEDANG MODE VERIFIKASI OTP
  if (isOtpMode) {
    return (
      <div className="flex h-screen items-center justify-center relative overflow-hidden"
           style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl z-10 mx-4 relative text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifikasi WhatsApp</h2>
          <p className="text-slate-500 text-sm mb-6">
            Kami telah mengirimkan 6 digit kode OTP ke WhatsApp Anda. Masukkan kode tersebut untuk mengaktifkan <b>{registeredEmail}</b>.
          </p>

          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium">{successMsg}</div>}
          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">{errorMsg}</div>}

          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              className="w-full text-center tracking-[0.5em] text-2xl font-bold border-2 border-slate-200 rounded-xl p-4 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none mb-6"
              placeholder="------"
            />
            <button
              type="submit"
              disabled={isVerifying || otpCode.length < 6}
              className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all disabled:bg-slate-400"
            >
              {isVerifying ? "Mengecek Kode..." : "Verifikasi Sekarang"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // TAMPILAN KHUSUS LUPA PASSWORD
  if (isForgotMode) {
    return (
      <div className="flex h-screen items-center justify-center relative overflow-hidden" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl z-10 mx-4 relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Lupa Password?</h2>
            <p className="text-slate-500 text-sm">Jangan panik! Masukkan email Anda untuk mereset kata sandi.</p>
          </div>
          
          {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium text-center">{successMsg}</div>}
          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium text-center">{errorMsg}</div>}

          {forgotStep === 1 ? (
            <form onSubmit={handleRequestForgotOTP}>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Terdaftar</label>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 outline-none mb-6" placeholder="email@domain.com" required />
              <button type="submit" disabled={isVerifying} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 mb-4">
                {isVerifying ? "Memeriksa..." : "Kirim OTP ke WhatsApp"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Kode OTP (6 Digit)</label>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={6} className="w-full text-center tracking-[0.5em] text-xl font-bold border-2 border-slate-200 rounded-xl p-3 focus:border-green-500 outline-none" placeholder="------" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password Baru</label>
                <input type="password" value={forgotNewPass} onChange={(e) => setForgotNewPass(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-green-500 outline-none" placeholder="Minimal 6 karakter" required />
              </div>
              <button type="submit" disabled={isVerifying} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 disabled:bg-slate-400 mb-4">
                {isVerifying ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          )}
          <button onClick={() => { setIsForgotMode(false); setForgotStep(1); setErrorMsg(""); setSuccessMsg(""); }} className="w-full text-slate-500 hover:text-slate-800 font-bold text-sm">
            Batal & Kembali ke Login
          </button>
        </div>
      </div>
    )
  }

  // TAMPILAN DEFAULT (LOGIN / REGISTER)
  return (
    <div 
      className="flex h-screen items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div className="w-full max-w-md bg-white/95 p-8 rounded-3xl shadow-2xl border border-white/20 z-10 mx-4 relative">
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
            {isLoginMode ? "Login Akun" : "Buat Akun"}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isLoginMode ? "Masuk untuk kelola D'NEWS atau berkomentar" : "Daftar untuk ikut berdiskusi di D'NEWS"}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm flex items-center shadow-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Form Ekstra untuk Register */}
          {!isLoginMode && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" {...register("nama")} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-white" placeholder="Masukkan Nama" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor WhatsApp Aktif</label>
                <input type="tel" {...register("no_wa")} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-white" placeholder="0812xxxxxxxx" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" {...register("email")} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 outline-none bg-white" placeholder="email@gmail.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
               <label className="block text-sm font-bold text-slate-700">Password</label>
               {/* TOMBOL LUPA PASSWORD DITAMBAHKAN DI SINI */}
            </div>
            <input type="password" {...register("password")} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 outline-none bg-white" placeholder="password" />
            {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-400 mt-6 shadow-md">
            {isSubmitting ? "Memproses..." : (isLoginMode ? "Masuk ke Sistem" : "Kirim Kode WA")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-slate-600 flex flex-col gap-4">
          <div>
            {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={toggleMode} className="text-blue-600 hover:underline transition-colors">
              {isLoginMode ? "Daftar di sini" : "Login di sini"}
            </button>
          </div>
          <div>
               {isLoginMode && (
                 <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs text-blue-600 hover:underline font-bold">Lupa Password?</button>
               )}
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-blue-600 font-bold transition-colors text-xs flex justify-center w-full gap-1">
              &larr; Kembali ke Beranda Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}