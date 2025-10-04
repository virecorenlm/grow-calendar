import React from 'react'
import Card from '../components/Card.jsx'
import { db, initData } from '../lib/db.js'
export default function Settings(){
  const [data,setData]=React.useState(initData())
  function exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='growcal_backup.json'; a.click(); URL.revokeObjectURL(url)
  }
  function importData(e){
    const file=e.target.files?.[0]; if(!file) return
    const reader=new FileReader(); reader.onload=()=>{ try{ const next=JSON.parse(reader.result); db.save(next); setData(next); alert('Imported.') }catch{ alert('Bad file.') } }
    reader.readAsText(file)
  }
  return (<div>
    <Card title="Data">
      <button onClick={exportData}>Export Backup</button>
      <input type="file" accept="application/json" onChange={importData} style={{marginLeft:12}}/>
    </Card>
    <Card title="Reset">
      <button onClick={()=>{ localStorage.removeItem('growcal_v1'); window.location.reload() }}>Wipe Local Data</button>
    </Card>
    <Card title="About"><p>Local-first grow calendar. Educational utility. No sales.</p></Card>
  </div>)
}
