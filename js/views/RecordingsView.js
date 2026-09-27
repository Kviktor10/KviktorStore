import {dateTime} from '../utils/helpers.js';
export class RecordingsView{
  constructor(audioService){this.audio=audioService;}
  async render(){
    const items=await this.audio.list();
    return `<section><h1 class="page-title">Gravações</h1><p class="page-subtitle">Áudios armazenados localmente no dispositivo.</p><div class="panel section"><div class="record-state"><span class="status-dot"></span><strong>Teste do microfone</strong></div><div class="small muted">Ao falar, o medidor deve reagir. O acesso depende da permissão do navegador.</div><div class="meter"><div id="micMeter"></div></div></div><div class="section record-list">${items.length?items.map(i=>this.record(i)).join(''):'<div class="panel muted">Nenhuma gravação salva.</div>'}</div></section>`;
  }
  record(i){return `<article class="record-card"><div><strong>Gravação #${i.id}</strong><div class="small muted">${dateTime(i.createdAt)} · ${format(i.duration)}</div></div><audio controls preload="metadata" src="${URL.createObjectURL(i.blob)}"></audio><div class="record-actions"><a class="secondary-btn" href="${URL.createObjectURL(i.blob)}" download="shopflow-${i.id}.webm">Salvar arquivo</a><button class="danger-btn" data-delete-record="${i.id}">Excluir</button></div></article>`;}
  bind(root,{onDelete}){root.querySelectorAll('[data-delete-record]').forEach(b=>b.addEventListener('click',()=>onDelete(Number(b.dataset.deleteRecord))));}
}
const format=s=>{s=Number(s)||0;return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
