import React from 'react'
import Card from '../components/Card.jsx'
import { db, initData } from '../lib/db.js'
export default function Plants(){
  const [data,setData]=React.useState(initData())
  const [form,setForm]=React.useState({name:'',strain:'',phase:'veg',week:1})
  function addPlant(e){ e.preventDefault()
    const p={ id:crypto.randomUUID(), ...form, week:Number(form.week) }
    const next={...data, plants:[...data.plants, p]}
    db.save(next); setData(next); setForm({name:'',strain:'',phase:'veg',week:1})
  }
  function remove(id){ const next={...data, plants:data.plants.filter(p=>p.id!==id)}; db.save(next); setData(next) }
  function bumpWeek(id,d){ const next={...data, plants:data.plants.map(p=>p.id===id?{...p,week:Math.max(1,p.week+d)}:p)}; db.save(next); setData(next) }
  function togglePhase(id){ const next={...data, plants:data.plants.map(p=>p.id===id?{...p,phase:p.phase==='veg'?'flower':'veg'}:p)}; db.save(next); setData(next) }
  return (<div>
    <Card title="Add Plant">
      <form onSubmit={addPlant} style={{display:'grid',gap:8,maxWidth:420}}>
        <input required placeholder="Name" value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))}/>
        <input placeholder="Strain" value={form.strain} onChange={e=>setForm(s=>({...s,strain:e.target.value}))}/>
        <label>Phase:
          <select value={form.phase} onChange={e=>setForm(s=>({...s,phase:e.target.value}))}>
            <option value="veg">Veg</option><option value="flower">Flower</option>
          </select>
        </label>
        <label>Week:<input type="number" min="1" max="20" value={form.week} onChange={e=>setForm(s=>({...s,week:e.target.value}))}/></label>
        <button>Add</button>
      </form>
    </Card>
    <Card title="Plants">
      {data.plants.length===0 && <p>No plants yet.</p>}
      {data.plants.map(p=>(<div key={p.id} style={{display:'flex',gap:8,alignItems:'center',borderBottom:'1px solid #eee',padding:'8px 0'}}>
        <div style={{flex:1}}><div><b>{p.name}</b> {p.strain && <>– {p.strain}</>}</div><div>Phase: <b>{p.phase}</b> • Week: <b>{p.week}</b></div></div>
        <button onClick={()=>bumpWeek(p.id,-1)}>- Week</button>
        <button onClick={()=>bumpWeek(p.id,1)}>+ Week</button>
        <button onClick={()=>togglePhase(p.id)}>Toggle Phase</button>
        <button onClick={()=>remove(p.id)}>Delete</button>
      </div>))}
    </Card>
  </div>)
}
