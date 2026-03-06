import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, Plus, Edit, Trash2, Tags, MessageSquare } from 'lucide-react'
import api from '../lib/axios'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// --- CETAKAN DATA ---
interface Post {
  id: number;
  judul: string;
  nama_kategori: string;
  category_id?: string | number; 
  isi: string; 
  gambar_url: string; 
  create_at: string;
  comment_count?: number; 
}

interface Category {
  id: number;
  nama_kategori: string; 
}

// Tambahan cetakan data untuk Komentar
interface Comment {
  id: number;
  nama: string;
  komentar: string;
  created_at: string;
}

const postSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi!"),
  nama_kategori: z.string().min(1, "Pilih kategorinya dong!"),
  isi: z.string().min(1, "Isi postingan jangan kosong!"),
})
type PostForm = z.infer<typeof postSchema>

export default function Admin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false) 
  const [categoryName, setCategoryName] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)

  // STATE UNTUK PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 7

  // --- STATE UNTUK FITUR KOMENTAR ---
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedPostForComment, setSelectedPostForComment] = useState<{id: number, judul: string} | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema)
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login') 
  }, [navigate])

  // --- GET DATA ---
  const { data: postsResponse, isLoading } = useQuery({
  queryKey: ['posts', currentPage],
  queryFn: async () => (await api.get(`/posts?page=${currentPage}&limit=${postsPerPage}`)).data,
  refetchInterval: 3000, 
  refetchOnWindowFocus: true 
})

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  })

  // GET DATA KOMENTAR 
  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['admin-comments', selectedPostForComment?.id],
    queryFn: async () => {
      // PERHATIKAN INI: ADA TAMBAHAN ?source=admin
      const res = await api.get(`/posts/${selectedPostForComment?.id}/comments?source=admin`)
      return res.data.data 
    },
    enabled: !!selectedPostForComment?.id 
  })

  const currentPosts = postsResponse?.data || []
  const totalPages = postsResponse?.pagination?.totalPages || 1
  const indexOfFirstPost = (currentPage - 1) * postsPerPage 

  //         MUTASI POSTINGAN 
  
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
      alert("Data Berhasil Diprbarui")
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

  // MUTASI HAPUS KOMENTAR
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => await api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments', selectedPostForComment?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] }) 
      alert("Komentar berhasil dihapus! 🧹")
    },
    onError: (error: any) => alert(`Gagal hapus komentar: ${error.response?.data?.message || "Error"} ❌`)
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

  //         MUTASI KATEGORI

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

  const handleDeletePost = (id: number, judul: string) => {
    if (window.confirm(`Yakin mau menghapus postingan "${judul}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin 🛠️</h1>
          <div className="flex gap-3">

            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => navigate('/')}>
              <LogOut className="w-4 h-4 mr-2" /> Lihat Beranda
            </Button>
            
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsCategoryDialogOpen(true)}>
              <Tags className="w-4 h-4 mr-2" /> Kelola Kategori
            </Button>

            <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
              setIsCategoryDialogOpen(open)
              if (!open) { setCategoryName(""); setEditingCategoryId(null); }
            }}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-800">Manajemen Kategori 🏷️</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="flex gap-2 mt-4">
                <input 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="Ketik nama kategori..."/>
                <Button 
                  type="submit" 
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={categoryCreateMutation.isPending}>
                  {editingCategoryId ? "Update" : "Simpan"}
                </Button>
              </form>
                <div className="mt-4 max-h-[300px] overflow-y-auto border rounded-lg">
                  <Table>
                    <TableBody>
                      {categories?.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.nama_kategori}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => { setCategoryName(cat.nama_kategori); setEditingCategoryId(cat.id); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => { if(window.confirm('Hapus kategori ini?')) categoryDeleteMutation.mutate(cat.id) }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { reset(); setSelectedFile(null); setEditingPostId(null); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Postingan
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-slate-800">{editingPostId ? "Edit Postingan ✏️" : "Buat Postingan Baru"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4 mt-4">
                  <div>
                    <input {...register("judul")} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Judul" />
                    {errors.judul && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.judul.message}</p>}
                  </div>
                  
                  <div>
                    <select {...register("nama_kategori")} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                      <option value="">-- Pilih Kategori --</option>
                      {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
                    </select>
                    {errors.nama_kategori && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.nama_kategori.message}</p>}
                  </div>
                  
                  <div>
                    <textarea {...register("isi")} rows={4} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Isi Konten" />
                    {errors.isi && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.isi.message}</p>}
                  </div>

                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded-lg mt-1" />
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || updateMutation.isPending}>
                    {editingPostId ? "Simpan Perubahan" : "Simpan Postingan"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="destructive" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>
        </div>

        <div className="border rounded-xl flex flex-col bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Judul Postingan</TableHead>
                  <TableHead className="w-[250px]">Isi Konten</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPosts?.map((post: Post, index: number) => (
                    <TableRow key={post.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-center font-medium text-slate-500">{indexOfFirstPost + index + 1}</TableCell>
                      <TableCell>
                        {post.gambar_url ? (
                          <img src={post.gambar_url} alt="thumbnail" className="w-14 h-14 object-cover rounded-lg border shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500">No Img</div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">{post.judul}</TableCell>
                      <TableCell><p className="line-clamp-2 text-xs text-slate-500">{post.isi}</p></TableCell>
                      <TableCell><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">{post.nama_kategori}</span></TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          
                          {/* TOMBOL KELOLA KOMENTAR DENGAN NOTIFIKASI JUMLAH */}
                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              title="Kelola Komentar"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => {
                                // PERHATIKAN INI: FUNGSI ONCLICK DIUBAH!
                                navigate(`/admin/comments/${post.id}`);
                                setTimeout(() => queryClient.invalidateQueries({ queryKey: ['posts'] }), 500);
                              }} 
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {post.comment_count !== undefined && Number(post.comment_count) > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                                {post.comment_count}
                              </span>
                            )}
                          </div>

                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => {
                              reset(); 
                              setEditingPostId(post.id); 
                              setValue("judul", post.judul); 
                              setValue("isi", post.isi);
                              setValue("nama_kategori", post.category_id ? post.category_id.toString() : ""); 
                              setSelectedFile(null); 
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeletePost(post.id, post.judul)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50 border-t">
              <Button 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="text-slate-600"
              >
                Sebelumnya
              </Button>
              <span className="text-sm font-bold text-slate-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="text-slate-600"
              >
                Selanjutnya
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}