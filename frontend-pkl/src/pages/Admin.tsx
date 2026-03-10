import { LogOut, Plus, Edit, Trash2, Tags, MessageSquare, FileText, Table as TableIcon, Download, Users, FileStack, ShieldAlert, User as UserIcon, Ban, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useAdmin } from '../hooks/useAdmin'

export default function Admin() {
  const {
    navigate, queryClient,
    isDialogOpen, setIsDialogOpen,
    setSelectedFile,
    editingPostId, setEditingPostId,
    isCategoryDialogOpen, setIsCategoryDialogOpen,
    categoryName, setCategoryName,
    editingCategoryId, setEditingCategoryId,
    currentPage, setCurrentPage,
    currentPosts, totalPages, indexOfFirstPost,
    categories,
    usersData, isLoadingUsers,
    register, handleSubmit, errors, isSubmitting, reset, setValue,
    onSubmitPost, handleDeletePost, handleCategorySubmit,
    handleExportExcel, handleExportCSV, handleExportPDF,
    handleExportUsersExcel, handleExportUsersCSV, handleExportUsersPDF,
    handleDeleteUser, handleToggleBlock,
    categoryCreateMutation, categoryDeleteMutation, updateMutation,
    activeTab, setActiveTab 
  } = useAdmin()

  return (
    <div className="min-h-screen bg-slate-50 flex bg-orange-200">
      
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-orange-300 border-r border-slate-200 flex flex-col shadow-sm fixed h-full z-20">
        <div className="p-6 border-b border-slate-100 flex items-center justify-center">
           <h1 className="text-2xl font-black text-orange-600 tracking-tight">D'NEWS ADMIN</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Menu Utama</p>
          
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'posts' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileStack className="w-5 h-5" />
            Kelola Blog
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'users' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-5 h-5" />
            Daftar Pengguna
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all mb-2"
          >
            Lihat Beranda
          </button>
          <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA KANAN */}
      <main className="flex-1 ml-64 p-8">
        
        {/* KONTEN TAB: KELOLA BERITA */}
        {activeTab === 'posts' && (
          <div className="w-full bg-orange-300 p-6 rounded-2xl shadow-sm border border-slate-200">
             {/* Header Tab */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
                 <h2 className="text-2xl font-bold text-white ">MANAJEMEN KONTEN </h2>
                 <div className="flex gap-3">
                   <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setIsCategoryDialogOpen(true)}>
                     <Tags className="w-4 h-4 mr-2" /> Kategori
                   </Button>
                   <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => { reset(); setSelectedFile(null); setEditingPostId(null); setIsDialogOpen(true); }}>
                     <Plus className="w-4 h-4 mr-2" /> Berita Baru
                   </Button>
                 </div>
               </div>

            {/* TOMBOL EXPORT */}
            <div className="flex justify-end gap-2 mb-4">
              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 bg-white shadow-sm" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-white shadow-sm" onClick={handleExportExcel}>
                <TableIcon className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-white shadow-sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
            </div>

            {/* TABEL BERITA */}
            <div className="border rounded-xl flex flex-col bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-orange-500">
                    <TableRow className="text-white">
                      <TableHead className="w-[50px] text-center text-white font-bold">No</TableHead>
                      <TableHead className="text-white text-center font-bold">Gambar</TableHead>
                      <TableHead className="text-white text-center font-bold">Judul</TableHead>
                      <TableHead className="text-white text-center font-bold w-[250px]">Isi Konten</TableHead>
                      <TableHead className="text-white text-center font-bold">Kategori</TableHead>
                      <TableHead className="text-center text-white font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPosts?.map((post: any, index: number) => (
                        <TableRow key={post.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="text-center font-medium text-slate-500">{indexOfFirstPost + index + 1}</TableCell>
                          <TableCell className="content-center text-center">
                            {post.gambar_url ? (
                              <img src={post.gambar_url} alt="thumbnail" className="w-12 h-12 object-cover rounded-lg border shadow-sm mx-auto" />
                            ) : (
                              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500 mx-auto">No Img</div>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-slate-800">{post.judul}</TableCell>
                          <TableCell>
                            <p className="line-clamp-2 text-xs text-slate-500">{post.isi}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{post.nama_kategori}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <div className="relative">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Kelola Komentar"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                  onClick={async () => {
                                    navigate(`/admin/comments/${post.id}`);
                                  }} 
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                {post.comment_count !== undefined && Number(post.comment_count) > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {post.comment_count}
                                  </span>
                                )}
                              </div>

                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => {
                                  reset(); setEditingPostId(post.id); setValue("judul", post.judul); setValue("isi", post.isi); setValue("nama_kategori", post.category_id ? post.category_id.toString() : ""); setSelectedFile(null); setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 bg-slate-50 border-t">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="text-slate-600">Sebelumnya</Button>
                  <span className="text-sm font-bold text-slate-600">Hal {currentPage} dari {totalPages}</span>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="text-slate-600">Selanjutnya</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KONTEN TAB: DAFTAR PENGGUNA */}
        {activeTab === 'users' && (
          <div className="w-full bg-orange-300 p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="text-2xl font-bold text-white">DAFTAR PENGGUNA</h2>
             </div>
             
             {/* TOMBOL EXPORT PENGGUNA */}
             <div className="flex justify-end gap-2 mb-4">
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 bg-white shadow-sm" onClick={handleExportUsersPDF}>
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-white shadow-sm" onClick={handleExportUsersExcel}>
                  <TableIcon className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-white shadow-sm" onClick={handleExportUsersCSV}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
             </div>

             <div className="border rounded-xl flex flex-col bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-orange-500">
                    <TableRow>
                      <TableHead className="w-[50px] text-center text-white font-bold">No</TableHead>
                      <TableHead className="text-white font-bold">Nama Pengguna</TableHead>
                      <TableHead className="text-white font-bold">Email</TableHead>
                      <TableHead className="text-center text-white font-bold">No. Handphone</TableHead>
                      <TableHead className="text-center text-white font-bold">Peran (Role)</TableHead>
                      <TableHead className="text-center text-white font-bold">Aksi</TableHead> 
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-slate-500">Memuat data pengguna...</TableCell>
                       </TableRow>
                    ) : usersData?.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-slate-500 italic">Belum ada pengguna terdaftar.</TableCell>
                       </TableRow>
                    ) : (
                      usersData?.map((user, index) => (
                        // CLASS MERAH JIKA DIBLOKIR
                        <TableRow key={user.id} className={`hover:bg-slate-50 transition-colors ${user.is_blocked ? 'bg-red-50/50 opacity-75' : ''}`}>
                          <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                          <TableCell className="font-semibold text-slate-800 flex items-center gap-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.is_blocked ? 'bg-red-100' : 'bg-orange-100'}`}>
                               <UserIcon className={`w-4 h-4 ${user.is_blocked ? 'text-red-600' : 'text-orange-600'}`} />
                             </div>
                             {user.nama || 'Tanpa Nama'}
                             {/* TAMPILKAN STATUS DIBLOKIR */}
                             {user.is_blocked && <span className="text-[10px] text-red-500 font-bold ml-2">(Diblokir)</span>}
                          </TableCell>
                          
                          <TableCell className={`text-slate-600 ${user.is_blocked ? 'line-through' : ''}`}>{user.email}</TableCell>
                          
                          <TableCell className="text-center font-medium text-slate-600">
                            {user.no_wa ? (
                              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-[11px] font-bold border border-green-200">
                                {user.no_wa}
                              </span>
                            ) : '-'}
                          </TableCell>

                          <TableCell className="text-center">
                            {user.role === 'admin' ? (
                               <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center w-fit mx-auto gap-1">
                                 <ShieldAlert className="w-3 h-3" /> Admin
                               </span>
                            ) : (
                               <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                 Pengguna
                               </span>
                            )}
                          </TableCell>

                          {/* KOLOM AKSI (HAPUS & BLOKIR) */}
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              {/* JANGAN BOLEH BLOKIR/HAPUS ADMIN LAIN ATAU DIRI SENDIRI */}
                              {user.role !== 'admin' && (
                                <>
                                  <Button 
                                    variant="outline" size="icon" 
                                    title={user.is_blocked ? "Buka Blokir" : "Blokir User"}
                                    className={user.is_blocked ? "text-green-600 border-green-200 hover:bg-green-50" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                                    onClick={() => handleToggleBlock(user.id, !user.is_blocked, user.nama)}
                                  >
                                    {user.is_blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                  </Button>
                                  <Button 
                                    variant="outline" size="icon" title="Hapus Permanen"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id, user.nama)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
             </div>
           </div>
        )}

      </main>

      {/* DIALOG KATEGORI & POSTINGAN */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { setIsCategoryDialogOpen(open); if (!open) { setCategoryName(""); setEditingCategoryId(null); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Manajemen Kategori</DialogTitle></DialogHeader>
          <form onSubmit={handleCategorySubmit} className="flex gap-2 mt-4">
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Ketik nama kategori..."/>
              <Button type="submit" className="bg-green-600 text-white hover:bg-green-700" disabled={categoryCreateMutation.isPending}>{editingCategoryId ? "Update" : "Simpan"}</Button>
            </form>
            <div className="mt-4 max-h-[300px] overflow-y-auto border rounded-lg">
              <Table>
                <TableBody>
                  {categories?.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.nama_kategori}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { setCategoryName(cat.nama_kategori); setEditingCategoryId(cat.id); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="icon" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { if(window.confirm('Hapus kategori ini?')) categoryDeleteMutation.mutate(cat.id) }}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingPostId ? "Edit Postingan" : "Buat Postingan Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4 mt-4">
            <input {...register("judul")} className="w-full border p-2 rounded-lg" placeholder="Judul" />
            <select {...register("nama_kategori")} className="w-full border p-2 rounded-lg">
              <option value="">-- Pilih Kategori --</option>
              {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>)}
            </select>
            <textarea {...register("isi")} rows={4} className="w-full border p-2 rounded-lg" placeholder="Isi Konten" />
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded-lg mt-1" />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || updateMutation.isPending}>Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}