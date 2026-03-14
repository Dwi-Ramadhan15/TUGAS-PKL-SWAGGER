import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom' 
import api from '../lib/axios'

export interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  slug: string; 
  isi: string; 
  gambar_url: string; 
  create_at: string;
  avg_rating?: string | number; 
  views?: number; 
}

export function useHome() {
  const navigate = useNavigate() 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10; 

  // Untuk buka-tutup sidebar kategori
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const { data: allPostsData, isLoading } = useQuery({
    queryKey: ['all-posts-home'],
    queryFn: async () => {
      const res = await api.get('/posts?limit=100');
      return res.data.data || [];
    }
  })

  const uniqueCategories = Array.from(
    new Set(allPostsData?.map((post: Post) => post.nama_kategori) || [])
  ) as string[];

  let filteredPosts = allPostsData || [];

  if (searchTerm) {
    filteredPosts = filteredPosts.filter((post: Post) =>
      post.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.isi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter((post: Post) => 
      post.nama_kategori === selectedCategory
    );
  }

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const popularPosts = [...(allPostsData || [])].sort((a: any, b: any) => {
    const viewsA = Number(a.views) || 0;
    const viewsB = Number(b.views) || 0;
    return viewsB - viewsA;
  }).slice(0, 5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return {
    navigate,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    uniqueCategories,
    currentPage, setCurrentPage,
    isLoggedIn, handleLogout,
    isLoading, currentPosts, totalPages,
    popularPosts,
    isSidebarOpen, setIsSidebarOpen 
  }
}