export class AudioRepository {
  constructor(dbName='shopflow-audio-v3', storeName='records'){
    this.dbName=dbName; this.storeName=storeName; this.db=null;
  }
  async open(){
    this.db = await new Promise((resolve,reject)=>{
      const request=indexedDB.open(this.dbName,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName,{keyPath:'id',autoIncrement:true});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    return this;
  }
  async add(record){
    const tx=this.db.transaction(this.storeName,'readwrite');
    tx.objectStore(this.storeName).add(record);
    return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  }
  async all(){
    return new Promise((resolve,reject)=>{
      const req=this.db.transaction(this.storeName,'readonly').objectStore(this.storeName).getAll();
      req.onsuccess=()=>resolve(req.result.sort((a,b)=>b.id-a.id));
      req.onerror=()=>reject(req.error);
    });
  }
  async remove(id){
    const tx=this.db.transaction(this.storeName,'readwrite'); tx.objectStore(this.storeName).delete(Number(id));
    return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  }
}
