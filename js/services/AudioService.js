import {AudioRepository} from '../repositories/AudioRepository.js';
import {clamp} from '../utils/helpers.js';

export class AudioService{
  constructor(eventBus){this.events=eventBus;this.repo=new AudioRepository();this.stream=null;this.recorder=null;this.chunks=[];this.startedAt=0;this.timer=null;this.audioContext=null;this.analyser=null;this.levelData=null;this.onLevel=()=>{};}
  async init(){await this.repo.open();return this;}
  isRecording(){return !!this.recorder && ['recording','paused'].includes(this.recorder.state);}
  state(){return this.recorder?.state||'inactive';}
  async start(onLevel){
    if(this.isRecording()) return;
    if(!navigator.mediaDevices?.getUserMedia) throw new Error('O navegador não oferece acesso ao microfone por esta API.');
    this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    const choices=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
    const mime=choices.find(t=>window.MediaRecorder?.isTypeSupported?.(t));
    this.recorder=mime?new MediaRecorder(this.stream,{mimeType:mime}):new MediaRecorder(this.stream);
    this.chunks=[];this.startedAt=Date.now();this.onLevel=onLevel||(()=>{});
    this.recorder.ondataavailable=e=>{if(e.data?.size)this.chunks.push(e.data)};
    this.recorder.onerror=e=>this.events.emit('audio:error',e.error||e);
    this.recorder.onstop=async()=>{
      const duration=Math.round((Date.now()-this.startedAt)/1000);
      const blob=new Blob(this.chunks,{type:this.recorder.mimeType||this.chunks[0]?.type||'audio/webm'});
      if(blob.size>0) await this.repo.add({createdAt:new Date().toISOString(),duration,mimeType:blob.type,size:blob.size,blob});
      this.stopMeter();this.cleanup();this.events.emit('audio:saved');
    };
    this.recorder.start(250);
    this.startMeter();
    this.emitState();
    clearInterval(this.timer); this.timer=setInterval(()=>this.events.emit('audio:timer',Math.max(0,Math.floor((Date.now()-this.startedAt)/1000))),1000);
  }
  pauseResume(){if(!this.recorder)return;if(this.recorder.state==='recording')this.recorder.pause();else if(this.recorder.state==='paused')this.recorder.resume();this.emitState();}
  stop(){if(this.recorder&&this.recorder.state!=='inactive')this.recorder.stop();}
  async list(){return this.repo.all();}
  async remove(id){await this.repo.remove(id);this.events.emit('audio:changed');}
  emitState(){this.events.emit('audio:state',this.state());}
  startMeter(){
    try{
      this.audioContext=new (window.AudioContext||window.webkitAudioContext)();
      const source=this.audioContext.createMediaStreamSource(this.stream);this.analyser=this.audioContext.createAnalyser();this.analyser.fftSize=512;this.levelData=new Uint8Array(this.analyser.fftSize);source.connect(this.analyser);
      const tick=()=>{if(!this.analyser)return;this.analyser.getByteTimeDomainData(this.levelData);let sum=0;for(const v of this.levelData){const n=(v-128)/128;sum+=n*n;}const rms=Math.sqrt(sum/this.levelData.length);this.onLevel(clamp(Math.round(rms*400),0,100));this.levelFrame=requestAnimationFrame(tick);};tick();
    }catch(error){console.warn('Medidor indisponível',error);}
  }
  stopMeter(){if(this.levelFrame)cancelAnimationFrame(this.levelFrame);this.levelFrame=null;this.audioContext?.close().catch(()=>{});this.audioContext=null;this.analyser=null;this.levelData=null;this.onLevel(0);}
  cleanup(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;this.chunks=[];clearInterval(this.timer);this.timer=null;this.emitState();}
}
