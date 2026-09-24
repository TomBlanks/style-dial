/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function b(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function M(e,t,n){return Math.min(n,Math.max(t,e))}var W=/^#[0-9a-f]{6}$/i,ye=/^#[0-9a-f]{3}$/i;function j(e){return typeof e=="string"&&W.test(e)}function O(e){let t=e.trim();return W.test(t)?t.toLowerCase():ye.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var E=["Typography","Spacing","Layout","Colour"],X=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],B=["px","rem","ch"],_=["html","react-vite","nextjs"];var we=/^--[A-Za-z0-9_-]+$/,N=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),V=e=>typeof e=="number"&&Number.isFinite(e),k=e=>typeof e=="string"&&e.length>0;function Z(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(g){return{ok:!1,error:`Config is not valid JSON: ${g.message}`}}if(!N(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=g=>n.push(g),r="default";k(t.id)?r=t.id:o('Config has no "id"; using "default" as the storage key.');let s="html";_.includes(t.framework)?s=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let i=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let l="";k(t.tokensFile)?l=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let d=[],p=new Set;t.tokens.forEach((g,h)=>{let c=ke(g,h,o);if(c){if(c.var==="--font-heading"||c.var==="--font-body"){o(`Token ${c.var} skipped: fonts are not adjustable in v1.`);return}if(p.has(c.var)){o(`Token ${c.var} skipped: duplicate variable.`);return}p.add(c.var),d.push(c)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let u=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let g=new Map(d.map(h=>[h.var,h]));t.suggestions.forEach((h,c)=>{let R=Te(h,c,g,o);R&&u.push(R)})}return{ok:!0,config:{version:1,id:r,framework:s,tailwind:i,tokensFile:l,tokens:d,suggestions:u},warnings:n}}function ke(e,t,n){let o=`Token #${t+1}`;if(!N(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!we.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let r=e.var;if(!E.includes(e.group))return n(`Token ${r} skipped: "group" must be one of ${E.join(", ")}.`),null;let s=k(e.label)?e.label:r;k(e.label)||n(`Token ${r} has no "label"; using the variable name.`);let i;e.role!==void 0&&(X.includes(e.role)?i=e.role:n(`Token ${r}: unknown role ${JSON.stringify(e.role)} ignored.`));let l={var:r,label:s,group:e.group,...i?{role:i}:{}};if(e.type==="color")return j(e.default)?{...l,type:"color",default:e.default.toLowerCase()}:(n(`Token ${r} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${r} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!V(e.default)||!V(e.min)||!V(e.max)||!V(e.step))return n(`Token ${r} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${r} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${r} skipped: step must be greater than 0.`),null;let d=e.default;(d<e.min||d>e.max)&&(d=M(d,e.min,e.max),n(`Token ${r}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${b(d)}.`));let p={default:d,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...l,type:"number",...p}:B.includes(e.unit)?{...l,type:"size",unit:e.unit,...p}:(n(`Token ${r} skipped: size "unit" must be one of ${B.join(", ")}.`),null)}function Te(e,t,n,o){if(!N(e)||!k(e.id)||!k(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let r=`Suggestion "${e.id}"`,s=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${r}: "fontPair" is not supported in v1 and is ignored.`);let i=N(e.changes)?e.changes:{},l={};for(let[d,p]of Object.entries(i)){let u=n.get(d);if(!u)return o(`${r} skipped: unknown token ${d}.`),null;if(u.type==="color"){if(!j(p))return o(`${r} skipped: ${d} must be 6-digit hex (got ${JSON.stringify(p)}).`),null;l[d]=p.toLowerCase()}else{if(!V(p))return o(`${r} skipped: ${d} must be a number (got ${JSON.stringify(p)}).`),null;let g=M(p,u.min,u.max);g!==p&&o(`${r}: ${d} value ${p} is outside [${u.min}, ${u.max}]; clamped to ${b(g)}.`),l[d]=g}}return Object.keys(l).length===0?(o(`${r} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:s,changes:l}}function Y(e,t){let n=[];for(let o of e.tokens){let r=t(o.var).trim();r===""?n.push(`${o.var} is in the config but not declared on :root.`):Ce(o,r)||n.push(`${o.var}: config default is ${Se(o)} but the page has ${r}.`)}return n}function Se(e){return e.type==="color"?e.default:e.type==="size"?b(e.default)+e.unit:b(e.default)}function Ce(e,t){if(e.type==="color")return O(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function q(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function A(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!z(t[o],n[o]))}function z(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}var Q="design-tweaker-overrides";function $e(e,t){if(e.type==="color")return String(t);let n=b(Number(t));return e.type==="size"?n+e.unit:n}function ee(e,t,n){let o=[];for(let r of A(e,t,n)){let s=e.tokens.find(i=>i.var===r);o.push(`  ${r}: ${$e(s,t[r])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var H=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(Q),this.el||(this.el=this.doc.createElement("style"),this.el.id=Q)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var I=class{constructor(t){this.listeners=new Set;this.config=t;let n=q(t);this.state={defaults:n,versions:{A:{...n}},active:"A"}}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}changes(){return this.changesFor(this.shownValues())}changesFor(t){return A(this.config,t,this.state.defaults)}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||this.update({active:t}))}set(t,n){let{active:o,versions:r}=this.state;if(o==="original")return;let s=r[o];!s||s[t]===n||this.update({versions:{...r,[o]:{...s,[t]:n}}})}update(t){this.state={...this.state,...t};for(let n of this.listeners)n(this.state)}};var Me=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function a(e,t=null,...n){let o=document.createElement(e);if(t)for(let[r,s]of Object.entries(t))s==null||s===!1||(r==="class"?o.className=String(s):r==="text"?o.textContent=String(s):r.startsWith("on")&&typeof s=="function"?o.addEventListener(r.slice(2).toLowerCase(),s):Me.has(r)?o[r]=s:o.setAttribute(r,s===!0?"":String(s)));return Ee(o,n),o}function Ee(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function v(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var Ve=0,T=e=>`dt-${e}-${++Ve}`;var S=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,y={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',minimise:S(1.6,'<path d="M4 8h8"/>'),plus:S(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:S(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:S(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:S(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:S(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function te(e,t){let n=[],o=a("div");for(let r of E){let s=e.filter(l=>l.group===r);if(!s.length)continue;let i=a("div",{class:"rows"});for(let l of s){let d=l.type==="color"?Le(l,t):Re(l,t);n.push(d),i.appendChild(d.el)}o.appendChild(a("details",{class:"group",open:!0},a("summary",null,v(y.chevron),r),i))}return{el:o,update(r,s,i){for(let l of n)l.update(r,s,i)}}}function ne(e,t,n){let o=t.type==="color"?t.default:b(t.default)+(t.type==="size"?t.unit:"");return a("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},v(y.reset))}function Re(e,t){let n=T("range"),o=e.type==="size"?e.unit:"",r=e.type==="size"&&e.unit==="rem"?a("span",{class:"sub","aria-hidden":"true"}):null,s=a("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(s.value)),onchange:()=>t.commit()}),i=a("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:u=>{u.key==="Enter"&&i.blur(),u.key==="Escape"&&(i.value=p,i.blur())},onblur:()=>{let u=parseFloat(i.value);if(Number.isNaN(u)){i.value=p;return}t.set(e.var,M(Math.round(u*1e4)/1e4,e.min,e.max)),t.commit(),i.value=p}}),l=ne(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),d=a("div",{class:"ctl"},a("div",{class:"ctl-head"},a("label",{for:n,text:e.label}),r,l,a("div",{class:"num"},i,o?a("span",{text:o,"aria-hidden":"true"}):null)),s),p="";return{el:d,update(u,g,h){let c=Number(u[e.var]);p=b(c),s.value!==String(c)&&(s.value=String(c)),s.style.setProperty("--p",(c-e.min)/(e.max-e.min)*100+"%"),oe(i)||(i.value=p),r&&(r.textContent=b(c*16)+"px"),re(d,l,!z(u[e.var],g[e.var])&&!h),s.disabled=i.disabled=h}}}function Le(e,t){let n=T("hex"),o=a("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),r=a("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:d=>{d.key==="Enter"&&r.blur(),d.key==="Escape"&&(r.value=l,r.blur())},onblur:()=>{let d=r.value.trim(),p=O(d.startsWith("#")?d:"#"+d);p&&p!==l&&(t.set(e.var,p),t.commit()),r.value=p??l}}),s=ne(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),i=a("div",{class:"colour"},a("label",{for:n,text:e.label}),s,o,r),l="";return{el:i,update(d,p,u){l=String(d[e.var]),o.value!==l&&(o.value=l),oe(r)||(r.value=l),re(i,s,!z(d[e.var],p[e.var])&&!u),o.disabled=r.disabled=u}}}function oe(e){return e.getRootNode().activeElement===e}function re(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}var ie=`
:host {
  all: initial;
  pointer-events: none; /* only the launcher and window take clicks */
  right: 16px;
  bottom: 16px;
  --bg: #ffffff;
  --fill: rgb(0 0 0 / .05);
  --fill-2: rgb(0 0 0 / .08);
  --sep: rgb(0 0 0 / .09);
  --stroke: rgb(0 0 0 / .13);
  --text: #1d1d1f;
  --text-2: #5e5e63;
  --control: #ffffff;
  --raised: #ffffff;
  --accent: #0066d6;
  --accent-text: #ffffff;
  --warn: #b25000;
  --warn-soft: rgb(255 149 0 / .16);
  --danger: #d70015;
  --tip-bg: #1d1d1f;
  --tip-text: #ffffff;
  --shadow: 0 0 0 .5px rgb(0 0 0 / .16), 0 12px 40px rgb(0 0 0 / .16), 0 2px 8px rgb(0 0 0 / .06);
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :host {
    --bg: #1e1e20;
    --fill: rgb(255 255 255 / .07);
    --fill-2: rgb(255 255 255 / .11);
    --sep: rgb(255 255 255 / .09);
    --stroke: rgb(255 255 255 / .14);
    --text: #f5f5f7;
    --text-2: #a8a8ae;
    --control: rgb(255 255 255 / .07);
    --raised: #3a3a3d;
    --accent: #0a84ff;
    --warn: #ffb340;
    --warn-soft: rgb(255 159 10 / .18);
    --danger: #ff453a;
    --tip-bg: #f5f5f7;
    --tip-text: #1d1d1f;
    --shadow: 0 0 0 .5px rgb(255 255 255 / .12), 0 12px 40px rgb(0 0 0 / .5);
    color-scheme: dark;
  }
}

.launcher, .win { pointer-events: auto; }
.root {
  font: 13px/1.35 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  text-align: left;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
button, input { font: inherit; color: inherit; margin: 0; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
svg { width: 16px; height: 16px; flex: none; display: block; }

[data-tip] { position: relative; }
[data-tip]::after {
  content: attr(data-tip); position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: var(--tip-bg); color: var(--tip-text); font-size: 11.5px; font-weight: 500; white-space: nowrap;
  padding: 4px 8px; border-radius: 6px; pointer-events: none; opacity: 0; transition: opacity .08s; z-index: 3;
}
[data-tip][data-tip-pos="start"]::after { left: 0; transform: none; }
[data-tip][data-tip-pos="left"]::after { bottom: auto; top: 50%; left: auto; right: calc(100% + 6px); transform: translateY(-50%); }
[data-tip]:hover::after, [data-tip]:focus-visible::after { opacity: 1; transition-delay: .35s; }

.launcher {
  width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center;
  background: var(--bg); color: var(--text); box-shadow: var(--shadow); position: relative; padding: 0;
}
.launcher svg { width: 20px; height: 20px; }
.launcher:focus-visible { outline-offset: 3px; }
.badge {
  position: absolute; top: -3px; right: -3px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px;
  background: var(--accent); color: var(--accent-text); font-size: 11px; font-weight: 600; line-height: 18px; text-align: center;
  box-shadow: 0 0 0 2px var(--bg);
}
.badge.error { background: var(--danger); }

.win {
  width: 340px; height: min(52vh, 450px); min-height: 280px; display: flex; flex-direction: column;
  background: var(--bg); border-radius: 14px; box-shadow: var(--shadow); position: relative;
}

.icon-btn {
  width: 26px; height: 26px; border-radius: 7px; border: 0; background: transparent; display: grid; place-items: center;
  cursor: pointer; color: var(--text-2); padding: 0;
}
.icon-btn:hover:not(:disabled) { background: var(--fill-2); color: var(--text); }
.icon-btn:disabled { opacity: .35; cursor: default; }

.top { display: flex; align-items: center; gap: 4px; padding: 10px 8px 8px 12px; min-height: 46px; }
.spacer { flex: 1; }
.seg { display: flex; padding: 2px; gap: 2px; border-radius: 8px; background: var(--fill); }
.seg [role="tab"] {
  border: 0; background: transparent; border-radius: 6px; padding: 3px 9px; cursor: pointer; font-size: 12px; font-weight: 500;
  color: var(--text-2); display: inline-flex; align-items: center; justify-content: center; gap: 5px;
}
.seg [role="tab"]:hover { color: var(--text); }
.seg [role="tab"][aria-selected="true"] { background: var(--raised); color: var(--text); box-shadow: 0 0 0 .5px var(--stroke), 0 1px 2px rgb(0 0 0 / .12); }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex: none; }
.mark { display: inline-grid; width: 14px; height: 14px; margin-right: -4px; place-items: center; }

.tabs { margin: 0 12px 10px; display: grid; grid-template-columns: repeat(3, 1fr); }
.tabs [role="tab"] { padding: 4px 6px; }
.count {
  font-size: 10.5px; font-weight: 600; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px;
  background: var(--warn-soft); color: var(--warn); display: inline-grid; place-items: center;
}

.body { overflow: auto; flex: 1; border-top: .5px solid var(--sep); overscroll-behavior: contain; }
.empty { padding: 28px 16px; text-align: center; color: var(--text-2); }
.error-msg { padding: 16px; display: grid; gap: 8px; }
.error-msg strong { color: var(--danger); }
.error-msg code { font: 12px ui-monospace, "SF Mono", Menlo, monospace; background: var(--fill); padding: 8px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }

.group { border-bottom: .5px solid var(--sep); }
.group > summary {
  list-style: none; display: flex; align-items: center; gap: 6px; padding: 10px 14px 6px; font-size: 11px; font-weight: 600;
  letter-spacing: .02em; text-transform: uppercase; color: var(--text-2); cursor: pointer; user-select: none;
}
.group > summary::-webkit-details-marker { display: none; }
.group > summary svg { width: 10px; height: 10px; transition: transform .15s; }
.group[open] > summary svg { transform: rotate(90deg); }
.rows { padding: 0 14px 12px; display: grid; gap: 12px; }

.ctl { display: grid; gap: 4px; }
.ctl-head, .colour { display: flex; align-items: center; gap: 6px; min-height: 24px; }
.ctl-head label, .colour label { flex: 1; font-weight: 500; min-width: 0; }
.sub { color: var(--text-2); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.changed label::after { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: 6px; vertical-align: 1px; }
.reset {
  width: 20px; height: 20px; border-radius: 5px; border: 0; background: transparent; color: var(--text-2);
  display: grid; place-items: center; cursor: pointer; padding: 0;
}
.reset svg { width: 13px; height: 13px; }
.reset:hover { background: var(--fill-2); color: var(--text); }
.reset[aria-hidden="true"] { visibility: hidden; }

.num {
  display: flex; align-items: center; height: 24px; border-radius: 6px; background: var(--control);
  box-shadow: 0 0 0 .5px var(--stroke); padding: 0 6px; font-variant-numeric: tabular-nums;
}
.num:focus-within { box-shadow: 0 0 0 2px var(--accent); }
.num input { width: 52px; border: 0; background: transparent; text-align: right; padding: 0; outline: none; }
.num span { color: var(--text-2); font-size: 11.5px; margin-left: 2px; }

input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 18px; background: transparent; margin: 0; cursor: pointer; }
input[type="range"]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(to right, var(--accent) 0 var(--p, 50%), var(--fill-2) var(--p, 50%) 100%); }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; margin-top: -6px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 1px 3px rgb(0 0 0 / .25); }
input[type="range"]::-moz-range-track { height: 4px; border-radius: 2px; background: var(--fill-2); }
input[type="range"]::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--accent); }
input[type="range"]::-moz-range-thumb { width: 16px; height: 16px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 .5px rgb(0 0 0 / .25), 0 1px 3px rgb(0 0 0 / .25); }
input[type="range"]:focus-visible { outline: none; }
input[type="range"]:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--accent); }
input[type="range"]:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 2px var(--accent); }
input:disabled { opacity: .45; cursor: default; }
.swatch:disabled { opacity: 1; } /* Original view must show true colours */

