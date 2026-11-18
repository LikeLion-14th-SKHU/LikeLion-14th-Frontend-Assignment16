import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import CertDetail from './pages/CertDetail.jsx'
import Calendar from './pages/Calendar.jsx'
import NotFound from './pages/NotFound.jsx'
import Shared from './pages/Shared.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="cert/:id" element={<CertDetail />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="share" element={<Shared />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
