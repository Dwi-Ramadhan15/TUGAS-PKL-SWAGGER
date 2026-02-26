import { useQuery } from '@tanstack/react-query'
import api from './lib/axios'

// 1. Buat "Cetakan" (Interface) Data Postingan
interface Post {
  id: number;
  judul: string;
  isi: string;
  create_at: string;
  gambar_url: string;
  nama_kategori: string;
}

function App() {
  // 2. Gunakan TanStack Query untuk "Menyedot" Data
  const { data: posts, isLoading, isError } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await api.get('/posts')
      return response.data
    }
  })

  // 3. Tampilan Saat Masih Loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold animate-pulse text-blue-500">
          ⏳ Sedang mengambil data Mading...
        </h1>
      </div>
    )
  }

  // 4. Tampilan Kalau Backend Error/Mati
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Yah, gagal mengambil data. Backend atau MinIO-nya udah nyala belum?
        </h1>
      </div>
    )
  }

  // 5. Tampilan Kalau Sukses (Data Tersedia)
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
        Mading Digital PKL 🚀
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        {posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            
            {post.gambar_url ? (
              <img 
                src={post.gambar_url} 
                alt={post.judul} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                Tidak ada gambar
              </div>
            )}
            
            <div className="p-5">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {post.nama_kategori}
              </span>
              <h2 className="text-xl font-bold mt-2 text-gray-800 line-clamp-2">
                {post.judul}
              </h2>
              <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                {post.isi}
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Dibuat: {new Date(post.create_at).toLocaleDateString('id-ID')}
              </div>
            </div>

          </div>
        ))}

        {posts?.length === 0 && (
          <div className="col-span-full text-center text-gray-500 italic p-10">
            Belum ada postingan nih. Bikin dulu gih di Swagger!
          </div>
        )}

      </div>
    </div>
  )
}

export default App