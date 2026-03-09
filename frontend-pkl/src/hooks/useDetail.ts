import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

// Cetakan data komentar kita ekspor agar bisa dibaca oleh halaman UI
export interface Comment {
  id: number;
  nama: string; 
  komentar: string;
  rating: number;
  created_at: string;
}

export function useDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State untuk form komentar dan pop-up
  const [isiKomentar, setIsiKomentar] = useState("")
  const [rating, setRating] = useState(5) 
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const isLoggedIn = !!localStorage.getItem('token')

  // Fetching data artikel
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/posts/slug/${slug}`)).data
  })

  // Fetching data komentar
  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const res = await api.get(`/posts/${post?.id}/comments`)
      return res.data.data 
    },
    enabled: !!post?.id 
  })

  // Mutasi untuk mengirim komentar
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

  // Fungsi ketika tombol kirim diklik
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

  // Mengembalikan (melempar) semua data dan fungsi ke komponen tampilan
  return {
    navigate,
    post, isLoadingPost,
    comments, isLoadingComments,
    isiKomentar, setIsiKomentar,
    rating, setRating,
    showLoginPrompt, setShowLoginPrompt,
    handleKirimKomentar, submitCommentMutation
  }
}