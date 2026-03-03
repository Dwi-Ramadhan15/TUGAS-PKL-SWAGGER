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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMsg("") 
      
      // Kirim { email, password } ke backend
      const response = await api.post('/login', data)

      // Simpan Token JWT
      localStorage.setItem('token', response.data.accessToken || response.data.token)

      // Sukses? Langsung terbang ke halaman Admin
      navigate('/admin')
      
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Login gagal nih. Cek lagi email dan passwordnya ya!")
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

      <div className="w-full max-w-md bg-white/95 p-8 rounded-3xl shadow-2xl border border-white/20 z-10 mx-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Login Admin</h1>
          <p className="text-slate-500 text-sm font-medium">Masuk untuk kelola D'NEWS</p>
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
            {isSubmitting ? "Mengautentikasi..." : "Masuk ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  )
}