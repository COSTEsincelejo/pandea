import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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
            {user.rol === 'admin' && (
              <div style={{ position: 'relative' }}>
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  style={{ cursor: 'pointer' }}
                >
                  Admin ▼
                </button>
                {showAdminMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #6c3483',
                    borderRadius: '8px',
                    padding: '0.5rem 0',
                    zIndex: 100,
                    minWidth: '150px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}>
                    <Link to="/admin" style={{ display: 'block', padding: '0.75rem 1rem', color: '#2c3e50', textDecoration: 'none' }}>
                      Dashboard
                    </Link>
                    <Link to="/admin/inventory" style={{ display: 'block', padding: '0.75rem 1rem', color: '#2c3e50', textDecoration: 'none' }}>
                      Inventario
                    </Link>
                    <Link to="/admin/expenses" style={{ display: 'block', padding: '0.75rem 1rem', color: '#2c3e50', textDecoration: 'none' }}>
                      Gastos
                    </Link>
                    <Link to="/admin/reports" style={{ display: 'block', padding: '0.75rem 1rem', color: '#2c3e50', textDecoration: 'none' }}>
                      Reportes
                    </Link>
                  </div>
                )}
              </div>
            )}
            <button type="button" className="button-secondary" onClick={() => { logout(); navigate('/'); }} aria-label="Cerrar sesión">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-button">Ingresar</Link>
            <Link to="/register" className="button-secondary">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
