"use client";
import React, { useState, useEffect } from "react";

type ChecklistItem = {
  id: string;
  category: "electrical"|"refrigerant"|"mechanical"|"controls"|"airflow"|"safety"|"documentation";
  text: string;
  why: string;
  critical: boolean;
};

const CATEGORY_ICONS: Record<ChecklistItem["category"], string> = { electrical:"⚡", refrigerant:"🧊", mechanical:"🔧", controls:"🎛️", airflow:"💨", safety:"🛡️", documentation:"📋" };
const CATEGORY_COLORS: Record<ChecklistItem["category"], string> = { electrical:"#2563eb", refrigerant:"#0891b2", mechanical:"#d97706", controls:"#7c3aed", airflow:"#059669", safety:"#dc2626", documentation:"#64748b" };

type Props = { finalConfirmedCause?:string; actualFixPerformed?:string; partsReplaced?:string; equipmentType?:string; refrigerantType?:string; symptom?:string; };

function buildChecklist(props: Props): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const fix=(props.actualFixPerformed||"").toLowerCase();
  const cause=(props.finalConfirmedCause||"").toLowerCase();
  const parts=(props.partsReplaced||"").toLowerCase();
  const equip=(props.equipmentType||"").toLowerCase();
  const refrig=(props.refrigerantType||"").toLowerCase();
  const symptom=(props.symptom||"").toLowerCase();
  const combined=`${fix} ${cause} ${parts} ${symptom}`;
  const has=(text:string,...kw:string[])=>kw.some(k=>text.includes(k));

  if(has(combined,"capacitor","cap ")) {
    items.push({id:"cap1",category:"electrical",text:"Verify capacitor MFD is within ±6% of rated value",why:"A new capacitor out of tolerance is a comeback waiting to happen.",critical:true});
    items.push({id:"cap2",category:"electrical",text:"Check compressor and fan motor amp draw under load",why:"Weak capacitor may have caused motor damage — verify amps are within nameplate RLA.",critical:true});
    items.push({id:"cap3",category:"electrical",text:"Confirm both compressor AND fan sections replaced if dual-run",why:"Dual-run caps fail together — if one section failed, the other is stressed.",critical:false});
    items.push({id:"cap4",category:"refrigerant",text:"Verify system reaches normal operating pressures within 5 minutes",why:"Confirm the capacitor was the only problem — low refrigerant can mimic capacitor failure.",critical:false});
  }
  if(has(combined,"contactor")) {
    items.push({id:"cont1",category:"electrical",text:"Verify contactor pulls in cleanly — listen for chattering",why:"Chattering indicates low voltage or a failing coil.",critical:true});
    items.push({id:"cont2",category:"electrical",text:"Measure line and load voltage — should be within 10%",why:"Voltage drop under load causes premature contactor failure.",critical:true});
    items.push({id:"cont3",category:"electrical",text:"Verify 24V control signal at contactor coil",why:"Confirm thermostat/control board is commanding correctly.",critical:false});
  }
  if(has(combined,"compressor")) {
    items.push({id:"comp1",category:"refrigerant",text:"Verify system reaches target suction and head pressures within 10 minutes",why:"New compressor should hit normal pressures quickly — if not, investigate charge.",critical:true});
    items.push({id:"comp2",category:"electrical",text:"Check compressor amp draw — must be within RLA on nameplate",why:"High amps on a new compressor indicate refrigerant or voltage issues.",critical:true});
    items.push({id:"comp3",category:"refrigerant",text:"Verify superheat and subcooling are in range",why:"Confirm correct charge and metering device function.",critical:true});
    items.push({id:"comp4",category:"mechanical",text:"Verify no oil leaks at fittings and service valves fully open",why:"Common miss after compressor replacement.",critical:true});
    items.push({id:"comp5",category:"documentation",text:"Document refrigerant added or recovered in compliance log",why:"EPA 608 required for any system opened.",critical:true});
  }
  if(has(combined,"leak","charge","refrigerant","low charge","undercharge","overcharge")) {
    items.push({id:"ref1",category:"refrigerant",text:"Verify superheat in range (TXV: 8-12°F, Fixed: 10-18°F)",why:"Final confirmation the charge is correct before you leave.",critical:true});
    items.push({id:"ref2",category:"refrigerant",text:"Verify subcooling in range (typically 8-14°F)",why:"Low subcooling indicates undercharge or condenser issue.",critical:true});
    items.push({id:"ref3",category:"refrigerant",text:"Electronic leak check all service connections and repaired areas",why:"Don't leave a leak you created or missed.",critical:true});
    items.push({id:"ref4",category:"documentation",text:"Log refrigerant amount added/recovered in compliance log",why:"EPA 608 required — violations up to $44,000.",critical:true});
    if(has(refrig,"r-32","r-454","r-452","r-466"))
      items.push({id:"ref5",category:"safety",text:"A2L refrigerant — verify no ignition sources, A2L-rated equipment used",why:"A2L is mildly flammable — standard recovery equipment may not be compliant.",critical:true});
  }
  if(has(combined,"txv","eev","thermal expansion","metering","expansion valve")) {
    items.push({id:"txv1",category:"refrigerant",text:"Verify superheat 8-12°F at steady state (allow 15 min to stabilize)",why:"TXV needs time to hunt and settle — don't call it good until stable.",critical:true});
    items.push({id:"txv2",category:"refrigerant",text:"Confirm bulb is properly clamped and insulated on suction line",why:"Loose or uninsulated bulb is the most common TXV callback cause.",critical:true});
  }
  if(has(combined,"board","control board","pcb","circuit board","defrost board")) {
    items.push({id:"cb1",category:"controls",text:"Run a full cycle — heating and cooling if applicable",why:"Verify new board controls all stages correctly.",critical:true});
    items.push({id:"cb2",category:"controls",text:"Check all outputs — contactor, fan relay, reversing valve, defrost",why:"A wiring error will fail on the output you didn't check.",critical:true});
    items.push({id:"cb3",category:"controls",text:"Photograph new board wiring before leaving",why:"Protects you on any future callback.",critical:false});
  }
  if(has(combined,"fan motor","condenser fan","evaporator fan","blower motor","blower")) {
    items.push({id:"fan1",category:"mechanical",text:"Verify correct rotation direction",why:"Wrong rotation is the most common fan motor callback.",critical:true});
    items.push({id:"fan2",category:"electrical",text:"Check amp draw under load — within motor nameplate FLA",why:"Overloaded motor will fail prematurely.",critical:true});
    items.push({id:"fan3",category:"mechanical",text:"Verify blade pitch and blade-to-shroud clearance",why:"Incorrect clearance causes airflow issues and noise.",critical:false});
  }
  if(has(combined,"defrost","walk-in","freezer","cooler","ice")||has(equip,"walk-in","refrigeration","cooler","freezer","ice")) {
    items.push({id:"def1",category:"controls",text:"Manually initiate a defrost cycle and verify it terminates properly",why:"Don't leave without confirming defrost works — it's the #1 walk-in callback.",critical:true});
    items.push({id:"def2",category:"controls",text:"Verify defrost termination temperature and time settings are correct",why:"Wrong settings cause incomplete defrost or excessive defrost time.",critical:true});
    items.push({id:"def3",category:"mechanical",text:"Confirm drain is clear and drain heater is working",why:"Blocked drain causes ice dam and water damage callback.",critical:true});
    items.push({id:"def4",category:"refrigerant",text:"Verify box temperature is dropping toward setpoint",why:"Confirm system is actually pulling down before you leave.",critical:true});
  }
  if(has(combined,"reversing valve","heat pump","heating mode","cooling mode")) {
    items.push({id:"hp1",category:"controls",text:"Test both heating and cooling modes — verify switchover",why:"Reversing valve stuck in one position is immediate callback.",critical:true});
    items.push({id:"hp2",category:"refrigerant",text:"Verify pressures in both modes",why:"Confirm reversing valve is fully shifting.",critical:true});
  }
  if(has(combined,"filter","coil","airflow","cfm","dirty")) {
    items.push({id:"air1",category:"airflow",text:"Verify filter is clean and properly seated — no bypass",why:"Filter installed crooked creates same problem within days.",critical:true});
    items.push({id:"air2",category:"airflow",text:"Measure Delta-T — should be 18-22°F for cooling in normal conditions",why:"Confirms airflow and refrigerant-side operation are both correct.",critical:false});
  }
  items.push({id:"always1",category:"documentation",text:"Confirm customer understands what was found and what was done",why:"Informed customers don't dispute bills and don't feel surprised.",critical:false});
  items.push({id:"always2",category:"safety",text:"Verify all panels are reinstalled and screws are in",why:"Missing panel screw is an embarrassing callback.",critical:false});
  items.push({id:"always3",category:"documentation",text:"Document readings and outcome in the unit service history",why:"Your notes now protect you on the next visit.",critical:false});

  const seen=new Set<string>();
  return items.filter(i=>{if(seen.has(i.id))return false;seen.add(i.id);return true;});
}

