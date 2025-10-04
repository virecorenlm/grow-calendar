import React from 'react'
import Card from '../components/Card.jsx'
import { db, initData } from '../lib/db.js'
export default function Logs(){
  const [data,setData]=React.useState(initData())
  const [form,setForm]=React.useState({type:'feed',text:'',plantId:''})
  function add(e){ e.preventDefault()
    const entry={ id:crypto.randomUUID(), at:new Date().toISOString(), ...form }
    const next={...data, logs:[...data.logs, entry]}
    db.save(next); setData(next); setForm({type:'feed',text:'',plantId:''})
  }
  function remove(id){ const next={...data, logs:data.logs.filter(l=>l.id!==id)}; db.save(next); setData(next) }
  return (<div>
    <Card title="Add Log Entry">
      <form onSubmit={add} style={{display:'grid',gap:8,maxWidth:520}}>
        <label>Type:
          <select value={form.type} onChange={e=>setForm(s=>({...s,type:e.target.value}))}>
            <option value="feed">Feed</option><option value="water">Water</option>
            <option value="ph">pH</option><option value="ec">EC</option>
            <option value="note">Note</option><option value="deficiency">Deficiency</option>
            <option value="training">Training</option>
          </select>
        </label>
        <label>Plant:
          <select value={form.plantId} onChange={e=>setForm(s=>({...s,plantId:e.target.value}))}>
            <option value="">(all)</option>
            {data.plants.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <textarea required placeholder="Details..." value={form.text} onChange={e=>setForm(s=>({...s,text:e.target.value}))}/>
        <button>Add Log</button>
      </form>
    </Card>
    <Card title="Log History">
      {data.logs.length===0 && <p>No logs yet.</p>}
      {data.logs.slice().reverse().map(l=>(<div key={l.id} style={{borderBottom:'1px solid #eee',padding:'8px 0'}}>
        <div style={{fontSize:12,opacity:.7}}>{new Date(l.at).toLocaleString()} • {l.type}</div>
        <div>{l.text}</div>
        <button onClick={()=>remove(l.id)}>Delete</button>
      </div>))}
    </Card>
  </div>)
}
