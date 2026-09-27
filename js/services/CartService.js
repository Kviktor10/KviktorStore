export class CartService {
  constructor(model,eventBus){this.model=model;this.events=eventBus;}
  lines(){
    return this.model.cart.getItems().map(line=>{const product=this.model.product(line.productId);return product?{...line,product}:null;}).filter(Boolean);
  }
  add(productId, qty=1){
    const product=this.model.product(productId); if(!product) throw new Error('Produto não encontrado.');
    const current=this.model.cart.getItems().find(x=>x.productId===productId)?.quantity||0;
    if(current+qty>product.stock) throw new Error(`Estoque insuficiente para ${product.name}.`);
    this.model.cart.add(productId,qty); this.events.emit('cart:changed',this.lines());
  }
  quantity(productId,qty){
    const product=this.model.product(productId); if(!product) return;
    if(qty>product.stock) throw new Error('Quantidade superior ao estoque.');
    this.model.cart.setQuantity(productId,qty); this.events.emit('cart:changed',this.lines());
  }
  remove(productId){this.model.cart.remove(productId);this.events.emit('cart:changed',this.lines());}
  clear(){this.model.cart.clear();this.events.emit('cart:changed',[]);}
  count(){return this.lines().reduce((sum,line)=>sum+line.quantity,0);}
  subtotal(){return this.lines().reduce((sum,line)=>sum+line.product.price*line.quantity,0);}
}
