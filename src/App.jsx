import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://gvkkzdzfjiafpjkyscjn.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2t6ZHpmamlhZnBqa3lzY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODM0MTUsImV4cCI6MjA4NzM1OTQxNX0.DUSrbbqced4HgC0HOAaJ2ERPDHc7gYFiHHHBPDEB1Zg";
const db = createClient(SB_URL, SB_KEY);
const OWNER_PW = "Faf1022@";
const SESSION_KEY = "profield_session";

const DEFAULT_SERVICES = ["Countertop Installation","Cabinet Installation","Kitchen Remodeling","Flooring","Tile Work","Bathroom Remodel","Landscaping","Roof Work","Pool Service","Cleaning","Painting","Electrical","Plumbing","Other"];

const CLEANING_SERVICES = ["Limpeza Padrão","Limpeza Profunda","Pós-Obra","Limpeza de Mudança","Limpeza de Escritório","Outro"];
const CLINIC_SERVICES = ["Consulta de Rotina","Retorno","Avaliação Inicial","Procedimento","Exame","Outro"];
const FREQUENCY_OPTS = ["Avulso","Semanal","Quinzenal","Mensal"];
const JOB_STATUS_OPTS = ["scheduled","in_progress","completed","cancelled"];

const VERTICALS = {
  construction: { label:"Construction", icon:"🧱", accent:"#B8924A", services:DEFAULT_SERVICES },
  cleaning:     { label:"House Cleaning", icon:"🧽", accent:"#7C9885", services:CLEANING_SERVICES },
  clinic:       { label:"Clinics", icon:"🩺", accent:"#5B7C99", services:CLINIC_SERVICES },
};
function getVertical(v){ return VERTICALS[v] || VERTICALS.construction; }
const SC = {scheduled:"#B8924A",in_progress:"#2563EB",completed:"#16A34A",cancelled:"#DC2626"};
const SBG = {scheduled:"#FDF6EC",in_progress:"#EFF6FF",completed:"#F0FDF4",cancelled:"#FEF2F2"};

// ─── HELPERS ──────────────────────────────────────────────────────────
const fmt = d => { if(!d) return ""; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const today = () => new Date().toISOString().split("T")[0];
const firstOfMonth = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; };

