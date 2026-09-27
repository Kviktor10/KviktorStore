const clone = value => JSON.parse(JSON.stringify(value));

export class LocalStorageRepository {
  constructor(key, defaultValue){ this.key=key; this.defaultValue=defaultValue; }
  get(){
    try{
      const raw=localStorage.getItem(this.key);
      return raw === null ? clone(this.defaultValue) : JSON.parse(raw);
    }catch(error){ console.warn(`Falha ao ler ${this.key}`,error); return clone(this.defaultValue); }
  }
  set(value){ localStorage.setItem(this.key, JSON.stringify(value)); return value; }
  update(mutator){ const current=this.get(); const next=mutator(current) ?? current; return this.set(next); }
  remove(){ localStorage.removeItem(this.key); }
}
