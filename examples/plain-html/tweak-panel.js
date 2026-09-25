/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function I(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function A(e,t,n){return Math.min(n,Math.max(t,e))}var pe=/^#[0-9a-f]{6}$/i,Je=/^#[0-9a-f]{3}$/i;function j(e){return typeof e=="string"&&pe.test(e)}function ee(e){let t=e.trim();return pe.test(t)?t.toLowerCase():Je.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var U=["Typography","Spacing","Layout","Colour"],fe=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],le=["px","rem","ch"],ge=["html","react-vite","nextjs"];var Ge=/^--[A-Za-z0-9_-]+$/,te=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),K=e=>typeof e=="number"&&Number.isFinite(e),P=e=>typeof e=="string"&&e.length>0;function he(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(h){return{ok:!1,error:`Config is not valid JSON: ${h.message}`}}if(!te(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=h=>n.push(h),i="default";P(t.id)?i=t.id:o('Config has no "id"; using "default" as the storage key.');let r="html";ge.includes(t.framework)?r=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let s=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let a="";P(t.tokensFile)?a=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let d=[],c=new Set;t.tokens.forEach((h,b)=>{let m=_e(h,b,o);if(m){if(m.var==="--font-heading"||m.var==="--font-body"){o(`Token ${m.var} skipped: fonts are not adjustable in v1.`);return}if(c.has(m.var)){o(`Token ${m.var} skipped: duplicate variable.`);return}c.add(m.var),d.push(m)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let u=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let h=new Map(d.map(b=>[b.var,b]));t.suggestions.forEach((b,m)=>{let T=We(b,m,h,o);T&&u.push(T)})}return{ok:!0,config:{version:1,id:i,framework:r,tailwind:s,tokensFile:a,tokens:d,suggestions:u},warnings:n}}function _e(e,t,n){let o=`Token #${t+1}`;if(!te(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!Ge.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let i=e.var;if(!U.includes(e.group))return n(`Token ${i} skipped: "group" must be one of ${U.join(", ")}.`),null;let r=P(e.label)?e.label:i;P(e.label)||n(`Token ${i} has no "label"; using the variable name.`);let s;e.role!==void 0&&(fe.includes(e.role)?s=e.role:n(`Token ${i}: unknown role ${JSON.stringify(e.role)} ignored.`));let a={var:i,label:r,group:e.group,...s?{role:s}:{}};if(e.type==="color")return j(e.default)?{...a,type:"color",default:e.default.toLowerCase()}:(n(`Token ${i} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${i} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!K(e.default)||!K(e.min)||!K(e.max)||!K(e.step))return n(`Token ${i} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${i} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${i} skipped: step must be greater than 0.`),null;let d=e.default;(d<e.min||d>e.max)&&(d=A(d,e.min,e.max),n(`Token ${i}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${I(d)}.`));let c={default:d,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...a,type:"number",...c}:le.includes(e.unit)?{...a,type:"size",unit:e.unit,...c}:(n(`Token ${i} skipped: size "unit" must be one of ${le.join(", ")}.`),null)}function We(e,t,n,o){if(!te(e)||!P(e.id)||!P(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let i=`Suggestion "${e.id}"`,r=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${i}: "fontPair" is not supported in v1 and is ignored.`);let s=te(e.changes)?e.changes:{},a={};for(let[d,c]of Object.entries(s)){let u=n.get(d);if(!u)return o(`${i} skipped: unknown token ${d}.`),null;if(u.type==="color"){if(!j(c))return o(`${i} skipped: ${d} must be 6-digit hex (got ${JSON.stringify(c)}).`),null;a[d]=c.toLowerCase()}else{if(!K(c))return o(`${i} skipped: ${d} must be a number (got ${JSON.stringify(c)}).`),null;let h=A(c,u.min,u.max);h!==c&&o(`${i}: ${d} value ${c} is outside [${u.min}, ${u.max}]; clamped to ${I(h)}.`),a[d]=h}}return Object.keys(a).length===0?(o(`${i} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:r,changes:a}}function me(e,t){let n=[];for(let o of e.tokens){let i=t(o.var).trim();i===""?n.push(`${o.var} is in the config but not declared on :root.`):Ze(o,i)||n.push(`${o.var}: config default is ${Xe(o)} but the page has ${i}.`)}return n}function Xe(e){return e.type==="color"?e.default:e.type==="size"?I(e.default)+e.unit:I(e.default)}function Ze(e,t){if(e.type==="color")return ee(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function ne(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function z(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!R(t[o],n[o]))}function R(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function B(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>R(e[o],t[o]))}var be="design-tweaker-overrides";function de(e,t){if(e.type==="color")return String(t);let n=I(Number(t));return e.type==="size"?n+e.unit:n}function xe(e,t,n){let o=[];for(let i of z(e,t,n)){let r=e.tokens.find(s=>s.var===i);o.push(`  ${i}: ${de(r,t[i])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var oe=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(be),this.el||(this.el=this.doc.createElement("style"),this.el.id=be)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var Ye=100,J=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return B(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>Ye&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){B(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!B(t,this.committed)}canRedo(t){return this.future.length>0&&B(t,this.committed)}get current(){return this.committed}get size(){return this.past.length}};var G=["A","B","C"],ie=class{constructor(t,n){this.listeners=new Set;this.histories=new Map;this.config=t;let o=ne(t),i=n?.versions??{A:{...o}};this.state={defaults:o,versions:i,active:n?.active??"A"};for(let r of this.versionIds())this.histories.set(r,new J(i[r]))}committedVersions(){let t={};for(let n of this.versionIds())t[n]=this.histories.get(n).current;return t}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}changes(){return this.changesFor(this.shownValues())}changesFor(t){return z(this.config,t,this.state.defaults)}versionIds(){return G.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<G.length}createVersion(){let t=G.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new J(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let i=this.state.active;if(i===t){let r=n.indexOf(t);i=n[r-1]??n[r+1]}this.update({versions:o,active:i})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([i,r])=>o[i]===r)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var qe=["controls","checks","suggestions"],we=e=>`design-tweaker:v1:${e.id}`,ve={expanded:!0,tab:"controls",active:"A"};function Qe(e,t){let n=ne(e),o=_(t)?t:{},i=_(o.baseDefaults)?o.baseDefaults:{},r=_(o.versions)?o.versions:{},s={};for(let u of G)_(r[u])&&(s[u]={});Object.keys(s).length||(s.A={});for(let u of e.tokens){let h=u.var,b=n[h],m=h in i,L=m&&!R(i[h],b)&&!Object.keys(s).some(v=>R(ye(u,r[v][h]),b));for(let v of Object.keys(s)){let E=ye(u,r[v]?.[h]);s[v][h]=!m||L||E===void 0?b:E}}let a=_(o.ui)?o.ui:{},d=Object.keys(s),c=a.active==="original"||d.includes(a.active)?a.active:"A";return c!=="original"&&!s[c]&&(c=d[0]),{baseDefaults:n,versions:s,ui:{expanded:typeof a.expanded=="boolean"?a.expanded:ve.expanded,tab:qe.includes(a.tab)?a.tab:ve.tab,active:c}}}function ye(e,t){if(e.type==="color")return j(t)?t.toLowerCase():void 0;if(!(typeof t!="number"||!Number.isFinite(t)))return A(t,e.min,e.max)}function _(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ke(e){let t=null;try{let o=localStorage.getItem(we(e));t=o?JSON.parse(o):null}catch{t=null}let n=Qe(e,t);return Te(e,n),n}function Te(e,t){try{localStorage.setItem(we(e),JSON.stringify(t))}catch{}}function Ce(e,t=300){let n,o="",i=null,r=()=>{if(clearTimeout(n),n=void 0,!i)return;let s=JSON.stringify(i);s!==o&&(o=s,Te(e,i)),i=null};return{schedule(s){i=s,clearTimeout(n),n=setTimeout(r,t)},flush:r}}function Se(e,t,n,o){let i=["```design-tweaks","Apply these design tweaks (design-tweaker v1)",`version: ${t}`,`tokens-file: ${e.tokensFile}`];for(let r of z(e,n,o)){let s=e.tokens.find(a=>a.var===r);i.push(`${r}: ${de(s,n[r])};`)}return i.push("```"),i.join(`
`)}async function Ve(e,t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),"clipboard"}catch{}let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",t.appendChild(n);try{return n.select(),document.execCommand("copy")?"fallback":"failed"}catch{return"failed"}finally{n.remove()}}var et=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function l(e,t=null,...n){let o=document.createElement(e);if(t)for(let[i,r]of Object.entries(t))r==null||r===!1||(i==="class"?o.className=String(r):i==="text"?o.textContent=String(r):i.startsWith("on")&&typeof r=="function"?o.addEventListener(i.slice(2).toLowerCase(),r):et.has(i)?o[i]=r:o.setAttribute(i,r===!0?"":String(r)));return tt(o,n),o}function tt(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function S(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var nt=0,H=e=>`dt-${e}-${++nt}`;var N=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,V={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:N(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:N(1.6,'<path d="M4 8h8"/>'),plus:N(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:N(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:N(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:N(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:N(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function $e(e,t){let n=[],o=l("div");for(let i of U){let r=e.filter(a=>a.group===i);if(!r.length)continue;let s=l("div",{class:"rows"});for(let a of r){let d=a.type==="color"?it(a,t):ot(a,t);n.push(d),s.appendChild(d.el)}o.appendChild(l("details",{class:"group",open:!0},l("summary",null,S(V.chevron),i),s))}return{el:o,update(i,r,s){for(let a of n)a.update(i,r,s)}}}function Ie(e,t,n){let o=t.type==="color"?t.default:I(t.default)+(t.type==="size"?t.unit:"");return l("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},S(V.reset))}function ot(e,t){let n=H("range"),o=e.type==="size"?e.unit:"",i=e.type==="size"&&e.unit==="rem"?l("span",{class:"sub","aria-hidden":"true"}):null,r=l("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(r.value)),onchange:()=>t.commit()}),s=l("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:u=>{u.key==="Enter"&&s.blur(),u.key==="Escape"&&(s.value=c,s.blur())},onblur:()=>{let u=parseFloat(s.value);if(Number.isNaN(u)){s.value=c;return}t.set(e.var,A(Math.round(u*1e4)/1e4,e.min,e.max)),t.commit(),s.value=c}}),a=Ie(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),d=l("div",{class:"ctl"},l("div",{class:"ctl-head"},l("label",{for:n,text:e.label}),i,a,l("div",{class:"num"},s,o?l("span",{text:o,"aria-hidden":"true"}):null)),r),c="";return{el:d,update(u,h,b){let m=Number(u[e.var]);c=I(m),r.value!==String(m)&&(r.value=String(m)),r.style.setProperty("--p",(m-e.min)/(e.max-e.min)*100+"%"),Ee(s)||(s.value=c),i&&(i.textContent=I(m*16)+"px"),Me(d,a,!R(u[e.var],h[e.var])&&!b),r.disabled=s.disabled=b}}}function it(e,t){let n=H("hex"),o=l("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),i=l("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:d=>{d.key==="Enter"&&i.blur(),d.key==="Escape"&&(i.value=a,i.blur())},onblur:()=>{let d=i.value.trim(),c=ee(d.startsWith("#")?d:"#"+d);c&&c!==a&&(t.set(e.var,c),t.commit()),i.value=c??a}}),r=Ie(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),s=l("div",{class:"colour"},l("label",{for:n,text:e.label}),r,o,i),a="";return{el:s,update(d,c,u){a=String(d[e.var]),o.value!==a&&(o.value=a),Ee(i)||(i.value=a),Me(s,r,!R(d[e.var],c[e.var])&&!u),o.disabled=i.disabled=u}}}function Ee(e){return e.getRootNode().activeElement===e}function Me(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function Re(e,t){let n=l("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=l("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let p=e.createVersion();p&&v(p)}},S(V.plus)),i=l("div",{class:"top"},n,o,l("span",{class:"spacer"}),t),r=null,s=l("span",{class:"confirm-text"}),a=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>h()}),d=l("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let p=r;h(!1),e.deleteVersion(p),v(e.getState().active)}}),c=l("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},s,a,d);c.addEventListener("keydown",p=>{p.key==="Escape"&&(p.stopPropagation(),h())});function u(p){let f=e.changesFor(e.getState().versions[p]).length;r=p,s.replaceChildren(l("strong",{text:`Delete Version ${p}?`})," ",l("span",{text:f?`Its ${f} change${f===1?"":"s"} will be lost.`:"It has no changes."})),i.hidden=!0,c.hidden=!1,a.focus()}function h(p=!0){let f=r;r=null,i.hidden=!1,c.hidden=!0,p&&f&&v(f)}let b=new Map,m=new Map,T=new Map,L="";function v(p){b.get(p)?.focus()}function E(p){b.clear(),m.clear(),T.clear(),n.replaceChildren(...p.map(f=>{let y=l("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(f),...f==="original"?{}:{"aria-keyshortcuts":"Delete"}},f==="original"?"Original":f);if(b.set(f,y),f==="original")return y;let $=l("span",{class:"dot","aria-hidden":"true"});y.appendChild($),m.set(f,$);let C=l("button",{type:"button",class:"vtab-x","aria-label":`Delete Version ${f}`,tabIndex:-1,onclick:x=>{x.stopPropagation(),u(f)}},S(V.close));return T.set(f,C),l("span",{class:"vtab"},y,C)}))}return n.addEventListener("keydown",p=>{let f=[...b.keys()],y=n.getRootNode().activeElement,$=f.findIndex(M=>b.get(M)===y);if($<0)return;let C=f[$];if((p.key==="Delete"||p.key==="Backspace")&&C!=="original"&&e.versionIds().length>1){p.preventDefault(),u(C);return}let x=-1;p.key==="ArrowRight"?x=($+1)%f.length:p.key==="ArrowLeft"?x=($-1+f.length)%f.length:p.key==="Home"?x=0:p.key==="End"&&(x=f.length-1),!(x<0)&&(p.preventDefault(),e.view(f[x]),v(f[x]))}),{row:i,confirmRow:c,shortcut(p){if(!p.altKey||!p.shiftKey||p.metaKey||p.ctrlKey)return!1;let f=/^Digit([0-3])$/.exec(p.code);if(!f)return!1;let y=f[1]==="0"?"original":["A","B","C"][Number(f[1])-1];return y!=="original"&&!e.getState().versions[y]?!1:(e.view(y),v(y),!0)},render(){let p=e.getState(),f=["original",...e.versionIds()],y=f.join();y!==L&&(E(f),L=y);let $=f.length>2;for(let[C,x]of b){let M=C===p.active;x.setAttribute("aria-selected",String(M)),x.tabIndex=M?0:-1}for(let[C,x]of m)x.hidden=e.changesFor(p.versions[C]).length===0;for(let[C,x]of T){let M=$&&C===p.active;x.hidden=!M,x.parentElement.classList.toggle("deletable",M)}o.hidden=!e.canCreateVersion(),r&&!p.versions[r]&&h(!1)}}}var Oe=`
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
.toast {
  position: absolute; left: 50%; bottom: 56px; transform: translateX(-50%); background: var(--tip-bg); color: var(--tip-text);
  padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; white-space: nowrap;
  box-shadow: 0 4px 16px rgb(0 0 0 / .2); pointer-events: none; opacity: 0; transition: opacity .15s;
}
.toast.show { opacity: 1; }
.manual {
  position: absolute; inset: 0; z-index: 5; background: var(--bg); border-radius: 14px; padding: 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.manual-head { display: flex; align-items: center; justify-content: space-between; }
.manual p { margin: 0; color: var(--text-2); font-size: 12px; }
.manual-text {
  flex: 1; resize: none; border: 0; border-radius: 8px; padding: 8px; background: var(--fill); color: var(--text);
  font: 11.5px/1.45 ui-monospace, "SF Mono", Menlo, monospace; outline: none;
}
.manual-text:focus { box-shadow: 0 0 0 2px var(--accent); }
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
`;var rt="design-tweaker-root";function Le(){let e=document.createElement(rt);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=Oe;let o=l("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function st(e,t,n,o){let i=new Map,r=l("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let s of n){let a=l("button",{type:"button",role:"tab",id:H("tab"),onclick:()=>o(s.id)},...s.content);i.set(s.id,a),r.appendChild(a)}return r.addEventListener("keydown",s=>{let a=[...i.keys()],d=a.findIndex(u=>i.get(u)===r.getRootNode().activeElement);if(d<0)return;let c=-1;s.key==="ArrowRight"?c=(d+1)%a.length:s.key==="ArrowLeft"?c=(d-1+a.length)%a.length:s.key==="Home"?c=0:s.key==="End"&&(c=a.length-1),!(c<0)&&(s.preventDefault(),o(a[c]),i.get(a[c]).focus())}),{el:r,buttons:i,select(s){for(let[a,d]of i){let c=a===s;d.setAttribute("aria-selected",String(c)),d.tabIndex=c?0:-1}}}}function Ae(e){let t=l("span",{class:"badge",hidden:!0});return{button:l("button",{type:"button",class:"launcher",onclick:e},S(V.sliders),t),badge:t}}function Ne(e,t,n,o){let i=!0,r=(a,d)=>{i=a,t.hidden=!a,e.hidden=a,d&&(a?n():e).focus(),o?.(a)},s=a=>{a.altKey&&a.shiftKey&&!a.ctrlKey&&!a.metaKey&&a.code==="KeyT"&&(a.preventDefault(),r(!i,!0))};return window.addEventListener("keydown",s),{set:r,isExpanded:()=>i,dispose:()=>window.removeEventListener("keydown",s)}}function Pe(e,t){let{host:n,shadow:o,root:i}=Le(),r=e.config,s=t.ui.tab,a=t.ui.expanded,d=()=>t.onUiChange({expanded:a,tab:s}),c=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>q.set(!1,!0)},S(V.minimise)),u=Re(e,c),h=l("span",{class:"count",hidden:!0}),b=st("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",h]},{id:"suggestions",content:["Suggestions"]}],g=>{s=g,d(),Q()}),m=$e(r.tokens,{set:(g,w)=>e.set(g,w),commit:()=>e.commit()}),T={controls:m.el,checks:l("div",{class:"empty",text:"Design checks arrive in milestone M3."}),suggestions:l("div",{class:"empty",text:"Suggestions arrive in milestone M4."})};for(let g of Object.keys(T)){let w=b.buttons.get(g),k=T[g];k.id=H("tabpanel"),k.setAttribute("role","tabpanel"),k.setAttribute("aria-labelledby",w.id),k.tabIndex=-1,w.setAttribute("aria-controls",k.id)}let L=l("div",{class:"body"},...Object.values(T)),v=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",E=l("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${v}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},S(V.undo)),p=l("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${v}${v==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},S(V.redo)),f=l("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>X(!0)},S(V.resetAll)),y=l("button",{type:"button",class:"btn primary copy",onclick:()=>Ke()}),$=l("div",{class:"footer-row"},E,p,f,l("span",{class:"spacer"}),y),C=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>X(!1,!0)}),x=l("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},l("span",{class:"confirm-text",text:"Reset this version to the original?"}),C,l("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),X(!1,!0)}}));x.addEventListener("keydown",g=>{g.key==="Escape"&&(g.stopPropagation(),X(!1,!0))});let M=l("div",{class:"note",hidden:!0},S(V.info),"Showing the original design. Pick a version to edit."),Fe=l("footer",{class:"footer"},$,x,M),W=!1;function X(g,w=!1){W=g,Q(),g?C.focus():w&&(f.disabled?E:f).focus()}let D=l("div",{class:"toast",role:"status","aria-live":"polite"}),se;function je(g){D.textContent=g,D.classList.add("show"),clearTimeout(se),se=setTimeout(()=>{D.classList.remove("show"),D.textContent=""},3e3)}let Z=l("textarea",{class:"manual-text",readonly:!0,"aria-label":"Changes to copy",spellcheck:"false"}),Ue=l("button",{type:"button",class:"btn",text:"Close",onclick:()=>ce()}),Y=l("div",{class:"manual",hidden:!0,role:"dialog","aria-label":"Copy this manually"},l("div",{class:"manual-head"},l("strong",{text:"Copy this manually"}),Ue),l("p",{text:"Copying to the clipboard didn't work. Select the text below, copy it, and paste it into Claude Code."}),Z);Y.addEventListener("keydown",g=>{g.key==="Escape"&&(g.stopPropagation(),ce())});function ce(){Y.hidden=!0,y.focus()}async function Ke(){e.commit();let g=e.getState();if(g.active==="original"||e.changes().length===0)return;let w=Se(r,g.active,e.shownValues(),g.defaults);await Ve(w,o)==="failed"?(Z.value=w,Y.hidden=!1,Z.focus(),Z.select()):je("Copied \u2014 paste it into Claude Code")}let ae=l("section",{class:"win","aria-label":"Design Tweaker"},u.row,u.confirmRow,b.el,L,Fe,Y,D);ae.addEventListener("keydown",g=>{if(u.shortcut(g)){g.preventDefault();return}if(!(g.metaKey||g.ctrlKey)||g.altKey||g.code!=="KeyZ")return;let w=g.composedPath()[0];w instanceof HTMLInputElement&&w.type==="text"||(g.preventDefault(),g.shiftKey?e.redo():e.undo())});let F=Ae(()=>q.set(!0,!0));i.append(F.button,ae);let q=Ne(F.button,ae,()=>c,g=>{a=g,d()});q.set(a,!1);function Q(){let g=e.getState(),w=g.active==="original",k=e.changes().length;u.render(),b.select(s);for(let ue of Object.keys(T))T[ue].hidden=ue!==s;m.update(e.shownValues(),g.defaults,w),(w||k===0)&&(W=!1),$.hidden=w||W,x.hidden=w||!W,M.hidden=!w,E.disabled=!e.canUndo(),p.disabled=!e.canRedo(),f.disabled=k===0,y.textContent=k===0?"Copy changes":`Copy ${k} change${k===1?"":"s"}`,y.disabled=k===0,F.badge.hidden=k===0,F.badge.textContent=String(k),F.button.setAttribute("aria-label",`Open Design Tweaker${k?` (${k} unsaved change${k===1?"":"s"})`:""}`)}let Be=e.subscribe(Q);return Q(),{destroy(){Be(),clearTimeout(se),q.dispose(),n.remove()}}}function ze(e){let{host:t,root:n}=Le(),o=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>s.set(!1,!0)},S(V.minimise)),i=l("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},l("div",{class:"top"},l("strong",{text:"Design Tweaker"}),l("span",{class:"spacer"}),o),l("div",{class:"body error-msg",role:"alert"},l("strong",{text:"The tweak config couldn't be loaded."}),l("code",{text:e}),l("span",{text:"Fix tweak.config.json and reload the page."}))),r=Ae(()=>s.set(!0,!0));r.badge.hidden=!1,r.badge.classList.add("error"),r.badge.textContent="!",r.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(r.button,i);let s=Ne(r.button,i,()=>o);return s.set(!0,!1),{destroy(){s.dispose(),t.remove()}}}var re="[design-tweaker]",O=null;function De(e){if(O){console.warn(`${re} mount() called twice; ignoring.`);return}let t=he(e);if(!t.ok){console.error(`${re} ${t.error}`),O={panel:ze(t.error)};return}let{config:n,warnings:o}=t;for(let v of o)console.warn(`${re} ${v}`);let i=getComputedStyle(document.documentElement);for(let v of me(n,E=>i.getPropertyValue(E)))console.warn(`${re} Config out of date: ${v}`);let r=ke(n),s=new ie(n,{versions:r.versions,active:r.ui.active}),a=r.ui,d=Ce(n),c=()=>d.schedule({baseDefaults:s.getState().defaults,versions:s.committedVersions(),ui:{...a,active:s.getState().active}}),u=new oe,h=()=>u.write(xe(n,s.shownValues(),s.getState().defaults)),b=s.subscribe(h),m=s.subscribe(c);h(),O={panel:Pe(s,{ui:a,onUiChange(v){a={...a,...v},c()}}),writer:u,stop:()=>{b(),m(),d.flush()}}}function at(){O&&(O.stop?.(),O.writer?.remove(),O.panel.destroy(),O=null)}window.TweakPanel={mount:De,unmount:at};function He(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&De(e.textContent??"")}document.body?He():document.addEventListener("DOMContentLoaded",He,{once:!0});})();
