/* Style Dial panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function S(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function ke(e,t,n,o){let i=t+Math.round((e-t)/o)*o;return O(Math.round(i*1e4)/1e4,t,n)}function O(e,t,n){return Math.min(n,Math.max(t,e))}var we=/^#[0-9a-f]{6}$/i,ut=/^#[0-9a-f]{3}$/i;function K(e){return typeof e=="string"&&we.test(e)}function oe(e){let t=e.trim();return we.test(t)?t.toLowerCase():ut.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var G=["Typography","Spacing","Layout","Colour"],Ce=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],fe=["px","rem","ch"],Te=["html","react-vite","nextjs"];var pt=/^--[A-Za-z0-9_-]+$/,ie=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),_=e=>typeof e=="number"&&Number.isFinite(e),z=e=>typeof e=="string"&&e.length>0;function Se(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(d){return{ok:!1,error:`Config is not valid JSON: ${d.message}`}}if(!ie(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=d=>n.push(d),i="default";z(t.id)?i=t.id:o('Config has no "id"; using "default" as the storage key.');let a="html";Te.includes(t.framework)?a=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let r=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let s="";z(t.tokensFile)?s=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let l=[],p=new Set;t.tokens.forEach((d,k)=>{let g=ft(d,k,o);if(g){if(g.var==="--font-heading"||g.var==="--font-body"){o(`Token ${g.var} skipped: fonts are not adjustable in v1.`);return}if(p.has(g.var)){o(`Token ${g.var} skipped: duplicate variable.`);return}p.add(g.var),l.push(g)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let f=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let d=new Map(l.map(k=>[k.var,k]));t.suggestions.forEach((k,g)=>{let u=gt(k,g,d,o);u&&f.push(u)})}return{ok:!0,config:{version:1,id:i,framework:a,tailwind:r,tokensFile:s,tokens:l,suggestions:f},warnings:n}}function ft(e,t,n){let o=`Token #${t+1}`;if(!ie(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!pt.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let i=e.var;if(!G.includes(e.group))return n(`Token ${i} skipped: "group" must be one of ${G.join(", ")}.`),null;let a=z(e.label)?e.label:i;z(e.label)||n(`Token ${i} has no "label"; using the variable name.`);let r;e.role!==void 0&&(Ce.includes(e.role)?r=e.role:n(`Token ${i}: unknown role ${JSON.stringify(e.role)} ignored.`));let s={var:i,label:a,group:e.group,...r?{role:r}:{}};if(e.type==="color")return K(e.default)?{...s,type:"color",default:e.default.toLowerCase()}:(n(`Token ${i} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${i} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!_(e.default)||!_(e.min)||!_(e.max)||!_(e.step))return n(`Token ${i} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${i} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${i} skipped: step must be greater than 0.`),null;let l=e.default;(l<e.min||l>e.max)&&(l=O(l,e.min,e.max),n(`Token ${i}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${S(l)}.`));let p={default:l,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...s,type:"number",...p}:fe.includes(e.unit)?{...s,type:"size",unit:e.unit,...p}:(n(`Token ${i} skipped: size "unit" must be one of ${fe.join(", ")}.`),null)}function gt(e,t,n,o){if(!ie(e)||!z(e.id)||!z(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let i=`Suggestion "${e.id}"`,a=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${i}: "fontPair" is not supported in v1 and is ignored.`);let r=ie(e.changes)?e.changes:{},s={};for(let[l,p]of Object.entries(r)){let f=n.get(l);if(!f)return o(`${i} skipped: unknown token ${l}.`),null;if(f.type==="color"){if(!K(p))return o(`${i} skipped: ${l} must be 6-digit hex (got ${JSON.stringify(p)}).`),null;s[l]=p.toLowerCase()}else{if(!_(p))return o(`${i} skipped: ${l} must be a number (got ${JSON.stringify(p)}).`),null;let d=O(p,f.min,f.max);d!==p&&o(`${i}: ${l} value ${p} is outside [${f.min}, ${f.max}]; clamped to ${S(d)}.`),s[l]=d}}return Object.keys(s).length===0?(o(`${i} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:a,changes:s}}function Ve(e,t){let n=[];for(let o of e.tokens){let i=t(o.var).trim();i===""?n.push(`${o.var} is in the config but not declared on :root.`):mt(o,i)||n.push(`${o.var}: config default is ${ht(o)} but the page has ${i}.`)}return n}function ht(e){return e.type==="color"?e.default:e.type==="size"?S(e.default)+e.unit:S(e.default)}function mt(e,t){if(e.type==="color")return oe(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function re(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function H(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!E(t[o],n[o]))}function E(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function J(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>E(e[o],t[o]))}var $e="style-dial-overrides";function ge(e,t){if(e.type==="color")return String(t);let n=S(Number(t));return e.type==="size"?n+e.unit:n}function Me(e,t,n){let o=[];for(let i of H(e,t,n)){let a=e.tokens.find(r=>r.var===i);o.push(`  ${i}: ${ge(a,t[i])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var se=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById($e),this.el||(this.el=this.doc.createElement("style"),this.el.id=$e)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var bt=100,X=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return J(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>bt&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){J(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!J(t,this.committed)}canRedo(t){return this.future.length>0&&J(t,this.committed)}get current(){return this.committed}get size(){return this.past.length}};var W=["A","B","C"],ae=class{constructor(t,n){this.listeners=new Set;this.histories=new Map;this.config=t;let o=re(t),i=n?.versions??{A:{...o}};this.state={defaults:o,versions:i,active:n?.active??"A",preview:null};for(let a of this.versionIds())this.histories.set(a,new X(i[a]))}committedVersions(){let t={};for(let n of this.versionIds())t[n]=this.histories.get(n).current;return t}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}pageValues(){let{preview:t}=this.state;return t?{...this.shownValues(),...t.changes}:this.shownValues()}setPreview(t){t&&!this.editable()||t!==this.state.preview&&this.update({preview:t})}changes(){return this.changesFor(this.shownValues())}changesFor(t){return H(this.config,t,this.state.defaults)}versionIds(){return W.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<W.length}createVersion(){let t=W.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new X(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let i=this.state.active;if(i===t){let a=n.indexOf(t);i=n[a-1]??n[a+1]}this.update({versions:o,active:i})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([i,a])=>o[i]===a)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,preview:null,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var xt=["controls","checks","suggestions"],Ee=e=>`style-dial:v1:${e.id}`,Ie={expanded:!0,tab:"controls",active:"A"};function vt(e,t){let n=re(e),o=Y(t)?t:{},i=Y(o.baseDefaults)?o.baseDefaults:{},a=Y(o.versions)?o.versions:{},r={};for(let f of W)Y(a[f])&&(r[f]={});Object.keys(r).length||(r.A={});for(let f of e.tokens){let d=f.var,k=n[d],g=d in i,b=g&&!E(i[d],k)&&!Object.keys(r).some(h=>E(Re(f,a[h][d]),k));for(let h of Object.keys(r)){let v=Re(f,a[h]?.[d]);r[h][d]=!g||b||v===void 0?k:v}}let s=Y(o.ui)?o.ui:{},l=Object.keys(r),p=s.active==="original"||l.includes(s.active)?s.active:"A";return p!=="original"&&!r[p]&&(p=l[0]),{baseDefaults:n,versions:r,ui:{expanded:typeof s.expanded=="boolean"?s.expanded:Ie.expanded,tab:xt.includes(s.tab)?s.tab:Ie.tab,active:p}}}function Re(e,t){if(e.type==="color")return K(t)?t.toLowerCase():void 0;if(!(typeof t!="number"||!Number.isFinite(t)))return O(t,e.min,e.max)}function Y(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Le(e){let t=null;try{let o=localStorage.getItem(Ee(e));t=o?JSON.parse(o):null}catch{t=null}let n=vt(e,t);return Oe(e,n),n}function Oe(e,t){try{localStorage.setItem(Ee(e),JSON.stringify(t))}catch{}}function Ne(e,t=300){let n,o="",i=null,a=()=>{if(clearTimeout(n),n=void 0,!i)return;let r=JSON.stringify(i);r!==o&&(o=r,Oe(e,i)),i=null};return{schedule(r){i=r,clearTimeout(n),n=setTimeout(a,t)},flush:a}}function Ae(e,t,n,o){let i=["```style-tweaks","Apply these style tweaks (style-dial v1)",`version: ${t}`,`tokens-file: ${e.tokensFile}`];for(let a of H(e,n,o)){let r=e.tokens.find(s=>s.var===a);i.push(`${a}: ${ge(r,n[a])};`)}return i.push("```"),i.join(`
`)}async function Pe(e,t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),"clipboard"}catch{}let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",t.appendChild(n);try{return n.select(),document.execCommand("copy")?"fallback":"failed"}catch{return"failed"}finally{n.remove()}}function Fe(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function yt([e,t,n]){let o=i=>Math.round(Math.min(1,Math.max(0,i))*255).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(n)}`}var je=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,kt=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function ze(e){let[t,n,o]=Fe(e).map(je);return .2126*t+.7152*n+.0722*o}function L(e,t){let n=ze(e),o=ze(t);return(Math.max(n,o)+.05)/(Math.min(n,o)+.05)}function Be(e){let[t,n,o]=Fe(e).map(je),i=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*o),a=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*o),r=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*o),s=.2104542553*i+.793617785*a-.0040720468*r,l=1.9779984951*i-2.428592205*a+.4505937099*r,p=.0259040371*i+.7827717662*a-.808675766*r,f=Math.hypot(l,p),d=f<1e-6?0:(Math.atan2(p,l)*180/Math.PI+360)%360;return{l:s,c:f,h:d}}function he({l:e,c:t,h:n}){let o=n*Math.PI/180,i=t*Math.cos(o),a=t*Math.sin(o),r=(e+.3963377774*i+.2158037573*a)**3,s=(e-.1055613458*i-.0638541728*a)**3,l=(e-.0894841775*i-1.291485548*a)**3;return[4.0767416621*r-3.3077115913*s+.2309699292*l,-1.2684380046*r+2.6097574011*s-.3413193965*l,-.0041960863*r-.7034186147*s+1.707614701*l]}var He=e=>e.every(t=>t>=-1e-6&&t<=1+1e-6);function De(e){let t=Math.min(1,Math.max(0,e.l)),n=he({...e,l:t});if(!He(n)){let o=0,i=e.c;for(let a=0;a<24;a++){let r=(o+i)/2;He(he({l:t,c:r,h:e.h}))?o=r:i=r}n=he({l:t,c:o,h:e.h})}return yt(n.map(o=>kt(Math.min(1,Math.max(0,o)))))}function wt(e){return L(e,"#000000")>=L(e,"#ffffff")}var Z=.1;function le(e,t,n,o=0){if(L(e,t)>=n+o)return e;let i=Be(e),a=wt(t),r=a?0:1,s=f=>De({...i,l:f});if(L(s(r),t)<n+o)return o>0?le(e,t,n):a?"#000000":"#ffffff";n+=o;let l=i.l,p=r;for(let f=0;f<40;f++){let d=(l+p)/2;L(s(d),t)>=n?p=d:l=d}return s(p)}function me(e,t,n=0){let o=(s,l)=>t.every(([p,f])=>L(s,p)>=f+l);if(o(e,n))return e;let i=Be(e),a=s=>De({...i,l:s}),r=(s,l)=>{let f=i.l;for(let d=1;d<=200;d++){let k=i.l+(s-i.l)*d/200;if(o(a(k),l)){let g=f,u=k;for(let b=0;b<30;b++){let h=(g+u)/2;o(a(h),l)?u=h:g=h}return u}f=k}return null};for(let s of n>0?[n,0]:[0]){let l=[r(0,s),r(1,s)].filter(p=>p!==null);if(l.length){let p=l.reduce((f,d)=>Math.abs(f-i.l)<=Math.abs(d-i.l)?f:d);return a(p)}}return null}function Ue(e,t){let n=new Map;for(let g of e.tokens)g.role&&!n.has(g.role)&&n.set(g.role,g);let o=g=>{let u=n.get(g);return u?.type==="color"?{token:u,value:String(t[u.var])}:void 0},i=g=>{let u=n.get(g);if(u?.type!=="size"||u.unit==="ch")return;let b=Number(t[u.var]);return{token:u,px:u.unit==="rem"?b*16:b}},a=g=>{let u=n.get(g);return u&&u.type!=="color"?{token:u,value:Number(t[u.var])}:void 0},r=(g,u)=>g.type==="color"?{}:{[g.var]:O(u,g.min,g.max)},s=g=>`${g.toFixed(1)}:1`,l=[];Vt(o,s,l);let p=n.get("measure");if(p?.type==="size"&&p.unit==="ch"){let g=Number(t[p.var]);g>75?l.push({id:"C6",severity:"warning",message:`Lines of text are too long to read comfortably (${S(g)}ch; aim for 45\u201375ch).`,fix:r(p,68)}):g<45&&l.push({id:"C7",severity:"info",message:`Lines of text are very short (${S(g)}ch), which makes reading choppy.`,fix:r(p,60)})}let f=i("body-size");f&&f.px<16&&l.push({id:"C8",severity:"warning",message:`Body text is small (${S(f.px)}px). 16px or more is easier to read.`,fix:r(f.token,f.token.type==="size"&&f.token.unit==="rem"?1:16)});let d=a("body-line-height");d&&d.value<1.4?l.push({id:"C9",severity:"warning",message:`Body line height is tight (${S(d.value)}). Lines may feel cramped.`,fix:r(d.token,1.5)}):d&&d.value>2&&l.push({id:"C10",severity:"info",message:`Body line height is loose (${S(d.value)}). Paragraphs may feel disconnected.`,fix:r(d.token,1.7)});let k=["h1-size","h2-size","h3-size","body-size"].map(g=>i(g)).filter(g=>!!g);for(let g=0;g<k.length-1;g++){let u=k[g],b=k[g+1],h=u.token.label,v=b.token.label;u.px<=b.px?l.push({id:`C11:${u.token.var}`,severity:"warning",message:u.px===b.px?`${h} and ${v} are the same size (${S(u.px)}px).`:`${v} (${S(b.px)}px) is larger than ${h} (${S(u.px)}px).`,fix:Ct(k,g,t)}):u.px<b.px*1.1&&l.push({id:`C12:${u.token.var}`,severity:"info",message:`${h} and ${v} are very close in size (${S(u.px)}px and ${S(b.px)}px).`})}return l}function Ct(e,t,n){let o=d=>d.type!=="color"&&Math.abs(Number(n[d.var])-d.default)>1e-9,i=e[t],a=e[t+1],r=a.token.role!=="body-size"&&!(o(a.token)&&!o(i.token)),s=e.map(d=>d.px),l=d=>e[d].token.role==="body-size",p=(d,k,g)=>{let u=St(e[d].token,k,g);u!==void 0&&(s[d]=u)};if(r)for(let d=t;d<s.length-1&&!(l(d+1)||s[d+1]*1.1<=s[d]);d++)p(d+1,s[d]/1.1,"down");for(let d=s.length-2;d>=0;d--)s[d]<s[d+1]*1.1&&p(d,s[d+1]*1.1,"up");let f={};return e.forEach((d,k)=>{Math.abs(s[k]-d.px)>1e-6&&(f[d.token.var]=Tt(d.token,s[k]))}),Object.keys(f).length?f:void 0}var Tt=(e,t)=>e.type==="size"&&e.unit==="rem"?Math.round(t/16*1e4)/1e4:t;function St(e,t,n){if(e.type!=="size")return;let i=((e.unit==="rem"?t/16:t)-e.min)/e.step,a=e.min+(n==="up"?Math.ceil(i-1e-9):Math.floor(i+1e-9))*e.step,r=ke(O(a,e.min,e.max),e.min,e.max,e.step);return e.unit==="rem"?r*16:r}function Vt(e,t,n){let o=e("body-text"),i=e("muted-text"),a=e("background"),r=e("surface"),s=e("accent"),l=e("accent-text"),p=(b,h)=>b?[[b.value,h]]:[],f=(b,h)=>{let v=[...p(a,h),...p(r,h)];return b!==s||!l?[v]:[[...v,...p(l,4.5)],v,[...p(a,h),...p(l,4.5)]]},d=(b,h)=>{for(let v of f(b,h)){let m=me(b.value,v,Z);if(m)return m}return null},k=()=>{if(!r)return null;let b=[...p(o,4.5),...p(i,4.5),...p(s,3)];return me(r.value,b,Z)},g=(b,h,v,m)=>{if(!h||!a)return;let x=L(h.value,a.value);x>=v||n.push({id:b,severity:"warning",message:`${m} on this background (${t(x)}, needs ${v}:1).`,fix:{[h.token.var]:d(h,v)??le(h.value,a.value,v,Z)}})},u=(b,h,v,m)=>{if(!h||!r)return;let x=L(h.value,r.value);if(x>=v)return;let C=d(h,v),w=!C&&a?k():null;n.push({id:b,severity:"warning",message:`${m} on cards and panels (${t(x)}, needs ${v}:1).`+(w?" No single colour works on both the page and the cards, so Fix adjusts the card colour.":""),fix:w?{[r.token.var]:w}:{[h.token.var]:C??le(h.value,r.value,v,Z)}})};if(g("C1",o,4.5,"Body text is hard to read"),g("C2",i,4.5,"Muted text is hard to read"),g("C3",s,3,"The accent colour is hard to see"),l&&s){let b=L(l.value,s.value);if(b<4.5){let h=L("#ffffff",s.value)>=L("#000000",s.value)?"#ffffff":"#000000";n.push({id:"C4",severity:"warning",message:`Text on the accent colour is hard to read (${t(b)}, needs 4.5:1).`,fix:{[l.token.var]:h}})}}u("C5",o,4.5,"Body text is hard to read"),u("C13",i,4.5,"Muted text is hard to read"),u("C14",s,3,"The accent colour is hard to see")}var $t=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function c(e,t=null,...n){let o=document.createElement(e);if(t)for(let[i,a]of Object.entries(t))a==null||a===!1||(i==="class"?o.className=String(a):i==="text"?o.textContent=String(a):i.startsWith("on")&&typeof a=="function"?o.addEventListener(i.slice(2).toLowerCase(),a):$t.has(i)?o[i]=a:o.setAttribute(i,a===!0?"":String(a)));return Mt(o,n),o}function Mt(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function I(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var It=0,F=e=>`dt-${e}-${++It}`;var A=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,M={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:A(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:A(1.6,'<path d="M4 8h8"/>'),plus:A(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:A(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:A(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:A(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:A(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),warning:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7.13 2.5a1 1 0 0 1 1.74 0l5.6 9.75A1 1 0 0 1 13.6 13.75H2.4a1 1 0 0 1-.87-1.5z"/><path d="M8 6v3.2M8 11.2v.01" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',check:A(2,'<path d="M3.5 8.5l3 3 6-7"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function Ke(e){let t=c("ul",{class:"list checks"}),n=c("div",{class:"empty",text:"No issues found."});return{el:c("div",null,n,t),update(i,a){n.hidden=i.length>0,t.hidden=i.length===0,t.replaceChildren(...i.map(r=>{let s=I(r.severity==="warning"?M.warning:M.info),l=r.fix&&!a?c("button",{type:"button",class:"btn",text:"Fix","aria-label":`Fix: ${r.message}`,onclick:()=>e(r.fix)}):null;return c("li",{class:`check ${r.severity}`,"data-id":r.id},c("span",{class:"ic",role:"img","aria-label":r.severity==="warning"?"Warning":"Info"},s),c("p",{text:r.message}),l)}))}}}function Ge(e,t){let n=[],o=c("div");for(let i of G){let a=e.filter(s=>s.group===i);if(!a.length)continue;let r=c("div",{class:"rows"});for(let s of a){let l=s.type==="color"?Et(s,t):Rt(s,t);n.push(l),r.appendChild(l.el)}o.appendChild(c("details",{class:"group",open:!0},c("summary",null,I(M.chevron),i),r))}return{el:o,update(i,a,r){for(let s of n)s.update(i,a,r)}}}function _e(e,t,n){let o=t.type==="color"?t.default:S(t.default)+(t.type==="size"?t.unit:"");return c("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},I(M.reset))}function Rt(e,t){let n=F("range"),o=e.type==="size"?e.unit:"",i=e.type==="size"&&e.unit==="rem"?c("span",{class:"sub","aria-hidden":"true"}):null,a=c("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(a.value)),onchange:()=>t.commit()}),r=c("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:f=>{f.key==="Enter"&&r.blur(),f.key==="Escape"&&(r.value=p,r.blur())},onblur:()=>{let f=parseFloat(r.value);if(Number.isNaN(f)){r.value=p;return}t.set(e.var,O(Math.round(f*1e4)/1e4,e.min,e.max)),t.commit(),r.value=p}}),s=_e(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),l=c("div",{class:"ctl"},c("div",{class:"ctl-head"},c("label",{for:n,text:e.label}),i,s,c("div",{class:"num"},r,o?c("span",{text:o,"aria-hidden":"true"}):null)),a),p="";return{el:l,update(f,d,k){let g=Number(f[e.var]);p=S(g),a.value!==String(g)&&(a.value=String(g)),a.style.setProperty("--p",(g-e.min)/(e.max-e.min)*100+"%"),Je(r)||(r.value=p),i&&(i.textContent=S(g*16)+"px"),Xe(l,s,!E(f[e.var],d[e.var])&&!k),a.disabled=r.disabled=k}}}function Et(e,t){let n=F("hex"),o=c("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),i=c("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:l=>{l.key==="Enter"&&i.blur(),l.key==="Escape"&&(i.value=s,i.blur())},onblur:()=>{let l=i.value.trim(),p=oe(l.startsWith("#")?l:"#"+l);p&&p!==s&&(t.set(e.var,p),t.commit()),i.value=p??s}}),a=_e(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),r=c("div",{class:"colour"},c("label",{for:n,text:e.label}),a,o,i),s="";return{el:r,update(l,p,f){s=String(l[e.var]),o.value!==s&&(o.value=s),Je(i)||(i.value=s),Xe(r,a,!E(l[e.var],p[e.var])&&!f),o.disabled=i.disabled=f}}}function Je(e){return e.getRootNode().activeElement===e}function Xe(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function We(e){let{config:t}=e,n=new Map(t.tokens.map(u=>[u.var,u.label])),o=new Map,i=new Map,a=c("ul",{class:"list suggestions"}),r=c("div",{class:"empty"}),s=c("div",null,r,a),l=(u,b)=>Object.entries(u.changes).every(([h,v])=>E(b[h],v)),p=new Map(t.tokens.map(u=>[u.var,u])),f=(u,b)=>!l(u,b)&&Object.entries(u.changes).every(([h,v])=>{let m=p.get(h);if(m.type==="color"||typeof v!="number")return E(b[h],v);let x=Number(b[h]);return v>m.default?x>=v:v<m.default?x<=v:E(x,v)});function d(u,b){let h=e.getState().versions[b],v={};for(let m of Object.keys(u.changes))v[m]=h[m];o.has(b)||o.set(b,new Map),o.get(b).set(u.id,v),e.apply(u.changes)}function k(u,b){let h=o.get(b)?.get(u.id)??Lt(e.getState().defaults,Object.keys(u.changes));o.get(b)?.delete(u.id),e.apply(h)}function g(u,b,h,v){let m=`dt-sug-${u.id}`,x;return h?x=c("button",{type:"button",class:"applied-tag","aria-label":`Applied: ${u.title}. Click to undo it.`,"data-tip":"Click to undo","data-tip-pos":"start",onclick:()=>k(u,b)},I(M.check),"Applied"):v?x=c("span",{class:"actions"},c("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>e.setPreview(null)}),c("button",{type:"button",class:"btn primary",text:"Apply",onclick:()=>d(u,b)})):x=c("button",{type:"button",class:"btn",text:"Preview","aria-describedby":m,onclick:()=>e.setPreview({id:u.id,changes:u.changes})}),c("li",{class:`sug${v?" previewing":""}${h?" applied":""}`,"data-id":u.id},c("h3",{id:m,text:u.title}),u.reason?c("p",{text:u.reason}):null,c("div",{class:"what","aria-label":"Changes"},...Object.keys(u.changes).map(C=>c("span",{class:"chip",text:n.get(C)??C}))),c("div",{class:"sug-actions"},x))}return{el:s,copied(u){let b=e.getState().versions[u],h=i.get(u)??new Set;for(let v of t.suggestions)l(v,b)&&h.add(v.id);i.set(u,h)},render(){let u=e.getState();if(u.active==="original"){a.replaceChildren(),a.hidden=!0,r.hidden=!1,r.textContent="Suggestions are tried on a version. Pick a version to preview them.";return}let b=u.active,h=u.versions[b],v=i.get(b)??new Set,m=t.suggestions.filter(w=>f(w,h)?!1:v.has(w.id)?l(w,h)?!1:(v.delete(w.id),!0):!0);a.hidden=m.length===0,r.hidden=m.length>0,r.textContent=t.suggestions.length?"No suggestions left for this version. You've applied or gone past them all.":"No suggestions for this design.";let C=s.getRootNode().activeElement?.closest?.(".sug")?.getAttribute("data-id");a.replaceChildren(...m.map(w=>g(w,b,l(w,h),u.preview?.id===w.id))),C&&a.querySelector(`.sug[data-id="${CSS.escape(C)}"] button:last-of-type`)?.focus()}}}function Lt(e,t){let n={};for(let o of t)n[o]=e[o];return n}function Ye(e,t){let n=c("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=c("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let m=e.createVersion();m&&h(m)}},I(M.plus)),i=c("div",{class:"top"},n,o,c("span",{class:"spacer"}),t),a=null,r=c("span",{class:"confirm-text"}),s=c("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>d()}),l=c("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let m=a;d(!1),e.deleteVersion(m),h(e.getState().active)}}),p=c("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},r,s,l);p.addEventListener("keydown",m=>{m.key==="Escape"&&(m.stopPropagation(),d())});function f(m){let x=e.changesFor(e.getState().versions[m]).length;a=m,r.replaceChildren(c("strong",{text:`Delete Version ${m}?`})," ",c("span",{text:x?`Its ${x} change${x===1?"":"s"} will be lost.`:"It has no changes."})),i.hidden=!0,p.hidden=!1,s.focus()}function d(m=!0){let x=a;a=null,i.hidden=!1,p.hidden=!0,m&&x&&h(x)}let k=new Map,g=new Map,u=new Map,b="";function h(m){k.get(m)?.focus()}function v(m){k.clear(),g.clear(),u.clear(),n.replaceChildren(...m.map(x=>{let C=c("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(x),...x==="original"?{}:{"aria-keyshortcuts":"Delete"}},x==="original"?"Original":x);if(k.set(x,C),x==="original")return C;let w=c("span",{class:"dot","aria-hidden":"true"});C.appendChild(w),g.set(x,w);let R=c("span",{class:"vtab-x","aria-hidden":"true",title:`Delete Version ${x}`,onclick:$=>{$.stopPropagation(),f(x)}},I(M.close));return u.set(x,R),c("span",{class:"vtab",role:"none"},C,R)}))}return n.addEventListener("keydown",m=>{let x=[...k.keys()],C=n.getRootNode().activeElement,w=x.findIndex(N=>k.get(N)===C);if(w<0)return;let R=x[w];if((m.key==="Delete"||m.key==="Backspace")&&R!=="original"&&e.versionIds().length>1){m.preventDefault(),f(R);return}let $=-1;m.key==="ArrowRight"?$=(w+1)%x.length:m.key==="ArrowLeft"?$=(w-1+x.length)%x.length:m.key==="Home"?$=0:m.key==="End"&&($=x.length-1),!($<0)&&(m.preventDefault(),e.view(x[$]),h(x[$]))}),{row:i,confirmRow:p,shortcut(m){if(!m.altKey||!m.shiftKey||m.metaKey||m.ctrlKey)return!1;let x=/^Digit([1-4])$/.exec(m.code);if(!x)return!1;let C=["original","A","B","C"][Number(x[1])-1];return C!=="original"&&!e.getState().versions[C]?!1:(e.view(C),h(C),!0)},render(){let m=e.getState(),x=["original",...e.versionIds()],C=x.join();C!==b&&(v(x),b=C);let w=x.length>2;for(let[R,$]of k){let N=R===m.active;$.setAttribute("aria-selected",String(N)),$.tabIndex=N?0:-1}for(let[R,$]of g)$.hidden=e.changesFor(m.versions[R]).length===0;for(let[R,$]of u){let N=w&&R===m.active;$.hidden=!N,$.parentElement.classList.toggle("deletable",N)}o.hidden=!e.canCreateVersion(),a&&!m.versions[a]&&d(!1)}}}var Ze=`
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
  --accent: #0066d6;       /* fills (buttons, sliders, dots); white text on it \u2265 4.5:1 */
  --accent-ink: #0066d6;   /* blue text on the panel's backgrounds \u2265 4.5:1 */
  --accent-text: #ffffff;
  --warn: #b25000;
  --warn-soft: rgb(255 149 0 / .16);
  --danger: #d70015;
  --info: #0066d6;
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
    --accent: #0071df;
    --accent-ink: #67aaff;
    --warn: #ffb340;
    --warn-soft: rgb(255 159 10 / .18);
    --danger: #d70015;
    --info: #5eb1ff;
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
  border: 0; background: transparent; border-radius: 6px; padding: 3px 9px; min-height: 24px; cursor: pointer; font-size: 12px; font-weight: 500;
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