// ─── UI ATOMS ─────────────────────────────────────────────────────────
const Badge = ({status,label}) => <span style={{background:SBG[status]||SBG.scheduled,color:SC[status]||SC.scheduled,border:`1px solid ${SC[status]||SC.scheduled}33`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
const Tel = ({phone,label,color="#B8924A"}) => phone?<a href={`tel:${phone.replace(/\D/g,"")}`} style={{display:"inline-flex",alignItems:"center",gap:6,background:color+"18",color,border:`1px solid ${color}44`,borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:700,textDecoration:"none"}}>📞 {label}: {phone}</a>:null;
const Sec = ({children}) => <div style={{fontSize:11,fontWeight:800,color:"#1A1A1A",marginBottom:10,textTransform:"uppercase",letterSpacing:0.8}}>{children}</div>;
const Card = ({children,style,onClick}) => <div onClick={onClick} style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:16,boxShadow:"0 2px 6px rgba(0,0,0,0.04)",cursor:onClick?"pointer":"default",...style}}>{children}</div>;
const Btn = ({children,onClick,variant="primary",disabled,style}) => {
  const styles = {primary:{background:"#B8924A",color:"#fff",border:"none"},secondary:{background:"#F3F4F6",color:"#374151",border:"none"},danger:{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633"},ghost:{background:"none",color:"#B8924A",border:"1px solid #B8924A44"}};
  return <button onClick={onClick} disabled={disabled} style={{...styles[variant],borderRadius:10,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.7:1,...style}}>{children}</button>;
};
const Input = ({label,value,onChange,type="text",placeholder,multiline,required}) => (
  <div style={{marginBottom:12}}>
    {label&&<label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{label}{required&&<span style={{color:"#DC2626"}}> *</span>}</label>}
    {multiline
      ?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",resize:"vertical"}}/>
      :<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}/>
    }
  </div>
);
const Select = ({label,value,onChange,options}) => (
  <div style={{marginBottom:12}}>
    {label&&<label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{label}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff",outline:"none"}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
);
const Modal = ({children,onClose,maxWidth=560}) => (
  <div style={{position:"fixed",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}} onClick={onClose}>
    <div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
      {children}
    </div>
  </div>
);
const Toast = ({msg,type}) => msg?<div style={{position:"fixed",top:66,right:14,zIndex:999,background:type==="error"?"#DC2626":"#16A34A",color:"#fff",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{msg}</div>:null;
function useToast() {
  const [toast,setToast]=useState(null);
  const show=(msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  return [toast,show];
}
function PhotoGrid({photos,onDelete,canDelete}) {
  return <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>{photos.map((p,i)=><div key={i} style={{position:"relative"}}><img src={p.url} alt="" onClick={()=>window.open(p.url,"_blank")} style={{width:88,height:68,objectFit:"cover",borderRadius:8,border:"2px solid #e5e7eb",cursor:"pointer"}}/>{canDelete&&<button onClick={()=>onDelete(p)} style={{position:"absolute",top:-6,right:-6,background:"#DC2626",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>×</button>}</div>)}</div>;
}
function PhotoAdd({onAdd,uploading}) {
  const ref=useRef();
  const handle=async(e)=>{ const files=Array.from(e.target.files); for(const f of files){ await onAdd(f); } e.target.value=""; };
  return <><button onClick={()=>ref.current.click()} disabled={uploading} style={{width:88,height:68,border:"2px dashed #B8924A",borderRadius:8,background:"#FFFBF5",color:"#B8924A",fontSize:uploading?14:22,cursor:uploading?"not-allowed":"pointer",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center"}}>{uploading?"...":"+"}</button><input ref={ref} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handle}/></>;
}
function LangBtn({lang,setLang}) {
  const [open,setOpen]=useState(false);
  const f={pt:"🇧🇷",en:"🇺🇸",es:"🇪🇸"};
  return <div style={{position:"relative"}}><button onClick={()=>setOpen(o=>!o)} style={{background:"#2A2A2A",border:"1px solid #444",borderRadius:20,padding:"3px 10px",fontSize:14,cursor:"pointer"}}>{f[lang]}</button>{open&&<div style={{position:"absolute",right:0,top:34,background:"#2A2A2A",border:"1px solid #444",borderRadius:10,padding:6,zIndex:200,display:"flex",flexDirection:"column",gap:4}}>{Object.entries(f).map(([l,fl])=><button key={l} onClick={()=>{setLang(l);localStorage.setItem("pf_lang",l);setOpen(false);}} style={{background:lang===l?"#B8924A22":"none",border:"none",borderRadius:6,padding:"5px 8px",fontSize:16,cursor:"pointer"}}>{fl}</button>)}</div>}</div>;
}
function VerticalSwitcher({vertical,onSwitch}) {
  const [open,setOpen]=useState(false);
  const vTheme=getVertical(vertical);
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:vTheme.accent+"22",border:`1px solid ${vTheme.accent}66`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:vTheme.accent,cursor:"pointer"}}>
        {vTheme.icon} {vTheme.label} <span style={{fontSize:8}}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:199}}/>
          <div style={{position:"absolute",left:0,top:34,background:"#2A2A2A",border:"1px solid #444",borderRadius:10,padding:6,zIndex:200,display:"flex",flexDirection:"column",gap:3,minWidth:170}}>
            {Object.entries(VERTICALS).map(([id,v])=>(
              <button key={id} onClick={()=>{onSwitch(id);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,background:vertical===id?v.accent+"22":"none",border:"none",borderRadius:6,padding:"7px 9px",fontSize:13,fontWeight:600,color:vertical===id?v.accent:"#ccc",cursor:"pointer",textAlign:"left"}}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────
const L = {
  pt:{
    brand:"Profield",sub:"Field Operations",
    loginTitle:"Bem-vindo ao Profield",
    roles:{owner:"👑 Owner",admin:"⚙️ Admin",installer:"🔨 Instalador",salesperson:"💼 Vendedor"},
    roleSubs:{owner:"Acesso total à plataforma",admin:"Gerenciar minha empresa",installer:"Ver meus jobs",salesperson:"Meus clientes e jobs"},
    yourName:"Seu nome",selectName:"Selecione...",password:"Senha",enter:"Entrar",back:"← Voltar",verifying:"Verificando...",wrongPw:"Senha incorreta.",wrongCreds:"Nome ou senha incorretos.",selectNameErr:"Selecione seu nome.",enterPwErr:"Digite sua senha.",
    nav:{jobs:"Jobs",calendar:"Calendário",companies:"Empresas",contacts:"Contatos",reports:"Relatórios",team:"Equipe",quote:"Orçamento"},
    jobStatus:{scheduled:"Agendado",in_progress:"Em Andamento",completed:"Concluído",cancelled:"Cancelado"},
    all:"Todos",newJob:"+ Novo Job",editJob:"Editar Job",noJobs:"Nenhum job encontrado",loading:"Carregando...",
    back2:"← Voltar",save:"Salvar",cancel:"Cancelar",saving:"Salvando...",add:"+ Adicionar",remove:"Remover",edit:"✏️",del:"🗑️",
    fields:{workOrder:"Nº Trabalho",client:"Cliente",clientPhone:"Tel. Cliente",clientEmail:"Email Cliente",builder:"Builder",builderContact:"Contato Builder",builderPhone:"Tel. Builder",builderNote:"Falar com",address:"Endereço",access:"Instruções de Acesso",date:"Data",time:"Horário",service:"Serviço",sf:"SF",installer:"Instalador",installerPhone:"Tel. Instalador",hours:"Horas",status:"Status",scope:"Escopo",salesperson:"Vendedor"},
    builderNoteOpts:["—","Falar com Builder","Falar com Cliente","Aguardar confirmação"],
    photos:"📸 Fotos do Local",noPhoto:"Nenhuma foto.",conclusion:"✅ Conclusão",conclusionPhotos:"Fotos de conclusão",notes:"Observações",notesPH:"Descreva como foi o trabalho...",saveNotes:"💾 Salvar",markDone:"✅ Marcar como Concluído",
    contacts:"Contatos",clients:"👤 Clientes",builders:"🏗️ Builders",contractors:"🔧 Prestadores",contracts:"📄 Contratos",search:"🔍 Buscar...",newContact:"+ Novo",noContacts:"Nenhum cadastro.",
    cFields:{name:"Nome",phone:"Telefone",email:"Email",address:"Endereço",notes:"Notas",company:"Empresa",contactPerson:"Pessoa de Contato",service:"Serviço que presta",title:"Título",relatedTo:"Relacionado a",file:"Arquivo",viewFile:"📄 Ver arquivo",noFile:"Sem arquivo",attach:"📎 Anexar",commPref:"Preferência de Contato",commOpts:["—","Ligar para o cliente","Ligar para o Builder","Enviar WhatsApp","Email"]},
    team:"Equipe",installers:"Instaladores",salespersons:"Vendedores",newInstaller:"Novo Instalador",newSalesperson:"Novo Vendedor",
    iFields:{name:"Nome",phone:"Telefone",email:"Email",serviceType:"Tipo de Serviço",notes:"Notas",password:"Senha",commission:"Comissão (%)"},
    companies:"Empresas",noCompanies:"Nenhuma empresa.",companyJobs:"Jobs",companyTeam:"Equipe",companyContacts:"Contatos",companyServices:"Serviços",companyPricing:"💰 Preços",activeJobs:"ativos",totalJobs:"total",
    reports:"Relatórios",from:"De",to:"Até",generate:"Gerar Relatório",generating:"Gerando...",noData:"Nenhum dado no período.",totalJobsR:"Total Jobs",completedR:"Concluídos",totalSF:"Total SF",revenue:"Faturamento Est.",print:"🖨️ Imprimir",
    pricing:"Tabela de Preços",baseSF:"Preço base por SF ($)",savePricing:"Salvar Preços",pricingSaved:"Preços salvos!",
    services:"Serviços",addService:"+ Serviço",servicesSaved:"Serviços salvos!",
    admins:"Admins",newAdmin:"Novo Admin",adminName:"Nome",adminCompany:"Empresa",
    confirmDel:"Confirmar exclusão?",
    toasts:{jobCreated:"Job criado!",jobUpdated:"Job atualizado!",jobDeleted:"Job excluído!",saved:"Salvo!",photoSent:"Foto enviada!",photoRemoved:"Foto removida!",statusUpdated:"Status atualizado!",contactSaved:"Contato salvo!",contactDeleted:"Contato removido!",adminAdded:"Admin cadastrado!",teamAdded:"Membro adicionado!",teamRemoved:"Membro removido!",errLoad:"Erro ao carregar",errSave:"Erro ao salvar",errPhoto:"Erro na foto",errDup:"Nome já existe."},
  },
  en:{
    brand:"Profield",sub:"Field Operations",
    loginTitle:"Welcome to Profield",
    roles:{owner:"👑 Owner",admin:"⚙️ Admin",installer:"🔨 Installer",salesperson:"💼 Salesperson"},
    roleSubs:{owner:"Full platform access",admin:"Manage my company",installer:"View my jobs",salesperson:"My clients & jobs"},
    yourName:"Your name",selectName:"Select...",password:"Password",enter:"Sign In",back:"← Back",verifying:"Verifying...",wrongPw:"Incorrect password.",wrongCreds:"Wrong name or password.",selectNameErr:"Select your name.",enterPwErr:"Enter password.",
    nav:{jobs:"Jobs",calendar:"Calendar",companies:"Companies",contacts:"Contacts",reports:"Reports",team:"Team",quote:"Quote"},
    jobStatus:{scheduled:"Scheduled",in_progress:"In Progress",completed:"Completed",cancelled:"Cancelled"},
    all:"All",newJob:"+ New Job",editJob:"Edit Job",noJobs:"No jobs found",loading:"Loading...",
    back2:"← Back",save:"Save",cancel:"Cancel",saving:"Saving...",add:"+ Add",remove:"Remove",edit:"✏️",del:"🗑️",
    fields:{workOrder:"Work Order",client:"Client",clientPhone:"Client Phone",clientEmail:"Client Email",builder:"Builder",builderContact:"Builder Contact",builderPhone:"Builder Phone",builderNote:"Contact note",address:"Address",access:"Access Instructions",date:"Date",time:"Time",service:"Service",sf:"SF",installer:"Installer",installerPhone:"Installer Phone",hours:"Hours",status:"Status",scope:"Scope",salesperson:"Salesperson"},
    builderNoteOpts:["—","Call Builder","Call Client","Await confirmation"],
    photos:"📸 Site Photos",noPhoto:"No photos.",conclusion:"✅ Completion",conclusionPhotos:"Completion photos",notes:"Notes",notesPH:"Describe how the job went...",saveNotes:"💾 Save",markDone:"✅ Mark as Complete",
    contacts:"Contacts",clients:"👤 Clients",builders:"🏗️ Builders",contractors:"🔧 Contractors",contracts:"📄 Contracts",search:"🔍 Search...",newContact:"+ New",noContacts:"No records.",
    cFields:{name:"Name",phone:"Phone",email:"Email",address:"Address",notes:"Notes",company:"Company",contactPerson:"Contact Person",service:"Service provided",title:"Title",relatedTo:"Related to",file:"File",viewFile:"📄 View file",noFile:"No file",attach:"📎 Attach",commPref:"Contact Preference",commOpts:["—","Call client","Call Builder","Send WhatsApp","Email"]},
    team:"Team",installers:"Installers",salespersons:"Salespersons",newInstaller:"New Installer",newSalesperson:"New Salesperson",
    iFields:{name:"Name",phone:"Phone",email:"Email",serviceType:"Service Type",notes:"Notes",password:"Password",commission:"Commission (%)"},
    companies:"Companies",noCompanies:"No companies.",companyJobs:"Jobs",companyTeam:"Team",companyContacts:"Contacts",companyServices:"Services",companyPricing:"💰 Pricing",activeJobs:"active",totalJobs:"total",
    reports:"Reports",from:"From",to:"To",generate:"Generate Report",generating:"Generating...",noData:"No data in period.",totalJobsR:"Total Jobs",completedR:"Completed",totalSF:"Total SF",revenue:"Est. Revenue",print:"🖨️ Print",
    pricing:"Pricing Table",baseSF:"Base price per SF ($)",savePricing:"Save Prices",pricingSaved:"Prices saved!",
    services:"Services",addService:"+ Service",servicesSaved:"Services saved!",
    admins:"Admins",newAdmin:"New Admin",adminName:"Name",adminCompany:"Company",
    confirmDel:"Confirm delete?",
    toasts:{jobCreated:"Job created!",jobUpdated:"Job updated!",jobDeleted:"Job deleted!",saved:"Saved!",photoSent:"Photo sent!",photoRemoved:"Photo removed!",statusUpdated:"Status updated!",contactSaved:"Contact saved!",contactDeleted:"Contact removed!",adminAdded:"Admin added!",teamAdded:"Member added!",teamRemoved:"Member removed!",errLoad:"Error loading",errSave:"Error saving",errPhoto:"Photo error",errDup:"Name already exists."},
  },
  es:{
    brand:"Profield",sub:"Field Operations",
    loginTitle:"Bienvenido a Profield",
    roles:{owner:"👑 Propietario",admin:"⚙️ Admin",installer:"🔨 Instalador",salesperson:"💼 Vendedor"},
    roleSubs:{owner:"Acceso total a la plataforma",admin:"Gestionar mi empresa",installer:"Ver mis trabajos",salesperson:"Mis clientes y trabajos"},
    yourName:"Tu nombre",selectName:"Seleccionar...",password:"Contraseña",enter:"Entrar",back:"← Volver",verifying:"Verificando...",wrongPw:"Contraseña incorrecta.",wrongCreds:"Nombre o contraseña incorrectos.",selectNameErr:"Selecciona tu nombre.",enterPwErr:"Ingresa contraseña.",
    nav:{jobs:"Trabajos",calendar:"Calendario",companies:"Empresas",contacts:"Contactos",reports:"Reportes",team:"Equipo",quote:"Presupuesto"},
    jobStatus:{scheduled:"Programado",in_progress:"En Progreso",completed:"Completado",cancelled:"Cancelado"},
    all:"Todos",newJob:"+ Nuevo",editJob:"Editar",noJobs:"Sin trabajos",loading:"Cargando...",
    back2:"← Volver",save:"Guardar",cancel:"Cancelar",saving:"Guardando...",add:"+ Agregar",remove:"Eliminar",edit:"✏️",del:"🗑️",
    fields:{workOrder:"Nº Trabajo",client:"Cliente",clientPhone:"Tel. Cliente",clientEmail:"Email Cliente",builder:"Constructor",builderContact:"Contacto Constructor",builderPhone:"Tel. Constructor",builderNote:"Nota de contacto",address:"Dirección",access:"Instrucciones de Acceso",date:"Fecha",time:"Hora",service:"Servicio",sf:"SF",installer:"Instalador",installerPhone:"Tel. Instalador",hours:"Horas",status:"Estado",scope:"Alcance",salesperson:"Vendedor"},
    builderNoteOpts:["—","Llamar al Constructor","Llamar al Cliente","Esperar confirmación"],
    photos:"📸 Fotos del Sitio",noPhoto:"Sin fotos.",conclusion:"✅ Finalización",conclusionPhotos:"Fotos de finalización",notes:"Observaciones",notesPH:"Describe el trabajo...",saveNotes:"💾 Guardar",markDone:"✅ Marcar como Completado",
    contacts:"Contactos",clients:"👤 Clientes",builders:"🏗️ Constructores",contractors:"🔧 Contratistas",contracts:"📄 Contratos",search:"🔍 Buscar...",newContact:"+ Nuevo",noContacts:"Sin registros.",
    cFields:{name:"Nombre",phone:"Teléfono",email:"Email",address:"Dirección",notes:"Notas",company:"Empresa",contactPerson:"Persona de Contacto",service:"Servicio que presta",title:"Título",relatedTo:"Relacionado con",file:"Archivo",viewFile:"📄 Ver archivo",noFile:"Sin archivo",attach:"📎 Adjuntar",commPref:"Preferencia de Contacto",commOpts:["—","Llamar al cliente","Llamar al Constructor","Enviar WhatsApp","Email"]},
    team:"Equipo",installers:"Instaladores",salespersons:"Vendedores",newInstaller:"Nuevo Instalador",newSalesperson:"Nuevo Vendedor",
    iFields:{name:"Nombre",phone:"Teléfono",email:"Email",serviceType:"Tipo de Servicio",notes:"Notas",password:"Contraseña",commission:"Comisión (%)"},
    companies:"Empresas",noCompanies:"Sin empresas.",companyJobs:"Trabajos",companyTeam:"Equipo",companyContacts:"Contactos",companyServices:"Servicios",companyPricing:"💰 Precios",activeJobs:"activos",totalJobs:"total",
    reports:"Reportes",from:"De",to:"Hasta",generate:"Generar Reporte",generating:"Generando...",noData:"Sin datos en el período.",totalJobsR:"Total Trabajos",completedR:"Completados",totalSF:"Total SF",revenue:"Ingr. Estimados",print:"🖨️ Imprimir",
    pricing:"Tabla de Precios",baseSF:"Precio base por SF ($)",savePricing:"Guardar Precios",pricingSaved:"¡Precios guardados!",
    services:"Servicios",addService:"+ Servicio",servicesSaved:"¡Servicios guardados!",
    admins:"Admins",newAdmin:"Nuevo Admin",adminName:"Nombre",adminCompany:"Empresa",
    confirmDel:"¿Confirmar eliminación?",
    toasts:{jobCreated:"¡Trabajo creado!",jobUpdated:"¡Trabajo actualizado!",jobDeleted:"¡Trabajo eliminado!",saved:"¡Guardado!",photoSent:"¡Foto enviada!",photoRemoved:"¡Foto eliminada!",statusUpdated:"¡Estado actualizado!",contactSaved:"¡Contacto guardado!",contactDeleted:"¡Contacto eliminado!",adminAdded:"¡Admin registrado!",teamAdded:"¡Miembro agregado!",teamRemoved:"¡Miembro eliminado!",errLoad:"Error al cargar",errSave:"Error al guardar",errPhoto:"Error en foto",errDup:"El nombre ya existe."},
  },
};

// ─── LOGIN ─────────────────────────────────────────────────────────────
function Login({onLogin,lang,setLang}) {
  const t=L[lang];
  const urlVertical=(()=>{ try{ const p=new URLSearchParams(window.location.search).get("vertical"); return VERTICALS[p]?p:null; }catch{ return null; } })();
  const showOwner=(()=>{ try{ return new URLSearchParams(window.location.search).get("owner")==="1"; }catch{ return false; } })();
  const [ownerVertical,setOwnerVertical]=useState(urlVertical||"construction");
  const [mode,setMode]=useState(null);
  const [pw,setPw]=useState(""); const [name,setName]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [names,setNames]=useState([]);
  useEffect(()=>{
    if(!mode) return;
    if(mode==="owner") return;
    const tbl=mode==="admin"?"admins":mode==="installer"?"installers":"salespeople";
    db.from(tbl).select("name").order("name").then(({data})=>{ if(data) setNames(data.map(r=>r.name)); });
  },[mode]);
  const handle=async()=>{
    if(mode==="owner"){if(pw===OWNER_PW) onLogin({role:"owner",name:"Owner",vertical:ownerVertical}); else setErr(t.wrongPw); return;}
    if(!name){setErr(t.selectNameErr);return;} if(!pw){setErr(t.enterPwErr);return;}
    setLoading(true);
    const tbl=mode==="admin"?"admins":mode==="installer"?"installers":"salespeople";
    const {data,error}=await db.from(tbl).select("*").eq("name",name).eq("password",pw).single();
    setLoading(false);
    if(error||!data){setErr(t.wrongCreds);return;}
    let vertical=data.vertical;
    if(!vertical && mode!=="admin"){
      const {data:adminRow}=await db.from("admins").select("vertical").eq("company",data.company).single();
      vertical=adminRow?.vertical;
    }
    onLogin({role:mode,name:data.name,company:data.company,id:data.id,vertical:vertical||"construction"});
  };
  const flags={pt:"🇧🇷",en:"🇺🇸",es:"🇪🇸"};
  const vTheme=getVertical(urlVertical||"construction");
  if(!mode) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0F0F0F 0%,#1A1A1A 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{maxWidth:380,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20,gap:8}}>{Object.entries(flags).map(([l,f])=><button key={l} onClick={()=>{setLang(l);localStorage.setItem("pf_lang",l);}} style={{background:lang===l?"#B8924A22":"#2A2A2A",border:`1px solid ${lang===l?"#B8924A":"#333"}`,borderRadius:10,padding:"5px 10px",fontSize:16,cursor:"pointer"}}>{f}</button>)}</div>
        <div style={{textAlign:"center",marginBottom:urlVertical?16:40}}>
          <div style={{fontSize:42,fontWeight:900,color:vTheme.accent,letterSpacing:-2,marginBottom:4}}>{t.brand}</div>
          <div style={{fontSize:12,color:"#555",letterSpacing:4,textTransform:"uppercase"}}>{t.sub}</div>
        </div>
        {urlVertical && (
          <div style={{display:"flex",alignItems:"center",gap:10,background:vTheme.accent+"15",border:`1px solid ${vTheme.accent}44`,borderRadius:12,padding:"10px 14px",marginBottom:24}}>
            <span style={{fontSize:22}}>{vTheme.icon}</span>
            <span style={{fontSize:13,fontWeight:700,color:vTheme.accent}}>{vTheme.label}</span>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{id:"owner"},{id:"admin"},{id:"installer"},{id:"salesperson"}].filter(({id})=>id!=="owner"||showOwner).map(({id})=>(
            <button key={id} onClick={()=>{setMode(id);setErr("");setPw("");setName("");}} style={{background:id==="owner"?"#1A1A1A":"#1E1E1E",border:id==="owner"?`2px solid ${vTheme.accent}`:"1px solid #2A2A2A",borderRadius:14,padding:"16px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=vTheme.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=id==="owner"?vTheme.accent:"#2A2A2A"}>
              <div style={{fontSize:28}}>{t.roles[id].split(" ")[0]}</div>
              <div><div style={{color:id==="owner"?vTheme.accent:"#fff",fontWeight:800,fontSize:15}}>{t.roles[id].slice(3)}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>{t.roleSubs[id]}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{maxWidth:360,width:"100%"}}>
        <div style={{fontSize:36,fontWeight:900,color:vTheme.accent,letterSpacing:-2,marginBottom:2,textAlign:"center"}}>{t.brand}</div>
        <div style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase",marginBottom:28,textAlign:"center"}}>{t.roles[mode]}</div>
        <div style={{background:"#222",borderRadius:16,padding:22}}>
          {mode==="owner" && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:6}}>Vertical</label>
              <div style={{display:"flex",gap:6}}>
                {Object.entries(VERTICALS).map(([id,v])=>(
                  <button key={id} onClick={()=>setOwnerVertical(id)} style={{flex:1,padding:"8px 4px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${ownerVertical===id?v.accent:"#333"}`,background:ownerVertical===id?v.accent+"22":"#1A1A1A",color:ownerVertical===id?v.accent:"#888"}}>{v.icon} {v.label}</button>
                ))}
              </div>
            </div>
          )}
          {mode!=="owner"&&<div style={{marginBottom:14}}><label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:6}}>{t.yourName}</label><select value={name} onChange={e=>{setName(e.target.value);setErr("");}} style={{width:"100%",border:"1px solid #333",borderRadius:8,padding:"10px 12px",fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box"}}><option value="">{t.selectName}</option>{names.map(n=><option key={n} value={n}>{n}</option>)}</select></div>}
          <div style={{marginBottom:14}}><label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:6}}>{t.password}</label><input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} style={{width:"100%",border:"1px solid #333",borderRadius:8,padding:"10px 12px",fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box",outline:"none"}}/></div>
          {err&&<div style={{color:"#DC2626",fontSize:13,marginBottom:10,fontWeight:600}}>{err}</div>}
          <button onClick={handle} disabled={loading} style={{width:"100%",background:vTheme.accent,color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:15,cursor:"pointer",opacity:loading?0.7:1,marginBottom:10}}>{loading?t.verifying:t.enter}</button>
          <button onClick={()=>{setMode(null);setErr("");}} style={{width:"100%",background:"none",color:"#555",border:"1px solid #333",borderRadius:10,padding:9,cursor:"pointer",fontSize:13}}>{t.back}</button>
        </div>
      </div>
    </div>
  );
}

// ─── JOB FORM ─────────────────────────────────────────────────────────
function JobForm({onSave,onCancel,saving,initial,session,t,companyServices,installerNames,salespersonNames}) {
  const vertical = session?.vertical || "construction";
  const blank={
    work_order:"",client:"",client_phone:"",client_email:"",builder:"",builder_contact:"",builder_phone:"",builder_note:"—",
    address:"",access_notes:"",date:"",time:"08:00",
    service:(companyServices&&companyServices[0])||getVertical(vertical).services[0],
    sf:"",installer:"",installer_phone:"",estimated_hours:4,status:"scheduled",scope:"",salesperson:"",
    bedrooms:"",bathrooms:"",frequency:"Avulso",checklist:[],
    patient_name:"",provider:"",visit_type:"",duration_minutes:30,room:"",
  };
  const [f,setF]=useState(initial?{...blank,...initial}:blank);
  const [checklistInput,setChecklistInput]=useState("");
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  const services=companyServices&&companyServices.length>0?companyServices:getVertical(vertical).services;
  const save=()=>{
    if(vertical==="construction"){
      if(!f.work_order||!f.client||!f.address||!f.date){alert("Fill required fields.");return;}
    } else if(vertical==="cleaning"){
      if(!f.work_order||!f.client||!f.address||!f.date){alert("Fill required fields.");return;}
    } else if(vertical==="clinic"){
      if(!f.work_order||!f.patient_name||!f.date){alert("Fill required fields.");return;}
    }
    const {company:_c,id:_id,photos:_p,created_at:_ca,...rest}=f;
    onSave({...rest,sf:rest.sf?Number(rest.sf):null,bedrooms:rest.bedrooms?Number(rest.bedrooms):null,bathrooms:rest.bathrooms?Number(rest.bathrooms):null,duration_minutes:rest.duration_minutes?Number(rest.duration_minutes):null,vertical});
  };
  const statusOpts=Object.entries(t.jobStatus).map(([v,label])=>({value:v,label}));
  const builderNoteOpts=t.builderNoteOpts.map(o=>({value:o,label:o}));
  const addChecklistItem=()=>{ if(!checklistInput.trim()) return; setF(p=>({...p,checklist:[...(p.checklist||[]),{text:checklistInput.trim(),done:false}]})); setChecklistInput(""); };
  const toggleChecklistItem=(i)=>{ setF(p=>({...p,checklist:p.checklist.map((c,idx)=>idx===i?{...c,done:!c.done}:c)})); };
  const removeChecklistItem=(i)=>{ setF(p=>({...p,checklist:p.checklist.filter((_,idx)=>idx!==i)})); };

  return (
    <Modal onClose={onCancel} maxWidth={580}>
      <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>{getVertical(vertical).icon} {initial?t.editJob:`➕ ${t.newJob.slice(2)}`}</div>
      <Input label={t.fields.workOrder} value={f.work_order} onChange={set("work_order")} placeholder="WO-2026-001" required/>

      {vertical==="clinic" ? (
        <>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label="Paciente" value={f.patient_name} onChange={set("patient_name")} placeholder="Nome do paciente" required/></div><div style={{flex:1}}><Input label={t.fields.clientPhone} value={f.client_phone} onChange={set("client_phone")} type="tel" placeholder="(770) 555-0000"/></div></div>
          <Input label={t.fields.clientEmail} value={f.client_email} onChange={set("client_email")} type="email" placeholder="paciente@email.com"/>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Select label="Profissional" value={f.provider||""} onChange={set("provider")} options={[{value:"",label:t.selectName},...installerNames.map(n=>({value:n,label:n}))]}/></div><div style={{flex:1}}><Input label="Sala / Consultório" value={f.room} onChange={set("room")} placeholder="Sala 2"/></div></div>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.date} value={f.date} onChange={set("date")} type="date" required/></div><div style={{flex:1}}><Input label={t.fields.time} value={f.time} onChange={set("time")} type="time"/></div></div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:2}}><Select label="Tipo de Consulta" value={f.service} onChange={set("service")} options={services}/></div>
            <div style={{flex:1}}><Input label="Duração (min)" value={f.duration_minutes} onChange={set("duration_minutes")} type="number" placeholder="30"/></div>
          </div>
          <Select label={t.fields.status} value={f.status} onChange={set("status")} options={statusOpts}/>
          <Input label="Observações administrativas" value={f.scope} onChange={set("scope")} multiline placeholder="Notas administrativas (sem dados clínicos sensíveis)..."/>
        </>
      ) : vertical==="cleaning" ? (
        <>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.client} value={f.client} onChange={set("client")} placeholder="Nome do cliente" required/></div><div style={{flex:1}}><Input label={t.fields.clientPhone} value={f.client_phone} onChange={set("client_phone")} type="tel" placeholder="(770) 555-0000"/></div></div>
          <Input label={t.fields.address} value={f.address} onChange={set("address")} placeholder="123 Main St, Marietta, GA" required/>
          <Input label={t.fields.access} value={f.access_notes} onChange={set("access_notes")} multiline placeholder="Código do portão, onde estacionar..."/>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.date} value={f.date} onChange={set("date")} type="date" required/></div><div style={{flex:1}}><Input label={t.fields.time} value={f.time} onChange={set("time")} type="time"/></div></div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Input label="Quartos" value={f.bedrooms} onChange={set("bedrooms")} type="number" placeholder="3"/></div>
            <div style={{flex:1}}><Input label="Banheiros" value={f.bathrooms} onChange={set("bathrooms")} type="number" placeholder="2"/></div>
            <div style={{flex:1}}><Select label="Frequência" value={f.frequency} onChange={set("frequency")} options={FREQUENCY_OPTS}/></div>
          </div>
          <Select label={t.fields.service} value={f.service} onChange={set("service")} options={services}/>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:6}}>Checklist de Tarefas</label>
            {(f.checklist||[]).map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <input type="checkbox" checked={c.done} onChange={()=>toggleChecklistItem(i)} style={{width:16,height:16,accentColor:"#7C9885"}}/>
                <span style={{flex:1,fontSize:13,textDecoration:c.done?"line-through":"none",color:c.done?"#999":"#333"}}>{c.text}</span>
                <button onClick={()=>removeChecklistItem(i)} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer",fontSize:14}}>×</button>
              </div>
            ))}
            <div style={{display:"flex",gap:8}}>
              <input value={checklistInput} onChange={e=>setChecklistInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addChecklistItem()} placeholder="Ex: Aspirar sala" style={{flex:1,border:"1px solid #E5E7EB",borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none"}}/>
              <Btn onClick={addChecklistItem} variant="secondary" style={{padding:"7px 12px",fontSize:12}}>+ Add</Btn>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Select label="Equipe responsável" value={f.installer||""} onChange={set("installer")} options={[{value:"",label:t.selectName},...installerNames.map(n=>({value:n,label:n}))]}/></div>
            <div style={{flex:1}}><Select label={t.fields.status} value={f.status} onChange={set("status")} options={statusOpts}/></div>
          </div>
        </>
      ) : (
        <>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.client} value={f.client} onChange={set("client")} placeholder="John Smith" required/></div><div style={{flex:1}}><Input label={t.fields.clientPhone} value={f.client_phone} onChange={set("client_phone")} type="tel" placeholder="(770) 555-0000"/></div></div>
          <Input label={t.fields.clientEmail} value={f.client_email} onChange={set("client_email")} type="email" placeholder="john@email.com"/>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.builder} value={f.builder} onChange={set("builder")} placeholder="Brown Haven Homes"/></div><div style={{flex:1}}><Input label={t.fields.builderContact} value={f.builder_contact} onChange={set("builder_contact")} placeholder="Mike"/></div></div>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.builderPhone} value={f.builder_phone} onChange={set("builder_phone")} type="tel"/></div><div style={{flex:1}}><Select label={t.fields.builderNote} value={f.builder_note} onChange={set("builder_note")} options={builderNoteOpts}/></div></div>
          <Input label={t.fields.address} value={f.address} onChange={set("address")} placeholder="123 Main St, Marietta, GA" required/>
          <Input label={t.fields.access} value={f.access_notes} onChange={set("access_notes")} multiline placeholder="Gate code, parking..."/>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.fields.date} value={f.date} onChange={set("date")} type="date" required/></div><div style={{flex:1}}><Input label={t.fields.time} value={f.time} onChange={set("time")} type="time"/></div></div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:2}}><Select label={t.fields.service} value={f.service} onChange={set("service")} options={services}/></div>
            <div style={{flex:1}}><Input label={t.fields.sf} value={f.sf} onChange={set("sf")} type="number" placeholder="88"/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Select label={t.fields.installer} value={f.installer||""} onChange={set("installer")} options={[{value:"",label:t.selectName},...installerNames.map(n=>({value:n,label:n}))]}/></div>
            <div style={{flex:1}}><Input label={t.fields.installerPhone} value={f.installer_phone} onChange={set("installer_phone")} type="tel"/></div>
          </div>
          {salespersonNames&&salespersonNames.length>0&&<Select label={t.fields.salesperson} value={f.salesperson||""} onChange={set("salesperson")} options={[{value:"",label:t.selectName},...salespersonNames.map(n=>({value:n,label:n}))]}/>}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Input label={t.fields.hours} value={f.estimated_hours} onChange={set("estimated_hours")} type="number"/></div>
            <div style={{flex:1}}><Select label={t.fields.status} value={f.status} onChange={set("status")} options={statusOpts}/></div>
          </div>
          <Input label={t.fields.scope} value={f.scope} onChange={set("scope")} multiline placeholder="Describe the work..."/>
        </>
      )}

      <div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn onClick={save} disabled={saving} style={{flex:1}}>{saving?t.saving:t.save}</Btn>
        <Btn onClick={onCancel} variant="secondary">{t.cancel}</Btn>
      </div>
    </Modal>
  );
}

