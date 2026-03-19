'use client';
import React, { useState } from 'react';
import { LeaderboardEntry } from '@/types/games.types';

interface Props {
  leaderboard: LeaderboardEntry[];
  onShowPrivacy:(pts:string)=>void;
  showToast:(msg:string,type?:'success'|'error'|'info')=>void;
}

const AV_BG = [
  'linear-gradient(135deg,#c8e6d4,#a0d4b8)',
  'linear-gradient(135deg,#d4d8e8,#b8bcd8)',
  'linear-gradient(135deg,#e8d8c4,#d4b898)',
];
const MEDALS = ['🥇','🥈','🥉'];

function LbRow({ entry, i, onClick }: { entry:LeaderboardEntry; i:number; onClick:()=>void }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:'9px',marginBottom:'5px',padding:'8px 9px',borderRadius:'9px',cursor:'pointer',background:h?'#f4f6f5':'transparent',transition:'background .15s' }}>
      <div style={{ position:'relative',width:'34px',height:'34px',flexShrink:0 }}>
        <div style={{ width:'34px',height:'34px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:800,color:'#3a5a52',background:i<3?AV_BG[i]:'linear-gradient(135deg,#e2ebe6,#c8d8d0)' }}>
          U{i+1}
        </div>
        {i<3&&<span style={{ position:'absolute',bottom:'-3px',right:'-3px',fontSize:'12px',lineHeight:1 }}>{MEDALS[i]}</span>}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:'12.5px',fontWeight:600,color:'#1a2e26',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{entry.username}</div>
        <div style={{ fontSize:'10.5px',color:'#7a8f86',marginTop:'1px' }}>{entry.totalPoints.toLocaleString()} pts</div>
      </div>
      <span style={{ fontSize:'11px',color:'#7a8f86',opacity:.6 }}>🔒</span>
    </div>
  );
}

function ViewAll({ onClick }: { onClick:()=>void }) {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:'9px',padding:'7px 9px',borderRadius:'9px',cursor:'pointer',background:h?'#f4f6f5':'transparent',transition:'background .15s',marginTop:'3px' }}>
      <div style={{ width:'34px',height:'34px',borderRadius:'50%',background:'#f4f6f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#7a8f86',flexShrink:0 }}>+</div>
      <div style={{ fontSize:'12px',color:'#7a8f86' }}>View all rankings →</div>
    </div>
  );
}

export default function LeaderboardPanel({ leaderboard, onShowPrivacy, showToast }: Props) {
  return (
    <div style={{ background:'#fff',borderRadius:'14px',border:'1px solid #e2ebe6',padding:'16px 15px',marginBottom:'14px',boxShadow:'0 2px 12px rgba(60,100,80,.07)' }}>
      <div style={{ fontSize:'13px',fontWeight:700,color:'#1a2e26',marginBottom:'12px' }}>🏆 Leaderboard</div>
      {leaderboard.length===0
        ? <p style={{ fontSize:'12px',color:'#7a8f86' }}>No entries yet</p>
        : leaderboard.map((e,i)=>(
          <LbRow key={e._id} entry={e} i={i} onClick={()=>onShowPrivacy(e.totalPoints.toLocaleString())} />
        ))
      }
      <ViewAll onClick={()=>showToast('Full leaderboard coming soon!')} />
    </div>
  );
}