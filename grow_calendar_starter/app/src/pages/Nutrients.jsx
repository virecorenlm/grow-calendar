import React from 'react'
import Card from '../components/Card.jsx'
import { db, initData } from '../lib/db.js'
export default function Nutrients(){
  const [data,setData]=React.useState(initData())
  const [form,setForm]=React.useState({name:'',npk:'',notes:''})
  function add(e){ e.preventDefault()
    const n={ id:crypto.randomUUID(), ...form }
    const next={...data, nutrients:[...data.nutrients, n]}
    db.save(next); setData(next); setForm({name:'',npk:'',notes:''})
  }
  function remove(id){ const next={...data, nutrients:data.nutrients.filter(n=>n.id!==id)}; db.save(next); setData(next) }
  return (<div>
    <Card title="Add Nutrient">
      <form onSubmit={add} style={{display:'grid',gap:8,maxWidth:420}}>
        <input required placeholder="Name" value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))}/>
        <input placeholder="N-P-K (e.g., 3-1-2)" value={form.npk} onChange={e=>setForm(s=>({...s,npk:e.target.value}))}/>
        <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm(s=>({...s,notes:e.target.value}))}/>
        <button>Add Nutrient</button>
      </form>
    </Card>
    <Card title="Nutrients">
      {data.nutrients.map(n=>(<div key={n.id} style={{display:'flex',gap:8,alignItems:'center',borderBottom:'1px solid #eee',padding:'8px 0'}}>
        <div style={{flex:1}}><div><b>{n.name}</b> {n.npk && <>– {n.npk}</>}</div>{n.notes && <div style={{fontSize:12,opacity:.8}}>{n.notes}</div>}</div>
        <button onClick={()=>remove(n.id)}>Delete</button>
      </div>))}
    </Card>
  </div>)
}
