import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Detail from './pages/Detail'
import NotFound from './pages/notfound'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/post/:slug" element={<Detail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App