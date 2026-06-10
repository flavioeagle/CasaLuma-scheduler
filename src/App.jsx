import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gvkkzdzfjiafpjkyscjn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a2t6ZHpmamlhZnBqa3lzY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODM0MTUsImV4cCI6MjA4NzM1OTQxNX0.DUSrbbqced4HgC0HOAaJ2ERPDHc7gYFiHHHBPDEB1Zg";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PASSWORD = "casaluma2026";

const STATUS_CONFIG = {
  scheduled:   { label: "Agendado",     color: "#B8924A", bg: "#FDF6EC" },
  in_progress: { label: "Em Andamento", color: "#2563EB", bg: "#EFF6FF" },
  completed:   { label: "Concluído",    color: "#16A34A", bg: "#F0FDF4" },
  cancelled:   { label: "Cancelado",    color: "#DC2626", bg: "#FEF2F2" },
};

const SERVICES = [
  "Countertop Installation","Cabinet Installation","Kitchen Remodeling",
  "Flooring","Tile Work","Bathroom Remodel","Other",
];

const EMPTY_FORM = {
  work_order:"", client:"", client_phone:"", address:"", access_notes:"",
  date:"", time:"08:00", service:SERVICES[0], status:"scheduled",
  assigned_to:"", installer_phone:"", estimated_hours:4, scope:"",
};

