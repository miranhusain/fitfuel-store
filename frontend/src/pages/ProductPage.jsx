import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { fetchProduct, fetchProducts, trackEvent, fetchSettings } from '../lib/api.js';

export default function ProductPage() {
  const [, params] = useRoute('/product/:id');
  const [, nav] = useLocation();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [settings, setSettings] = useState({ whatsappNumber: '' });
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [lang, setLang] = useState('en');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    Promise.all([
      fetchProduct(params.id),
      fetchSettings().catch(() => ({ whatsappNumber: '' })),
    ]).then(([p, s]) => {
      setProduct(p);
      setSettings(s);
      setActiveImg(0);
      setSelectedWeight(0);
      trackEvent('product_view', p.id);
      // Fetch related products
      fetchProducts({ category: p.category, limit: 4 })
        .then(d => setRelated(d.products.filter(r => r.id !== p.id).slice(0, 4)))
        .catch(() => {});
    }).catch(() => nav('/'))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  );
  if (!product) return null;

  const name = lang === 'ar' ? (product.name?.ar || product.name?.en) : product.name?.en;
  const fullDesc = lang === 'ar' ? (product.fullDescription?.ar || product.fullDescription?.en) : product.fullDescription?.en;
  const shortDesc = lang === 'ar' ? (product.shortDescription?.ar || product.shortDescription?.en) : product.shortDescription?.en;
  const currentWeight = product.weights?.[selectedWeight];
  const currentPrice = product.price + (currentWeight?.priceDelta ?? 0);
  const inStock = product.stock > 0;

  const waMsg = encodeURIComponent(`Hello, I want to order:\n${name}\n${currentWeight ? `Size: ${currentWeight.label}\n` : ''}Qty: ${qty}\nPrice: ${currentPrice.toLocaleString()} IQD`);
  const waUrl = `https://wa.me/${settings.whatsappNumber}?text=${waMsg}`;

  return (
    <div style={{ minHeight:'100vh', background:'var(--black)' }}>
      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,10,10,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:70 }}>
          <button onClick={() => nav('/')} style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:900, color:'#fff', letterSpacing:2, textTransform:'uppercase', background:'none', border:'none', cursor:'pointer' }}>
            FIT<span style={{ color:'var(--orange)' }}>FUEL</span>
          </button>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => nav('/')} className="btn btn-ghost">← {lang==='ar'?'العودة':'Back'}</button>
            <button onClick={() => setLang(l => l==='en'?'ar':'en')} className="btn btn-outline" style={{ fontSize:13 }}>
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop:40, paddingBottom:80 }}>
        {/* Breadcrumb */}
        <div style={{ fontSize:13, color:'var(--text-dim)', marginBottom:32, display:'flex', gap:8, alignItems:'center' }}>
          <span onClick={() => nav('/')} style={{ cursor:'pointer', color:'var(--text-muted)' }}>{lang==='ar'?'الرئيسية':'Home'}</span>
          <span>›</span>
          {product.category && <><span onClick={() => nav('/')} style={{ cursor:'pointer', color:'var(--text-muted)' }}>{product.category}</span><span>›</span></>}
          <span style={{ color:'var(--text)' }}>{name}</span>
        </div>

        {/* Main Product */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'start', marginBottom:80 }}>
          {/* Left — Image Gallery */}
          <div>
            {/* Main image */}
            <div style={{ aspectRatio:'1/1', background:'var(--dark2)', borderRadius:'var(--radius)', overflow:'hidden', border:'1px solid var(--border)', marginBottom:16 }}>
              {product.images?.[activeImg] ? (
                <img src={product.images[activeImg]} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>💊</div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width:72, height:72, borderRadius:'var(--radius-sm)', overflow:'hidden', cursor:'pointer',
                      border: `2px solid ${activeImg === i ? 'var(--orange)' : 'var(--border)'}`,
                      transition:'border-color 0.2s', opacity: activeImg === i ? 1 : 0.6 }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div>
            {product.brand && (
              <div style={{ fontSize:12, color:'var(--orange)', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>{product.brand}</div>
            )}
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,3vw,42px)', fontWeight:900, lineHeight:1.1, color:'#fff', marginBottom:16, textTransform:'uppercase' }}>
              {name}
            </h1>
            {shortDesc && (
              <p style={{ color:'var(--text-muted)', fontSize:15, lineHeight:1.7, marginBottom:24 }}>{shortDesc}</p>
            )}

            {/* Weight selector */}
            {product.weights?.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:13, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:12, fontWeight:600 }}>
                  {lang==='ar'?'الحجم / الوزن':'Size / Weight'}
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {product.weights.map((w, i) => (
                    <button key={i} onClick={() => setSelectedWeight(i)}
                      style={{
                        padding:'10px 20px', borderRadius:'var(--radius-sm)', cursor:'pointer', fontFamily:'var(--font-display)',
                        fontSize:15, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', transition:'var(--transition)',
                        background: selectedWeight === i ? 'var(--orange)' : 'var(--dark3)',
                        border: `1.5px solid ${selectedWeight === i ? 'var(--orange)' : 'var(--border)'}`,
                        color: selectedWeight === i ? '#fff' : 'var(--text-muted)',
                      }}>
                      {w.label}
                      {w.priceDelta !== 0 && (
                        <span style={{ fontSize:11, opacity:0.8, marginLeft:6 }}>
                          {w.priceDelta > 0 ? '+' : ''}{w.priceDelta.toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:900, color:'var(--orange)', lineHeight:1 }}>
                {currentPrice.toLocaleString()}
                <span style={{ fontSize:20, color:'var(--text-muted)', marginLeft:8 }}>IQD</span>
              </div>
              {!inStock && (
                <div style={{ marginTop:8 }}>
                  <span className="badge badge-red">{lang==='ar'?'غير متوفر حالياً':'Out of Stock'}</span>
                </div>
              )}
              {inStock && (
                <div style={{ marginTop:8 }}>
                  <span className="badge badge-green">{lang==='ar'?`متوفر • ${product.stock} قطعة`:`In Stock • ${product.stock} units`}</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
              <span style={{ fontSize:13, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1 }}>{lang==='ar'?'الكمية':'Qty'}</span>
              <div style={{ display:'flex', alignItems:'center', background:'var(--dark3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{ padding:'10px 16px', fontSize:18, color:'var(--text-muted)', cursor:'pointer', background:'none', border:'none', fontFamily:'inherit' }}>−</button>
                <span style={{ padding:'10px 20px', fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, minWidth:50, textAlign:'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q+1)}
                  style={{ padding:'10px 16px', fontSize:18, color:'var(--text-muted)', cursor:'pointer', background:'none', border:'none', fontFamily:'inherit' }}>+</button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href={waUrl} target="_blank" rel="noreferrer"
                onClick={() => trackEvent('whatsapp_click', product.id)}
                className="btn btn-primary"
                style={{ flex:1, fontSize:16, padding:'16px 24px', justifyContent:'center', opacity: inStock ? 1 : 0.5, pointerEvents: inStock ? 'auto' : 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {lang==='ar'?'اطلب عبر واتساب':'Order via WhatsApp'}
              </a>
            </div>

            {/* Features */}
            <div style={{ marginTop:32, display:'flex', gap:16, flexWrap:'wrap' }}>
              {[
                { icon:'🚚', en:'Fast Delivery', ar:'توصيل سريع' },
                { icon:'✅', en:'100% Authentic', ar:'أصلي 100%' },
                { icon:'🔒', en:'Secure Order', ar:'طلب آمن' },
              ].map(f => (
                <div key={f.en} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-muted)' }}>
                  <span>{f.icon}</span>
                  <span>{lang==='ar'?f.ar:f.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {fullDesc && (
          <div style={{ marginBottom:80, background:'var(--dark2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:900, textTransform:'uppercase', marginBottom:24, color:'#fff' }}>
              {lang==='ar'?'الوصف':'Description'}
            </h2>
            <p style={{ color:'var(--text-muted)', lineHeight:1.9, fontSize:15, whiteSpace:'pre-wrap' }}>{fullDesc}</p>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:900, textTransform:'uppercase', marginBottom:32, color:'#fff' }}>
              {lang==='ar'?'منتجات مشابهة':'Related'} <span style={{ color:'var(--orange)' }}>{lang==='ar'?'':'Products'}</span>
            </h2>
            <div className="products-grid">
              {related.map(p => {
                const n = lang === 'ar' ? (p.name?.ar || p.name?.en) : p.name?.en;
                return (
                  <div key={p.id} className="card" style={{ cursor:'pointer' }}
                    onClick={() => { trackEvent('product_view', p.id); nav(`/product/${p.id}`); }}>
                    <div style={{ aspectRatio:'1/1', background:'var(--dark3)', overflow:'hidden' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={n} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>💊</div>
                      )}
                    </div>
                    <div style={{ padding:16 }}>
                      {p.brand && <div style={{ fontSize:11, color:'var(--orange)', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{p.brand}</div>}
                      <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, lineHeight:1.2, marginBottom:8 }}>{n}</h3>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'var(--orange)' }}>{p.price.toLocaleString()} IQD</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
