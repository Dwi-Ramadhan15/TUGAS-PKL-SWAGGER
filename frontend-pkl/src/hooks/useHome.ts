import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom' 
import api from '../lib/axios'

// Cetakan data Post kita ekspor agar bisa dipakai di halaman UI
export interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  slug: string; 
  isi: string; 
  gambar_url: string; 
  create_at: string;
  avg_rating?: string | number; 
  views?: number; // Tambahan views
}

export function useHome() {
  const navigate = useNavigate() 
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; 

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.reload(); 
    }
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['public-posts', currentPage, searchTerm],
    queryFn: async () => (await api.get(`/posts?page=${currentPage}&limit=${postsPerPage}&search=${searchTerm}`)).data
  })

  // Reset ke halaman 1 jika user mencari berita
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const currentPosts = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  // Lempar semua data dan fungsi ke komponen tampilan
  return {
    navigate,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    isLoggedIn, handleLogout,
    isLoading, currentPosts, totalPages
  }
}