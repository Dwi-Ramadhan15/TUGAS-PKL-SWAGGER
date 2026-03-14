import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ChevronRight, User, Facebook, Twitter, 
  Link as LinkIcon, Star, Send, Calendar, 
  Eye, MessageSquare, Lock, ArrowLeft 
} from 'lucide-react'
import { useDetail } from '../hooks/useDetail' 

export default function Detail() {
  const { pathname } = useLocation()
  
  const {
    navigate,
    post, isLoadingPost,
    comments, isLoadingComments,
    popularPosts,
    isiKomentar, setIsiKomentar,
    rating, setRating,
    showLoginPrompt, setShowLoginPrompt,
    handleKirimKomentar, submitCommentMutation
  } = useDetail()

  // TRIK RAHASIA: Otomatis scroll ke paling atas setiap kali pindah berita
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (isLoadingPost) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white font-bold text-slate-500 animate-pulse">
        Memuat konten berita... ⏳
      </div>
    )
  }

  if (!post) {
    return <div className="text-center py-20 text-xl font-bold">Berita tidak ditemukan!</div>
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans relative">
      
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-orange-600 tracking-tighter">D'NEWS</Link>
          <div className="hidden md:flex gap-6 font-bold text-sm text-slate-700">
            <Link to="/" className="hover:text-orange-600">Home</Link>
            <span className="hover:text-orange-600 cursor-pointer">Nasional</span>
            <span className="hover:text-orange-600 cursor-pointer">Teknologi</span>
            <span className="hover:text-orange-600 cursor-pointer">Pemrograman</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        <aside className="hidden lg:block w-[20%] pr-4 border-r border-slate-200">
          <div className="sticky top-24">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center w-full justify-center text-white bg-orange-400 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-500 transition-all mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </button>
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest mb-4">Kategori Utama</h3>
            <ul className="space-y-3 font-bold text-slate-700 text-sm">
              <li className="flex items-center gap-2 hover:text-orange-600 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> {post.nama_kategori}
              </li>
              <li className="flex items-center gap-2 hover:text-orange-600 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Pemrograman
              </li>
            </ul>
          </div>
        </aside>

        <article className="w-full lg:w-[55%]">
          <div className="flex items-center text-xs text-orange-600 font-bold uppercase mb-5 tracking-wider">
            <Link to="/" className="hover:underline">Home</Link> 
            <ChevronRight className="w-3 h-3 mx-2 text-slate-400"/>
            <span>{post.nama_kategori}</span>
          </div>

          <h1 className="text-3xl md:text-[2.5rem] font-black text-slate-900 leading-[1.2] mb-6">{post.judul}</h1>

          <div className="flex flex-wrap items-center gap-y-2 justify-between border-y border-slate-200 py-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">Tim Redaksi D'NEWS</p>
                <div className="flex items-center text-[11px] text-slate-500 gap-2">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {formatDate(post.create_at)}</span>
                  <span className="flex items-center"><Eye className="w-3 h-3 mr-1"/> {post.views || 0} Kali Dilihat</span>
                  <span className="flex items-center text-yellow-600 font-bold">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {comments && comments.length > 0 
                        ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1) 
                        : "New"
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"><Facebook className="w-4 h-4"/></button>
              <button className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition"><Twitter className="w-4 h-4"/></button>
              <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition"><LinkIcon className="w-4 h-4"/></button>
            </div>
          </div>

          <figure className="mb-8">
            <img src={post.gambar_url} alt={post.judul} className="w-full rounded-2xl object-cover bg-slate-100 shadow-lg" />
          </figure>

          <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-serif whitespace-pre-line mb-16 border-b border-slate-100 pb-10">
            {post.isi}
          </div>

          <section id="diskusi" className="pt-4 mb-20">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-orange-500" />
              Ruang Diskusi ({comments?.length || 0})
            </h3>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 mb-10 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-4">Berikan Rating & Pendapatmu 👇</h4>
              <form onSubmit={handleKirimKomentar} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Rating Artikel Ini:</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-slate-100'}`} 
                      />
                    ))}
                  </div>
                </div>

                <textarea 
                  rows={4} 
                  placeholder="Tulis pendapat atau pertanyaanmu di sini..." 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none bg-white text-sm"
                  value={isiKomentar}
                  onChange={(e) => setIsiKomentar(e.target.value)}
                ></textarea>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={submitCommentMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all flex items-center active:scale-95 disabled:opacity-50"
                  >
                    {submitCommentMutation.isPending ? "Mengirim..." : (
                      <>Kirim Ulasan <Send className="w-4 h-4 ml-2" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {isLoadingComments ? (
                <p className="text-center text-slate-400 italic">Memuat komentar...</p>
              ) : comments?.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm italic">Belum ada ulasan. Jadilah yang pertama!</p>
                </div>
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-slate-800 text-sm">{comment.nama.split('@')[0]}</h5>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-100'}`} />
                        ))}
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {comment.komentar}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </article>

        <aside className="w-full lg:w-[25%]">
          <div className="sticky top-24">
            <div className="w-full h-[250px] bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-8 rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest mb-1">Advertisement</span>
              <span className="font-bold text-sm">Space Iklan 300x250</span>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center">
                <span className="text-xl mr-2">🔥</span>Terpopuler
              </h3>
              
              <div className="flex flex-col gap-5">
                {popularPosts?.map((popPost: any, index: number) => (
                  <Link 
                    key={popPost.id} 
                    to={`/post/${popPost.slug}`} 
                    className="flex gap-4 group cursor-pointer border-b border-slate-200 pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-3xl font-black text-orange-200 group-hover:text-orange-600 transition-colors mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm text-slate-700 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {popPost.judul}
                      </h4>
                      {/* INDIKATOR VIEWS BIAR TERBUKTI DIURUTKAN DARI YANG TERBANYAK */}
                      <span className="text-[11px] font-bold text-slate-400 mt-2 flex items-center">
                        <Eye className="w-3 h-3 mr-1" /> {popPost.views || 0} Kali Dilihat
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </aside>

      </main>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="flex justify-center mb-5">
              <div className="bg-orange-100 p-4 rounded-full text-orange-600">
                <Lock className="w-10 h-10" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Oops, Tunggu Dulu!</h3>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Ingin ikut berdiskusi dan memberikan rating? Anda harus masuk ke akun terlebih dahulu.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md"
              >
                Masuk / Daftar Sekarang
              </button>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition-all"
              >
                Batal, Lanjut Membaca
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}