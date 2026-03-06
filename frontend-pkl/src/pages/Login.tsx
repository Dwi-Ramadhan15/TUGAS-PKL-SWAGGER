import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../lib/axios'
import bgImage from '../assets/bgr.png'

// "Satpam" Zod kita update pakai format Email
const loginSchema = z.object({
  email: z.string().email("Format emailnya belum bener nih bestie!").min(1, "Email nggak boleh kosong dong!"),
  password: z.string().min(6, "Password minimal 6 karakter ya!"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")
  
  // State baru untuk menentukan form Login atau Register
  const [isLoginMode, setIsLoginMode] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMsg("") 
      
      if (isLoginMode) {
        // Kirim { email, password } ke backend
        const response = await api.post('/login', data)

        // Simpan Token JWT (dan kita tambahkan role & userId)
        localStorage.setItem('token', response.data.accessToken || response.data.token)
        localStorage.setItem('role', response.data.role)
        localStorage.setItem('userId', response.data.userId)

        // Sukses? Langsung terbang ke halaman Admin (atau Beranda kalau dia cuma user)
        if (response.data.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/') 
        }
      } else {
        // Logika untuk Register
        await api.post('/register', data)
        alert("Akun berhasil dibuat! Silakan Login sekarang!")
        setIsLoginMode(true) 
        reset() 
      }
      
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || (isLoginMode ? "Login gagal nih. Cek lagi email dan passwordnya ya!" : "Gagal mendaftar, email mungkin sudah dipakai!"))
    }
  }

  return (
    // Container utama dengan background image dari file bgr.png
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
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg("");
                reset();
              }}
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