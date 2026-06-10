import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gvkkzdzfjiafpjkyscjn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2t6ZHpmamlhZnBqa3lzY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODM0MTUsImV4cCI6MjA4NzM1OTQxNX0.DUSrbbqced4HgC0HOAaJ2ERPDHc7gYFiHHHBPDEB1Zg";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const OWNER_PASSWORD = "Faf1022@";

const SC = { scheduled:"#B8924A", in_progress:"#2563EB", completed:"#16A34A", cancelled:"#DC2626" };
const SB = { scheduled:"#FDF6EC", in_progress:"#EFF6FF", completed:"#F0FDF4", cancelled:"#FEF2F2" };
const SERVICES = ["Countertop Installation","Cabinet Installation","Kitchen Remodeling","Flooring","Tile Work","Bathroom Remodel","Other"];

// ─── i18n ─────────────────────────────────────────────────────────────
const T = {
  pt:{ appSub:"Field Scheduler", owner:"Owner", ownerSub:"Acesso total", admin:"Admin", adminSub:"Gerenciar empresa", installer:"Instalador", installerSub:"Ver meus jobs", loginOwner:"Login Owner", loginAdmin:"Login Admin", loginInstaller:"Login Instalador", yourName:"Seu nome", selectName:"Selecione...", password:"Senha", wrongPassword:"Senha incorreta.", wrongCredentials:"Nome ou senha incorretos.", selectName2:"Selecione seu nome.", enterPassword:"Digite sua senha.", verifying:"Verificando...", enter:"Entrar", back:"← Voltar",
    jobs:"Jobs", calendar:"Calendário", companies:"Empresas", contacts:"Contatos",
    allJobs:"Todos os Jobs", myJobs:"Jobs de", work:"trabalho(s)", noJobs:"Nenhum job", loading:"Carregando...",
    all:"Todos", scheduled:"Agendado", inProgress:"Em Andamento", completed:"Concluído", cancelled:"Cancelado",
    newJob:"+ Novo Job", editJob:"✏️ Editar", createJob:"➕ Novo Job", saveChanges:"Salvar", createBtn:"Criar", saving:"Salvando...", cancel:"Cancelar", edit:"✏️", delete:"🗑️",
    workOrder:"Nº Trabalho *", client:"Cliente *", clientPhone:"Tel. Cliente", builder:"Builder", address:"Endereço *", accessNotes:"Acesso", accessPH:"Código do portão...", date:"Data *", time:"Hora", service:"Serviço", sf:"SF", installerF:"Instalador", installerPhone:"Tel. Instalador", estHours:"Horas", status:"Status", scope:"Escopo", scopePH:"Descreva o trabalho...",
    contactsT:"📞 Contatos", addrAccess:"📍 Endereço", accessLbl:"ACESSO", scopeT:"📋 Escopo", sitePhotos:"📸 Fotos", noPhoto:"Nenhuma foto.", statusT:"⚙️ Status", conclusion:"✅ Conclusão", notesLbl:"Observações", notesPH:"Como foi o trabalho...", saveNotes:"💾 Salvar", markDone:"✅ Concluído",
    manageAdmins:"⚙️ Admins", newAdmin:"Novo Admin", adminName:"Nome", company:"Empresa", addBtn:"+ Adicionar", registered:"Cadastrados", remove:"Remover",
    manageInstallers:"👷 Instaladores", newInstaller:"Novo Instalador", installerName:"Nome", addInstaller:"+ Adicionar",
    confirmDelJob:"Excluir job?", confirmDelContact:"Remover cadastro?", confirmDelContract:"Remover contrato?", confirmDelAdmin:"Remover admin?", confirmDelInstaller:"Remover instalador?",
    jobCreated:"Job criado!", jobUpdated:"Job atualizado!", jobDeleted:"Job excluído!", statusUpdated:"Status atualizado!", photoSent:"Foto enviada!", photoRemoved:"Foto removida!", saved:"Salvo!", adminAdded:"Admin cadastrado!", installerAdded:"Instalador adicionado!", contactSaved:"Contato salvo!", contactDeleted:"Contato removido!", errLoad:"Erro ao carregar", errSave:"Erro ao salvar", errPhoto:"Erro na foto", errDup:"Nome já existe.", fillAll:"Preencha todos os campos.", fillReq:"Preencha campos obrigatórios.", removePhoto:"Remover foto?",
    ctClients:"👤 Clientes", ctBuilders:"🏗️ Builders", ctContracts:"📄 Contratos", ctContractors:"🔧 Prestadores",
    newContact:"+ Novo", name:"Nome *", phone:"Telefone", email:"Email", addr:"Endereço", notes:"Notas", contactCo:"Empresa *", contactPerson:"Contato", svcType:"Serviço",
    contractTitle:"Título *", relatedTo:"Relacionado a", uploadFile:"📎 Anexar arquivo", noContacts:"Nenhum cadastro.", viewFile:"📄 Ver arquivo", noFile:"Sem arquivo",
    // companies tab
    companiesTitle:"🏢 Empresas", noCompanies:"Nenhuma empresa cadastrada.", activeJobs:"jobs ativos", totalJobs:"jobs no total", installers:"instaladores", clients:"clientes",
    companyDetail:"Detalhes da Empresa", companyJobs:"Jobs", companyInstallers:"Instaladores", companyClients:"Clientes",
    months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    days:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
  },
  en:{ appSub:"Field Scheduler", owner:"Owner", ownerSub:"Full access", admin:"Admin", adminSub:"Manage company", installer:"Installer", installerSub:"View my jobs", loginOwner:"Owner Login", loginAdmin:"Admin Login", loginInstaller:"Installer Login", yourName:"Your name", selectName:"Select...", password:"Password", wrongPassword:"Incorrect password.", wrongCredentials:"Wrong name or password.", selectName2:"Select your name.", enterPassword:"Enter password.", verifying:"Verifying...", enter:"Sign In", back:"← Back",
    jobs:"Jobs", calendar:"Calendar", companies:"Companies", contacts:"Contacts",
    allJobs:"All Jobs", myJobs:"Jobs for", work:"job(s)", noJobs:"No jobs found", loading:"Loading...",
    all:"All", scheduled:"Scheduled", inProgress:"In Progress", completed:"Completed", cancelled:"Cancelled",
    newJob:"+ New Job", editJob:"✏️ Edit", createJob:"➕ New Job", saveChanges:"Save", createBtn:"Create", saving:"Saving...", cancel:"Cancel", edit:"✏️", delete:"🗑️",
    workOrder:"Work Order *", client:"Client *", clientPhone:"Client Phone", builder:"Builder", address:"Address *", accessNotes:"Access", accessPH:"Gate code...", date:"Date *", time:"Time", service:"Service", sf:"SF", installerF:"Installer", installerPhone:"Installer Phone", estHours:"Hours", status:"Status", scope:"Scope", scopePH:"Describe the work...",
    contactsT:"📞 Contacts", addrAccess:"📍 Address", accessLbl:"ACCESS", scopeT:"📋 Scope", sitePhotos:"📸 Photos", noPhoto:"No photos.", statusT:"⚙️ Status", conclusion:"✅ Completion", notesLbl:"Notes", notesPH:"Describe the job...", saveNotes:"💾 Save", markDone:"✅ Mark Complete",
    manageAdmins:"⚙️ Admins", newAdmin:"New Admin", adminName:"Name", company:"Company", addBtn:"+ Add", registered:"Registered", remove:"Remove",
    manageInstallers:"👷 Installers", newInstaller:"New Installer", installerName:"Name", addInstaller:"+ Add",
    confirmDelJob:"Delete job?", confirmDelContact:"Remove record?", confirmDelContract:"Remove contract?", confirmDelAdmin:"Remove admin?", confirmDelInstaller:"Remove installer?",
    jobCreated:"Job created!", jobUpdated:"Job updated!", jobDeleted:"Job deleted!", statusUpdated:"Status updated!", photoSent:"Photo sent!", photoRemoved:"Photo removed!", saved:"Saved!", adminAdded:"Admin added!", installerAdded:"Installer added!", contactSaved:"Contact saved!", contactDeleted:"Contact removed!", errLoad:"Error loading", errSave:"Error saving", errPhoto:"Photo error", errDup:"Name already exists.", fillAll:"Fill all fields.", fillReq:"Fill required fields.", removePhoto:"Remove photo?",
    ctClients:"👤 Clients", ctBuilders:"🏗️ Builders", ctContracts:"📄 Contracts", ctContractors:"🔧 Contractors",
    newContact:"+ New", name:"Name *", phone:"Phone", email:"Email", addr:"Address", notes:"Notes", contactCo:"Company *", contactPerson:"Contact", svcType:"Service",
    contractTitle:"Title *", relatedTo:"Related to", uploadFile:"📎 Attach file", noContacts:"No records.", viewFile:"📄 View file", noFile:"No file",
    companiesTitle:"🏢 Companies", noCompanies:"No companies yet.", activeJobs:"active jobs", totalJobs:"total jobs", installers:"installers", clients:"clients",
    companyDetail:"Company Details", companyJobs:"Jobs", companyInstallers:"Installers", companyClients:"Clients",
    months:["January","February","March","April","May","June","July","August","September","October","November","December"],
    days:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  },
  es:{ appSub:"Programador", owner:"Propietario", ownerSub:"Acceso total", admin:"Admin", adminSub:"Gestionar empresa", installer:"Instalador", installerSub:"Ver mis trabajos", loginOwner:"Acceso Propietario", loginAdmin:"Acceso Admin", loginInstaller:"Acceso Instalador", yourName:"Tu nombre", selectName:"Seleccionar...", password:"Contraseña", wrongPassword:"Contraseña incorrecta.", wrongCredentials:"Nombre o contraseña incorrectos.", selectName2:"Selecciona tu nombre.", enterPassword:"Ingresa contraseña.", verifying:"Verificando...", enter:"Entrar", back:"← Volver",
    jobs:"Trabajos", calendar:"Calendario", companies:"Empresas", contacts:"Contactos",
    allJobs:"Todos los Trabajos", myJobs:"Trabajos de", work:"trabajo(s)", noJobs:"Sin trabajos", loading:"Cargando...",
    all:"Todos", scheduled:"Programado", inProgress:"En Progreso", completed:"Completado", cancelled:"Cancelado",
    newJob:"+ Nuevo", editJob:"✏️ Editar", createJob:"➕ Nuevo", saveChanges:"Guardar", createBtn:"Crear", saving:"Guardando...", cancel:"Cancelar", edit:"✏️", delete:"🗑️",
    workOrder:"Nº Trabajo *", client:"Cliente *", clientPhone:"Tel. Cliente", builder:"Constructor", address:"Dirección *", accessNotes:"Acceso", accessPH:"Código de puerta...", date:"Fecha *", time:"Hora", service:"Servicio", sf:"SF", installerF:"Instalador", installerPhone:"Tel. Instalador", estHours:"Horas", status:"Estado", scope:"Alcance", scopePH:"Describe el trabajo...",
    contactsT:"📞 Contactos", addrAccess:"📍 Dirección", accessLbl:"ACCESO", scopeT:"📋 Alcance", sitePhotos:"📸 Fotos", noPhoto:"Sin fotos.", statusT:"⚙️ Estado", conclusion:"✅ Finalización", notesLbl:"Observaciones", notesPH:"Describe el trabajo...", saveNotes:"💾 Guardar", markDone:"✅ Completado",
    manageAdmins:"⚙️ Admins", newAdmin:"Nuevo Admin", adminName:"Nombre", company:"Empresa", addBtn:"+ Agregar", registered:"Registrados", remove:"Eliminar",
    manageInstallers:"👷 Instaladores", newInstaller:"Nuevo Instalador", installerName:"Nombre", addInstaller:"+ Agregar",
    confirmDelJob:"¿Eliminar trabajo?", confirmDelContact:"¿Eliminar registro?", confirmDelContract:"¿Eliminar contrato?", confirmDelAdmin:"¿Eliminar admin?", confirmDelInstaller:"¿Eliminar instalador?",
    jobCreated:"¡Trabajo creado!", jobUpdated:"¡Trabajo actualizado!", jobDeleted:"¡Trabajo eliminado!", statusUpdated:"¡Estado actualizado!", photoSent:"¡Foto enviada!", photoRemoved:"¡Foto eliminada!", saved:"¡Guardado!", adminAdded:"¡Admin registrado!", installerAdded:"¡Instalador agregado!", contactSaved:"¡Contacto guardado!", contactDeleted:"¡Contacto eliminado!", errLoad:"Error al cargar", errSave:"Error al guardar", errPhoto:"Error en foto", errDup:"El nombre ya existe.", fillAll:"Complete todos los campos.", fillReq:"Complete campos requeridos.", removePhoto:"¿Eliminar foto?",
    ctClients:"👤 Clientes", ctBuilders:"🏗️ Constructores", ctContracts:"📄 Contratos", ctContractors:"🔧 Contratistas",
    newContact:"+ Nuevo", name:"Nombre *", phone:"Teléfono", email:"Email", addr:"Dirección", notes:"Notas", contactCo:"Empresa *", contactPerson:"Contacto", svcType:"Servicio",
    contractTitle:"Título *", relatedTo:"Relacionado con", uploadFile:"📎 Adjuntar", noContacts:"Sin registros.", viewFile:"📄 Ver archivo", noFile:"Sin archivo",
    companiesTitle:"🏢 Empresas", noCompanies:"Sin empresas.", activeJobs:"trabajos activos", totalJobs:"trabajos total", installers:"instaladores", clients:"clientes",
    companyDetail:"Detalles de la Empresa", companyJobs:"Trabajos", companyInstallers:"Instaladores", companyClients:"Clientes",
    months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
    days:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
  },
};

