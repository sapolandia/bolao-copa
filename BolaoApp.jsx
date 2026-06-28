import React, { useState, useEffect, useRef } from "react";
import {
  Trophy, Lock, Check, ChevronUp, ChevronDown,
  Mail, ShieldCheck, ListChecks, Eye, Star
} from "lucide-react";

/* ---------------------------------- styles --------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=Space+Mono:wght@400;700&display=swap');

.bl, .bl *, .bl *::before, .bl *::after { box-sizing: border-box; }
.bl {
  --ink:#0A130E; --surface:#0F1E16; --surface2:#15281D; --line:#21372B;
  --chalk:#EAF1E6; --muted:#7E988A; --score:#FFCB2E; --score-dim:#9c7a1c;
  --live:#FF5A4D; --mint:#4ED9A1;
  font-family:'Archivo',system-ui,sans-serif;
  color:var(--chalk);
  background:
    radial-gradient(120% 60% at 50% -8%, rgba(255,203,46,.07), transparent 60%),
    radial-gradient(90% 50% at 50% 110%, rgba(78,217,161,.05), transparent 60%),
    var(--ink);
  min-height:100%;
  -webkit-font-smoothing:antialiased;
}
.bl .device {
  max-width:440px; margin:0 auto; min-height:100vh;
  display:flex; flex-direction:column; position:relative;
  border-left:1px solid var(--line); border-right:1px solid var(--line);
}
.bl .scroll { flex:1; overflow-y:auto; padding:18px 16px 110px; }
.bl .mono { font-family:'Space Mono',ui-monospace,monospace; }

/* ---- generic ---- */
.bl h1,.bl h2,.bl h3 { margin:0; line-height:1; }
.bl .eyebrow { font-size:11px; letter-spacing:.18em; text-transform:uppercase;
  color:var(--muted); font-weight:600; }
.bl .card { background:var(--surface); border:1px solid var(--line);
  border-radius:16px; padding:16px; margin-bottom:12px; }

/* ---- header ---- */
.bl .head { padding:6px 2px 4px; margin-bottom:14px; }
.bl .head .date { font-size:24px; font-weight:900; letter-spacing:-.01em; text-transform:capitalize; }
.bl .head .sub { color:var(--muted); font-size:13px; margin-top:6px; max-width:30ch; }

/* ---- countdown ---- */
.bl .clock { display:flex; align-items:center; gap:12px;
  background:linear-gradient(180deg,var(--surface2),var(--surface));
  border:1px solid var(--line); border-radius:14px; padding:13px 15px; margin-bottom:16px;
  box-shadow:0 0 0 1px rgba(255,203,46,.04), 0 14px 30px -22px rgba(255,203,46,.5); }
.bl .clock .dot { width:9px; height:9px; border-radius:50%; background:var(--live);
  box-shadow:0 0 0 0 rgba(255,90,77,.6); animation:pulse 1.8s infinite; flex:none; }
@keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(255,90,77,.55)} 70%{box-shadow:0 0 0 8px rgba(255,90,77,0)} 100%{box-shadow:0 0 0 0 rgba(255,90,77,0)} }
.bl .clock .lbl { font-size:10px; letter-spacing:.16em; color:var(--muted); text-transform:uppercase; }
.bl .clock .time { font-size:24px; font-weight:700; color:var(--score); letter-spacing:.04em; line-height:1; margin-top:3px; }

/* ---- match card ---- */
.bl .stage { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.bl .stage .chip { font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--mint);
  border:1px solid rgba(78,217,161,.3); border-radius:999px; padding:3px 9px; font-weight:600; }
.bl .stage .ko { color:var(--score); border-color:rgba(255,203,46,.3); }
.bl .stage .ki { color:var(--muted); font-size:13px; }

.bl .board { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:6px; }
.bl .team { display:flex; flex-direction:column; align-items:center; gap:7px; min-width:0; }
.bl .team .flag { font-size:30px; line-height:1; }
.bl .team .abbr { font-size:13px; font-weight:800; letter-spacing:.04em; }
.bl .team .nm { font-size:10.5px; color:var(--muted); white-space:nowrap; }

