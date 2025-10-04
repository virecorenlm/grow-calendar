import React from 'react'
import Card from '../components/Card.jsx'
import { initData } from '../lib/db.js'
export default function Dashboard(){
  const [data,setData]=React.useState(initData())
  const total=data.plants.length, veg=data.plants.filter(p=>p.phase==='veg').length, flower=data.plants.filter(p=>p.phase==='flower').length
  return (<div>
    <Card title="Overview">
      <p>Total plants: <b>{total}</b></p>
      <p>Veg: <b>{veg}</b> | Flower: <b>{flower}</b></p>
    </Card>
    <Card title="This Week"><p>Use the Schedule page to see recommended feeds per week.</p></Card>
  </div>)
}
