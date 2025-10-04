export const db = {
  load(){ try{ return JSON.parse(localStorage.getItem('growcal_v1')||'{}') }catch{ return {} } },
  save(d){ localStorage.setItem('growcal_v1', JSON.stringify(d)) }
}
export function initData(){
  const data = db.load()
  if(!data.plants) data.plants = []
  if(!data.nutrients) data.nutrients = [
    {id:'base-veg', name:'Base Veg', npk:'3-1-2', notes:''},
    {id:'base-bloom', name:'Base Bloom', npk:'1-3-2', notes:''},
    {id:'calmag', name:'Cal-Mag', npk:'0-0-0', notes:'Ca/Mg supplement'}
  ]
  if(!data.logs) data.logs = []
  if(!data.scheduleTemplate) data.scheduleTemplate = {
    vegWeeks:4, flowerWeeks:8,
    weeks:{
      1:[{nutrient:'base-veg', mlPerL:2},{nutrient:'calmag', mlPerL:1}],
      2:[{nutrient:'base-veg', mlPerL:2.5},{nutrient:'calmag', mlPerL:1}],
      3:[{nutrient:'base-veg', mlPerL:3}],
      4:[{nutrient:'base-veg', mlPerL:3},{nutrient:'calmag', mlPerL:1}],
      5:[{nutrient:'base-bloom', mlPerL:2}], 6:[{nutrient:'base-bloom', mlPerL:2.5}],
      7:[{nutrient:'base-bloom', mlPerL:3}], 8:[{nutrient:'base-bloom', mlPerL:3},{nutrient:'calmag', mlPerL:1}],
      9:[{nutrient:'base-bloom', mlPerL:2.5}],10:[{nutrient:'base-bloom', mlPerL:2}],11:[],12:[]
    }
  }
  db.save(data); return data
}
