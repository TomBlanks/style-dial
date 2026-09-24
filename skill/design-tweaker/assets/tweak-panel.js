/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function x(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function V(e,t,n){return Math.min(n,Math.max(t,e))}var oe=/^#[0-9a-f]{6}$/i,Ve=/^#[0-9a-f]{3}$/i;function _(e){return typeof e=="string"&&oe.test(e)}function P(e){let t=e.trim();return oe.test(t)?t.toLowerCase():Ve.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var M=["Typography","Spacing","Layout","Colour"],re=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],Z=["px","rem","ch"],ie=["html","react-vite","nextjs"];var Me=/^--[A-Za-z0-9_-]+$/,F=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),E=e=>typeof e=="number"&&Number.isFinite(e),k=e=>typeof e=="string"&&e.length>0;function se(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(h){return{ok:!1,error:`Config is not valid JSON: ${h.message}`}}if(!F(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=h=>n.push(h),r="default";k(t.id)?r=t.id:o('Config has no "id"; using "default" as the storage key.');let s="html";ie.includes(t.framework)?s=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let i=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let l="";k(t.tokensFile)?l=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let d=[],p=new Set;t.tokens.forEach((h,b)=>{let f=Ee(h,b,o);if(f){if(f.var==="--font-heading"||f.var==="--font-body"){o(`Token ${f.var} skipped: fonts are not adjustable in v1.`);return}if(p.has(f.var)){o(`Token ${f.var} skipped: duplicate variable.`);return}p.add(f.var),d.push(f)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let c=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let h=new Map(d.map(b=>[b.var,b]));t.suggestions.forEach((b,f)=>{let A=Re(b,f,h,o);A&&c.push(A)})}return{ok:!0,config:{version:1,id:r,framework:s,tailwind:i,tokensFile:l,tokens:d,suggestions:c},warnings:n}}function Ee(e,t,n){let o=`Token #${t+1}`;if(!F(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!Me.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let r=e.var;if(!M.includes(e.group))return n(`Token ${r} skipped: "group" must be one of ${M.join(", ")}.`),null;let s=k(e.label)?e.label:r;k(e.label)||n(`Token ${r} has no "label"; using the variable name.`);let i;e.role!==void 0&&(re.includes(e.role)?i=e.role:n(`Token ${r}: unknown role ${JSON.stringify(e.role)} ignored.`));let l={var:r,label:s,group:e.group,...i?{role:i}:{}};if(e.type==="color")return _(e.default)?{...l,type:"color",default:e.default.toLowerCase()}:(n(`Token ${r} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${r} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!E(e.default)||!E(e.min)||!E(e.max)||!E(e.step))return n(`Token ${r} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${r} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${r} skipped: step must be greater than 0.`),null;let d=e.default;(d<e.min||d>e.max)&&(d=V(d,e.min,e.max),n(`Token ${r}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${x(d)}.`));let p={default:d,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...l,type:"number",...p}:Z.includes(e.unit)?{...l,type:"size",unit:e.unit,...p}:(n(`Token ${r} skipped: size "unit" must be one of ${Z.join(", ")}.`),null)}function Re(e,t,n,o){if(!F(e)||!k(e.id)||!k(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let r=`Suggestion "${e.id}"`,s=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${r}: "fontPair" is not supported in v1 and is ignored.`);let i=F(e.changes)?e.changes:{},l={};for(let[d,p]of Object.entries(i)){let c=n.get(d);if(!c)return o(`${r} skipped: unknown token ${d}.`),null;if(c.type==="color"){if(!_(p))return o(`${r} skipped: ${d} must be 6-digit hex (got ${JSON.stringify(p)}).`),null;l[d]=p.toLowerCase()}else{if(!E(p))return o(`${r} skipped: ${d} must be a number (got ${JSON.stringify(p)}).`),null;let h=V(p,c.min,c.max);h!==p&&o(`${r}: ${d} value ${p} is outside [${c.min}, ${c.max}]; clamped to ${x(h)}.`),l[d]=h}}return Object.keys(l).length===0?(o(`${r} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:s,changes:l}}function ae(e,t){let n=[];for(let o of e.tokens){let r=t(o.var).trim();r===""?n.push(`${o.var} is in the config but not declared on :root.`):Ae(o,r)||n.push(`${o.var}: config default is ${Le(o)} but the page has ${r}.`)}return n}function Le(e){return e.type==="color"?e.default:e.type==="size"?x(e.default)+e.unit:x(e.default)}function Ae(e,t){if(e.type==="color")return P(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function le(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function j(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!R(t[o],n[o]))}function R(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function L(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>R(e[o],t[o]))}var de="design-tweaker-overrides";function Oe(e,t){if(e.type==="color")return String(t);let n=x(Number(t));return e.type==="size"?n+e.unit:n}function pe(e,t,n){let o=[];for(let r of j(e,t,n)){let s=e.tokens.find(i=>i.var===r);o.push(`  ${r}: ${Oe(s,t[r])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var K=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(de),this.el||(this.el=this.doc.createElement("style"),this.el.id=de)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var Ne=100,U=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return L(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>Ne&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){L(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!L(t,this.committed)}canRedo(t){return this.future.length>0&&L(t,this.committed)}get size(){return this.past.length}};var B=class{constructor(t){this.listeners=new Set;this.histories=new Map;this.config=t;let n=le(t);this.state={defaults:n,versions:{A:{...n}},active:"A"},this.histories.set("A",new U(this.state.versions.A))}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}changes(){return this.changesFor(this.shownValues())}changesFor(t){return j(this.config,t,this.state.defaults)}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([r,s])=>o[r]===s)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var ze=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function a(e,t=null,...n){let o=document.createElement(e);if(t)for(let[r,s]of Object.entries(t))s==null||s===!1||(r==="class"?o.className=String(s):r==="text"?o.textContent=String(s):r.startsWith("on")&&typeof s=="function"?o.addEventListener(r.slice(2).toLowerCase(),s):ze.has(r)?o[r]=s:o.setAttribute(r,s===!0?"":String(s)));return Ie(o,n),o}function Ie(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function v(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var He=0,T=e=>`dt-${e}-${++He}`;var C=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,y={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',minimise:C(1.6,'<path d="M4 8h8"/>'),plus:C(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:C(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:C(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:C(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:C(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function ue(e,t){let n=[],o=a("div");for(let r of M){let s=e.filter(l=>l.group===r);if(!s.length)continue;let i=a("div",{class:"rows"});for(let l of s){let d=l.type==="color"?Fe(l,t):Pe(l,t);n.push(d),i.appendChild(d.el)}o.appendChild(a("details",{class:"group",open:!0},a("summary",null,v(y.chevron),r),i))}return{el:o,update(r,s,i){for(let l of n)l.update(r,s,i)}}}function ce(e,t,n){let o=t.type==="color"?t.default:x(t.default)+(t.type==="size"?t.unit:"");return a("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},v(y.reset))}function Pe(e,t){let n=T("range"),o=e.type==="size"?e.unit:"",r=e.type==="size"&&e.unit==="rem"?a("span",{class:"sub","aria-hidden":"true"}):null,s=a("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(s.value)),onchange:()=>t.commit()}),i=a("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:c=>{c.key==="Enter"&&i.blur(),c.key==="Escape"&&(i.value=p,i.blur())},onblur:()=>{let c=parseFloat(i.value);if(Number.isNaN(c)){i.value=p;return}t.set(e.var,V(Math.round(c*1e4)/1e4,e.min,e.max)),t.commit(),i.value=p}}),l=ce(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),d=a("div",{class:"ctl"},a("div",{class:"ctl-head"},a("label",{for:n,text:e.label}),r,l,a("div",{class:"num"},i,o?a("span",{text:o,"aria-hidden":"true"}):null)),s),p="";return{el:d,update(c,h,b){let f=Number(c[e.var]);p=x(f),s.value!==String(f)&&(s.value=String(f)),s.style.setProperty("--p",(f-e.min)/(e.max-e.min)*100+"%"),fe(i)||(i.value=p),r&&(r.textContent=x(f*16)+"px"),ge(d,l,!R(c[e.var],h[e.var])&&!b),s.disabled=i.disabled=b}}}function Fe(e,t){let n=T("hex"),o=a("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),r=a("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:d=>{d.key==="Enter"&&r.blur(),d.key==="Escape"&&(r.value=l,r.blur())},onblur:()=>{let d=r.value.trim(),p=P(d.startsWith("#")?d:"#"+d);p&&p!==l&&(t.set(e.var,p),t.commit()),r.value=p??l}}),s=ce(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),i=a("div",{class:"colour"},a("label",{for:n,text:e.label}),s,o,r),l="";return{el:i,update(d,p,c){l=String(d[e.var]),o.value!==l&&(o.value=l),fe(r)||(r.value=l),ge(i,s,!R(d[e.var],p[e.var])&&!c),o.disabled=r.disabled=c}}}function fe(e){return e.getRootNode().activeElement===e}function ge(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}var he=`
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
/* Version tabs: letter centred in a fixed width; "has changes" dot in the top-right corner. */
.versions [role="tab"] { position: relative; min-width: 34px; }
.versions [role="tab"]:first-child { min-width: 0; }
.dot { position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

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
.confirm-row { gap: 6px; font-size: 12px; }
.confirm-text { flex: 1; line-height: 1.3; padding-left: 4px; }
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
`;var je="design-tweaker-root";function be(){let e=document.createElement(je);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=he;let o=a("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function me(e,t,n,o){let r=new Map,s=a("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let i of n){let l=a("button",{type:"button",role:"tab",id:T("tab"),onclick:()=>o(i.id)},...i.content);r.set(i.id,l),s.appendChild(l)}return s.addEventListener("keydown",i=>{let l=[...r.keys()],d=l.findIndex(c=>r.get(c)===s.getRootNode().activeElement);if(d<0)return;let p=-1;i.key==="ArrowRight"?p=(d+1)%l.length:i.key==="ArrowLeft"?p=(d-1+l.length)%l.length:i.key==="Home"?p=0:i.key==="End"&&(p=l.length-1),!(p<0)&&(i.preventDefault(),o(l[p]),r.get(l[p]).focus())}),{el:s,buttons:r,select(i){for(let[l,d]of r){let p=l===i;d.setAttribute("aria-selected",String(p)),d.tabIndex=p?0:-1}}}}function xe(e){let t=a("span",{class:"badge",hidden:!0});return{button:a("button",{type:"button",class:"launcher",onclick:e},v(y.sliders),t),badge:t}}function ve(e,t,n){let o=!0,r=(i,l)=>{o=i,t.hidden=!i,e.hidden=i,l&&(i?n():e).focus()},s=i=>{i.altKey&&i.shiftKey&&!i.ctrlKey&&!i.metaKey&&i.code==="KeyT"&&(i.preventDefault(),r(!o,!0))};return window.addEventListener("keydown",s),{set:r,isExpanded:()=>o,dispose:()=>window.removeEventListener("keydown",s)}}function ye(e){let{host:t,root:n}=be(),o=e.config,r="controls",s=["original","A"],i=new Map,l=me("Versions","versions",s.map(u=>{if(u==="original")return{id:u,content:["Original"]};let g=a("span",{class:"dot",hidden:!0});return i.set(u,g),{id:u,content:[u,g]}}),u=>e.view(u)),d=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>I.set(!1,!0)},v(y.minimise)),p=a("div",{class:"top"},l.el,a("span",{class:"spacer"}),d),c=a("span",{class:"count",hidden:!0}),h=me("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",c]},{id:"suggestions",content:["Suggestions"]}],u=>{r=u,H()}),b=ue(o.tokens,{set:(u,g)=>e.set(u,g),commit:()=>e.commit()}),f={controls:b.el,checks:a("div",{class:"empty",text:"Design checks arrive in milestone M3."}),suggestions:a("div",{class:"empty",text:"Suggestions arrive in milestone M4."})};for(let u of Object.keys(f)){let g=h.buttons.get(u),m=f[u];m.id=T("tabpanel"),m.setAttribute("role","tabpanel"),m.setAttribute("aria-labelledby",g.id),m.tabIndex=-1,g.setAttribute("aria-controls",m.id)}let A=a("div",{class:"body"},...Object.values(f)),G=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",J=a("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${G}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},v(y.undo)),Y=a("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${G}${G==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},v(y.redo)),O=a("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>z(!0)},v(y.resetAll)),q=a("button",{type:"button",class:"btn primary copy",disabled:!0}),Q=a("div",{class:"footer-row"},J,Y,O,a("span",{class:"spacer"}),q),ee=a("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>z(!1,!0)}),W=a("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},a("span",{class:"confirm-text",text:"Reset this version to the original?"}),ee,a("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),z(!1,!0)}}));W.addEventListener("keydown",u=>{u.key==="Escape"&&(u.stopPropagation(),z(!1,!0))});let te=a("div",{class:"note",hidden:!0},v(y.info),"Showing the original design. Pick a version to edit."),Ce=a("footer",{class:"footer"},Q,W,te),N=!1;function z(u,g=!1){N=u,H(),u?ee.focus():g&&(O.disabled?J:O).focus()}let X=a("section",{class:"win","aria-label":"Design Tweaker"},p,h.el,A,Ce);X.addEventListener("keydown",u=>{if(!(u.metaKey||u.ctrlKey)||u.altKey||u.code!=="KeyZ")return;let g=u.composedPath()[0];g instanceof HTMLInputElement&&g.type==="text"||(u.preventDefault(),u.shiftKey?e.redo():e.undo())});let S=xe(()=>I.set(!0,!0));n.append(S.button,X);let I=ve(S.button,X,()=>d);I.set(!0,!1);function H(){let u=e.getState(),g=u.active==="original",m=e.changes().length;l.select(u.active);for(let[$,$e]of i){let ne=$==="original"?void 0:u.versions[$];$e.hidden=!ne||e.changesFor(ne).length===0}h.select(r);for(let $ of Object.keys(f))f[$].hidden=$!==r;b.update(e.shownValues(),u.defaults,g),(g||m===0)&&(N=!1),Q.hidden=g||N,W.hidden=g||!N,te.hidden=!g,J.disabled=!e.canUndo(),Y.disabled=!e.canRedo(),O.disabled=m===0,q.textContent=m===0?"Copy changes":`Copy ${m} change${m===1?"":"s"}`,S.badge.hidden=m===0,S.badge.textContent=String(m),S.button.setAttribute("aria-label",`Open Design Tweaker${m?` (${m} unsaved change${m===1?"":"s"})`:""}`)}let Se=e.subscribe(H);return H(),{destroy(){Se(),I.dispose(),t.remove()}}}function we(e){let{host:t,root:n}=be(),o=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>i.set(!1,!0)},v(y.minimise)),r=a("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},a("div",{class:"top"},a("strong",{text:"Design Tweaker"}),a("span",{class:"spacer"}),o),a("div",{class:"body error-msg",role:"alert"},a("strong",{text:"The tweak config couldn't be loaded."}),a("code",{text:e}),a("span",{text:"Fix tweak.config.json and reload the page."}))),s=xe(()=>i.set(!0,!0));s.badge.hidden=!1,s.badge.classList.add("error"),s.badge.textContent="!",s.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(s.button,r);let i=ve(s.button,r,()=>o);return i.set(!0,!1),{destroy(){i.dispose(),t.remove()}}}var D="[design-tweaker]",w=null;function Te(e){if(w){console.warn(`${D} mount() called twice; ignoring.`);return}let t=se(e);if(!t.ok){console.error(`${D} ${t.error}`),w={panel:we(t.error)};return}let{config:n,warnings:o}=t;for(let d of o)console.warn(`${D} ${d}`);let r=getComputedStyle(document.documentElement);for(let d of ae(n,p=>r.getPropertyValue(p)))console.warn(`${D} Config out of date: ${d}`);let s=new B(n),i=new K,l=s.subscribe(()=>i.write(pe(n,s.shownValues(),s.getState().defaults)));w={panel:ye(s),writer:i,stop:l}}function Ke(){w&&(w.stop?.(),w.writer?.remove(),w.panel.destroy(),w=null)}window.TweakPanel={mount:Te,unmount:Ke};function ke(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&Te(e.textContent??"")}document.body?ke():document.addEventListener("DOMContentLoaded",ke,{once:!0});})();
