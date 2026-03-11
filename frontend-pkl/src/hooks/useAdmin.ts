import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../lib/axios'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// CETAKAN DATA
export interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  category_id?: string | number; 
  isi: string; 
  gambar_url: string; 
  create_at: string;
  comment_count?: number; 
  total_comments?: number;
  read_comments?: number;
}

export interface Category {
  id: number;
  nama_kategori: string; 
}

export interface User {
  id: number;
  nama: string;
  email: string;
  no_wa?: string;
  role: string;
  is_blocked?: boolean; 
}

// Tambahan Cetakan Notifikasi
export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const postSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi!"),
  nama_kategori: z.string().min(1, "Pilih kategorinya dong!"),
  isi: z.string().min(1, "Isi postingan jangan kosong!"),
})
export type PostForm = z.infer<typeof postSchema>

export function useAdmin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'users'>('posts')

  // State untuk Notifikasi & Filter Grafik
  const [showNotif, setShowNotif] = useState(false)
  const [chartFilter, setChartFilter] = useState('semua')
  const [sortOrder, setSortOrder] = useState<'terbanyak' | 'tersedikit'>('terbanyak')

  // STATE BARU UNTUK FITUR PENCARIAN
  const [searchPost, setSearchPost] = useState("")
  const [searchUser, setSearchUser] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false) 
  const [categoryName, setCategoryName] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 8

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema)
  })

  // Cek Login
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login') 
  }, [navigate])

  // Reset halaman ke 1 kalau lagi nyari berita biar nggak nyangkut di halaman kosong
  useEffect(() => {
    setCurrentPage(1)
  }, [searchPost])

  // GET DATA (Ditambah parameter search untuk postingan)
  const { data: postsResponse, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts', currentPage, searchPost],
    queryFn: async () => (await api.get(`/posts?page=${currentPage}&limit=${postsPerPage}&search=${searchPost}`)).data,
    refetchInterval: 3000, 
    refetchOnWindowFocus: true 
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  })

  const { data: usersData, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    }
  })

  // Filter Data Pengguna secara langsung di frontend
  const filteredUsers = usersData?.filter(user => 
    (user.nama?.toLowerCase() || '').includes(searchUser.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchUser.toLowerCase())
  ) || []

  // Get Data Grafik (Analytics) - UNTUK TAMPILAN GRAFIK DI LAYAR
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', chartFilter, sortOrder],
    queryFn: async () => (await api.get(`/analytics?filter=${chartFilter}&sort=${sortOrder}`)).data.data
  })

  // Get Data Notifikasi
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.data,
    refetchInterval: 10000 
  })

  const markNotifReadMutation = useMutation({
    mutationFn: async () => await api.patch('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const currentPosts = postsResponse?.data || []
  const totalPages = postsResponse?.pagination?.totalPages || 1
  const indexOfFirstPost = (currentPage - 1) * postsPerPage 

  // MUTASI POSTINGAN
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => await api.post('/posts', formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['posts'] }); setIsDialogOpen(false); alert("Postingan baru berhasil ditambahkan!") },
    onError: (error: any) => alert(`Gagal Tambah: ${error.response?.data?.message || "Error"} ❌`)
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number, formData: FormData }) => await api.put(`/posts/${id}`, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['posts'] }); setIsDialogOpen(false); alert("Data Berhasil Diperbarui") },
    onError: (error: any) => alert(`Gagal Edit: ${error.response?.data?.message || "Error backend"} ❌`)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      alert("Postingan dihapus! 🗑️")
      if (currentPosts?.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1)
    }
  })

  const onSubmitPost = (data: PostForm) => {
    const formData = new FormData()
    formData.append('judul', data.judul)
    formData.append('isi', data.isi)
    formData.append('category_id', data.nama_kategori) 
    if (selectedFile) formData.append('gambar', selectedFile)
    else if (!editingPostId) return alert("Pilih gambarnya dulu dong geh jangan kosonng!")

    if (editingPostId) updateMutation.mutate({ id: editingPostId, formData })
    else createMutation.mutate(formData)
  }

  const handleDeletePost = (id: number, judul: string) => {
    if (window.confirm(`Yakin mau menghapus postingan "${judul}"?`)) deleteMutation.mutate(id)
  }

  // MUTASI KATEGORI 
  const categoryCreateMutation = useMutation({
    mutationFn: async (nama: string) => await api.post('/categories', { nama_kategori: nama }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setCategoryName(""); alert("Kategori Baru Berhasil Ditambahkan!") }
  })

  const categoryUpdateMutation = useMutation({
    mutationFn: async ({ id, nama }: { id: number, nama: string }) => await api.put(`/categories/${id}`, { nama_kategori: nama }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setCategoryName(""); setEditingCategoryId(null); alert("Kategori berhasil diupdate!") }
  })

  const categoryDeleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); alert("Kategori berhasil dihapus! 🗑️") }
  })

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName) return alert("Nama kategori nggak boleh kosong ya hmmm!")
    if (editingCategoryId) categoryUpdateMutation.mutate({ id: editingCategoryId, nama: categoryName })
    else categoryCreateMutation.mutate(categoryName)
  }

  // FUNGSI EXPORT DATA POSTINGAN 
  const fetchAllDataForExport = async () => { const res = await api.get('/posts?limit=5000'); return res.data.data; }

  const handleExportExcel = async () => {
    try {
      const allPosts = await fetchAllDataForExport();
      const dataToExport = allPosts.map((post: any, index: number) => ({ "No": index + 1, "Judul Postingan": post.judul, "Kategori": post.nama_kategori, "Total Komentar": post.total_comments || 0, "Sudah Dibaca": post.read_comments || 0, "Belum Dibaca (Baru)": post.comment_count || 0, "Tanggal Dibuat": new Date(post.create_at).toLocaleDateString('id-ID') }));
      const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data Postingan"); XLSX.writeFile(wb, "Laporan_Postingan_DNEWS.xlsx");
    } catch (error) { alert("Gagal mengunduh Excel!"); }
  }

  const handleExportCSV = async () => {
    try {
      const allPosts = await fetchAllDataForExport();
      const dataToExport = allPosts.map((post: any, index: number) => ({ "No": index + 1, "Judul Postingan": post.judul, "Kategori": post.nama_kategori, "Total Komentar": post.total_comments || 0, "Sudah Dibaca": post.read_comments || 0, "Belum Dibaca (Baru)": post.comment_count || 0, "Tanggal Dibuat": new Date(post.create_at).toLocaleDateString('id-ID') }));
      const ws = XLSX.utils.json_to_sheet(dataToExport); const csv = XLSX.utils.sheet_to_csv(ws); const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.setAttribute("download", "Laporan_Postingan_DNEWS.csv"); document.body.appendChild(link); link.click();
    } catch (error) { alert("Gagal mengunduh CSV!"); }
  }

  const handleExportPDF = async () => {
    try {
      const allPosts = await fetchAllDataForExport(); const doc = new jsPDF();
      doc.setFontSize(16); doc.text("Laporan Data Postingan D'NEWS", 14, 15); doc.setFontSize(10); doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
      const tableColumn = ["No", "Judul", "Kategori", "Total Komentar", "Terbaca", "Belum Dibaca", "Tanggal"]; const tableRows: any[] = [];
      allPosts.forEach((post: any, index: number) => { tableRows.push([index + 1, post.judul, post.nama_kategori, post.total_comments || 0, post.read_comments || 0, post.comment_count || 0, new Date(post.create_at).toLocaleDateString('id-ID')]); });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 28, theme: 'grid', headStyles: { fillColor: [234, 88, 12] }, styles: { fontSize: 8 }}); doc.save("Laporan_Postingan_DNEWS.pdf");
    } catch (error) { alert("Gagal mengunduh PDF!"); }
  }

  // FUNGSI EXPORT DATA PENGGUNA
  const handleExportUsersExcel = () => {
    if (!usersData || usersData.length === 0) return alert("Tidak ada data pengguna untuk diexport!");
    const dataToExport = usersData.map((user, index) => ({ "No": index + 1, "Nama Pengguna": user.nama || "Tanpa Nama", "Email": user.email, "No. Handphone": user.no_wa || "-", "Peran": user.role.toUpperCase() }));
    const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data Pengguna"); XLSX.writeFile(wb, "Daftar_Pengguna_DNEWS.xlsx");
  }

  const handleExportUsersCSV = () => {
    if (!usersData || usersData.length === 0) return alert("Tidak ada data pengguna untuk diexport!");
    const dataToExport = usersData.map((user, index) => ({ "No": index + 1, "Nama Pengguna": user.nama || "Tanpa Nama", "Email": user.email, "No. Handphone": user.no_wa || "-", "Peran": user.role.toUpperCase() }));
    const ws = XLSX.utils.json_to_sheet(dataToExport); const csv = XLSX.utils.sheet_to_csv(ws); const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.setAttribute("download", "Daftar_Pengguna_DNEWS.csv"); document.body.appendChild(link); link.click();
  }

  const handleExportUsersPDF = () => {
    if (!usersData || usersData.length === 0) return alert("Tidak ada data pengguna untuk diexport!");
    const doc = new jsPDF(); doc.setFontSize(16); doc.text("Daftar Pengguna D'NEWS", 14, 15); doc.setFontSize(10); doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    const tableColumn = ["No", "Nama Pengguna", "Email", "No. Handphone", "Peran"]; const tableRows: any[] = [];
    usersData.forEach((user, index) => { tableRows.push([index + 1, user.nama || "Tanpa Nama", user.email, user.no_wa || "-", user.role.toUpperCase()]); });
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 28, theme: 'grid', headStyles: { fillColor: [234, 88, 12] } }); doc.save("Daftar_Pengguna_DNEWS.pdf");
  }

  // TARIK SEMUA DATA STATISTIK KHUSUS UNTUK EXPORT 
  const fetchAllAnalyticsForExport = async () => {
    const res = await api.get(`/analytics?filter=${chartFilter}&sort=${sortOrder}&limit=all`);
    return res.data.data;
  }

  const handleExportAnalyticsExcel = async () => {
    try {
      const allData = await fetchAllAnalyticsForExport();
      if (!allData || allData.length === 0) return alert("Tidak ada data statistik untuk diexport!");
      const dataToExport = allData.map((item: any, index: number) => ({ "No": index + 1, "Judul Berita": item.name, "Total Kunjungan": item.views }));
      const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Statistik"); XLSX.writeFile(wb, `Statistik_DNEWS_${chartFilter}.xlsx`);
    } catch (error) { alert("Gagal mengunduh Excel!"); }
  }

  const handleExportAnalyticsCSV = async () => {
    try {
      const allData = await fetchAllAnalyticsForExport();
      if (!allData || allData.length === 0) return alert("Tidak ada data statistik untuk diexport!");
      const dataToExport = allData.map((item: any, index: number) => ({ "No": index + 1, "Judul Berita": item.name, "Total Kunjungan": item.views }));
      const ws = XLSX.utils.json_to_sheet(dataToExport); const csv = XLSX.utils.sheet_to_csv(ws); const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.setAttribute("download", `Statistik_DNEWS_${chartFilter}.csv`); link.click();
    } catch (error) { alert("Gagal mengunduh CSV!"); }
  }

  const handleExportAnalyticsPDF = async () => {
    try {
      const allData = await fetchAllAnalyticsForExport();
      if (!allData || allData.length === 0) return alert("Tidak ada data statistik untuk diexport!");
      const doc = new jsPDF(); doc.setFontSize(16); doc.text(`Laporan Statistik D'NEWS (Filter: ${chartFilter})`, 14, 15); doc.setFontSize(10); doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
      const tableColumn = ["No", "Judul Berita", "Total Kunjungan"]; const tableRows: any[] = [];
      allData.forEach((item: any, index: number) => { tableRows.push([index + 1, item.name, item.views]); });
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 28, theme: 'grid', headStyles: { fillColor: [234, 88, 12] } }); doc.save(`Statistik_DNEWS_${chartFilter}.pdf`);
    } catch (error) { alert("Gagal mengunduh PDF!"); }
  }

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); alert("Pengguna berhasil dihapus permanen! 🗑️") },
    onError: (error: any) => alert(`Gagal hapus: ${error.response?.data?.message || "Mungkin user ini sudah punya komentar, hapus komentarnya dulu."} ❌`)
  })

  const blockUserMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: number, is_blocked: boolean }) => await api.patch(`/users/${id}/block`, { is_blocked }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
    onError: (error: any) => alert(`Gagal ubah status blokir: ${error.response?.data?.message || "Error"} ❌`)
  })

  const handleDeleteUser = (id: number, nama: string) => {
    if (window.confirm(`PERINGATAN! Yakin mau menghapus permanen pengguna "${nama}"?`)) deleteUserMutation.mutate(id)
  }

  const handleToggleBlock = (id: number, is_blocked: boolean, nama: string) => {
    if (window.confirm(`Yakin mau ${is_blocked ? 'Memblokir' : 'Membuka Blokir'} pengguna "${nama}"?`)) {
      blockUserMutation.mutate({ id, is_blocked })
    }
  }

  return {
    navigate, queryClient,
    activeTab, setActiveTab,
    isDialogOpen, setIsDialogOpen,
    selectedFile, setSelectedFile,
    editingPostId, setEditingPostId,
    isCategoryDialogOpen, setIsCategoryDialogOpen,
    categoryName, setCategoryName,
    editingCategoryId, setEditingCategoryId,
    currentPage, setCurrentPage,
    currentPosts, totalPages, indexOfFirstPost,
    categories, isLoadingPosts,
    usersData, isLoadingUsers, 
    showNotif, setShowNotif, chartFilter, setChartFilter, sortOrder, setSortOrder, analyticsData, notifications, markNotifReadMutation,
    searchPost, setSearchPost, searchUser, setSearchUser, filteredUsers, // State Pencarian Diexport
    register, handleSubmit, errors, isSubmitting, reset, setValue,
    onSubmitPost, handleDeletePost, handleCategorySubmit,
    handleExportExcel, handleExportCSV, handleExportPDF,
    handleExportUsersExcel, handleExportUsersCSV, handleExportUsersPDF,
    handleExportAnalyticsExcel, handleExportAnalyticsCSV, handleExportAnalyticsPDF, 
    handleDeleteUser, handleToggleBlock,
    categoryCreateMutation, categoryDeleteMutation, updateMutation
  }
}