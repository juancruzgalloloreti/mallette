import React, { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from './supabase'


const WA = "5491156023250";
const fmt = n => "$" + Number(n).toLocaleString("es-AR");

const COLS = [
  { id: "equilibrio", name: "Capsula Equilibrio", desc: "Diseno sereno y equilibrado. Piezas artesanales que acompanan cada momento con elegancia natural." },
  { id: "sirio", name: "Coleccion Sirio", desc: "Estructuradas y con personalidad. Elegancia contemporanea para cada ocasion." },
  { id: "cuero", name: "Cuero Argentino", desc: "Lo mejor del cuero nacional. Piezas artesanales premium hechas para durar toda la vida." },
];

const getCollectionId = (name) => {
  if (name === "Capsula Equilibrio") return "equilibrio";
  if (name === "Coleccion Sirio") return "sirio";
  if (name === "Cuero Argentino") return "cuero";
  return "equilibrio";
};

// Agrupa las variantes de la BD en productos únicos para el frontend
const groupProducts = (dbRows) => {
  const grouped = [];
  const map = {};
  dbRows.forEach(row => {
    const modelName = row.modelo;
    const baseId = row.id.split("-")[0];
    
    if (!map[modelName]) {
      map[modelName] = {
        id: baseId,
        name: modelName,
        col: getCollectionId(row.coleccion),
        style: row.estilo,
        price: Number(row.precio),
        stock: row.stock,
        desc: row.descripcion,
        note: row.nota || "",
        variants: []
      };
      grouped.push(map[modelName]);
    }
    
    const color = row.variantes_de_color;
    
    // Parsear images_url si viene como string
    let imgs = [];
    if (Array.isArray(row.images_url)) {
      imgs = row.images_url;
    } else if (typeof row.images_url === "string") {
      try {
        imgs = JSON.parse(row.images_url);
      } catch (e) {
        imgs = [row.images_url];
      }
    }
    
    // Si no hay imágenes en la BD, ponemos una por defecto
    if (!imgs || imgs.length === 0) {
      imgs = ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop"];
    }

    map[modelName].variants.push({
      id: row.id,
      c: color === "Único" ? "" : color,
      price: Number(row.precio),
      stock: row.stock,
      imgs: imgs
    });
  });
  return grouped;
};

function Carousel({ imgs, onZoom }) {
  const [idx, setIdx] = useState(0);
  const t = useRef(null);
  if (!imgs || !imgs.length) return null;
  const go = (n) => setIdx(Math.max(0, Math.min(imgs.length - 1, n)));
  return (
    <div className="carousel-container"
      onTouchStart={e => { t.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - t.current; if (dx < -40) go(idx + 1); if (dx > 40) go(idx - 1); }}
      onClick={() => onZoom && onZoom(imgs[idx])}>
      <img key={imgs[idx]} src={imgs[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fI .2s ease" }} />
      {imgs.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", gap: 6, justifyContent: "center" }}>
          {imgs.map((_, i) => <button key={i} className={"dot" + (i === idx ? " on" : "")} onClick={e => { e.stopPropagation(); setIdx(i); }} />)}
        </div>
      )}
    </div>
  );
}

const WI = ({ s = 20, f = "white" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={f}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

function WAF() {
  const [tip, setTip] = useState(false);
  return (
    <>
      {tip && <div className="wt">Consultanos por WhatsApp</div>}
      <button className="waf" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}
        onClick={() => window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola MALLETTE! Quiero consultar sobre sus carteras"), "_blank")}>
        <WI s={26} />
      </button>
    </>
  );
}

function Hdr({ view, setView, n, setShowCart, user, onLogin, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = user?.email === "juancruzgalloloreti@gmail.com";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={"hdr" + (scrolled ? " up" : "")}>
      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setView("shop")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className="brand-title" style={{
            fontSize: 18,
            background: "linear-gradient(135deg,#c9a96e,#e8c97a,#b8895a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>MALLETTE</span>
        </button>
        <nav style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setView("shop")} style={{ padding: "7px 14px", borderRadius: 100, border: "1px solid " + (view === "shop" ? "#1a1612" : "transparent"), background: view === "shop" ? "#1a1612" : "none", color: view === "shop" ? "#faf8f5" : "#78716c", fontSize: 13, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all .2s" }}>
            Tienda
          </button>
          {(!user || isAdmin) && (
            <button onClick={() => setView("admin")} style={{ padding: "7px 14px", borderRadius: 100, border: "1px solid " + (view === "admin" ? "#1a1612" : "transparent"), background: view === "admin" ? "#1a1612" : "none", color: view === "admin" ? "#faf8f5" : "#78716c", fontSize: 13, cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all .2s" }}>
              Admin
            </button>
          )}
          <button className="bdk" onClick={() => setShowCart(true)} style={{ position: "relative", padding: "8px 12px", fontSize: 13, borderRadius: 100, display: "flex", alignItems: "center", gap: 6, marginLeft: 2 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            <span className="hdr-btn-text">Carrito</span>
            {n > 0 && <span style={{ position: "absolute", top: -5, right: -5, background: "#c9a96e", color: "#1a1612", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>}
          </button>
          <div style={{ marginLeft: 4, display: "flex", alignItems: "center" }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #c9a96e" }} title={user.email} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#c9a96e", color: "#1a1612", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }} title={user.email}>
                    {user.email[0].toUpperCase()}
                  </div>
                )}
                <button onClick={onLogout} className="bol" style={{ padding: "6px 12px", fontSize: 11, borderRadius: 100 }} title="Cerrar sesión">
                  <span className="hdr-btn-text">Salir</span>
                  <span className="hdr-btn-icon" style={{ display: "none" }}>✖</span>
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className="bol" style={{ padding: "6px 12px", fontSize: 11, borderRadius: 100, border: "1px solid #c9a96e", color: "#1a1612", background: "none" }}>
                Ingresar
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function CartDrawer({ cart, setCart, onClose }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const upd = (dbId, d) => setCart(p => p.map(c => c.dbId === dbId ? { ...c, qty: c.qty + d } : c).filter(c => c.qty > 0));
  const rem = (dbId) => setCart(p => p.filter(c => c.dbId !== dbId));
  const lines = cart.map(i => "- " + i.name + (i.vc ? " (" + i.vc + ")" : "") + " x" + i.qty + " - " + fmt(i.price * i.qty)).join("\n");
  const wm = encodeURIComponent("Hola! Quiero encargar lo siguiente de MALLETTE:\n\n" + lines + "\n\nTotal: " + fmt(total) + "\n\nComo continuo?");
  return (
    <>
      <div className="ov" onClick={onClose} />
      <div className="dr">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px", borderBottom: "1px solid #ede8e0" }}>
          <span className="serif" style={{ fontSize: 20 }}>Carrito</span>
          <button onClick={onClose} className="bol" style={{ width: 34, height: 34, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#a09890" }}>
              <p className="si" style={{ fontSize: 18, color: "#c9b99a" }}>El carrito esta vacio</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={item.dbId} className="cart-item fu" style={{ animationDelay: i * .05 + "s" }}>
              <div className="cart-item-img">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p className="cart-item-name">{item.name}</p>
                    {item.vc && <p className="cart-item-variant">{item.vc}</p>}
                  </div>
                  <button onClick={() => rem(item.dbId)} className="cart-remove-btn" title="Quitar producto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <div className="qty-selector">
                    <button onClick={() => upd(item.dbId, -1)} className="qty-btn" title="Restar">-</button>
                    <span className="qty-val">{item.qty}</span>
                    <button onClick={() => upd(item.dbId, 1)} className="qty-btn" title="Sumar">+</button>
                  </div>
                  <p className="cart-item-price">{fmt(item.price * item.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #ede8e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <span className="si" style={{ fontSize: 16, color: "#78716c" }}>Total</span>
              <span className="serif" style={{ fontSize: 26 }}>{fmt(total)}</span>
            </div>
            <button className="bwa" style={{ width: "100%", padding: "14px", fontSize: 12, letterSpacing: ".08em", borderRadius: 100 }}
              onClick={() => window.open("https://wa.me/" + WA + "?text=" + wm, "_blank")}>
              <WI s={18} />CONSULTAR Y COMPRAR POR WHATSAPP
            </button>
            <p style={{ fontSize: 10, color: "#a09890", textAlign: "center", marginTop: 8 }}>Confirmamos disponibilidad y forma de pago</p>
          </div>
        )}
      </div>
    </>
  );
}

function Modal({ p, onClose, onAdd, onZoom }) {
  const col = COLS.find(c => c.id === p.col);
  const cbg = { equilibrio: "cbe", sirio: "cbs", cuero: "cbc" };
  const hasColors = p.variants.length > 1 && p.variants[0].c !== "";
  const [selV, setSelV] = useState(0);
  const [added, setAdded] = useState(false);
  const v = p.variants[selV] || p.variants[0];
  
  const currentPrice = v.price || p.price;
  const currentStock = v.stock !== undefined ? v.stock : p.stock;

  const ha = () => { onAdd(p, v); setAdded(true); setTimeout(() => setAdded(false), 2000); };
  const wm = encodeURIComponent("Hola! Me interesa el Modelo " + p.name + (v.c ? " - " + v.c : "") + " - " + fmt(currentPrice));
  
  return (
    <div className="mb" onClick={onClose}>
      <div className="mx" onClick={e => e.stopPropagation()}>
        <div className="modal-content-grid">
          <Carousel imgs={v.imgs} onZoom={onZoom} />
          <div className="modal-info-side">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span className={"cb " + cbg[p.col]}>{col?.name}</span>
                <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, background: "#1a1612", color: "#fff", border: "none", cursor: "pointer", flexShrink: 0 }}>x</button>
              </div>
              <h2 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 4 }}>Modelo {p.name}</h2>
              <p style={{ fontSize: 12, color: "#a09890", marginBottom: 14 }}>{p.style}</p>
              <p style={{ fontSize: 13, color: "#5c534a", lineHeight: 1.75, marginBottom: 14, whiteSpace: "pre-line" }}>{p.desc?.replace(/\\n/g, "\n")}</p>
              {p.note && <div style={{ background: "#f0ebe3", borderRadius: 10, padding: "9px 14px", marginBottom: 12, fontSize: 12, color: "#8b6914", fontWeight: 500 }}>* {p.note}</div>}

              {hasColors && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1612", letterSpacing: ".02em", marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #c9a96e" }}>
                    Selecciona el color:
                  </p>
                  <div className="color-sel-container">
                    {p.variants.map((vv, i) => (
                      <button key={i} className={"color-sel" + (i === selV ? " on" : "")} onClick={() => setSelV(i)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                            <img src={vv.imgs[0]} alt={vv.c} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: i === selV ? 600 : 400 }}>{vv.c}</span>
                          {i === selV && <span style={{ marginLeft: "auto", color: "#c9a96e", fontSize: 16 }}>&#10003;</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f0ebe3", borderBottom: "1px solid #f0ebe3", marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: "#a09890", letterSpacing: ".06em", textTransform: "uppercase" }}>Precio</span>
                <span className="serif" style={{ fontSize: 24 }}>{fmt(currentPrice)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="bdk" onClick={ha} disabled={currentStock === 0}
                style={{ padding: "13px", fontSize: 12, letterSpacing: ".08em", background: added ? "#5a7a5a" : currentStock === 0 ? "#c9c5be" : "#1a1612" }}>
                {added ? "AGREGADO AL CARRITO" : currentStock === 0 ? "SIN STOCK" : "AGREGAR AL CARRITO"}
              </button>
              <button className="bwa" style={{ padding: "12px", fontSize: 12, letterSpacing: ".06em" }}
                onClick={() => window.open("https://wa.me/" + WA + "?text=" + wm, "_blank")}>
                <WI s={15} />CONSULTAR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ p, onAdd, onOpen, delay }) {
  const [added, setAdded] = useState(false);
  const cbg = { equilibrio: "cbe", sirio: "cbs", cuero: "cbc" };
  const hasColors = p.variants.length > 1 && p.variants[0].c !== "";
  const cover = p.variants[0]?.imgs[0] || "";
  const totalImgs = p.variants.reduce((s, v) => s + v.imgs.length, 0);
  const price = p.variants[0]?.price || p.price;
  const stock = p.variants[0]?.stock !== undefined ? p.variants[0].stock : p.stock;

  const ha = (e) => { e.stopPropagation(); if (!stock) return; onAdd(p, p.variants[0]); setAdded(true); setTimeout(() => setAdded(false), 1800); };
  return (
    <div className="pcard fu" style={{ animationDelay: delay * .07 + "s" }} onClick={() => onOpen(p)}>
      <div className="pi">
        <img src={cover} alt={p.name} loading="lazy" />
        {totalImgs > 1 && (
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", gap: 5, justifyContent: "center" }}>
            {Array(Math.min(totalImgs, 5)).fill(0).map((_, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.85)", display: "inline-block" }} />)}
          </div>
        )}
        {hasColors && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(250,248,245,.92)", color: "#1a1612", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100, letterSpacing: ".04em" }}>
            {p.variants.length} colores
          </div>
        )}
        {stock <= 3 && stock > 0 && <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(254,243,199,.95)", color: "#b45309", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100 }}>Ultimas {stock}</div>}
        {stock === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(250,248,245,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ background: "#1a1612", color: "#faf8f5", fontSize: 11, letterSpacing: ".1em", padding: "8px 18px", borderRadius: 100 }}>SIN STOCK</span></div>}
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <span className={"cb " + cbg[p.col]} style={{ marginBottom: 6, display: "inline-block" }}>{COLS.find(c => c.id === p.col)?.name.split(" ").pop()}</span>
        <h3 className="serif" style={{ fontSize: 17, fontWeight: 400, margin: "5px 0 3px", color: "#1a1612" }}>Modelo {p.name}</h3>
        <p style={{ fontSize: 11, color: "#78716c", marginBottom: 10 }}>{p.style}{hasColors ? " - " + p.variants.map(v => v.c).join(", ") : ""}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="serif" style={{ fontSize: 19, color: "#1a1612" }}>{fmt(price)}</span>
          <button className="bdk" onClick={ha} disabled={!stock}
            style={{ padding: "9px 0", fontSize: 12, width: "100%", background: added ? "#5a7a5a" : !stock ? "#c9c5be" : "#1a1612" }}>
            {added ? "Agregado" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "Realizan envios a todo el pais?", a: "Si. Realizamos envios a toda Argentina mediante Correo Argentino." },
    { q: "Cuanto demora el envio?", a: "Los tiempos de entrega dependen de Correo Argentino y de la ubicacion del destinatario." },
    { q: "Trabajan por encargo?", a: "Si. Trabajamos tanto con stock disponible como por encargo, dependiendo del modelo." },
    { q: "Puedo realizar cambios?", a: "Si. Aceptamos cambios dentro de los 7 dias posteriores a la recepcion del producto, siempre que se encuentre en perfecto estado, sin uso y en las mismas condiciones en que fue entregado." },
    { q: "Todas las carteras son de cuero?", a: "No. Algunos modelos estan confeccionados en cuero argentino de alta calidad y otros utilizan diferentes materiales segun su diseno." },
    { q: "Que modelos son de cuero?", a: "Los modelos de cuero include: Capsula Equilibrio, Nina, Mini Nina y Alma." },
    { q: "Los productos de cuero son artesanales?", a: "Si. Los modelos confeccionados en cuero argentino son realizados artesanalmente." },
  ];
  return (
    <div className="info-section">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, color: "#1a1612", letterSpacing: ".06em", marginBottom: 8, textAlign: "center" }}>Preguntas frecuentes</h2>
        <div style={{ width: 40, height: 2, background: "#c9a96e", margin: "0 auto 36px", borderRadius: 2 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f0ebe3" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "18px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1612", lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ color: "#c9a96e", fontSize: 20, fontWeight: 300, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .2s" }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 4px 18px", fontSize: 14, color: "#5c534a", lineHeight: 1.7, animation: "fU .2s ease" }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cuidados() {
  return (
    <div className="info-section alt">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, color: "#1a1612", letterSpacing: ".06em", marginBottom: 8, textAlign: "center" }}>Cuidados del producto</h2>
        <div style={{ width: 40, height: 2, background: "#c9a96e", margin: "0 auto 32px", borderRadius: 2 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
          {[
            "Evitar la exposicion prolongada al sol.",
            "Evitar el contacto con humedad excesiva.",
            "Limpiar con un pano suave y seco.",
            "No utilizar productos abrasivos.",
            "Guardar en un lugar seco cuando no este en uso.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#fff", padding: "16px", borderRadius: 12, border: "1px solid #ede8e0" }}>
              <span style={{ color: "#c9a96e", fontSize: 18, flexShrink: 0, marginTop: 1 }}>&#10003;</span>
              <p style={{ fontSize: 13, color: "#5c534a", lineHeight: 1.6 }}>{tip}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "linear-gradient(135deg,#f5ede8,#faf3ee)", borderRadius: 16, padding: "20px 24px", border: "1px solid #e8d5c8" }}>
          <p style={{ fontSize: 13, color: "#7a3520", lineHeight: 1.7, fontWeight: 500 }}>
            Para los modelos de cuero, se recomienda un cuidado especial para conservar su apariencia y durabilidad a lo largo del tiempo.
          </p>
        </div>
      </div>
    </div>
  );
}

function Shop({ products, onAdd }) {
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [fsImg, setFsImg] = useState(null);

  const filtered = products.filter(p => {
    const cn = COLS.find(c => c.id === p.col)?.name || "";
    return (filter === "Todas" || cn === filter) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.style.toLowerCase().includes(search.toLowerCase()));
  });

  const grouped = COLS.map(col => ({ col, items: filtered.filter(p => p.col === col.id) })).filter(g => g.items.length > 0);

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <h1 className="brand-title fu" style={{
            fontSize: "clamp(38px,9vw,108px)",
            letterSpacing: "clamp(.1em,.22em,.3em)",
            lineHeight: 1,
            animationDelay: ".1s",
            display: "block",
            background: "linear-gradient(135deg,#e8c97a 0%,#f5e6b0 35%,#c9a96e 55%,#f0d890 75%,#b8895a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 12px rgba(201,169,110,.35))"
          }}>MALLETTE</h1>
          <div className="fu" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "18px auto", animationDelay: ".15s" }}>
            <div style={{ width: 40, height: 1, background: "linear-gradient(to right,transparent,#c9a96e)" }}></div>
            <span style={{ color: "#c9a96e", fontSize: 14, opacity: .9 }}>&#9670;</span>
            <div style={{ width: 40, height: 1, background: "linear-gradient(to left,transparent,#c9a96e)" }}></div>
          </div>
          <p className="si fu" style={{ color: "#c9a96e", fontSize: "clamp(13px,1.8vw,17px)", animationDelay: ".2s", letterSpacing: ".14em", textTransform: "uppercase", opacity: .9 }}>Carteras Artesanales</p>
          <p className="fu" style={{ color: "rgba(250,248,245,.35)", fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", marginTop: 14, animationDelay: ".3s" }}>Buenos Aires</p>
        </div>
      </div>

      <div className="tabs-wrapper">
        <div className="tabs-container">
          <button className={"ctab" + (filter === "Todas" ? " on" : "")} onClick={() => setFilter("Todas")}>Todas</button>
          {COLS.map(col => <button key={col.id} className={"ctab" + (filter === col.name ? " on" : "")} onClick={() => setFilter(col.name)}>{col.name}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "100%", padding: "20px 16px 0" }}>
        <div className="srch-wrap">
          <svg width="18" height="18" fill="none" stroke="#c9a96e" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar modelo o estilo..." style={{ border: "none", outline: "none", fontFamily: "Inter,sans-serif", fontSize: 15, width: "100%", background: "transparent", color: "#1a1612" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#a09890", fontSize: 18, padding: 0 }}>x</button>}
        </div>
      </div>

      <div style={{ maxWidth: "100%", padding: "28px 16px 80px" }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#a09890" }}><p className="si" style={{ fontSize: 20 }}>Sin resultados para "{search}"</p></div>
        ) : grouped.map(({ col, items }) => (
          <div key={col.id} className="shop-section">
            <div className="sl">
              <h2 className="serif" style={{ fontSize: 25, fontWeight: 400, color: "#1a1612" }}>{col.name}</h2>
              <p style={{ fontSize: 13, color: "#78716c", marginTop: 5, maxWidth: 480 }}>{col.desc}</p>
            </div>
            <div className="grid-products" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
              {items.map((p, i) => <Card key={p.id} p={p} onAdd={onAdd} onOpen={setDetail} delay={i} />)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderTop: "1px solid #ede8e0", padding: "48px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, textAlign: "center", color: "#1a1612", letterSpacing: ".06em", marginBottom: 36 }}>Por que elegirnos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 24 }}>
            {[
              { icon: "envios", t: "Envios a todo el pais", d: "Por Correo Argentino" },
              { icon: "pago", t: "Transferencia bancaria", d: "Medio de pago disponible" },
              { icon: "diseno", t: "Diseno y elegancia", d: "Modelos seleccionados con foco en moda" },
              { icon: "arg", t: "Hecho en Argentina", d: "Modelos artesanales de cuero nacional" },
              { icon: "calidad", t: "Cuero de alta calidad", d: "Disponible en colecciones seleccionadas" },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px 12px", borderRadius: 16, border: "1px solid #f0ebe3", background: "#faf8f5" }}>
                <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#c9a96e,#e8c97a)", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {b.icon === "envios" && <svg width="22" height="22" fill="none" stroke="#1a1612" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" /><rect x="9" y="11" width="14" height="10" rx="2" /><path d="m13 16 2 2 4-4" /></svg>}
                  {b.icon === "pago" && <svg width="22" height="22" fill="none" stroke="#1a1612" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>}
                  {b.icon === "diseno" && <svg width="22" height="22" fill="none" stroke="#1a1612" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                  {b.icon === "arg" && <svg width="22" height="22" fill="none" stroke="#1a1612" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                  {b.icon === "calidad" && <svg width="22" height="22" fill="none" stroke="#1a1612" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1612", marginBottom: 4 }}>{b.t}</p>
                <p style={{ fontSize: 11, color: "#78716c" }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#1a0f08,#2c1a0e 50%,#1a0f08)", padding: "64px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "radial-gradient(circle,#c9a96e 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 50, height: 1, background: "linear-gradient(to right,transparent,#c9a96e)" }} />
            <span style={{ color: "#c9a96e", fontSize: 12 }}>&#9670;</span>
            <div style={{ width: 50, height: 1, background: "linear-gradient(to left,transparent,#c9a96e)" }} />
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 400, color: "#faf8f5", letterSpacing: ".06em", marginBottom: 28 }}>Sobre Mallette</h2>
          <p style={{ fontSize: 15, color: "#c9b99a", lineHeight: 1.9, marginBottom: 18 }}>Mallette nacio de la pasion por la moda, las tendencias y el deseo de ofrecer accesorios que acompanen cada momento de la vida cotidiana.</p>
          <p style={{ fontSize: 15, color: "#c9b99a", lineHeight: 1.9, marginBottom: 18 }}>Creemos que una cartera es mucho mas que un accesorio: es una forma de expresar estilo, personality y elegancia.</p>
          <p style={{ fontSize: 15, color: "#c9b99a", lineHeight: 1.9, marginBottom: 18 }}>Nuestra coleccion esta pensada para mujeres que valoran el diseno, la calidad y los detalles. Cada modelo es seleccionado para aportar un toque distintivo a cualquier outfit, combinando funcionalidad, moda y sofisticacion.</p>
          <p style={{ fontSize: 15, color: "#c9b99a", lineHeight: 1.9 }}>Queremos acompanar a nuestras clientas en cada momento, ofreciendo productos que reflejen su esencia y las hagan sentir unicas.</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 36 }}>
            <div style={{ width: 50, height: 1, background: "linear-gradient(to right,transparent,#c9a96e)" }} />
            <span style={{ color: "#c9a96e", fontSize: 12 }}>&#9670;</span>
            <div style={{ width: 50, height: 1, background: "linear-gradient(to left,transparent,#c9a96e)" }} />
          </div>
        </div>
      </div>

      <div style={{ background: "#faf8f5", padding: "56px 16px", textAlign: "center", borderTop: "1px solid #ede8e0" }}>
        <h2 className="serif" style={{ fontSize: 22, fontWeight: 400, color: "#1a1612", letterSpacing: ".06em", marginBottom: 8 }}>Seguinos en Instagram</h2>
        <p className="si" style={{ fontSize: 15, color: "#a09890", marginBottom: 24 }}>Descubri nuestras novedades y colecciones</p>
        <a href="https://instagram.com/mallette_carteras" target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#833ab4,#fd1d1d,#f77737)", color: "#fff", padding: "14px 28px", borderRadius: 100, fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", boxShadow: "0 4px 20px rgba(253,29,29,.25)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          @mallette_carteras
        </a>
      </div>

      <FAQ />
      <Cuidados />

      {detail && <Modal p={detail} onClose={() => setDetail(null)} onAdd={onAdd} onZoom={img => setFsImg(img)} />}
      {fsImg && <div className="fso" onClick={() => setFsImg(null)}><img src={fsImg} className="fsi" alt="" /><button className="fsc" onClick={() => setFsImg(null)}>x</button></div>}
    </>
  );
}

function AdminLogin({ onLogin }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf8f5", padding: 16 }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 380,
        border: "1px solid #ede8e0",
        boxShadow: "0 20px 60px rgba(0,0,0,.08)",
        textAlign: "center",
        animation: "fU .4s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontFamily: "'Cormorant SC',serif", fontSize: 22, letterSpacing: ".2em", color: "#1a1612", marginBottom: 6 }}>MALLETTE</p>
          <p style={{ fontSize: 13, color: "#a09890" }}>Panel de administración</p>
          <div style={{ width: 32, height: 2, background: "#c9a96e", margin: "16px auto 0", borderRadius: 2 }} />
        </div>
        <p style={{ fontSize: 13, color: "#5c534a", lineHeight: 1.6, marginBottom: 24 }}>
          Para ingresar al panel de control, por favor inicia sesión utilizando tu cuenta de Google autorizada.
        </p>
        <button onClick={onLogin} className="bdk" style={{ width: "100%", padding: "13px", fontSize: 13, letterSpacing: ".08em", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.829-6.357-6.315s2.847-6.314 6.357-6.314c1.587 0 3.03.585 4.14 1.543l3.12-3.09C19.23 2.58 15.93 1.5 12.24 1.5 6.36 1.5 1.5 6.208 1.5 12s4.86 10.5 10.74 10.5c6.14 0 10.21-4.226 10.21-10.214 0-.616-.06-1.2-.17-1.785H12.24z" />
          </svg>
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}

function AdminAccessDenied({ email, onLogout, onGoShop }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf8f5", padding: 16 }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 420,
        border: "1px solid #fca5a5",
        boxShadow: "0 20px 60px rgba(220,38,38,.05)",
        textAlign: "center",
        animation: "fU .4s ease"
      }}>
        <div style={{ width: 48, height: 48, background: "#fef2f2", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 20px", fontWeight: "bold" }}>!</div>
        <h2 className="serif" style={{ fontSize: 20, color: "#1a1612", marginBottom: 12 }}>Acceso Restringido</h2>
        <p style={{ fontSize: 13, color: "#78716c", lineHeight: 1.6, marginBottom: 24 }}>
          El panel de administración es de uso exclusivo. Tu cuenta actual (<strong>{email}</strong>) no tiene permisos de acceso.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onGoShop} className="bdk" style={{ width: "100%", padding: "12px", fontSize: 13 }}>
            Volver a la Tienda
          </button>
          <button onClick={onLogout} className="bol" style={{ width: "100%", padding: "11px", fontSize: 13 }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin({ dbProducts, onUpdateStock, onUpdatePrice }) {
  const [tab, setTab] = useState("stock");
  
  const ts = dbProducts.reduce((s, p) => s + p.stock, 0);
  const lo = dbProducts.filter(p => p.stock > 0 && p.stock <= 3).length;
  const no = dbProducts.filter(p => p.stock === 0).length;
  const tv = dbProducts.reduce((s, p) => s + Number(p.precio) * p.stock, 0);

  return (
    <div style={{ maxWidth: "100%", padding: "32px 16px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="serif" style={{ fontSize: 24, fontWeight: 400 }}>Panel de Administracion</h2>
        <p style={{ fontSize: 13, color: "#a09890", marginTop: 4 }}>MALLETTE - Catalogo y stock</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Modelos", v: dbProducts.length, i: "[ ]" },
          { l: "Unidades", v: ts, i: "##" },
          { l: "Valor en stock", v: fmt(tv), i: "$", sm: true },
          { l: "Stock bajo", v: lo, i: "!", w: lo > 0 },
          { l: "Sin stock", v: no, i: "x", w: no > 0 }
        ].map(s => (
          <div key={s.l} style={{ background: "#fff", border: "1px solid " + (s.w ? "#fcd34d" : "#ede8e0"), borderLeft: "3px solid " + (s.w ? "#c9a96e" : "#ede8e0"), borderRadius: 14, padding: "16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6, color: "#c9a96e", fontWeight: 700 }}>{s.i}</div>
            <div className="serif" style={{ fontSize: s.sm ? 14 : 22 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#a09890", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["stock", "prices"].map(t => <button key={t} className={"ch " + (tab === t ? "con" : "cof")} onClick={() => setTab(t)}>{t === "stock" ? "Control de Stock" : "Editar Precios"}</button>)}
      </div>
      {tab === "stock" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {COLS.map(col => {
            const colItems = dbProducts.filter(p => getCollectionId(p.coleccion) === col.id);
            if (colItems.length === 0) return null;
            return (
              <div key={col.id}>
                <p style={{ fontSize: 11, color: "#c9a96e", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8, marginTop: 6 }}>{col.name}</p>
                {colItems.map(p => {
                  let imgUrl = "";
                  if (Array.isArray(p.images_url) && p.images_url.length > 0) {
                    imgUrl = p.images_url[0];
                  } else if (typeof p.images_url === "string") {
                    try { imgUrl = JSON.parse(p.images_url)[0]; } catch(e) { imgUrl = p.images_url; }
                  }
                  if (!imgUrl) imgUrl = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop";
                  return (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", border: "1px solid " + (p.stock === 0 ? "#fca5a5" : p.stock <= 3 ? "#fcd34d" : "#ede8e0"), display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 42, height: 46, borderRadius: 7, overflow: "hidden", background: "#f7f3ee", flexShrink: 0 }}>
                        <img src={imgUrl} alt={p.modelo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, fontSize: 13 }}>{p.modelo} {p.variantes_de_color !== "Único" ? `(${p.variantes_de_color})` : ""}</p>
                        <p style={{ fontSize: 11, color: "#c9a96e" }}>{fmt(p.precio)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <button onClick={() => onUpdateStock(p.id, -1)} style={{ width: 28, height: 28, border: "1px solid #ddd8d0", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                        <span style={{ width: 24, textAlign: "center", fontWeight: 700, fontSize: 15 }}>{p.stock}</span>
                        <button onClick={() => onUpdateStock(p.id, 1)} className="bdk" style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, padding: 0 }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {tab === "prices" && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ede8e0", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table className="at" style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
            <thead><tr><th>Modelo / Variante</th><th>Precio actual</th><th>Nuevo precio</th></tr></thead>
            <tbody>
              {dbProducts.map(p => {
                let imgUrl = "";
                if (Array.isArray(p.images_url) && p.images_url.length > 0) {
                  imgUrl = p.images_url[0];
                } else if (typeof p.images_url === "string") {
                  try { imgUrl = JSON.parse(p.images_url)[0]; } catch(e) { imgUrl = p.images_url; }
                }
                if (!imgUrl) imgUrl = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop";
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 40, borderRadius: 6, overflow: "hidden", background: "#f7f3ee", flexShrink: 0 }}>
                          <img src={imgUrl} alt={p.modelo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{p.modelo} {p.variantes_de_color !== "Único" ? `(${p.variantes_de_color})` : ""}</span>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{fmt(p.precio)}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#a09890", fontSize: 13 }}>$</span>
                        <input 
                          type="number" 
                          defaultValue={p.precio} 
                          onBlur={e => onUpdatePrice(p.id, e.target.value)} 
                          style={{ width: 110, padding: "6px 10px", border: "1px solid #ddd8d0", borderRadius: 8, fontFamily: "Inter,sans-serif", fontSize: 13, background: "#fff", outline: "none", color: "#1a1612" }} 
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("shop");
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      setDbProducts(data || []);
      setLoadError(null);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setLoadError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setView("shop");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err.message);
      alert("Error al iniciar sesión con Google: " + err.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setView("shop");
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
    }
  };

  const updateStock = async (id, d) => {
    const item = dbProducts.find(p => p.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + d);
    setDbProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    try {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Error actualizando stock en Supabase:", err);
      fetchProducts();
    }
  };

  const updatePrice = async (id, val) => {
    const newPrice = Math.round(Number(val));
    setDbProducts(prev => prev.map(p => p.id === id ? { ...p, precio: newPrice } : p));
    try {
      const { error } = await supabase.from("products").update({ precio: newPrice }).eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Error actualizando precio en Supabase:", err);
      fetchProducts();
    }
  };

  const add = (product, variant) => {
    const img = variant.imgs[0];
    const vc = variant.c || "";
    const rowId = variant.id;
    setCart(prev => {
      const ex = prev.find(c => c.dbId === rowId);
      return ex
        ? prev.map(c => c.dbId === rowId ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { dbId: rowId, id: product.id, name: product.name, style: product.style, price: variant.price, img, vc, qty: 1 }];
    });
  };

  const groupedProducts = useMemo(() => groupProducts(dbProducts), [dbProducts]);
  const n = cart.reduce((s, c) => s + c.qty, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#faf8f5", gap: 16 }}>
        <p className="si" style={{ fontSize: 24, color: "#c9a96e" }}>Cargando catálogo...</p>
        <div style={{ width: 40, height: 3, background: "linear-gradient(90deg,#c9a96e,#e8c97a,#c9a96e)", backgroundSize: "200%", borderRadius: 2, animation: "shimmer 1.4s infinite" }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#faf8f5", padding: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #fca5a5", borderRadius: 16, padding: "32px", maxWidth: 500, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#dc2626", marginBottom: 12 }}>Error al conectar con Supabase</p>
          <p style={{ fontSize: 13, color: "#78716c", marginBottom: 16, lineHeight: 1.6 }}>No se pudieron cargar los productos. Revisá las políticas RLS en Supabase.</p>
          <code style={{ fontSize: 12, background: "#fef2f2", color: "#991b1b", padding: "8px 12px", borderRadius: 8, display: "block", wordBreak: "break-all" }}>{loadError}</code>
          <button onClick={fetchProducts} className="bdk" style={{ marginTop: 20, padding: "10px 24px", fontSize: 13 }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5" }}>
      <Hdr view={view} setView={setView} n={n} setShowCart={setShowCart} user={user} onLogin={loginWithGoogle} onLogout={logout} />
      {view === "shop" && <Shop products={groupedProducts} onAdd={add} />}
      {view === "admin" && (
        user
          ? (user.email === "juancruzgalloloreti@gmail.com"
              ? <Admin dbProducts={dbProducts} onUpdateStock={updateStock} onUpdatePrice={updatePrice} />
              : <AdminAccessDenied email={user.email} onLogout={logout} onGoShop={() => setView("shop")} />)
          : <AdminLogin onLogin={loginWithGoogle} />
      )}
      {showCart && <CartDrawer cart={cart} setCart={setCart} onClose={() => setShowCart(false)} />}

      {/* Botón flotante de Carrito en móvil */}
      {n > 0 && (
        <button className="float-cart" onClick={() => setShowCart(true)}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "#c9a96e",
            color: "#1a1612",
            fontSize: 11,
            fontWeight: 700,
            width: 20,
            height: 20,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}>{n}</span>
        </button>
      )}

      {view === "shop" && (
        <footer className="site-footer">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 40, marginBottom: 48 }}>
              <div>
                <p style={{ fontFamily: "'Cormorant SC',serif", fontSize: 22, color: "#faf8f5", letterSpacing: ".2em", marginBottom: 14 }}>MALLETTE</p>
                <p style={{ fontSize: 13, color: "#7a6f64", lineHeight: 1.8 }}>Diseno, moda y elegancia para acompañarte en cada momento.</p>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <a href="https://instagram.com/mallette_carteras" target="_blank" rel="noreferrer"
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#833ab4,#fd1d1d,#f77737)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  </a>
                  <a href={"https://wa.me/" + WA} target="_blank" rel="noreferrer"
                    style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <WI s={16} f="#fff" />
                  </a>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#c9a96e", fontWeight: 500, marginBottom: 16 }}>Contacto</p>
                {[
                  { icon: "@", t: "mallettecarteras@gmail.com", href: "mailto:mallettecarteras@gmail.com" },
                  { icon: "T", t: "11 5602-3250", href: "https://wa.me/" + WA },
                  { icon: "O", t: "Buenos Aires, Argentina", href: null },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ color: "#c9a96e", fontSize: 12, marginTop: 2, flexShrink: 0, fontWeight: 700 }}>{c.icon}</span>
                    {c.href
                      ? <a href={c.href} style={{ fontSize: 13, color: "#a09890", textDecoration: "none" }}>{c.t}</a>
                      : <span style={{ fontSize: 13, color: "#a09890" }}>{c.t}</span>
                    }
                  </div>
                ))}
              </div>

              <div>
                <p style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#c9a96e", fontWeight: 500, marginBottom: 16 }}>Informacion</p>
                {["Sobre Mallette", "Preguntas frecuentes", "Cuidados del producto", "Cambios y devoluciones", "Contacto"].map((link, i) => (
                  <p key={i} style={{ fontSize: 13, color: "#7a6f64", marginBottom: 10, cursor: "default" }}>{link}</p>
                ))}
              </div>

              <div>
                <p style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#c9a96e", fontWeight: 500, marginBottom: 16 }}>Redes sociales</p>
                <a href="https://instagram.com/mallette_carteras" target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#a09890", textDecoration: "none", fontSize: 13, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  @mallette_carteras
                </a>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #2a1f18", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <p style={{ fontSize: 11, color: "#4a3f36", letterSpacing: ".06em" }}>&copy; 2025 MALLETTE. Todos los derechos reservados.</p>
              <p style={{ fontSize: 11, color: "#4a3f36" }}>Buenos Aires, Argentina</p>
            </div>
          </div>
        </footer>
      )}
      <WAF />
    </div>
  );
}