.swatch {
  -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border: 0; padding: 0; border-radius: 6px; cursor: pointer;
  background: transparent; box-shadow: 0 0 0 .5px var(--stroke);
}
.swatch::-webkit-color-swatch-wrapper { padding: 0; }
.swatch::-webkit-color-swatch { border: 0; border-radius: 6px; box-shadow: inset 0 0 0 .5px rgb(0 0 0 / .2); }
.swatch::-moz-color-swatch { border: 0; border-radius: 6px; }
.hex {
  width: 78px; height: 24px; border: 0; border-radius: 6px; background: var(--control); box-shadow: 0 0 0 .5px var(--stroke);
  font: 12px ui-monospace, "SF Mono", Menlo, monospace; padding: 0 6px; outline: none;
}
.hex:focus { box-shadow: 0 0 0 2px var(--accent); }

.btn {
  border: 0; border-radius: 6px; padding: 3px 10px; font-size: 12px; font-weight: 500; cursor: pointer;
  background: var(--fill-2); height: 24px; white-space: nowrap;
}
.btn:hover:not(:disabled) { background: var(--stroke); }
.btn.primary { background: var(--accent); color: var(--accent-text); }
.btn.primary:hover:not(:disabled) { background: var(--accent); filter: brightness(1.08); }
.btn:disabled { opacity: .4; cursor: default; }

