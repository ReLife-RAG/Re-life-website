'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Wind, Heart, Footprints, Leaf, Waves, RefreshCw, X, CheckCircle, Clock, Award } from 'lucide-react';
import { GameProgress } from '@/types/games.types';

interface Props { progress:GameProgress; onUpdateProgress:(u:Partial<GameProgress>)=>Promise<void>; showToast:(m:string,t?:'success'|'error'|'info')=>void; }

type Phase = 'idle'|'inhale'|'hold'|'exhale'|'rest'|'done';
const CYCLE  = { inhale:4,hold:4,exhale:6,rest:2 };
const ROUNDS = 5;

const EXERCISES = [
  { id:'x1', Icon:Leaf,      name:'Body Scan',       desc:'Notice each part of your body without judgment.',  pts:20, mins:5  },
  { id:'x2', Icon:Waves,     name:'Ocean Breathing',  desc:'Breathe slowly like waves washing on the shore.',  pts:15, mins:3  },
  { id:'x3', Icon:Heart,     name:'Loving Kindness',  desc:'Send compassion to yourself and those you love.',  pts:25, mins:7  },
  { id:'x4', Icon:Footprints,name:'Mindful Walking',  desc:'Walk slowly, noticing each step and sensation.',   pts:20, mins:10 },
];

const getToday = () => new Date().toISOString().slice(0,10);
const accent   = '#0d7377';

const PHASE_COLOR: Record<Phase,string> = { idle:accent,inhale:'#0891b2',hold:'#7c3aed',exhale:accent,rest:'#d97706',done:'#16a34a' };
const PHASE_LABEL: Record<Phase,{main:string;sub:string}> = {
  idle:   { main:'Ready to begin', sub:'Press start to begin your session' },
  inhale: { main:'Breathe in',     sub:'Slow deep breath through your nose' },
  hold:   { main:'Hold',           sub:'Keep the breath, stay still' },
  exhale: { main:'Breathe out',    sub:'Slowly release through your mouth' },
  rest:   { main:'Rest',           sub:'Prepare for the next breath' },
  done:   { main:'Session complete',sub:'Well done — you finished 5 rounds' },
};

