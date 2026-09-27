import {BRL,escapeHtml,debounce} from '../utils/helpers.js';
export class HomeView {
  constructor(model,cartService,handlers){this.model=model;this.cart=cartService;this.handlers=handlers;}
  render(state={search:'',category:'Todos'}){
    const cats=['Todos',...this.model.categories()];
    const q=String(state.search||'').toLowerCase();
    const products=this.model.products().filter(p=>(state.category==='Todos'||p.category===state.category)&&(!q||`${p.name} ${p.category}`.toLowerCase().includes(q)));
    const orders=this.model.orders.all();
    const revenue=orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.quote.total||0),0);
    const lowStock=this.model.products().filter(p=>p.stock<=5).length;
    return `<section class="hero"><div><span class="eyebrow">LOJA LOCAL-FIRST</span><h1>Compre, finalize e acompanhe seu pedido.</h1><p>Catálogo salvo no próprio navegador, sem depender de servidor para o fluxo de demonstração.</p><button class="primary-btn" data-action="scroll-products">Ver produtos</button></div><div class="hero-art">🛍️</div></section>
    <section class="section grid-2"><div class="panel"><div class="small muted">Vendas registradas</div><div class="product-price">${orders.length}</div><div class="small muted">Receita local: ${BRL(revenue)}</div></div><div class="panel"><div class="small muted">Estoque</div><div class="product-price">${lowStock}</div><div class="small muted">produto(s) com 5 ou menos unidades</div></div></section>
    <section class="section"><div class="searchbar"><input id="searchInput" value="${escapeHtml(state.search||'')}" placeholder="Buscar produto..."><button class="secondary-btn" data-action="clear-search">Limpar</button></div>
    <div class="chip-row section">${cats.map(c=>`<button class="chip ${c===state.category?'active':''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div></section>
    <section class="section" id="products"><div class="section-head"><h2>Produtos</h2><span>${products.length} item(ns)</span></div><div class="product-grid">${products.map(p=>this.productCard(p)).join('')}</div></section>`;
  }
  productCard(p){
    const stockClass=p.stock<=5?'low':'ok';
    return `<article class="card"><div class="thumb">${p.icon}</div><div class="card-body"><div class="small muted">${escapeHtml(p.category)}</div><div class="product-name">${escapeHtml(p.name)}</div><div class="product-price">${BRL(p.price)}</div><div class="stock ${stockClass}">${p.stock<=5?'Últimas unidades':'Em estoque'} · ${p.stock}</div><button class="buy-btn" data-add="${p.id}" ${p.stock<1?'disabled':''}>Adicionar ao carrinho</button></div></article>`;
  }
  bind(root){
    root.querySelector('[data-action="scroll-products"]')?.addEventListener('click',()=>root.querySelector('#products')?.scrollIntoView({behavior:'smooth'}));
    root.querySelector('[data-action="clear-search"]')?.addEventListener('click',()=>this.handlers.onSearch(''));
    root.querySelector('#searchInput')?.addEventListener('input',debounce(e=>this.handlers.onSearch(e.target.value),120));
    root.querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>this.handlers.onCategory(btn.dataset.category)));
    root.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>this.handlers.onAdd(btn.dataset.add)));
  }
}
