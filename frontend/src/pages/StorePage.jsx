import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { fetchProducts, fetchMeta, trackEvent } from '../lib/api.js';

const CATEGORIES = [
  { key: '', label: 'All Products', ar: 'كل المنتجات' },
  { key: 'proteins',    label: 'Proteins & Amino', ar: 'بروتين وأحماض أمينية' },
  { key: 'preworkout',  label: 'Pre-Workout',       ar: 'قبل التمرين' },
  { key: 'weight-gainer', label: 'Weight Gainers',  ar: 'زيادة الوزن' },
  { key: 'recovery',    label: 'Recovery',          ar: 'التعافي' },
  { key: 'weight-loss', label: 'Weight Loss',       ar: 'إنقاص الوزن' },
  { key: 'vitamins',    label: 'Multivitamins',     ar: 'فيتامينات' },
];

function Navbar({ lang, toggleLang }) {
  const [, nav] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: '0.3s ease',
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:70 }}>
        {/* Logo */}
        <button onClick={() => nav('/')} style={{ background:'none', border:'none', cursor:'pointer' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:900, color:'#fff', letterSpacing:2, textTransform:'uppercase' }}>
            FIT<span style={{ color:'var(--orange)' }}>FUEL</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {CATEGORIES.slice(0, 5).map(c => (
            <button key={c.key} onClick={() => { nav('/'); window.dispatchEvent(new CustomEvent('filter-category', { detail: c.key })); }}
              className="btn btn-ghost" style={{ fontSize:13, padding:'6px 12px' }}>
              {lang === 'ar' ? c.ar : c.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={toggleLang} className="btn btn-outline" style={{ fontSize:13, padding:'6px 14px' }}>
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <button onClick={() => nav('/admin')} className="btn btn-ghost" style={{ fontSize:13 }}>Admin</button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ lang }) {
  return (
    <section style={{
      minHeight: '100vh', display:'flex', alignItems:'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* BG glow */}
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, background:'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`, opacity:0.5 }} />

      <div className="container" style={{ position:'relative', zIndex:1, paddingTop:80 }}>
        <div style={{ maxWidth:700 }}>
          <div className="badge badge-orange" style={{ marginBottom:20, fontSize:12 }}>
            🔥 {lang === 'ar' ? 'متجر المكملات الغذائية #١' : '#1 Supplement Store'}
          </div>
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:'clamp(56px,8vw,100px)',
            fontWeight:900, lineHeight:0.95, textTransform:'uppercase',
            color:'#fff', marginBottom:24,
          }}>
            {lang === 'ar' ? (
              <><span>ارفع مستواك</span><br /><span style={{ color:'var(--orange)' }}>ابدأ الآن</span></>
            ) : (
              <><span>Fuel Your</span><br /><span style={{ color:'var(--orange)' }}>Performance</span></>
            )}
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:18, maxWidth:480, marginBottom:36, lineHeight:1.7 }}>
            {lang === 'ar'
              ? 'مكملات غذائية عالية الجودة لتحقيق أهدافك في اللياقة البدنية'
              : 'Premium fitness supplements to fuel your workouts and accelerate your goals.'}
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href="#products" className="btn btn-primary" style={{ fontSize:16, padding:'14px 32px' }}>
              {lang === 'ar' ? 'تصفح المنتجات' : 'Shop Now'} →
            </a>
            <a href="#products" className="btn btn-outline" style={{ fontSize:16, padding:'14px 32px' }}>
              {lang === 'ar' ? 'اكتشف الفئات' : 'Explore Categories'}
            </a>
          </div>
          {/* Stats row */}
          <div style={{ display:'flex', gap:40, marginTop:60, flexWrap:'wrap' }}>
            {[['500+', lang==='ar'?'منتج':'Products'],['100%',lang==='ar'?'أصلي':'Authentic'],['Fast',lang==='ar'?'توصيل':'Delivery']].map(([n,l]) => (
              <div key={n}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:900, color:'var(--orange)' }}>{n}</div>
                <div style={{ color:'var(--text-muted)', fontSize:13, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterSidebar({ meta, filters, setFilters, total, lang }) {
  const categories = CATEGORIES;
  return (
    <aside style={{ width:240, flexShrink:0 }}>
      <div style={{ position:'sticky', top:90, background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:20, color:'var(--text)' }}>
          {lang === 'ar' ? 'التصفية' : 'Filters'}
          <span style={{ marginLeft:8, fontSize:13, color:'var(--orange)', fontFamily:'var(--font-body)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>
            {total} {lang === 'ar' ? 'منتج' : 'products'}
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>
            {lang === 'ar' ? 'بحث' : 'Search'}
          </label>
          <input className="input" placeholder={lang === 'ar' ? 'ابحث...' : 'Search products...'}
            value={filters.search || ''}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page:1 }))} />
        </div>

        {/* Categories */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:10 }}>
            {lang === 'ar' ? 'الفئة' : 'Category'}
          </label>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {categories.map(c => (
              <button key={c.key}
                onClick={() => setFilters(f => ({ ...f, category: c.key, page:1 }))}
                style={{
                  padding:'8px 12px', borderRadius:'var(--radius-sm)', textAlign:'left',
                  background: filters.category === c.key ? 'var(--orange-glow)' : 'transparent',
                  color: filters.category === c.key ? 'var(--orange)' : 'var(--text-muted)',
                  border: filters.category === c.key ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                  cursor:'pointer', fontSize:13, transition:'var(--transition)', fontFamily:'var(--font-body)',
                }}>
                {lang === 'ar' ? c.ar : c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:10 }}>
            {lang === 'ar' ? 'السعر' : 'Price Range'}
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" type="number" placeholder="Min" style={{ width:'50%' }}
              value={filters.minPrice || ''} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value, page:1 }))} />
            <input className="input" type="number" placeholder="Max" style={{ width:'50%' }}
              value={filters.maxPrice || ''} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value, page:1 }))} />
          </div>
        </div>

        {/* Brand */}
        {meta.brands?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:10 }}>
              {lang === 'ar' ? 'العلامة التجارية' : 'Brand'}
            </label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              <span className={`tag ${!filters.brand ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, brand:'', page:1 }))}>
                {lang === 'ar' ? 'الكل' : 'All'}
              </span>
              {meta.brands.map(b => (
                <span key={b} className={`tag ${filters.brand === b ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, brand: f.brand === b ? '' : b, page:1 }))}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weights */}
        {meta.weights?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:10 }}>
              {lang === 'ar' ? 'الوزن' : 'Weight'}
            </label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              <span className={`tag ${!filters.weight ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, weight:'', page:1 }))}>
                {lang === 'ar' ? 'الكل' : 'All'}
              </span>
              {meta.weights.map(w => (
                <span key={w} className={`tag ${filters.weight === w ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, weight: f.weight === w ? '' : w, page:1 }))}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        <button className="btn btn-outline" style={{ width:'100%', marginTop:8 }}
          onClick={() => setFilters({ category:'', brand:'', weight:'', search:'', minPrice:'', maxPrice:'', sort:'newest', page:1 })}>
          {lang === 'ar' ? 'مسح التصفية' : 'Clear Filters'}
        </button>
      </div>
    </aside>
  );
}

