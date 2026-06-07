import { useEffect, useMemo, useState } from 'react';
import {
  getAdminStats,
  getAdminActivity,
  getAdminUsers,
  deleteAdminUser,
  changeAdminUserRole,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from '../services/adminService.js';

const tabs = ['stats', 'users', 'products', 'orders', 'coupons', 'activity'];

const defaultProductForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: null,
  imagen_url: '',
  es_nuevo: false,
  activo: true,
};

const defaultCouponForm = {
  codigo: '',
  tipo: 'percent',
  valor: 0,
  min_orden: 0,
  max_usos: 1,
  descripcion: '',
  activo: true,
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [couponForm, setCouponForm] = useState(defaultCouponForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAdminStats(), getAdminUsers(), getAdminProducts(), getAdminOrders(), getAdminCoupons(), getAdminActivity()])
      .then(([statsData, usersData, productsData, ordersData, couponsData, activityData]) => {
        setStats(statsData);
        setUsers(usersData);
        setProducts(productsData);
        setOrders(ordersData);
        setCoupons(couponsData);
        setActivity(activityData);
      })
      .catch((err) => setError(err?.response?.data?.error || 'No tienes permiso o hubo un error'))
      .finally(() => setLoading(false));
  }, []);

  const visibleSection = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'coupons':
        return renderCoupons();
      case 'activity':
        return renderActivity();
      default:
        return renderStats();
    }
  }, [activeTab, stats, users, products, orders, coupons, activity, message, productForm, couponForm, editingProductId, editingCouponId]);

  function handleProductChange(event) {
    const { name, value, type, checked } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleCouponChange(event) {
    const { name, value, type, checked } = event.target;
    setCouponForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function refreshAdminData() {
    try {
      const [statsData, usersData, productsData, ordersData, couponsData, activityData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminProducts(),
        getAdminOrders(),
        getAdminCoupons(),
        getAdminActivity(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setProducts(productsData);
      setOrders(ordersData);
      setCoupons(couponsData);
      setActivity(activityData);
    } catch (err) {
      setError(err?.response?.data?.error || 'No fue posible actualizar datos');
    }
  }

  async function handleDeleteUser(id) {
    await deleteAdminUser(id);
    setMessage('Usuario eliminado.');
    setUsers((current) => current.filter((user) => user.id !== id));
  }

  async function handleRoleChange(id, rol) {
    await changeAdminUserRole(id, rol);
    setMessage('Rol actualizado.');
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, rol } : user)));
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    try {
      if (editingProductId) {
        await updateAdminProduct(editingProductId, productForm);
        setMessage('Producto actualizado.');
      } else {
        await createAdminProduct(productForm);
        setMessage('Producto creado.');
      }
      setProductForm(defaultProductForm);
      setEditingProductId(null);
      await refreshAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error en producto');
    }
  }

  async function handleCouponSubmit(event) {
    event.preventDefault();
    try {
      if (editingCouponId) {
        await updateAdminCoupon(editingCouponId, couponForm);
        setMessage('Cupón actualizado.');
      } else {
        await createAdminCoupon(couponForm);
        setMessage('Cupón creado.');
      }
      setCouponForm(defaultCouponForm);
      setEditingCouponId(null);
      await refreshAdminData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error en cupón');
    }
  }

  async function handleDeleteProduct(id) {
    await deleteAdminProduct(id);
    setMessage('Producto eliminado.');
    setProducts((current) => current.filter((product) => product.id !== id));
  }

  async function handleDeleteOrder(id) {
    await deleteAdminOrder(id);
    setMessage('Pedido eliminado.');
    setOrders((current) => current.filter((order) => order.id !== id));
  }

  async function handleOrderStatusChange(id, estado) {
    await updateAdminOrderStatus(id, estado);
    setMessage('Estado de pedido actualizado.');
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, estado } : order)));
  }

  async function handleDeleteCoupon(id) {
    await deleteAdminCoupon(id);
    setMessage('Cupón eliminado.');
    setCoupons((current) => current.filter((coupon) => coupon.id !== id));
  }

  function renderStats() {
    return (
      <div className="grid grid-3">
        <div className="card">
          <h2>Usuarios</h2>
          <p>{stats?.totalUsuarios ?? 0}</p>
        </div>
        <div className="card">
          <h2>Productos activos</h2>
          <p>{stats?.totalProductos ?? 0}</p>
        </div>
        <div className="card">
          <h2>Pedidos</h2>
          <p>{stats?.totalPedidos ?? 0}</p>
        </div>
        <div className="card" style={{ gridColumn: 'span 3' }}>
          <h2>Ingresos</h2>
          <p>${Number(stats?.ingresos || 0).toFixed(2)}</p>
        </div>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="card">
        <h2>Usuarios</h2>
        <div className="grid" style={{ gap: '1rem' }}>
          {users.map((user) => (
            <div key={user.id} className="card">
              <p><strong>{user.nombre} {user.apellido}</strong></p>
              <p className="small-text">{user.email}</p>
              <p className="small-text">Rol: {user.rol}</p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" className="button-secondary" onClick={() => handleRoleChange(user.id, user.rol === 'admin' ? 'cliente' : 'admin')}>
                  Cambiar a {user.rol === 'admin' ? 'cliente' : 'admin'}
                </button>
                <button type="button" className="button-danger" onClick={() => handleDeleteUser(user.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="grid" style={{ gap: '1.5rem' }}>
        <div className="card">
          <h2>{editingProductId ? 'Editar producto' : 'Crear producto'}</h2>
          <form onSubmit={handleProductSubmit} className="grid" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>Nombre</label>
              <input name="nombre" value={productForm.nombre} onChange={handleProductChange} required />
            </div>
            <div className="input-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} />
            </div>
            <div className="grid grid-3">
              <div className="input-group">
                <label>Precio</label>
                <input name="precio" type="number" step="0.01" value={productForm.precio} onChange={handleProductChange} required />
              </div>
              <div className="input-group">
                <label>Stock</label>
                <input name="stock" type="number" value={productForm.stock} onChange={handleProductChange} required />
              </div>
              <div className="input-group">
                <label>Categoría</label>
                <input name="categoria" value={productForm.categoria ?? ''} onChange={handleProductChange} />
              </div>
            </div>
            <div className="input-group">
              <label>URL imagen</label>
              <input name="imagen_url" value={productForm.imagen_url} onChange={handleProductChange} />
            </div>
            <div className="grid grid-3">
              <label>
                <input type="checkbox" name="es_nuevo" checked={productForm.es_nuevo} onChange={handleProductChange} /> Nuevo
              </label>
              <label>
                <input type="checkbox" name="activo" checked={productForm.activo} onChange={handleProductChange} /> Activo
              </label>
            </div>
            <button type="submit" className="button-primary">
              {editingProductId ? 'Actualizar producto' : 'Guardar producto'}
            </button>
          </form>
        </div>
        <div className="card">
          <h2>Lista de productos</h2>
          {products.map((product) => (
            <div key={product.id} className="card">
              <p><strong>{product.nombre}</strong> — ${Number(product.precio).toFixed(2)}</p>
              <p className="small-text">Stock: {product.stock} · Estado: {product.activo ? 'Activo' : 'Inactivo'}</p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" className="button-secondary" onClick={() => {
                  setEditingProductId(product.id);
                  setProductForm({
                    nombre: product.nombre,
                    descripcion: product.descripcion || '',
                    precio: product.precio,
                    stock: product.stock,
                    categoria: product.id_categoria,
                    imagen_url: product.imagen_url || '',
                    es_nuevo: !!product.es_nuevo,
                    activo: !!product.activo,
                  });
                }}>
                  Editar
                </button>
                <button type="button" className="button-danger" onClick={() => handleDeleteProduct(product.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="card">
        <h2>Pedidos</h2>
        {orders.map((order) => (
          <div key={order.id} className="card">
            <p><strong>Pedido #{order.id}</strong></p>
            <p className="small-text">Cliente: {order.cliente_nombre || 'N/A'}</p>
            <p className="small-text">Total: ${Number(order.total).toFixed(2)}</p>
            <p className="small-text">Estado: {order.estado}</p>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={order.estado} onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}>
                {['pendiente', 'procesando', 'completado', 'cancelado'].map((estadoOption) => (
                  <option key={estadoOption} value={estadoOption}>{estadoOption}</option>
                ))}
              </select>
              <button type="button" className="button-danger" onClick={() => handleDeleteOrder(order.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCoupons() {
    return (
      <div className="grid" style={{ gap: '1.5rem' }}>
        <div className="card">
          <h2>{editingCouponId ? 'Editar cupón' : 'Crear cupón'}</h2>
          <form onSubmit={handleCouponSubmit} className="grid" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>Código</label>
              <input name="codigo" value={couponForm.codigo} onChange={handleCouponChange} required />
            </div>
            <div className="grid grid-3">
              <div className="input-group">
                <label>Tipo</label>
                <select name="tipo" value={couponForm.tipo} onChange={handleCouponChange}>
                  <option value="percent">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </select>
              </div>
              <div className="input-group">
                <label>Valor</label>
                <input name="valor" type="number" step="0.01" value={couponForm.valor} onChange={handleCouponChange} required />
              </div>
              <div className="input-group">
                <label>Usos máximos</label>
                <input name="max_usos" type="number" value={couponForm.max_usos} onChange={handleCouponChange} required />
              </div>
            </div>
            <div className="grid grid-3">
              <div className="input-group">
                <label>Min. orden</label>
                <input name="min_orden" type="number" step="0.01" value={couponForm.min_orden} onChange={handleCouponChange} />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label>
                  <input type="checkbox" name="activo" checked={couponForm.activo} onChange={handleCouponChange} /> Activo
                </label>
              </div>
            </div>
            <div className="input-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={couponForm.descripcion} onChange={handleCouponChange} />
            </div>
            <button type="submit" className="button-primary">
              {editingCouponId ? 'Actualizar cupón' : 'Guardar cupón'}
            </button>
          </form>
        </div>
        <div className="card">
          <h2>Lista de cupones</h2>
          {coupons.map((coupon) => (
            <div key={coupon.id} className="card">
              <p><strong>{coupon.codigo}</strong> — {coupon.tipo} {coupon.valor}</p>
              <p className="small-text">Usos: {coupon.usos}/{coupon.max_usos} · Activo: {coupon.activo ? 'Sí' : 'No'}</p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" className="button-secondary" onClick={() => {
                  setEditingCouponId(coupon.id);
                  setCouponForm({
                    codigo: coupon.codigo,
                    tipo: coupon.tipo,
                    valor: coupon.valor,
                    min_orden: coupon.min_orden,
                    max_usos: coupon.max_usos,
                    descripcion: coupon.descripcion || '',
                    activo: !!coupon.activo,
                  });
                }}>
                  Editar
                </button>
                <button type="button" className="button-danger" onClick={() => handleDeleteCoupon(coupon.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderActivity() {
    return (
      <div className="card">
        <h2>Actividad</h2>
        {activity.map((item) => (
          <div key={item.id} className="card">
            <p><strong>{item.accion}</strong></p>
            <p className="small-text">{item.usuario_email || 'Sistema'} · {new Date(item.fecha).toLocaleString()}</p>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return <p>Cargando panel admin...</p>;
  }

  if (error) {
    return <div className="alert">{error}</div>;
  }

  return (
    <section className="container">
      <h1 className="page-title">Panel de administración</h1>
      {message && <div className="card">{message}</div>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'button-primary' : 'button-secondary'}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {visibleSection}
    </section>
  );
}
