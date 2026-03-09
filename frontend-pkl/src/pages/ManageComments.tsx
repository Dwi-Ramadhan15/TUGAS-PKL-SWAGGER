import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, MessageSquare, Calendar, Star, FileText, Table as TableIcon, Download } from 'lucide-react'
import api from '../lib/axios'

// IMPORT LIBRARY EXPORT
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Comment {
  id: number;
  nama: string;
  komentar: string;
  rating: number; // <-- Tambahkan ini di cetakan datanya
  created_at: string;
}

export default function ManageComments() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login') 
  }, [navigate])

  // Ambil detail postingan (buat nampilin judul di atas)
  const { data: post } = useQuery({
    queryKey: ['post-detail', postId],
    queryFn: async () => (await api.get(`/posts/${postId}`)).data
  })

  // Ambil daftar komentar berdasarkan postId
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['admin-comments', postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}/comments?source=admin`)
      return res.data.data 
    }
  })

  // Mutasi Hapus Komentar
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => await api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments', postId] })
      alert("Komentar berhasil dihapus! 🧹")
    },
    onError: (error: any) => alert(`Gagal hapus komentar: ${error.response?.data?.message || "Error"} ❌`)
  })

  const handleDelete = (id: number, nama: string) => {
    if (window.confirm(`Yakin mau menghapus komentar dari "${nama}"? Komentar negatif akan lenyap!`)) {
      deleteCommentMutation.mutate(id)
    }
  }

  // --- FUNGSI EXPORT DATA KOMENTAR ---
  const handleExportExcel = () => {
    if (!comments || comments.length === 0) return alert("Belum ada data komentar untuk diexport!");
    
    const dataToExport = comments.map((comment, index) => ({
      "No": index + 1,
      "E-mail Pengirim": comment.nama,
      "Isi Komentar": comment.komentar,
      "Rating": comment.rating,
      "Tanggal": new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Komentar");
    XLSX.writeFile(wb, `Laporan_Komentar_${post?.judul || 'Berita'}.xlsx`);
  }

  const handleExportCSV = () => {
    if (!comments || comments.length === 0) return alert("Belum ada data komentar untuk diexport!");
    
    const dataToExport = comments.map((comment, index) => ({
      "No": index + 1,
      "E-mail Pengirim": comment.nama,
      "Isi Komentar": comment.komentar,
      "Rating": comment.rating,
      "Tanggal": new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Laporan_Komentar_${post?.judul || 'Berita'}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  const handleExportPDF = () => {
    if (!comments || comments.length === 0) return alert("Belum ada data komentar untuk diexport!");
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Laporan Data Komentar D'NEWS", 14, 15);
    doc.setFontSize(10);
    doc.text(`Judul Berita: ${post?.judul || '-'}`, 14, 22);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    
    const tableColumn = ["No", "E-mail", "Komentar", "Rating", "Tanggal"];
    const tableRows: any[] = [];

    comments.forEach((comment, index) => {
      const rowData = [
        index + 1,
        comment.nama,
        comment.komentar,
        comment.rating,
        new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, { 
      head: [tableColumn], 
      body: tableRows, 
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // atur warna header table
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 10 }, 
        3: { halign: 'center', cellWidth: 15 } // Rating dibikin rata tengah
      }
    });
    
    doc.save(`Laporan_Komentar_${post?.judul || 'Berita'}.pdf`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <Button variant="outline" className="text-slate-600 hover:bg-slate-100 mb-4" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
              Kelola Komentar & Ulasan
            </h1>
            <p className="text-slate-500 mt-2">
              Berita: <span className="font-bold text-blue-600">"{post?.judul || 'Memuat...'}"</span>
            </p>
          </div>
        </div>

        {/* TOMBOL EXPORT KOMENTAR DITAMBAHKAN DI SINI */}
        <div className="flex justify-end gap-2 mb-4">
          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 shadow-sm" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 shadow-sm" onClick={handleExportExcel}>
            <TableIcon className="w-4 h-4 mr-2" /> Export Excel
          </Button>
          <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* TABEL KOMENTAR */}
        <div className="border rounded-xl flex flex-col bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead className="w-[200px]">E-mail Pengirim</TableHead>
                  <TableHead>Isi Komentar</TableHead>
                  <TableHead className="w-[120px]">Rating</TableHead>
                  <TableHead className="w-[150px]">Tanggal</TableHead>
                  <TableHead className="text-center w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    {/* colSpan diganti jadi 6 karena total kolomnya ada 6 */}
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">Memuat data komentar...</TableCell>
                  </TableRow>
                ) : comments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 italic">Belum ada komentar untuk berita ini.</TableCell>
                  </TableRow>
                ) : (
                  comments?.map((comment, index) => (
                    <TableRow key={comment.id} className="hover:bg-slate-50">
                      <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                      <TableCell className="font-bold text-slate-800">{comment.nama}</TableCell>
                      <TableCell className="whitespace-pre-line text-slate-600">{comment.komentar}</TableCell>
                      
                      {/* INI BAGIAN RATING BINTANGNYA */}
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-100'}`} 
                            />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Hapus Komentar"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(comment.id, comment.nama)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}