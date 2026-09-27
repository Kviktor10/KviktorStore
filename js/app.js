import {AppController} from './controllers/AppController.js';

const controller=new AppController();
controller.init().catch(error=>{
  console.error(error);
  document.getElementById('app').innerHTML='<section class="panel"><h1>Erro ao iniciar</h1><p>Não foi possível carregar a aplicação local.</p></section>';
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Service Worker:',err)));
}