.footer { border-top: .5px solid var(--sep); padding: 8px 10px; min-height: 46px; display: flex; align-items: center; gap: 2px; }
.footer-row { display: flex; align-items: center; gap: 2px; flex: 1; }
.copy { height: 28px; padding: 0 14px; font-size: 12.5px; }
.note { display: flex; gap: 8px; align-items: center; color: var(--text-2); font-size: 12px; padding: 0 4px; flex: 1; }

/* Phone widths: full-width panel with 8px margins (spec \xA76.4). Kept last so it wins. */
@media (max-width: 479px) {
  :host { left: 8px; right: 8px; bottom: 8px; }
  .win { width: auto; }
  .launcher { margin-left: auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::after { transition: none !important; }
}
`;var Oe="design-tweaker-root";function ae(){let e=document.createElement(Oe);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=ie;let o=a("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function se(e,t,n,o){let r=new Map,s=a("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let i of n){let l=a("button",{type:"button",role:"tab",id:T("tab"),onclick:()=>o(i.id)},...i.content);r.set(i.id,l),s.appendChild(l)}return s.addEventListener("keydown",i=>{let l=[...r.keys()],d=l.findIndex(u=>r.get(u)===s.getRootNode().activeElement);if(d<0)return;let p=-1;i.key==="ArrowRight"?p=(d+1)%l.length:i.key==="ArrowLeft"?p=(d-1+l.length)%l.length:i.key==="Home"?p=0:i.key==="End"&&(p=l.length-1),!(p<0)&&(i.preventDefault(),o(l[p]),r.get(l[p]).focus())}),{el:s,buttons:r,select(i){for(let[l,d]of r){let p=l===i;d.setAttribute("aria-selected",String(p)),d.tabIndex=p?0:-1}}}}function le(e){let t=a("span",{class:"badge",hidden:!0});return{button:a("button",{type:"button",class:"launcher",onclick:e},v(y.sliders),t),badge:t}}function de(e,t,n){let o=!0,r=(i,l)=>{o=i,t.hidden=!i,e.hidden=i,l&&(i?n():e).focus()},s=i=>{i.altKey&&i.shiftKey&&!i.ctrlKey&&!i.metaKey&&i.code==="KeyT"&&(i.preventDefault(),r(!o,!0))};return window.addEventListener("keydown",s),{set:r,isExpanded:()=>o,dispose:()=>window.removeEventListener("keydown",s)}}function pe(e){let{host:t,root:n}=ae(),o=e.config,r="controls",s=["original","A"],i=new Map,l=se("Versions","versions",s.map(f=>{if(f==="original")return{id:f,content:["Original"]};let x=a("span",{class:"dot",hidden:!0});return i.set(f,x),{id:f,content:[f,a("span",{class:"mark"},x)]}}),f=>e.view(f)),d=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>L.set(!1,!0)},v(y.minimise)),p=a("div",{class:"top"},l.el,a("span",{class:"spacer"}),d),u=a("span",{class:"count",hidden:!0}),g=se("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",u]},{id:"suggestions",content:["Suggestions"]}],f=>{r=f,P()}),h=te(o.tokens,{set:(f,x)=>e.set(f,x),commit:()=>{}}),c={controls:h.el,checks:a("div",{class:"empty",text:"Design checks arrive in milestone M3."}),suggestions:a("div",{class:"empty",text:"Suggestions arrive in milestone M4."})};for(let f of Object.keys(c)){let x=g.buttons.get(f),m=c[f];m.id=T("tabpanel"),m.setAttribute("role","tabpanel"),m.setAttribute("aria-labelledby",x.id),m.tabIndex=-1,x.setAttribute("aria-controls",m.id)}let R=a("div",{class:"body"},...Object.values(c)),ge=a("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":"Undo (\u2318Z)","data-tip-pos":"start",disabled:!0},v(y.undo)),me=a("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":"Redo (\u2318\u21E7Z)",disabled:!0},v(y.redo)),he=a("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",disabled:!0},v(y.resetAll)),K=a("button",{type:"button",class:"btn primary copy",disabled:!0}),D=a("div",{class:"footer-row"},ge,me,he,a("span",{class:"spacer"}),K),U=a("div",{class:"note",hidden:!0},v(y.info),"Showing the original design. Pick a version to edit."),be=a("footer",{class:"footer"},D,U),G=a("section",{class:"win","aria-label":"Design Tweaker"},p,g.el,R,be),C=le(()=>L.set(!0,!0));n.append(C.button,G);let L=de(C.button,G,()=>d);L.set(!0,!1);function P(){let f=e.getState(),x=f.active==="original",m=e.changes().length;l.select(f.active);for(let[$,ve]of i){let J=$==="original"?void 0:f.versions[$];ve.hidden=!J||e.changesFor(J).length===0}g.select(r);for(let $ of Object.keys(c))c[$].hidden=$!==r;h.update(e.shownValues(),f.defaults,x),D.hidden=x,U.hidden=!x,K.textContent=m===0?"Copy changes":`Copy ${m} change${m===1?"":"s"}`,C.badge.hidden=m===0,C.badge.textContent=String(m),C.button.setAttribute("aria-label",`Open Design Tweaker${m?` (${m} unsaved change${m===1?"":"s"})`:""}`)}let xe=e.subscribe(P);return P(),{destroy(){xe(),L.dispose(),t.remove()}}}function ue(e){let{host:t,root:n}=ae(),o=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>i.set(!1,!0)},v(y.minimise)),r=a("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},a("div",{class:"top"},a("strong",{text:"Design Tweaker"}),a("span",{class:"spacer"}),o),a("div",{class:"body error-msg",role:"alert"},a("strong",{text:"The tweak config couldn't be loaded."}),a("code",{text:e}),a("span",{text:"Fix tweak.config.json and reload the page."}))),s=le(()=>i.set(!0,!0));s.badge.hidden=!1,s.badge.classList.add("error"),s.badge.textContent="!",s.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(s.button,r);let i=de(s.button,r,()=>o);return i.set(!0,!1),{destroy(){i.dispose(),t.remove()}}}var F="[design-tweaker]",w=null;function fe(e){if(w){console.warn(`${F} mount() called twice; ignoring.`);return}let t=Z(e);if(!t.ok){console.error(`${F} ${t.error}`),w={panel:ue(t.error)};return}let{config:n,warnings:o}=t;for(let d of o)console.warn(`${F} ${d}`);let r=getComputedStyle(document.documentElement);for(let d of Y(n,p=>r.getPropertyValue(p)))console.warn(`${F} Config out of date: ${d}`);let s=new I(n),i=new H,l=s.subscribe(()=>i.write(ee(n,s.shownValues(),s.getState().defaults)));w={panel:pe(s),writer:i,stop:l}}function Ne(){w&&(w.stop?.(),w.writer?.remove(),w.panel.destroy(),w=null)}window.TweakPanel={mount:fe,unmount:Ne};function ce(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&fe(e.textContent??"")}document.body?ce():document.addEventListener("DOMContentLoaded",ce,{once:!0});})();
