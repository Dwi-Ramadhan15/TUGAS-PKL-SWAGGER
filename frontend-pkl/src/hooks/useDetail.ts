import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

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

  // AMBIL DATA TERPOPULER BERDASARKAN VIEWS (DARI TERBESAR KE TERKECIL)
  const { data: popularPosts } = useQuery({
    queryKey: ['popular-posts'],
    queryFn: async () => {
      const res = await api.get('/posts?limit=100')
      const allPosts = res.data.data || []
      
      return allPosts.sort((a: any, b: any) => {
        const viewsA = Number(a.views) || 0;
        const viewsB = Number(b.views) || 0;
        return viewsB - viewsA; // Urutkan descending (terbanyak di atas)
      }).slice(0, 5) // Ambil 5 teratas
    }
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

  return {
    navigate,
    post, isLoadingPost,
    comments, isLoadingComments,
    popularPosts,
    isiKomentar, setIsiKomentar,
    rating, setRating,
    showLoginPrompt, setShowLoginPrompt,
    handleKirimKomentar, submitCommentMutation
  }
}