import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Boxes, LogOut, PackagePlus, RefreshCw, Save, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { EmptyState } from './components/EmptyState';
import { Panel } from './components/Panel';
import { Stat } from './components/Stat';
import { clearToken, getToken, saveToken } from './lib/session';
import { getDeviceId } from './lib/device';
import {
  createProduct,
  createProvider,
  deleteProduct,
  deleteProvider,
  deleteUser,
  getErrorMessage,
  getProducts,
  getProviders,
  getUsers,
  login,
  registerUser,
  updateProductStock,
} from './lib/api';
import type { Product, ProductInput, Provider, ProviderInput, User } from './types';

type Tab = 'products' | 'providers' | 'users';
type Notice = { tone: 'success' | 'error' | 'info'; text: string } | null;

const initialProduct: ProductInput = {
  descripcion: '',
  tamaño: '',
  id_proveedor: 0,
  precio: 0,
  cantidad: 0,
};

const initialProvider: ProviderInput = {
  nombreEmpresa: '',
  email: '',
  telefono: '',
  nombreContacto: '',
  emailContacto: '',
  direccion: '',
};

export function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [tab, setTab] = useState<Tab>('products');
  const [pin, setPin] = useState('');
  const [registerData, setRegisterData] = useState({ name: '', email: '', pin: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [productForm, setProductForm] = useState<ProductInput>(initialProduct);
  const [providerForm, setProviderForm] = useState<ProviderInput>(initialProvider);
  const [stockDraft, setStockDraft] = useState<Record<number, { precio: string; cantidad: string }>>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const totalStock = useMemo(() => products.reduce((sum, item) => sum + Number(item.cantidad || 0), 0), [products]);

  const loadData = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    setNotice(null);
    try {
      const [nextProducts, nextProviders, nextUsers] = await Promise.all([getProducts(), getProviders(), getUsers()]);
      setProducts(nextProducts);
      setProviders(nextProviders);
      setUsers(nextUsers);
      setStockDraft(
        Object.fromEntries(
          nextProducts.map((product) => [product.id, { precio: String(product.precio), cantidad: String(product.cantidad) }]),
        ),
      );
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const response = await login(Number(pin), getDeviceId());
      saveToken(response.accessToken);
      setAuthenticated(true);
      setPin('');
      setNotice({ tone: 'success', text: response.message || 'Sesión iniciada' });
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const response = await registerUser({
        name: registerData.name,
        email: registerData.email,
        pin: Number(registerData.pin),
        id_device: getDeviceId(),
        notifPush: 'website',
      });
      setRegisterData({ name: '', email: '', pin: '' });
      setNotice({ tone: 'success', text: response.message || 'Usuario creado. Ya podés iniciar sesión.' });
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setAuthenticated(false);
    setProducts([]);
    setProviders([]);
    setUsers([]);
  }

  async function submitProduct(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await createProduct({ ...productForm, precio: Number(productForm.precio), cantidad: Number(productForm.cantidad), id_proveedor: Number(productForm.id_proveedor) });
      setProductForm(initialProduct);
      setNotice({ tone: 'success', text: response.message || 'Producto creado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function submitProvider(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await createProvider(providerForm);
      setProviderForm(initialProvider);
      setNotice({ tone: 'success', text: response.message || 'Proveedor creado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function saveStock(product: Product) {
    const draft = stockDraft[product.id];
    if (!draft) return;
    setLoading(true);
    try {
      const response = await updateProductStock(product.id, Number(draft.precio), Number(draft.cantidad));
      setNotice({ tone: 'success', text: response.message || 'Producto actualizado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!confirm('Eliminar producto ' + product.descripcion + '?')) return;
    setLoading(true);
    try {
      const response = await deleteProduct(product.id);
      setNotice({ tone: 'success', text: response.message || 'Producto eliminado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function removeProvider(provider: Provider) {
    if (!confirm('Eliminar proveedor ' + provider.nombreEmpresa + '?')) return;
    setLoading(true);
    try {
      const response = await deleteProvider(provider.id);
      setNotice({ tone: 'success', text: response.message || 'Proveedor eliminado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(user: User) {
    if (!confirm('Eliminar usuario ' + user.name + '?')) return;
    setLoading(true);
    try {
      const response = await deleteUser(user.id);
      setNotice({ tone: 'success', text: response.message || 'Usuario eliminado' });
      await loadData();
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand-mark"><ShieldCheck size={28} /></div>
          <h1>AppPacha</h1>
          <p className="muted">Gestión web para productos, proveedores y usuarios.</p>
          {notice ? <div className={'notice ' + notice.tone}>{notice.text}</div> : null}
          <form onSubmit={onLogin} className="form-grid compact">
            <label>
              PIN
              <input value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" maxLength={6} required placeholder="Tu PIN" type="password" />
            </label>
            <button className="primary" disabled={loading} type="submit">Ingresar</button>
          </form>
          <div className="divider" />
          <form onSubmit={onRegister} className="form-grid">
            <h2>Crear usuario</h2>
            <label>
              Nombre
              <input value={registerData.name} onChange={(event) => setRegisterData({ ...registerData, name: event.target.value })} required placeholder="Nombre completo" />
            </label>
            <label>
              Email
              <input value={registerData.email} onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })} required placeholder="correo@ejemplo.com" type="email" />
            </label>
            <label>
              PIN
              <input value={registerData.pin} onChange={(event) => setRegisterData({ ...registerData, pin: event.target.value })} inputMode="numeric" maxLength={6} required type="password" />
            </label>
            <button className="secondary" disabled={loading} type="submit"><UserPlus size={16} /> Registrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-row"><ShieldCheck size={24} /><strong>AppPacha</strong></div>
          <p className="muted small">Panel operativo</p>
        </div>
        <nav className="nav-list">
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><Boxes size={18} /> Productos</button>
          <button className={tab === 'providers' ? 'active' : ''} onClick={() => setTab('providers')}><Building2 size={18} /> Proveedores</button>
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><Users size={18} /> Usuarios</button>
        </nav>
        <button className="ghost" onClick={logout}><LogOut size={18} /> Salir</button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>Gestión AppPacha</h1>
          </div>
          <button className="secondary" onClick={() => void loadData()} disabled={loading}><RefreshCw size={16} /> Actualizar</button>
        </header>

        {notice ? <div className={'notice ' + notice.tone}>{notice.text}</div> : null}

        <div className="stats-grid">
          <Stat icon={<Boxes size={18} />} label="Productos" value={products.length} />
          <Stat icon={<PackagePlus size={18} />} label="Stock total" value={totalStock} />
          <Stat icon={<Building2 size={18} />} label="Proveedores" value={providers.length} />
          <Stat icon={<Users size={18} />} label="Usuarios" value={users.length} />
        </div>

        {tab === 'products' ? (
          <div className="layout-grid">
            <Panel title="Productos" description="Precios, cantidades y presentación del catálogo.">
              {products.length === 0 ? (
                <EmptyState title="Sin productos" message="Registrá tu primer producto para empezar a gestionar stock y precios." />
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Producto</th><th>Tamaño</th><th>Proveedor</th><th>Precio</th><th>Cantidad</th><th /></tr></thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td><strong>{product.descripcion}</strong><span>#{product.id}</span></td>
                          <td>{product.tamaño}</td>
                          <td>{providers.find((provider) => provider.id === product.id_proveedor)?.nombreEmpresa ?? product.id_proveedor}</td>
                          <td><input className="cell-input" value={stockDraft[product.id]?.precio ?? ''} onChange={(event) => setStockDraft({ ...stockDraft, [product.id]: { ...(stockDraft[product.id] ?? { cantidad: String(product.cantidad) }), precio: event.target.value } })} type="number" /></td>
                          <td><input className="cell-input" value={stockDraft[product.id]?.cantidad ?? ''} onChange={(event) => setStockDraft({ ...stockDraft, [product.id]: { ...(stockDraft[product.id] ?? { precio: String(product.precio) }), cantidad: event.target.value } })} type="number" /></td>
                          <td className="actions"><button className="icon-button" title="Guardar" onClick={() => void saveStock(product)}><Save size={16} /></button><button className="icon-button danger" title="Eliminar" onClick={() => void removeProduct(product)}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
            <Panel title="Nuevo producto" description="Asociá el producto a un proveedor existente.">
              <form className="form-grid" onSubmit={submitProduct}>
                <label>Descripción<input required value={productForm.descripcion} onChange={(event) => setProductForm({ ...productForm, descripcion: event.target.value })} /></label>
                <label>Tamaño<input required value={productForm.tamaño} onChange={(event) => setProductForm({ ...productForm, tamaño: event.target.value })} /></label>
                <label>Proveedor<select required value={productForm.id_proveedor} onChange={(event) => setProductForm({ ...productForm, id_proveedor: Number(event.target.value) })}><option value={0}>Seleccionar</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.nombreEmpresa}</option>)}</select></label>
                <label>Precio<input required type="number" min="0" value={productForm.precio} onChange={(event) => setProductForm({ ...productForm, precio: Number(event.target.value) })} /></label>
                <label>Cantidad<input required type="number" min="0" value={productForm.cantidad} onChange={(event) => setProductForm({ ...productForm, cantidad: Number(event.target.value) })} /></label>
                <button className="primary" disabled={loading || providers.length === 0} type="submit"><PackagePlus size={16} /> Crear producto</button>
              </form>
            </Panel>
          </div>
        ) : null}

        {tab === 'providers' ? (
          <div className="layout-grid">
            <Panel title="Proveedores" description="Empresas y contactos comerciales.">
              {providers.length === 0 ? <EmptyState title="Sin proveedores" message="Registrá un proveedor para poder asociarlo a tus productos." /> : (
                <div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Email</th><th>Teléfono</th><th>Contacto</th><th /></tr></thead><tbody>{providers.map((provider) => <tr key={provider.id}><td><strong>{provider.nombreEmpresa}</strong><span>#{provider.id}</span></td><td>{provider.email}</td><td>{provider.telefono}</td><td>{provider.nombreContacto}</td><td className="actions"><button className="icon-button danger" title="Eliminar" onClick={() => void removeProvider(provider)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
              )}
            </Panel>
            <Panel title="Nuevo proveedor" description="Datos principales de contacto.">
              <form className="form-grid" onSubmit={submitProvider}>
                <label>Empresa<input required value={providerForm.nombreEmpresa} onChange={(event) => setProviderForm({ ...providerForm, nombreEmpresa: event.target.value })} /></label>
                <label>Email<input required type="email" value={providerForm.email} onChange={(event) => setProviderForm({ ...providerForm, email: event.target.value })} /></label>
                <label>Teléfono<input required value={providerForm.telefono} onChange={(event) => setProviderForm({ ...providerForm, telefono: event.target.value })} /></label>
                <label>Contacto<input required value={providerForm.nombreContacto} onChange={(event) => setProviderForm({ ...providerForm, nombreContacto: event.target.value })} /></label>
                <label>Email contacto<input type="email" value={providerForm.emailContacto ?? ''} onChange={(event) => setProviderForm({ ...providerForm, emailContacto: event.target.value })} /></label>
                <label>Dirección<input value={providerForm.direccion ?? ''} onChange={(event) => setProviderForm({ ...providerForm, direccion: event.target.value })} /></label>
                <button className="primary" disabled={loading} type="submit"><Building2 size={16} /> Crear proveedor</button>
              </form>
            </Panel>
          </div>
        ) : null}

        {tab === 'users' ? (
          <Panel title="Usuarios" description="Usuarios registrados y acceso asociado al dispositivo.">
            {users.length === 0 ? <EmptyState title="Sin usuarios" message="Registrá usuarios desde el acceso inicial para habilitar operación." /> : (
              <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Email</th><th>Dispositivo</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><span>#{user.id}</span></td><td>{user.email}</td><td>{user.id_device ?? 'Sin dato'}</td><td className="actions"><button className="icon-button danger" title="Eliminar" onClick={() => void removeUser(user)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
            )}
          </Panel>
        ) : null}
      </section>
    </main>
  );
}
