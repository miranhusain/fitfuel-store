import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  session, login, logout,
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchStats, fetchLogs, fetchSystem, fetchSettings, saveSettings,
} from '../lib/api.js';

const EMPTY_FORM = {
  name_en:'', name_ar:'', short_en:'', short_ar:'', full_en:'', full_ar:'',
  price:'', category:'', brand:'', stock:'', imageUrls:'',
  weights: '',  // "300g,500g:5000,1kg:10000" format: label:priceDelta
};

const CATEGORIES = ['proteins','preworkout','weight-gainer','recovery','weight-loss','vitamins'];

function parseWeights(raw) {
  return raw.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const [label, delta] = line.split(':');
    return { label: label.trim(), priceDelta: Number(delta?.trim()) || 0 };
  });
}

function productToForm(p) {
  return {
    name_en: p.name?.en || '', name_ar: p.name?.ar || '',
    short_en: p.shortDescription?.en || '', short_ar: p.shortDescription?.ar || '',
    full_en: p.fullDescription?.en || '', full_ar: p.fullDescription?.ar || '',
    price: String(p.price || ''), category: p.category || '',
    brand: p.brand || '', stock: String(p.stock || 0),
    imageUrls: (p.images || []).join('\n'),
    weights: (p.weights || []).map(w => `${w.label}${w.priceDelta ? ':'+w.priceDelta : ''}`).join('\n'),
  };
}

