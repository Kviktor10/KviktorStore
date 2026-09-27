import {LocalStorageRepository} from '../repositories/LocalStorageRepository.js';
import {CartModel} from './CartModel.js';
import {OrderModel} from './OrderModel.js';

const PRODUCTS=[
 {id:'p001',name:'Fone Bluetooth Pro',category:'Áudio',price:129.90,stock:12,icon:'🎧',featured:true},
 {id:'p002',name:'Smartwatch Fit',category:'Tecnologia',price:189.90,stock:8,icon:'⌚',featured:true},
 {id:'p003',name:'Mochila Urbana',category:'Acessórios',price:99.90,stock:18,icon:'🎒',featured:true},
 {id:'p004',name:'Câmera Compacta',category:'Eletrônicos',price:349.90,stock:5,icon:'📷',featured:true},
 {id:'p005',name:'Caixa de Som',category:'Áudio',price:159.90,stock:11,icon:'🔊'},
 {id:'p006',name:'Luminária LED',category:'Casa',price:79.90,stock:20,icon:'💡'},
 {id:'p007',name:'Teclado Mecânico',category:'Informática',price:229.90,stock:7,icon:'⌨️'},
 {id:'p008',name:'Caneca Térmica',category:'Casa',price:69.90,stock:25,icon:'☕'},
 {id:'p009',name:'Mouse Sem Fio',category:'Informática',price:89.90,stock:14,icon:'🖱️'},
 {id:'p010',name:'Microfone USB',category:'Áudio',price:279.90,stock:6,icon:'🎤'}
];

export class AppModel {
  constructor(eventBus){
    this.events=eventBus;
    this.productRepo=new LocalStorageRepository('shopflow.products',PRODUCTS);
    this.cartRepo=new LocalStorageRepository('shopflow.cart',[]);
    this.orderRepo=new LocalStorageRepository('shopflow.orders',[]);
    this.customerRepo=new LocalStorageRepository('shopflow.customer',{name:'',email:'',phone:'',address:'',number:'',city:'',zip:''});
    this.settingsRepo=new LocalStorageRepository('shopflow.settings',{currency:'BRL',defaultShipping:'standard'});
    this.cart=new CartModel(this.cartRepo); this.orders=new OrderModel(this.orderRepo);
  }
  products(){ return this.productRepo.get(); }
  product(id){ return this.products().find(p=>p.id===id); }
  categories(){ return [...new Set(this.products().map(p=>p.category))].sort(); }
  customer(){ return this.customerRepo.get(); }
  saveCustomer(data){ this.customerRepo.set({...this.customer(),...data}); this.events.emit('customer:changed'); }
  settings(){ return this.settingsRepo.get(); }
  saveSettings(data){ this.settingsRepo.set({...this.settings(),...data}); this.events.emit('settings:changed'); }
}
