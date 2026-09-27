import {EventBus} from '../utils/EventBus.js';
import {LocalStorageRepository} from '../repositories/LocalStorageRepository.js';
import {AppModel} from '../models/AppModel.js';
import {CartService} from '../services/CartService.js';
import {CheckoutService} from '../services/CheckoutService.js';
import {AudioService} from '../services/AudioService.js';
import {HomeView} from '../views/HomeView.js';
import {CartView} from '../views/CartView.js';
import {CheckoutView} from '../views/CheckoutView.js';
import {OrdersView} from '../views/OrdersView.js';
import {RecordingsView} from '../views/RecordingsView.js';
import {SettingsView} from '../views/SettingsView.js';
import {ModalView} from '../views/ModalView.js';
import {BRL,escapeHtml} from '../utils/helpers.js';

export class AppController{
  constructor(){
    this.bus=new EventBus();this.model=new AppModel(this.bus);this.cart=new CartService(this.model,this.bus);this.checkout=new CheckoutService(this.model,this.cart,this.bus);this.audio=new AudioService(this.bus);
    this.homeState={search:'',category:'Todos'};this.checkoutState={shipping:this.model.settings().defaultShipping,paymentMethod:'pix',coupon:''};this.route='home';this.modal=new ModalView();
    this.app=document.getElementById('app');
    this.views={home:new HomeView(this.model,this.cart,{onSearch:q=>this.setHome({search:q}),onCategory:c=>this.setHome({category:c}),onAdd:id=>this.addToCart(id)}),cart:new CartView(this.cart,{onContinue:()=>this.go('home'),onCheckout:()=>this.go('checkout'),onQty:(id,d)=>this.changeQty(id,d),onRemove:id=>this.removeCart(id)}),checkout:new CheckoutView(this.model,this.cart,this.checkout,{onState:(s,rerender)=>{this.checkoutState=s;if(rerender)this.render();else this.refreshCheckoutQuote()} ,onBack:()=>this.go('cart'),onSubmit:s=>this.finalize(s)}),orders:new OrdersView(this.model,{onShop:()=>this.go('home'),onDetail:id=>this.detailOrder(id),onRepeat:id=>this.repeatOrder(id)}),recordings:new RecordingsView(this.audio),settings:new SettingsView(this.model,{onSave:s=>this.saveSettings(s),onExport:()=>this.exportBackup(),onClear:()=>this.clearBusinessData()})};
    this.bindGlobal();
  }
  async init(){await this.audio.init();this.bus.on('cart:changed',()=>this.updateCartBadge());this.bus.on('order:created',order=>this.showOrderSuccess(order));this.bus.on('audio:state',s=>this.updateRecordUi(s));this.bus.on('audio:timer',s=>document.getElementById('recordTimer').textContent=this.formatTime(s));this.bus.on('audio:saved',()=>{this.toast('Gravação salva localmente.');this.updateRecordUi('inactive');if(this.route==='recordings')this.render();});this.bus.on('audio:error',()=>this.toast('Ocorreu um erro no gravador.'));this.updateCartBadge();await this.render();}
  bindGlobal(){
    document.getElementById('brandBtn').onclick=()=>this.go('home');document.getElementById('cartBtn').onclick=()=>this.go('cart');document.getElementById('menuBtn').onclick=()=>this.drawer(true);document.getElementById('closeDrawer').onclick=()=>this.drawer(false);document.getElementById('backdrop').onclick=()=>this.drawer(false);
    document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{this.go(b.dataset.route);this.drawer(false)});
    document.getElementById('recordFab').onclick=()=>this.toggleRecording();
    window.addEventListener('hashchange',()=>{const route=location.hash.replace('#/','')||'home';if(['home','cart','checkout','orders','recordings','settings'].includes(route)){this.route=route;this.render();}});
  }
  async go(route){this.route=route;history.replaceState(null,'',`#/${route}`);await this.render();}
  setHome(patch){this.homeState={...this.homeState,...patch};this.render();}
  async render(){
    if(this.route==='home'){this.app.innerHTML=this.views.home.render(this.homeState);this.views.home.bind(this.app);}
    if(this.route==='cart'){this.app.innerHTML=this.views.cart.render();this.views.cart.bind(this.app);}
    if(this.route==='checkout'){if(this.cart.lines().length===0){this.go('cart');return;}this.app.innerHTML=this.views.checkout.render(this.checkoutState);this.views.checkout.bind(this.app,this.checkoutState);}
    if(this.route==='orders'){this.app.innerHTML=this.views.orders.render();this.views.orders.bind(this.app);}
    if(this.route==='recordings'){this.app.innerHTML=await this.views.recordings.render();this.views.recordings.bind(this.app,{onDelete:id=>this.deleteRecording(id)});this.startRecordingMeterPreview();}
    if(this.route==='settings'){this.app.innerHTML=this.views.settings.render();this.views.settings.bind(this.app);}
    this.updateCartBadge();
  }
  refreshCheckoutQuote(){const panel=this.app.querySelector('.panel:last-child');if(this.route==='checkout'&&panel){const fresh=this.views.checkout.render(this.checkoutState);this.app.innerHTML=fresh;this.views.checkout.bind(this.app,this.checkoutState);}}
  addToCart(id){try{this.cart.add(id);this.toast('Produto adicionado ao carrinho.');}catch(e){this.toast(e.message);}}
  changeQty(id,delta){try{const current=this.cart.lines().find(l=>l.product.id===id)?.quantity||0;this.cart.quantity(id,current+delta);this.render();}catch(e){this.toast(e.message);}}
  removeCart(id){this.cart.remove(id);this.toast('Produto removido.');this.render();}
  updateCartBadge(){const badge=document.getElementById('cartBadge');badge.textContent=this.cart.count();badge.style.display=this.cart.count()?'inline-block':'none';}
  finalize(state){try{this.model.saveCustomer(state.customer);const order=this.checkout.finalize(state);this.checkoutState={...this.checkoutState,coupon:'',shipping:this.model.settings().defaultShipping};}catch(e){this.toast(e.message);}}
  showOrderSuccess(order){
    this.modal.show(`<div class="success-box"><div class="modal-head"><h3>Pedido confirmado</h3><button class="icon-btn" data-close>✕</button></div><p>Seu pedido <strong class="mono">${escapeHtml(order.number)}</strong> foi registrado localmente.</p><p>${escapeHtml(order.payment.instruction)}</p><p>Total: <strong>${BRL(order.quote.total)}</strong></p><button class="primary-btn" data-view-orders>Ver meus pedidos</button></div>`);
    document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>this.modal.close());document.querySelector('[data-view-orders]').onclick=()=>{this.modal.close();this.go('orders');};
  }
  detailOrder(id){const order=this.model.orders.all().find(o=>o.id===id);if(!order)return;this.modal.show(this.modal.order(order));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>this.modal.close());}
  repeatOrder(id){const order=this.model.orders.all().find(o=>o.id===id);if(!order)return;let added=0;for(const item of order.items){try{this.cart.add(item.productId,item.quantity);added+=item.quantity;}catch(e){this.toast(e.message)}}this.toast(`${added} item(ns) adicionados novamente.`);this.go('cart');}
  async toggleRecording(){
    try{
      if(this.audio.isRecording()){this.audio.stop();return;}
      if(!window.isSecureContext && location.hostname!=='localhost') throw new Error('O microfone exige HTTPS ou localhost.');
      await this.audio.start(level=>this.setMicLevel(level));
      this.toast('Gravação iniciada. O microfone está ativo.');
    }catch(e){this.toast(e.message||'Não foi possível acessar o microfone.');}
  }
  updateRecordUi(state){const fab=document.getElementById('recordFab'),pill=document.getElementById('recordPill'),text=document.getElementById('recordPillText');const active=state==='recording'||state==='paused';fab.classList.toggle('recording',active);fab.textContent=state==='paused'?'▶️':active?'⏹️':'🎙️';fab.setAttribute('aria-label',active?'Parar gravação':'Iniciar gravação');pill.hidden=!active;if(state==='paused')text.textContent='Gravação pausada';else text.textContent='Microfone ativo';}
  setMicLevel(level){const meter=document.getElementById('micMeter');if(meter)meter.style.width=`${level}%`;}
  startRecordingMeterPreview(){
    // O medidor da página de gravações é ativado somente com autorização explícita.
    this.setMicLevel(0);
  }
  deleteRecording(id){this.audio.remove(id).then(()=>{this.toast('Gravação excluída.');this.render();}).catch(()=>this.toast('Não foi possível excluir.'));}
  saveSettings(s){this.model.saveSettings(s);this.checkoutState.shipping=s.defaultShipping;this.toast('Preferências salvas.');}
  exportBackup(){const data={version:3,exportedAt:new Date().toISOString(),cart:this.model.cart.getItems(),customer:this.model.customer(),orders:this.model.orders.all(),settings:this.model.settings(),products:this.model.products()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`shopflow-backup-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);}
  clearBusinessData(){if(!confirm('Limpar carrinho, cliente, pedidos e preferências? As gravações de áudio não serão apagadas.'))return;['shopflow.cart','shopflow.customer','shopflow.orders','shopflow.settings'].forEach(k=>localStorage.removeItem(k));location.reload();}
  drawer(open){document.getElementById('drawer').classList.toggle('open',open);document.getElementById('drawer').setAttribute('aria-hidden',String(!open));document.getElementById('backdrop').classList.toggle('hidden',!open);}
  toast(message){const root=document.getElementById('toastRoot');const el=document.createElement('div');el.className='toast';el.textContent=message;root.appendChild(el);setTimeout(()=>el.remove(),3200);}
  formatTime(total){const m=String(Math.floor(total/60)).padStart(2,'0'),s=String(total%60).padStart(2,'0');return `${m}:${s}`;}
}
