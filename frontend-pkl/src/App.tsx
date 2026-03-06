import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Detail from './pages/Detail'
import NotFound from './pages/NotFound'
import ManageComments from './pages/ManageComments'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/comments/:postId" element={<ManageComments />} />
        <Route path="/post/:slug" element={<Detail />} />
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </Router>
  )
}

export default App