function todayStr() { return new Date().toISOString().split("T")[0]; }
function formatDate(d) { if(!d) return ""; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; }

// ─── SMALL COMPONENTS ────────────────────────────────────────────────
function SBadge({ status, t }) {
  const lm={scheduled:t.scheduled,in_progress:t.inProgress,completed:t.completed,cancelled:t.cancelled};
  const c=SC[status]||SC.scheduled, bg=SB[status]||SB.scheduled;
  return <span style={{background:bg,color:c,border:`1px solid ${c}33`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{lm[status]||status}</span>;
}
function PhoneBtn({ phone, label, color="#B8924A" }) {
  if(!phone) return null;
  return <a href={`tel:${phone.replace(/\D/g,"")}`} style={{display:"inline-flex",alignItems:"center",gap:6,background:color+"18",color,border:`1px solid ${color}44`,borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:700,textDecoration:"none"}}>📞 {label}: {phone}</a>;
}
function ST({ children }) { return <div style={{fontSize:11,fontWeight:800,color:"#1A1A1A",marginBottom:10,textTransform:"uppercase",letterSpacing:0.8}}>{children}</div>; }
function FF({ label, value, onChange, type="text", multiline, placeholder, flex }) {
  const base={width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",background:"#fff"};
  return <div style={{marginBottom:12,flex}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{label}</label>{multiline?<textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} style={{...base,resize:"vertical"}}/>:<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>}</div>;
}
function LangSwitcher({ lang, setLang }) {
  const [open,setOpen]=useState(false);
  const flags={pt:"🇧🇷",en:"🇺🇸",es:"🇪🇸"};
  return <div style={{position:"relative"}}><button onClick={()=>setOpen(o=>!o)} style={{background:"#2A2A2A",border:"1px solid #444",borderRadius:20,padding:"3px 10px",fontSize:14,cursor:"pointer"}}>{flags[lang]}</button>{open&&<div style={{position:"absolute",right:0,top:34,background:"#2A2A2A",border:"1px solid #444",borderRadius:10,padding:6,zIndex:200,display:"flex",flexDirection:"column",gap:4}}>{Object.entries(flags).map(([l,f])=><button key={l} onClick={()=>{setLang(l);localStorage.setItem("cl_lang",l);setOpen(false);}} style={{background:lang===l?"#B8924A22":"none",border:"none",borderRadius:6,padding:"5px 8px",fontSize:16,cursor:"pointer"}}>{f}</button>)}</div>}</div>;
}
function PhotoGrid({ photos, onDelete, canDelete }) {
  return <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>{photos.map((p,i)=><div key={i} style={{position:"relative"}}><img src={p.url} alt="" onClick={()=>window.open(p.url,"_blank")} style={{width:88,height:68,objectFit:"cover",borderRadius:8,border:"2px solid #e5e7eb",cursor:"pointer"}}/>{canDelete&&<button onClick={()=>onDelete(p)} style={{position:"absolute",top:-6,right:-6,background:"#DC2626",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>×</button>}</div>)}</div>;
}
function PhotoUploadBtn({ onAdd, uploading }) {
  const ref=useRef();
  return <><button onClick={()=>ref.current.click()} disabled={uploading} style={{width:88,height:68,border:"2px dashed #B8924A",borderRadius:8,background:"#FFFBF5",color:"#B8924A",fontSize:uploading?14:22,cursor:uploading?"not-allowed":"pointer",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center"}}>{uploading?"...":"+"}</button><input ref={ref} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>Array.from(e.target.files).forEach(f=>onAdd(f))}/></>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, lang, setLang }) {
  const t=T[lang];
  const [mode,setMode]=useState(null);
  const [pw,setPw]=useState(""); const [name,setName]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [admins,setAdmins]=useState([]); const [installers,setInstallers]=useState([]);
  useEffect(()=>{
    supabase.from("admins").select("name").order("name").then(({data})=>{ if(data) setAdmins(data.map(a=>a.name)); });
    supabase.from("installers").select("name").order("name").then(({data})=>{ if(data) setInstallers(data.map(i=>i.name)); });
  },[]);
  const handle=async()=>{
    if(mode==="owner"){ if(pw===OWNER_PASSWORD) onLogin({role:"owner",name:"Owner"}); else setErr(t.wrongPassword); return; }
    if(!name){setErr(t.selectName2);return;} if(!pw){setErr(t.enterPassword);return;}
    setLoading(true);
    const tbl=mode==="admin"?"admins":"installers";
    const {data,error}=await supabase.from(tbl).select("*").eq("name",name).eq("password",pw).single();
    setLoading(false);
    if(error||!data){setErr(t.wrongCredentials);return;}
    onLogin({role:mode,name:data.name,company:data.company,id:data.id});
  };
  const flags={pt:"🇧🇷",en:"🇺🇸",es:"🇪🇸"};
  if(!mode) return (
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{maxWidth:360,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16,gap:6}}>{Object.entries(flags).map(([l,f])=><button key={l} onClick={()=>{setLang(l);localStorage.setItem("cl_lang",l);}} style={{background:lang===l?"#B8924A22":"#2A2A2A",border:`1px solid ${lang===l?"#B8924A":"#444"}`,borderRadius:10,padding:"5px 10px",fontSize:16,cursor:"pointer"}}>{f}</button>)}</div>
        <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:38,fontWeight:900,color:"#B8924A",letterSpacing:-2,marginBottom:2}}>CasaLuma</div><div style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase"}}>{t.appSub}</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[{id:"owner",icon:"👑",label:t.owner,sub:t.ownerSub},{id:"admin",icon:"⚙️",label:t.admin,sub:t.adminSub},{id:"installer",icon:"🔨",label:t.installer,sub:t.installerSub}].map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setErr("");setPw("");setName("");}} style={{background:m.id==="owner"?"#1A1A1A":"#2A2A2A",color:"#fff",border:m.id==="owner"?"2px solid #B8924A":"2px solid #3A3A3A",borderRadius:14,padding:"18px 24px",fontSize:15,fontWeight:800,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:24}}>{m.icon}</span><div><div style={{color:m.id==="owner"?"#B8924A":"#fff"}}>{m.label}</div><div style={{fontSize:12,fontWeight:400,opacity:0.6,marginTop:2}}>{m.sub}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{maxWidth:360,width:"100%"}}>
        <div style={{fontSize:38,fontWeight:900,color:"#B8924A",letterSpacing:-2,marginBottom:2,textAlign:"center"}}>CasaLuma</div>
        <div style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase",marginBottom:28,textAlign:"center"}}>{mode==="owner"?t.loginOwner:mode==="admin"?t.loginAdmin:t.loginInstaller}</div>
        <div style={{background:"#2A2A2A",borderRadius:16,padding:22}}>
          {(mode==="admin"||mode==="installer")&&<div style={{marginBottom:14}}><label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:6}}>{t.yourName}</label><select value={name} onChange={e=>{setName(e.target.value);setErr("");}} style={{width:"100%",border:"1px solid #444",borderRadius:8,padding:"10px 12px",fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box"}}><option value="">{t.selectName}</option>{(mode==="admin"?admins:installers).map(n=><option key={n} value={n}>{n}</option>)}</select></div>}
          <div style={{marginBottom:14}}><label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:6}}>{t.password}</label><input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} style={{width:"100%",border:"1px solid #444",borderRadius:8,padding:"10px 12px",fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box",outline:"none"}}/></div>
          {err&&<div style={{color:"#DC2626",fontSize:13,marginBottom:10,fontWeight:600}}>{err}</div>}
          <button onClick={handle} disabled={loading} style={{width:"100%",background:"#B8924A",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:15,cursor:"pointer",opacity:loading?0.7:1,marginBottom:10}}>{loading?t.verifying:t.enter}</button>
          <button onClick={()=>{setMode(null);setErr("");}} style={{width:"100%",background:"none",color:"#666",border:"1px solid #444",borderRadius:10,padding:9,cursor:"pointer",fontSize:13}}>{t.back}</button>
        </div>
      </div>
    </div>
  );
}

// ─── JOB FORM ────────────────────────────────────────────────────────
function JobForm({ onSave, onCancel, saving, installerNames, initial, t, forceCompany }) {
  const blank={work_order:"",client:"",client_phone:"",address:"",access_notes:"",date:"",time:"08:00",service:SERVICES[0],status:"scheduled",assigned_to:"",installer_phone:"",estimated_hours:4,scope:"",square_footage:"",builder:""};
  const [form,setForm]=useState(initial?{...blank,...initial}:blank);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  const sl={scheduled:t.scheduled,in_progress:t.inProgress,completed:t.completed,cancelled:t.cancelled};
  const save=()=>{ if(!form.work_order||!form.client||!form.address||!form.date){alert(t.fillReq);return;} onSave({...form,square_footage:form.square_footage?Number(form.square_footage):null}); };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
      <div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>{initial?t.editJob:t.createJob}{forceCompany&&<span style={{fontSize:12,color:"#B8924A",fontWeight:600,marginLeft:8}}>— {forceCompany}</span>}</div>
        <FF label={t.workOrder} value={form.work_order} onChange={set("work_order")} placeholder="WO-2026-001"/>
        <div style={{display:"flex",gap:10}}><div style={{flex:1}}><FF label={t.client} value={form.client} onChange={set("client")} placeholder="John Smith"/></div><div style={{flex:1}}><FF label={t.clientPhone} value={form.client_phone} onChange={set("client_phone")} type="tel" placeholder="(770) 555-0000"/></div></div>
        <FF label={t.builder} value={form.builder} onChange={set("builder")} placeholder="Brown Haven Homes"/>
        <FF label={t.address} value={form.address} onChange={set("address")} placeholder="123 Main St, Marietta, GA"/>
        <FF label={t.accessNotes} value={form.access_notes} onChange={set("access_notes")} multiline placeholder={t.accessPH}/>
        <div style={{display:"flex",gap:10}}><div style={{flex:1}}><FF label={t.date} value={form.date} onChange={set("date")} type="date"/></div><div style={{flex:1}}><FF label={t.time} value={form.time} onChange={set("time")} type="time"/></div></div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:2,marginBottom:12}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{t.service}</label><select value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{flex:1}}><FF label={t.sf} value={form.square_footage} onChange={set("square_footage")} type="number" placeholder="88"/></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,marginBottom:12}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{t.installerF}</label><select value={form.assigned_to||""} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}><option value="">{t.selectName}</option>{installerNames.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div style={{flex:1}}><FF label={t.installerPhone} value={form.installer_phone} onChange={set("installer_phone")} type="tel" placeholder="(470) 555-0000"/></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><FF label={t.estHours} value={form.estimated_hours} onChange={set("estimated_hours")} type="number"/></div>
          <div style={{flex:1,marginBottom:12}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{t.status}</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}>{Object.entries(sl).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
        </div>
        <FF label={t.scope} value={form.scope} onChange={set("scope")} multiline placeholder={t.scopePH}/>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button onClick={save} disabled={saving} style={{flex:1,background:"#B8924A",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:14,cursor:"pointer",opacity:saving?0.7:1}}>{saving?t.saving:initial?t.saveChanges:t.createBtn}</button>
          <button onClick={onCancel} style={{background:"#F3F4F6",color:"#374151",border:"none",borderRadius:10,padding:"12px 18px",cursor:"pointer",fontSize:14}}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────
function ContactsTab({ session, t, showToast, forceCompany }) {
  const [sub,setSub]=useState("clients");
  const [records,setRecords]=useState([]); const [loading,setLoading]=useState(false);
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false); const [search,setSearch]=useState("");
  const company=forceCompany||(session.role==="owner"?null:session.company);
  const tableMap={clients:"contacts_clients",builders:"contacts_builders",contractors:"contacts_contractors",contracts:"contracts"};
  const table=tableMap[sub];
  const load=async()=>{ setLoading(true); let q=supabase.from(table).select("*").order("created_at",{ascending:false}); if(company) q=q.eq("company",company); const {data}=await q; setRecords(data||[]); setLoading(false); };
  useEffect(()=>{ load();setSearch(""); },[sub,forceCompany]);
  const filtered=records.filter(r=>{ const s=search.toLowerCase(); return !s||Object.values(r).some(v=>String(v||"").toLowerCase().includes(s)); });
  const emptyForm=()=>{ if(sub==="clients") return {name:"",phone:"",email:"",address:"",notes:""}; if(sub==="builders") return {name:"",contact:"",phone:"",email:"",notes:""}; if(sub==="contractors") return {name:"",service:"",phone:"",email:"",notes:""}; return {title:"",related_to:"",notes:"",file_url:""}; };
  const [form,setForm]=useState(emptyForm());
  const fileRef=useRef(); const [uploadFile,setUploadFile]=useState(null);
  useEffect(()=>{ setForm(editing?{...emptyForm(),...editing}:emptyForm()); setUploadFile(null); },[editing,sub]);
  const save=async()=>{
    const req=sub==="contracts"?form.title:form.name; if(!req){alert(t.fillAll);return;}
    setSaving(true);
    const payload={...form,company:company||"Owner"};
    if(sub==="contracts"&&uploadFile){
      const path=`${company||"owner"}/${Date.now()}-${uploadFile.name}`;
      const {error:upErr}=await supabase.storage.from("contracts").upload(path,uploadFile);
      if(!upErr){ const {data:{publicUrl}}=supabase.storage.from("contracts").getPublicUrl(path); payload.file_url=publicUrl; }
    }
    let error;
    if(editing){ ({error}=await supabase.from(table).update(payload).eq("id",editing.id)); }
    else { ({error}=await supabase.from(table).insert([payload])); }
    setSaving(false);
    if(error){showToast(t.errSave,"error");return;}
    showToast(t.contactSaved); setShowForm(false); setEditing(null); load();
  };
  const remove=async(id)=>{ if(!confirm(sub==="contracts"?t.confirmDelContract:t.confirmDelContact)) return; await supabase.from(table).delete().eq("id",id); showToast(t.contactDeleted); load(); };
  const subTabs=[{id:"clients",label:t.ctClients},{id:"builders",label:t.ctBuilders},{id:"contracts",label:t.ctContracts},{id:"contractors",label:t.ctContractors}];
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {subTabs.map(st=><button key={st.id} onClick={()=>setSub(st.id)} style={{background:sub===st.id?"#1A1A1A":"#fff",color:sub===st.id?"#B8924A":"#666",border:`1px solid ${sub===st.id?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{st.label}</button>)}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{flex:1,border:"1px solid #E5E7EB",borderRadius:20,padding:"7px 14px",fontSize:13,outline:"none",background:"#fff"}}/>
        <button onClick={()=>{setEditing(null);setForm(emptyForm());setShowForm(true);}} style={{background:"#B8924A",color:"#fff",border:"none",borderRadius:20,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{t.newContact}</button>
      </div>
      {loading?<div style={{textAlign:"center",padding:"30px",color:"#aaa"}}>⏳</div>
        :filtered.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>📋</div><div>{t.noContacts}</div></div>
        :filtered.map(r=>(
          <div key={r.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:14,marginBottom:10,boxShadow:"0 2px 6px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                {sub==="contracts"?<>
                  <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:4}}>{r.title}</div>
                  {r.related_to&&<div style={{fontSize:13,color:"#666",marginBottom:4}}>🔗 {r.related_to}</div>}
                  {r.notes&&<div style={{fontSize:12,color:"#888",marginBottom:6}}>{r.notes}</div>}
                  {!forceCompany&&session.role==="owner"&&r.company&&<div style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:8,padding:"2px 8px",display:"inline-block",marginBottom:6}}>🏢 {r.company}</div>}
                  {r.file_url?<a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"#B8924A18",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,textDecoration:"none"}}>{t.viewFile}</a>:<span style={{fontSize:12,color:"#aaa"}}>{t.noFile}</span>}
                </>:<>
                  <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.name}</div>
                  {r.contact&&<div style={{fontSize:13,color:"#666",marginBottom:2}}>👤 {r.contact}</div>}
                  {r.service&&<div style={{fontSize:13,color:"#B8924A",fontWeight:600,marginBottom:2}}>🔧 {r.service}</div>}
                  {r.phone&&<div style={{fontSize:13,marginBottom:2}}><a href={`tel:${r.phone.replace(/\D/g,"")}`} style={{color:"#2563EB",textDecoration:"none"}}>📞 {r.phone}</a></div>}
                  {r.email&&<div style={{fontSize:13,color:"#666",marginBottom:2}}>✉️ {r.email}</div>}
                  {r.address&&<div style={{fontSize:13,color:"#666",marginBottom:2}}>📍 {r.address}</div>}
                  {r.notes&&<div style={{fontSize:12,color:"#888",marginTop:4,fontStyle:"italic"}}>{r.notes}</div>}
                  {!forceCompany&&session.role==="owner"&&r.company&&<div style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:8,padding:"2px 8px",display:"inline-block",marginTop:6}}>🏢 {r.company}</div>}
                </>}
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>{setEditing(r);setShowForm(true);}} style={{background:"#F9F7F4",color:"#B8924A",border:"1px solid #B8924A33",borderRadius:8,padding:"5px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>✏️</button>
                <button onClick={()=>remove(r.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"5px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>🗑️</button>
              </div>
            </div>
          </div>
        ))
      }
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
          <div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>{editing?"✏️ Editar":"➕ Novo"}</div>
            {sub==="clients"&&<><FF label={t.name} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="John Smith"/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><FF label={t.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div><div style={{flex:1}}><FF label={t.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/></div></div><FF label={t.addr} value={form.address} onChange={v=>setForm(f=>({...f,address:v}))}/><FF label={t.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
            {sub==="builders"&&<><FF label={t.contactCo} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Brown Haven Homes"/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><FF label={t.contactPerson} value={form.contact} onChange={v=>setForm(f=>({...f,contact:v}))}/></div><div style={{flex:1}}><FF label={t.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div></div><FF label={t.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><FF label={t.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
            {sub==="contractors"&&<><FF label={t.name} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Alberth"/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><FF label={t.svcType} value={form.service} onChange={v=>setForm(f=>({...f,service:v}))}/></div><div style={{flex:1}}><FF label={t.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div></div><FF label={t.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><FF label={t.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
            {sub==="contracts"&&<><FF label={t.contractTitle} value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Contract #001"/><FF label={t.relatedTo} value={form.related_to} onChange={v=>setForm(f=>({...f,related_to:v}))}/><FF label={t.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/><div style={{marginBottom:12}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:6}}>{t.uploadFile}</label>{form.file_url&&<a href={form.file_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"#B8924A18",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:8}}>{t.viewFile}</a>}<div style={{display:"flex",gap:10,alignItems:"center"}}><button onClick={()=>fileRef.current.click()} style={{background:"#F9F7F4",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:8,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>📎 {uploadFile?uploadFile.name:t.uploadFile}</button></div><input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" style={{display:"none"}} onChange={e=>setUploadFile(e.target.files[0])}/></div></>}
            <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={save} disabled={saving} style={{flex:1,background:"#B8924A",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:14,cursor:"pointer",opacity:saving?0.7:1}}>{saving?t.saving:t.saveChanges}</button><button onClick={()=>{setShowForm(false);setEditing(null);}} style={{background:"#F3F4F6",color:"#374151",border:"none",borderRadius:10,padding:"12px 16px",cursor:"pointer",fontSize:14}}>{t.cancel}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPANIES TAB ────────────────────────────────────────────────────
function CompaniesTab({ t, showToast, allJobs, allInstallers }) {
  const [admins,setAdmins]=useState([]);
  const [selected,setSelected]=useState(null); // {admin, company}
  const [companyTab,setCompanyTab]=useState("jobs");
  const [companyInstallers,setCompanyInstallers]=useState([]);
  const [companyJobs,setCompanyJobs]=useState([]);
  const [showJobForm,setShowJobForm]=useState(false);
  const [editingJob,setEditingJob]=useState(null);
  const [saving,setSaving]=useState(false);
  const [installerNames,setInstallerNames]=useState([]);

  const loadAdmins=async()=>{ const {data}=await supabase.from("admins").select("*").order("company"); if(data) setAdmins(data); };
  useEffect(()=>{ loadAdmins(); },[]);

  const openCompany=async(admin)=>{
    setSelected(admin); setCompanyTab("jobs");
    const {data:jobs}=await supabase.from("jobs").select("*").eq("company",admin.company).order("date",{ascending:true});
    const {data:photos}=await supabase.from("job_photos").select("*");
    const ph=photos||[];
    setCompanyJobs((jobs||[]).map(j=>({...j,photos:ph.filter(p=>p.job_id===j.id)})));
    const {data:inst}=await supabase.from("installers").select("*").eq("company",admin.company).order("name");
    setCompanyInstallers(inst||[]);
    setInstallerNames((inst||[]).map(i=>i.name));
  };

  const saveJob=async(form)=>{
    setSaving(true);
    const payload={...form,company:selected.company,square_footage:form.square_footage?Number(form.square_footage):null};
    if(editingJob){ await supabase.from("jobs").update(payload).eq("id",editingJob.id); setCompanyJobs(prev=>prev.map(j=>j.id===editingJob.id?{...j,...payload}:j)); showToast(t.jobUpdated); }
    else { const {data}=await supabase.from("jobs").insert([payload]).select().single(); if(data) setCompanyJobs(prev=>[...prev,{...data,photos:[]}]); showToast(t.jobCreated); }
    setSaving(false); setShowJobForm(false); setEditingJob(null);
  };

  const deleteJob=async(id)=>{ if(!confirm(t.confirmDelJob)) return; await supabase.from("jobs").delete().eq("id",id); setCompanyJobs(prev=>prev.filter(j=>j.id!==id)); showToast(t.jobDeleted); };

  const removeInstaller=async(id)=>{ if(!confirm(t.confirmDelInstaller)) return; await supabase.from("installers").delete().eq("id",id); setCompanyInstallers(prev=>prev.filter(i=>i.id!==id)); showToast(t.contactDeleted); };

  const removeAdmin=async(id)=>{ if(!confirm(t.confirmDelAdmin)) return; await supabase.from("admins").delete().eq("id",id); loadAdmins(); setSelected(null); showToast(t.contactDeleted); };

  // Company stats
  const getStats=(company)=>{
    const cj=allJobs.filter(j=>j.company===company);
    const active=cj.filter(j=>j.status==="scheduled"||j.status==="in_progress").length;
    const ci=allInstallers.filter(i=>i.company===company).length;
    return {active,total:cj.length,installers:ci};
  };

  if(selected) return (
    <div>
      <button onClick={()=>setSelected(null)} style={{background:"none",border:"1px solid #E5E7EB",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",color:"#666",marginBottom:14}}>← {t.companiesTitle}</button>
      {/* Company header */}
      <div style={{background:"#1A1A1A",borderRadius:14,padding:20,marginBottom:14,borderBottom:"3px solid #B8924A"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:11,color:"#B8924A",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>⚙️ {selected.name}</div><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{selected.company}</div></div>
          <button onClick={()=>removeAdmin(selected.id)} style={{background:"#DC262622",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>🗑️ Admin</button>
        </div>
        <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"#bbb"}}>📋 {companyJobs.filter(j=>j.status==="scheduled"||j.status==="in_progress").length} {t.activeJobs}</span>
          <span style={{fontSize:13,color:"#bbb"}}>📊 {companyJobs.length} {t.totalJobs}</span>
          <span style={{fontSize:13,color:"#bbb"}}>👷 {companyInstallers.length} {t.installers}</span>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{id:"jobs",label:`📋 ${t.companyJobs}`},{id:"installers",label:`👷 ${t.companyInstallers}`},{id:"clients",label:`📇 ${t.contacts}`}].map(ct=>(
          <button key={ct.id} onClick={()=>setCompanyTab(ct.id)} style={{background:companyTab===ct.id?"#1A1A1A":"#fff",color:companyTab===ct.id?"#B8924A":"#666",border:`1px solid ${companyTab===ct.id?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{ct.label}</button>
        ))}
      </div>

      {/* JOBS */}
      {companyTab==="jobs"&&(
        <>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <button onClick={()=>{setEditingJob(null);setShowJobForm(true);}} style={{background:"#B8924A",color:"#fff",border:"none",borderRadius:20,padding:"7px 16px",fontSize:12,fontWeight:800,cursor:"pointer"}}>{t.newJob}</button>
          </div>
          {companyJobs.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>📋</div><div>{t.noJobs}</div></div>
            :<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {companyJobs.map(job=>{
                const color=SC[job.status]||SC.scheduled;
                return (
                  <div key={job.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",borderLeft:`4px solid ${color}`,padding:16,boxShadow:"0 2px 6px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><SBadge status={job.status} t={t}/>{job.square_footage&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.square_footage} SF</span>}</div>
                        <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
                        {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
                        <div style={{fontSize:13,color:"#666",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {job.address}</div>
                        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#999"}}>📅 {formatDate(job.date)} {job.time}</span>{job.assigned_to&&<span style={{fontSize:12,color:"#999"}}>👷 {job.assigned_to}</span>}</div>
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        <button onClick={()=>{setEditingJob(job);setShowJobForm(true);}} style={{background:"#F9F7F4",color:"#B8924A",border:"1px solid #B8924A33",borderRadius:8,padding:"5px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>✏️</button>
                        <button onClick={()=>deleteJob(job.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"5px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </>
      )}

      {/* INSTALLERS */}
      {companyTab==="installers"&&(
        <div>
          {companyInstallers.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>👷</div><div>{t.noJobs}</div></div>
            :<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {companyInstallers.map(inst=>(
                <div key={inst.id} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:15,fontWeight:800,color:"#1A1A1A"}}>{inst.name}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>👷 {t.installer}</div></div>
                  <button onClick={()=>removeInstaller(inst.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.remove}</button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* CONTACTS */}
      {companyTab==="clients"&&(
        <ContactsTab session={{role:"owner"}} t={t} showToast={showToast} forceCompany={selected.company}/>
      )}

      {showJobForm&&(
        <JobForm onSave={saveJob} onCancel={()=>{setShowJobForm(false);setEditingJob(null);}} saving={saving} installerNames={installerNames} initial={editingJob} t={t} forceCompany={selected.company}/>
      )}
    </div>
  );

  // Companies list
  return (
    <div>
      <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A",marginBottom:16}}>{t.companiesTitle}</div>
      {admins.length===0?<div style={{textAlign:"center",padding:"40px",color:"#bbb"}}><div style={{fontSize:44,marginBottom:10}}>🏢</div><div>{t.noCompanies}</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:12}}>
          {admins.map(admin=>{
            const stats=getStats(admin.company);
            return (
              <div key={admin.id} onClick={()=>openCompany(admin)} style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",borderLeft:"4px solid #B8924A",padding:18,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"}>
                <div style={{fontSize:18,fontWeight:900,color:"#1A1A1A",marginBottom:4}}>{admin.company}</div>
                <div style={{fontSize:13,color:"#888",marginBottom:10}}>⚙️ Admin: {admin.name}</div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <div style={{background:"#FDF6EC",borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:900,color:"#B8924A"}}>{stats.active}</div>
                    <div style={{fontSize:10,color:"#B8924A",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.activeJobs}</div>
                  </div>
                  <div style={{background:"#F3F4F6",borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:900,color:"#555"}}>{stats.total}</div>
                    <div style={{fontSize:10,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.totalJobs}</div>
                  </div>
                  <div style={{background:"#EFF6FF",borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:900,color:"#2563EB"}}>{stats.installers}</div>
                    <div style={{fontSize:10,color:"#2563EB",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.installers}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────────────
function CalendarView({ jobs, onSelectJob, t }) {
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear()); const [month,setMonth]=useState(today.getMonth());
  const [sel,setSel]=useState(todayStr());
  const fd=new Date(year,month,1).getDay(), dim=new Date(year,month+1,0).getDate(), tf=todayStr();
  const jbd={}; jobs.forEach(j=>{ if(j.date){ if(!jbd[j.date]) jbd[j.date]=[]; jbd[j.date].push(j); }});
  const prev=()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next=()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const selJobs=jbd[sel]||[];
  return (
    <div>
      <div style={{background:"#1A1A1A",borderRadius:14,padding:"16px 20px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><button onClick={prev} style={{background:"#2A2A2A",border:"none",color:"#B8924A",borderRadius:8,padding:"6px 14px",fontSize:18,cursor:"pointer"}}>‹</button><div style={{color:"#fff",fontWeight:800,fontSize:16}}>{t.months[month]} {year}</div><button onClick={next} style={{background:"#2A2A2A",border:"none",color:"#B8924A",borderRadius:8,padding:"6px 14px",fontSize:18,cursor:"pointer"}}>›</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{t.days.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#666",fontWeight:700,padding:"4px 0"}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array(fd).fill(null).map((_,i)=><div key={`e${i}`}/>)}
          {Array(dim).fill(null).map((_,i)=>{
            const day=i+1, ds=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`, dj=jbd[ds]||[], isT=ds===tf, isS=ds===sel;
            return <button key={day} onClick={()=>setSel(ds)} style={{background:isS?"#B8924A":isT?"#2A2A2A":"transparent",border:isT&&!isS?"1px solid #B8924A44":"none",borderRadius:8,padding:"6px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:13,fontWeight:isT||isS?800:400,color:isS?"#fff":isT?"#B8924A":"#ccc"}}>{day}</span>
              {dj.length>0&&<div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>{dj.slice(0,3).map((j,idx)=><div key={idx} style={{width:5,height:5,borderRadius:"50%",background:SC[j.status]||SC.scheduled}}/>)}</div>}
            </button>;
          })}
        </div>
      </div>
      <div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:10}}>📅 {formatDate(sel)}<span style={{color:"#999",fontWeight:400,marginLeft:8}}>{selJobs.length===0?"—":`${selJobs.length} ${t.work}`}</span></div>
      {selJobs.length===0?<div style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",padding:"20px",textAlign:"center",color:"#bbb",fontSize:13}}>—</div>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {selJobs.map(job=>(
            <div key={job.id} onClick={()=>onSelectJob(job)} style={{background:"#fff",borderRadius:12,border:"1px solid #E5E7EB",borderLeft:`4px solid ${SC[job.status]||SC.scheduled}`,padding:"14px 16px",cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><SBadge status={job.status} t={t}/>{job.square_footage&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.square_footage} SF</span>}</div>
              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
              {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
              <div style={{fontSize:13,color:"#666",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {job.address}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:4}}><span style={{fontSize:12,color:"#999"}}>🕐 {job.time}</span>{job.assigned_to&&<span style={{fontSize:12,color:"#999"}}>👷 {job.assigned_to}</span>}</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────
function DetailView({ job, session, t, onUpdateStatus, onAddPhoto, onDeletePhoto, onSaveNotes, onEdit, onDelete, uploading }) {
  const [notes,setNotes]=useState(job.completion_notes||""); const [sn,setSn]=useState(false);
  const isAdmin=session.role==="admin"||session.role==="owner";
  const color=SC[job.status]||SC.scheduled;
  const ap=(job.photos||[]).filter(p=>p.type==="admin"), cp=(job.photos||[]).filter(p=>p.type==="completion");
  const sl={scheduled:t.scheduled,in_progress:t.inProgress,completed:t.completed,cancelled:t.cancelled};
  const hn=async()=>{ setSn(true); await onSaveNotes(job.id,notes); setSn(false); };
  return (
    <div>
      <div style={{background:"#1A1A1A",borderRadius:14,padding:20,borderBottom:`4px solid ${color}`,marginBottom:14,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div style={{flex:1}}><div style={{fontSize:11,color:"#B8924A",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{job.work_order}</div><SBadge status={job.status} t={t}/><div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8}}>{job.client}</div>{job.builder&&<div style={{fontSize:13,color:"#B8924A",marginTop:2,fontWeight:600}}>💰 {job.builder}</div>}<div style={{fontSize:14,color:"#aaa",marginTop:2}}>{job.service}</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            {job.square_footage&&<div style={{background:"#B8924A",borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{job.square_footage}</div><div style={{fontSize:10,color:"#fff",opacity:0.8,letterSpacing:1}}>SF</div></div>}
            {isAdmin&&<div style={{display:"flex",gap:6}}><button onClick={onEdit} style={{background:"#2A2A2A",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.edit}</button><button onClick={onDelete} style={{background:"#DC262622",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.delete}</button></div>}
          </div>
        </div>
        <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>{[["📅",`${formatDate(job.date)} ${job.time}`],["👷",job.assigned_to||"—"],["⏱",`~${job.estimated_hours}h`]].map(([icon,val])=><span key={val} style={{fontSize:13,color:"#bbb"}}>{icon} {val}</span>)}</div>
      </div>
      {(job.client_phone||job.installer_phone)&&<div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,marginBottom:12}}><ST>{t.contactsT}</ST><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><PhoneBtn phone={job.client_phone} label={t.client.replace(" *","")} color="#2563EB"/><PhoneBtn phone={job.installer_phone} label={t.installerF} color="#B8924A"/></div></div>}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,marginBottom:12}}><ST>{t.addrAccess}</ST><div style={{fontSize:15,fontWeight:700,color:"#1A1A1A",marginBottom:8}}>{job.address}</div>{job.access_notes&&<div style={{background:"#FFFBF5",border:"1px solid #B8924A44",borderRadius:8,padding:12,fontSize:14,color:"#555",lineHeight:1.7}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A",display:"block",marginBottom:4}}>{t.accessLbl}</span>{job.access_notes}</div>}</div>
      {job.scope&&<div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,marginBottom:12}}><ST>{t.scopeT}</ST><div style={{fontSize:14,color:"#444",lineHeight:1.7}}>{job.scope}</div></div>}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,marginBottom:12}}><ST>{t.sitePhotos}</ST><PhotoGrid photos={ap} onDelete={p=>onDeletePhoto(p)} canDelete={isAdmin}/>{isAdmin&&<PhotoUploadBtn onAdd={f=>onAddPhoto(job.id,"admin",f)} uploading={uploading}/>}{ap.length===0&&<div style={{fontSize:13,color:"#aaa",marginTop:6}}>{t.noPhoto}</div>}</div>
      {isAdmin&&<div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,marginBottom:12}}><ST>{t.statusT}</ST><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(sl).map(([key,label])=><button key={key} onClick={()=>onUpdateStatus(job.id,key)} style={{background:job.status===key?SC[key]:SB[key],color:job.status===key?"#fff":SC[key],border:`1px solid ${SC[key]}`,borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>)}</div></div>}
      <div style={{background:"#fff",borderRadius:14,border:"2px solid #16A34A33",padding:16,marginBottom:12}}>
        <ST>{t.conclusion}</ST>
        <PhotoGrid photos={cp} onDelete={p=>onDeletePhoto(p)} canDelete={true}/>
        <PhotoUploadBtn onAdd={f=>onAddPhoto(job.id,"completion",f)} uploading={uploading}/>
        <div style={{marginTop:12}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:6}}>{t.notesLbl}</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder={t.notesPH} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 12px",fontSize:14,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/><button onClick={hn} disabled={sn} style={{marginTop:8,background:"#16A34A",color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontWeight:700,cursor:"pointer",fontSize:13,opacity:sn?0.7:1}}>{sn?"...":t.saveNotes}</button></div>
      </div>
      {session.role==="installer"&&job.status!=="completed"&&<button onClick={()=>onUpdateStatus(job.id,"completed")} style={{width:"100%",background:"#16A34A",color:"#fff",border:"none",borderRadius:12,padding:15,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:14}}>{t.markDone}</button>}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]=useState(()=>localStorage.getItem("cl_lang")||"pt");
  const t=T[lang];
  const [session,setSession]=useState(null);
  const [tab,setTab]=useState("list");
  const [view,setView]=useState("main");
  const [jobs,setJobs]=useState([]);
  const [allInstallers,setAllInstallers]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editingJob,setEditingJob]=useState(null);
  const [showAdmins,setShowAdmins]=useState(false);
  const [showInstallers,setShowInstallers]=useState(false);
  const [toast,setToast]=useState(null);
  const [filterStatus,setFilterStatus]=useState("all");
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [installerNames,setInstallerNames]=useState([]);

  const showToast=(msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const isAdmin=session?.role==="admin"||session?.role==="owner";

  const loadJobs=async()=>{
    setLoading(true);
    let q=supabase.from("jobs").select("*").order("date",{ascending:true});
    if(session?.role==="admin") q=q.eq("company",session.company);
    if(session?.role==="installer") q=q.eq("assigned_to",session.name);
    const {data:jd,error}=await q; if(error){showToast(t.errLoad,"error");setLoading(false);return;}
    const {data:pd}=await supabase.from("job_photos").select("*"); const photos=pd||[];
    setJobs((jd||[]).map(j=>({...j,photos:photos.filter(p=>p.job_id===j.id)})));
    setLoading(false);
  };
  const loadInstallerNames=async()=>{
    let q=supabase.from("installers").select("name,company").order("name");
    if(session?.role==="admin") q=q.eq("company",session.company);
    const {data}=await q;
    if(data){ setInstallerNames(data.map(i=>i.name)); setAllInstallers(data); }
  };
  useEffect(()=>{ if(session){ loadJobs(); if(isAdmin) loadInstallerNames(); } },[session]);

  const selectedJob=jobs.find(j=>j.id===selectedId);
  const filteredJobs=jobs.filter(j=>filterStatus==="all"||j.status===filterStatus);

  const saveJob=async(form)=>{ setSaving(true); const company=session.role==="admin"?session.company:"Owner"; const {data,error}=await supabase.from("jobs").insert([{...form,company}]).select().single(); if(error){showToast(t.errSave,"error");setSaving(false);return;} setJobs(prev=>[...prev,{...data,photos:[]}]); setShowForm(false);setSaving(false);showToast(t.jobCreated); };
  const updateJob=async(form)=>{ setSaving(true); const {error}=await supabase.from("jobs").update(form).eq("id",editingJob.id); if(error){showToast(t.errSave,"error");setSaving(false);return;} setJobs(prev=>prev.map(j=>j.id===editingJob.id?{...j,...form}:j)); setEditingJob(null);setSaving(false);showToast(t.jobUpdated); };
  const deleteJob=async(id)=>{ if(!confirm(t.confirmDelJob)) return; await supabase.from("job_photos").delete().eq("job_id",id); await supabase.from("jobs").delete().eq("id",id); setJobs(prev=>prev.filter(j=>j.id!==id)); setView("main");showToast(t.jobDeleted); };
  const updateStatus=async(id,status)=>{ const {error}=await supabase.from("jobs").update({status}).eq("id",id); if(error){showToast(t.errSave,"error");return;} setJobs(prev=>prev.map(j=>j.id===id?{...j,status}:j)); showToast(t.statusUpdated); };
  const addPhoto=async(jobId,type,file)=>{ setUploading(true); const ext=file.name.split(".").pop(); const path=`${jobId}/${type}-${Date.now()}.${ext}`; const {error:upErr}=await supabase.storage.from("job-photos").upload(path,file); if(upErr){showToast(t.errPhoto,"error");setUploading(false);return;} const {data:{publicUrl}}=supabase.storage.from("job-photos").getPublicUrl(path); const {data:photo,error:dbErr}=await supabase.from("job_photos").insert([{job_id:jobId,type,url:publicUrl}]).select().single(); if(dbErr){showToast(t.errPhoto,"error");setUploading(false);return;} setJobs(prev=>prev.map(j=>j.id===jobId?{...j,photos:[...(j.photos||[]),photo]}:j)); setUploading(false);showToast(t.photoSent); };
  const deletePhoto=async(photo)=>{ if(!confirm(t.removePhoto)) return; const path=photo.url.split("/job-photos/")[1]; await supabase.storage.from("job-photos").remove([path]); await supabase.from("job_photos").delete().eq("id",photo.id); setJobs(prev=>prev.map(j=>({...j,photos:(j.photos||[]).filter(p=>p.id!==photo.id)}))); showToast(t.photoRemoved); };
  const saveNotes=async(id,notes)=>{ const {error}=await supabase.from("jobs").update({completion_notes:notes}).eq("id",id); if(error){showToast(t.errSave,"error");return;} setJobs(prev=>prev.map(j=>j.id===id?{...j,completion_notes:notes}:j)); showToast(t.saved); };
  const openJob=(job)=>{ setSelectedId(job.id); setView("detail"); };
  const fl={all:t.all,scheduled:t.scheduled,in_progress:t.inProgress,completed:t.completed,cancelled:t.cancelled};

  const tabs=[
    {id:"list",icon:"📋",label:t.jobs},
    {id:"calendar",icon:"📅",label:t.calendar},
    ...(session?.role==="owner"?[{id:"companies",icon:"🏢",label:t.companies}]:[]),
    ...(isAdmin?[{id:"contacts",icon:"📇",label:t.contacts}]:[]),
  ];

  if(!session) return <LoginScreen onLogin={setSession} lang={lang} setLang={setLang}/>;

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#F9F7F4",minHeight:"100vh",paddingBottom:70}}>
      <div style={{background:"#1A1A1A",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,borderBottom:"3px solid #B8924A",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,fontWeight:900,color:"#B8924A",letterSpacing:-1}}>CasaLuma</span><span style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Field</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <LangSwitcher lang={lang} setLang={l=>{setLang(l);localStorage.setItem("cl_lang",l);}}/>
          {session.role==="owner"&&<button onClick={()=>setShowAdmins(true)} style={{background:"#2A2A2A",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"3px 9px",fontSize:11,cursor:"pointer",fontWeight:700}}>⚙️</button>}
          {isAdmin&&<button onClick={()=>setShowInstallers(true)} style={{background:"#2A2A2A",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"3px 9px",fontSize:11,cursor:"pointer",fontWeight:700}}>👷</button>}
          <span style={{background:"#B8924A22",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{session.role==="owner"?"👑":session.role==="admin"?"⚙️":"🔨"} {session.name}</span>
          {view==="detail"&&<button onClick={()=>setView("main")} style={{background:"none",border:"1px solid #444",color:"#ccc",borderRadius:20,padding:"3px 9px",fontSize:11,cursor:"pointer"}}>{t.back}</button>}
          <button onClick={()=>setSession(null)} style={{background:"none",border:"none",color:"#555",fontSize:18,cursor:"pointer"}}>↩</button>
        </div>
      </div>

      {toast&&<div style={{position:"fixed",top:66,right:14,zIndex:999,background:toast.type==="error"?"#DC2626":"#16A34A",color:"#fff",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{toast.msg}</div>}

      <div style={{maxWidth:880,margin:"0 auto",padding:"16px 14px"}}>
        {view==="detail"&&selectedJob&&(
          <DetailView job={selectedJob} session={session} t={t} onUpdateStatus={updateStatus} onAddPhoto={addPhoto} onDeletePhoto={deletePhoto} onSaveNotes={saveNotes} onEdit={()=>setEditingJob(selectedJob)} onDelete={()=>deleteJob(selectedJob.id)} uploading={uploading}/>
        )}
        {view==="main"&&(
          <>
            {tab==="list"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#1A1A1A"}}>{session.role==="installer"?`${t.myJobs} ${session.name}`:session.role==="admin"?session.company:t.allJobs}</div><div style={{fontSize:12,color:"#999"}}>{filteredJobs.length} {t.work}</div></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    {Object.entries(fl).map(([k,label])=><button key={k} onClick={()=>setFilterStatus(k)} style={{background:filterStatus===k?"#1A1A1A":"#fff",color:filterStatus===k?"#B8924A":"#666",border:`1px solid ${filterStatus===k?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{label}</button>)}
                    <button onClick={loadJobs} style={{background:"#F3F4F6",color:"#555",border:"1px solid #E5E7EB",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>↻</button>
                    {isAdmin&&<button onClick={()=>setShowForm(true)} style={{background:"#B8924A",color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:800,cursor:"pointer"}}>{t.newJob}</button>}
                  </div>
                </div>
                {loading?<div style={{textAlign:"center",padding:"50px",color:"#aaa"}}><div style={{fontSize:30,marginBottom:8}}>⏳</div><div>{t.loading}</div></div>
                  :filteredJobs.length===0?<div style={{textAlign:"center",padding:"50px",color:"#bbb"}}><div style={{fontSize:40,marginBottom:8}}>📋</div><div style={{fontSize:15,fontWeight:600}}>{t.noJobs}</div></div>
                  :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {filteredJobs.map(job=>{
                      const color=SC[job.status]||SC.scheduled, cc=(job.photos||[]).filter(p=>p.type==="completion").length, ap=(job.photos||[]).find(p=>p.type==="admin");
                      return (
                        <div key={job.id} onClick={()=>openJob(job)} style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",borderLeft:`4px solid ${color}`,padding:16,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,0.04)"}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><SBadge status={job.status} t={t}/>{job.square_footage&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.square_footage} SF</span>}</div>
                              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
                              {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
                              <div style={{fontSize:13,color:"#666",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {job.address}</div>
                              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#999"}}>📅 {formatDate(job.date)} {job.time}</span><span style={{fontSize:12,color:"#999"}}>🔧 {job.service}</span>{job.assigned_to&&<span style={{fontSize:12,color:"#999"}}>👷 {job.assigned_to}</span>}</div>
                              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                                {job.client_phone&&<span style={{fontSize:11,color:"#2563EB",background:"#EFF6FF",borderRadius:10,padding:"2px 8px",fontWeight:600}}>📞</span>}
                                {cc>0&&<span style={{fontSize:11,color:"#16A34A",background:"#F0FDF4",borderRadius:10,padding:"2px 8px",fontWeight:600}}>✅ {cc}</span>}
                                {session.role==="owner"&&job.company&&<span style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:10,padding:"2px 8px",fontWeight:600}}>🏢 {job.company}</span>}
                              </div>
                            </div>
                            {ap&&<img src={ap.url} alt="" style={{width:74,height:60,objectFit:"cover",borderRadius:8,border:"2px solid #E5E7EB",flexShrink:0}}/>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }
              </>
            )}
            {tab==="calendar"&&<CalendarView jobs={jobs} onSelectJob={openJob} t={t}/>}
            {tab==="companies"&&session.role==="owner"&&<CompaniesTab t={t} showToast={showToast} allJobs={jobs} allInstallers={allInstallers}/>}
            {tab==="contacts"&&isAdmin&&<ContactsTab session={session} t={t} showToast={showToast}/>}
          </>
        )}
      </div>

      {view==="main"&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#1A1A1A",borderTop:"2px solid #B8924A",display:"flex",zIndex:100}}>
          {tabs.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:"11px 6px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:19}}>{tb.icon}</span><span style={{fontSize:10,fontWeight:700,color:tab===tb.id?"#B8924A":"#555"}}>{tb.label}</span></button>)}
        </div>
      )}

      {showForm&&isAdmin&&<JobForm onSave={saveJob} onCancel={()=>setShowForm(false)} saving={saving} installerNames={installerNames} t={t}/>}
      {editingJob&&isAdmin&&<JobForm onSave={updateJob} onCancel={()=>setEditingJob(null)} saving={saving} installerNames={installerNames} initial={editingJob} t={t}/>}
      {showAdmins&&session.role==="owner"&&(
        <div style={{position:"fixed",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
          <AdminManagerModal onClose={()=>setShowAdmins(false)} t={t}/>
        </div>
      )}
      {showInstallers&&isAdmin&&(
        <div style={{position:"fixed",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
          <InstallerManagerModal session={session} onClose={()=>{setShowInstallers(false);loadInstallerNames();}} t={t}/>
        </div>
      )}
    </div>
  );
}

function AdminManagerModal({ onClose, t }) {
  const [admins,setAdmins]=useState([]); const [name,setName]=useState(""); const [company,setCompany]=useState(""); const [pw,setPw]=useState(""); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
  const load=async()=>{ const {data}=await supabase.from("admins").select("*").order("company"); if(data) setAdmins(data); };
  useEffect(()=>{ load(); },[]);
  const add=async()=>{ if(!name||!company||!pw){setMsg(t.fillAll);return;} setSaving(true); const {error}=await supabase.from("admins").insert([{name,company,password:pw}]); setSaving(false); if(error){setMsg(t.errDup);return;} setName("");setCompany("");setPw("");setMsg(t.adminAdded);load();setTimeout(()=>setMsg(""),3000); };
  const remove=async(id)=>{ if(!confirm(t.confirmDelAdmin)) return; await supabase.from("admins").delete().eq("id",id); load(); };
  return (
    <div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div style={{fontSize:16,fontWeight:800}}>{t.manageAdmins}</div><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#666"}}>×</button></div>
      {msg&&<div style={{background:"#F0FDF4",color:"#16A34A",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,marginBottom:12}}>{msg}</div>}
      <div style={{background:"#F9F7F4",borderRadius:12,padding:14,marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>{t.newAdmin}</div>
        <FF label={t.adminName} value={name} onChange={setName} placeholder="John"/><FF label={t.company} value={company} onChange={setCompany} placeholder="CasaLuma Group"/><FF label={t.password} value={pw} onChange={setPw} type="password" placeholder="••••••••"/>
        <button onClick={add} disabled={saving} style={{width:"100%",background:"#B8924A",color:"#fff",border:"none",borderRadius:8,padding:10,fontWeight:700,cursor:"pointer",fontSize:13}}>{saving?t.saving:t.addBtn}</button>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:"#666",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{t.registered} ({admins.length})</div>
      {admins.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#F9F7F4",borderRadius:10,marginBottom:8}}><div><div style={{fontSize:14,fontWeight:700}}>{a.name}</div><div style={{fontSize:12,color:"#888"}}>🏢 {a.company}</div></div><button onClick={()=>remove(a.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.remove}</button></div>)}
    </div>
  );
}

function InstallerManagerModal({ session, onClose, t }) {
  const [installers,setInstallers]=useState([]); const [name,setName]=useState(""); const [pw,setPw]=useState(""); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
  const company=session.role==="owner"?null:session.company;
  const load=async()=>{ let q=supabase.from("installers").select("*").order("name"); if(company) q=q.eq("company",company); const {data}=await q; if(data) setInstallers(data); };
  useEffect(()=>{ load(); },[]);
  const add=async()=>{ if(!name||!pw){setMsg(t.fillAll);return;} setSaving(true); const {error}=await supabase.from("installers").insert([{name,password:pw,company:company||"Owner"}]); setSaving(false); if(error){setMsg(t.errDup);return;} setName("");setPw("");setMsg(t.installerAdded);load();setTimeout(()=>setMsg(""),3000); };
  const remove=async(id)=>{ if(!confirm(t.confirmDelInstaller)) return; await supabase.from("installers").delete().eq("id",id); load(); };
  return (
    <div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div style={{fontSize:16,fontWeight:800}}>{t.manageInstallers}{company?` — ${company}`:""}</div><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#666"}}>×</button></div>
      {msg&&<div style={{background:"#F0FDF4",color:"#16A34A",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,marginBottom:12}}>{msg}</div>}
      <div style={{background:"#F9F7F4",borderRadius:12,padding:14,marginBottom:18}}>
        <FF label={t.installerName} value={name} onChange={setName} placeholder="Alberth"/><FF label={t.password} value={pw} onChange={setPw} type="password" placeholder="••••••••"/>
        <button onClick={add} disabled={saving} style={{width:"100%",background:"#B8924A",color:"#fff",border:"none",borderRadius:8,padding:10,fontWeight:700,cursor:"pointer",fontSize:13}}>{saving?t.saving:t.addInstaller}</button>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:"#666",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{t.registered} ({installers.length})</div>
      {installers.map(inst=><div key={inst.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#F9F7F4",borderRadius:10,marginBottom:8}}><div><div style={{fontSize:14,fontWeight:700}}>{inst.name}</div>{session.role==="owner"&&<div style={{fontSize:12,color:"#888"}}>🏢 {inst.company}</div>}</div><button onClick={()=>remove(inst.id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.remove}</button></div>)}
    </div>
  );
}
