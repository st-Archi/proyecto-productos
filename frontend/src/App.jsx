import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Admin from './pages/Admin';
import Monedas from './pages/Monedas';

// Ruta protegida: solo permite acceso si el usuario está autenticado Y es admin
function RutaAdmin({ children }) {
  const { usuario, esAdmin, cargando } = useAuth();

  if (cargando) return <p className="cargando">Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/" replace />;

  return children;
}

function AppInterna() {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Página principal: catálogo público */}
        <Route path="/" element={<Catalogo />} />

        {/* Login: si ya estás logueado, te manda al catálogo */}
        <Route
          path="/login"
          element={usuario ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Panel de administración: solo admins */}
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <Admin />
            </RutaAdmin>
          }
        />

        {/* Página de monedas: pública */}
        <Route path="/monedas" element={<Monedas />} />

        {/* Cualquier ruta no encontrada va al catálogo */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInterna />
    </AuthProvider>
  );
}
