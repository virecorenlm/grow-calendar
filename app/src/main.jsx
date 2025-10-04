import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Plants from './pages/Plants.jsx'
import Schedule from './pages/Schedule.jsx'
import Nutrients from './pages/Nutrients.jsx'
import Logs from './pages/Logs.jsx'
import Settings from './pages/Settings.jsx'

const router = createBrowserRouter([
  { path:'/', element:<App/>,
    children:[
      { index:true, element:<Dashboard/> },
      { path:'plants', element:<Plants/> },
      { path:'schedule', element:<Schedule/> },
      { path:'nutrients', element:<Nutrients/> },
      { path:'logs', element:<Logs/> },
      { path:'settings', element:<Settings/> },
    ]
  }
])

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))
}

createRoot(document.getElementById('root')).render(<RouterProvider router={router}/>)
