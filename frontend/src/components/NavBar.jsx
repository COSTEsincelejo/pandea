import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Pandea
      </Link>
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        <Link to="/cart">Carrito ({items.length})</Link>
        {user ? (
          <>
            <Link to="/profile">Perfil</Link>
            {user.rol === 'admin' && <Link to="/admin">Admin</Link>}
            <button type="button" className="button-secondary" onClick={() => { logout(); navigate('/'); }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
