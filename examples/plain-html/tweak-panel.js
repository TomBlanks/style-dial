/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function C(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function H(e,t,n){return Math.min(n,Math.max(t,e))}var te=/^#[0-9a-f]{6}$/i,Te=/^#[0-9a-f]{3}$/i;function Y(e){return typeof e=="string"&&te.test(e)}function G(e){let t=e.trim();return te.test(t)?t.toLowerCase():Te.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var z=["Typography","Spacing","Layout","Colour"],ne=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],q=["px","rem","ch"],oe=["html","react-vite","nextjs"];var Se=/^--[A-Za-z0-9_-]+$/,J=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),P=e=>typeof e=="number"&&Number.isFinite(e),O=e=>typeof e=="string"&&e.length>0;function re(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(b){return{ok:!1,error:`Config is not valid JSON: ${b.message}`}}if(!J(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=b=>n.push(b),r="default";O(t.id)?r=t.id:o('Config has no "id"; using "default" as the storage key.');let i="html";oe.includes(t.framework)?i=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let s=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let l="";O(t.tokensFile)?l=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let d=[],c=new Set;t.tokens.forEach((b,x)=>{let h=Ce(b,x,o);if(h){if(h.var==="--font-heading"||h.var==="--font-body"){o(`Token ${h.var} skipped: fonts are not adjustable in v1.`);return}if(c.has(h.var)){o(`Token ${h.var} skipped: duplicate variable.`);return}c.add(h.var),d.push(h)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let f=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let b=new Map(d.map(x=>[x.var,x]));t.suggestions.forEach((x,h)=>{let M=Ve(x,h,b,o);M&&f.push(M)})}return{ok:!0,config:{version:1,id:r,framework:i,tailwind:s,tokensFile:l,tokens:d,suggestions:f},warnings:n}}function Ce(e,t,n){let o=`Token #${t+1}`;if(!J(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!Se.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let r=e.var;if(!z.includes(e.group))return n(`Token ${r} skipped: "group" must be one of ${z.join(", ")}.`),null;let i=O(e.label)?e.label:r;O(e.label)||n(`Token ${r} has no "label"; using the variable name.`);let s;e.role!==void 0&&(ne.includes(e.role)?s=e.role:n(`Token ${r}: unknown role ${JSON.stringify(e.role)} ignored.`));let l={var:r,label:i,group:e.group,...s?{role:s}:{}};if(e.type==="color")return Y(e.default)?{...l,type:"color",default:e.default.toLowerCase()}:(n(`Token ${r} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${r} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!P(e.default)||!P(e.min)||!P(e.max)||!P(e.step))return n(`Token ${r} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${r} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${r} skipped: step must be greater than 0.`),null;let d=e.default;(d<e.min||d>e.max)&&(d=H(d,e.min,e.max),n(`Token ${r}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${C(d)}.`));let c={default:d,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...l,type:"number",...c}:q.includes(e.unit)?{...l,type:"size",unit:e.unit,...c}:(n(`Token ${r} skipped: size "unit" must be one of ${q.join(", ")}.`),null)}function Ve(e,t,n,o){if(!J(e)||!O(e.id)||!O(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let r=`Suggestion "${e.id}"`,i=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${r}: "fontPair" is not supported in v1 and is ignored.`);let s=J(e.changes)?e.changes:{},l={};for(let[d,c]of Object.entries(s)){let f=n.get(d);if(!f)return o(`${r} skipped: unknown token ${d}.`),null;if(f.type==="color"){if(!Y(c))return o(`${r} skipped: ${d} must be 6-digit hex (got ${JSON.stringify(c)}).`),null;l[d]=c.toLowerCase()}else{if(!P(c))return o(`${r} skipped: ${d} must be a number (got ${JSON.stringify(c)}).`),null;let b=H(c,f.min,f.max);b!==c&&o(`${r}: ${d} value ${c} is outside [${f.min}, ${f.max}]; clamped to ${C(b)}.`),l[d]=b}}return Object.keys(l).length===0?(o(`${r} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:i,changes:l}}function ie(e,t){let n=[];for(let o of e.tokens){let r=t(o.var).trim();r===""?n.push(`${o.var} is in the config but not declared on :root.`):Me(o,r)||n.push(`${o.var}: config default is ${$e(o)} but the page has ${r}.`)}return n}function $e(e){return e.type==="color"?e.default:e.type==="size"?C(e.default)+e.unit:C(e.default)}function Me(e,t){if(e.type==="color")return G(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function se(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function _(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!F(t[o],n[o]))}function F(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function D(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>F(e[o],t[o]))}var ae="design-tweaker-overrides";function Ee(e,t){if(e.type==="color")return String(t);let n=C(Number(t));return e.type==="size"?n+e.unit:n}function le(e,t,n){let o=[];for(let r of _(e,t,n)){let i=e.tokens.find(s=>s.var===r);o.push(`  ${r}: ${Ee(i,t[r])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var W=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(ae),this.el||(this.el=this.doc.createElement("style"),this.el.id=ae)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var Re=100,K=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return D(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>Re&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){D(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!D(t,this.committed)}canRedo(t){return this.future.length>0&&D(t,this.committed)}get size(){return this.past.length}};var Q=["A","B","C"],X=class{constructor(t){this.listeners=new Set;this.histories=new Map;this.config=t;let n=se(t);this.state={defaults:n,versions:{A:{...n}},active:"A"},this.histories.set("A",new K(this.state.versions.A))}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}changes(){return this.changesFor(this.shownValues())}changesFor(t){return _(this.config,t,this.state.defaults)}versionIds(){return Q.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<Q.length}createVersion(){let t=Q.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new K(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let r=this.state.active;if(r===t){let i=n.indexOf(t);r=n[i-1]??n[i+1]}this.update({versions:o,active:r})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([r,i])=>o[r]===i)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var Ie=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function a(e,t=null,...n){let o=document.createElement(e);if(t)for(let[r,i]of Object.entries(t))i==null||i===!1||(r==="class"?o.className=String(i):r==="text"?o.textContent=String(i):r.startsWith("on")&&typeof i=="function"?o.addEventListener(r.slice(2).toLowerCase(),i):Ie.has(r)?o[r]=i:o.setAttribute(r,i===!0?"":String(i)));return Le(o,n),o}function Le(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function T(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var Oe=0,A=e=>`dt-${e}-${++Oe}`;var L=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,S={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:L(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:L(1.6,'<path d="M4 8h8"/>'),plus:L(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:L(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:L(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:L(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:L(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function de(e,t){let n=[],o=a("div");for(let r of z){let i=e.filter(l=>l.group===r);if(!i.length)continue;let s=a("div",{class:"rows"});for(let l of i){let d=l.type==="color"?Ne(l,t):Ae(l,t);n.push(d),s.appendChild(d.el)}o.appendChild(a("details",{class:"group",open:!0},a("summary",null,T(S.chevron),r),s))}return{el:o,update(r,i,s){for(let l of n)l.update(r,i,s)}}}function ce(e,t,n){let o=t.type==="color"?t.default:C(t.default)+(t.type==="size"?t.unit:"");return a("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},T(S.reset))}function Ae(e,t){let n=A("range"),o=e.type==="size"?e.unit:"",r=e.type==="size"&&e.unit==="rem"?a("span",{class:"sub","aria-hidden":"true"}):null,i=a("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(i.value)),onchange:()=>t.commit()}),s=a("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:f=>{f.key==="Enter"&&s.blur(),f.key==="Escape"&&(s.value=c,s.blur())},onblur:()=>{let f=parseFloat(s.value);if(Number.isNaN(f)){s.value=c;return}t.set(e.var,H(Math.round(f*1e4)/1e4,e.min,e.max)),t.commit(),s.value=c}}),l=ce(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),d=a("div",{class:"ctl"},a("div",{class:"ctl-head"},a("label",{for:n,text:e.label}),r,l,a("div",{class:"num"},s,o?a("span",{text:o,"aria-hidden":"true"}):null)),i),c="";return{el:d,update(f,b,x){let h=Number(f[e.var]);c=C(h),i.value!==String(h)&&(i.value=String(h)),i.style.setProperty("--p",(h-e.min)/(e.max-e.min)*100+"%"),pe(s)||(s.value=c),r&&(r.textContent=C(h*16)+"px"),ue(d,l,!F(f[e.var],b[e.var])&&!x),i.disabled=s.disabled=x}}}function Ne(e,t){let n=A("hex"),o=a("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),r=a("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:d=>{d.key==="Enter"&&r.blur(),d.key==="Escape"&&(r.value=l,r.blur())},onblur:()=>{let d=r.value.trim(),c=G(d.startsWith("#")?d:"#"+d);c&&c!==l&&(t.set(e.var,c),t.commit()),r.value=c??l}}),i=ce(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),s=a("div",{class:"colour"},a("label",{for:n,text:e.label}),i,o,r),l="";return{el:s,update(d,c,f){l=String(d[e.var]),o.value!==l&&(o.value=l),pe(r)||(r.value=l),ue(s,i,!F(d[e.var],c[e.var])&&!f),o.disabled=r.disabled=f}}}function pe(e){return e.getRootNode().activeElement===e}function ue(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function fe(e,t){let n=a("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=a("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let p=e.createVersion();p&&E(p)}},T(S.plus)),r=a("div",{class:"top"},n,o,a("span",{class:"spacer"}),t),i=null,s=a("span",{class:"confirm-text"}),l=a("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>b()}),d=a("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let p=i;b(!1),e.deleteVersion(p),E(e.getState().active)}}),c=a("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},s,l,d);c.addEventListener("keydown",p=>{p.key==="Escape"&&(p.stopPropagation(),b())});function f(p){let u=e.changesFor(e.getState().versions[p]).length;i=p,s.replaceChildren(a("strong",{text:`Delete Version ${p}?`})," ",a("span",{text:u?`Its ${u} change${u===1?"":"s"} will be lost.`:"It has no changes."})),r.hidden=!0,c.hidden=!1,l.focus()}function b(p=!0){let u=i;i=null,r.hidden=!1,c.hidden=!0,p&&u&&E(u)}let x=new Map,h=new Map,M=new Map,I="";function E(p){x.get(p)?.focus()}function j(p){x.clear(),h.clear(),M.clear(),n.replaceChildren(...p.map(u=>{let v=a("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(u),...u==="original"?{}:{"aria-keyshortcuts":"Delete"}},u==="original"?"Original":u);if(x.set(u,v),u==="original")return v;let V=a("span",{class:"dot","aria-hidden":"true"});v.appendChild(V),h.set(u,V);let y=a("button",{type:"button",class:"vtab-x","aria-label":`Delete Version ${u}`,tabIndex:-1,onclick:m=>{m.stopPropagation(),f(u)}},T(S.close));return M.set(u,y),a("span",{class:"vtab"},v,y)}))}return n.addEventListener("keydown",p=>{let u=[...x.keys()],v=n.getRootNode().activeElement,V=u.findIndex($=>x.get($)===v);if(V<0)return;let y=u[V];if((p.key==="Delete"||p.key==="Backspace")&&y!=="original"&&e.versionIds().length>1){p.preventDefault(),f(y);return}let m=-1;p.key==="ArrowRight"?m=(V+1)%u.length:p.key==="ArrowLeft"?m=(V-1+u.length)%u.length:p.key==="Home"?m=0:p.key==="End"&&(m=u.length-1),!(m<0)&&(p.preventDefault(),e.view(u[m]),E(u[m]))}),{row:r,confirmRow:c,shortcut(p){if(!p.altKey||!p.shiftKey||p.metaKey||p.ctrlKey)return!1;let u=/^Digit([0-3])$/.exec(p.code);if(!u)return!1;let v=u[1]==="0"?"original":["A","B","C"][Number(u[1])-1];return v!=="original"&&!e.getState().versions[v]?!1:(e.view(v),E(v),!0)},render(){let p=e.getState(),u=["original",...e.versionIds()],v=u.join();v!==I&&(j(u),I=v);let V=u.length>2;for(let[y,m]of x){let $=y===p.active;m.setAttribute("aria-selected",String($)),m.tabIndex=$?0:-1}for(let[y,m]of h)m.hidden=e.changesFor(p.versions[y]).length===0;for(let[y,m]of M){let $=V&&y===p.active;m.hidden=!$,m.parentElement.classList.toggle("deletable",$)}o.hidden=!e.canCreateVersion(),i&&!p.versions[i]&&b(!1)}}}var ge=`
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
/* Version tabs: letter centred in a fixed width; "has changes" dot in the top-right corner.
   Hovering (or focusing) the selected tab hides the dot, moves the letter left and shows the \u2715 on the right. */
.vtab { position: relative; display: flex; }
.vtab .vtab-btn { position: relative; width: 42px; }
.dot { position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.vtab-x {
  position: absolute; right: 3px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border: 0; padding: 0;
  border-radius: 4px; background: transparent; color: var(--text-2); cursor: pointer; display: none; place-items: center;
}
.vtab-x svg { width: 10px; height: 10px; }
.vtab-x:hover { background: var(--fill-2); color: var(--text); }
.vtab.deletable:is(:hover, :focus-within) .vtab-x:not([hidden]) { display: grid; }
.vtab.deletable:is(:hover, :focus-within) .dot { display: none; }
.vtab.deletable:is(:hover, :focus-within) .vtab-btn { justify-content: flex-start; padding-left: 9px; }
.add { width: 24px; height: 24px; }
.add svg { width: 14px; height: 14px; }
.top.confirm-row { gap: 6px; font-size: 12px; }
.top .confirm-text span { color: var(--text-2); }
.btn.danger { background: var(--danger); color: #fff; }
.btn.danger:hover:not(:disabled) { background: var(--danger); filter: brightness(1.08); }

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
`;var He="design-tweaker-root";function he(){let e=document.createElement(He);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=ge;let o=a("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function ze(e,t,n,o){let r=new Map,i=a("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let s of n){let l=a("button",{type:"button",role:"tab",id:A("tab"),onclick:()=>o(s.id)},...s.content);r.set(s.id,l),i.appendChild(l)}return i.addEventListener("keydown",s=>{let l=[...r.keys()],d=l.findIndex(f=>r.get(f)===i.getRootNode().activeElement);if(d<0)return;let c=-1;s.key==="ArrowRight"?c=(d+1)%l.length:s.key==="ArrowLeft"?c=(d-1+l.length)%l.length:s.key==="Home"?c=0:s.key==="End"&&(c=l.length-1),!(c<0)&&(s.preventDefault(),o(l[c]),r.get(l[c]).focus())}),{el:i,buttons:r,select(s){for(let[l,d]of r){let c=l===s;d.setAttribute("aria-selected",String(c)),d.tabIndex=c?0:-1}}}}function me(e){let t=a("span",{class:"badge",hidden:!0});return{button:a("button",{type:"button",class:"launcher",onclick:e},T(S.sliders),t),badge:t}}function be(e,t,n){let o=!0,r=(s,l)=>{o=s,t.hidden=!s,e.hidden=s,l&&(s?n():e).focus()},i=s=>{s.altKey&&s.shiftKey&&!s.ctrlKey&&!s.metaKey&&s.code==="KeyT"&&(s.preventDefault(),r(!o,!0))};return window.addEventListener("keydown",i),{set:r,isExpanded:()=>o,dispose:()=>window.removeEventListener("keydown",i)}}function xe(e){let{host:t,root:n}=he(),o=e.config,r="controls",i=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>B.set(!1,!0)},T(S.minimise)),s=fe(e,i),l=a("span",{class:"count",hidden:!0}),d=ze("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",l]},{id:"suggestions",content:["Suggestions"]}],g=>{r=g,U()}),c=de(o.tokens,{set:(g,k)=>e.set(g,k),commit:()=>e.commit()}),f={controls:c.el,checks:a("div",{class:"empty",text:"Design checks arrive in milestone M3."}),suggestions:a("div",{class:"empty",text:"Suggestions arrive in milestone M4."})};for(let g of Object.keys(f)){let k=d.buttons.get(g),w=f[g];w.id=A("tabpanel"),w.setAttribute("role","tabpanel"),w.setAttribute("aria-labelledby",k.id),w.tabIndex=-1,k.setAttribute("aria-controls",w.id)}let b=a("div",{class:"body"},...Object.values(f)),x=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",h=a("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${x}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},T(S.undo)),M=a("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${x}${x==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},T(S.redo)),I=a("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>m(!0)},T(S.resetAll)),E=a("button",{type:"button",class:"btn primary copy",disabled:!0}),j=a("div",{class:"footer-row"},h,M,I,a("span",{class:"spacer"}),E),p=a("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>m(!1,!0)}),u=a("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},a("span",{class:"confirm-text",text:"Reset this version to the original?"}),p,a("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),m(!1,!0)}}));u.addEventListener("keydown",g=>{g.key==="Escape"&&(g.stopPropagation(),m(!1,!0))});let v=a("div",{class:"note",hidden:!0},T(S.info),"Showing the original design. Pick a version to edit."),V=a("footer",{class:"footer"},j,u,v),y=!1;function m(g,k=!1){y=g,U(),g?p.focus():k&&(I.disabled?h:I).focus()}let $=a("section",{class:"win","aria-label":"Design Tweaker"},s.row,s.confirmRow,d.el,b,V);$.addEventListener("keydown",g=>{if(s.shortcut(g)){g.preventDefault();return}if(!(g.metaKey||g.ctrlKey)||g.altKey||g.code!=="KeyZ")return;let k=g.composedPath()[0];k instanceof HTMLInputElement&&k.type==="text"||(g.preventDefault(),g.shiftKey?e.redo():e.undo())});let N=me(()=>B.set(!0,!0));n.append(N.button,$);let B=be(N.button,$,()=>i);B.set(!0,!1);function U(){let g=e.getState(),k=g.active==="original",w=e.changes().length;s.render(),d.select(r);for(let ee of Object.keys(f))f[ee].hidden=ee!==r;c.update(e.shownValues(),g.defaults,k),(k||w===0)&&(y=!1),j.hidden=k||y,u.hidden=k||!y,v.hidden=!k,h.disabled=!e.canUndo(),M.disabled=!e.canRedo(),I.disabled=w===0,E.textContent=w===0?"Copy changes":`Copy ${w} change${w===1?"":"s"}`,N.badge.hidden=w===0,N.badge.textContent=String(w),N.button.setAttribute("aria-label",`Open Design Tweaker${w?` (${w} unsaved change${w===1?"":"s"})`:""}`)}let ke=e.subscribe(U);return U(),{destroy(){ke(),B.dispose(),t.remove()}}}function ve(e){let{host:t,root:n}=he(),o=a("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>s.set(!1,!0)},T(S.minimise)),r=a("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},a("div",{class:"top"},a("strong",{text:"Design Tweaker"}),a("span",{class:"spacer"}),o),a("div",{class:"body error-msg",role:"alert"},a("strong",{text:"The tweak config couldn't be loaded."}),a("code",{text:e}),a("span",{text:"Fix tweak.config.json and reload the page."}))),i=me(()=>s.set(!0,!0));i.badge.hidden=!1,i.badge.classList.add("error"),i.badge.textContent="!",i.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(i.button,r);let s=be(i.button,r,()=>o);return s.set(!0,!1),{destroy(){s.dispose(),t.remove()}}}var Z="[design-tweaker]",R=null;function we(e){if(R){console.warn(`${Z} mount() called twice; ignoring.`);return}let t=re(e);if(!t.ok){console.error(`${Z} ${t.error}`),R={panel:ve(t.error)};return}let{config:n,warnings:o}=t;for(let d of o)console.warn(`${Z} ${d}`);let r=getComputedStyle(document.documentElement);for(let d of ie(n,c=>r.getPropertyValue(c)))console.warn(`${Z} Config out of date: ${d}`);let i=new X(n),s=new W,l=i.subscribe(()=>s.write(le(n,i.shownValues(),i.getState().defaults)));R={panel:xe(i),writer:s,stop:l}}function Pe(){R&&(R.stop?.(),R.writer?.remove(),R.panel.destroy(),R=null)}window.TweakPanel={mount:we,unmount:Pe};function ye(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&we(e.textContent??"")}document.body?ye():document.addEventListener("DOMContentLoaded",ye,{once:!0});})();
