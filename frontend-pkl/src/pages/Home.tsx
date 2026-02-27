import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Calendar, Tag, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  isi: string; 
  gambar_url: string; 
  create_at: string;
}

export default function Home() {
  // STATE UNTUK SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // Ambil data postingan
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['public-posts'],
    queryFn: async () => (await api.get('/posts')).data
  })

  // LOGIKA FILTER PENCARIAN
  const filteredPosts = posts?.filter(post => 
    post.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Sederhana */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">BERITA DIGITAL D'NEWS</h1>
          <div className="text-sm text-slate-500 font-medium">Informasi Berita Terupdate</div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-blue-600 pt-12 pb-20 px-4 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">SELAMAT DATANG DI D'NEWS</h2>
        <p className="text-blue-100 max-w-2xl mx-auto">Temukan pengumuman, berita, dan pengetahuan ilmiah terbaru hanya disini.</p>
      </header>
        
      <main className="max-w-6xl mx-auto p-6 -mt-10">
        
        {/* INPUT PENCARIAN (SEARCH BAR) */}
        <div className="relative mb-10 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berita atau kategori..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TAMPILAN GRID POSTINGAN */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-80 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts?.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                {/* Bagian Gambar */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.gambar_url} 
                    alt={post.judul}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      {post.nama_kategori}
                    </span>
                  </div>
                </div>

                {/* Bagian Konten */}
                <div className="p-6">
                  <div className="flex items-center text-slate-400 text-xs mb-3 gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.judul}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {post.isi}
                  </p>

                  <Link 
                    to={`/post/${post.id}`} 
                    className="flex items-center text-blue-600 text-sm font-bold group/btn">
                    Baca Selengkapnya 
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredPosts?.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <p className="text-slate-500 text-lg">Maaf, pencarian untuk <span className="font-bold text-slate-700">"{searchTerm}"</span> tidak ditemukan. 📭</p>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-400 text-sm">
        &copy; 2026 Berita Digital - D'NEWS
      </footer>
    </div>
  )
}