.bl .sb { display:flex; align-items:center; gap:8px;
  background:#070D09; border:1px solid var(--line); border-radius:12px; padding:8px 10px;
  box-shadow:inset 0 2px 14px rgba(0,0,0,.6); }
.bl .col { display:flex; flex-direction:column; align-items:center; gap:2px; }
.bl .step { width:30px; height:24px; display:flex; align-items:center; justify-content:center;
  color:var(--muted); background:transparent; border:none; border-radius:7px; cursor:pointer; transition:.12s; }
.bl .step:hover { color:var(--score); background:rgba(255,203,46,.08); }
.bl .step:disabled { opacity:.25; cursor:default; }
.bl .digit { font-family:'Space Mono',monospace; font-size:38px; font-weight:700;
  color:var(--score); width:38px; text-align:center; line-height:1.1;
  text-shadow:0 0 16px rgba(255,203,46,.35); }
.bl .sep { font-family:'Space Mono',monospace; font-size:26px; color:var(--score-dim); padding:0 1px; }

/* ---- qualifier ---- */
.bl .qual { margin-top:16px; padding-top:14px; border-top:1px dashed var(--line); }
.bl .qual .q { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted);
  margin-bottom:9px; display:flex; align-items:center; gap:6px; }
.bl .qbtns { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.bl .qbtn { display:flex; align-items:center; justify-content:center; gap:7px;
  border:1px solid var(--line); background:var(--surface2); color:var(--chalk);
  border-radius:11px; padding:11px; font-size:13px; font-weight:700; cursor:pointer; transition:.14s; font-family:inherit; }
.bl .qbtn:hover { border-color:var(--muted); }
.bl .qbtn.on { background:rgba(255,203,46,.13); border-color:var(--score); color:var(--score); }

/* ---- artilheiro card ---- */
.bl .ace { background:linear-gradient(135deg,rgba(255,203,46,.1),var(--surface));
  border:1px solid rgba(255,203,46,.28); }
.bl .ace .top { display:flex; align-items:center; gap:9px; margin-bottom:11px; }
.bl .ace .top .t { font-size:14px; font-weight:800; }
.bl .ace .top .p { margin-left:auto; font-family:'Space Mono',monospace; color:var(--score);
  font-weight:700; font-size:13px; }
.bl .sel { width:100%; background:#070D09; color:var(--chalk); border:1px solid var(--line);
  border-radius:11px; padding:12px; font-size:14px; font-family:inherit; font-weight:600; }
.bl .ace .done { display:flex; align-items:center; gap:8px; font-size:13px; }
.bl .ace .done .who { font-weight:800; color:var(--score); }
.bl .ace .done .lk { margin-left:auto; color:var(--muted); font-size:11px; display:flex; gap:5px; align-items:center; }

/* ---- save bar ---- */
.bl .savebar { position:absolute; left:0; right:0; bottom:64px; padding:12px 16px;
  background:linear-gradient(180deg,transparent,var(--ink) 36%); }
.bl .save { width:100%; background:var(--score); color:#0A130E; border:none; border-radius:13px;
  padding:15px; font-family:inherit; font-size:15px; font-weight:900; letter-spacing:.02em;
  cursor:pointer; transition:.14s; box-shadow:0 14px 30px -12px rgba(255,203,46,.55); }
.bl .save:hover { filter:brightness(1.06); }
.bl .save.ok { background:var(--mint); }

/* ---- toast ---- */
.bl .toast { position:absolute; left:50%; transform:translateX(-50%); bottom:140px;
  background:var(--mint); color:#06241a; font-weight:800; font-size:13px;
  padding:11px 18px; border-radius:999px; display:flex; gap:8px; align-items:center;
  box-shadow:0 12px 26px -10px rgba(78,217,161,.6); animation:rise .3s ease; }
@keyframes rise { from{opacity:0; transform:translate(-50%,10px)} to{opacity:1; transform:translate(-50%,0)} }

/* ---- reveal ---- */
.bl .pills { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; margin-bottom:14px; }
.bl .pill { white-space:nowrap; border:1px solid var(--line); background:var(--surface);
  color:var(--muted); border-radius:999px; padding:8px 13px; font-size:12px; font-weight:700;
  cursor:pointer; transition:.14s; font-family:inherit; }
.bl .pill.on { background:var(--surface2); color:var(--chalk); border-color:var(--muted); }
.bl .final { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:8px;
  text-align:center; margin:4px 0 8px; }
.bl .final .fscore { font-family:'Space Mono',monospace; font-size:34px; font-weight:700; color:var(--chalk); }
.bl .final .ft { font-size:12px; color:var(--muted); margin-top:5px; }
.bl .finaltag { text-align:center; font-size:10px; letter-spacing:.18em; color:var(--live);
  text-transform:uppercase; font-weight:700; margin-bottom:12px; }
.bl .row { display:flex; align-items:center; gap:11px; padding:11px 4px; border-top:1px solid var(--line); }
.bl .row.me { background:rgba(255,203,46,.06); margin:0 -8px; padding:11px 12px; border-radius:10px; border-top:none; }
.bl .av { width:30px; height:30px; border-radius:50%; flex:none; display:flex; align-items:center;
  justify-content:center; font-size:12px; font-weight:800; background:var(--surface2); color:var(--muted); }
.bl .row .who { font-size:14px; font-weight:700; flex:1; }
.bl .row .gss { font-family:'Space Mono',monospace; font-size:13px; color:var(--muted); }
.bl .row .pts { font-family:'Space Mono',monospace; font-weight:700; font-size:15px; min-width:54px; text-align:right; }
.bl .pts.p0 { color:var(--muted); }
.bl .pts.pn { color:var(--mint); }
.bl .legend { font-size:11px; color:var(--muted); line-height:1.6; margin-top:14px; padding-top:12px; border-top:1px dashed var(--line); }

/* ---- ranking ---- */
.bl .podium { display:grid; grid-template-columns:1fr 1.2fr 1fr; gap:8px; align-items:end; margin:10px 0 18px; }
.bl .pod { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:14px 8px; text-align:center; }
.bl .pod.first { border-color:var(--score); background:linear-gradient(180deg,rgba(255,203,46,.12),var(--surface)); padding-top:18px; }
.bl .pod .medal { font-size:22px; }
.bl .pod .nm { font-size:13px; font-weight:800; margin-top:7px; }
.bl .pod .pp { font-family:'Space Mono',monospace; color:var(--score); font-weight:700; font-size:17px; margin-top:3px; }
.bl .rrow { display:flex; align-items:center; gap:11px; padding:13px 4px; border-top:1px solid var(--line); }
.bl .rrow.me { background:rgba(255,203,46,.07); margin:0 -8px; padding:13px 12px; border-radius:11px; border-top:none; }
.bl .pos { font-family:'Space Mono',monospace; font-size:14px; color:var(--muted); width:22px; }
.bl .rrow .who { flex:1; font-size:14.5px; font-weight:700; }
.bl .tie { font-family:'Space Mono',monospace; font-size:10.5px; color:var(--muted); text-align:right; line-height:1.5; }
.bl .rpts { font-family:'Space Mono',monospace; font-weight:700; font-size:18px; color:var(--score); min-width:42px; text-align:right; }

/* ---- tabbar ---- */
.bl .tabs { position:absolute; bottom:0; left:0; right:0; display:flex;
  background:rgba(10,19,14,.92); backdrop-filter:blur(10px); border-top:1px solid var(--line); }
.bl .tab { flex:1; background:none; border:none; color:var(--muted); cursor:pointer;
  padding:11px 0 13px; display:flex; flex-direction:column; align-items:center; gap:4px;
  font-family:inherit; font-size:10.5px; font-weight:700; transition:.14s; }
.bl .tab.on { color:var(--score); }

/* ---- login ---- */
.bl .login { flex:1; display:flex; flex-direction:column; justify-content:center; padding:32px 26px 80px; }
.bl .mark { font-size:13px; letter-spacing:.42em; color:var(--mint); font-weight:700; text-transform:uppercase; }
.bl .big { font-size:54px; font-weight:900; letter-spacing:-.02em; line-height:.92; margin:14px 0 6px; }
.bl .big .y { color:var(--score); }
.bl .loginsub { color:var(--muted); font-size:14px; line-height:1.5; margin-bottom:34px; max-width:30ch; }
.bl .field { display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--line);
  border-radius:13px; padding:14px 15px; margin-bottom:12px; }
