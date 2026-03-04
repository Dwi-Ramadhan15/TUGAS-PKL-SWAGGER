import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Compass } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* BAGIAN ANIMASI 1: Ikon Kompas Berputar */}
      <div className="animate-[spin_4s_linear_infinite] text-orange-500 mb-6 drop-shadow-lg">
        <Compass size={100} strokeWidth={1.5} />
      </div>

      {/* BAGIAN ANIMASI 2: Angka 404 Melompat/Mengambang */}
      <h1 className="text-9xl font-black text-slate-800 animate-bounce">
        404
      </h1>

      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-4 text-center">
        Waduh, Kamu Tersesat! 🏜️
      </h2>

      <p className="text-slate-500 mt-4 mb-8 text-center max-w-md leading-relaxed">
        Halaman berita yang kamu cari sepertinya sudah dipindah, dihapus, atau memang tidak pernah ada di server D'NEWS.
      </p>

      {/* BAGIAN ANIMASI 3: Tombol dengan Efek Hover */}
      <Button 
        onClick={() => navigate('/')} 
        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300"
      >
        Kembali ke Peradaban (Beranda)
      </Button>

    </div>
  )
}