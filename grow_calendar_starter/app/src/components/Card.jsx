import React from 'react'
export default function Card({title,children,actions}){
  return (<div style={{border:'1px solid #ddd',borderRadius:10,padding:16,marginBottom:12}}>
    {title && <h3 style={{marginTop:0}}>{title}</h3>}
    <div>{children}</div>
    {actions && <div style={{marginTop:12,display:'flex',gap:8}}>{actions}</div>}
  </div>)
}
