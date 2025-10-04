import React from 'react'
import Card from '../components/Card.jsx'
import { db, initData } from '../lib/db.js'
function WeekRow({num, items, nutrients}){
  return (<div style={{display:'flex',gap:8,alignItems:'flex-start',borderBottom:'1px solid #eee',padding:'8px 0'}}>
    <div style={{width:60}}>W{num}</div>
    <div style={{flex:1}}>
      {items.length===0? <em>Water / observe</em> : items.map((it,i)=>{
        const n=nutrients.find(n=>n.id===it.nutrient)
        return <div key={i}>{n? n.name: it.nutrient} – <b>{it.mlPerL} ml/L</b></div>
      })}
    </div>
  </div>)
}
export default function Schedule(){
  const [data,setData]=React.useState(initData())
  const tpl=data.scheduleTemplate
  const weeks=Array.from({length:(tpl.vegWeeks+tpl.flowerWeeks)},(_,i)=>i+1)
  function saveTemplate(){ const next={...data, scheduleTemplate:tpl}; db.save(next); setData(next) }
  function setValue(weekIdx,itemIdx,field,val){
    const w=tpl.weeks[weekIdx]||[]; const copy=w.map(x=>({...x})); copy[itemIdx][field]=field==='mlPerL'?Number(val):val
    tpl.weeks[weekIdx]=copy; saveTemplate()
  }
  function addItem(weekIdx){ const w=tpl.weeks[weekIdx]||[]; w.push({nutrient:'base-veg', mlPerL:1}); tpl.weeks[weekIdx]=w; saveTemplate() }
  return (<div>
    <Card title="Template Settings">
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <label>Veg Weeks: <input type="number" min="1" max="20" value={tpl.vegWeeks} onChange={e=>{tpl.vegWeeks=Number(e.target.value); saveTemplate()}}/></label>
        <label>Flower Weeks: <input type="number" min="1" max="20" value={tpl.flowerWeeks} onChange={e=>{tpl.flowerWeeks=Number(e.target.value); saveTemplate()}}/></label>
      </div>
    </Card>
    <Card title="Weekly Plan (Editable)">
      {weeks.map(num=>{ const items=tpl.weeks[num]||[]
        return (<div key={num} style={{marginBottom:8}}>
          <WeekRow num={num} items={items} nutrients={data.nutrients}/>
          <div style={{display:'grid',gap:6,marginLeft:60,marginBottom:8}}>
            {items.map((it,idx)=>(<div key={idx} style={{display:'flex',gap:8,alignItems:'center'}}>
              <select value={it.nutrient} onChange={e=>setValue(num,idx,'nutrient',e.target.value)}>
                {data.nutrients.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <input type="number" min="0" step="0.1" value={it.mlPerL} onChange={e=>setValue(num,idx,'mlPerL',e.target.value)}/> ml/L
            </div>))}
            <button onClick={()=>addItem(num)}>+ Add feed for W{num}</button>
          </div>
        </div>)
      })}
    </Card>
  </div>)
}
