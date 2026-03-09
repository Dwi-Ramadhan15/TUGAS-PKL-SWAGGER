import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, MessageSquare, Send, User, Star, Lock, Eye } from 'lucide-react'
import api from '../lib/axios'

interface Comment {
  id: number;
  nama: string; 
  komentar: string;
  rating: number;
  created_at: string;
}

export default function Detail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isiKomentar, setIsiKomentar] = useState("")
  const [rating, setRating] = useState(5) 
  
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const isLoggedIn = !!localStorage.getItem('token')

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/posts/slug/${slug}`)).data
  })

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const res = await api.get(`/posts/${post?.id}/comments`)
      return res.data.data 
    },
    enabled: !!post?.id 
  })

  const submitCommentMutation = useMutation({
    mutationFn: async (newComment: { komentar: string, rating: number }) => {
      return await api.post(`/posts/${post?.id}/comments`, newComment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] })
      queryClient.invalidateQueries({ queryKey: ['public-posts'] }) 
      setIsiKomentar("")
      setRating(5)
      alert("Terimakasih Atas Ulasan Anda!")
    },
    onError: (error: any) => {
      alert(`Gagal mengirim komentar: ${error.response?.data?.message || "Error server"}`)
    }
  })

  const handleKirimKomentar = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    if (!isiKomentar.trim()) {
      return alert("Isi komentar nggak boleh kosong ya!")
    }
    submitCommentMutation.mutate({ komentar: isiKomentar, rating })
  }

  if (isLoadingPost) return <div className="text-center py-20 font-bold text-slate-500 animate-pulse">Memuat konten berita... ⏳</div>

  return (
    <div className="min-h-screen bg-white relative">
      <div className="max-w-4xl mx-auto p-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-600 mb-8 transition-colors bg-orange-400 px-4 py-2 rounded-lg text-white font-medium shadow-sm hover:bg-orange-500">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
        </button>

        <img src={post.gambar_url} alt={post.judul} className="w-full h-[400px] object-cover rounded-3xl shadow-lg mb-8" />

        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {post.nama_kategori}
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
            {comments && comments.length > 0 
                ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1) 
                : "New"
            }
          </span>
          {/* IKON BERAPA KALI DILIHAT DI SINI */}
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center shadow-sm">
            <Eye className="w-3 h-3 mr-1 text-slate-500" />
            {post.views || 0} Kali Dilihat
          </span>
          <span className="flex items-center text-slate-400 text-xs italic">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(post.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{post.judul}</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg whitespace-pre-line mb-16">
          {post.isi}
        </div>
        
        <div className="border-t-2 border-slate-100 pt-10 pb-20">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-orange-500" />
            Ruang Diskusi ({comments?.length || 0})
          </h3>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-10 shadow-sm relative overflow-hidden">
            <h4 className="font-bold text-slate-700 mb-4">Berikan Rating & Pendapatmu 👇</h4>
            <form onSubmit={handleKirimKomentar} className="space-y-4">
              
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

              <div>
                <textarea 
                  rows={4} 
                  placeholder="Tulis pendapat atau pertanyaanmu di sini..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none bg-white"
                  value={isiKomentar}
                  onChange={(e) => setIsiKomentar(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitCommentMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center"
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
                <p className="text-slate-500">Belum ada komentar. Jadilah yang pertama memberikan ulasan!</p>
              </div>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-slate-800">{comment.nama.split('@')[0]}</h5>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mb-2">
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

        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            
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
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
              >
                Masuk / Daftar Sekarang
              </button>
              
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-all"
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