function formatDate(d) {
  if (!d) return "";
  const [y,m,day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <span style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.color}33`,
      borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
      {cfg.label}
    </span>
  );
}

function PhoneButton({ phone, label, color="#B8924A" }) {
  if (!phone) return null;
  return (
    <a href={`tel:${phone.replace(/\D/g,"")}`} style={{
      display:"inline-flex",alignItems:"center",gap:6,
      background:color+"18",color,border:`1px solid ${color}44`,
      borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:700,textDecoration:"none",
    }}>📞 {label}: {phone}</a>
  );
}

function SectionTitle({ children }) {
  return <div style={{fontSize:11,fontWeight:800,color:"#1A1A1A",marginBottom:12,textTransform:"uppercase",letterSpacing:0.8}}>{children}</div>;
}

function FormField({ label, value, onChange, type="text", multiline, placeholder }) {
  const base = {width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",
    fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",background:"#fff"};
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:5}}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} style={{...base,resize:"vertical"}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>
      }
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(null); // 'admin' | 'installer'
  const [password, setPassword] = useState("");
  const [installerName, setInstallerName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [installers, setInstallers] = useState([]);

  useEffect(() => {
    supabase.from("installers").select("name").order("name").then(({data}) => {
      if (data) setInstallers(data.map(i=>i.name));
    });
  }, []);

  const handleAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin({ role: "admin", name: "Admin" });
    } else {
      setError("Senha incorreta.");
    }
  };

  const handleInstaller = async () => {
    if (!installerName) { setError("Selecione seu nome."); return; }
    if (!password) { setError("Digite sua senha."); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("installers").select("*")
      .eq("name", installerName).eq("password", password).single();
    setLoading(false);
    if (err || !data) { setError("Nome ou senha incorretos."); return; }
    onLogin({ role: "installer", name: data.name, id: data.id });
  };

  if (!mode) return (
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{textAlign:"center",maxWidth:360,width:"100%"}}>
        <div style={{fontSize:38,fontWeight:900,color:"#B8924A",letterSpacing:-2,marginBottom:2}}>CasaLuma</div>
        <div style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase",marginBottom:44}}>Field Scheduler</div>
        <div style={{fontSize:15,color:"#aaa",marginBottom:22}}>Como você está acessando?</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <button onClick={()=>{setMode("admin");setError("");setPassword("");}} style={{
            background:"#B8924A",color:"#fff",border:"none",borderRadius:14,
            padding:"20px 24px",fontSize:16,fontWeight:800,cursor:"pointer",
            boxShadow:"0 8px 30px rgba(184,146,74,0.35)",
          }}>
            <div>⚙️ Admin</div>
            <div style={{fontSize:12,fontWeight:400,opacity:0.85,marginTop:4}}>Gerenciar todos os jobs</div>
          </button>
          <button onClick={()=>{setMode("installer");setError("");setPassword("");}} style={{
            background:"#2A2A2A",color:"#fff",border:"2px solid #3A3A3A",
            borderRadius:14,padding:"20px 24px",fontSize:16,fontWeight:800,cursor:"pointer",
          }}>
            <div>🔨 Instalador</div>
            <div style={{fontSize:12,fontWeight:400,opacity:0.6,marginTop:4}}>Ver meus jobs</div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#1A1A1A",display:"flex",
      alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{maxWidth:360,width:"100%"}}>
        <div style={{fontSize:38,fontWeight:900,color:"#B8924A",letterSpacing:-2,marginBottom:2,textAlign:"center"}}>CasaLuma</div>
        <div style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase",marginBottom:32,textAlign:"center"}}>
          {mode==="admin"?"Login Admin":"Login Instalador"}
        </div>

        <div style={{background:"#2A2A2A",borderRadius:16,padding:24}}>
          {mode==="installer" && (
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:8}}>Seu nome</label>
              <select value={installerName} onChange={e=>{setInstallerName(e.target.value);setError("");}}
                style={{width:"100%",border:"1px solid #444",borderRadius:8,padding:"10px 12px",
                  fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box"}}>
                <option value="">Selecione...</option>
                {installers.map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:"#aaa",fontWeight:700,display:"block",marginBottom:8}}>Senha</label>
            <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}}
              placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&(mode==="admin"?handleAdmin():handleInstaller())}
              style={{width:"100%",border:"1px solid #444",borderRadius:8,padding:"10px 12px",
                fontSize:14,background:"#1A1A1A",color:"#fff",boxSizing:"border-box",outline:"none"}}/>
          </div>

          {error && <div style={{color:"#DC2626",fontSize:13,marginBottom:12,fontWeight:600}}>{error}</div>}

          <button onClick={mode==="admin"?handleAdmin:handleInstaller} disabled={loading} style={{
            width:"100%",background:"#B8924A",color:"#fff",border:"none",
            borderRadius:10,padding:13,fontWeight:800,fontSize:15,cursor:"pointer",
            opacity:loading?0.7:1,marginBottom:12,
          }}>{loading?"Verificando...":"Entrar"}</button>

          <button onClick={()=>{setMode(null);setError("");setPassword("");}} style={{
            width:"100%",background:"none",color:"#666",border:"1px solid #444",
            borderRadius:10,padding:10,cursor:"pointer",fontSize:13,
          }}>← Voltar</button>
        </div>
      </div>
    </div>
  );
}

// ─── PHOTO UPLOAD ────────────────────────────────────────────────────
function PhotoGrid({ photos, onDelete, canDelete }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
      {photos.map((p,i) => (
        <div key={i} style={{position:"relative"}}>
          <img src={p.url||p} alt="" onClick={()=>window.open(p.url||p,"_blank")}
            style={{width:90,height:70,objectFit:"cover",borderRadius:8,
              border:"2px solid #e5e7eb",cursor:"pointer"}}/>
          {canDelete && (
            <button onClick={()=>onDelete(p)} style={{
              position:"absolute",top:-6,right:-6,background:"#DC2626",color:"#fff",
              border:"none",borderRadius:"50%",width:20,height:20,fontSize:12,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,lineHeight:1,
            }}>×</button>
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoUpload({ onAdd, uploading }) {
  const ref = useRef();
  return (
    <div style={{marginTop:8}}>
      <button onClick={()=>ref.current.click()} disabled={uploading} style={{
        width:90,height:70,border:"2px dashed #B8924A",borderRadius:8,
        background:"#FFFBF5",color:"#B8924A",fontSize:uploading?14:22,
        cursor:uploading?"not-allowed":"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>{uploading?"...":"+"}</button>
      <input ref={ref} type="file" accept="image/*" multiple style={{display:"none"}}
        onChange={e=>Array.from(e.target.files).forEach(f=>onAdd(f))}/>
    </div>
  );
}

// ─── JOB FORM ────────────────────────────────────────────────────────
function JobForm({ onSave, onCancel, saving, installerNames }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = k => v => setForm(f=>({...f,[k]:v}));
  const save = () => {
    if (!form.work_order||!form.client||!form.address||!form.date) {
      alert("Preencha: Nº do Trabalho, Cliente, Endereço e Data."); return;
    }
    onSave(form);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
      <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",
        maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:17,fontWeight:800,marginBottom:20}}>➕ Novo Job</div>
        <FormField label="Nº do Trabalho *" value={form.work_order} onChange={set("work_order")} placeholder="WO-2026-001"/>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}><FormField label="Cliente *" value={form.client} onChange={set("client")} placeholder="John Smith"/></div>
          <div style={{flex:1}}><FormField label="Tel. Cliente" value={form.client_phone} onChange={set("client_phone")} placeholder="(770) 555-0000" type="tel"/></div>
        </div>
        <FormField label="Endereço *" value={form.address} onChange={set("address")} placeholder="123 Main St, Marietta, GA"/>
        <FormField label="Instruções de Acesso" value={form.access_notes} onChange={set("access_notes")} multiline placeholder="Código do portão, onde estacionar..."/>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}><FormField label="Data *" value={form.date} onChange={set("date")} type="date"/></div>
          <div style={{flex:1}}><FormField label="Horário" value={form.time} onChange={set("time")} type="time"/></div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:5}}>Serviço</label>
          <select value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))}
            style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}>
            {SERVICES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1,marginBottom:14}}>
            <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:5}}>Instalador</label>
            <select value={form.assigned_to} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))}
              style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}>
              <option value="">Selecione...</option>
              {installerNames.map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{flex:1}}><FormField label="Tel. Instalador" value={form.installer_phone} onChange={set("installer_phone")} placeholder="(470) 555-0000" type="tel"/></div>
        </div>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}><FormField label="Horas est." value={form.estimated_hours} onChange={set("estimated_hours")} type="number"/></div>
          <div style={{flex:1,marginBottom:14}}>
            <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:5}}>Status</label>
            <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
              style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 12px",fontSize:14,background:"#fff"}}>
              {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <FormField label="Escopo" value={form.scope} onChange={set("scope")} multiline placeholder="Descreva o trabalho..."/>
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button onClick={save} disabled={saving} style={{flex:1,background:"#B8924A",color:"#fff",border:"none",
            borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:saving?"not-allowed":"pointer",opacity:saving?0.7:1}}>
            {saving?"Salvando...":"Salvar Job"}
          </button>
          <button onClick={onCancel} style={{background:"#F3F4F6",color:"#374151",border:"none",
            borderRadius:10,padding:"13px 20px",cursor:"pointer",fontSize:14}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── INSTALLER MANAGER ───────────────────────────────────────────────
function InstallerManager({ onClose }) {
  const [installers, setInstallers] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    const {data} = await supabase.from("installers").select("*").order("name");
    if (data) setInstallers(data);
  };

  useEffect(()=>{ load(); },[]);

  const add = async () => {
    if (!name||!password) { setToast("Preencha nome e senha."); return; }
    setSaving(true);
    const {error} = await supabase.from("installers").insert([{name,password}]);
    setSaving(false);
    if (error) { setToast("Erro: nome já existe."); return; }
    setName(""); setPassword("");
    setToast("Instalador cadastrado!");
    load();
    setTimeout(()=>setToast(""),3000);
  };

  const remove = async (id) => {
    if (!confirm("Remover instalador?")) return;
    await supabase.from("installers").delete().eq("id",id);
    load();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:990,padding:16}}>
      <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",
        maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800}}>👷 Gerenciar Instaladores</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#666"}}>×</button>
        </div>

        {toast && <div style={{background:"#16A34A",color:"#fff",borderRadius:8,padding:"8px 14px",
          fontSize:13,fontWeight:700,marginBottom:14}}>{toast}</div>}

        <div style={{background:"#F9F7F4",borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:"#1A1A1A"}}>Novo instalador</div>
          <FormField label="Nome" value={name} onChange={setName} placeholder="Ex: Alberth"/>
          <FormField label="Senha" value={password} onChange={setPassword} placeholder="Senha de acesso" type="password"/>
          <button onClick={add} disabled={saving} style={{width:"100%",background:"#B8924A",color:"#fff",
            border:"none",borderRadius:8,padding:11,fontWeight:700,cursor:"pointer",fontSize:13}}>
            {saving?"Salvando...":"+ Adicionar"}
          </button>
        </div>

        <div style={{fontSize:12,fontWeight:800,color:"#666",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>
          Instaladores cadastrados ({installers.length})
        </div>
        {installers.length===0
          ? <div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"20px 0"}}>Nenhum instalador cadastrado</div>
          : installers.map(inst=>(
            <div key={inst.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 14px",background:"#F9F7F4",borderRadius:10,marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>{inst.name}</div>
                <div style={{fontSize:12,color:"#888"}}>Link: casa-luma-scheduler.vercel.app</div>
              </div>
              <button onClick={()=>remove(inst.id)} style={{background:"#FEF2F2",color:"#DC2626",
                border:"1px solid #DC262633",borderRadius:8,padding:"4px 10px",
                fontSize:12,cursor:"pointer",fontWeight:700}}>Remover</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────
function DetailView({ job, session, onUpdateStatus, onAddPhoto, onDeletePhoto, onSaveNotes, onShare, uploading }) {
  const [notes, setNotes] = useState(job.completion_notes||"");
  const [savingNotes, setSavingNotes] = useState(false);
  const isAdmin = session.role === "admin";
  const cfg = STATUS_CONFIG[job.status]||STATUS_CONFIG.scheduled;
  const adminPhotos = (job.photos||[]).filter(p=>p.type==="admin");
  const completionPhotos = (job.photos||[]).filter(p=>p.type==="completion");

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onSaveNotes(job.id, notes);
    setSavingNotes(false);
  };

  return (
    <div>
      <div style={{background:"#1A1A1A",borderRadius:14,padding:22,
        borderBottom:`4px solid ${cfg.color}`,marginBottom:14,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:11,color:"#B8924A",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{job.work_order}</div>
            <StatusBadge status={job.status}/>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8}}>{job.service}</div>
            <div style={{fontSize:14,color:"#aaa",marginTop:2}}>{job.client}</div>
          </div>
          {isAdmin && (
            <button onClick={()=>onShare(job)} style={{background:"#B8924A",color:"#fff",border:"none",
              borderRadius:10,padding:"9px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>
              🔗 Compartilhar
            </button>
          )}
        </div>
        <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>
          {[["📅",`${formatDate(job.date)} às ${job.time}`],["👷",job.assigned_to||"—"],["⏱",`~${job.estimated_hours}h`]]
            .map(([icon,val])=><span key={val} style={{fontSize:13,color:"#bbb"}}>{icon} {val}</span>)}
        </div>
      </div>

      {(job.client_phone||job.installer_phone) && (
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:18,marginBottom:14}}>
          <SectionTitle>📞 Contatos</SectionTitle>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <PhoneButton phone={job.client_phone} label="Cliente" color="#2563EB"/>
            <PhoneButton phone={job.installer_phone} label="Instalador" color="#B8924A"/>
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:18,marginBottom:14}}>
        <SectionTitle>📍 Endereço & Acesso</SectionTitle>
        <div style={{fontSize:15,fontWeight:700,color:"#1A1A1A",marginBottom:10}}>{job.address}</div>
        {job.access_notes && (
          <div style={{background:"#FFFBF5",border:"1px solid #B8924A44",borderRadius:8,padding:12,fontSize:14,color:"#555",lineHeight:1.7}}>
            <span style={{fontSize:11,fontWeight:800,color:"#B8924A",display:"block",marginBottom:4}}>ACESSO</span>
            {job.access_notes}
          </div>
        )}
      </div>

      {job.scope && (
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:18,marginBottom:14}}>
          <SectionTitle>📋 Escopo</SectionTitle>
          <div style={{fontSize:14,color:"#444",lineHeight:1.7}}>{job.scope}</div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:18,marginBottom:14}}>
        <SectionTitle>📸 Fotos do Local</SectionTitle>
        <PhotoGrid photos={adminPhotos} onDelete={p=>onDeletePhoto(p)} canDelete={isAdmin}/>
        {isAdmin && <PhotoUpload onAdd={f=>onAddPhoto(job.id,"admin",f)} uploading={uploading}/>}
        {adminPhotos.length===0 && <div style={{fontSize:13,color:"#aaa",marginTop:8}}>Nenhuma foto.</div>}
      </div>

      {isAdmin && (
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",padding:18,marginBottom:14}}>
          <SectionTitle>⚙️ Status</SectionTitle>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(STATUS_CONFIG).map(([key,cfg])=>(
              <button key={key} onClick={()=>onUpdateStatus(job.id,key)} style={{
                background:job.status===key?cfg.color:cfg.bg,
                color:job.status===key?"#fff":cfg.color,
                border:`1px solid ${cfg.color}`,borderRadius:20,
                padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
              }}>{cfg.label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,border:"2px solid #16A34A33",padding:18,marginBottom:14}}>
        <SectionTitle>✅ Conclusão</SectionTitle>
        <PhotoGrid
          photos={completionPhotos}
          onDelete={p=>onDeletePhoto(p)}
          canDelete={true}
        />
        <PhotoUpload onAdd={f=>onAddPhoto(job.id,"completion",f)} uploading={uploading}/>
        <div style={{marginTop:14}}>
          <label style={{fontSize:12,color:"#666",fontWeight:700,display:"block",marginBottom:6}}>Observações</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
            placeholder="Descreva como foi o trabalho..."
            style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 12px",
              fontSize:14,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <button onClick={handleSaveNotes} disabled={savingNotes} style={{
            marginTop:10,background:"#16A34A",color:"#fff",border:"none",
            borderRadius:8,padding:"9px 20px",fontWeight:700,cursor:"pointer",fontSize:13,
            opacity:savingNotes?0.7:1,
          }}>{savingNotes?"Salvando...":"💾 Salvar"}</button>
        </div>
      </div>

      {session.role==="installer" && job.status!=="completed" && (
        <button onClick={()=>onUpdateStatus(job.id,"completed")} style={{
          width:"100%",background:"#16A34A",color:"#fff",border:"none",
          borderRadius:12,padding:16,fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:14,
        }}>✅ Marcar como Concluído</button>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("list");
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInstallers, setShowInstallers] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [installerNames, setInstallerNames] = useState([]);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  };

  const loadJobs = async () => {
    setLoading(true);
    let query = supabase.from("jobs").select("*").order("date",{ascending:true});
    if (session?.role==="installer") query = query.eq("assigned_to", session.name);
    const {data:jobsData,error} = await query;
    if (error) { showToast("Erro ao carregar","error"); setLoading(false); return; }
    const {data:photosData} = await supabase.from("job_photos").select("*");
    const photos = photosData||[];
    setJobs((jobsData||[]).map(j=>({...j,photos:photos.filter(p=>p.job_id===j.id)})));
    setLoading(false);
  };

  const loadInstallerNames = async () => {
    const {data} = await supabase.from("installers").select("name").order("name");
    if (data) setInstallerNames(data.map(i=>i.name));
  };

  useEffect(()=>{ if(session) { loadJobs(); if(session.role==="admin") loadInstallerNames(); } },[session]);

  const selectedJob = jobs.find(j=>j.id===selectedId);
  const filteredJobs = jobs.filter(j=>filterStatus==="all"||j.status===filterStatus);

  const saveJob = async (form) => {
    setSaving(true);
    const {data,error} = await supabase.from("jobs").insert([form]).select().single();
    if (error) { showToast("Erro ao salvar","error"); setSaving(false); return; }
    setJobs(prev=>[...prev,{...data,photos:[]}]);
    setShowForm(false); setSaving(false);
    showToast("Job criado!");
  };

  const updateStatus = async (id,status) => {
    const {error} = await supabase.from("jobs").update({status}).eq("id",id);
    if (error) { showToast("Erro","error"); return; }
    setJobs(prev=>prev.map(j=>j.id===id?{...j,status}:j));
    showToast("Status atualizado!");
  };

  const addPhoto = async (jobId,type,file) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${jobId}/${type}-${Date.now()}.${ext}`;
    const {error:upErr} = await supabase.storage.from("job-photos").upload(path,file);
    if (upErr) { showToast("Erro ao enviar foto","error"); setUploading(false); return; }
    const {data:{publicUrl}} = supabase.storage.from("job-photos").getPublicUrl(path);
    const {data:photo,error:dbErr} = await supabase.from("job_photos")
      .insert([{job_id:jobId,type,url:publicUrl}]).select().single();
    if (dbErr) { showToast("Erro","error"); setUploading(false); return; }
    setJobs(prev=>prev.map(j=>j.id===jobId?{...j,photos:[...(j.photos||[]),photo]}:j));
    setUploading(false); showToast("Foto enviada!");
  };

  const deletePhoto = async (photo) => {
    if (!confirm("Remover esta foto?")) return;
    const path = photo.url.split("/job-photos/")[1];
    await supabase.storage.from("job-photos").remove([path]);
    await supabase.from("job_photos").delete().eq("id",photo.id);
    setJobs(prev=>prev.map(j=>({...j,photos:(j.photos||[]).filter(p=>p.id!==photo.id)})));
    showToast("Foto removida!");
  };

  const saveNotes = async (id,notes) => {
    const {error} = await supabase.from("jobs").update({completion_notes:notes}).eq("id",id);
    if (error) { showToast("Erro","error"); return; }
    setJobs(prev=>prev.map(j=>j.id===id?{...j,completion_notes:notes}:j));
    showToast("Salvo!");
  };

  const generateShare = (job) => {
    const link = `${window.location.origin}`;
    setShareLink(`${link}\n\nJob: ${job.work_order}\nCliente: ${job.client}\nEndereço: ${job.address}\n\nInstalador acessa em:\n${link}`);
    showToast("Link gerado!");
  };

  if (!session) return <LoginScreen onLogin={setSession}/>;

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#F9F7F4",minHeight:"100vh"}}>
      <div style={{background:"#1A1A1A",padding:"0 18px",display:"flex",alignItems:"center",
        justifyContent:"space-between",height:58,borderBottom:"3px solid #B8924A",
        position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20,fontWeight:900,color:"#B8924A",letterSpacing:-1}}>CasaLuma</span>
          <span style={{fontSize:10,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Field Scheduler</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {session.role==="admin" && (
            <button onClick={()=>setShowInstallers(true)} style={{background:"#2A2A2A",color:"#B8924A",
              border:"1px solid #B8924A44",borderRadius:20,padding:"3px 12px",fontSize:11,cursor:"pointer",fontWeight:700}}>
              👷 Instaladores
            </button>
          )}
          <span style={{background:"#B8924A22",color:"#B8924A",border:"1px solid #B8924A44",
            borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
            {session.role==="admin"?"⚙ Admin":`🔨 ${session.name}`}
          </span>
          {view==="detail" && (
            <button onClick={()=>setView("list")} style={{background:"none",border:"1px solid #444",
              color:"#ccc",borderRadius:20,padding:"3px 12px",fontSize:11,cursor:"pointer"}}>← Voltar</button>
          )}
          <button onClick={()=>setSession(null)} style={{background:"none",border:"none",color:"#555",fontSize:18,cursor:"pointer"}}>↩</button>
        </div>
      </div>

      {toast && (
        <div style={{position:"fixed",top:68,right:16,zIndex:999,
          background:toast.type==="error"?"#DC2626":"#16A34A",
          color:"#fff",borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,
          boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
          {toast.msg}
        </div>
      )}

      {shareLink && (
        <div style={{position:"fixed",inset:0,background:"#00000066",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:998}}
          onClick={()=>setShareLink(null)}>
          <div style={{background:"#fff",borderRadius:16,padding:26,maxWidth:420,width:"90%",
            boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:800,marginBottom:10}}>🔗 Informações do Job</div>
            <div style={{background:"#F3F4F6",borderRadius:8,padding:"12px 14px",
              fontSize:13,color:"#374151",whiteSpace:"pre-line",border:"1px solid #E5E7EB",marginBottom:14}}>
              {shareLink}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{navigator.clipboard?.writeText(shareLink);showToast("Copiado!");setShareLink(null);}}
                style={{flex:1,background:"#B8924A",color:"#fff",border:"none",
                  borderRadius:8,padding:11,fontWeight:700,cursor:"pointer",fontSize:13}}>📋 Copiar</button>
              <button onClick={()=>setShareLink(null)} style={{background:"#F3F4F6",color:"#374151",
                border:"none",borderRadius:8,padding:"11px 16px",cursor:"pointer",fontSize:13}}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:880,margin:"0 auto",padding:"18px 14px"}}>
        {view==="list" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A"}}>
                  {session.role==="installer"?`Jobs de ${session.name}`:"Jobs"}
                </div>
                <div style={{fontSize:12,color:"#999"}}>{filteredJobs.length} trabalho(s)</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                {["all","scheduled","in_progress","completed","cancelled"].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)} style={{
                    background:filterStatus===s?"#1A1A1A":"#fff",
                    color:filterStatus===s?"#B8924A":"#666",
                    border:`1px solid ${filterStatus===s?"#1A1A1A":"#E5E7EB"}`,
                    borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",
                  }}>{s==="all"?"Todos":STATUS_CONFIG[s]?.label}</button>
                ))}
                <button onClick={loadJobs} style={{background:"#F3F4F6",color:"#555",
                  border:"1px solid #E5E7EB",borderRadius:20,padding:"4px 12px",fontSize:11,cursor:"pointer"}}>↻</button>
                {session.role==="admin" && (
                  <button onClick={()=>setShowForm(true)} style={{background:"#B8924A",color:"#fff",
                    border:"none",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                    + Novo Job
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{textAlign:"center",padding:"60px 20px",color:"#aaa"}}>
                <div style={{fontSize:32,marginBottom:10}}>⏳</div>
                <div style={{fontSize:14}}>Carregando...</div>
              </div>
            ) : filteredJobs.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 20px",color:"#bbb"}}>
                <div style={{fontSize:44,marginBottom:10}}>📋</div>
                <div style={{fontSize:15,fontWeight:600}}>Nenhum job encontrado</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {filteredJobs.map(job=>{
                  const cfg=STATUS_CONFIG[job.status]||STATUS_CONFIG.scheduled;
                  const completionCount=(job.photos||[]).filter(p=>p.type==="completion").length;
                  const adminPhoto=(job.photos||[]).find(p=>p.type==="admin");
                  return (
                    <div key={job.id} onClick={()=>{setSelectedId(job.id);setView("detail");}} style={{
                      background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",
                      borderLeft:`4px solid ${cfg.color}`,padding:18,cursor:"pointer",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s",
                    }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"}
                    >
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:800,color:"#B8924A",letterSpacing:1}}>{job.work_order}</span>
                            <StatusBadge status={job.status}/>
                          </div>
                          <div style={{fontSize:15,fontWeight:800,color:"#1A1A1A",marginBottom:2}}>{job.client}</div>
                          <div style={{fontSize:13,color:"#666",marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                            📍 {job.address}
                          </div>
                          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                            <span style={{fontSize:12,color:"#999"}}>📅 {formatDate(job.date)} {job.time}</span>
                            <span style={{fontSize:12,color:"#999"}}>🔧 {job.service}</span>
                            {job.assigned_to&&<span style={{fontSize:12,color:"#999"}}>👷 {job.assigned_to}</span>}
                          </div>
                          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                            {job.client_phone&&<span style={{fontSize:11,color:"#2563EB",background:"#EFF6FF",borderRadius:10,padding:"2px 8px",fontWeight:600}}>📞 Cliente</span>}
                            {completionCount>0&&<span style={{fontSize:11,color:"#16A34A",background:"#F0FDF4",borderRadius:10,padding:"2px 8px",fontWeight:600}}>✅ {completionCount} foto(s)</span>}
                          </div>
                        </div>
                        {adminPhoto && (
                          <img src={adminPhoto.url} alt="" style={{width:76,height:62,objectFit:"cover",
                            borderRadius:8,border:"2px solid #E5E7EB",flexShrink:0}}/>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view==="detail" && selectedJob && (
          <DetailView
            job={selectedJob} session={session}
            onUpdateStatus={updateStatus}
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
            onSaveNotes={saveNotes}
            onShare={generateShare}
            uploading={uploading}
          />
        )}
      </div>

      {showForm && session.role==="admin" && (
        <JobForm onSave={saveJob} onCancel={()=>setShowForm(false)} saving={saving} installerNames={installerNames}/>
      )}

      {showInstallers && <InstallerManager onClose={()=>{setShowInstallers(false);loadInstallerNames();}}/>}
    </div>
  );
}