.list { list-style: none; margin: 0; padding: 8px; display: grid; gap: 6px; }
.check {
  display: grid; grid-template-columns: 18px 1fr auto; gap: 8px; align-items: start; padding: 9px 10px;
  border-radius: 9px; background: var(--control); box-shadow: 0 0 0 .5px var(--stroke);
}
.check p { margin: 0; }
.check .ic { margin-top: 1px; display: block; }
.check.warning .ic { color: var(--warn); }
.check.info .ic { color: var(--info); }
.sug {
  padding: 10px 12px; border-radius: 9px; background: var(--control); box-shadow: 0 0 0 .5px var(--stroke); display: grid; gap: 4px;
}
.sug h3 { margin: 0; font-size: 13px; font-weight: 600; }
.sug p { margin: 0; color: var(--text-2); }
.sug.previewing { box-shadow: 0 0 0 2px var(--accent); }
.what { font-size: 11.5px; color: var(--text-2); display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
.chip { background: var(--fill); border-radius: 4px; padding: 1px 6px; }
.sug-actions { display: flex; margin-top: 6px; }
.sug-actions .actions { display: flex; gap: 6px; }
.applied-tag {
  display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 8px 0 4px; margin-left: -4px; border: 0; border-radius: 6px;
  background: transparent; color: var(--accent-ink); font-size: 12px; font-weight: 500; cursor: pointer;
}
.applied-tag svg { width: 14px; height: 14px; }
.applied-tag:hover { background: var(--fill-2); }
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
`;var Ot="style-dial-root";function qe(){let e=document.createElement(Ot);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=Ze;let o=c("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function Nt(e,t,n,o){let i=new Map,a=c("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let r of n){let s=c("button",{type:"button",role:"tab",id:F("tab"),onclick:()=>o(r.id)},...r.content);i.set(r.id,s),a.appendChild(s)}return a.addEventListener("keydown",r=>{let s=[...i.keys()],l=s.findIndex(f=>i.get(f)===a.getRootNode().activeElement);if(l<0)return;let p=-1;r.key==="ArrowRight"?p=(l+1)%s.length:r.key==="ArrowLeft"?p=(l-1+s.length)%s.length:r.key==="Home"?p=0:r.key==="End"&&(p=s.length-1),!(p<0)&&(r.preventDefault(),o(s[p]),i.get(s[p]).focus())}),{el:a,buttons:i,select(r){for(let[s,l]of i){let p=s===r;l.setAttribute("aria-selected",String(p)),l.tabIndex=p?0:-1}}}}function Qe(e){let t=c("span",{class:"badge",hidden:!0});return{button:c("button",{type:"button",class:"launcher",onclick:e},I(M.sliders),t),badge:t}}function et(e,t,n,o){let i=!0,a=(s,l)=>{i=s,t.hidden=!s,e.hidden=s,l&&(s?n():e).focus(),o?.(s)},r=s=>{s.altKey&&s.shiftKey&&!s.ctrlKey&&!s.metaKey&&s.code==="KeyT"&&(s.preventDefault(),a(!i,!0))};return window.addEventListener("keydown",r),{set:a,isExpanded:()=>i,dispose:()=>window.removeEventListener("keydown",r)}}function tt(e,t){let{host:n,shadow:o,root:i}=qe(),a=e.config,r=t.ui.tab,s=t.ui.expanded,l=()=>t.onUiChange({expanded:s,tab:r}),p=c("button",{type:"button",class:"icon-btn","aria-label":"Minimise Style Dial","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>ne.set(!1,!0)},I(M.minimise)),f=Ye(e,p),d=c("span",{class:"count",hidden:!0}),k=Nt("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",d]},{id:"suggestions",content:["Suggestions"]}],y=>{y!==r&&e.setPreview(null),r=y,l(),D()}),g=Ge(a.tokens,{set:(y,T)=>e.set(y,T),commit:()=>e.commit()}),u=Ke(y=>e.apply(y)),b=We(e),h={controls:g.el,checks:u.el,suggestions:b.el};for(let y of Object.keys(h)){let T=k.buttons.get(y),V=h[y];V.id=F("tabpanel"),V.setAttribute("role","tabpanel"),V.setAttribute("aria-labelledby",T.id),V.tabIndex=-1,T.setAttribute("aria-controls",V.id)}let v=c("div",{class:"body"},...Object.values(h)),m=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",x=c("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${m}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},I(M.undo)),C=c("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${m}${m==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},I(M.redo)),w=c("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>Q(!0)},I(M.resetAll)),R=c("button",{type:"button",class:"btn primary copy",onclick:()=>lt()}),$=c("div",{class:"footer-row"},x,C,w,c("span",{class:"spacer"}),R),N=c("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>Q(!1,!0)}),de=c("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},c("span",{class:"confirm-text",text:"Reset this version to the original?"}),N,c("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),Q(!1,!0)}}));de.addEventListener("keydown",y=>{y.key==="Escape"&&(y.stopPropagation(),Q(!1,!0))});let be=c("div",{class:"note",hidden:!0},I(M.info),"Showing the original design. Pick a version to edit."),rt=c("footer",{class:"footer"},$,de,be),q=!1;function Q(y,T=!1){q=y,D(),y?N.focus():T&&(w.disabled?x:w).focus()}let j=c("div",{class:"toast",role:"status","aria-live":"polite"}),ue;function st(y){j.textContent=y,j.classList.add("show"),clearTimeout(ue),ue=setTimeout(()=>{j.classList.remove("show"),j.textContent=""},3e3)}let ee=c("textarea",{class:"manual-text",readonly:!0,"aria-label":"Changes to copy",spellcheck:"false"}),at=c("button",{type:"button",class:"btn",text:"Close",onclick:()=>xe()}),te=c("div",{class:"manual",hidden:!0,role:"dialog","aria-label":"Copy this manually"},c("div",{class:"manual-head"},c("strong",{text:"Copy this manually"}),at),c("p",{text:"Copying to the clipboard didn't work. Select the text below, copy it, and paste it into Claude Code."}),ee);te.addEventListener("keydown",y=>{y.key==="Escape"&&(y.stopPropagation(),xe())});function xe(){te.hidden=!0,R.focus()}async function lt(){e.commit();let y=e.getState();if(y.active==="original"||e.changes().length===0)return;let T=Ae(a,y.active,e.shownValues(),y.defaults),V=await Pe(T,o);b.copied(y.active),D(),V==="failed"?(ee.value=T,te.hidden=!1,ee.focus(),ee.select()):st("Copied \u2014 paste it into Claude Code")}let pe=c("section",{class:"win","aria-label":"Style Dial"},f.row,f.confirmRow,k.el,v,rt,te,j);pe.addEventListener("keydown",y=>{if(f.shortcut(y)){y.preventDefault();return}if(y.key==="Escape"&&e.getState().preview){y.preventDefault(),e.setPreview(null);return}if(!(y.metaKey||y.ctrlKey)||y.altKey||y.code!=="KeyZ")return;let T=y.composedPath()[0];T instanceof HTMLInputElement&&T.type==="text"||(y.preventDefault(),y.shiftKey?e.redo():e.undo())});let B=Qe(()=>ne.set(!0,!0));i.append(B.button,pe);let ne=et(B.button,pe,()=>p,y=>{s=y,l()});ne.set(s,!1);function D(){let y=e.getState(),T=y.active==="original",V=e.changes().length;f.render(),k.select(r);for(let ye of Object.keys(h))h[ye].hidden=ye!==r;g.update(e.shownValues(),y.defaults,T),b.render(),(T||V===0)&&(q=!1),$.hidden=T||q,de.hidden=T||!q,be.hidden=!T,x.disabled=!e.canUndo(),C.disabled=!e.canRedo(),w.disabled=V===0,R.textContent=V===0?"Copy changes":`Copy ${V} change${V===1?"":"s"}`,R.disabled=V===0,B.badge.hidden=V===0,B.badge.textContent=String(V),B.button.setAttribute("aria-label",`Open Style Dial${V?` (${V} unsaved change${V===1?"":"s"})`:""}`)}let U;function ve(){clearTimeout(U),U=void 0;let y=Ue(a,e.shownValues()),T=y.filter(V=>V.severity==="warning").length;u.update(y,e.getState().active==="original"),d.hidden=T===0,d.textContent=T?String(T):"",d.setAttribute("aria-label",`${T} warning${T===1?"":"s"}`)}let ct=()=>{clearTimeout(U),U=setTimeout(ve,100)},dt=e.subscribe(()=>{D(),ct()});return D(),ve(),{destroy(){dt(),clearTimeout(ue),clearTimeout(U),ne.dispose(),n.remove()}}}function nt(e){let{host:t,root:n}=qe(),o=c("button",{type:"button",class:"icon-btn","aria-label":"Minimise Style Dial","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>r.set(!1,!0)},I(M.minimise)),i=c("section",{class:"win","aria-label":"Style Dial",style:"height:auto;min-height:0"},c("div",{class:"top"},c("strong",{text:"Style Dial"}),c("span",{class:"spacer"}),o),c("div",{class:"body error-msg",role:"alert"},c("strong",{text:"The tweak config couldn't be loaded."}),c("code",{text:e}),c("span",{text:"Fix tweak.config.json and reload the page."}))),a=Qe(()=>r.set(!0,!0));a.badge.hidden=!1,a.badge.classList.add("error"),a.badge.textContent="!",a.button.setAttribute("aria-label","Open Style Dial (config error)"),n.append(a.button,i);let r=et(a.button,i,()=>o);return r.set(!0,!1),{destroy(){r.dispose(),t.remove()}}}var ce="[style-dial]",P=null;function it(e){if(P){console.warn(`${ce} mount() called twice; ignoring.`);return}let t=Se(e);if(!t.ok){console.error(`${ce} ${t.error}`),P={panel:nt(t.error)};return}let{config:n,warnings:o}=t;for(let h of o)console.warn(`${ce} ${h}`);let i=setTimeout(()=>{let h=getComputedStyle(document.documentElement);for(let v of Ve(n,m=>h.getPropertyValue(m)))console.warn(`${ce} Config out of date: ${v}`)},2e3),a=Le(n),r=new ae(n,{versions:a.versions,active:a.ui.active}),s=a.ui,l=Ne(n),p=()=>l.schedule({baseDefaults:r.getState().defaults,versions:r.committedVersions(),ui:{...s,active:r.getState().active}}),f=new se,d=()=>f.write(Me(n,r.pageValues(),r.getState().defaults)),k=r.subscribe(d),g=r.subscribe(p);d(),P={panel:tt(r,{ui:s,onUiChange(h){s={...s,...h},p()}}),writer:f,stop:()=>{clearTimeout(i),k(),g(),l.flush()}}}function At(){P&&(P.stop?.(),P.writer?.remove(),P.panel.destroy(),P=null)}window.TweakPanel={mount:it,unmount:At};function ot(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&it(e.textContent??"")}document.body?ot():document.addEventListener("DOMContentLoaded",ot,{once:!0});})();
