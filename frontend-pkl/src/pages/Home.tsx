import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Calendar, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  slug: string; 
  isi: string; 
  gambar_url: string; 
  create_at: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // Menampilkan 6 berita per halaman

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['public-posts'],
    queryFn: async () => (await api.get('/posts')).data
  })

  const filteredPosts = posts?.filter(post => 
    post.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Trik UX: Reset ke halaman 1 jika user mencari berita
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. LOGIKA PEMOTONGAN DATA (PAGINATION)
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts?.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-600 tracking-tight shadow-1"><a href="http://localhost:5173/">BERITA DIGITAL D'NEWS</a></h1>
          <div className="text-sm text-slate-500 font-medium">Informasi Berita Terupdate</div>
        </div>
      </nav>

      <header className="bg-orange-600 pt-12 pb-20 px-4 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2"><marquee scrollamount="20">SELAMAT DATANG DI D'NEWS</marquee></h2>
        <p className="text-blue-100 max-w-2xl mx-auto">Temukan pengumuman, berita, dan pengetahuan ilmiah terbaru hanya disini.</p>
      </header>
        
      <main className="max-w-6xl mx-auto p-6 -mt-10">
        <div className="relative mb-10 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berita atau kategori..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border-none focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-80 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 4. MAPPING DATA MENGGUNAKAN currentPosts (Bukan filteredPosts lagi) */}
              {currentPosts?.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col">
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img 
                      src={post.gambar_url} 
                      alt={post.judul}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        {post.nama_kategori}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center text-slate-400 text-xs mb-3 gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {post.judul}
                    </h3>
                    
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                      {post.isi}
                    </p>

                    <Link 
                      to={`/post/${post.slug}`} 
                      className="inline-flex items-center text-orange-600 text-sm font-bold group/btn mt-auto">
                      Baca Selengkapnya 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* 5. TOMBOL PAGINATION (Muncul jika halaman lebih dari 1) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Sebelumnya
                </button>
                <span className="text-sm font-bold text-slate-600 bg-white px-5 py-2.5 rounded-xl border-2 border-slate-200 shadow-sm">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}

        {filteredPosts?.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <p className="text-slate-500 text-lg">Maaf, pencarian untuk <span className="font-bold text-orange-600">"{searchTerm}"</span> tidak ditemukan. 📭</p>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-400 text-sm">
        &copy; 2026 Berita Digital - D'NEWS
      </footer>
    </div>
  )
}