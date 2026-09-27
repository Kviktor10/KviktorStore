export class OrderModel {
  constructor(repo){ this.repo=repo; }
  all(){ return this.repo.get(); }
  save(order){ return this.repo.update(orders=>[order,...orders]); }
  updateStatus(id,status){ return this.repo.update(orders=>orders.map(o=>o.id===id?{...o,status}:o)); }
}
