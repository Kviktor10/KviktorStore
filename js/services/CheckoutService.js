import {uid} from '../utils/helpers.js';
import {PaymentStrategyFactory} from '../strategies/PaymentStrategy.js';

export class CheckoutService {
  constructor(model,cartService,eventBus){this.model=model;this.cart=cartService;this.events=eventBus;}
  quote(shipping='standard',coupon=''){
    const subtotal=this.cart.subtotal();
    const code=String(coupon||'').trim().toUpperCase();
    let discount=0;
    if(code==='BEMVINDO10') discount=Math.min(subtotal*.10,50);
    if(code==='DESCONTO20') discount=Math.min(subtotal*.20,100);
    let shippingCost = shipping==='express' ? (subtotal>=300?19.9:29.9) : (subtotal>=199?0:14.9);
    if(code==='FRETEGRATIS') shippingCost=0;
    const total=Math.max(0,subtotal-discount+shippingCost);
    return {subtotal,discount,shippingCost,total,coupon:code};
  }
  validate(data){
    const required=['name','email','phone','address','number','city','zip'];
    const missing=required.filter(k=>!String(data[k]||'').trim());
    if(missing.length) throw new Error(`Preencha: ${missing.join(', ')}.`);
    if(!/^\S+@\S+\.\S+$/.test(data.email)) throw new Error('Informe um e-mail válido.');
    if(this.cart.lines().length===0) throw new Error('O carrinho está vazio.');
  }
  finalize({customer,shipping,paymentMethod,coupon}){
    this.validate(customer);
    const lines=this.cart.lines();
    for(const line of lines){ if(line.quantity>line.product.stock) throw new Error(`Estoque insuficiente para ${line.product.name}.`); }
    const quote=this.quote(shipping,coupon);
    const payment=PaymentStrategyFactory.create(paymentMethod).build(quote.total);
    const order={
      id:uid('ORD'), number:`SF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      createdAt:new Date().toISOString(), status:paymentMethod==='pix'?'paid':'pending',
      items:lines.map(l=>({productId:l.product.id,name:l.product.name,icon:l.product.icon,quantity:l.quantity,unitPrice:l.product.price})),
      customer:{...customer},shipping,payment,quote
    };
    this.model.orders.save(order);
    this.cart.clear();
    this.events.emit('order:created',order);
    return order;
  }
}