function CheckItem({item,checked,onToggle}:{item:ChecklistItem;checked:boolean;onToggle:()=>void}) {
  const [showWhy,setShowWhy]=useState(false);
  const color=CATEGORY_COLORS[item.category];
  return (
    <div style={{background:checked?"#f0fdf4":"#fff",border:`1px solid ${checked?"#bbf7d0":item.critical?"#fecaca":"#e2e8f0"}`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:10,transition:"all 0.15s"}}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{width:18,height:18,cursor:"pointer",flexShrink:0,marginTop:2,accentColor:"#16a34a"}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
          <span style={{fontSize:14,flexShrink:0}}>{CATEGORY_ICONS[item.category]}</span>
          <span style={{fontSize:13,fontWeight:item.critical?700:500,color:checked?"#64748b":"#1e293b",textDecoration:checked?"line-through":"none",lineHeight:1.4}}>{item.text}</span>
        </div>
        <button onClick={()=>setShowWhy(v=>!v)} style={{background:"none",border:"none",color:"#94a3b8",fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:"2px 0",marginTop:2}}>{showWhy?"▲ hide":"▼ why?"}</button>
        {showWhy&&<div style={{fontSize:11,color:"#64748b",marginTop:4,padding:"6px 8px",background:"#f8fafc",borderRadius:6,lineHeight:1.5}}>{item.why}</div>}
      </div>
      <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10,background:`${color}18`,color,flexShrink:0,marginTop:2}}>{item.category}</span>
    </div>
  );
}

