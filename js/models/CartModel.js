export class CartModel {
  constructor(repo){ this.repo=repo; }
  getItems(){ return this.repo.get(); }
  add(productId, quantity=1){
    return this.repo.update(items=>{
      const line=items.find(x=>x.productId===productId);
      if(line) line.quantity += quantity;
      else items.push({productId,quantity});
      return items;
    });
  }
  setQuantity(productId, quantity){
    return this.repo.update(items=>items.map(x=>x.productId===productId ? {...x,quantity:Math.max(0,Math.floor(quantity))}:x).filter(x=>x.quantity>0));
  }
  remove(productId){ return this.repo.update(items=>items.filter(x=>x.productId!==productId)); }
  clear(){ this.repo.set([]); }
}
