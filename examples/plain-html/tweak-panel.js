/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function $(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function N(e,t,n){return Math.min(n,Math.max(t,e))}var ye=/^#[0-9a-f]{6}$/i,dt=/^#[0-9a-f]{3}$/i;function _(e){return typeof e=="string"&&ye.test(e)}function ie(e){let t=e.trim();return ye.test(t)?t.toLowerCase():dt.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var J=["Typography","Spacing","Layout","Colour"],we=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],fe=["px","rem","ch"],ke=["html","react-vite","nextjs"];var ut=/^--[A-Za-z0-9_-]+$/,re=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),X=e=>typeof e=="number"&&Number.isFinite(e),F=e=>typeof e=="string"&&e.length>0;function Te(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(h){return{ok:!1,error:`Config is not valid JSON: ${h.message}`}}if(!re(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=h=>n.push(h),i="default";F(t.id)?i=t.id:o('Config has no "id"; using "default" as the storage key.');let s="html";ke.includes(t.framework)?s=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let r=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let a="";F(t.tokensFile)?a=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let c=[],d=new Set;t.tokens.forEach((h,u)=>{let g=pt(h,u,o);if(g){if(g.var==="--font-heading"||g.var==="--font-body"){o(`Token ${g.var} skipped: fonts are not adjustable in v1.`);return}if(d.has(g.var)){o(`Token ${g.var} skipped: duplicate variable.`);return}d.add(g.var),c.push(g)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let p=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let h=new Map(c.map(u=>[u.var,u]));t.suggestions.forEach((u,g)=>{let w=ft(u,g,h,o);w&&p.push(w)})}return{ok:!0,config:{version:1,id:i,framework:s,tailwind:r,tokensFile:a,tokens:c,suggestions:p},warnings:n}}function pt(e,t,n){let o=`Token #${t+1}`;if(!re(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!ut.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let i=e.var;if(!J.includes(e.group))return n(`Token ${i} skipped: "group" must be one of ${J.join(", ")}.`),null;let s=F(e.label)?e.label:i;F(e.label)||n(`Token ${i} has no "label"; using the variable name.`);let r;e.role!==void 0&&(we.includes(e.role)?r=e.role:n(`Token ${i}: unknown role ${JSON.stringify(e.role)} ignored.`));let a={var:i,label:s,group:e.group,...r?{role:r}:{}};if(e.type==="color")return _(e.default)?{...a,type:"color",default:e.default.toLowerCase()}:(n(`Token ${i} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${i} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!X(e.default)||!X(e.min)||!X(e.max)||!X(e.step))return n(`Token ${i} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${i} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${i} skipped: step must be greater than 0.`),null;let c=e.default;(c<e.min||c>e.max)&&(c=N(c,e.min,e.max),n(`Token ${i}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${$(c)}.`));let d={default:c,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...a,type:"number",...d}:fe.includes(e.unit)?{...a,type:"size",unit:e.unit,...d}:(n(`Token ${i} skipped: size "unit" must be one of ${fe.join(", ")}.`),null)}function ft(e,t,n,o){if(!re(e)||!F(e.id)||!F(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let i=`Suggestion "${e.id}"`,s=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${i}: "fontPair" is not supported in v1 and is ignored.`);let r=re(e.changes)?e.changes:{},a={};for(let[c,d]of Object.entries(r)){let p=n.get(c);if(!p)return o(`${i} skipped: unknown token ${c}.`),null;if(p.type==="color"){if(!_(d))return o(`${i} skipped: ${c} must be 6-digit hex (got ${JSON.stringify(d)}).`),null;a[c]=d.toLowerCase()}else{if(!X(d))return o(`${i} skipped: ${c} must be a number (got ${JSON.stringify(d)}).`),null;let h=N(d,p.min,p.max);h!==d&&o(`${i}: ${c} value ${d} is outside [${p.min}, ${p.max}]; clamped to ${$(h)}.`),a[c]=h}}return Object.keys(a).length===0?(o(`${i} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:s,changes:a}}function Ce(e,t){let n=[];for(let o of e.tokens){let i=t(o.var).trim();i===""?n.push(`${o.var} is in the config but not declared on :root.`):ht(o,i)||n.push(`${o.var}: config default is ${gt(o)} but the page has ${i}.`)}return n}function gt(e){return e.type==="color"?e.default:e.type==="size"?$(e.default)+e.unit:$(e.default)}function ht(e,t){if(e.type==="color")return ie(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function se(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function B(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!O(t[o],n[o]))}function O(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function W(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>O(e[o],t[o]))}var Se="design-tweaker-overrides";function ge(e,t){if(e.type==="color")return String(t);let n=$(Number(t));return e.type==="size"?n+e.unit:n}function Ve(e,t,n){let o=[];for(let i of B(e,t,n)){let s=e.tokens.find(r=>r.var===i);o.push(`  ${i}: ${ge(s,t[i])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var ae=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(Se),this.el||(this.el=this.doc.createElement("style"),this.el.id=Se)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var mt=100,Z=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return W(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>mt&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){W(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!W(t,this.committed)}canRedo(t){return this.future.length>0&&W(t,this.committed)}get current(){return this.committed}get size(){return this.past.length}};var Y=["A","B","C"],le=class{constructor(t,n){this.listeners=new Set;this.histories=new Map;this.config=t;let o=se(t),i=n?.versions??{A:{...o}};this.state={defaults:o,versions:i,active:n?.active??"A",preview:null};for(let s of this.versionIds())this.histories.set(s,new Z(i[s]))}committedVersions(){let t={};for(let n of this.versionIds())t[n]=this.histories.get(n).current;return t}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}pageValues(){let{preview:t}=this.state;return t?{...this.shownValues(),...t.changes}:this.shownValues()}setPreview(t){t&&!this.editable()||t!==this.state.preview&&this.update({preview:t})}changes(){return this.changesFor(this.shownValues())}changesFor(t){return B(this.config,t,this.state.defaults)}versionIds(){return Y.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<Y.length}createVersion(){let t=Y.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new Z(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let i=this.state.active;if(i===t){let s=n.indexOf(t);i=n[s-1]??n[s+1]}this.update({versions:o,active:i})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([i,s])=>o[i]===s)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,preview:null,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var bt=["controls","checks","suggestions"],Ie=e=>`design-tweaker:v1:${e.id}`,$e={expanded:!0,tab:"controls",active:"A"};function xt(e,t){let n=se(e),o=q(t)?t:{},i=q(o.baseDefaults)?o.baseDefaults:{},s=q(o.versions)?o.versions:{},r={};for(let p of Y)q(s[p])&&(r[p]={});Object.keys(r).length||(r.A={});for(let p of e.tokens){let h=p.var,u=n[h],g=h in i,k=g&&!O(i[h],u)&&!Object.keys(r).some(y=>O(Me(p,s[y][h]),u));for(let y of Object.keys(r)){let C=Me(p,s[y]?.[h]);r[y][h]=!g||k||C===void 0?u:C}}let a=q(o.ui)?o.ui:{},c=Object.keys(r),d=a.active==="original"||c.includes(a.active)?a.active:"A";return d!=="original"&&!r[d]&&(d=c[0]),{baseDefaults:n,versions:r,ui:{expanded:typeof a.expanded=="boolean"?a.expanded:$e.expanded,tab:bt.includes(a.tab)?a.tab:$e.tab,active:d}}}function Me(e,t){if(e.type==="color")return _(t)?t.toLowerCase():void 0;if(!(typeof t!="number"||!Number.isFinite(t)))return N(t,e.min,e.max)}function q(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Re(e){let t=null;try{let o=localStorage.getItem(Ie(e));t=o?JSON.parse(o):null}catch{t=null}let n=xt(e,t);return Ee(e,n),n}function Ee(e,t){try{localStorage.setItem(Ie(e),JSON.stringify(t))}catch{}}function Le(e,t=300){let n,o="",i=null,s=()=>{if(clearTimeout(n),n=void 0,!i)return;let r=JSON.stringify(i);r!==o&&(o=r,Ee(e,i)),i=null};return{schedule(r){i=r,clearTimeout(n),n=setTimeout(s,t)},flush:s}}function Oe(e,t,n,o){let i=["```design-tweaks","Apply these design tweaks (design-tweaker v1)",`version: ${t}`,`tokens-file: ${e.tokensFile}`];for(let s of B(e,n,o)){let r=e.tokens.find(a=>a.var===s);i.push(`${s}: ${ge(r,n[s])};`)}return i.push("```"),i.join(`
`)}async function Ne(e,t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),"clipboard"}catch{}let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",t.appendChild(n);try{return n.select(),document.execCommand("copy")?"fallback":"failed"}catch{return"failed"}finally{n.remove()}}function ze(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function vt([e,t,n]){let o=i=>Math.round(Math.min(1,Math.max(0,i))*255).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(n)}`}var He=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,yt=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function Ae(e){let[t,n,o]=ze(e).map(He);return .2126*t+.7152*n+.0722*o}function E(e,t){let n=Ae(e),o=Ae(t);return(Math.max(n,o)+.05)/(Math.min(n,o)+.05)}function Fe(e){let[t,n,o]=ze(e).map(He),i=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*o),s=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*o),r=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*o),a=.2104542553*i+.793617785*s-.0040720468*r,c=1.9779984951*i-2.428592205*s+.4505937099*r,d=.0259040371*i+.7827717662*s-.808675766*r,p=Math.hypot(c,d),h=p<1e-6?0:(Math.atan2(d,c)*180/Math.PI+360)%360;return{l:a,c:p,h}}function he({l:e,c:t,h:n}){let o=n*Math.PI/180,i=t*Math.cos(o),s=t*Math.sin(o),r=(e+.3963377774*i+.2158037573*s)**3,a=(e-.1055613458*i-.0638541728*s)**3,c=(e-.0894841775*i-1.291485548*s)**3;return[4.0767416621*r-3.3077115913*a+.2309699292*c,-1.2684380046*r+2.6097574011*a-.3413193965*c,-.0041960863*r-.7034186147*a+1.707614701*c]}var Pe=e=>e.every(t=>t>=-1e-6&&t<=1+1e-6);function Be(e){let t=Math.min(1,Math.max(0,e.l)),n=he({...e,l:t});if(!Pe(n)){let o=0,i=e.c;for(let s=0;s<24;s++){let r=(o+i)/2;Pe(he({l:t,c:r,h:e.h}))?o=r:i=r}n=he({l:t,c:o,h:e.h})}return vt(n.map(o=>yt(Math.min(1,Math.max(0,o)))))}function wt(e){return E(e,"#000000")>=E(e,"#ffffff")}var A=.1;function P(e,t,n,o=0){if(E(e,t)>=n+o)return e;let i=Fe(e),s=wt(t),r=s?0:1,a=p=>Be({...i,l:p});if(E(a(r),t)<n+o)return o>0?P(e,t,n):s?"#000000":"#ffffff";n+=o;let c=i.l,d=r;for(let p=0;p<40;p++){let h=(c+d)/2;E(a(h),t)>=n?d=h:c=h}return a(d)}function je(e,t,n,o=0){let i=d=>Math.min(...t.map(p=>E(d,p))),s=n+o;if(i(e)>=s)return e;let r=Fe(e),a=d=>Be({...r,l:d}),c=(d,p)=>{let u=r.l;for(let g=1;g<=200;g++){let w=r.l+(d-r.l)*g/200;if(i(a(w))>=p){let k=u,y=w;for(let C=0;C<30;C++){let m=(k+y)/2;i(a(m))>=p?y=m:k=m}return y}u=w}return null};for(let d of o>0?[s,n]:[s]){let p=[c(0,d),c(1,d)].filter(h=>h!==null);if(p.length){let h=p.reduce((u,g)=>Math.abs(u-r.l)<=Math.abs(g-r.l)?u:g);return a(h)}}return null}function De(e,t){let n=new Map;for(let f of e.tokens)f.role&&!n.has(f.role)&&n.set(f.role,f);let o=f=>{let x=n.get(f);return x?.type==="color"?{token:x,value:String(t[x.var])}:void 0},i=f=>{let x=n.get(f);if(x?.type!=="size"||x.unit==="ch")return;let T=Number(t[x.var]);return{token:x,px:x.unit==="rem"?T*16:T}},s=f=>{let x=n.get(f);return x&&x.type!=="color"?{token:x,value:Number(t[x.var])}:void 0},r=(f,x)=>f.type==="color"?{}:{[f.var]:N(x,f.min,f.max)},a=f=>`${f.toFixed(1)}:1`,c=[],d=o("body-text"),p=o("muted-text"),h=o("background"),u=o("surface"),g=o("accent"),w=o("accent-text"),k=d&&h&&u?je(d.value,[h.value,u.value],4.5,A):void 0;if(d&&h){let f=E(d.value,h.value);f<4.5&&c.push({id:"C1",severity:"warning",message:`Body text is hard to read on this background (${a(f)}, needs 4.5:1).`,fix:{[d.token.var]:k??P(d.value,h.value,4.5,A)}})}if(p&&h){let f=E(p.value,h.value);f<4.5&&c.push({id:"C2",severity:"warning",message:`Muted text is hard to read on this background (${a(f)}, needs 4.5:1).`,fix:{[p.token.var]:P(p.value,h.value,4.5,A)}})}if(g&&h){let f=E(g.value,h.value);if(f<3){let x=P(g.value,h.value,3,A);if(w&&E(w.value,x)<4.5){let T=P(x,w.value,4.5,A);E(T,h.value)>=3&&E(T,w.value)>=4.5&&(x=T)}c.push({id:"C3",severity:"warning",message:`The accent colour is hard to see on this background (${a(f)}, needs 3:1).`,fix:{[g.token.var]:x}})}}if(w&&g){let f=E(w.value,g.value);if(f<4.5){let x=E("#ffffff",g.value)>=E("#000000",g.value)?"#ffffff":"#000000";c.push({id:"C4",severity:"warning",message:`Text on the accent colour is hard to read (${a(f)}, needs 4.5:1).`,fix:{[w.token.var]:x}})}}if(d&&u){let f=E(d.value,u.value);if(f<4.5){let x=!!h&&!k;c.push({id:"C5",severity:"warning",message:`Body text is hard to read on cards and panels (${a(f)}, needs 4.5:1).`+(x?" No text colour works on both the page and the cards, so Fix adjusts the card colour.":""),fix:x?{[u.token.var]:P(u.value,d.value,4.5,A)}:{[d.token.var]:k??P(d.value,u.value,4.5,A)}})}}let y=n.get("measure");if(y?.type==="size"&&y.unit==="ch"){let f=Number(t[y.var]);f>75?c.push({id:"C6",severity:"warning",message:`Lines of text are too long to read comfortably (${$(f)}ch; aim for 45\u201375ch).`,fix:r(y,68)}):f<45&&c.push({id:"C7",severity:"info",message:`Lines of text are very short (${$(f)}ch), which makes reading choppy.`,fix:r(y,60)})}let C=i("body-size");C&&C.px<16&&c.push({id:"C8",severity:"warning",message:`Body text is small (${$(C.px)}px). 16px or more is easier to read.`,fix:r(C.token,C.token.type==="size"&&C.token.unit==="rem"?1:16)});let m=s("body-line-height");m&&m.value<1.4?c.push({id:"C9",severity:"warning",message:`Body line height is tight (${$(m.value)}). Lines may feel cramped.`,fix:r(m.token,1.5)}):m&&m.value>2&&c.push({id:"C10",severity:"info",message:`Body line height is loose (${$(m.value)}). Paragraphs may feel disconnected.`,fix:r(m.token,1.7)});let b=["h1-size","h2-size","h3-size","body-size"].map(f=>i(f)).filter(f=>!!f);for(let f=0;f<b.length-1;f++){let x=b[f],T=b[f+1],S=x.token.label,L=T.token.label;x.px<=T.px?c.push({id:`C11:${x.token.var}`,severity:"warning",message:x.px===T.px?`${S} and ${L} are the same size (${$(x.px)}px).`:`${L} (${$(T.px)}px) is larger than ${S} (${$(x.px)}px).`}):x.px<T.px*1.1&&c.push({id:`C12:${x.token.var}`,severity:"info",message:`${S} and ${L} are very close in size (${$(x.px)}px and ${$(T.px)}px).`})}return c}var kt=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function l(e,t=null,...n){let o=document.createElement(e);if(t)for(let[i,s]of Object.entries(t))s==null||s===!1||(i==="class"?o.className=String(s):i==="text"?o.textContent=String(s):i.startsWith("on")&&typeof s=="function"?o.addEventListener(i.slice(2).toLowerCase(),s):kt.has(i)?o[i]=s:o.setAttribute(i,s===!0?"":String(s)));return Tt(o,n),o}function Tt(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function R(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var Ct=0,j=e=>`dt-${e}-${++Ct}`;var z=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,I={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:z(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:z(1.6,'<path d="M4 8h8"/>'),plus:z(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:z(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:z(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:z(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:z(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),warning:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7.13 2.5a1 1 0 0 1 1.74 0l5.6 9.75A1 1 0 0 1 13.6 13.75H2.4a1 1 0 0 1-.87-1.5z"/><path d="M8 6v3.2M8 11.2v.01" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',check:z(2,'<path d="M3.5 8.5l3 3 6-7"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function Ke(e){let t=l("ul",{class:"list checks"}),n=l("div",{class:"empty",text:"No issues found."});return{el:l("div",null,n,t),update(i,s){n.hidden=i.length>0,t.hidden=i.length===0,t.replaceChildren(...i.map(r=>{let a=R(r.severity==="warning"?I.warning:I.info),c=r.fix&&!s?l("button",{type:"button",class:"btn",text:"Fix","aria-label":`Fix: ${r.message}`,onclick:()=>e(r.fix)}):null;return l("li",{class:`check ${r.severity}`,"data-id":r.id},l("span",{class:"ic",role:"img","aria-label":r.severity==="warning"?"Warning":"Info"},a),l("p",{text:r.message}),c)}))}}}function Ue(e,t){let n=[],o=l("div");for(let i of J){let s=e.filter(a=>a.group===i);if(!s.length)continue;let r=l("div",{class:"rows"});for(let a of s){let c=a.type==="color"?Vt(a,t):St(a,t);n.push(c),r.appendChild(c.el)}o.appendChild(l("details",{class:"group",open:!0},l("summary",null,R(I.chevron),i),r))}return{el:o,update(i,s,r){for(let a of n)a.update(i,s,r)}}}function Ge(e,t,n){let o=t.type==="color"?t.default:$(t.default)+(t.type==="size"?t.unit:"");return l("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},R(I.reset))}function St(e,t){let n=j("range"),o=e.type==="size"?e.unit:"",i=e.type==="size"&&e.unit==="rem"?l("span",{class:"sub","aria-hidden":"true"}):null,s=l("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(s.value)),onchange:()=>t.commit()}),r=l("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:p=>{p.key==="Enter"&&r.blur(),p.key==="Escape"&&(r.value=d,r.blur())},onblur:()=>{let p=parseFloat(r.value);if(Number.isNaN(p)){r.value=d;return}t.set(e.var,N(Math.round(p*1e4)/1e4,e.min,e.max)),t.commit(),r.value=d}}),a=Ge(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),c=l("div",{class:"ctl"},l("div",{class:"ctl-head"},l("label",{for:n,text:e.label}),i,a,l("div",{class:"num"},r,o?l("span",{text:o,"aria-hidden":"true"}):null)),s),d="";return{el:c,update(p,h,u){let g=Number(p[e.var]);d=$(g),s.value!==String(g)&&(s.value=String(g)),s.style.setProperty("--p",(g-e.min)/(e.max-e.min)*100+"%"),_e(r)||(r.value=d),i&&(i.textContent=$(g*16)+"px"),Je(c,a,!O(p[e.var],h[e.var])&&!u),s.disabled=r.disabled=u}}}function Vt(e,t){let n=j("hex"),o=l("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),i=l("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:c=>{c.key==="Enter"&&i.blur(),c.key==="Escape"&&(i.value=a,i.blur())},onblur:()=>{let c=i.value.trim(),d=ie(c.startsWith("#")?c:"#"+c);d&&d!==a&&(t.set(e.var,d),t.commit()),i.value=d??a}}),s=Ge(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),r=l("div",{class:"colour"},l("label",{for:n,text:e.label}),s,o,i),a="";return{el:r,update(c,d,p){a=String(c[e.var]),o.value!==a&&(o.value=a),_e(i)||(i.value=a),Je(r,s,!O(c[e.var],d[e.var])&&!p),o.disabled=i.disabled=p}}}function _e(e){return e.getRootNode().activeElement===e}function Je(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function Xe(e){let{config:t}=e,n=new Map(t.tokens.map(u=>[u.var,u.label])),o=new Map,i=new Map,s=l("ul",{class:"list suggestions"}),r=l("div",{class:"empty"}),a=l("div",null,r,s),c=(u,g)=>Object.entries(u.changes).every(([w,k])=>O(g[w],k));function d(u,g){let w=e.getState().versions[g],k={};for(let y of Object.keys(u.changes))k[y]=w[y];o.has(g)||o.set(g,new Map),o.get(g).set(u.id,k),e.apply(u.changes)}function p(u,g){let w=o.get(g)?.get(u.id)??$t(e.getState().defaults,Object.keys(u.changes));o.get(g)?.delete(u.id),e.apply(w)}function h(u,g,w,k){let y=`dt-sug-${u.id}`,C;return w?C=l("button",{type:"button",class:"applied-tag","aria-label":`Applied: ${u.title}. Click to undo it.`,"data-tip":"Click to undo","data-tip-pos":"start",onclick:()=>p(u,g)},R(I.check),"Applied"):k?C=l("span",{class:"actions"},l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>e.setPreview(null)}),l("button",{type:"button",class:"btn primary",text:"Apply",onclick:()=>d(u,g)})):C=l("button",{type:"button",class:"btn",text:"Preview","aria-describedby":y,onclick:()=>e.setPreview({id:u.id,changes:u.changes})}),l("li",{class:`sug${k?" previewing":""}${w?" applied":""}`,"data-id":u.id},l("h3",{id:y,text:u.title}),u.reason?l("p",{text:u.reason}):null,l("div",{class:"what","aria-label":"Changes"},...Object.keys(u.changes).map(m=>l("span",{class:"chip",text:n.get(m)??m}))),l("div",{class:"sug-actions"},C))}return{el:a,copied(u){let g=e.getState().versions[u],w=i.get(u)??new Set;for(let k of t.suggestions)c(k,g)&&w.add(k.id);i.set(u,w)},render(){let u=e.getState();if(u.active==="original"){s.replaceChildren(),s.hidden=!0,r.hidden=!1,r.textContent="Suggestions are tried on a version. Pick a version to preview them.";return}let g=u.active,w=u.versions[g],k=i.get(g)??new Set,y=t.suggestions.filter(b=>k.has(b.id)?c(b,w)?!1:(k.delete(b.id),!0):!0);s.hidden=y.length===0,r.hidden=y.length>0,r.textContent=t.suggestions.length?"No suggestions left for this version.":"No suggestions for this design.";let m=a.getRootNode().activeElement?.closest?.(".sug")?.getAttribute("data-id");s.replaceChildren(...y.map(b=>h(b,g,c(b,w),u.preview?.id===b.id))),m&&s.querySelector(`.sug[data-id="${CSS.escape(m)}"] button:last-of-type`)?.focus()}}}function $t(e,t){let n={};for(let o of t)n[o]=e[o];return n}function We(e,t){let n=l("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=l("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let m=e.createVersion();m&&y(m)}},R(I.plus)),i=l("div",{class:"top"},n,o,l("span",{class:"spacer"}),t),s=null,r=l("span",{class:"confirm-text"}),a=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>h()}),c=l("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let m=s;h(!1),e.deleteVersion(m),y(e.getState().active)}}),d=l("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},r,a,c);d.addEventListener("keydown",m=>{m.key==="Escape"&&(m.stopPropagation(),h())});function p(m){let b=e.changesFor(e.getState().versions[m]).length;s=m,r.replaceChildren(l("strong",{text:`Delete Version ${m}?`})," ",l("span",{text:b?`Its ${b} change${b===1?"":"s"} will be lost.`:"It has no changes."})),i.hidden=!0,d.hidden=!1,a.focus()}function h(m=!0){let b=s;s=null,i.hidden=!1,d.hidden=!0,m&&b&&y(b)}let u=new Map,g=new Map,w=new Map,k="";function y(m){u.get(m)?.focus()}function C(m){u.clear(),g.clear(),w.clear(),n.replaceChildren(...m.map(b=>{let f=l("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(b),...b==="original"?{}:{"aria-keyshortcuts":"Delete"}},b==="original"?"Original":b);if(u.set(b,f),b==="original")return f;let x=l("span",{class:"dot","aria-hidden":"true"});f.appendChild(x),g.set(b,x);let T=l("button",{type:"button",class:"vtab-x","aria-label":`Delete Version ${b}`,tabIndex:-1,onclick:S=>{S.stopPropagation(),p(b)}},R(I.close));return w.set(b,T),l("span",{class:"vtab"},f,T)}))}return n.addEventListener("keydown",m=>{let b=[...u.keys()],f=n.getRootNode().activeElement,x=b.findIndex(L=>u.get(L)===f);if(x<0)return;let T=b[x];if((m.key==="Delete"||m.key==="Backspace")&&T!=="original"&&e.versionIds().length>1){m.preventDefault(),p(T);return}let S=-1;m.key==="ArrowRight"?S=(x+1)%b.length:m.key==="ArrowLeft"?S=(x-1+b.length)%b.length:m.key==="Home"?S=0:m.key==="End"&&(S=b.length-1),!(S<0)&&(m.preventDefault(),e.view(b[S]),y(b[S]))}),{row:i,confirmRow:d,shortcut(m){if(!m.altKey||!m.shiftKey||m.metaKey||m.ctrlKey)return!1;let b=/^Digit([0-3])$/.exec(m.code);if(!b)return!1;let f=b[1]==="0"?"original":["A","B","C"][Number(b[1])-1];return f!=="original"&&!e.getState().versions[f]?!1:(e.view(f),y(f),!0)},render(){let m=e.getState(),b=["original",...e.versionIds()],f=b.join();f!==k&&(C(b),k=f);let x=b.length>2;for(let[T,S]of u){let L=T===m.active;S.setAttribute("aria-selected",String(L)),S.tabIndex=L?0:-1}for(let[T,S]of g)S.hidden=e.changesFor(m.versions[T]).length===0;for(let[T,S]of w){let L=x&&T===m.active;S.hidden=!L,S.parentElement.classList.toggle("deletable",L)}o.hidden=!e.canCreateVersion(),s&&!m.versions[s]&&h(!1)}}}var Ze=`
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
    --accent: #0a84ff;
    --warn: #ffb340;
    --warn-soft: rgb(255 159 10 / .18);
    --danger: #ff453a;
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
  background: transparent; color: var(--accent); font-size: 12px; font-weight: 500; cursor: pointer;
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
`;var Mt="design-tweaker-root";function Ye(){let e=document.createElement(Mt);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=Ze;let o=l("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function It(e,t,n,o){let i=new Map,s=l("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let r of n){let a=l("button",{type:"button",role:"tab",id:j("tab"),onclick:()=>o(r.id)},...r.content);i.set(r.id,a),s.appendChild(a)}return s.addEventListener("keydown",r=>{let a=[...i.keys()],c=a.findIndex(p=>i.get(p)===s.getRootNode().activeElement);if(c<0)return;let d=-1;r.key==="ArrowRight"?d=(c+1)%a.length:r.key==="ArrowLeft"?d=(c-1+a.length)%a.length:r.key==="Home"?d=0:r.key==="End"&&(d=a.length-1),!(d<0)&&(r.preventDefault(),o(a[d]),i.get(a[d]).focus())}),{el:s,buttons:i,select(r){for(let[a,c]of i){let d=a===r;c.setAttribute("aria-selected",String(d)),c.tabIndex=d?0:-1}}}}function qe(e){let t=l("span",{class:"badge",hidden:!0});return{button:l("button",{type:"button",class:"launcher",onclick:e},R(I.sliders),t),badge:t}}function Qe(e,t,n,o){let i=!0,s=(a,c)=>{i=a,t.hidden=!a,e.hidden=a,c&&(a?n():e).focus(),o?.(a)},r=a=>{a.altKey&&a.shiftKey&&!a.ctrlKey&&!a.metaKey&&a.code==="KeyT"&&(a.preventDefault(),s(!i,!0))};return window.addEventListener("keydown",r),{set:s,isExpanded:()=>i,dispose:()=>window.removeEventListener("keydown",r)}}function et(e,t){let{host:n,shadow:o,root:i}=Ye(),s=e.config,r=t.ui.tab,a=t.ui.expanded,c=()=>t.onUiChange({expanded:a,tab:r}),d=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>oe.set(!1,!0)},R(I.minimise)),p=We(e,d),h=l("span",{class:"count",hidden:!0}),u=It("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",h]},{id:"suggestions",content:["Suggestions"]}],v=>{v!==r&&e.setPreview(null),r=v,c(),U()}),g=Ue(s.tokens,{set:(v,V)=>e.set(v,V),commit:()=>e.commit()}),w=Ke(v=>e.apply(v)),k=Xe(e),y={controls:g.el,checks:w.el,suggestions:k.el};for(let v of Object.keys(y)){let V=u.buttons.get(v),M=y[v];M.id=j("tabpanel"),M.setAttribute("role","tabpanel"),M.setAttribute("aria-labelledby",V.id),M.tabIndex=-1,V.setAttribute("aria-controls",M.id)}let C=l("div",{class:"body"},...Object.values(y)),m=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",b=l("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${m}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},R(I.undo)),f=l("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${m}${m==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},R(I.redo)),x=l("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>ee(!0)},R(I.resetAll)),T=l("button",{type:"button",class:"btn primary copy",onclick:()=>at()}),S=l("div",{class:"footer-row"},b,f,x,l("span",{class:"spacer"}),T),L=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>ee(!1,!0)}),de=l("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},l("span",{class:"confirm-text",text:"Reset this version to the original?"}),L,l("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),ee(!1,!0)}}));de.addEventListener("keydown",v=>{v.key==="Escape"&&(v.stopPropagation(),ee(!1,!0))});let me=l("div",{class:"note",hidden:!0},R(I.info),"Showing the original design. Pick a version to edit."),it=l("footer",{class:"footer"},S,de,me),Q=!1;function ee(v,V=!1){Q=v,U(),v?L.focus():V&&(x.disabled?b:x).focus()}let D=l("div",{class:"toast",role:"status","aria-live":"polite"}),ue;function rt(v){D.textContent=v,D.classList.add("show"),clearTimeout(ue),ue=setTimeout(()=>{D.classList.remove("show"),D.textContent=""},3e3)}let te=l("textarea",{class:"manual-text",readonly:!0,"aria-label":"Changes to copy",spellcheck:"false"}),st=l("button",{type:"button",class:"btn",text:"Close",onclick:()=>be()}),ne=l("div",{class:"manual",hidden:!0,role:"dialog","aria-label":"Copy this manually"},l("div",{class:"manual-head"},l("strong",{text:"Copy this manually"}),st),l("p",{text:"Copying to the clipboard didn't work. Select the text below, copy it, and paste it into Claude Code."}),te);ne.addEventListener("keydown",v=>{v.key==="Escape"&&(v.stopPropagation(),be())});function be(){ne.hidden=!0,T.focus()}async function at(){e.commit();let v=e.getState();if(v.active==="original"||e.changes().length===0)return;let V=Oe(s,v.active,e.shownValues(),v.defaults),M=await Ne(V,o);k.copied(v.active),U(),M==="failed"?(te.value=V,ne.hidden=!1,te.focus(),te.select()):rt("Copied \u2014 paste it into Claude Code")}let pe=l("section",{class:"win","aria-label":"Design Tweaker"},p.row,p.confirmRow,u.el,C,it,ne,D);pe.addEventListener("keydown",v=>{if(p.shortcut(v)){v.preventDefault();return}if(v.key==="Escape"&&e.getState().preview){v.preventDefault(),e.setPreview(null);return}if(!(v.metaKey||v.ctrlKey)||v.altKey||v.code!=="KeyZ")return;let V=v.composedPath()[0];V instanceof HTMLInputElement&&V.type==="text"||(v.preventDefault(),v.shiftKey?e.redo():e.undo())});let K=qe(()=>oe.set(!0,!0));i.append(K.button,pe);let oe=Qe(K.button,pe,()=>d,v=>{a=v,c()});oe.set(a,!1);function U(){let v=e.getState(),V=v.active==="original",M=e.changes().length;p.render(),u.select(r);for(let ve of Object.keys(y))y[ve].hidden=ve!==r;g.update(e.shownValues(),v.defaults,V),k.render(),(V||M===0)&&(Q=!1),S.hidden=V||Q,de.hidden=V||!Q,me.hidden=!V,b.disabled=!e.canUndo(),f.disabled=!e.canRedo(),x.disabled=M===0,T.textContent=M===0?"Copy changes":`Copy ${M} change${M===1?"":"s"}`,T.disabled=M===0,K.badge.hidden=M===0,K.badge.textContent=String(M),K.button.setAttribute("aria-label",`Open Design Tweaker${M?` (${M} unsaved change${M===1?"":"s"})`:""}`)}let G;function xe(){clearTimeout(G),G=void 0;let v=De(s,e.shownValues()),V=v.filter(M=>M.severity==="warning").length;w.update(v,e.getState().active==="original"),h.hidden=V===0,h.textContent=V?String(V):"",h.setAttribute("aria-label",`${V} warning${V===1?"":"s"}`)}let lt=()=>{clearTimeout(G),G=setTimeout(xe,100)},ct=e.subscribe(()=>{U(),lt()});return U(),xe(),{destroy(){ct(),clearTimeout(ue),clearTimeout(G),oe.dispose(),n.remove()}}}function tt(e){let{host:t,root:n}=Ye(),o=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>r.set(!1,!0)},R(I.minimise)),i=l("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},l("div",{class:"top"},l("strong",{text:"Design Tweaker"}),l("span",{class:"spacer"}),o),l("div",{class:"body error-msg",role:"alert"},l("strong",{text:"The tweak config couldn't be loaded."}),l("code",{text:e}),l("span",{text:"Fix tweak.config.json and reload the page."}))),s=qe(()=>r.set(!0,!0));s.badge.hidden=!1,s.badge.classList.add("error"),s.badge.textContent="!",s.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(s.button,i);let r=Qe(s.button,i,()=>o);return r.set(!0,!1),{destroy(){r.dispose(),t.remove()}}}var ce="[design-tweaker]",H=null;function ot(e){if(H){console.warn(`${ce} mount() called twice; ignoring.`);return}let t=Te(e);if(!t.ok){console.error(`${ce} ${t.error}`),H={panel:tt(t.error)};return}let{config:n,warnings:o}=t;for(let y of o)console.warn(`${ce} ${y}`);let i=getComputedStyle(document.documentElement);for(let y of Ce(n,C=>i.getPropertyValue(C)))console.warn(`${ce} Config out of date: ${y}`);let s=Re(n),r=new le(n,{versions:s.versions,active:s.ui.active}),a=s.ui,c=Le(n),d=()=>c.schedule({baseDefaults:r.getState().defaults,versions:r.committedVersions(),ui:{...a,active:r.getState().active}}),p=new ae,h=()=>p.write(Ve(n,r.pageValues(),r.getState().defaults)),u=r.subscribe(h),g=r.subscribe(d);h(),H={panel:et(r,{ui:a,onUiChange(y){a={...a,...y},d()}}),writer:p,stop:()=>{u(),g(),c.flush()}}}function Rt(){H&&(H.stop?.(),H.writer?.remove(),H.panel.destroy(),H=null)}window.TweakPanel={mount:ot,unmount:Rt};function nt(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&ot(e.textContent??"")}document.body?nt():document.addEventListener("DOMContentLoaded",nt,{once:!0});})();