export function CallbackPreventionChecklist(props:Props) {
  const [checked,setChecked]=useState<Set<string>>(new Set());
  const [items,setItems]=useState<ChecklistItem[]>([]);
  const [collapsed,setCollapsed]=useState(false);

  useEffect(()=>{setItems(buildChecklist(props));setChecked(new Set());},[props.actualFixPerformed,props.partsReplaced,props.finalConfirmedCause,props.equipmentType]);

  const hasContext=!!(props.actualFixPerformed||props.partsReplaced||props.finalConfirmedCause);
  if(!hasContext) return <div style={{padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",fontSize:13,color:"#94a3b8"}}>Fill in confirmed cause, work performed, or parts replaced to generate your callback prevention checklist.</div>;

  const criticalItems=items.filter(i=>i.critical);
  const normalItems=items.filter(i=>!i.critical);
  const criticalDone=criticalItems.filter(i=>checked.has(i.id)).length;
  const totalDone=checked.size;
  const allCriticalDone=criticalDone===criticalItems.length;
  const allDone=totalDone===items.length;
  const pct=items.length?Math.round((totalDone/items.length)*100):0;
  function toggle(id:string){setChecked(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;});}

  return (
    <div>
      <div onClick={()=>setCollapsed(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",marginBottom:collapsed?0:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const}}>
            <span style={{fontSize:13,fontWeight:700,color:allDone?"#16a34a":"#1e293b"}}>{allDone?"✅ All checks complete — safe to leave":`${totalDone} of ${items.length} checks done`}</span>
            {!allCriticalDone&&criticalItems.length>0&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#fee2e2",color:"#dc2626"}}>{criticalItems.length-criticalDone} CRITICAL remaining</span>}
            {allCriticalDone&&!allDone&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#dcfce7",color:"#16a34a"}}>Critical items done ✓</span>}
          </div>
          <div style={{marginTop:6,height:4,background:"#f1f5f9",borderRadius:2,overflow:"hidden",maxWidth:300}}>
            <div style={{height:"100%",width:`${pct}%`,background:allDone?"#16a34a":"#2563eb",borderRadius:2,transition:"width 0.3s ease"}}/>
          </div>
        </div>
        <span style={{fontSize:16,color:"#94a3b8",marginLeft:12}}>{collapsed?"▼":"▲"}</span>
      </div>
      {!collapsed&&(
        <div>
          {criticalItems.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#dc2626",letterSpacing:"0.08em",textTransform:"uppercase" as const,marginBottom:6}}>🚨 Critical — do not leave without completing</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>{criticalItems.map(item=><CheckItem key={item.id} item={item} checked={checked.has(item.id)} onToggle={()=>toggle(item.id)}/>)}</div>
            </div>
          )}
          {normalItems.length>0&&(
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.08em",textTransform:"uppercase" as const,marginBottom:6}}>Standard verification</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>{normalItems.map(item=><CheckItem key={item.id} item={item} checked={checked.has(item.id)} onToggle={()=>toggle(item.id)}/>)}</div>
            </div>
          )}
          {allDone&&<div style={{marginTop:12,padding:"12px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>✅</span><div><div style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>All {items.length} checks complete</div><div style={{fontSize:12,color:"#4ade80",marginTop:2}}>You're clear to leave. Good work.</div></div></div>}
          <div style={{marginTop:10,fontSize:11,color:"#94a3b8"}}>Checklist generated based on: {[props.finalConfirmedCause,props.partsReplaced,props.actualFixPerformed].filter(Boolean).join(", ")}</div>
        </div>
      )}
    </div>
  );
}
