/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function $(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function ye(e,t,n,o){let i=t+Math.round((e-t)/o)*o;return N(Math.round(i*1e4)/1e4,t,n)}function N(e,t,n){return Math.min(n,Math.max(t,e))}var we=/^#[0-9a-f]{6}$/i,ut=/^#[0-9a-f]{3}$/i;function _(e){return typeof e=="string"&&we.test(e)}function ie(e){let t=e.trim();return we.test(t)?t.toLowerCase():ut.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var J=["Typography","Spacing","Layout","Colour"],ke=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],fe=["px","rem","ch"],Te=["html","react-vite","nextjs"];var pt=/^--[A-Za-z0-9_-]+$/,re=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),X=e=>typeof e=="number"&&Number.isFinite(e),F=e=>typeof e=="string"&&e.length>0;function Ce(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(d){return{ok:!1,error:`Config is not valid JSON: ${d.message}`}}if(!re(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=d=>n.push(d),i="default";F(t.id)?i=t.id:o('Config has no "id"; using "default" as the storage key.');let s="html";Te.includes(t.framework)?s=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let r=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let a="";F(t.tokensFile)?a=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let c=[],u=new Set;t.tokens.forEach((d,y)=>{let v=ft(d,y,o);if(v){if(v.var==="--font-heading"||v.var==="--font-body"){o(`Token ${v.var} skipped: fonts are not adjustable in v1.`);return}if(u.has(v.var)){o(`Token ${v.var} skipped: duplicate variable.`);return}u.add(v.var),c.push(v)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let f=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let d=new Map(c.map(y=>[y.var,y]));t.suggestions.forEach((y,v)=>{let h=gt(y,v,d,o);h&&f.push(h)})}return{ok:!0,config:{version:1,id:i,framework:s,tailwind:r,tokensFile:a,tokens:c,suggestions:f},warnings:n}}function ft(e,t,n){let o=`Token #${t+1}`;if(!re(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!pt.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let i=e.var;if(!J.includes(e.group))return n(`Token ${i} skipped: "group" must be one of ${J.join(", ")}.`),null;let s=F(e.label)?e.label:i;F(e.label)||n(`Token ${i} has no "label"; using the variable name.`);let r;e.role!==void 0&&(ke.includes(e.role)?r=e.role:n(`Token ${i}: unknown role ${JSON.stringify(e.role)} ignored.`));let a={var:i,label:s,group:e.group,...r?{role:r}:{}};if(e.type==="color")return _(e.default)?{...a,type:"color",default:e.default.toLowerCase()}:(n(`Token ${i} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${i} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!X(e.default)||!X(e.min)||!X(e.max)||!X(e.step))return n(`Token ${i} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${i} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${i} skipped: step must be greater than 0.`),null;let c=e.default;(c<e.min||c>e.max)&&(c=N(c,e.min,e.max),n(`Token ${i}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${$(c)}.`));let u={default:c,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...a,type:"number",...u}:fe.includes(e.unit)?{...a,type:"size",unit:e.unit,...u}:(n(`Token ${i} skipped: size "unit" must be one of ${fe.join(", ")}.`),null)}function gt(e,t,n,o){if(!re(e)||!F(e.id)||!F(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let i=`Suggestion "${e.id}"`,s=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${i}: "fontPair" is not supported in v1 and is ignored.`);let r=re(e.changes)?e.changes:{},a={};for(let[c,u]of Object.entries(r)){let f=n.get(c);if(!f)return o(`${i} skipped: unknown token ${c}.`),null;if(f.type==="color"){if(!_(u))return o(`${i} skipped: ${c} must be 6-digit hex (got ${JSON.stringify(u)}).`),null;a[c]=u.toLowerCase()}else{if(!X(u))return o(`${i} skipped: ${c} must be a number (got ${JSON.stringify(u)}).`),null;let d=N(u,f.min,f.max);d!==u&&o(`${i}: ${c} value ${u} is outside [${f.min}, ${f.max}]; clamped to ${$(d)}.`),a[c]=d}}return Object.keys(a).length===0?(o(`${i} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:s,changes:a}}function Se(e,t){let n=[];for(let o of e.tokens){let i=t(o.var).trim();i===""?n.push(`${o.var} is in the config but not declared on :root.`):mt(o,i)||n.push(`${o.var}: config default is ${ht(o)} but the page has ${i}.`)}return n}function ht(e){return e.type==="color"?e.default:e.type==="size"?$(e.default)+e.unit:$(e.default)}function mt(e,t){if(e.type==="color")return ie(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function se(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function B(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!O(t[o],n[o]))}function O(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function W(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>O(e[o],t[o]))}var Ve="design-tweaker-overrides";function ge(e,t){if(e.type==="color")return String(t);let n=$(Number(t));return e.type==="size"?n+e.unit:n}function $e(e,t,n){let o=[];for(let i of B(e,t,n)){let s=e.tokens.find(r=>r.var===i);o.push(`  ${i}: ${ge(s,t[i])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var ae=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(Ve),this.el||(this.el=this.doc.createElement("style"),this.el.id=Ve)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var bt=100,Y=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return W(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>bt&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){W(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!W(t,this.committed)}canRedo(t){return this.future.length>0&&W(t,this.committed)}get current(){return this.committed}get size(){return this.past.length}};var Z=["A","B","C"],le=class{constructor(t,n){this.listeners=new Set;this.histories=new Map;this.config=t;let o=se(t),i=n?.versions??{A:{...o}};this.state={defaults:o,versions:i,active:n?.active??"A",preview:null};for(let s of this.versionIds())this.histories.set(s,new Y(i[s]))}committedVersions(){let t={};for(let n of this.versionIds())t[n]=this.histories.get(n).current;return t}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}pageValues(){let{preview:t}=this.state;return t?{...this.shownValues(),...t.changes}:this.shownValues()}setPreview(t){t&&!this.editable()||t!==this.state.preview&&this.update({preview:t})}changes(){return this.changesFor(this.shownValues())}changesFor(t){return B(this.config,t,this.state.defaults)}versionIds(){return Z.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<Z.length}createVersion(){let t=Z.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new Y(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let i=this.state.active;if(i===t){let s=n.indexOf(t);i=n[s-1]??n[s+1]}this.update({versions:o,active:i})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([i,s])=>o[i]===s)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,preview:null,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var xt=["controls","checks","suggestions"],Re=e=>`design-tweaker:v1:${e.id}`,Me={expanded:!0,tab:"controls",active:"A"};function vt(e,t){let n=se(e),o=q(t)?t:{},i=q(o.baseDefaults)?o.baseDefaults:{},s=q(o.versions)?o.versions:{},r={};for(let f of Z)q(s[f])&&(r[f]={});Object.keys(r).length||(r.A={});for(let f of e.tokens){let d=f.var,y=n[d],v=d in i,T=v&&!O(i[d],y)&&!Object.keys(r).some(x=>O(Ie(f,s[x][d]),y));for(let x of Object.keys(r)){let k=Ie(f,s[x]?.[d]);r[x][d]=!v||T||k===void 0?y:k}}let a=q(o.ui)?o.ui:{},c=Object.keys(r),u=a.active==="original"||c.includes(a.active)?a.active:"A";return u!=="original"&&!r[u]&&(u=c[0]),{baseDefaults:n,versions:r,ui:{expanded:typeof a.expanded=="boolean"?a.expanded:Me.expanded,tab:xt.includes(a.tab)?a.tab:Me.tab,active:u}}}function Ie(e,t){if(e.type==="color")return _(t)?t.toLowerCase():void 0;if(!(typeof t!="number"||!Number.isFinite(t)))return N(t,e.min,e.max)}function q(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ee(e){let t=null;try{let o=localStorage.getItem(Re(e));t=o?JSON.parse(o):null}catch{t=null}let n=vt(e,t);return Le(e,n),n}function Le(e,t){try{localStorage.setItem(Re(e),JSON.stringify(t))}catch{}}function Oe(e,t=300){let n,o="",i=null,s=()=>{if(clearTimeout(n),n=void 0,!i)return;let r=JSON.stringify(i);r!==o&&(o=r,Le(e,i)),i=null};return{schedule(r){i=r,clearTimeout(n),n=setTimeout(s,t)},flush:s}}function Ne(e,t,n,o){let i=["```design-tweaks","Apply these design tweaks (design-tweaker v1)",`version: ${t}`,`tokens-file: ${e.tokensFile}`];for(let s of B(e,n,o)){let r=e.tokens.find(a=>a.var===s);i.push(`${s}: ${ge(r,n[s])};`)}return i.push("```"),i.join(`
`)}async function Ae(e,t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),"clipboard"}catch{}let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",t.appendChild(n);try{return n.select(),document.execCommand("copy")?"fallback":"failed"}catch{return"failed"}finally{n.remove()}}function He(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function yt([e,t,n]){let o=i=>Math.round(Math.min(1,Math.max(0,i))*255).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(n)}`}var Fe=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,wt=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function Pe(e){let[t,n,o]=He(e).map(Fe);return .2126*t+.7152*n+.0722*o}function E(e,t){let n=Pe(e),o=Pe(t);return(Math.max(n,o)+.05)/(Math.min(n,o)+.05)}function Be(e){let[t,n,o]=He(e).map(Fe),i=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*o),s=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*o),r=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*o),a=.2104542553*i+.793617785*s-.0040720468*r,c=1.9779984951*i-2.428592205*s+.4505937099*r,u=.0259040371*i+.7827717662*s-.808675766*r,f=Math.hypot(c,u),d=f<1e-6?0:(Math.atan2(u,c)*180/Math.PI+360)%360;return{l:a,c:f,h:d}}function he({l:e,c:t,h:n}){let o=n*Math.PI/180,i=t*Math.cos(o),s=t*Math.sin(o),r=(e+.3963377774*i+.2158037573*s)**3,a=(e-.1055613458*i-.0638541728*s)**3,c=(e-.0894841775*i-1.291485548*s)**3;return[4.0767416621*r-3.3077115913*a+.2309699292*c,-1.2684380046*r+2.6097574011*a-.3413193965*c,-.0041960863*r-.7034186147*a+1.707614701*c]}var ze=e=>e.every(t=>t>=-1e-6&&t<=1+1e-6);function je(e){let t=Math.min(1,Math.max(0,e.l)),n=he({...e,l:t});if(!ze(n)){let o=0,i=e.c;for(let s=0;s<24;s++){let r=(o+i)/2;ze(he({l:t,c:r,h:e.h}))?o=r:i=r}n=he({l:t,c:o,h:e.h})}return yt(n.map(o=>wt(Math.min(1,Math.max(0,o)))))}function kt(e){return E(e,"#000000")>=E(e,"#ffffff")}var A=.1;function P(e,t,n,o=0){if(E(e,t)>=n+o)return e;let i=Be(e),s=kt(t),r=s?0:1,a=f=>je({...i,l:f});if(E(a(r),t)<n+o)return o>0?P(e,t,n):s?"#000000":"#ffffff";n+=o;let c=i.l,u=r;for(let f=0;f<40;f++){let d=(c+u)/2;E(a(d),t)>=n?u=d:c=d}return a(u)}function De(e,t,n,o=0){let i=u=>Math.min(...t.map(f=>E(u,f))),s=n+o;if(i(e)>=s)return e;let r=Be(e),a=u=>je({...r,l:u}),c=(u,f)=>{let y=r.l;for(let v=1;v<=200;v++){let h=r.l+(u-r.l)*v/200;if(i(a(h))>=f){let T=y,x=h;for(let k=0;k<30;k++){let g=(T+x)/2;i(a(g))>=f?x=g:T=g}return x}y=h}return null};for(let u of o>0?[s,n]:[s]){let f=[c(0,u),c(1,u)].filter(d=>d!==null);if(f.length){let d=f.reduce((y,v)=>Math.abs(y-r.l)<=Math.abs(v-r.l)?y:v);return a(d)}}return null}function Ue(e,t){let n=new Map;for(let p of e.tokens)p.role&&!n.has(p.role)&&n.set(p.role,p);let o=p=>{let m=n.get(p);return m?.type==="color"?{token:m,value:String(t[m.var])}:void 0},i=p=>{let m=n.get(p);if(m?.type!=="size"||m.unit==="ch")return;let C=Number(t[m.var]);return{token:m,px:m.unit==="rem"?C*16:C}},s=p=>{let m=n.get(p);return m&&m.type!=="color"?{token:m,value:Number(t[m.var])}:void 0},r=(p,m)=>p.type==="color"?{}:{[p.var]:N(m,p.min,p.max)},a=p=>`${p.toFixed(1)}:1`,c=[],u=o("body-text"),f=o("muted-text"),d=o("background"),y=o("surface"),v=o("accent"),h=o("accent-text"),T=u&&d&&y?De(u.value,[d.value,y.value],4.5,A):void 0;if(u&&d){let p=E(u.value,d.value);p<4.5&&c.push({id:"C1",severity:"warning",message:`Body text is hard to read on this background (${a(p)}, needs 4.5:1).`,fix:{[u.token.var]:T??P(u.value,d.value,4.5,A)}})}if(f&&d){let p=E(f.value,d.value);p<4.5&&c.push({id:"C2",severity:"warning",message:`Muted text is hard to read on this background (${a(p)}, needs 4.5:1).`,fix:{[f.token.var]:P(f.value,d.value,4.5,A)}})}if(v&&d){let p=E(v.value,d.value);if(p<3){let m=P(v.value,d.value,3,A);if(h&&E(h.value,m)<4.5){let C=P(m,h.value,4.5,A);E(C,d.value)>=3&&E(C,h.value)>=4.5&&(m=C)}c.push({id:"C3",severity:"warning",message:`The accent colour is hard to see on this background (${a(p)}, needs 3:1).`,fix:{[v.token.var]:m}})}}if(h&&v){let p=E(h.value,v.value);if(p<4.5){let m=E("#ffffff",v.value)>=E("#000000",v.value)?"#ffffff":"#000000";c.push({id:"C4",severity:"warning",message:`Text on the accent colour is hard to read (${a(p)}, needs 4.5:1).`,fix:{[h.token.var]:m}})}}if(u&&y){let p=E(u.value,y.value);if(p<4.5){let m=!!d&&!T;c.push({id:"C5",severity:"warning",message:`Body text is hard to read on cards and panels (${a(p)}, needs 4.5:1).`+(m?" No text colour works on both the page and the cards, so Fix adjusts the card colour.":""),fix:m?{[y.token.var]:P(y.value,u.value,4.5,A)}:{[u.token.var]:T??P(u.value,y.value,4.5,A)}})}}let x=n.get("measure");if(x?.type==="size"&&x.unit==="ch"){let p=Number(t[x.var]);p>75?c.push({id:"C6",severity:"warning",message:`Lines of text are too long to read comfortably (${$(p)}ch; aim for 45\u201375ch).`,fix:r(x,68)}):p<45&&c.push({id:"C7",severity:"info",message:`Lines of text are very short (${$(p)}ch), which makes reading choppy.`,fix:r(x,60)})}let k=i("body-size");k&&k.px<16&&c.push({id:"C8",severity:"warning",message:`Body text is small (${$(k.px)}px). 16px or more is easier to read.`,fix:r(k.token,k.token.type==="size"&&k.token.unit==="rem"?1:16)});let g=s("body-line-height");g&&g.value<1.4?c.push({id:"C9",severity:"warning",message:`Body line height is tight (${$(g.value)}). Lines may feel cramped.`,fix:r(g.token,1.5)}):g&&g.value>2&&c.push({id:"C10",severity:"info",message:`Body line height is loose (${$(g.value)}). Paragraphs may feel disconnected.`,fix:r(g.token,1.7)});let b=["h1-size","h2-size","h3-size","body-size"].map(p=>i(p)).filter(p=>!!p);for(let p=0;p<b.length-1;p++){let m=b[p],C=b[p+1],S=m.token.label,L=C.token.label;m.px<=C.px?c.push({id:`C11:${m.token.var}`,severity:"warning",message:m.px===C.px?`${S} and ${L} are the same size (${$(m.px)}px).`:`${L} (${$(C.px)}px) is larger than ${S} (${$(m.px)}px).`,fix:Tt(b,p,t)}):m.px<C.px*1.1&&c.push({id:`C12:${m.token.var}`,severity:"info",message:`${S} and ${L} are very close in size (${$(m.px)}px and ${$(C.px)}px).`})}return c}function Tt(e,t,n){let o=d=>d.type!=="color"&&Math.abs(Number(n[d.var])-d.default)>1e-9,i=e[t],s=e[t+1],r=s.token.role!=="body-size"&&!(o(s.token)&&!o(i.token)),a=e.map(d=>d.px),c=d=>e[d].token.role==="body-size",u=(d,y,v)=>{let h=St(e[d].token,y,v);h!==void 0&&(a[d]=h)};if(r)for(let d=t;d<a.length-1&&!(c(d+1)||a[d+1]*1.1<=a[d]);d++)u(d+1,a[d]/1.1,"down");for(let d=a.length-2;d>=0;d--)a[d]<a[d+1]*1.1&&u(d,a[d+1]*1.1,"up");let f={};return e.forEach((d,y)=>{Math.abs(a[y]-d.px)>1e-6&&(f[d.token.var]=Ct(d.token,a[y]))}),Object.keys(f).length?f:void 0}var Ct=(e,t)=>e.type==="size"&&e.unit==="rem"?Math.round(t/16*1e4)/1e4:t;function St(e,t,n){if(e.type!=="size")return;let i=((e.unit==="rem"?t/16:t)-e.min)/e.step,s=e.min+(n==="up"?Math.ceil(i-1e-9):Math.floor(i+1e-9))*e.step,r=ye(N(s,e.min,e.max),e.min,e.max,e.step);return e.unit==="rem"?r*16:r}var Vt=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function l(e,t=null,...n){let o=document.createElement(e);if(t)for(let[i,s]of Object.entries(t))s==null||s===!1||(i==="class"?o.className=String(s):i==="text"?o.textContent=String(s):i.startsWith("on")&&typeof s=="function"?o.addEventListener(i.slice(2).toLowerCase(),s):Vt.has(i)?o[i]=s:o.setAttribute(i,s===!0?"":String(s)));return $t(o,n),o}function $t(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function R(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var Mt=0,j=e=>`dt-${e}-${++Mt}`;var z=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,I={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:z(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:z(1.6,'<path d="M4 8h8"/>'),plus:z(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:z(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:z(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:z(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:z(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),warning:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7.13 2.5a1 1 0 0 1 1.74 0l5.6 9.75A1 1 0 0 1 13.6 13.75H2.4a1 1 0 0 1-.87-1.5z"/><path d="M8 6v3.2M8 11.2v.01" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',check:z(2,'<path d="M3.5 8.5l3 3 6-7"/>'),info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function Ke(e){let t=l("ul",{class:"list checks"}),n=l("div",{class:"empty",text:"No issues found."});return{el:l("div",null,n,t),update(i,s){n.hidden=i.length>0,t.hidden=i.length===0,t.replaceChildren(...i.map(r=>{let a=R(r.severity==="warning"?I.warning:I.info),c=r.fix&&!s?l("button",{type:"button",class:"btn",text:"Fix","aria-label":`Fix: ${r.message}`,onclick:()=>e(r.fix)}):null;return l("li",{class:`check ${r.severity}`,"data-id":r.id},l("span",{class:"ic",role:"img","aria-label":r.severity==="warning"?"Warning":"Info"},a),l("p",{text:r.message}),c)}))}}}function Ge(e,t){let n=[],o=l("div");for(let i of J){let s=e.filter(a=>a.group===i);if(!s.length)continue;let r=l("div",{class:"rows"});for(let a of s){let c=a.type==="color"?Rt(a,t):It(a,t);n.push(c),r.appendChild(c.el)}o.appendChild(l("details",{class:"group",open:!0},l("summary",null,R(I.chevron),i),r))}return{el:o,update(i,s,r){for(let a of n)a.update(i,s,r)}}}function _e(e,t,n){let o=t.type==="color"?t.default:$(t.default)+(t.type==="size"?t.unit:"");return l("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},R(I.reset))}function It(e,t){let n=j("range"),o=e.type==="size"?e.unit:"",i=e.type==="size"&&e.unit==="rem"?l("span",{class:"sub","aria-hidden":"true"}):null,s=l("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(s.value)),onchange:()=>t.commit()}),r=l("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:f=>{f.key==="Enter"&&r.blur(),f.key==="Escape"&&(r.value=u,r.blur())},onblur:()=>{let f=parseFloat(r.value);if(Number.isNaN(f)){r.value=u;return}t.set(e.var,N(Math.round(f*1e4)/1e4,e.min,e.max)),t.commit(),r.value=u}}),a=_e(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),c=l("div",{class:"ctl"},l("div",{class:"ctl-head"},l("label",{for:n,text:e.label}),i,a,l("div",{class:"num"},r,o?l("span",{text:o,"aria-hidden":"true"}):null)),s),u="";return{el:c,update(f,d,y){let v=Number(f[e.var]);u=$(v),s.value!==String(v)&&(s.value=String(v)),s.style.setProperty("--p",(v-e.min)/(e.max-e.min)*100+"%"),Je(r)||(r.value=u),i&&(i.textContent=$(v*16)+"px"),Xe(c,a,!O(f[e.var],d[e.var])&&!y),s.disabled=r.disabled=y}}}function Rt(e,t){let n=j("hex"),o=l("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),i=l("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:c=>{c.key==="Enter"&&i.blur(),c.key==="Escape"&&(i.value=a,i.blur())},onblur:()=>{let c=i.value.trim(),u=ie(c.startsWith("#")?c:"#"+c);u&&u!==a&&(t.set(e.var,u),t.commit()),i.value=u??a}}),s=_e(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),r=l("div",{class:"colour"},l("label",{for:n,text:e.label}),s,o,i),a="";return{el:r,update(c,u,f){a=String(c[e.var]),o.value!==a&&(o.value=a),Je(i)||(i.value=a),Xe(r,s,!O(c[e.var],u[e.var])&&!f),o.disabled=i.disabled=f}}}function Je(e){return e.getRootNode().activeElement===e}function Xe(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function We(e){let{config:t}=e,n=new Map(t.tokens.map(h=>[h.var,h.label])),o=new Map,i=new Map,s=l("ul",{class:"list suggestions"}),r=l("div",{class:"empty"}),a=l("div",null,r,s),c=(h,T)=>Object.entries(h.changes).every(([x,k])=>O(T[x],k)),u=new Map(t.tokens.map(h=>[h.var,h])),f=(h,T)=>!c(h,T)&&Object.entries(h.changes).every(([x,k])=>{let g=u.get(x);if(g.type==="color"||typeof k!="number")return O(T[x],k);let b=Number(T[x]);return k>g.default?b>=k:k<g.default?b<=k:O(b,k)});function d(h,T){let x=e.getState().versions[T],k={};for(let g of Object.keys(h.changes))k[g]=x[g];o.has(T)||o.set(T,new Map),o.get(T).set(h.id,k),e.apply(h.changes)}function y(h,T){let x=o.get(T)?.get(h.id)??Et(e.getState().defaults,Object.keys(h.changes));o.get(T)?.delete(h.id),e.apply(x)}function v(h,T,x,k){let g=`dt-sug-${h.id}`,b;return x?b=l("button",{type:"button",class:"applied-tag","aria-label":`Applied: ${h.title}. Click to undo it.`,"data-tip":"Click to undo","data-tip-pos":"start",onclick:()=>y(h,T)},R(I.check),"Applied"):k?b=l("span",{class:"actions"},l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>e.setPreview(null)}),l("button",{type:"button",class:"btn primary",text:"Apply",onclick:()=>d(h,T)})):b=l("button",{type:"button",class:"btn",text:"Preview","aria-describedby":g,onclick:()=>e.setPreview({id:h.id,changes:h.changes})}),l("li",{class:`sug${k?" previewing":""}${x?" applied":""}`,"data-id":h.id},l("h3",{id:g,text:h.title}),h.reason?l("p",{text:h.reason}):null,l("div",{class:"what","aria-label":"Changes"},...Object.keys(h.changes).map(p=>l("span",{class:"chip",text:n.get(p)??p}))),l("div",{class:"sug-actions"},b))}return{el:a,copied(h){let T=e.getState().versions[h],x=i.get(h)??new Set;for(let k of t.suggestions)c(k,T)&&x.add(k.id);i.set(h,x)},render(){let h=e.getState();if(h.active==="original"){s.replaceChildren(),s.hidden=!0,r.hidden=!1,r.textContent="Suggestions are tried on a version. Pick a version to preview them.";return}let T=h.active,x=h.versions[T],k=i.get(T)??new Set,g=t.suggestions.filter(m=>f(m,x)?!1:k.has(m.id)?c(m,x)?!1:(k.delete(m.id),!0):!0);s.hidden=g.length===0,r.hidden=g.length>0,r.textContent=t.suggestions.length?"No suggestions left for this version. You've applied or gone past them all.":"No suggestions for this design.";let p=a.getRootNode().activeElement?.closest?.(".sug")?.getAttribute("data-id");s.replaceChildren(...g.map(m=>v(m,T,c(m,x),h.preview?.id===m.id))),p&&s.querySelector(`.sug[data-id="${CSS.escape(p)}"] button:last-of-type`)?.focus()}}}function Et(e,t){let n={};for(let o of t)n[o]=e[o];return n}function Ye(e,t){let n=l("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=l("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let g=e.createVersion();g&&x(g)}},R(I.plus)),i=l("div",{class:"top"},n,o,l("span",{class:"spacer"}),t),s=null,r=l("span",{class:"confirm-text"}),a=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>d()}),c=l("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let g=s;d(!1),e.deleteVersion(g),x(e.getState().active)}}),u=l("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},r,a,c);u.addEventListener("keydown",g=>{g.key==="Escape"&&(g.stopPropagation(),d())});function f(g){let b=e.changesFor(e.getState().versions[g]).length;s=g,r.replaceChildren(l("strong",{text:`Delete Version ${g}?`})," ",l("span",{text:b?`Its ${b} change${b===1?"":"s"} will be lost.`:"It has no changes."})),i.hidden=!0,u.hidden=!1,a.focus()}function d(g=!0){let b=s;s=null,i.hidden=!1,u.hidden=!0,g&&b&&x(b)}let y=new Map,v=new Map,h=new Map,T="";function x(g){y.get(g)?.focus()}function k(g){y.clear(),v.clear(),h.clear(),n.replaceChildren(...g.map(b=>{let p=l("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(b),...b==="original"?{}:{"aria-keyshortcuts":"Delete"}},b==="original"?"Original":b);if(y.set(b,p),b==="original")return p;let m=l("span",{class:"dot","aria-hidden":"true"});p.appendChild(m),v.set(b,m);let C=l("button",{type:"button",class:"vtab-x","aria-label":`Delete Version ${b}`,tabIndex:-1,onclick:S=>{S.stopPropagation(),f(b)}},R(I.close));return h.set(b,C),l("span",{class:"vtab"},p,C)}))}return n.addEventListener("keydown",g=>{let b=[...y.keys()],p=n.getRootNode().activeElement,m=b.findIndex(L=>y.get(L)===p);if(m<0)return;let C=b[m];if((g.key==="Delete"||g.key==="Backspace")&&C!=="original"&&e.versionIds().length>1){g.preventDefault(),f(C);return}let S=-1;g.key==="ArrowRight"?S=(m+1)%b.length:g.key==="ArrowLeft"?S=(m-1+b.length)%b.length:g.key==="Home"?S=0:g.key==="End"&&(S=b.length-1),!(S<0)&&(g.preventDefault(),e.view(b[S]),x(b[S]))}),{row:i,confirmRow:u,shortcut(g){if(!g.altKey||!g.shiftKey||g.metaKey||g.ctrlKey)return!1;let b=/^Digit([0-3])$/.exec(g.code);if(!b)return!1;let p=b[1]==="0"?"original":["A","B","C"][Number(b[1])-1];return p!=="original"&&!e.getState().versions[p]?!1:(e.view(p),x(p),!0)},render(){let g=e.getState(),b=["original",...e.versionIds()],p=b.join();p!==T&&(k(b),T=p);let m=b.length>2;for(let[C,S]of y){let L=C===g.active;S.setAttribute("aria-selected",String(L)),S.tabIndex=L?0:-1}for(let[C,S]of v)S.hidden=e.changesFor(g.versions[C]).length===0;for(let[C,S]of h){let L=m&&C===g.active;S.hidden=!L,S.parentElement.classList.toggle("deletable",L)}o.hidden=!e.canCreateVersion(),s&&!g.versions[s]&&d(!1)}}}var Ze=`
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
`;var Lt="design-tweaker-root";function qe(){let e=document.createElement(Lt);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=Ze;let o=l("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function Ot(e,t,n,o){let i=new Map,s=l("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let r of n){let a=l("button",{type:"button",role:"tab",id:j("tab"),onclick:()=>o(r.id)},...r.content);i.set(r.id,a),s.appendChild(a)}return s.addEventListener("keydown",r=>{let a=[...i.keys()],c=a.findIndex(f=>i.get(f)===s.getRootNode().activeElement);if(c<0)return;let u=-1;r.key==="ArrowRight"?u=(c+1)%a.length:r.key==="ArrowLeft"?u=(c-1+a.length)%a.length:r.key==="Home"?u=0:r.key==="End"&&(u=a.length-1),!(u<0)&&(r.preventDefault(),o(a[u]),i.get(a[u]).focus())}),{el:s,buttons:i,select(r){for(let[a,c]of i){let u=a===r;c.setAttribute("aria-selected",String(u)),c.tabIndex=u?0:-1}}}}function Qe(e){let t=l("span",{class:"badge",hidden:!0});return{button:l("button",{type:"button",class:"launcher",onclick:e},R(I.sliders),t),badge:t}}function et(e,t,n,o){let i=!0,s=(a,c)=>{i=a,t.hidden=!a,e.hidden=a,c&&(a?n():e).focus(),o?.(a)},r=a=>{a.altKey&&a.shiftKey&&!a.ctrlKey&&!a.metaKey&&a.code==="KeyT"&&(a.preventDefault(),s(!i,!0))};return window.addEventListener("keydown",r),{set:s,isExpanded:()=>i,dispose:()=>window.removeEventListener("keydown",r)}}function tt(e,t){let{host:n,shadow:o,root:i}=qe(),s=e.config,r=t.ui.tab,a=t.ui.expanded,c=()=>t.onUiChange({expanded:a,tab:r}),u=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>oe.set(!1,!0)},R(I.minimise)),f=Ye(e,u),d=l("span",{class:"count",hidden:!0}),y=Ot("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",d]},{id:"suggestions",content:["Suggestions"]}],w=>{w!==r&&e.setPreview(null),r=w,c(),K()}),v=Ge(s.tokens,{set:(w,V)=>e.set(w,V),commit:()=>e.commit()}),h=Ke(w=>e.apply(w)),T=We(e),x={controls:v.el,checks:h.el,suggestions:T.el};for(let w of Object.keys(x)){let V=y.buttons.get(w),M=x[w];M.id=j("tabpanel"),M.setAttribute("role","tabpanel"),M.setAttribute("aria-labelledby",V.id),M.tabIndex=-1,V.setAttribute("aria-controls",M.id)}let k=l("div",{class:"body"},...Object.values(x)),g=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",b=l("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${g}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},R(I.undo)),p=l("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${g}${g==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},R(I.redo)),m=l("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>ee(!0)},R(I.resetAll)),C=l("button",{type:"button",class:"btn primary copy",onclick:()=>lt()}),S=l("div",{class:"footer-row"},b,p,m,l("span",{class:"spacer"}),C),L=l("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>ee(!1,!0)}),de=l("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},l("span",{class:"confirm-text",text:"Reset this version to the original?"}),L,l("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),ee(!1,!0)}}));de.addEventListener("keydown",w=>{w.key==="Escape"&&(w.stopPropagation(),ee(!1,!0))});let me=l("div",{class:"note",hidden:!0},R(I.info),"Showing the original design. Pick a version to edit."),rt=l("footer",{class:"footer"},S,de,me),Q=!1;function ee(w,V=!1){Q=w,K(),w?L.focus():V&&(m.disabled?b:m).focus()}let D=l("div",{class:"toast",role:"status","aria-live":"polite"}),ue;function st(w){D.textContent=w,D.classList.add("show"),clearTimeout(ue),ue=setTimeout(()=>{D.classList.remove("show"),D.textContent=""},3e3)}let te=l("textarea",{class:"manual-text",readonly:!0,"aria-label":"Changes to copy",spellcheck:"false"}),at=l("button",{type:"button",class:"btn",text:"Close",onclick:()=>be()}),ne=l("div",{class:"manual",hidden:!0,role:"dialog","aria-label":"Copy this manually"},l("div",{class:"manual-head"},l("strong",{text:"Copy this manually"}),at),l("p",{text:"Copying to the clipboard didn't work. Select the text below, copy it, and paste it into Claude Code."}),te);ne.addEventListener("keydown",w=>{w.key==="Escape"&&(w.stopPropagation(),be())});function be(){ne.hidden=!0,C.focus()}async function lt(){e.commit();let w=e.getState();if(w.active==="original"||e.changes().length===0)return;let V=Ne(s,w.active,e.shownValues(),w.defaults),M=await Ae(V,o);T.copied(w.active),K(),M==="failed"?(te.value=V,ne.hidden=!1,te.focus(),te.select()):st("Copied \u2014 paste it into Claude Code")}let pe=l("section",{class:"win","aria-label":"Design Tweaker"},f.row,f.confirmRow,y.el,k,rt,ne,D);pe.addEventListener("keydown",w=>{if(f.shortcut(w)){w.preventDefault();return}if(w.key==="Escape"&&e.getState().preview){w.preventDefault(),e.setPreview(null);return}if(!(w.metaKey||w.ctrlKey)||w.altKey||w.code!=="KeyZ")return;let V=w.composedPath()[0];V instanceof HTMLInputElement&&V.type==="text"||(w.preventDefault(),w.shiftKey?e.redo():e.undo())});let U=Qe(()=>oe.set(!0,!0));i.append(U.button,pe);let oe=et(U.button,pe,()=>u,w=>{a=w,c()});oe.set(a,!1);function K(){let w=e.getState(),V=w.active==="original",M=e.changes().length;f.render(),y.select(r);for(let ve of Object.keys(x))x[ve].hidden=ve!==r;v.update(e.shownValues(),w.defaults,V),T.render(),(V||M===0)&&(Q=!1),S.hidden=V||Q,de.hidden=V||!Q,me.hidden=!V,b.disabled=!e.canUndo(),p.disabled=!e.canRedo(),m.disabled=M===0,C.textContent=M===0?"Copy changes":`Copy ${M} change${M===1?"":"s"}`,C.disabled=M===0,U.badge.hidden=M===0,U.badge.textContent=String(M),U.button.setAttribute("aria-label",`Open Design Tweaker${M?` (${M} unsaved change${M===1?"":"s"})`:""}`)}let G;function xe(){clearTimeout(G),G=void 0;let w=Ue(s,e.shownValues()),V=w.filter(M=>M.severity==="warning").length;h.update(w,e.getState().active==="original"),d.hidden=V===0,d.textContent=V?String(V):"",d.setAttribute("aria-label",`${V} warning${V===1?"":"s"}`)}let ct=()=>{clearTimeout(G),G=setTimeout(xe,100)},dt=e.subscribe(()=>{K(),ct()});return K(),xe(),{destroy(){dt(),clearTimeout(ue),clearTimeout(G),oe.dispose(),n.remove()}}}function nt(e){let{host:t,root:n}=qe(),o=l("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>r.set(!1,!0)},R(I.minimise)),i=l("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},l("div",{class:"top"},l("strong",{text:"Design Tweaker"}),l("span",{class:"spacer"}),o),l("div",{class:"body error-msg",role:"alert"},l("strong",{text:"The tweak config couldn't be loaded."}),l("code",{text:e}),l("span",{text:"Fix tweak.config.json and reload the page."}))),s=Qe(()=>r.set(!0,!0));s.badge.hidden=!1,s.badge.classList.add("error"),s.badge.textContent="!",s.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(s.button,i);let r=et(s.button,i,()=>o);return r.set(!0,!1),{destroy(){r.dispose(),t.remove()}}}var ce="[design-tweaker]",H=null;function it(e){if(H){console.warn(`${ce} mount() called twice; ignoring.`);return}let t=Ce(e);if(!t.ok){console.error(`${ce} ${t.error}`),H={panel:nt(t.error)};return}let{config:n,warnings:o}=t;for(let x of o)console.warn(`${ce} ${x}`);let i=getComputedStyle(document.documentElement);for(let x of Se(n,k=>i.getPropertyValue(k)))console.warn(`${ce} Config out of date: ${x}`);let s=Ee(n),r=new le(n,{versions:s.versions,active:s.ui.active}),a=s.ui,c=Oe(n),u=()=>c.schedule({baseDefaults:r.getState().defaults,versions:r.committedVersions(),ui:{...a,active:r.getState().active}}),f=new ae,d=()=>f.write($e(n,r.pageValues(),r.getState().defaults)),y=r.subscribe(d),v=r.subscribe(u);d(),H={panel:tt(r,{ui:a,onUiChange(x){a={...a,...x},u()}}),writer:f,stop:()=>{y(),v(),c.flush()}}}function Nt(){H&&(H.stop?.(),H.writer?.remove(),H.panel.destroy(),H=null)}window.TweakPanel={mount:it,unmount:Nt};function ot(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&it(e.textContent??"")}document.body?ot():document.addEventListener("DOMContentLoaded",ot,{once:!0});})();