.bl .field input { flex:1; background:none; border:none; outline:none; color:var(--chalk);
  font-family:inherit; font-size:15px; }
.bl .field input::placeholder { color:var(--muted); }
.bl .cta { width:100%; background:var(--score); color:#0A130E; border:none; border-radius:13px;
  padding:15px; font-family:inherit; font-size:15px; font-weight:900; cursor:pointer; transition:.14s; }
.bl .cta:hover { filter:brightness(1.06); }
.bl .sent { background:var(--surface); border:1px solid rgba(78,217,161,.3); border-radius:14px; padding:20px; }
.bl .sent .ic { width:42px; height:42px; border-radius:11px; background:rgba(78,217,161,.13);
  display:flex; align-items:center; justify-content:center; color:var(--mint); margin-bottom:13px; }
.bl .sent h3 { font-size:17px; font-weight:800; margin-bottom:7px; }
.bl .sent p { color:var(--muted); font-size:13.5px; line-height:1.5; }
.bl .sent p b { color:var(--chalk); }
.bl .demo { margin-top:18px; text-align:center; }
.bl .demo button { background:none; border:none; color:var(--score); font-family:inherit;
  font-size:13px; font-weight:700; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
.bl .invite { display:flex; align-items:center; gap:8px; margin-top:30px; color:var(--muted); font-size:12px; }

.bl .secnote { display:flex; gap:9px; align-items:flex-start; color:var(--muted); font-size:11.5px;
  line-height:1.5; background:var(--surface); border:1px solid var(--line); border-radius:12px;
  padding:12px 13px; margin-top:4px; }
.bl .secnote svg { flex:none; margin-top:1px; color:var(--mint); }

@media (prefers-reduced-motion: reduce) { .bl * { animation:none !important; } }
`;

/* ---------------------------------- data ----------------------------------- */
const T = {
  BRA:{f:"🇧🇷",a:"BRA",n:"Brasil"}, URU:{f:"🇺🇾",a:"URU",n:"Uruguai"},
  FRA:{f:"🇫🇷",a:"FRA",n:"França"}, MAR:{f:"🇲🇦",a:"MAR",n:"Marrocos"},
  ESP:{f:"🇪🇸",a:"ESP",n:"Espanha"}, JPN:{f:"🇯🇵",a:"JPN",n:"Japão"},
  SRB:{f:"🇷🇸",a:"SRB",n:"Sérvia"}, ARG:{f:"🇦🇷",a:"ARG",n:"Argentina"},
  NED:{f:"🇳🇱",a:"NED",n:"Holanda"},
};
const TODAY = [
  { id:"m1", stage:"Oitavas de final", time:"13:00", h:"BRA", a:"URU" },
  { id:"m2", stage:"Oitavas de final", time:"16:00", h:"FRA", a:"MAR" },
  { id:"m3", stage:"Oitavas de final", time:"19:00", h:"ESP", a:"JPN" },
];
const ACES = ["Mbappé","Vini Jr.","Haaland","Messi","Julián Álvarez","Lautaro","Bellingham"];

const REVEAL = [
  {
    id:"r1", label:"Brasil x Sérvia", stage:"Grupo A · placar 3/1/0",
    h:"BRA", a:"SRB", hs:2, as:1, knockout:false,
    rows:[
      { who:"Você", me:true, g:"2-1", pts:3 },
      { who:"Téo", g:"2-1", pts:3 },
      { who:"Caio", g:"2-1", pts:3 },
      { who:"Marina", g:"3-1", pts:1 },
      { who:"Rafa", g:"2-0", pts:1 },
      { who:"Bia", g:"1-0", pts:1 },
      { who:"Lucas", g:"0-1", pts:0 },
      { who:"Duda", g:"1-1", pts:0 },
    ],
  },
  {
    id:"r2", label:"Argentina x Holanda", stage:"Oitavas · cumulativo, máx 5",
    h:"ARG", a:"NED", hs:1, as:1, knockout:true, adv:"Argentina (pên.)",
    rows:[
      { who:"Você", me:true, g:"1-1 → ARG", pts:5 },
      { who:"Marina", g:"1-1 → ARG", pts:5 },
      { who:"Duda", g:"1-1 → ARG", pts:5 },
      { who:"Bia", g:"1-1 → NED", pts:3 },
      { who:"Téo", g:"0-0 → ARG", pts:3 },
      { who:"Lucas", g:"2-2 → ARG", pts:3 },
      { who:"Rafa", g:"2-1 → ARG", pts:2 },
      { who:"Caio", g:"3-1 → NED", pts:0 },
    ],
  },
];

const RANK = [
  { pos:1, who:"Marina", pts:47, ex:9, re:21 },
  { pos:2, who:"Você", me:true, pts:45, ex:8, re:22 },
  { pos:3, who:"Téo", pts:43, ex:8, re:20 },
  { pos:4, who:"Caio", pts:41, ex:7, re:19 },
  { pos:5, who:"Bia", pts:38, ex:6, re:18 },
  { pos:6, who:"Rafa", pts:35, ex:5, re:17 },
  { pos:7, who:"Lucas", pts:31, ex:4, re:16 },
  { pos:8, who:"Duda", pts:28, ex:3, re:14 },
];

const initials = (s) => s === "Você" ? "EU" : s.slice(0,2).toUpperCase();

/* -------------------------------- components -------------------------------- */
function Stepper({ val, set, max = 19 }) {
  return (
    <div className="col">
      <button className="step" onClick={() => set(Math.min(max, val + 1))} aria-label="aumentar"><ChevronUp size={18} /></button>
      <span className="digit">{val}</span>
      <button className="step" disabled={val <= 0} onClick={() => set(Math.max(0, val - 1))} aria-label="diminuir"><ChevronDown size={18} /></button>
    </div>
  );
}

function MatchCard({ m, pred, onScore, onQual }) {
  const h = T[m.h], a = T[m.a];
  return (
    <div className="card">
      <div className="stage">
        <span className="chip ko">{m.stage}</span>
        <span className="ki mono">{m.time}</span>
      </div>
      <div className="board">
        <div className="team">
          <span className="flag">{h.f}</span>
          <span className="abbr">{h.a}</span>
          <span className="nm">{h.n}</span>
        </div>
        <div className="sb">
          <Stepper val={pred.hs} set={(v) => onScore("hs", v)} />
          <span className="sep">:</span>
          <Stepper val={pred.as} set={(v) => onScore("as", v)} />
        </div>
        <div className="team">
          <span className="flag">{a.f}</span>
          <span className="abbr">{a.a}</span>
          <span className="nm">{a.n}</span>
        </div>
      </div>
      <div className="qual">
        <div className="q"><Trophy size={13} /> Quem avança?</div>
        <div className="qbtns">
          <button className={"qbtn" + (pred.adv === "h" ? " on" : "")} onClick={() => onQual("h")}>{h.f} {h.a}</button>
          <button className={"qbtn" + (pred.adv === "a" ? " on" : "")} onClick={() => onQual("a")}>{a.f} {a.a}</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- screens ----------------------------------- */
function Palpites({ preds, setPreds, ace, setAce }) {
  const [left, setLeft] = useState(2 * 3600 + 14 * 60 + 33);
  const [toast, setToast] = useState(false);
  const [saved, setSaved] = useState(false);
  const tRef = useRef(null);
  useEffect(() => {
    const i = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const fmt = (s) => [s / 3600, (s % 3600) / 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":");

  const upd = (id, key, val) => setPreds((p) => ({ ...p, [id]: { ...p[id], [key]: val } }));
  const save = () => {
    setSaved(true); setToast(true);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(false), 2200);
  };

  return (
    <>
      <div className="scroll">
        <div className="head">
          <div className="eyebrow">Seus palpites</div>
          <div className="date">Hoje, 14 de junho</div>
          <div className="sub">Envie antes do primeiro jogo do dia. Depois disso, trava pra todo mundo.</div>
        </div>

        <div className="clock">
          <span className="dot" />
          <div>
            <div className="lbl">Trava em</div>
            <div className="time mono">{fmt(left)}</div>
          </div>
        </div>

        {!ace ? (
          <div className="card ace">
            <div className="top"><Star size={17} color="#FFCB2E" /><span className="t">Palpite de artilheiro</span><span className="p">+10 pts</span></div>
            <select className="sel" defaultValue="" onChange={(e) => e.target.value && setAce(e.target.value)}>
              <option value="" disabled>Escolha o artilheiro da Copa…</option>
              {ACES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        ) : (
          <div className="card ace">
            <div className="top"><Star size={17} color="#FFCB2E" /><span className="t">Palpite de artilheiro</span><span className="p">+10 pts</span></div>
            <div className="done"><Check size={16} color="#4ED9A1" /> Seu palpite: <span className="who">{ace}</span>
              <span className="lk"><Lock size={11} /> trancado</span></div>
          </div>
        )}

        {TODAY.map((m) => (
          <MatchCard key={m.id} m={m} pred={preds[m.id]}
            onScore={(k, v) => upd(m.id, k, v)} onQual={(s) => upd(m.id, "adv", s)} />
        ))}

        <div className="secnote">
          <ShieldCheck size={15} />
          <span>Ninguém vê o palpite de ninguém até a trava. A regra mora no banco de dados, não só na tela — então não tem como espiar.</span>
        </div>
      </div>

      {toast && <div className="toast"><Check size={15} /> Palpites salvos</div>}
      <div className="savebar">
        <button className={"save" + (saved ? " ok" : "")} onClick={save}>
          {saved ? "Palpites salvos · editar até a trava" : "Salvar palpites"}
        </button>
      </div>
    </>
  );
}

function Reveal() {
  const [sel, setSel] = useState(REVEAL[0].id);
  const g = REVEAL.find((x) => x.id === sel);
  const h = T[g.h], a = T[g.a];
  return (
    <div className="scroll">
      <div className="head">
        <div className="eyebrow"><Eye size={11} style={{ display: "inline", marginRight: 5, verticalAlign: "-1px" }} />Palpites revelados</div>
        <div className="date">Jogos encerrados</div>
        <div className="sub">Com o jogo no fim, tudo abre e a pontuação é calculada na hora.</div>
      </div>

      <div className="pills">
        {REVEAL.map((r) => (
          <button key={r.id} className={"pill" + (r.id === sel ? " on" : "")} onClick={() => setSel(r.id)}>{r.label}</button>
        ))}
      </div>

      <div className="card">
        <div className="finaltag">Encerrado · {g.stage}</div>
        <div className="final">
          <div><span className="flag" style={{ fontSize: 30 }}>{h.f}</span><div className="ft">{h.n}</div></div>
          <div className="fscore">{g.hs}<span style={{ color: "#9c7a1c", margin: "0 6px" }}>:</span>{g.as}</div>
          <div><span className="flag" style={{ fontSize: 30 }}>{a.f}</span><div className="ft">{a.n}</div></div>
        </div>
        {g.knockout && <div style={{ textAlign: "center", fontSize: 12, color: "#FFCB2E", fontWeight: 700, marginBottom: 4 }}>Classificado: {g.adv}</div>}
      </div>

      <div className="card">
        {g.rows.map((r, i) => (
          <div key={i} className={"row" + (r.me ? " me" : "")}>
            <span className="av">{initials(r.who)}</span>
            <span className="who">{r.who}</span>
            <span className="gss mono">{r.g}</span>
            <span className={"pts mono " + (r.pts === 0 ? "p0" : "pn")}>{r.pts > 0 ? "+" : ""}{r.pts} pt{r.pts === 1 ? "" : "s"}</span>
          </div>
        ))}
        <div className="legend">
          {g.knockout
            ? "Mata-mata: placar exato +2, resultado certo +1, classificado certo +2. Máximo de 5 por jogo."
            : "Fase de grupos: placar exato vale 3, acertar só o vencedor ou empate vale 1."}
        </div>
      </div>
    </div>
  );
}

function Ranking() {
  const top3 = RANK.slice(0, 3);
  return (
    <div className="scroll">
      <div className="head">
        <div className="eyebrow"><Trophy size={11} style={{ display: "inline", marginRight: 5, verticalAlign: "-1px" }} />Classificação</div>
        <div className="date">Bolão dos amigos</div>
        <div className="sub">Campeão é quem somar mais pontos no fim da Copa.</div>
      </div>

      <div className="podium">
        {[top3[1], top3[0], top3[2]].map((p, i) => (
          <div key={p.who} className={"pod" + (i === 1 ? " first" : "")}>
            <div className="medal">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</div>
            <div className="nm">{p.who}</div>
            <div className="pp">{p.pts}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "4px 16px" }}>
        {RANK.map((r) => (
          <div key={r.pos} className={"rrow" + (r.me ? " me" : "")}>
            <span className="pos mono">{r.pos}º</span>
            <span className="av">{initials(r.who)}</span>
            <span className="who">{r.who}</span>
            <span className="tie mono">{r.ex} exatos<br />{r.re} result.</span>
            <span className="rpts mono">{r.pts}</span>
          </div>
        ))}
      </div>

      <div className="secnote" style={{ marginTop: 12 }}>
        <ListChecks size={15} />
        <span>Empate? Desempata por mais placares exatos, depois mais acertos de resultado. Persistindo, o prêmio é dividido.</span>
      </div>
    </div>
  );
}

/* --------------------------------- login ----------------------------------- */
function Login({ onEnter }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="login">
      <div className="mark">Copa 2026</div>
      <div className="big">Bo<span className="y">lão</span><br />dos amigos</div>
      <div className="loginsub">Um palpite por jogo, escondido até a trava. Sem planilha, sem print no grupo.</div>

      {!sent ? (
        <>
          <div className="field">
            <Mail size={17} color="#7E988A" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email" />
          </div>
          <button className="cta" onClick={() => email && setSent(true)}>Enviar link mágico</button>
        </>
      ) : (
        <div className="sent">
          <div className="ic"><Mail size={20} /></div>
          <h3>Confira seu e-mail</h3>
          <p>Mandamos um link de acesso para <b>{email || "seu@email.com"}</b>. Toque nele para entrar — sem senha.</p>
        </div>
      )}

      <div className="invite"><ShieldCheck size={14} color="#7E988A" /> Só entra quem foi convidado pelo organizador.</div>

      <div className="demo"><button onClick={onEnter}>Entrar no protótipo →</button></div>
    </div>
  );
}

/* ---------------------------------- app ------------------------------------ */
export default function BolaoApp() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("palpites");
  const [ace, setAce] = useState("");
  const [preds, setPreds] = useState(
    Object.fromEntries(TODAY.map((m) => [m.id, { hs: 0, as: 0, adv: null }]))
  );

  return (
    <div className="bl">
      <style>{CSS}</style>
      <div className="device">
        {screen === "login" ? (
          <Login onEnter={() => setScreen("app")} />
        ) : (
          <>
            {tab === "palpites" && <Palpites preds={preds} setPreds={setPreds} ace={ace} setAce={setAce} />}
            {tab === "revelados" && <Reveal />}
            {tab === "ranking" && <Ranking />}

            <div className="tabs">
              <button className={"tab" + (tab === "palpites" ? " on" : "")} onClick={() => setTab("palpites")}>
                <ListChecks size={20} /> Palpites
              </button>
              <button className={"tab" + (tab === "revelados" ? " on" : "")} onClick={() => setTab("revelados")}>
                <Eye size={20} /> Revelados
              </button>
              <button className={"tab" + (tab === "ranking" ? " on" : "")} onClick={() => setTab("ranking")}>
                <Trophy size={20} /> Ranking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
