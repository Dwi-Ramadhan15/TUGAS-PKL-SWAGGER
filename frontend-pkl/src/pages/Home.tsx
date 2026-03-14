import { Calendar, ChevronRight, Search, LogOut, LogIn, Star, Eye, Layers, Menu, X } from 'lucide-react' 
import { Link } from 'react-router-dom'
import { useHome, type Post } from '../hooks/useHome'

export default function Home() {
  const {
    navigate,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    uniqueCategories,
    currentPage, setCurrentPage,
    isLoggedIn, handleLogout,
    isLoading, currentPosts, totalPages,
    popularPosts,
    isSidebarOpen, setIsSidebarOpen
  } = useHome()

  const categoryColors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-purple-500', 'bg-orange-500', 'bg-teal-500'
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* ================= NAVBAR DENGAN HAMBURGER MENU ================= */}
      <nav className="bg-white border-b sticky top-0 z-[40] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* IKON GARIS TIGA (HAMBURGER MENU) */}
            <Menu 
              onClick={() => setIsSidebarOpen(true)} 
              className="w-7 h-7 cursor-pointer text-slate-700 hover:text-orange-600 transition-colors" 
            />
            <Link to="/" onClick={() => {setSearchTerm(""); setSelectedCategory(null)}} className="text-2xl font-black text-orange-600 tracking-tighter">
              D'NEWS
            </Link>
          </div>
          
          <div className="hidden md:flex gap-6 font-bold text-sm text-slate-700">
            <span onClick={() => setSelectedCategory(null)} className="cursor-pointer hover:text-orange-600 transition-colors">Home</span>
            <span className="hover:text-orange-600 cursor-pointer transition-colors">Nasional</span>
            <span className="hover:text-orange-600 cursor-pointer transition-colors">Teknologi</span>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-orange-600 hover:text-white transition-all"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ================= DRAWER SIDEBAR KIRI (OFF-CANVAS) ================= */}
      {/* Background Gelap (Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[50] backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Kotak Sidebar Laci */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-slate-50">
          <span className="font-black text-slate-800 text-lg">Menu Navigasi</span>
          <X 
            onClick={() => setIsSidebarOpen(false)} 
            className="w-6 h-6 cursor-pointer text-slate-500 hover:text-red-500 transition-colors" 
          />
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-4">Kategori Berita</h3>
          <ul className="space-y-4 font-bold text-sm">
            <li 
              onClick={() => {setSelectedCategory(null); setIsSidebarOpen(false);}}
              className={`flex items-center gap-3 cursor-pointer transition-colors ${
                selectedCategory === null ? 'text-orange-600 font-black' : 'text-slate-700 hover:text-orange-600'
              }`}
            >
              <Layers className="w-4 h-4 text-orange-500" /> Semua Kategori
            </li>
            {uniqueCategories.map((kategori, index) => (
              <li 
                key={index}
                // Pas diklik, ganti kategori DAN laci otomatis nutup biar user fokus baca
                onClick={() => {setSelectedCategory(kategori); setIsSidebarOpen(false);}}
                className={`flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedCategory === kategori ? 'text-orange-600 font-black' : 'text-slate-700 hover:text-orange-600'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${categoryColors[index % categoryColors.length]}`}></div> 
                {kategori}
              </li>
            ))}
          </ul>

          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-4 mt-10">Layanan Ekstra</h3>
          <ul className="space-y-4 font-bold text-slate-700 text-sm">
            <li className="hover:text-orange-600 cursor-pointer flex items-center gap-2"><ChevronRight className="w-4 h-4 text-slate-400"/> Pasang Iklan</li>
            <li className="hover:text-orange-600 cursor-pointer flex items-center gap-2"><ChevronRight className="w-4 h-4 text-slate-400"/> Karir (Lowongan)</li>
            <li className="hover:text-orange-600 cursor-pointer flex items-center gap-2"><ChevronRight className="w-4 h-4 text-slate-400"/> Hubungi Kami</li>
          </ul>
        </div>
      </div>

      <div className="bg-orange-600 text-white py-2 text-sm font-bold tracking-wider">
        <div className="max-w-[1200px] mx-auto px-4">
          <marquee scrollamount="10">
            SELAMAT DATANG DI D'NEWS - SUMBER INFORMASI DAN PENGETAHUAN TERPERCAYA - BACA BERITA TERBARU HARI INI
          </marquee>
        </div>
      </div>
        
      <main className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
        
        {/* === KOLOM KIRI (KONTEN BERITA - KINI LEBIH LEBAR: 70%) === */}
        <section className="w-full lg:w-[70%] flex flex-col min-h-screen">
          
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berita, tutorial, atau pengumuman..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100/80 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center uppercase tracking-tight">
            <span className="w-3 h-6 bg-orange-600 mr-3 rounded-sm"></span>
            {selectedCategory ? `Berita: ${selectedCategory}` : 'Berita Terbaru'}
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 bg-slate-50 p-4 rounded-xl animate-pulse">
                  <div className="w-1/3 h-32 bg-slate-200 rounded-lg shrink-0" />
                  <div className="w-2/3 space-y-3 py-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-200 rounded w-full" />
                    <div className="h-5 bg-slate-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-8">
                {currentPosts?.map((post: Post) => (
                  <article key={post.id} className="flex flex-col sm:flex-row gap-6 group border-b border-slate-100 pb-8 last:border-0">
                    <div className="w-full sm:w-[40%] h-56 sm:h-44 overflow-hidden rounded-2xl shrink-0 relative shadow-sm">
                      <img 
                        src={post.gambar_url} 
                        alt={post.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md uppercase">
                        {post.nama_kategori}
                      </span>
                    </div>

                    <div className="w-full sm:w-[60%] flex flex-col justify-center">
                      <Link to={`/post/${post.slug}`} className="text-2xl font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 mb-3">
                        {post.judul}
                      </Link>
                      
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {post.isi}
                      </p>

                      <div className="flex items-center text-xs text-slate-400 font-bold gap-4 mt-auto">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-yellow-400" />
                          {Number(post.avg_rating) > 0 ? Number(post.avg_rating).toFixed(1) : "New"}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {currentPosts?.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 mt-4">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    {selectedCategory 
                      ? `Belum ada berita untuk kategori "${selectedCategory}".` 
                      : `Berita untuk "${searchTerm}" tidak ditemukan.`}
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12 mb-8 border-t border-slate-100 pt-8">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => {setCurrentPage(prev => prev - 1); window.scrollTo(0, 0);}}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 transition-all font-bold text-sm"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm font-bold text-slate-500 px-4">
                    Halaman {currentPage} / {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => {setCurrentPage(prev => prev + 1); window.scrollTo(0, 0);}}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 transition-all font-bold text-sm"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* === KOLOM KANAN (IKLAN & TERPOPULER - 30%) === */}
        <aside className="w-full lg:w-[30%]">
          <div className="sticky top-24">
            
            <div className="w-full h-[250px] bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-8 rounded-2xl cursor-pointer hover:bg-slate-200 transition-colors">
              <span className="text-[10px] uppercase tracking-widest mb-1">Advertisement</span>
              <span className="font-bold text-sm">Space Iklan 300 x 250</span>
            </div>

            <div className="mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center border-b border-slate-200 pb-4">
                <span className="text-xl mr-2">🔥</span>
                Terpopuler Hari Ini
              </h3>
              
              <div className="flex flex-col gap-6">
                {popularPosts?.map((popPost: any, index: number) => (
                  <a 
                    key={popPost.id} 
                    href={`/post/${popPost.slug}`}
                    className="flex gap-4 group cursor-pointer border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                  >
                    <span className="text-3xl font-black text-orange-200 group-hover:text-orange-600 transition-colors mt-1">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {popPost.judul}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 mt-2 flex items-center bg-white w-max px-2 py-0.5 rounded shadow-sm border border-slate-100">
                        <Eye className="w-3 h-3 mr-1 text-slate-500" /> {popPost.views || 0} Kali Dilihat
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-10 text-center text-slate-400 text-sm font-bold mt-auto">
        &copy; 2026 Berita Digital - D'NEWS Bandar Lampung
      </footer>
    </div>
  )
}