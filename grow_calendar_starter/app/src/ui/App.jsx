import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
const linkStyle = ({isActive})=>({padding:'6px 10px',borderRadius:6,textDecoration:'none',fontWeight:600,
  background:isActive?'#0a1b10':'transparent',color:isActive?'#fff':'#0a1b10',border:'1px solid #0a1b10'})
export default function App(){
  return (<div style={{maxWidth:1000,margin:'0 auto',padding:16,fontFamily:'system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
      <h1 style={{margin:0}}>Grow Calendar</h1>
      <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <NavLink to='/' style={linkStyle} end>Dashboard</NavLink>
        <NavLink to='/plants' style={linkStyle}>Plants</NavLink>
        <NavLink to='/schedule' style={linkStyle}>Schedule</NavLink>
        <NavLink to='/nutrients' style={linkStyle}>Nutrients</NavLink>
        <NavLink to='/logs' style={linkStyle}>Logs</NavLink>
        <NavLink to='/settings' style={linkStyle}>Settings</NavLink>
      </nav>
    </header>
    <main style={{marginTop:24}}><Outlet/></main>
    <footer style={{marginTop:32,fontSize:12,opacity:.7}}>Local-first. Educational utility. No sales or medical advice.</footer>
  </div>)
}
