import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

// IMPORT LIBRARY EXPORT
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface Comment {
  id: number;
  nama: string;
  komentar: string;
  rating: number; 
  created_at: string;
}

export function useManageComments() {
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
      headStyles: { fillColor: [22, 163, 74] }, 
      styles: { fontSize: 9 },
      columnStyles: { 
        0: { cellWidth: 10 }, 
        3: { halign: 'center', cellWidth: 15 } 
      }
    });
    
    doc.save(`Laporan_Komentar_${post?.judul || 'Berita'}.pdf`);
  }

  return {
    navigate,
    post,
    comments,
    isLoading,
    handleDelete,
    handleExportExcel,
    handleExportCSV,
    handleExportPDF
  }
}