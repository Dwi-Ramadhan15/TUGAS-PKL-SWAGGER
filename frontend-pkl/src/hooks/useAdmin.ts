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

// --- CETAKAN DATA (Diekspor biar bisa dipakai di tampilan) ---
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

const postSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi!"),
  nama_kategori: z.string().min(1, "Pilih kategorinya dong!"),
  isi: z.string().min(1, "Isi postingan jangan kosong!"),
})
export type PostForm = z.infer<typeof postSchema>

export function useAdmin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false) 
  const [categoryName, setCategoryName] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 7

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema)
  })

  // Cek Login
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login') 
  }, [navigate])

  // --- GET DATA ---
  const { data: postsResponse, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: async () => (await api.get(`/posts?page=${currentPage}&limit=${postsPerPage}`)).data,
    refetchInterval: 3000, 
    refetchOnWindowFocus: true 
  })

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  })

  const currentPosts = postsResponse?.data || []
  const totalPages = postsResponse?.pagination?.totalPages || 1
  const indexOfFirstPost = (currentPage - 1) * postsPerPage 

  // --- MUTASI POSTINGAN ---
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => await api.post('/posts', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] }) 
      setIsDialogOpen(false) 
      alert("Yeay! Postingan baru berhasil ditambahkan!")
    },
    onError: (error: any) => alert(`Gagal Tambah: ${error.response?.data?.message || "Error"} ❌`)
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number, formData: FormData }) => await api.put(`/posts/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] }) 
      setIsDialogOpen(false) 
      alert("Data Berhasil Diperbarui")
    },
    onError: (error: any) => alert(`Gagal Edit: ${error.response?.data?.message || "Error backend"} ❌`)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      alert("Postingan dihapus! 🗑️")
      if (currentPosts?.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
    }
  })

  const onSubmitPost = (data: PostForm) => {
    const formData = new FormData()
    formData.append('judul', data.judul)
    formData.append('isi', data.isi)
    formData.append('category_id', data.nama_kategori) 

    if (selectedFile) {
      formData.append('gambar', selectedFile)
    } else if (!editingPostId) {
      return alert("Pilih gambarnya dulu dong geh jangan kosonng!")
    }

    if (editingPostId) {
      updateMutation.mutate({ id: editingPostId, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDeletePost = (id: number, judul: string) => {
    if (window.confirm(`Yakin mau menghapus postingan "${judul}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // --- MUTASI KATEGORI ---
  const categoryCreateMutation = useMutation({
    mutationFn: async (nama: string) => await api.post('/categories', { nama_kategori: nama }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setCategoryName("")
      alert("Kategori Baru Berhasil Ditambahkan!")
    },
    onError: (error: any) => alert(`Gagal nambah kategori: ${error.response?.data?.message || "Error"} ❌`)
  })

  const categoryUpdateMutation = useMutation({
    mutationFn: async ({ id, nama }: { id: number, nama: string }) => await api.put(`/categories/${id}`, { nama_kategori: nama }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setCategoryName("")
      setEditingCategoryId(null)
      alert("Kategori berhasil diupdate!")
    },
    onError: (error: any) => alert(`Gagal update kategori: ${error.response?.data?.message || "Error"} ❌`)
  })

  const categoryDeleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      alert("Kategori berhasil dihapus! 🗑️")
    },
    onError: (error: any) => alert(`Gagal hapus kategori! : ${error.response?.data?.message || "Error"} ❌`)
  })

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName) return alert("Nama kategori nggak boleh kosong ya hmmm!")
    if (editingCategoryId) categoryUpdateMutation.mutate({ id: editingCategoryId, nama: categoryName })
    else categoryCreateMutation.mutate(categoryName)
  }

  // --- FUNGSI EXPORT DATA ---
  const fetchAllDataForExport = async () => {
    const res = await api.get('/posts?limit=5000');
    return res.data.data;
  }

  const handleExportExcel = async () => {
    try {
      const allPosts = await fetchAllDataForExport();
      const dataToExport = allPosts.map((post: any, index: number) => ({
        "No": index + 1,
        "Judul Postingan": post.judul,
        "Kategori": post.nama_kategori,
        "Total Komentar": post.total_comments || 0,
        "Sudah Dibaca": post.read_comments || 0,
        "Belum Dibaca (Baru)": post.comment_count || 0,
        "Tanggal Dibuat": new Date(post.create_at).toLocaleDateString('id-ID')
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Postingan");
      XLSX.writeFile(wb, "Laporan_Postingan_DNEWS.xlsx");
    } catch (error) {
      alert("Gagal mengunduh Excel!");
    }
  }

  const handleExportCSV = async () => {
    try {
      const allPosts = await fetchAllDataForExport();
      const dataToExport = allPosts.map((post: any, index: number) => ({
        "No": index + 1,
        "Judul Postingan": post.judul,
        "Kategori": post.nama_kategori,
        "Total Komentar": post.total_comments || 0,
        "Sudah Dibaca": post.read_comments || 0,
        "Belum Dibaca (Baru)": post.comment_count || 0,
        "Tanggal Dibuat": new Date(post.create_at).toLocaleDateString('id-ID')
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "Laporan_Postingan_DNEWS.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Gagal mengunduh CSV!");
    }
  }

  const handleExportPDF = async () => {
    try {
      const allPosts = await fetchAllDataForExport();
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Laporan Data Postingan D'NEWS", 14, 15);
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
      
      const tableColumn = ["No", "Judul", "Kategori", "Total Komentar", "Terbaca", "Belum Dibaca", "Tanggal"];
      const tableRows: any[] = [];

      allPosts.forEach((post: any, index: number) => {
        const postData = [
          index + 1,
          post.judul,
          post.nama_kategori,
          post.total_comments || 0,
          post.read_comments || 0,
          post.comment_count || 0, 
          new Date(post.create_at).toLocaleDateString('id-ID')
        ];
        tableRows.push(postData);
      });

      autoTable(doc, { 
        head: [tableColumn], 
        body: tableRows, 
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12] },
        styles: { fontSize: 8 }, 
        columnStyles: { 
          0: { cellWidth: 10 }, 
          3: { halign: 'center' }, 
          4: { halign: 'center' }, 
          5: { halign: 'center' } 
        }
      });
      
      doc.save("Laporan_Postingan_DNEWS.pdf");
    } catch (error) {
      alert("Gagal mengunduh PDF!");
    }
  }

  // Lempar semua state dan fungsi ke komponen tampilan
  return {
    navigate, queryClient,
    isDialogOpen, setIsDialogOpen,
    selectedFile, setSelectedFile,
    editingPostId, setEditingPostId,
    isCategoryDialogOpen, setIsCategoryDialogOpen,
    categoryName, setCategoryName,
    editingCategoryId, setEditingCategoryId,
    currentPage, setCurrentPage,
    currentPosts, totalPages, indexOfFirstPost,
    categories, isLoadingPosts,
    register, handleSubmit, errors, isSubmitting, reset, setValue,
    onSubmitPost, handleDeletePost, handleCategorySubmit,
    handleExportExcel, handleExportCSV, handleExportPDF,
    categoryCreateMutation, categoryDeleteMutation, updateMutation
  }
}