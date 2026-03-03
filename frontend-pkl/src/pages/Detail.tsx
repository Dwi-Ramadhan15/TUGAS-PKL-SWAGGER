import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar } from 'lucide-react'
import api from '../lib/axios'

export default function Detail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/posts/slug/${slug}`)).data
  })

  if (isLoading) return <div className="text-center py-20">Memuat konten...</div>

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-600 mb-8 transition-colors bg-orange-400">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
        </button>

        <img src={post.gambar_url} alt={post.judul} className="w-full h-[400px] object-cover rounded-3xl shadow-lg mb-8" />

        <div className="flex gap-3 mb-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {post.nama_kategori}
          </span>
          <span className="flex items-center text-slate-400 text-xs italic">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(post.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{post.judul}</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg whitespace-pre-line">
          {post.isi}
        </div>
      </div>
    </div>
  )
}