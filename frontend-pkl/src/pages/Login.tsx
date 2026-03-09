import bgImage from '../assets/bgr.png'
// Panggil Hook "Otak" yang baru dibuat
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  // Ekstrak semua hasil olahan dari Hook
  const {
    navigate,
    errorMsg,
    isLoginMode,
    register, handleSubmit, errors, isSubmitting,
    onSubmit, toggleMode
  } = useAuth()

  return (
    <div 
      className="flex h-screen items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-700 bg-white"
              placeholder="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-700 bg-white"
              placeholder="password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6 shadow-md"
          >
            {isSubmitting ? "Memproses..." : (isLoginMode ? "Masuk ke Sistem" : "Daftar Sekarang")}
          </button>
        </form>

        {/* Tombol Ganti Mode Login/Register */}
        <div className="mt-6 text-center text-sm font-medium text-slate-600 flex flex-col gap-4">
          <div>
            {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
            <button 
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {isLoginMode ? "Daftar di sini" : "Login di sini"}
            </button>
          </div>

          {/* Tombol kembali ke Beranda diletakkan di bawah */}
          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-blue-600 font-bold transition-colors text-xs flex items-center justify-center w-full gap-1"
            >
              &larr; Kembali ke Beranda Utama
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}