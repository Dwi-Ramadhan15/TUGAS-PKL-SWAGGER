import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../lib/axios'

// Zod di-update: Tambah 'nama' dan 'no_wa'
const authSchema = z.object({
  nama: z.string().optional(), 
  no_wa: z.string().optional(), // No WA wajib untuk Register
  email: z.string().email("Format emailnya belum bener nih bestie!").min(1, "Email nggak boleh kosong dong!"),
  password: z.string().min(6, "Password minimal 6 karakter ya!"),
})

export type AuthForm = z.infer<typeof authSchema>

export function useAuth() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("") // Pesan sukses OTP
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  // State baru untuk OTP WA
  const [isOtpMode, setIsOtpMode] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) 
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotNewPass, setForgotNewPass] = useState("")

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  })

  // REGISTER / LOGIN
  const onSubmit = async (data: AuthForm) => {
    try {
      setErrorMsg("") 
      setSuccessMsg("")
      
      if (isLoginMode) {
        // PROSES LOGIN 
        const response = await api.post('/login', { email: data.email, password: data.password })
        localStorage.setItem('token', response.data.accessToken || response.data.token)
        localStorage.setItem('role', response.data.role)
        localStorage.setItem('userId', response.data.userId)

        if (response.data.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/') 
        }

      } else {
        // PROSES REGISTER
        if (!data.nama || data.nama.trim() === '') return setErrorMsg("Nama lengkap wajib diisi ya!")
        if (!data.no_wa || data.no_wa.trim() === '') return setErrorMsg("Nomor WhatsApp wajib diisi buat ngirim OTP!")
        
        // Kirim data ke backend (Backend akan buat OTP dan kirim ke WA)
        const response = await api.post('/register', data)
        
        // Jika sukses, ubah tampilan jadi form OTP
        setRegisteredEmail(response.data.email || data.email) // Simpan email yg baru didaftarkan
        setIsOtpMode(true) // Munculkan pop-up / form OTP
        setSuccessMsg("Kode OTP telah dikirim ke WhatsApp Anda. Silakan cek!")
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || (isLoginMode ? "Login gagal nih. Cek lagi email dan passwordnya ya!" : "Gagal mendaftar, email mungkin sudah dipakai!"))
    }
  }

  // VERIFIKASI OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return setErrorMsg("Masukkan kode OTP-nya dulu!");
    
    setIsVerifying(true);
    setErrorMsg("");

    try {
      await api.post('/verify-otp', { email: registeredEmail, otp: otpCode });
      
      // Jika berhasil
      alert("Verifikasi Sukses! Akun Anda sudah aktif. Silakan Login.");
      
      // Kembalikan form ke mode Login awal
      setIsOtpMode(false);
      setIsLoginMode(true);
      reset();
      setOtpCode("");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Kode OTP salah atau tidak valid!");
    } finally {
      setIsVerifying(false);
    }
  }

  const handleRequestForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return setErrorMsg("Masukkan email yang terdaftar!");
    setIsVerifying(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await api.post('/forgot-password', { email: forgotEmail });
      setSuccessMsg(res.data.message);
      setForgotStep(2);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Email tidak ditemukan!");
    } finally { setIsVerifying(false); }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !forgotNewPass) return setErrorMsg("OTP dan Password baru wajib diisi!");
    if (forgotNewPass.length < 6) return setErrorMsg("Password baru minimal 6 karakter!");
    setIsVerifying(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await api.post('/reset-password', { email: forgotEmail, otp: otpCode, new_password: forgotNewPass });
      alert(res.data.message);
      setIsForgotMode(false); setForgotStep(1); setIsLoginMode(true);
      setOtpCode(""); setForgotEmail(""); setForgotNewPass("");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Kode OTP salah!");
    } finally { setIsVerifying(false); }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setIsOtpMode(false);
    setIsForgotMode(false);
    setErrorMsg("");
    setSuccessMsg("");
    reset();
  }

  return {
    navigate,
    errorMsg, successMsg, setErrorMsg,
    isLoginMode, isOtpMode, isVerifying,
    registeredEmail, otpCode, setOtpCode,
    isForgotMode, setIsForgotMode, forgotStep, setForgotStep,
    forgotEmail, setForgotEmail, forgotNewPass, setForgotNewPass,
    register, handleSubmit, errors, isSubmitting,
    onSubmit, handleVerifyOTP, toggleMode,
    handleRequestForgotOTP, handleResetPassword
  }
}