export default function MindfulGame({ progress, onUpdateProgress, showToast }: Props) {
  const saved  = progress.mindfulData??({} as any);
  const [rounds,   setRounds]   = useState<number>(saved.roundsCompleted??0);
  const [exDone,   setExDone]   = useState<string[]>(saved.exercisesDoneToday??[]);
  const [sessions, setSessions] = useState<number>(saved.totalSessions??0);
  const [phase,    setPhase]    = useState<Phase>('idle');
  const [tick,     setTick]     = useState(0);
  const [round,    setRound]    = useState(0);
  const [exBusy,   setExBusy]   = useState<string|null>(null);

  const iv = useRef<ReturnType<typeof setInterval>|null>(null);
  const phRef=useRef<Phase>('idle'), tkRef=useRef(0), rdRef=useRef(0);
  useEffect(()=>{ phRef.current=phase; },[phase]);
  useEffect(()=>{ tkRef.current=tick; },[tick]);
  useEffect(()=>{ rdRef.current=round; },[round]);
  useEffect(()=>()=>{ if(iv.current) clearInterval(iv.current); },[]);

  const newDay  = saved.lastSessionDate!==getToday();
  const exToday = newDay?[]:exDone;

  function startBreathing() {
    setPhase('inhale'); setTick(CYCLE.inhale); setRound(1);
    iv.current=setInterval(()=>{
      setTick(prev=>{
        if(prev>1) return prev-1;
        const p=phRef.current, r=rdRef.current;
        if(p==='inhale'){ setPhase('hold');   return CYCLE.hold; }
        if(p==='hold')  { setPhase('exhale'); return CYCLE.exhale; }
        if(p==='exhale'){
          if(r>=ROUNDS){
            clearInterval(iv.current!); iv.current=null; setPhase('done');
            const nr=rounds+ROUNDS, ns=sessions+1; setRounds(nr); setSessions(ns);
            onUpdateProgress({ mindfulData:{ roundsCompleted:nr,totalSessions:ns,lastSessionDate:getToday(),exercisesDoneToday:exDone }, totalPoints:(progress.totalPoints??0)+30, currentStreak:(progress.currentStreak??0)+1, lastPlayed:new Date().toISOString() } as any).catch(()=>{});
            showToast('Session complete — +30 pts','success');
            return 0;
          }
          setRound(r=>r+1); setPhase('rest'); return CYCLE.rest;
        }
        if(p==='rest'){ setPhase('inhale'); return CYCLE.inhale; }
        return prev;
      });
    },1000);
  }

  function stopBreathing() { if(iv.current){ clearInterval(iv.current); iv.current=null; } setPhase('idle'); setTick(0); setRound(0); }

  async function doExercise(ex:typeof EXERCISES[0]) {
    if(exBusy||exToday.includes(ex.id)) return;
    setExBusy(ex.id);
    try {
      const updated=[...exToday,ex.id]; setExDone(updated);
      await onUpdateProgress({ mindfulData:{ roundsCompleted:rounds,totalSessions:sessions,lastSessionDate:getToday(),exercisesDoneToday:updated }, totalPoints:(progress.totalPoints??0)+ex.pts, lastPlayed:new Date().toISOString() } as any);
      showToast(`${ex.name} complete — +${ex.pts} pts`,'success');
    } catch { showToast('Save failed','error'); }
    finally { setExBusy(null); }
  }

  const maxTick  = phase==='inhale'?CYCLE.inhale:phase==='hold'?CYCLE.hold:phase==='exhale'?CYCLE.exhale:CYCLE.rest;
  const ringPct  = (phase==='idle'||phase==='done')?0:(maxTick-tick)/maxTick;
  const ringScale= phase==='inhale'?0.4+ringPct*0.6:phase==='exhale'?1-ringPct*0.6:phase==='hold'?1:0.4;
  const pc = PHASE_COLOR[phase];
  const pl = PHASE_LABEL[phase];

  // SVG ring
  const R=68, C=2*Math.PI*R;
  const sessionPct=Math.min((round-1)/ROUNDS,1);

  return (
    <div style={{ maxWidth:540,margin:'0 auto',fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14 }}>
        {[
          { Icon:Wind,  value:rounds,    label:'Rounds Done' },
          { Icon:Award, value:sessions,  label:'Sessions'    },
          { Icon:CheckCircle, value:`${progress.totalPoints??0} pts`, label:'Points' },
        ].map((s,i)=>(
          <div key={i} style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:16,padding:'16px 12px',textAlign:'center',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
            <div style={{ display:'flex',justifyContent:'center',marginBottom:8 }}>
              <s.Icon size={20} strokeWidth={1.8} color={accent}/>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d',marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:11,color:'#7a8f86',fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Breathing */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderTop:`3px solid ${accent}`,borderRadius:20,padding:'28px',marginBottom:14,boxShadow:'0 4px 16px rgba(10,15,13,.06)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0a0f0d' }}>Box Breathing</p>
          {round>0&&phase!=='done'&&<span style={{ fontSize:12,fontWeight:600,color:accent,background:`${accent}12`,padding:'3px 12px',borderRadius:999 }}>Round {round} of {ROUNDS}</span>}
        </div>

        {/* Circle with SVG progress ring + Wind icon centre */}
        <div style={{ display:'flex',justifyContent:'center',marginBottom:20 }}>
          <div style={{ position:'relative',width:200,height:200 }}>
            <svg viewBox="0 0 200 200" style={{ position:'absolute',inset:0,width:200,height:200,transform:'rotate(-90deg)' }}>
              <circle cx={100} cy={100} r={R} fill="none" stroke="#f0f4f2" strokeWidth={10}/>
              {phase!=='idle'&&phase!=='done'&&(
                <circle cx={100} cy={100} r={R} fill="none" stroke={pc} strokeWidth={10}
                  strokeDasharray={C} strokeDashoffset={C*(1-(round-1)/ROUNDS + (1/ROUNDS)*(tick/maxTick))}
                  strokeLinecap="round" style={{ transition:'none' }}/>
              )}
            </svg>
            <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
              {/* Animated fill */}
              <div style={{ width:`${ringScale*160}px`,height:`${ringScale*160}px`,borderRadius:'50%',background:`${pc}15`,border:`2px solid ${pc}40`,transition:'all .8s ease-in-out',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6 }}>
                <Wind size={28} strokeWidth={1.5} color={pc}/>
                {phase!=='idle'&&phase!=='done'&&(
                  <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:pc,lineHeight:1 }}>{tick}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign:'center',fontSize:17,fontWeight:600,color:pc,marginBottom:4 }}>{pl.main}</p>
        <p style={{ textAlign:'center',fontSize:13,color:'#7a8f86',marginBottom:20 }}>{pl.sub}</p>

        {/* Phase strip */}
        {phase!=='idle'&&phase!=='done'&&(
          <div style={{ display:'flex',gap:6,marginBottom:20 }}>
            {(['inhale','hold','exhale','rest'] as Phase[]).map(p=>(
              <div key={p} style={{ flex:1,textAlign:'center' }}>
                <div style={{ height:4,borderRadius:999,background:phase===p?pc:'#e4ede8',marginBottom:4,transition:'background .3s' }}/>
                <span style={{ fontSize:10,color:phase===p?pc:'#9ca3af',fontWeight:phase===p?600:400,textTransform:'capitalize' }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {phase==='idle'||phase==='done'
          ? <button onClick={startBreathing}
              style={{ width:'100%',padding:14,borderRadius:14,border:'none',background:'#0a0f0d',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              <RefreshCw size={15} strokeWidth={2}/> {phase==='done'?'Start Another Session':'Start Breathing Session — +30 pts'}
            </button>
          : <button onClick={stopBreathing}
              style={{ width:'100%',padding:12,borderRadius:14,background:'#fef2f2',border:'1.5px solid #fca5a5',color:'#dc2626',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              <X size={14} strokeWidth={2}/> Stop Session
            </button>
        }
      </div>

      {/* Exercises */}
      <div style={{ background:'#fff',border:'1px solid #e4ede8',borderRadius:20,padding:'22px',boxShadow:'0 1px 4px rgba(10,15,13,.04)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <p style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#0a0f0d' }}>Mindfulness Exercises</p>
          <span style={{ fontSize:11,fontWeight:600,color:accent,background:`${accent}12`,padding:'3px 10px',borderRadius:999 }}>{exToday.length}/{EXERCISES.length} today</span>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {EXERCISES.map(ex=>{
            const done=exToday.includes(ex.id), busy=exBusy===ex.id;
            return (
              <button key={ex.id} onClick={()=>doExercise(ex)} disabled={done||!!exBusy}
                style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:14,border:`1.5px solid ${done?`${accent}40`:'#e4ede8'}`,background:done?`${accent}08`:'#fafafa',cursor:done?'default':exBusy?'wait':'pointer',textAlign:'left',transition:'all .2s',width:'100%' }}
                onMouseEnter={e=>{ if(!done&&!exBusy) e.currentTarget.style.background='#f7faf8'; }}
                onMouseLeave={e=>{ if(!done) e.currentTarget.style.background=done?`${accent}08`:'#fafafa'; }}>
                <div style={{ width:44,height:44,borderRadius:12,background:done?`${accent}15`:'#f0f4f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {busy ? <RefreshCw size={18} strokeWidth={2} color={accent}/> : <ex.Icon size={20} strokeWidth={1.8} color={done?accent:'#7a8f86'}/>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14,fontWeight:600,color:done?accent:'#0a0f0d',marginBottom:3 }}>{ex.name}</p>
                  <p style={{ fontSize:12,color:'#7a8f86' }}>{ex.desc}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:3,color:'#9ca3af' }}>
                    <Clock size={11} strokeWidth={2}/><span style={{ fontSize:11 }}>{ex.mins} min</span>
                  </div>
                </div>
                <span style={{ fontSize:12,fontWeight:600,color:done?accent:'#7a8f86',background:done?`${accent}12`:'#f0f4f2',padding:'4px 12px',borderRadius:999,flexShrink:0 }}>
                  {done?'Done':'+'+ex.pts+' pts'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
