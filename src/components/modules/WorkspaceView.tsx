import React, { useState, useEffect } from "react";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { useApp } from "../../context/AppContext";
import { Calendar, FileText, Mail, HardDrive, CheckCircle, RefreshCcw, Send } from "lucide-react";

export default function WorkspaceView() {
  const { showToast } = useApp();
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  useEffect(() => {
    getAccessToken().then(setToken);
  }, []);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load Calendar Events
      const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=" + new Date().toISOString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const calData = await calRes.json();
      if (calData.items) setEvents(calData.items);

      // Load Drive Files
      const driveRes = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=5&orderBy=modifiedByMeTime desc", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const driveData = await driveRes.json();
      if (driveData.files) setFiles(driveData.files);
      
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar dados do Workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleSendEmail = async () => {
    if (!token || !emailTo || !emailSubject || !emailBody) return;
    
    const confirm = window.confirm(`Você tem certeza que deseja enviar o email para ${emailTo}?`);
    if (!confirm) return;

    try {
      const emailContent = [
        `To: ${emailTo}`,
        `Subject: ${emailSubject}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        emailBody,
      ].join("\n");
      
      const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const res = await fetch("https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
      });
      
      if (res.ok) {
        showToast("Email enviado com sucesso!", "success");
        setEmailTo("");
        setEmailSubject("");
        setEmailBody("");
      } else {
        throw new Error("Erro no envio");
      }
    } catch (err) {
      console.error(err);
      showToast("Falha ao enviar email.", "error");
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-zinc-200 mt-8">
        <HardDrive className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 font-sans">Workspace Desconectado</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-md text-center">Para utilizar as integrações avançadas de Agenda, Arquivos e Email, faça login com sua conta do Google.</p>
        <button onClick={async () => {
          try {
            const res = await googleSignIn();
            if (res) setToken(res.accessToken);
          } catch (err) {
            console.error(err);
          }
        }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-sans rounded-lg transition-colors cursor-pointer">
          Conectar Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-bold font-sans text-zinc-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" /> Google Workspace Ativo
          </h2>
          <p className="text-sm text-zinc-500">Seus dados da empresa centralizados no ERP</p>
        </div>
        <button onClick={loadData} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg cursor-pointer transition-colors" title="Atualizar dados">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drive Widget */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[300px]">
          <h3 className="font-bold text-sm text-zinc-800 mb-4 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-500" /> Arquivos Recentes no Drive
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {files.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhum arquivo encontrado.</p>
            ) : (
              files.map(file => (
                <div key={file.id} className="p-2 border border-zinc-100 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-700 truncate w-4/5 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-zinc-400" /> {file.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[300px]">
          <h3 className="font-bold text-sm text-zinc-800 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" /> Próximas Reuniões
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {events.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhum evento futuro na sua agenda.</p>
            ) : (
              events.map(ev => {
                const start = ev.start.dateTime || ev.start.date;
                const dat = new Date(start);
                return (
                  <div key={ev.id} className="p-2 border-l-2 border-blue-500 bg-blue-50/30 rounded-r-lg flex flex-col">
                    <span className="text-xs font-bold text-zinc-800 truncate">{ev.summary || "Evento sem título"}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{dat.toLocaleString("pt-BR")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Gmail Send Module */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm mt-6">
        <h3 className="font-bold text-sm text-zinc-800 mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-rose-500" /> Envio Rápido de E-mail (Gmail)
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-1 block">Para</label>
            <input 
              type="email" 
              value={emailTo}
              onChange={e => setEmailTo(e.target.value)}
              placeholder="cliente@exemplo.com"
              className="w-full text-sm p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-1 block">Assunto</label>
            <input 
              type="text" 
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder="Atualização da obra..."
              className="w-full text-sm p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-1 block">Mensagem</label>
            <textarea 
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              placeholder="Olá, gostaria de atualizar o status da sua obra..."
              className="w-full text-sm p-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[100px]"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSendEmail}
              disabled={!emailTo || !emailSubject || !emailBody}
              className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-bold font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Enviar com Gmail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
