import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../lib/axios'

// "Satpam" Zod kita update pakai format Email
const loginSchema = z.object({
  email: z.string().email("Format emailnya belum bener nih bestie!").min(1, "Email nggak boleh kosong dong!"),
  password: z.string().min(6, "Password minimal 6 karakter ya!"),
})

export type LoginForm = z.infer<typeof loginSchema>

export function useAuth() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")
  
  // State untuk menentukan form Login atau Register
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

  // Fungsi khusus untuk *toggle* tombol register/login
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMsg("");
    reset();
  }

  return {
    navigate,
    errorMsg,
    isLoginMode,
    register, handleSubmit, errors, isSubmitting,
    onSubmit, toggleMode
  }
}