// ─── JOB DETAIL ───────────────────────────────────────────────────────
function JobDetail({job,session,t,onUpdateStatus,onAddPhoto,onDeletePhoto,onSaveNotes,onEdit,onDelete,uploading}) {
  const [notes,setNotes]=useState(job.completion_notes||""); const [sn,setSn]=useState(false);
  const isAdmin=session.role==="admin"||session.role==="owner";
  const ap=(job.photos||[]).filter(p=>p.type==="admin"), cp=(job.photos||[]).filter(p=>p.type==="completion");
  const hn=async()=>{setSn(true);await onSaveNotes(job.id,notes);setSn(false);};
  const color=SC[job.status]||SC.scheduled;
  return (
    <div>
      {/* Hero */}
      <div style={{background:"#1A1A1A",borderRadius:14,padding:20,borderBottom:`4px solid ${color}`,marginBottom:14,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#B8924A",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{job.work_order}</div>
            <Badge status={job.status} label={t.jobStatus[job.status]||job.status}/>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8}}>{job.client}</div>
            {job.builder&&<div style={{fontSize:13,color:"#B8924A",fontWeight:600,marginTop:2}}>💰 {job.builder}{job.builder_contact&&` · ${job.builder_contact}`}</div>}
            {job.builder_note&&job.builder_note!=="—"&&<div style={{fontSize:12,color:"#F59E0B",marginTop:2}}>⚠️ {job.builder_note}</div>}
            <div style={{fontSize:14,color:"#aaa",marginTop:2}}>{job.service}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            {job.sf&&<div style={{background:"#B8924A",borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{job.sf}</div><div style={{fontSize:10,color:"#fff",opacity:0.8,letterSpacing:1}}>SF</div></div>}
            {isAdmin&&<div style={{display:"flex",gap:6}}><Btn onClick={onEdit} variant="ghost" style={{padding:"5px 10px",fontSize:12}}>{t.edit}</Btn><Btn onClick={onDelete} variant="danger" style={{padding:"5px 10px",fontSize:12}}>{t.del}</Btn></div>}
          </div>
        </div>
        <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>{[["📅",`${fmt(job.date)} ${job.time}`],["👷",job.installer||"—"],["⏱",`~${job.estimated_hours}h`],job.salesperson&&["💼",job.salesperson]].filter(Boolean).map(([icon,val])=><span key={val} style={{fontSize:13,color:"#bbb"}}>{icon} {val}</span>)}</div>
      </div>

      {/* Contacts */}
      {(job.client_phone||job.client_email||job.builder_phone)&&(
        <Card style={{marginBottom:12}}>
          <Sec>📞 {t.contacts}</Sec>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Tel phone={job.client_phone} label={t.fields.client} color="#2563EB"/>
            <Tel phone={job.builder_phone} label={job.builder||t.fields.builder} color="#B8924A"/>
            {job.client_email&&<a href={`mailto:${job.client_email}`} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EFF6FF",color:"#2563EB",border:"1px solid #2563EB44",borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:700,textDecoration:"none"}}>✉️ {job.client_email}</a>}
          </div>
        </Card>
      )}

      {/* Address */}
      <Card style={{marginBottom:12}}>
        <Sec>📍 {t.fields.address}</Sec>
        <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer" style={{fontSize:15,fontWeight:700,color:"#2563EB",marginBottom:8,display:"block",textDecoration:"none"}}>📍 {job.address} ↗</a>
        {job.access_notes&&<div style={{background:"#FFFBF5",border:"1px solid #B8924A44",borderRadius:8,padding:12,fontSize:14,color:"#555",lineHeight:1.7}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A",display:"block",marginBottom:4}}>ACCESS</span>{job.access_notes}</div>}
      </Card>

      {/* Scope */}
      {job.scope&&<Card style={{marginBottom:12}}><Sec>📋 {t.fields.scope}</Sec><div style={{fontSize:14,color:"#444",lineHeight:1.7}}>{job.scope}</div></Card>}

      {/* Site Photos */}
      <Card style={{marginBottom:12}}>
        <Sec>{t.photos}</Sec>
        <PhotoGrid photos={ap} onDelete={p=>onDeletePhoto(p)} canDelete={isAdmin}/>
        {isAdmin&&<PhotoAdd onAdd={f=>onAddPhoto(job.id,"admin",f)} uploading={uploading}/>}
        {ap.length===0&&<div style={{fontSize:13,color:"#aaa",marginTop:6}}>{t.noPhoto}</div>}
      </Card>

      {/* Status */}
      {isAdmin&&<Card style={{marginBottom:12}}>
        <Sec>{t.fields.status}</Sec>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(t.jobStatus).map(([key,label])=><button key={key} onClick={()=>onUpdateStatus(job.id,key)} style={{background:job.status===key?SC[key]:SBG[key],color:job.status===key?"#fff":SC[key],border:`1px solid ${SC[key]}`,borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>)}</div>
      </Card>}

      {/* Completion */}
      <Card style={{border:"2px solid #16A34A33",marginBottom:12}}>
        <Sec>{t.conclusion}</Sec>
        <div style={{fontSize:12,color:"#888",marginBottom:8}}>{t.conclusionPhotos}</div>
        <PhotoGrid photos={cp} onDelete={p=>onDeletePhoto(p)} canDelete={true}/>
        <PhotoAdd onAdd={f=>onAddPhoto(job.id,"completion",f)} uploading={uploading}/>
        <div style={{marginTop:14}}>
          <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:6}}>{t.notes}</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder={t.notesPH} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 12px",fontSize:14,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <Btn onClick={hn} disabled={sn} variant="primary" style={{marginTop:8,background:"#16A34A"}}>{sn?"...":t.saveNotes}</Btn>
        </div>
      </Card>

      {session.role==="installer"&&job.status!=="completed"&&<Btn onClick={()=>onUpdateStatus(job.id,"completed")} style={{width:"100%",padding:15,fontSize:15,background:"#16A34A",marginBottom:14}}>{t.markDone}</Btn>}
    </div>
  );
}

// ─── CONTACTS TAB ─────────────────────────────────────────────────────
function ContactsTab({session,t,showToast,forceCompany}) {
  const [sub,setSub]=useState("clients"); const [records,setRecords]=useState([]); const [loading,setLoading]=useState(false);
  const [showForm,setShowForm]=useState(false); const [editing,setEditing]=useState(null); const [saving,setSaving]=useState(false); const [search,setSearch]=useState("");
  const company=forceCompany||(session.role==="owner"?null:session.company);
  const tableMap={clients:"contacts_clients",builders:"contacts_builders",contractors:"contacts_contractors",contracts:"contracts"};
  const table=tableMap[sub];
  const load=async()=>{ setLoading(true); let q=db.from(table).select("*").order("created_at",{ascending:false}); if(company) q=q.eq("company",company); const {data}=await q; setRecords(data||[]); setLoading(false); };
  useEffect(()=>{ load();setSearch(""); },[sub,forceCompany]);
  const filtered=records.filter(r=>{ const s=search.toLowerCase(); return !s||Object.values(r).some(v=>String(v||"").toLowerCase().includes(s)); });
  const emptyForm=()=>{
    if(sub==="clients") return {name:"",phone:"",email:"",address:"",notes:"",comm_pref:"—"};
    if(sub==="builders") return {name:"",contact:"",phone:"",email:"",notes:"",comm_pref:"—"};
    if(sub==="contractors") return {name:"",service:"",phone:"",email:"",notes:""};
    return {title:"",related_to:"",notes:"",file_url:""};
  };
  const [form,setForm]=useState(emptyForm()); const fileRef=useRef(); const [uploadFile,setUploadFile]=useState(null);
  useEffect(()=>{ setForm(editing?{...emptyForm(),...editing}:emptyForm()); setUploadFile(null); },[editing,sub]);
  const save=async()=>{
    const req=sub==="contracts"?form.title:form.name; if(!req){alert("Fill required fields.");return;}
    setSaving(true); const payload={...form,company:company||"Owner"};
    if(sub==="contracts"&&uploadFile){ const path=`${company||"owner"}/${Date.now()}-${uploadFile.name}`; const {error:upErr}=await db.storage.from("contracts").upload(path,uploadFile); if(!upErr){ const {data:{publicUrl}}=db.storage.from("contracts").getPublicUrl(path); payload.file_url=publicUrl; } }
    let error; if(editing){ ({error}=await db.from(table).update(payload).eq("id",editing.id)); } else { ({error}=await db.from(table).insert([payload])); }
    setSaving(false); if(error){showToast(t.toasts.errSave,"error");return;} showToast(t.toasts.contactSaved); setShowForm(false); setEditing(null); load();
  };
  const remove=async(id)=>{ if(!confirm(t.confirmDel)) return; await db.from(table).delete().eq("id",id); showToast(t.toasts.contactDeleted); load(); };
  const subTabs=[{id:"clients",label:t.clients},{id:"builders",label:t.builders},{id:"contractors",label:t.contractors},{id:"contracts",label:t.contracts}];
  const commOpts=(t.cFields.commOpts||[]).map(o=>({value:o,label:o}));
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{subTabs.map(st=><button key={st.id} onClick={()=>setSub(st.id)} style={{background:sub===st.id?"#1A1A1A":"#fff",color:sub===st.id?"#B8924A":"#666",border:`1px solid ${sub===st.id?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{st.label}</button>)}</div>
      <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{flex:1,border:"1px solid #E5E7EB",borderRadius:20,padding:"7px 14px",fontSize:13,outline:"none",background:"#fff"}}/>
        <Btn onClick={()=>{setEditing(null);setForm(emptyForm());setShowForm(true);}}>{t.newContact}</Btn>
      </div>
      {loading?<div style={{textAlign:"center",padding:"30px",color:"#aaa"}}>⏳</div>
        :filtered.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>📋</div><div>{t.noContacts}</div></div>
        :filtered.map(r=>(
          <Card key={r.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                {sub==="contracts"?<>
                  <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:4}}>{r.title}</div>
                  {r.related_to&&<div style={{fontSize:13,color:"#666",marginBottom:4}}>🔗 {r.related_to}</div>}
                  {r.notes&&<div style={{fontSize:12,color:"#888",marginBottom:6}}>{r.notes}</div>}
                  {!forceCompany&&session.role==="owner"&&r.company&&<div style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:8,padding:"2px 8px",display:"inline-block",marginBottom:6}}>🏢 {r.company}</div>}
                  {r.file_url?<a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"#B8924A18",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,textDecoration:"none"}}>{t.cFields.viewFile}</a>:<span style={{fontSize:12,color:"#aaa"}}>{t.cFields.noFile}</span>}
                </>:<>
                  <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.name}</div>
                  {r.contact&&<div style={{fontSize:13,color:"#666",marginBottom:2}}>👤 {r.contact}</div>}
                  {r.service&&<div style={{fontSize:13,color:"#B8924A",fontWeight:600,marginBottom:2}}>🔧 {r.service}</div>}
                  {r.phone&&<div style={{fontSize:13,marginBottom:2}}><a href={`tel:${r.phone.replace(/\D/g,"")}`} style={{color:"#2563EB",textDecoration:"none"}}>📞 {r.phone}</a></div>}
                  {r.email&&<div style={{fontSize:13,marginBottom:2}}><a href={`mailto:${r.email}`} style={{color:"#2563EB",textDecoration:"none"}}>✉️ {r.email}</a></div>}
                  {r.address&&<div style={{fontSize:13,color:"#666",marginBottom:2}}>📍 {r.address}</div>}
                  {r.comm_pref&&r.comm_pref!=="—"&&<div style={{fontSize:12,background:"#FDF6EC",color:"#B8924A",borderRadius:10,padding:"2px 10px",display:"inline-block",marginTop:4,fontWeight:600}}>⚠️ {r.comm_pref}</div>}
                  {r.notes&&<div style={{fontSize:12,color:"#888",marginTop:4,fontStyle:"italic"}}>{r.notes}</div>}
                  {!forceCompany&&session.role==="owner"&&r.company&&<div style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:8,padding:"2px 8px",display:"inline-block",marginTop:6}}>🏢 {r.company}</div>}
                </>}
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <Btn onClick={()=>{setEditing(r);setShowForm(true);}} variant="ghost" style={{padding:"5px 9px",fontSize:12}}>✏️</Btn>
                <Btn onClick={()=>remove(r.id)} variant="danger" style={{padding:"5px 9px",fontSize:12}}>🗑️</Btn>
              </div>
            </div>
          </Card>
        ))
      }
      {showForm&&(
        <Modal onClose={()=>{setShowForm(false);setEditing(null);}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>{editing?"✏️ Edit":"➕ New"}</div>
          {sub==="clients"&&<><Input label={t.cFields.name} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.cFields.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div><div style={{flex:1}}><Input label={t.cFields.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/></div></div><Input label={t.cFields.address} value={form.address} onChange={v=>setForm(f=>({...f,address:v}))}/><Select label={t.cFields.commPref} value={form.comm_pref} onChange={v=>setForm(f=>({...f,comm_pref:v}))} options={commOpts}/><Input label={t.cFields.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
          {sub==="builders"&&<><Input label={t.cFields.company} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.cFields.contactPerson} value={form.contact} onChange={v=>setForm(f=>({...f,contact:v}))}/></div><div style={{flex:1}}><Input label={t.cFields.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div></div><Input label={t.cFields.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><Select label={t.cFields.commPref} value={form.comm_pref} onChange={v=>setForm(f=>({...f,comm_pref:v}))} options={commOpts}/><Input label={t.cFields.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
          {sub==="contractors"&&<><Input label={t.cFields.name} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/><div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.cFields.service} value={form.service} onChange={v=>setForm(f=>({...f,service:v}))}/></div><div style={{flex:1}}><Input label={t.cFields.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div></div><Input label={t.cFields.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><Input label={t.cFields.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/></>}
          {sub==="contracts"&&<><Input label={t.cFields.title} value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} required/><Input label={t.cFields.relatedTo} value={form.related_to} onChange={v=>setForm(f=>({...f,related_to:v}))}/><Input label={t.cFields.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/><div style={{marginBottom:12}}>{form.file_url&&<a href={form.file_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"#B8924A18",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:8}}>{t.cFields.viewFile}</a>}<button onClick={()=>fileRef.current.click()} style={{background:"#F9F7F4",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:8,padding:"7px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>📎 {uploadFile?uploadFile.name:t.cFields.attach}</button><input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" style={{display:"none"}} onChange={e=>setUploadFile(e.target.files[0])}/></div></>}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <Btn onClick={save} disabled={saving} style={{flex:1}}>{saving?t.saving:t.save}</Btn>
            <Btn onClick={()=>{setShowForm(false);setEditing(null);}} variant="secondary">{t.cancel}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TEAM MANAGER ─────────────────────────────────────────────────────
function TeamManager({session,t,showToast,forceCompany}) {
  const [sub,setSub]=useState("installers");
  const [records,setRecords]=useState([]); const [showForm,setShowForm]=useState(false); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({});
  const company=forceCompany||(session.role==="owner"?null:session.company);
  const tbl=sub==="installers"?"installers":"salespeople";
  const load=async()=>{ let q=db.from(tbl).select("*").order("name"); if(company) q=q.eq("company",company); const {data}=await q; setRecords(data||[]); };
  useEffect(()=>{ load(); },[sub,forceCompany]);
  const empty=()=>sub==="installers"?{name:"",phone:"",email:"",service_type:"",notes:"",password:""}:{name:"",phone:"",email:"",commission:0,notes:"",password:""};
  const save=async()=>{
    if(!form.name||!form.password){alert("Name and password required.");return;}
    setSaving(true);
    const {error}=await db.from(tbl).insert([{...form,company:company||"Owner"}]);
    setSaving(false); if(error){showToast(t.toasts.errDup,"error");return;}
    showToast(t.toasts.teamAdded); setShowForm(false); setForm(empty()); load();
  };
  const remove=async(id)=>{ if(!confirm(t.confirmDel)) return; await db.from(tbl).delete().eq("id",id); showToast(t.toasts.teamRemoved); load(); };
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button onClick={()=>setSub("installers")} style={{background:sub==="installers"?"#1A1A1A":"#fff",color:sub==="installers"?"#B8924A":"#666",border:`1px solid ${sub==="installers"?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔨 {t.installers}</button>
        <button onClick={()=>setSub("salespersons")} style={{background:sub==="salespersons"?"#1A1A1A":"#fff",color:sub==="salespersons"?"#B8924A":"#666",border:`1px solid ${sub==="salespersons"?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>💼 {t.salespersons}</button>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <Btn onClick={()=>{setForm(empty());setShowForm(true);}}>{sub==="installers"?t.newInstaller:t.newSalesperson}</Btn>
      </div>
      {records.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>👤</div><div>{t.noContacts}</div></div>
        :records.map(r=>(
          <Card key={r.id} style={{marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{r.name}</div>
              {r.service_type&&<div style={{fontSize:13,color:"#B8924A",fontWeight:600,marginBottom:2}}>🔧 {r.service_type}</div>}
              {r.phone&&<div style={{fontSize:13,marginBottom:2}}><a href={`tel:${r.phone.replace(/\D/g,"")}`} style={{color:"#2563EB",textDecoration:"none"}}>📞 {r.phone}</a></div>}
              {r.email&&<div style={{fontSize:13,marginBottom:2}}><a href={`mailto:${r.email}`} style={{color:"#2563EB",textDecoration:"none"}}>✉️ {r.email}</a></div>}
              {r.commission>0&&<div style={{fontSize:12,color:"#16A34A",fontWeight:600}}>💰 {r.commission}% comissão</div>}
              {r.notes&&<div style={{fontSize:12,color:"#888",marginTop:4,fontStyle:"italic"}}>{r.notes}</div>}
              {session.role==="owner"&&r.company&&<div style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:8,padding:"2px 8px",display:"inline-block",marginTop:6}}>🏢 {r.company}</div>}
            </div>
            <Btn onClick={()=>remove(r.id)} variant="danger" style={{padding:"5px 9px",fontSize:12}}>🗑️</Btn>
          </Card>
        ))
      }
      {showForm&&(
        <Modal onClose={()=>setShowForm(false)}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>➕ {sub==="installers"?t.newInstaller:t.newSalesperson}</div>
          <Input label={t.iFields.name} value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
          <div style={{display:"flex",gap:10}}><div style={{flex:1}}><Input label={t.iFields.phone} value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} type="tel"/></div><div style={{flex:1}}><Input label={t.iFields.email} value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/></div></div>
          {sub==="installers"&&<Input label={t.iFields.serviceType} value={form.service_type} onChange={v=>setForm(f=>({...f,service_type:v}))} placeholder="Countertop, Tile..."/>}
          {sub==="salespersons"&&<Input label={t.iFields.commission} value={form.commission} onChange={v=>setForm(f=>({...f,commission:Number(v)}))} type="number" placeholder="10"/>}
          <Input label={t.iFields.notes} value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} multiline/>
          <Input label={t.iFields.password} value={form.password} onChange={v=>setForm(f=>({...f,password:v}))} type="password" required/>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <Btn onClick={save} disabled={saving} style={{flex:1}}>{saving?t.saving:t.save}</Btn>
            <Btn onClick={()=>setShowForm(false)} variant="secondary">{t.cancel}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────
function Reports({session,t,showToast}) {
  const [from,setFrom]=useState(firstOfMonth()); const [to,setTo]=useState(today());
  const [report,setReport]=useState(null); const [loading,setLoading]=useState(false);
  const [pricing,setPricing]=useState({base_sf:45});
  const company=session.role==="owner"?null:session.company;
  useEffect(()=>{
    if(company) db.from("pricing_config").select("*").eq("company",company).single().then(({data})=>{ if(data) setPricing(data); });
  },[]);
  const generate=async()=>{
    setLoading(true);
    let q=db.from("jobs").select("*").gte("date",from).lte("date",to).order("date",{ascending:true});
    if(session.role==="admin") q=q.eq("company",company);
    if(session.role==="installer") q=q.or(`installer.eq.${session.name},assigned_to.eq.${session.name}`);
    if(session.role==="salesperson") q=q.eq("salesperson",session.name);
    const {data}=await q; setReport(data||[]); setLoading(false);
  };
  const calcRev=job=>(job.sf||0)*(pricing.base_sf||45);
  const totalSF=report?report.reduce((s,j)=>s+(j.sf||0),0):0;
  const totalRev=report?report.reduce((s,j)=>s+calcRev(j),0):0;
  const completed=report?report.filter(j=>j.status==="completed").length:0;
  const isAdmin=session.role==="admin"||session.role==="owner";
  return (
    <div>
      <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A",marginBottom:16}}>📊 {t.reports}</div>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:130}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{t.from}</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,boxSizing:"border-box",outline:"none"}}/></div>
          <div style={{flex:1,minWidth:130}}><label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:4}}>{t.to}</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,boxSizing:"border-box",outline:"none"}}/></div>
          <Btn onClick={generate} disabled={loading}>{loading?t.generating:t.generate}</Btn>
        </div>
      </Card>
      {report&&(report.length===0
        ?<div style={{textAlign:"center",padding:"40px",color:"#bbb"}}><div style={{fontSize:40,marginBottom:10}}>📊</div><div>{t.noData}</div></div>
        :<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:14}}>
            <div style={{background:"#1A1A1A",borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#B8924A"}}>{report.length}</div><div style={{fontSize:10,color:"#888",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>{t.totalJobsR}</div></div>
            <div style={{background:"#F0FDF4",borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#16A34A"}}>{completed}</div><div style={{fontSize:10,color:"#16A34A",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>{t.completedR}</div></div>
            <div style={{background:"#FDF6EC",borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#B8924A"}}>{totalSF.toFixed(1)}</div><div style={{fontSize:10,color:"#B8924A",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>{t.totalSF}</div></div>
            {isAdmin&&<div style={{background:"#EFF6FF",borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:"#2563EB"}}>${totalRev.toFixed(0)}</div><div style={{fontSize:10,color:"#2563EB",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginTop:4}}>{t.revenue}</div></div>}
          </div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <Sec style={{marginBottom:0}}>Jobs</Sec>
              <button onClick={()=>window.print()} style={{background:"#F3F4F6",color:"#374151",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:700}}>{t.print}</button>
            </div>
            {report.map(job=>(
              <div key={job.id} style={{borderBottom:"1px solid #F3F4F6",paddingBottom:12,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><Badge status={job.status} label={t.jobStatus[job.status]||job.status}/>{job.sf&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.sf} SF</span>}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{job.client}</div>
                    {job.client_phone&&<div style={{fontSize:12,color:"#2563EB"}}>📞 {job.client_phone}</div>}
                    {job.client_email&&<div style={{fontSize:12,color:"#2563EB"}}>✉️ {job.client_email}</div>}
                    {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600}}>💰 {job.builder}{job.builder_contact&&` · ${job.builder_contact}`}{job.builder_phone&&` · ${job.builder_phone}`}</div>}
                    {job.builder_note&&job.builder_note!=="—"&&<div style={{fontSize:11,color:"#F59E0B"}}>⚠️ {job.builder_note}</div>}
                    <div style={{fontSize:12,color:"#888"}}>📅 {fmt(job.date)} · 👷 {job.installer||"—"}{job.salesperson&&` · 💼 ${job.salesperson}`}</div>
                    {job.address&&<div style={{fontSize:12,color:"#666"}}>📍 {job.address}</div>}
                    {job.scope&&<div style={{fontSize:12,color:"#888",fontStyle:"italic",marginTop:4}}>{job.scope}</div>}
                  </div>
                  {isAdmin&&<div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:16,fontWeight:900,color:"#16A34A"}}>${calcRev(job).toFixed(0)}</div><div style={{fontSize:10,color:"#888"}}>{job.sf||0} SF × ${pricing.base_sf||45}</div></div>}
                </div>
              </div>
            ))}
            {isAdmin&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"2px solid #1A1A1A"}}><div style={{fontSize:14,fontWeight:800}}>TOTAL</div><div style={{fontSize:20,fontWeight:900,color:"#16A34A"}}>${totalRev.toFixed(2)}</div></div>}
          </Card>
        </>
      )}
    </div>
  );
}

// ─── QUOTE / CALCULATOR ───────────────────────────────────────────────
const DEFAULT_RATES = {
  material: { costPadrao: 37, costPremium: 60 },
  builderTiers: {
    starter:   { label: "Starter (novo)", precoPadrao: 54, precoPremium: 86 },
    builder:   { label: "Builder",        precoPadrao: 50, precoPremium: 80 },
    volume:    { label: "Volume",         precoPadrao: 46, precoPremium: 74 },
    strategic: { label: "Strategic",      precoPadrao: 43, precoPremium: 68 },
  },
  retailCategories: {
    granitoPadrao:  { label: "Granito padrão",        preco: 77,  custo: 37 },
    quartzoEntrada: { label: "Quartzo entrada/médio",  preco: 86,  custo: 37 },
    granitoPremium: { label: "Granito premium",        preco: 143, custo: 60 },
    quartzoPremium: { label: "Quartzo premium",        preco: 163, custo: 60 },
    quartzito:      { label: "Quartzito natural",      preco: 183, custo: 60 },
    marmore:        { label: "Mármore",                preco: 163, custo: 60 },
    exotica:        { label: "Pedra exótica",           preco: 220, custo: 95 },
    exclusiva:      { label: "Pedra exclusiva/rara",    preco: 280, custo: 130 },
  },
  instalacao: { custo: 6, preco: 12 },
  cutout: { custo: 90, preco: 150 },
  furoExtra: { custo: 25, preco: 55 },
  bordaPremium: { custo: 12, preco: 38 },
  waterfall: { custo: 500, preco: 1200 },
  comissaoPercent: 8,
};
const RATES_KEY = "Owner__quote_rates_v1";

function qfmt(n) { if (Number.isNaN(n)) return "$0"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function qnum(v) { const n = parseFloat(v); return Number.isNaN(n) ? 0 : n; }

function QNumberField({ label, value, onChange, prefix = "$", small }) {
  return (
    <label style={{display:"flex",flexDirection:"column",gap:4}}>
      <span style={{color:"#78716C",fontSize:small?11:12,fontWeight:600}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #D6D3D1",borderRadius:8,padding:"7px 10px"}}>
        {prefix && <span style={{color:"#A8A29E",fontSize:14}}>{prefix}</span>}
        <input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} style={{width:"100%",outline:"none",color:"#1c1917",fontSize:14,background:"transparent",border:"none"}}/>
      </div>
    </label>
  );
}
function QSection({ title, children }) {
  return (
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16,marginBottom:14}}>
      <h3 style={{fontSize:12,fontWeight:700,color:"#292524",marginBottom:10,letterSpacing:0.5,textTransform:"uppercase"}}>{title}</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>{children}</div>
    </div>
  );
}

function QuoteTab({ session, t, showToast }) {
  const [rates,setRates]=useState(DEFAULT_RATES); const [loadState,setLoadState]=useState("loading");
  const [saveState,setSaveState]=useState("idle"); const [qtab,setQtab]=useState("orcamento");
  const isOwner = session.role==="owner";

  useEffect(()=>{ (async()=>{
    try{
      const { data } = await db.from("pricing_config").select("*").eq("company","__quote_rates__").single();
      if(data && data.items){ setRates({...DEFAULT_RATES, ...JSON.parse(data.items)}); }
      setLoadState("ready");
    }catch{ setLoadState("ready"); }
  })(); },[]);

  const saveRates = async (next) => {
    setRates(next); setSaveState("saving");
    try{
      const {data:ex}=await db.from("pricing_config").select("id").eq("company","__quote_rates__").single();
      if(ex){ await db.from("pricing_config").update({items:JSON.stringify(next)}).eq("company","__quote_rates__"); }
      else{ await db.from("pricing_config").insert([{company:"__quote_rates__",base_sf:0,items:JSON.stringify(next)}]); }
      setSaveState("saved"); showToast(t.toasts.saved); setTimeout(()=>setSaveState("idle"),1500);
    }catch{ setSaveState("idle"); showToast(t.toasts.errSave,"error"); }
  };

  if(loadState==="loading") return <div style={{textAlign:"center",padding:40,color:"#B8924A"}}>⏳</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A"}}>💰 {t.nav.quote}</div>
        {isOwner && (
          <div style={{display:"flex",background:"#1A1A1A",borderRadius:20,padding:3,gap:2}}>
            <button onClick={()=>setQtab("orcamento")} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:qtab==="orcamento"?"#B8924A":"transparent",color:qtab==="orcamento"?"#fff":"#999"}}>🧮 Orçamento</button>
            <button onClick={()=>setQtab("config")} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:qtab==="config"?"#B8924A":"transparent",color:qtab==="config"?"#fff":"#999"}}>⚙️ Tabela</button>
          </div>
        )}
      </div>
      {qtab==="orcamento"||!isOwner ? <QuoteCalculator rates={rates}/> : <QuoteConfig rates={rates} onSave={saveRates} saveState={saveState}/>}
    </div>
  );
}

function QuoteCalculator({ rates }) {
  const [saleType,setSaleType]=useState("builder"); const [tier,setTier]=useState("builder");
  const [grade,setGrade]=useState("padrao"); const [category,setCategory]=useState("granitoPadrao");
  const [sf,setSf]=useState(35);
  const [materialPrice,setMaterialPrice]=useState(rates.builderTiers.builder.precoPadrao);
  const materialCost = saleType==="builder" ? (grade==="padrao"?rates.material.costPadrao:rates.material.costPremium) : rates.retailCategories[category].custo;
  const [installPrice,setInstallPrice]=useState(rates.instalacao.preco); const installCost=rates.instalacao.custo;
  const [cutoutQty,setCutoutQty]=useState(1); const [cutoutPrice,setCutoutPrice]=useState(rates.cutout.preco); const cutoutCost=rates.cutout.custo;
  const [furoQty,setFuroQty]=useState(0); const [furoPrice,setFuroPrice]=useState(rates.furoExtra.preco); const furoCost=rates.furoExtra.custo;
  const [bordaFt,setBordaFt]=useState(0); const [bordaPrice,setBordaPrice]=useState(rates.bordaPremium.preco); const bordaCost=rates.bordaPremium.custo;
  const [waterfallQty,setWaterfallQty]=useState(0); const [waterfallPrice,setWaterfallPrice]=useState(rates.waterfall.preco); const waterfallCost=rates.waterfall.custo;
  const [applyCommission,setApplyCommission]=useState(true); const [commissionPct,setCommissionPct]=useState(rates.comissaoPercent);
  const [clientMode,setClientMode]=useState(false);

  useEffect(()=>{
    if(saleType==="builder"){ setMaterialPrice(grade==="padrao"?rates.builderTiers[tier].precoPadrao:rates.builderTiers[tier].precoPremium); }
    else{ setMaterialPrice(rates.retailCategories[category].preco); }
    // eslint-disable-next-line
  },[saleType,tier,grade,category,rates]);

  const lines=[
    { label: saleType==="builder" ? `Material + fabricação (${rates.builderTiers[tier].label}, ${grade==="padrao"?"padrão":"premium"})` : `Material + fabricação (${rates.retailCategories[category].label})`, qty:sf, unit:"SF", cost:materialCost, price:materialPrice },
    { label:"Instalação", qty:sf, unit:"SF", cost:installCost, price:installPrice },
  ];
  if(cutoutQty>0) lines.push({label:"Cutout (pia/cooktop)",qty:cutoutQty,unit:"un",cost:cutoutCost,price:cutoutPrice});
  if(furoQty>0) lines.push({label:"Furo extra",qty:furoQty,unit:"un",cost:furoCost,price:furoPrice});
  if(bordaFt>0) lines.push({label:"Acabamento borda premium",qty:bordaFt,unit:"pé",cost:bordaCost,price:bordaPrice});
  if(waterfallQty>0) lines.push({label:"Waterfall edge",qty:waterfallQty,unit:"painel",cost:waterfallCost,price:waterfallPrice});

  const totalCost=lines.reduce((s,l)=>s+l.qty*l.cost,0);
  const totalPrice=lines.reduce((s,l)=>s+l.qty*l.price,0);
  const grossMargin=totalPrice-totalCost;
  const grossMarginPct=totalPrice>0?(grossMargin/totalPrice)*100:0;
  const commission=applyCommission?(totalPrice*commissionPct)/100:0;
  const netProfit=grossMargin-commission;
  const netProfitPct=totalPrice>0?(netProfit/totalPrice)*100:0;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16}}>
        <span style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:0.5}}>Tipo de venda</span>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          {[{id:"builder",label:"Builder"},{id:"retail",label:"Cliente final"}].map(opt=>(
            <button key={opt.id} onClick={()=>setSaleType(opt.id)} style={{flex:1,padding:"9px 0",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",border:`1px solid ${saleType===opt.id?"#1A1A1A":"#E7E5E4"}`,background:saleType===opt.id?"#1A1A1A":"#FAFAF9",color:saleType===opt.id?"#fff":"#57534E"}}>{opt.label}</button>
          ))}
        </div>
        {saleType==="builder" ? (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
            <Select label="Tier" value={tier} onChange={setTier} options={Object.entries(rates.builderTiers).map(([id,tt])=>({value:id,label:tt.label}))}/>
            <Select label="Material" value={grade} onChange={setGrade} options={[{value:"padrao",label:"Padrão"},{value:"premium",label:"Premium"}]}/>
          </div>
        ):(
          <div style={{marginTop:12}}>
            <Select label="Categoria" value={category} onChange={setCategory} options={Object.entries(rates.retailCategories).map(([id,c])=>({value:id,label:c.label}))}/>
          </div>
        )}
      </div>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16}}>
        <span style={{fontSize:11,fontWeight:700,color:"#78716C",textTransform:"uppercase",letterSpacing:0.5}}>Job</span>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginTop:10}}>
          <QNumberField label="Metragem (SF)" value={sf} onChange={v=>setSf(qnum(v))} prefix=""/>
          <QNumberField label="Preço material/SF" value={materialPrice} onChange={v=>setMaterialPrice(qnum(v))}/>
          <QNumberField label="Preço instalação/SF" value={installPrice} onChange={v=>setInstallPrice(qnum(v))}/>
          <QNumberField label="Cutouts (qtd)" value={cutoutQty} onChange={v=>setCutoutQty(qnum(v))} prefix=""/>
          <QNumberField label="Preço/cutout" value={cutoutPrice} onChange={v=>setCutoutPrice(qnum(v))}/>
          <QNumberField label="Furos extras (qtd)" value={furoQty} onChange={v=>setFuroQty(qnum(v))} prefix=""/>
          <QNumberField label="Preço/furo extra" value={furoPrice} onChange={v=>setFuroPrice(qnum(v))}/>
          <QNumberField label="Borda premium (pés)" value={bordaFt} onChange={v=>setBordaFt(qnum(v))} prefix=""/>
          <QNumberField label="Preço/pé borda" value={bordaPrice} onChange={v=>setBordaPrice(qnum(v))}/>
          <QNumberField label="Waterfall (painéis)" value={waterfallQty} onChange={v=>setWaterfallQty(qnum(v))} prefix=""/>
          <QNumberField label="Preço/painel" value={waterfallPrice} onChange={v=>setWaterfallPrice(qnum(v))}/>
        </div>
      </div>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16,display:"flex",flexDirection:"column",gap:12}}>
        <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
          <input type="checkbox" checked={applyCommission} onChange={e=>setApplyCommission(e.target.checked)} style={{width:16,height:16,accentColor:"#B8924A"}}/>
          Comissão de vendedor
          {applyCommission && <input type="number" value={commissionPct} onChange={e=>setCommissionPct(qnum(e.target.value))} style={{width:56,border:"1px solid #D6D3D1",borderRadius:6,padding:"3px 6px",fontSize:13,marginLeft:4}}/>}
          {applyCommission && <span style={{color:"#A8A29E"}}>%</span>}
        </label>
        <button onClick={()=>setClientMode(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,padding:"8px 14px",borderRadius:8,border:"1px solid #D6D3D1",background:"#FAFAF9",cursor:"pointer",alignSelf:"flex-start"}}>
          {clientMode?"🙈":"👁️"} {clientMode?"Modo cliente (ativo)":"Mostrar modo cliente"}
        </button>
      </div>

      <div style={{background:"#1A1A1A",borderRadius:12,padding:16,color:"#fff"}}>
        <h3 style={{fontSize:11,textTransform:"uppercase",letterSpacing:0.5,color:"#999",marginBottom:10}}>{clientMode?"Orçamento":"Resultado interno"}</h3>
        <div>
          {lines.map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",fontSize:13,borderBottom:i<lines.length-1?"1px solid #333":"none"}}>
              <div style={{color:"#ccc"}}>{l.label} <span style={{color:"#777"}}>· {l.qty} {l.unit}</span></div>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                {!clientMode && <span style={{color:"#888",fontSize:11,width:64,textAlign:"right"}}>custo {qfmt(l.cost*l.qty)}</span>}
                <span style={{fontWeight:700,width:80,textAlign:"right"}}>{qfmt(l.price*l.qty)}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid #333",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{color:"#ccc",fontSize:13}}>Preço total ao cliente</span>
            <span style={{fontSize:26,fontWeight:900,color:"#B8924A"}}>{qfmt(totalPrice)}</span>
          </div>
          {!clientMode && (<>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#999"}}><span>Custo total</span><span>{qfmt(totalCost)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#ccc"}}>Margem bruta</span><span style={{color:"#4ADE80",fontWeight:700}}>{qfmt(grossMargin)} ({grossMarginPct.toFixed(1)}%)</span></div>
            {applyCommission && <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#999"}}><span>Comissão vendedor ({commissionPct}%)</span><span>−{qfmt(commission)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,paddingTop:6,borderTop:"1px solid #2a2a2a"}}><span style={{color:"#eee",fontWeight:600}}>Lucro líquido</span><span style={{color:"#6EE7B7",fontWeight:800}}>{qfmt(netProfit)} ({netProfitPct.toFixed(1)}%)</span></div>
          </>)}
        </div>
      </div>
    </div>
  );
}

function QuoteConfig({ rates, onSave, saveState }) {
  const [draft,setDraft]=useState(rates);
  useEffect(()=>setDraft(rates),[rates]);
  const set=(path,value)=>{ setDraft(prev=>{ const next=structuredClone(prev); let obj=next; for(let i=0;i<path.length-1;i++) obj=obj[path[i]]; obj[path[path.length-1]]=value; return next; }); };
  const addRetailCategory=()=>{
    const id="custom_"+Date.now();
    setDraft(prev=>({...prev, retailCategories:{...prev.retailCategories,[id]:{label:"Nova categoria",preco:200,custo:90}}}));
  };
  const removeRetailCategory=(id)=>{ setDraft(prev=>{ const next={...prev}; const rc={...next.retailCategories}; delete rc[id]; next.retailCategories=rc; return next; }); };

  return (
    <div>
      <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",color:"#92400E",fontSize:12,borderRadius:8,padding:"10px 12px",marginBottom:16}}>
        ⚠️ Esses valores ficam salvos para todos com acesso ao Profield — inclusive seus vendedores ao usar o orçamento. Ajuste com cuidado.
      </div>

      <QSection title="Custo do material (parceria MC)">
        <QNumberField label="Padrão $/SF" value={draft.material.costPadrao} onChange={v=>set(["material","costPadrao"],qnum(v))}/>
        <QNumberField label="Premium $/SF" value={draft.material.costPremium} onChange={v=>set(["material","costPremium"],qnum(v))}/>
      </QSection>

      <QSection title="Instalação">
        <QNumberField label="Custo $/SF" value={draft.instalacao.custo} onChange={v=>set(["instalacao","custo"],qnum(v))}/>
        <QNumberField label="Preço $/SF" value={draft.instalacao.preco} onChange={v=>set(["instalacao","preco"],qnum(v))}/>
      </QSection>

      <QSection title="Cutout">
        <QNumberField label="Custo" value={draft.cutout.custo} onChange={v=>set(["cutout","custo"],qnum(v))}/>
        <QNumberField label="Preço mínimo" value={draft.cutout.preco} onChange={v=>set(["cutout","preco"],qnum(v))}/>
      </QSection>

      <QSection title="Furo extra">
        <QNumberField label="Custo" value={draft.furoExtra.custo} onChange={v=>set(["furoExtra","custo"],qnum(v))}/>
        <QNumberField label="Preço" value={draft.furoExtra.preco} onChange={v=>set(["furoExtra","preco"],qnum(v))}/>
      </QSection>

      <QSection title="Borda premium (por pé linear)">
        <QNumberField label="Custo" value={draft.bordaPremium.custo} onChange={v=>set(["bordaPremium","custo"],qnum(v))}/>
        <QNumberField label="Preço" value={draft.bordaPremium.preco} onChange={v=>set(["bordaPremium","preco"],qnum(v))}/>
      </QSection>

      <QSection title="Waterfall edge (por painel)">
        <QNumberField label="Custo" value={draft.waterfall.custo} onChange={v=>set(["waterfall","custo"],qnum(v))}/>
        <QNumberField label="Preço" value={draft.waterfall.preco} onChange={v=>set(["waterfall","preco"],qnum(v))}/>
      </QSection>

      <QSection title="Comissão de vendedor">
        <QNumberField label="% padrão" value={draft.comissaoPercent} onChange={v=>set(["comissaoPercent"],qnum(v))} prefix=""/>
      </QSection>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16,marginBottom:14}}>
        <h3 style={{fontSize:12,fontWeight:700,color:"#292524",marginBottom:10,letterSpacing:0.5,textTransform:"uppercase"}}>Tiers Builder ($/SF — só material)</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(draft.builderTiers).map(([id,tt])=>(
            <div key={id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,alignItems:"end"}}>
              <span style={{fontSize:13,color:"#57534E",fontWeight:600}}>{tt.label}</span>
              <QNumberField label="Padrão" value={tt.precoPadrao} onChange={v=>set(["builderTiers",id,"precoPadrao"],qnum(v))} small/>
              <QNumberField label="Premium" value={tt.precoPremium} onChange={v=>set(["builderTiers",id,"precoPremium"],qnum(v))} small/>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E7E5E4",padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <h3 style={{fontSize:12,fontWeight:700,color:"#292524",letterSpacing:0.5,textTransform:"uppercase"}}>Categorias cliente final ($/SF) — inclui exóticas e exclusivas</h3>
          <button onClick={addRetailCategory} style={{background:"#B8924A18",color:"#B8924A",border:"1px solid #B8924A44",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Categoria</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(draft.retailCategories).map(([id,c])=>(
            <div key={id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
              {id.startsWith("custom_")||id==="exotica"||id==="exclusiva"
                ? <input value={c.label} onChange={e=>set(["retailCategories",id,"label"],e.target.value)} style={{fontSize:13,color:"#1c1917",fontWeight:600,border:"1px solid #D6D3D1",borderRadius:8,padding:"7px 10px",background:"#fff"}}/>
                : <span style={{fontSize:13,color:"#57534E",fontWeight:600}}>{c.label}</span>
              }
              <QNumberField label="Custo" value={c.custo} onChange={v=>set(["retailCategories",id,"custo"],qnum(v))} small/>
              <QNumberField label="Preço" value={c.preco} onChange={v=>set(["retailCategories",id,"preco"],qnum(v))} small/>
              {id.startsWith("custom_") && <button onClick={()=>removeRetailCategory(id)} style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #DC262633",borderRadius:8,padding:"7px 10px",fontSize:12,cursor:"pointer",fontWeight:700}}>🗑️</button>}
            </div>
          ))}
        </div>
      </div>

      <button onClick={()=>onSave(draft)} disabled={saveState==="saving"} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"#B8924A",color:"#fff",fontWeight:700,padding:"12px 0",borderRadius:10,border:"none",cursor:"pointer",fontSize:14}}>
        {saveState==="saving"?"⏳ Salvando...":saveState==="saved"?"✅ Salvo!":"💾 Salvar tabela"}
      </button>
    </div>
  );
}

// ─── COMPANIES TAB ────────────────────────────────────────────────────
function CompaniesTab({t,showToast,allJobs,allInstallers,session}) {
  const [admins,setAdmins]=useState([]); const [selected,setSelected]=useState(null); const [cTab,setCTab]=useState("jobs");
  const [cJobs,setCJobs]=useState([]); const [showJobForm,setShowJobForm]=useState(false); const [editingJob,setEditingJob]=useState(null); const [saving,setSaving]=useState(false);
  const [installerNames,setInstallerNames]=useState([]); const [salespersonNames,setSalespersonNames]=useState([]);
  const [cServices,setCServices]=useState([]); const [showPricing,setShowPricing]=useState(false); const [showServices,setShowServices]=useState(false);
  const [showAdmins,setShowAdmins]=useState(false);
  const loadAdmins=async()=>{ const {data}=await db.from("admins").select("*").eq("vertical",session.vertical||"construction").order("company"); if(data) setAdmins(data); };
  useEffect(()=>{ loadAdmins(); },[]);
  const openCompany=async(admin)=>{
    setSelected(admin); setCTab("jobs");
    const {data:jobs}=await db.from("jobs").select("*").eq("company",admin.company).order("date",{ascending:true});
    const {data:photos}=await db.from("job_photos").select("*"); const ph=photos||[];
    setCJobs((jobs||[]).map(j=>({...j,photos:ph.filter(p=>p.job_id===j.id)})));
    const {data:inst}=await db.from("installers").select("*").eq("company",admin.company);
    setInstallerNames((inst||[]).map(i=>i.name));
    const {data:sales}=await db.from("salespeople").select("*").eq("company",admin.company);
    setSalespersonNames((sales||[]).map(s=>s.name));
    const {data:svc}=await db.from("company_services").select("*").eq("company",admin.company).eq("active",true);
    setCServices((svc||[]).map(s=>s.name));
  };
  const saveJob=async(form)=>{
    setSaving(true);
    if(editingJob){ await db.from("jobs").update(form).eq("id",editingJob.id); setCJobs(prev=>prev.map(j=>j.id===editingJob.id?{...j,...form}:j)); showToast(t.toasts.jobUpdated); }
    else { const {data}=await db.from("jobs").insert([{...form,company:selected.company}]).select().single(); if(data) setCJobs(prev=>[...prev,{...data,photos:[]}]); showToast(t.toasts.jobCreated); }
    setSaving(false); setShowJobForm(false); setEditingJob(null);
  };
  const deleteJob=async(id)=>{ if(!confirm(t.confirmDel)) return; await db.from("jobs").delete().eq("id",id); setCJobs(prev=>prev.filter(j=>j.id!==id)); showToast(t.toasts.jobDeleted); };
  const removeAdmin=async(id)=>{ if(!confirm(t.confirmDel)) return; await db.from("admins").delete().eq("id",id); loadAdmins(); setSelected(null); };
  const getStats=c=>{ const cj=allJobs.filter(j=>j.company===c); return {active:cj.filter(j=>j.status==="scheduled"||j.status==="in_progress").length,total:cj.length,inst:allInstallers.filter(i=>i.company===c).length}; };

  // Admins manager
  const [aName,setAName]=useState(""); const [aCo,setACo]=useState(""); const [aPw,setAPw]=useState(""); const [aSaving,setASaving]=useState(false);
  const sessionVTheme=getVertical(session.vertical);
  const addAdmin=async()=>{
    if(!aName||!aCo||!aPw){alert("Fill all fields.");return;}
    setASaving(true); const {error}=await db.from("admins").insert([{name:aName,company:aCo,password:aPw,vertical:session.vertical||"construction"}]); setASaving(false);
    if(error){showToast(t.toasts.errDup,"error");return;} showToast(t.toasts.adminAdded); setAName("");setACo("");setAPw(""); loadAdmins();
  };

  if(showAdmins) return (
    <div>
      <button onClick={()=>setShowAdmins(false)} style={{background:"none",border:"1px solid #E5E7EB",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",color:"#666",marginBottom:16}}>← {t.companies}</button>
      <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>⚙️ {t.admins}</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,background:sessionVTheme.accent+"18",color:sessionVTheme.accent,border:`1px solid ${sessionVTheme.accent}44`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,marginBottom:16}}>{sessionVTheme.icon} {sessionVTheme.label}</div>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>{t.newAdmin} — {sessionVTheme.label}</div>
        <Input label={t.adminName} value={aName} onChange={setAName} placeholder="John"/>
        <Input label={t.adminCompany} value={aCo} onChange={setACo} placeholder="MC Granite"/>
        <Input label="Password" value={aPw} onChange={setAPw} type="password"/>
        <Btn onClick={addAdmin} disabled={aSaving}>{aSaving?t.saving:t.add}</Btn>
      </Card>
      {admins.map(a=>{
        const av=getVertical(a.vertical);
        return (
        <Card key={a.id} style={{marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:15,fontWeight:700}}>{a.name}</div><div style={{fontSize:12,color:"#888"}}>🏢 {a.company}</div><div style={{fontSize:11,color:av.accent,fontWeight:700,marginTop:2}}>{av.icon} {av.label}</div></div>
          <Btn onClick={()=>removeAdmin(a.id)} variant="danger" style={{padding:"5px 10px",fontSize:12}}>🗑️</Btn>
        </Card>
      );})}
    </div>
  );

  if(selected) return (
    <div>
      <button onClick={()=>setSelected(null)} style={{background:"none",border:"1px solid #E5E7EB",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",color:"#666",marginBottom:14}}>← {t.companies}</button>
      <div style={{background:"#1A1A1A",borderRadius:14,padding:18,marginBottom:14,borderBottom:"3px solid #B8924A"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div><div style={{fontSize:11,color:"#B8924A",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>⚙️ {selected.name}</div><div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{selected.company}</div></div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn onClick={()=>setShowServices(true)} variant="ghost" style={{padding:"5px 10px",fontSize:11}}>🔧 {t.services}</Btn>
            <Btn onClick={()=>setShowPricing(true)} variant="ghost" style={{padding:"5px 10px",fontSize:11}}>{t.companyPricing}</Btn>
            <Btn onClick={()=>removeAdmin(selected.id)} variant="danger" style={{padding:"5px 10px",fontSize:11}}>🗑️</Btn>
          </div>
        </div>
        <div style={{display:"flex",gap:14,marginTop:14,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"#bbb"}}>📋 {cJobs.filter(j=>j.status==="scheduled"||j.status==="in_progress").length} {t.activeJobs}</span>
          <span style={{fontSize:13,color:"#bbb"}}>📊 {cJobs.length} {t.totalJobs}</span>
          <span style={{fontSize:13,color:"#bbb"}}>👷 {installerNames.length} {t.installers}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[{id:"jobs",label:`📋 ${t.companyJobs}`},{id:"team",label:`👥 ${t.companyTeam}`},{id:"contacts",label:`📇 ${t.companyContacts}`},{id:"reports",label:`📊 ${t.reports}`}].map(ct=>(
          <button key={ct.id} onClick={()=>setCTab(ct.id)} style={{background:cTab===ct.id?"#1A1A1A":"#fff",color:cTab===ct.id?"#B8924A":"#666",border:`1px solid ${cTab===ct.id?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{ct.label}</button>
        ))}
      </div>
      {cTab==="jobs"&&(<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><Btn onClick={()=>{setEditingJob(null);setShowJobForm(true);}}>{t.newJob}</Btn></div>
        {cJobs.length===0?<div style={{textAlign:"center",padding:"30px",color:"#bbb"}}><div style={{fontSize:36,marginBottom:8}}>📋</div><div>{t.noJobs}</div></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {cJobs.map(job=>(
              <Card key={job.id} style={{borderLeft:`4px solid ${SC[job.status]||SC.scheduled}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><Badge status={job.status} label={t.jobStatus[job.status]||job.status}/>{job.sf&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.sf} SF</span>}</div>
                    <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
                    {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,color:"#2563EB",display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:"none"}}>📍 {job.address} ↗</a>
                    <div style={{fontSize:12,color:"#999",marginTop:4}}>📅 {fmt(job.date)} · 👷 {job.installer||"—"}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <Btn onClick={()=>{setEditingJob(job);setShowJobForm(true);}} variant="ghost" style={{padding:"5px 9px",fontSize:12}}>✏️</Btn>
                    <Btn onClick={()=>deleteJob(job.id)} variant="danger" style={{padding:"5px 9px",fontSize:12}}>🗑️</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        }
      </>)}
      {cTab==="team"&&<TeamManager session={{role:"owner"}} t={t} showToast={showToast} forceCompany={selected.company}/>}
      {cTab==="contacts"&&<ContactsTab session={{role:"owner"}} t={t} showToast={showToast} forceCompany={selected.company}/>}
      {cTab==="reports"&&<Reports session={{role:"admin",company:selected.company,name:selected.name}} t={t} showToast={showToast}/>}
      {showJobForm&&<JobForm onSave={saveJob} onCancel={()=>{setShowJobForm(false);setEditingJob(null);}} saving={saving} initial={editingJob} session={{...session,vertical:selected.vertical||"construction"}} t={t} companyServices={cServices} installerNames={installerNames} salespersonNames={salespersonNames}/>}
      {showPricing&&<PricingModal company={selected.company} t={t} showToast={showToast} onClose={()=>setShowPricing(false)}/>}
      {showServices&&<ServicesModal company={selected.company} t={t} showToast={showToast} onClose={()=>setShowServices(false)}/>}
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A"}}>🏢 {t.companies}</div>
        <Btn onClick={()=>setShowAdmins(true)} variant="ghost">⚙️ {t.admins}</Btn>
      </div>
      {admins.length===0?<div style={{textAlign:"center",padding:"40px",color:"#bbb"}}><div style={{fontSize:44,marginBottom:10}}>🏢</div><div>{t.noCompanies}</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:12}}>
          {admins.map(admin=>{
            const s=getStats(admin.company);
            return (
              <Card key={admin.id} onClick={()=>openCompany(admin)} style={{borderLeft:"4px solid #B8924A",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,0.04)"}>
                <div style={{fontSize:18,fontWeight:900,color:"#1A1A1A",marginBottom:4}}>{admin.company}</div>
                <div style={{fontSize:13,color:"#888",marginBottom:12}}>⚙️ {admin.name}</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <div style={{background:"#FDF6EC",borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#B8924A"}}>{s.active}</div><div style={{fontSize:10,color:"#B8924A",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.activeJobs}</div></div>
                  <div style={{background:"#F3F4F6",borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#555"}}>{s.total}</div><div style={{fontSize:10,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.totalJobs}</div></div>
                  <div style={{background:"#EFF6FF",borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:"#2563EB"}}>{s.inst}</div><div style={{fontSize:10,color:"#2563EB",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{t.installers}</div></div>
                </div>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}

function PricingModal({company,t,showToast,onClose}) {
  const [cfg,setCfg]=useState({base_sf:45}); const [saving,setSaving]=useState(false);
  useEffect(()=>{ db.from("pricing_config").select("*").eq("company",company).single().then(({data})=>{ if(data) setCfg(data); }); },[]);
  const save=async()=>{
    setSaving(true);
    const {data:ex}=await db.from("pricing_config").select("id").eq("company",company).single();
    let error;
    if(ex){ ({error}=await db.from("pricing_config").update({base_sf:cfg.base_sf,updated_at:new Date().toISOString()}).eq("company",company)); }
    else { ({error}=await db.from("pricing_config").insert([{company,base_sf:cfg.base_sf}])); }
    setSaving(false); if(error){showToast(t.toasts.errSave,"error");return;} showToast(t.toasts.saved); onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>{t.pricing}</div>
      <Input label={t.baseSF} value={cfg.base_sf} onChange={v=>setCfg(c=>({...c,base_sf:Number(v)}))} type="number"/>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Btn onClick={save} disabled={saving} style={{flex:1}}>{saving?t.saving:t.savePricing}</Btn>
        <Btn onClick={onClose} variant="secondary">{t.cancel}</Btn>
      </div>
    </Modal>
  );
}

function ServicesModal({company,t,showToast,onClose}) {
  const [services,setServices]=useState([]); const [newSvc,setNewSvc]=useState(""); const [saving,setSaving]=useState(false);
  useEffect(()=>{ db.from("company_services").select("*").eq("company",company).order("name").then(({data})=>{ if(data&&data.length>0) setServices(data); else setServices(DEFAULT_SERVICES.map((n,i)=>({id:`default-${i}`,name:n,active:true,company}))); }); },[]);
  const toggleSvc=(name)=>setServices(prev=>prev.map(s=>s.name===name?{...s,active:!s.active}:s));
  const addSvc=()=>{ if(!newSvc.trim()) return; setServices(prev=>[...prev,{id:`new-${Date.now()}`,name:newSvc.trim(),active:true,company}]); setNewSvc(""); };
  const save=async()=>{
    setSaving(true);
    await db.from("company_services").delete().eq("company",company);
    const toInsert=services.map(({name,active})=>({company,name,active}));
    const {error}=await db.from("company_services").insert(toInsert);
    setSaving(false); if(error){showToast(t.toasts.errSave,"error");return;} showToast(t.toasts.saved); onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:800,marginBottom:18}}>🔧 {t.services}</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input value={newSvc} onChange={e=>setNewSvc(e.target.value)} placeholder="New service..." style={{flex:1,border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 12px",fontSize:14,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&addSvc()}/>
        <Btn onClick={addSvc}>{t.addService}</Btn>
      </div>
      <div style={{marginBottom:16}}>
        {services.map(s=>(
          <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:s.active?"#F0FDF4":"#F9FAFB",borderRadius:10,marginBottom:6,border:`1px solid ${s.active?"#16A34A33":"#E5E7EB"}`}}>
            <span style={{fontSize:13,fontWeight:600,color:s.active?"#16A34A":"#999"}}>{s.name}</span>
            <button onClick={()=>toggleSvc(s.name)} style={{background:s.active?"#DC262622":"#16A34A22",color:s.active?"#DC2626":"#16A34A",border:"none",borderRadius:8,padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>{s.active?"✕ Off":"✓ On"}</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={save} disabled={saving} style={{flex:1}}>{saving?t.saving:t.save}</Btn>
        <Btn onClick={onClose} variant="secondary">{t.cancel}</Btn>
      </div>
    </Modal>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────
function Calendar({jobs,onSelectJob,t,lang}) {
  const MONTHS={pt:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],en:["January","February","March","April","May","June","July","August","September","October","November","December"],es:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]};
  const DAYS={pt:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],en:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],es:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]};
  const now=new Date(); const [year,setYear]=useState(now.getFullYear()); const [month,setMonth]=useState(now.getMonth()); const [sel,setSel]=useState(today());
  const fd=new Date(year,month,1).getDay(), dim=new Date(year,month+1,0).getDate(), tf=today();
  const jbd={}; jobs.forEach(j=>{ if(j.date){ if(!jbd[j.date]) jbd[j.date]=[]; jbd[j.date].push(j); }});
  const prev=()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next=()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const selJobs=jbd[sel]||[];
  return (
    <div>
      <div style={{background:"#1A1A1A",borderRadius:14,padding:"16px 20px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><button onClick={prev} style={{background:"#2A2A2A",border:"none",color:"#B8924A",borderRadius:8,padding:"6px 14px",fontSize:18,cursor:"pointer"}}>‹</button><div style={{color:"#fff",fontWeight:800,fontSize:16}}>{(MONTHS[lang]||MONTHS.en)[month]} {year}</div><button onClick={next} style={{background:"#2A2A2A",border:"none",color:"#B8924A",borderRadius:8,padding:"6px 14px",fontSize:18,cursor:"pointer"}}>›</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{(DAYS[lang]||DAYS.en).map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#666",fontWeight:700,padding:"4px 0"}}>{d}</div>)}</div>
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
      <div style={{fontSize:13,fontWeight:800,color:"#1A1A1A",marginBottom:10}}>📅 {fmt(sel)}<span style={{color:"#999",fontWeight:400,marginLeft:8}}>{selJobs.length===0?"—":`${selJobs.length}`}</span></div>
      {selJobs.length===0?<Card style={{textAlign:"center",color:"#bbb",fontSize:13}}>—</Card>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {selJobs.map(job=>(
            <Card key={job.id} onClick={()=>onSelectJob(job)} style={{borderLeft:`4px solid ${SC[job.status]||SC.scheduled}`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><Badge status={job.status} label={t.jobStatus[job.status]||job.status}/>{job.sf&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.sf} SF</span>}</div>
              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
              {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
              <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,color:"#2563EB",display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:"none"}}>📍 {job.address} ↗</a>
              <div style={{fontSize:12,color:"#999",marginTop:4}}>🕐 {job.time} · 👷 {job.installer||"—"}</div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]=useState(()=>localStorage.getItem("pf_lang")||"pt");
  const t=L[lang];
  const [session,setSession]=useState(()=>{ try{ const s=localStorage.getItem(SESSION_KEY); return s?JSON.parse(s):null; }catch{return null;} });
  const [tab,setTab]=useState("list"); const [view,setView]=useState("main");
  const [jobs,setJobs]=useState([]); const [allInstallers,setAllInstallers]=useState([]);
  const [selectedId,setSelectedId]=useState(null); const [showJobForm,setShowJobForm]=useState(false); const [editingJob,setEditingJob]=useState(null);
  const [filterStatus,setFilterStatus]=useState("all"); const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false); const [uploading,setUploading]=useState(false);
  const [installerNames,setInstallerNames]=useState([]); const [salespersonNames,setSalespersonNames]=useState([]);
  const [companyServices,setCompanyServices]=useState([]);
  const [showPricingModal,setShowPricingModal]=useState(false);
  const [toast,showToast]=useToast();
  const isAdmin=session?.role==="admin"||session?.role==="owner";
  const canSeeJobs=true;

  const login=(s)=>{ setSession(s); localStorage.setItem(SESSION_KEY,JSON.stringify(s)); };
  const logout=()=>{ setSession(null); localStorage.removeItem(SESSION_KEY); };
  const switchVertical=(v)=>{ setSession(prev=>{ const next={...prev,vertical:v}; localStorage.setItem(SESSION_KEY,JSON.stringify(next)); return next; }); setTab("list"); setView("main"); };

  const loadJobs=useCallback(async()=>{
    if(!session) return;
    setLoading(true);
    let q=db.from("jobs").select("*").order("date",{ascending:true});
    if(session.role==="owner") q=q.eq("vertical",session.vertical||"construction");
    if(session.role==="admin") q=q.eq("company",session.company);
    if(session.role==="installer") q=q.or(`installer.eq.${session.name},assigned_to.eq.${session.name}`);
    if(session.role==="salesperson") q=q.eq("salesperson",session.name);
    const {data:jd,error}=await q; if(error){showToast(t.toasts.errLoad,"error");setLoading(false);return;}
    const {data:pd}=await db.from("job_photos").select("*"); const photos=pd||[];
    setJobs((jd||[]).map(j=>({...j,photos:photos.filter(p=>p.job_id===j.id)})));
    setLoading(false);
  },[session]);

  const loadTeam=useCallback(async()=>{
    if(!session||!isAdmin) return;
    let qi=db.from("installers").select("name,company").order("name");
    let qs=db.from("salespeople").select("name,company").order("name");
    if(session.role==="admin"){ qi=qi.eq("company",session.company); qs=qs.eq("company",session.company); }
    const [{data:inst},{data:sales}]=await Promise.all([qi,qs]);
    setInstallerNames((inst||[]).map(i=>i.name));
    setSalespersonNames((sales||[]).map(s=>s.name));
    setAllInstallers(inst||[]);
    if(session.role==="admin"){
      const {data:svc}=await db.from("company_services").select("*").eq("company",session.company).eq("active",true);
      setCompanyServices((svc||[]).map(s=>s.name));
    }
  },[session,isAdmin]);

  useEffect(()=>{ loadJobs(); loadTeam(); },[session]);

  const selectedJob=jobs.find(j=>j.id===selectedId);
  const filteredJobs=jobs.filter(j=>filterStatus==="all"||j.status===filterStatus);

  const saveJob=async(form)=>{
    setSaving(true);
    const company=session.role==="admin"?session.company:"Owner";
    const {data,error}=await db.from("jobs").insert([{...form,company}]).select().single();
    if(error){showToast(t.toasts.errSave+" - "+error.message,"error");setSaving(false);return;}
    setJobs(prev=>[...prev,{...data,photos:[]}]); setShowJobForm(false); setSaving(false); showToast(t.toasts.jobCreated);
  };
  const updateJob=async(form)=>{
    setSaving(true);
    const {company:_c,id:_id,photos:_p,created_at:_ca,...fields}=form;
    const {error}=await db.from("jobs").update(fields).eq("id",editingJob.id);
    if(error){showToast(t.toasts.errSave+" - "+error.message,"error");setSaving(false);return;}
    setJobs(prev=>prev.map(j=>j.id===editingJob.id?{...j,...fields}:j));
    setEditingJob(null); setSaving(false); showToast(t.toasts.jobUpdated);
  };
  const deleteJob=async(id)=>{ if(!confirm(t.confirmDel)) return; await db.from("job_photos").delete().eq("job_id",id); await db.from("jobs").delete().eq("id",id); setJobs(prev=>prev.filter(j=>j.id!==id)); setView("main"); showToast(t.toasts.jobDeleted); };
  const updateStatus=async(id,status)=>{ const {error}=await db.from("jobs").update({status}).eq("id",id); if(error){showToast(t.toasts.errSave,"error");return;} setJobs(prev=>prev.map(j=>j.id===id?{...j,status}:j)); showToast(t.toasts.statusUpdated); };
  const addPhoto=async(jobId,type,file)=>{
    setUploading(true); const ext=file.name.split(".").pop(); const path=`${jobId}/${type}-${Date.now()}.${ext}`;
    const {error:upErr}=await db.storage.from("job-photos").upload(path,file);
    if(upErr){showToast(t.toasts.errPhoto,"error");setUploading(false);return;}
    const {data:{publicUrl}}=db.storage.from("job-photos").getPublicUrl(path);
    const {data:photo,error:dbErr}=await db.from("job_photos").insert([{job_id:jobId,type,url:publicUrl}]).select().single();
    if(dbErr){showToast(t.toasts.errPhoto,"error");setUploading(false);return;}
    setJobs(prev=>prev.map(j=>j.id===jobId?{...j,photos:[...(j.photos||[]),photo]}:j));
    setUploading(false); showToast(t.toasts.photoSent);
  };
  const deletePhoto=async(photo)=>{ if(!confirm(t.confirmDel)) return; const path=photo.url.split("/job-photos/")[1]; await db.storage.from("job-photos").remove([path]); await db.from("job_photos").delete().eq("id",photo.id); setJobs(prev=>prev.map(j=>({...j,photos:(j.photos||[]).filter(p=>p.id!==photo.id)}))); showToast(t.toasts.photoRemoved); };
  const saveNotes=async(id,notes)=>{ const {error}=await db.from("jobs").update({completion_notes:notes}).eq("id",id); if(error){showToast(t.toasts.errSave,"error");return;} setJobs(prev=>prev.map(j=>j.id===id?{...j,completion_notes:notes}:j)); showToast(t.toasts.saved); };
  const openJob=(job)=>{ setSelectedId(job.id); setView("detail"); };

  const tabs=[
    {id:"list",icon:"📋",label:t.nav.jobs},
    {id:"calendar",icon:"📅",label:t.nav.calendar},
    ...(session?.role==="owner"||session?.role==="admin"||session?.role==="salesperson"?[{id:"quote",icon:"💰",label:t.nav.quote}]:[]),
    ...(session?.role==="owner"?[{id:"companies",icon:"🏢",label:t.nav.companies}]:[]),
    ...(isAdmin?[{id:"contacts",icon:"📇",label:t.nav.contacts},{id:"team",icon:"👥",label:t.nav.team},{id:"reports",icon:"📊",label:t.nav.reports}]:[]),
    ...(session?.role==="installer"||session?.role==="salesperson"?[{id:"reports",icon:"📊",label:t.nav.reports}]:[]),
  ];

  if(!session) return <Login onLogin={login} lang={lang} setLang={setLang}/>;
  const vTheme=getVertical(session.vertical);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#F9F7F4",minHeight:"100vh",paddingBottom:70}}>
      {/* HEADER */}
      <div style={{background:"#1A1A1A",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,borderBottom:`3px solid ${vTheme.accent}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20,fontWeight:900,color:vTheme.accent,letterSpacing:-1}}>{t.brand}</span>
          {session.role==="owner"
            ? <VerticalSwitcher vertical={session.vertical} onSwitch={switchVertical}/>
            : <span style={{fontSize:9,color:vTheme.accent,background:vTheme.accent+"22",borderRadius:10,padding:"1px 7px",fontWeight:700}}>{vTheme.icon} {vTheme.label}</span>
          }
          {session.company&&<span style={{fontSize:10,color:"#555",letterSpacing:1,textTransform:"uppercase"}}>{session.company}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <LangBtn lang={lang} setLang={l=>{setLang(l);localStorage.setItem("pf_lang",l);}}/>
          {session.role==="admin"&&<Btn onClick={()=>setShowPricingModal(true)} variant="ghost" style={{padding:"3px 9px",fontSize:11}}>💰</Btn>}
          <span style={{background:vTheme.accent+"22",color:vTheme.accent,border:`1px solid ${vTheme.accent}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{session.role==="owner"?"👑":session.role==="admin"?"⚙️":session.role==="installer"?"🔨":"💼"} {session.name}</span>
          {view==="detail"&&<Btn onClick={()=>setView("main")} variant="ghost" style={{padding:"3px 9px",fontSize:11}}>{t.back2}</Btn>}
          <button onClick={logout} style={{background:"none",border:"none",color:"#555",fontSize:18,cursor:"pointer"}}>↩</button>
        </div>
      </div>

      <Toast msg={toast?.msg} type={toast?.type}/>

      <div style={{maxWidth:880,margin:"0 auto",padding:"16px 14px"}}>
        {view==="detail"&&selectedJob&&(
          <JobDetail job={selectedJob} session={session} t={t} onUpdateStatus={updateStatus} onAddPhoto={addPhoto} onDeletePhoto={deletePhoto} onSaveNotes={saveNotes} onEdit={()=>setEditingJob(selectedJob)} onDelete={()=>deleteJob(selectedJob.id)} uploading={uploading}/>
        )}
        {view==="main"&&(
          <>
            {tab==="list"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#1A1A1A",display:"flex",alignItems:"center",gap:8}}>{session.role==="installer"||session.role==="salesperson"?`${t.nav.jobs} · ${session.name}`:session.role==="admin"?session.company:t.nav.jobs}{session.role==="owner"&&<span style={{fontSize:11,background:vTheme.accent+"18",color:vTheme.accent,border:`1px solid ${vTheme.accent}44`,borderRadius:20,padding:"2px 10px",fontWeight:700}}>{vTheme.icon} {vTheme.label}</span>}</div><div style={{fontSize:12,color:"#999"}}>{filteredJobs.length} {session.role==="admin"?"jobs":"jobs"}</div></div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    {["all",...Object.keys(t.jobStatus)].map(k=><button key={k} onClick={()=>setFilterStatus(k)} style={{background:filterStatus===k?"#1A1A1A":"#fff",color:filterStatus===k?"#B8924A":"#666",border:`1px solid ${filterStatus===k?"#1A1A1A":"#E5E7EB"}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{k==="all"?t.all:t.jobStatus[k]}</button>)}
                    <button onClick={loadJobs} style={{background:"#F3F4F6",color:"#555",border:"1px solid #E5E7EB",borderRadius:20,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>↻</button>
                    {isAdmin&&<Btn onClick={()=>setShowJobForm(true)}>{t.newJob}</Btn>}
                  </div>
                </div>
                {loading?<div style={{textAlign:"center",padding:"50px",color:"#aaa"}}><div style={{fontSize:30,marginBottom:8}}>⏳</div><div>{t.loading}</div></div>
                  :filteredJobs.length===0?<div style={{textAlign:"center",padding:"50px",color:"#bbb"}}><div style={{fontSize:40,marginBottom:8}}>📋</div><div style={{fontSize:15,fontWeight:600}}>{t.noJobs}</div></div>
                  :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {filteredJobs.map(job=>{
                      const color=SC[job.status]||SC.scheduled, cc=(job.photos||[]).filter(p=>p.type==="completion").length, ap=(job.photos||[]).find(p=>p.type==="admin");
                      return (
                        <Card key={job.id} onClick={()=>openJob(job)} style={{borderLeft:`4px solid ${color}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 6px rgba(0,0,0,0.04)"}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:800,color:"#B8924A"}}>{job.work_order}</span><Badge status={job.status} label={t.jobStatus[job.status]||job.status}/>{job.sf&&<span style={{fontSize:11,background:"#1A1A1A",color:"#B8924A",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{job.sf} SF</span>}</div>
                              <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
                              {job.builder&&<div style={{fontSize:12,color:"#B8924A",fontWeight:600,marginBottom:2}}>💰 {job.builder}</div>}
                              {job.builder_note&&job.builder_note!=="—"&&<div style={{fontSize:11,color:"#F59E0B",marginBottom:2}}>⚠️ {job.builder_note}</div>}
                              <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:13,color:"#2563EB",marginBottom:4,display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:"none"}}>📍 {job.address} ↗</a>
                              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#999"}}>📅 {fmt(job.date)} {job.time}</span><span style={{fontSize:12,color:"#999"}}>🔧 {job.service}</span>{job.installer&&<span style={{fontSize:12,color:"#999"}}>👷 {job.installer}</span>}</div>
                              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                                {job.client_phone&&<span style={{fontSize:11,color:"#2563EB",background:"#EFF6FF",borderRadius:10,padding:"2px 8px",fontWeight:600}}>📞</span>}
                                {cc>0&&<span style={{fontSize:11,color:"#16A34A",background:"#F0FDF4",borderRadius:10,padding:"2px 8px",fontWeight:600}}>✅ {cc}</span>}
                                {session.role==="owner"&&job.company&&<span style={{fontSize:11,color:"#555",background:"#F3F4F6",borderRadius:10,padding:"2px 8px",fontWeight:600}}>🏢 {job.company}</span>}
                              </div>
                            </div>
                            {ap&&<img src={ap.url} alt="" style={{width:74,height:60,objectFit:"cover",borderRadius:8,border:"2px solid #E5E7EB",flexShrink:0}}/>}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                }
              </>
            )}
            {tab==="calendar"&&<Calendar jobs={jobs} onSelectJob={openJob} t={t} lang={lang}/>}
            {tab==="quote"&&(session.role==="owner"||session.role==="admin"||session.role==="salesperson")&&<QuoteTab session={session} t={t} showToast={showToast}/>}
            {tab==="companies"&&session.role==="owner"&&<CompaniesTab t={t} showToast={showToast} allJobs={jobs} allInstallers={allInstallers} session={session}/>}
            {tab==="contacts"&&isAdmin&&<ContactsTab session={session} t={t} showToast={showToast}/>}
            {tab==="team"&&isAdmin&&<TeamManager session={session} t={t} showToast={showToast}/>}
            {tab==="reports"&&<Reports session={session} t={t} showToast={showToast}/>}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      {view==="main"&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#1A1A1A",borderTop:"2px solid #B8924A",display:"flex",zIndex:100}}>
          {tabs.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:"11px 6px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:19}}>{tb.icon}</span><span style={{fontSize:10,fontWeight:700,color:tab===tb.id?"#B8924A":"#555"}}>{tb.label}</span></button>)}
        </div>
      )}

      {showJobForm&&isAdmin&&<JobForm onSave={saveJob} onCancel={()=>setShowJobForm(false)} saving={saving} session={session} t={t} companyServices={companyServices} installerNames={installerNames} salespersonNames={salespersonNames}/>}
      {editingJob&&isAdmin&&<JobForm onSave={updateJob} onCancel={()=>setEditingJob(null)} saving={saving} initial={editingJob} session={session} t={t} companyServices={companyServices} installerNames={installerNames} salespersonNames={salespersonNames}/>}
      {showPricingModal&&session.role==="admin"&&<PricingModal company={session.company} t={t} showToast={showToast} onClose={()=>setShowPricingModal(false)}/>}
    </div>
  );
}