function ProductCard({ product, lang }) {
  const [, nav] = useLocation();
  const price = product.price;
  const mainImg = product.images?.[0];
  const name = lang === 'ar' ? (product.name?.ar || product.name?.en) : product.name?.en;
  const inStock = product.stock > 0;

  return (
    <div className="card" style={{ cursor:'pointer' }}
      onClick={() => { trackEvent('product_view', product.id); nav(`/product/${product.id}`); }}>
      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'1/1', background:'var(--dark3)', overflow:'hidden' }}>
        {mainImg ? (
          <img src={mainImg} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
            onMouseEnter={e => e.target.style.transform='scale(1.05)'}
            onMouseLeave={e => e.target.style.transform='scale(1)'} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)', fontSize:40 }}>💊</div>
        )}
        {!inStock && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span className="badge badge-red">{lang==='ar'?'غير متوفر':'Out of Stock'}</span>
          </div>
        )}
        {product.weights?.length > 0 && (
          <div style={{ position:'absolute', top:10, right:10 }}>
            <span className="badge badge-orange">{product.weights[0].label}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'16px' }}>
        {product.brand && (
          <div style={{ fontSize:11, color:'var(--orange)', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{product.brand}</div>
        )}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, lineHeight:1.2, marginBottom:10, color:'var(--text)' }}>
          {name}
        </h3>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'var(--orange)' }}>
            {price.toLocaleString()} IQD
          </span>
          {product.weights?.length > 1 && (
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{product.weights.length} sizes</span>
          )}
        </div>
        {product.category && (
          <div style={{ marginTop:10 }}>
            <span className="badge badge-orange" style={{ fontSize:10 }}>{product.category}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorePage() {
  const [lang, setLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ categories:[], brands:[], weights:[], priceRange:{min:0,max:9999} });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category:'', brand:'', weight:'', search:'', minPrice:'', maxPrice:'', sort:'newest', page:1 });
  const debounceRef = useRef(null);

  // Listen for category events from navbar
  useEffect(() => {
    const fn = (e) => setFilters(f => ({ ...f, category: e.detail, page:1 }));
    window.addEventListener('filter-category', fn);
    return () => window.removeEventListener('filter-category', fn);
  }, []);

  useEffect(() => { fetchMeta().then(setMeta).catch(() => {}); }, []);

  // Debounced fetch when filters change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const params = {};
      if (filters.category)  params.category = filters.category;
      if (filters.brand)     params.brand = filters.brand;
      if (filters.weight)    params.weight = filters.weight;
      if (filters.search)    params.search = filters.search;
      if (filters.minPrice)  params.minPrice = filters.minPrice;
      if (filters.maxPrice)  params.maxPrice = filters.maxPrice;
      if (filters.sort)      params.sort = filters.sort;
      params.page  = filters.page;
      params.limit = 24;
      fetchProducts(params)
        .then(data => { setProducts(data.products); setTotal(data.total); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
  }, [filters]);

  return (
    <div>
      <Navbar lang={lang} toggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')} />
      <Hero lang={lang} />

      {/* Products Section */}
      <section className="section" id="products">
        <div className="container">
          <div style={{ marginBottom:40 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,4vw,52px)', fontWeight:900, textTransform:'uppercase', color:'#fff' }}>
              {lang === 'ar' ? 'منتجاتنا' : 'Our'} <span style={{ color:'var(--orange)' }}>{lang === 'ar' ? '' : 'Products'}</span>
            </h2>
          </div>

          <div style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
            {/* Sidebar */}
            <FilterSidebar meta={meta} filters={filters} setFilters={setFilters} total={total} lang={lang} />

            {/* Main content */}
            <div style={{ flex:1, minWidth:0 }}>
              {/* Sort bar */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                <div style={{ color:'var(--text-muted)', fontSize:14 }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}><div className="spinner" style={{ width:14, height:14 }} /> {lang==='ar'?'جاري البحث...':'Loading...'}</span>
                  ) : (
                    <span>{total} {lang==='ar'?'منتج':'products found'}</span>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{lang==='ar'?'ترتيب:':'Sort:'}</span>
                  <select className="input" style={{ width:'auto', padding:'6px 12px', fontSize:13 }}
                    value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value, page:1 }))}>
                    <option value="newest">{lang==='ar'?'الأحدث':'Newest'}</option>
                    <option value="price_asc">{lang==='ar'?'السعر: من الأقل':'Price: Low → High'}</option>
                    <option value="price_desc">{lang==='ar'?'السعر: من الأعلى':'Price: High → Low'}</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {!loading && products.length === 0 ? (
                <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text-dim)' }}>
                  <div style={{ fontSize:64, marginBottom:16 }}>🏋️</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>
                    {lang==='ar'?'لا توجد منتجات':'No Products Found'}
                  </div>
                  <p style={{ marginTop:8, fontSize:14 }}>{lang==='ar'?'جرب تغيير التصفية':'Try adjusting your filters'}</p>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} lang={lang} />)}
                </div>
              )}

              {/* Pagination */}
              {total > 24 && (
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:40 }}>
                  <button className="btn btn-outline" disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                    ← {lang==='ar'?'السابق':'Prev'}
                  </button>
                  <span style={{ padding:'12px 20px', color:'var(--text-muted)', fontSize:14 }}>
                    {lang==='ar'?`صفحة ${filters.page}`:`Page ${filters.page}`}
                  </span>
                  <button className="btn btn-outline" disabled={products.length < 24}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                    {lang==='ar'?'التالي':'Next'} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'48px 0', background:'var(--dark)' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'#fff', letterSpacing:2, textTransform:'uppercase' }}>
            FIT<span style={{ color:'var(--orange)' }}>FUEL</span>
          </span>
          <span style={{ color:'var(--text-dim)', fontSize:13 }}>© 2025 FitFuel Store. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