function formToPayload(f) {
  return {
    name: { en: f.name_en.trim(), ar: f.name_ar.trim() || f.name_en.trim() },
    shortDescription: { en: f.short_en.trim(), ar: f.short_ar.trim() || f.short_en.trim() },
    fullDescription:  { en: f.full_en.trim(),  ar: f.full_ar.trim()  || f.full_en.trim() },
    price: Number(f.price) || 0,
    category: f.category.trim(),
    brand: f.brand.trim(),
    stock: Number(f.stock) || 0,
    images: f.imageUrls.split('\n').map(s => s.trim()).filter(u => /^https?:\/\/.{5,}/i.test(u)),
    weights: parseWeights(f.weights),
  };
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:6, fontWeight:600 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? productToForm(product) : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      const payload = formToPayload(form);
      if (!payload.name.en) { setError('English name is required'); return; }
      if (payload.price < 0) { setError('Price must be positive'); return; }
      if (payload.images.length === 0) { setError('At least one valid image URL required'); return; }
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSave();
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, textTransform:'uppercase' }}>
            {product ? '✏️ Edit Product' : '➕ Add Product'}
          </h2>
          <button onClick={onClose} style={{ color:'var(--text-muted)', fontSize:22, lineHeight:1, background:'none', border:'none', cursor:'pointer' }}>×</button>
        </div>
        <div className="modal-body">
          {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:16 }}>{error}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="Name (English) *">
              <input className="input" value={form.name_en} onChange={e => set('name_en', e.target.value)} placeholder="e.g. Gold Standard Whey" />
            </Field>
            <Field label="Name (Arabic)">
              <input className="input" value={form.name_ar} onChange={e => set('name_ar', e.target.value)} placeholder="الاسم بالعربي" dir="rtl" />
            </Field>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
            <Field label="Price (IQD) *">
              <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" />
            </Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— Select —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Optimum Nutrition" />
            </Field>
          </div>

          <Field label="Stock Quantity">
            <input className="input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="100" style={{ width:160 }} />
          </Field>

          <Field label="Short Description (EN)">
            <input className="input" value={form.short_en} onChange={e => set('short_en', e.target.value)} placeholder="Brief product summary" />
          </Field>
          <Field label="Short Description (AR)">
            <input className="input" value={form.short_ar} onChange={e => set('short_ar', e.target.value)} placeholder="وصف مختصر" dir="rtl" />
          </Field>
          <Field label="Full Description (EN)">
            <textarea className="input" rows={3} value={form.full_en} onChange={e => set('full_en', e.target.value)} placeholder="Detailed product description..." style={{ resize:'vertical' }} />
          </Field>
          <Field label="Full Description (AR)">
            <textarea className="input" rows={3} value={form.full_ar} onChange={e => set('full_ar', e.target.value)} placeholder="وصف تفصيلي..." dir="rtl" style={{ resize:'vertical' }} />
          </Field>
          <Field label="Image URLs (one per line) *" hint="Must be valid http:// or https:// URLs">
            <textarea className="input" rows={3} value={form.imageUrls} onChange={e => set('imageUrls', e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" style={{ resize:'vertical', fontFamily:'monospace', fontSize:12 }} />
          </Field>
          <Field label="Weight Options (one per line)" hint="Format: label or label:price_delta  e.g.  300g  or  1kg:10000">
            <textarea className="input" rows={3} value={form.weights} onChange={e => set('weights', e.target.value)}
              placeholder="300g&#10;500g:5000&#10;1kg:10000" style={{ resize:'vertical', fontFamily:'monospace', fontSize:12 }} />
          </Field>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary">
            {loading ? <><div className="spinner" style={{ width:14, height:14 }} /> Saving...</> : (product ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24 }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:900, color:'var(--orange)' }}>{value}</div>
      <div style={{ fontWeight:600, fontSize:14, color:'var(--text)', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [, nav] = useLocation();
  const [authed, setAuthed] = useState(session.isAdmin());
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [system, setSystem] = useState(null);
  const [settings, setSettings] = useState({ whatsappNumber:'', storeNameEn:'', storeNameAr:'', visitorMultiplier:10, adminPassword:'' });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(() => {
    setProdLoading(true);
    fetchProducts({ limit:200 }).then(d => setProducts(d.products)).catch(() => {}).finally(() => setProdLoading(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadProducts();
    fetchStats().then(setStats).catch(() => {});
    fetchLogs().then(setLogs).catch(() => {});
    fetchSystem().then(setSystem).catch(() => {});
    fetchSettings().then(s => setSettings(st => ({ ...st, ...s }))).catch(() => {});
  }, [authed]);

  async function handleLogin() {
    setLoginLoading(true); setLoginErr('');
    try { await login(password); setAuthed(true); }
    catch(e) { setLoginErr(e.message); }
    finally { setLoginLoading(false); }
  }

  async function handleDelete(p) {
    await deleteProduct(p.id);
    setDeleteConfirm(null);
    loadProducts();
  }

  async function handleSaveSettings() {
    await saveSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.name?.en || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
  });

  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--black)' }}>
      <div style={{ width:380, background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:900, textTransform:'uppercase', color:'#fff' }}>
            FIT<span style={{ color:'var(--orange)' }}>FUEL</span>
          </div>
          <div style={{ color:'var(--text-muted)', marginTop:8, fontSize:14 }}>Admin Panel</div>
        </div>
        {loginErr && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:16 }}>{loginErr}</div>}
        <input className="input" type="password" placeholder="Admin Password" value={password}
          onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ marginBottom:12 }} />
        <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleLogin} disabled={loginLoading}>
          {loginLoading ? 'Logging in...' : 'Login →'}
        </button>
      </div>
    </div>
  );

  const TABS = [
    { key:'products', label:'📦 Products' },
    { key:'analytics', label:'📊 Analytics' },
    { key:'logs', label:'📋 Logs' },
    { key:'system', label:'🖥️ System' },
    { key:'settings', label:'⚙️ Settings' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)' }}>
      {/* Header */}
      <div style={{ borderBottom:'1px solid var(--border)', background:'var(--dark)', position:'sticky', top:0, zIndex:50 }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <button onClick={() => nav('/')} style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#fff', letterSpacing:2, textTransform:'uppercase', background:'none', border:'none', cursor:'pointer' }}>
              FIT<span style={{ color:'var(--orange)' }}>FUEL</span>
            </button>
            <span style={{ color:'var(--text-dim)' }}>|</span>
            <span style={{ color:'var(--text-muted)', fontSize:14 }}>Admin Panel</span>
          </div>
          <button className="btn btn-ghost" onClick={() => { logout(); setAuthed(false); }}>
            Logout →
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:32, background:'var(--dark2)', padding:4, borderRadius:'var(--radius)', width:'fit-content', border:'1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:'8px 20px', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'var(--transition)', border:'none', fontFamily:'inherit',
                background: tab === t.key ? 'var(--orange)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Products Tab ─────────────────────────────────────────── */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24, flexWrap:'wrap' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase' }}>
                Products <span style={{ color:'var(--orange)' }}>({products.length})</span>
              </h2>
              <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:220 }} />
              <button className="btn btn-primary" style={{ marginLeft:'auto' }} onClick={() => setModal('add')}>
                + Add Product
              </button>
            </div>

            {prodLoading ? (
              <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32, margin:'0 auto' }} /></div>
            ) : (
              <div style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['Image','Name','Brand','Category','Price','Stock','Weights','Actions'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--dark3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px' }}>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" style={{ width:48, height:48, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)' }} />
                          ) : (
                            <div style={{ width:48, height:48, background:'var(--gray)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>💊</div>
                          )}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{p.name?.en}</div>
                          {p.name?.ar && <div style={{ fontSize:12, color:'var(--text-muted)', direction:'rtl' }}>{p.name.ar}</div>}
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-muted)' }}>{p.brand || '—'}</td>
                        <td style={{ padding:'12px 16px' }}>
                          {p.category ? <span className="badge badge-orange" style={{ fontSize:10 }}>{p.category}</span> : <span style={{ color:'var(--text-dim)' }}>—</span>}
                        </td>
                        <td style={{ padding:'12px 16px', fontFamily:'var(--font-display)', fontWeight:900, color:'var(--orange)', whiteSpace:'nowrap' }}>{p.price?.toLocaleString()} IQD</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock}</span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-muted)' }}>
                          {p.weights?.length > 0 ? p.weights.map(w => w.label).join(', ') : '—'}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button className="btn btn-outline" style={{ padding:'6px 14px', fontSize:12 }} onClick={() => setModal(p)}>Edit</button>
                            <button className="btn btn-danger" style={{ padding:'6px 14px', fontSize:12 }} onClick={() => setDeleteConfirm(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:'var(--text-dim)', fontSize:14 }}>
                        No products yet. Click "Add Product" to get started.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Analytics Tab ─────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:32 }}>Analytics</h2>
            {stats ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:20 }}>
                <StatCard icon="👥" label="Total Visitors" value={stats.visitors?.toLocaleString()} sub={`Raw: ${stats.visitorsRaw} × multiplier`} />
                <StatCard icon="💬" label="WhatsApp Clicks" value={stats.whatsappClicks?.toLocaleString()} />
                {stats.topProduct && <StatCard icon="🔥" label="Top Product" value={stats.topProduct.views} sub={stats.topProduct.name} />}
                {stats.lastVisit && (
                  <div style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24 }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🕐</div>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>Last Visit</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{new Date(stats.lastVisit).toLocaleString()}</div>
                  </div>
                )}
              </div>
            ) : <div style={{ textAlign:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32, margin:'0 auto' }} /></div>}
          </div>
        )}

        {/* ── Logs Tab ─────────────────────────────────────────── */}
        {tab === 'logs' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:32 }}>Activity Logs</h2>
            <div style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
              {logs.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--text-dim)' }}>No logs yet.</div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['Action','Product','Time'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <span className={`badge ${l.action === 'create' ? 'badge-green' : l.action === 'delete' ? 'badge-red' : 'badge-orange'}`}>
                            {l.action}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:14 }}>{l.productName}</td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── System Tab ─────────────────────────────────────────── */}
        {tab === 'system' && system && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:32 }}>System Info</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
              {[
                ['Products in DB', system.productCount, '📦'],
                ['Storage Type', system.storageType, '💾'],
                ['Persistent', system.persistentStorage ? 'Yes ✅' : 'No ❌', '🔒'],
                ['Server Uptime', `${Math.floor(system.uptime/60)}m ${system.uptime%60}s`, '⏱️'],
                ['Node.js', system.nodeVersion, '🟢'],
                ['Memory', `${system.memoryUsageMb} MB`, '🧠'],
              ].map(([label, value, icon]) => (
                <div key={label} style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</div>
                  <div style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Settings Tab ─────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div style={{ maxWidth:560 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:32 }}>Settings</h2>
            <div style={{ background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:32, display:'flex', flexDirection:'column', gap:20 }}>
              <Field label="WhatsApp Number">
                <input className="input" value={settings.whatsappNumber || ''} onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))} placeholder="9647701180781" />
              </Field>
              <Field label="Store Name (English)">
                <input className="input" value={settings.storeNameEn || ''} onChange={e => setSettings(s => ({ ...s, storeNameEn: e.target.value }))} />
              </Field>
              <Field label="Store Name (Arabic)">
                <input className="input" value={settings.storeNameAr || ''} onChange={e => setSettings(s => ({ ...s, storeNameAr: e.target.value }))} dir="rtl" />
              </Field>
              <Field label="Visitor Multiplier" hint="Displayed visitors = Real visitors × this number">
                <input className="input" type="number" value={settings.visitorMultiplier || 10} onChange={e => setSettings(s => ({ ...s, visitorMultiplier: Number(e.target.value) }))} style={{ width:100 }} />
              </Field>
              <Field label="New Admin Password" hint="Leave blank to keep current password">
                <input className="input" type="password" value={settings.adminPassword || ''} onChange={e => setSettings(s => ({ ...s, adminPassword: e.target.value }))} placeholder="••••••••" />
              </Field>
              <button className="btn btn-primary" onClick={handleSaveSettings} style={{ alignSelf:'flex-start' }}>
                {settingsSaved ? '✅ Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadProducts(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:900, textTransform:'uppercase', color:'#ef4444' }}>⚠️ Delete Product?</h3>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>
                Are you sure you want to permanently delete <strong style={{ color:'var(--text)' }}>"{deleteConfirm.name?.en}"</strong>?
                This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
