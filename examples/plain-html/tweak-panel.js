/* Design Tweaker panel v1 — development only. Do not edit; copy verbatim. */
"use strict";(()=>{function S(e){let t=Math.round(e*1e4)/1e4;return String(Object.is(t,-0)?0:t)}function O(e,t,n){return Math.min(n,Math.max(t,e))}var ve=/^#[0-9a-f]{6}$/i,lt=/^#[0-9a-f]{3}$/i;function G(e){return typeof e=="string"&&ve.test(e)}function ie(e){let t=e.trim();return ve.test(t)?t.toLowerCase():lt.test(t)?("#"+t[1]+t[1]+t[2]+t[2]+t[3]+t[3]).toLowerCase():null}var _=["Typography","Spacing","Layout","Colour"],ye=["body-size","h1-size","h2-size","h3-size","small-size","body-line-height","heading-line-height","measure","section-spacing","element-gap","radius","body-text","muted-text","background","surface","accent","accent-text"],pe=["px","rem","ch"],ke=["html","react-vite","nextjs"];var ct=/^--[A-Za-z0-9_-]+$/,re=e=>typeof e=="object"&&e!==null&&!Array.isArray(e),J=e=>typeof e=="number"&&Number.isFinite(e),F=e=>typeof e=="string"&&e.length>0;function we(e){let t=e;if(typeof e=="string")try{t=JSON.parse(e)}catch(f){return{ok:!1,error:`Config is not valid JSON: ${f.message}`}}if(!re(t))return{ok:!1,error:"Config must be a JSON object."};if(!("version"in t))return{ok:!1,error:'Config is missing "version".'};if(t.version!==1)return{ok:!1,error:`Unsupported config version ${JSON.stringify(t.version)} (expected 1).`};if(!Array.isArray(t.tokens))return{ok:!1,error:'Config is missing a "tokens" array.'};let n=[],o=f=>n.push(f),i="default";F(t.id)?i=t.id:o('Config has no "id"; using "default" as the storage key.');let s="html";ke.includes(t.framework)?s=t.framework:o(`Unknown "framework" ${JSON.stringify(t.framework)}; assuming "html".`);let r=t.tailwind===!0;typeof t.tailwind!="boolean"&&o('"tailwind" should be true or false; assuming false.');let a="";F(t.tokensFile)?a=t.tokensFile:o('Config has no "tokensFile"; the copied changes will not say where tokens live.');let l=[],c=new Set;t.tokens.forEach((f,v)=>{let m=dt(f,v,o);if(m){if(m.var==="--font-heading"||m.var==="--font-body"){o(`Token ${m.var} skipped: fonts are not adjustable in v1.`);return}if(c.has(m.var)){o(`Token ${m.var} skipped: duplicate variable.`);return}c.add(m.var),l.push(m)}}),t.fonts!==void 0&&o('"fonts" is not supported in v1 and is ignored.');let p=[];if(t.suggestions!==void 0&&!Array.isArray(t.suggestions))o('"suggestions" should be an array; ignoring it.');else if(Array.isArray(t.suggestions)){let f=new Map(l.map(v=>[v.var,v]));t.suggestions.forEach((v,m)=>{let C=ut(v,m,f,o);C&&p.push(C)})}return{ok:!0,config:{version:1,id:i,framework:s,tailwind:r,tokensFile:a,tokens:l,suggestions:p},warnings:n}}function dt(e,t,n){let o=`Token #${t+1}`;if(!re(e))return n(`${o} skipped: not an object.`),null;if(typeof e.var!="string"||!ct.test(e.var))return n(`${o} skipped: "var" must be a CSS variable name starting with "--" (got ${JSON.stringify(e.var)}).`),null;let i=e.var;if(!_.includes(e.group))return n(`Token ${i} skipped: "group" must be one of ${_.join(", ")}.`),null;let s=F(e.label)?e.label:i;F(e.label)||n(`Token ${i} has no "label"; using the variable name.`);let r;e.role!==void 0&&(ye.includes(e.role)?r=e.role:n(`Token ${i}: unknown role ${JSON.stringify(e.role)} ignored.`));let a={var:i,label:s,group:e.group,...r?{role:r}:{}};if(e.type==="color")return G(e.default)?{...a,type:"color",default:e.default.toLowerCase()}:(n(`Token ${i} skipped: colour default must be 6-digit hex like "#1a1a1a" (got ${JSON.stringify(e.default)}).`),null);if(e.type!=="size"&&e.type!=="number")return n(`Token ${i} skipped: unknown type ${JSON.stringify(e.type)}.`),null;if(!J(e.default)||!J(e.min)||!J(e.max)||!J(e.step))return n(`Token ${i} skipped: "default", "min", "max" and "step" must all be numbers.`),null;if(e.min>e.max)return n(`Token ${i} skipped: min (${e.min}) is greater than max (${e.max}).`),null;if(e.step<=0)return n(`Token ${i} skipped: step must be greater than 0.`),null;let l=e.default;(l<e.min||l>e.max)&&(l=O(l,e.min,e.max),n(`Token ${i}: default ${e.default} is outside [${e.min}, ${e.max}]; clamped to ${S(l)}.`));let c={default:l,min:e.min,max:e.max,step:e.step};return e.type==="number"?{...a,type:"number",...c}:pe.includes(e.unit)?{...a,type:"size",unit:e.unit,...c}:(n(`Token ${i} skipped: size "unit" must be one of ${pe.join(", ")}.`),null)}function ut(e,t,n,o){if(!re(e)||!F(e.id)||!F(e.title))return o(`Suggestion #${t+1} skipped: needs "id" and "title".`),null;let i=`Suggestion "${e.id}"`,s=typeof e.reason=="string"?e.reason:"";e.fontPair!==void 0&&o(`${i}: "fontPair" is not supported in v1 and is ignored.`);let r=re(e.changes)?e.changes:{},a={};for(let[l,c]of Object.entries(r)){let p=n.get(l);if(!p)return o(`${i} skipped: unknown token ${l}.`),null;if(p.type==="color"){if(!G(c))return o(`${i} skipped: ${l} must be 6-digit hex (got ${JSON.stringify(c)}).`),null;a[l]=c.toLowerCase()}else{if(!J(c))return o(`${i} skipped: ${l} must be a number (got ${JSON.stringify(c)}).`),null;let f=O(c,p.min,p.max);f!==c&&o(`${i}: ${l} value ${c} is outside [${p.min}, ${p.max}]; clamped to ${S(f)}.`),a[l]=f}}return Object.keys(a).length===0?(o(`${i} skipped: it has no changes.`),null):{id:e.id,title:e.title,reason:s,changes:a}}function Te(e,t){let n=[];for(let o of e.tokens){let i=t(o.var).trim();i===""?n.push(`${o.var} is in the config but not declared on :root.`):ft(o,i)||n.push(`${o.var}: config default is ${pt(o)} but the page has ${i}.`)}return n}function pt(e){return e.type==="color"?e.default:e.type==="size"?S(e.default)+e.unit:S(e.default)}function ft(e,t){if(e.type==="color")return ie(t)===e.default;let n=e.type==="size"?e.unit:"",o=/^(-?\d*\.?\d+)([a-z%]*)$/i.exec(t);return!o||o[2].toLowerCase()!==n?!1:Math.abs(parseFloat(o[1])-e.default)<1e-4}function se(e){let t={};for(let n of e.tokens)t[n.var]=n.default;return t}function B(e,t,n){return e.tokens.map(o=>o.var).filter(o=>!N(t[o],n[o]))}function N(e,t){return typeof e=="number"&&typeof t=="number"?Math.abs(e-t)<1e-9:typeof e=="string"&&typeof t=="string"?e.toLowerCase()===t.toLowerCase():e===t}function X(e,t){let n=Object.keys(e);return n.length!==Object.keys(t).length?!1:n.every(o=>N(e[o],t[o]))}var Ce="design-tweaker-overrides";function fe(e,t){if(e.type==="color")return String(t);let n=S(Number(t));return e.type==="size"?n+e.unit:n}function Se(e,t,n){let o=[];for(let i of B(e,t,n)){let s=e.tokens.find(r=>r.var===i);o.push(`  ${i}: ${fe(s,t[i])};`)}return o.length?`:root {
${o.join(`
`)}
}`:""}var ae=class{constructor(t=document){this.doc=t;this.el=null;this.pending=null;this.frame=0}write(t){this.pending=t,this.frame||(this.frame=requestAnimationFrame(()=>this.flush()))}flush(){if(this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending===null)return;let t=this.element();t.textContent!==this.pending&&(t.textContent=this.pending),this.pending=null}remove(){this.frame&&cancelAnimationFrame(this.frame),this.frame=0,this.pending=null,this.el?.remove(),this.el=null}element(){return(!this.el||!this.el.isConnected)&&(this.el=this.doc.getElementById(Ce),this.el||(this.el=this.doc.createElement("style"),this.el.id=Ce)),(this.el.parentNode!==this.doc.head||this.doc.head.lastElementChild!==this.el)&&this.doc.head.appendChild(this.el),this.el}};var gt=100,W=class{constructor(t){this.committed=t;this.past=[];this.future=[]}commit(t){return X(t,this.committed)?!1:(this.past.push(this.committed),this.past.length>gt&&this.past.shift(),this.future=[],this.committed=t,!0)}undo(t){this.commit(t);let n=this.past.pop();return n?(this.future.push(this.committed),this.committed=n,n):null}redo(t){X(t,this.committed)||this.commit(t);let n=this.future.pop();return n?(this.past.push(this.committed),this.committed=n,n):null}canUndo(t){return this.past.length>0||!X(t,this.committed)}canRedo(t){return this.future.length>0&&X(t,this.committed)}get current(){return this.committed}get size(){return this.past.length}};var Z=["A","B","C"],le=class{constructor(t,n){this.listeners=new Set;this.histories=new Map;this.config=t;let o=se(t),i=n?.versions??{A:{...o}};this.state={defaults:o,versions:i,active:n?.active??"A"};for(let s of this.versionIds())this.histories.set(s,new W(i[s]))}committedVersions(){let t={};for(let n of this.versionIds())t[n]=this.histories.get(n).current;return t}getState(){return this.state}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}shownValues(){let{active:t,versions:n,defaults:o}=this.state;return t==="original"?o:n[t]??o}changes(){return this.changesFor(this.shownValues())}changesFor(t){return B(this.config,t,this.state.defaults)}versionIds(){return Z.filter(t=>this.state.versions[t])}canCreateVersion(){return this.versionIds().length<Z.length}createVersion(){let t=Z.find(o=>!this.state.versions[o]);if(!t)return null;this.commit();let n={...this.shownValues()};return this.histories.set(t,new W(n)),this.update({versions:{...this.state.versions,[t]:n},active:t}),t}deleteVersion(t){let n=this.versionIds();if(!this.state.versions[t]||n.length<=1)return;let o={...this.state.versions};delete o[t],this.histories.delete(t);let i=this.state.active;if(i===t){let s=n.indexOf(t);i=n[s-1]??n[s+1]}this.update({versions:o,active:i})}view(t){t!==this.state.active&&(t!=="original"&&!this.state.versions[t]||(this.commit(),this.update({active:t})))}set(t,n){this.setMany({[t]:n})}setMany(t){let n=this.editable();if(!n)return;let o=this.state.versions[n];Object.entries(t).every(([i,s])=>o[i]===s)||this.replace(n,{...o,...t})}commit(){let t=this.editable();t&&this.histories.get(t).commit(this.state.versions[t])&&this.notify()}apply(t){this.commit(),this.setMany(t),this.commit()}resetAll(){this.apply(this.state.defaults)}undo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).undo(this.state.versions[t]);n&&this.replace(t,n)}redo(){let t=this.editable();if(!t)return;let n=this.histories.get(t).redo(this.state.versions[t]);n&&this.replace(t,n)}canUndo(){let t=this.editable();return!!t&&this.histories.get(t).canUndo(this.state.versions[t])}canRedo(){let t=this.editable();return!!t&&this.histories.get(t).canRedo(this.state.versions[t])}editable(){let{active:t,versions:n}=this.state;return t!=="original"&&n[t]?t:null}replace(t,n){this.update({versions:{...this.state.versions,[t]:n}})}update(t){this.state={...this.state,...t},this.notify()}notify(){for(let t of this.listeners)t(this.state)}};var ht=["controls","checks","suggestions"],Me=e=>`design-tweaker:v1:${e.id}`,Ve={expanded:!0,tab:"controls",active:"A"};function mt(e,t){let n=se(e),o=Y(t)?t:{},i=Y(o.baseDefaults)?o.baseDefaults:{},s=Y(o.versions)?o.versions:{},r={};for(let p of Z)Y(s[p])&&(r[p]={});Object.keys(r).length||(r.A={});for(let p of e.tokens){let f=p.var,v=n[f],m=f in i,M=m&&!N(i[f],v)&&!Object.keys(r).some(y=>N($e(p,s[y][f]),v));for(let y of Object.keys(r)){let V=$e(p,s[y]?.[f]);r[y][f]=!m||M||V===void 0?v:V}}let a=Y(o.ui)?o.ui:{},l=Object.keys(r),c=a.active==="original"||l.includes(a.active)?a.active:"A";return c!=="original"&&!r[c]&&(c=l[0]),{baseDefaults:n,versions:r,ui:{expanded:typeof a.expanded=="boolean"?a.expanded:Ve.expanded,tab:ht.includes(a.tab)?a.tab:Ve.tab,active:c}}}function $e(e,t){if(e.type==="color")return G(t)?t.toLowerCase():void 0;if(!(typeof t!="number"||!Number.isFinite(t)))return O(t,e.min,e.max)}function Y(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ie(e){let t=null;try{let o=localStorage.getItem(Me(e));t=o?JSON.parse(o):null}catch{t=null}let n=mt(e,t);return Re(e,n),n}function Re(e,t){try{localStorage.setItem(Me(e),JSON.stringify(t))}catch{}}function Ee(e,t=300){let n,o="",i=null,s=()=>{if(clearTimeout(n),n=void 0,!i)return;let r=JSON.stringify(i);r!==o&&(o=r,Re(e,i)),i=null};return{schedule(r){i=r,clearTimeout(n),n=setTimeout(s,t)},flush:s}}function Le(e,t,n,o){let i=["```design-tweaks","Apply these design tweaks (design-tweaker v1)",`version: ${t}`,`tokens-file: ${e.tokensFile}`];for(let s of B(e,n,o)){let r=e.tokens.find(a=>a.var===s);i.push(`${s}: ${fe(r,n[s])};`)}return i.push("```"),i.join(`
`)}async function Oe(e,t){try{if(navigator.clipboard?.writeText)return await navigator.clipboard.writeText(e),"clipboard"}catch{}let n=document.createElement("textarea");n.value=e,n.setAttribute("readonly",""),n.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",t.appendChild(n);try{return n.select(),document.execCommand("copy")?"fallback":"failed"}catch{return"failed"}finally{n.remove()}}function ze(e){let t=parseInt(e.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]}function bt([e,t,n]){let o=i=>Math.round(Math.min(1,Math.max(0,i))*255).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(n)}`}var Pe=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,xt=e=>e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055;function Ne(e){let[t,n,o]=ze(e).map(Pe);return .2126*t+.7152*n+.0722*o}function I(e,t){let n=Ne(e),o=Ne(t);return(Math.max(n,o)+.05)/(Math.min(n,o)+.05)}function He(e){let[t,n,o]=ze(e).map(Pe),i=Math.cbrt(.4122214708*t+.5363325363*n+.0514459929*o),s=Math.cbrt(.2119034982*t+.6806995451*n+.1073969566*o),r=Math.cbrt(.0883024619*t+.2817188376*n+.6299787005*o),a=.2104542553*i+.793617785*s-.0040720468*r,l=1.9779984951*i-2.428592205*s+.4505937099*r,c=.0259040371*i+.7827717662*s-.808675766*r,p=Math.hypot(l,c),f=p<1e-6?0:(Math.atan2(c,l)*180/Math.PI+360)%360;return{l:a,c:p,h:f}}function ge({l:e,c:t,h:n}){let o=n*Math.PI/180,i=t*Math.cos(o),s=t*Math.sin(o),r=(e+.3963377774*i+.2158037573*s)**3,a=(e-.1055613458*i-.0638541728*s)**3,l=(e-.0894841775*i-1.291485548*s)**3;return[4.0767416621*r-3.3077115913*a+.2309699292*l,-1.2684380046*r+2.6097574011*a-.3413193965*l,-.0041960863*r-.7034186147*a+1.707614701*l]}var Ae=e=>e.every(t=>t>=-1e-6&&t<=1+1e-6);function Fe(e){let t=Math.min(1,Math.max(0,e.l)),n=ge({...e,l:t});if(!Ae(n)){let o=0,i=e.c;for(let s=0;s<24;s++){let r=(o+i)/2;Ae(ge({l:t,c:r,h:e.h}))?o=r:i=r}n=ge({l:t,c:o,h:e.h})}return bt(n.map(o=>xt(Math.min(1,Math.max(0,o)))))}function vt(e){return I(e,"#000000")>=I(e,"#ffffff")}var A=.1;function z(e,t,n,o=0){if(I(e,t)>=n+o)return e;let i=He(e),s=vt(t),r=s?0:1,a=p=>Fe({...i,l:p});if(I(a(r),t)<n+o)return o>0?z(e,t,n):s?"#000000":"#ffffff";n+=o;let l=i.l,c=r;for(let p=0;p<40;p++){let f=(l+c)/2;I(a(f),t)>=n?c=f:l=f}return a(c)}function Be(e,t,n,o=0){let i=c=>Math.min(...t.map(p=>I(c,p))),s=n+o;if(i(e)>=s)return e;let r=He(e),a=c=>Fe({...r,l:c}),l=(c,p)=>{let v=r.l;for(let m=1;m<=200;m++){let C=r.l+(c-r.l)*m/200;if(i(a(C))>=p){let M=v,y=C;for(let V=0;V<30;V++){let g=(M+y)/2;i(a(g))>=p?y=g:M=g}return y}v=C}return null};for(let c of o>0?[s,n]:[s]){let p=[l(0,c),l(1,c)].filter(f=>f!==null);if(p.length){let f=p.reduce((v,m)=>Math.abs(v-r.l)<=Math.abs(m-r.l)?v:m);return a(f)}}return null}function je(e,t){let n=new Map;for(let u of e.tokens)u.role&&!n.has(u.role)&&n.set(u.role,u);let o=u=>{let h=n.get(u);return h?.type==="color"?{token:h,value:String(t[h.var])}:void 0},i=u=>{let h=n.get(u);if(h?.type!=="size"||h.unit==="ch")return;let k=Number(t[h.var]);return{token:h,px:h.unit==="rem"?k*16:k}},s=u=>{let h=n.get(u);return h&&h.type!=="color"?{token:h,value:Number(t[h.var])}:void 0},r=(u,h)=>u.type==="color"?{}:{[u.var]:O(h,u.min,u.max)},a=u=>`${u.toFixed(1)}:1`,l=[],c=o("body-text"),p=o("muted-text"),f=o("background"),v=o("surface"),m=o("accent"),C=o("accent-text"),M=c&&f&&v?Be(c.value,[f.value,v.value],4.5,A):void 0;if(c&&f){let u=I(c.value,f.value);u<4.5&&l.push({id:"C1",severity:"warning",message:`Body text is hard to read on this background (${a(u)}, needs 4.5:1).`,fix:{[c.token.var]:M??z(c.value,f.value,4.5,A)}})}if(p&&f){let u=I(p.value,f.value);u<4.5&&l.push({id:"C2",severity:"warning",message:`Muted text is hard to read on this background (${a(u)}, needs 4.5:1).`,fix:{[p.token.var]:z(p.value,f.value,4.5,A)}})}if(m&&f){let u=I(m.value,f.value);if(u<3){let h=z(m.value,f.value,3,A);if(C&&I(C.value,h)<4.5){let k=z(h,C.value,4.5,A);I(k,f.value)>=3&&I(k,C.value)>=4.5&&(h=k)}l.push({id:"C3",severity:"warning",message:`The accent colour is hard to see on this background (${a(u)}, needs 3:1).`,fix:{[m.token.var]:h}})}}if(C&&m){let u=I(C.value,m.value);if(u<4.5){let h=I("#ffffff",m.value)>=I("#000000",m.value)?"#ffffff":"#000000";l.push({id:"C4",severity:"warning",message:`Text on the accent colour is hard to read (${a(u)}, needs 4.5:1).`,fix:{[C.token.var]:h}})}}if(c&&v){let u=I(c.value,v.value);if(u<4.5){let h=!!f&&!M;l.push({id:"C5",severity:"warning",message:`Body text is hard to read on cards and panels (${a(u)}, needs 4.5:1).`+(h?" No text colour works on both the page and the cards, so Fix adjusts the card colour.":""),fix:h?{[v.token.var]:z(v.value,c.value,4.5,A)}:{[c.token.var]:M??z(c.value,v.value,4.5,A)}})}}let y=n.get("measure");if(y?.type==="size"&&y.unit==="ch"){let u=Number(t[y.var]);u>75?l.push({id:"C6",severity:"warning",message:`Lines of text are too long to read comfortably (${S(u)}ch; aim for 45\u201375ch).`,fix:r(y,68)}):u<45&&l.push({id:"C7",severity:"info",message:`Lines of text are very short (${S(u)}ch), which makes reading choppy.`,fix:r(y,60)})}let V=i("body-size");V&&V.px<16&&l.push({id:"C8",severity:"warning",message:`Body text is small (${S(V.px)}px). 16px or more is easier to read.`,fix:r(V.token,V.token.type==="size"&&V.token.unit==="rem"?1:16)});let g=s("body-line-height");g&&g.value<1.4?l.push({id:"C9",severity:"warning",message:`Body line height is tight (${S(g.value)}). Lines may feel cramped.`,fix:r(g.token,1.5)}):g&&g.value>2&&l.push({id:"C10",severity:"info",message:`Body line height is loose (${S(g.value)}). Paragraphs may feel disconnected.`,fix:r(g.token,1.7)});let b=["h1-size","h2-size","h3-size","body-size"].map(u=>i(u)).filter(u=>!!u);for(let u=0;u<b.length-1;u++){let h=b[u],k=b[u+1],w=h.token.label,L=k.token.label;h.px<=k.px?l.push({id:`C11:${h.token.var}`,severity:"warning",message:h.px===k.px?`${w} and ${L} are the same size (${S(h.px)}px).`:`${L} (${S(k.px)}px) is larger than ${w} (${S(h.px)}px).`}):h.px<k.px*1.1&&l.push({id:`C12:${h.token.var}`,severity:"info",message:`${w} and ${L} are very close in size (${S(h.px)}px and ${S(k.px)}px).`})}return l}var yt=new Set(["value","disabled","hidden","checked","type","id","min","max","step","open","tabIndex"]);function d(e,t=null,...n){let o=document.createElement(e);if(t)for(let[i,s]of Object.entries(t))s==null||s===!1||(i==="class"?o.className=String(s):i==="text"?o.textContent=String(s):i.startsWith("on")&&typeof s=="function"?o.addEventListener(i.slice(2).toLowerCase(),s):yt.has(i)?o[i]=s:o.setAttribute(i,s===!0?"":String(s)));return kt(o,n),o}function kt(e,t){for(let n of t)n==null||n===!1||e.appendChild(typeof n=="string"?document.createTextNode(n):n)}function E(e){let t=document.createElement("template");t.innerHTML=e.trim();let n=t.content.firstElementChild;return n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n}var wt=0,j=e=>`dt-${e}-${++wt}`;var H=(e,t,n=16)=>`<svg viewBox="0 0 ${n} ${n}" fill="none" stroke="currentColor" stroke-width="${e}" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`,R={sliders:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 5h8M15 5h2M3 10h3M10 10h7M3 15h9M16 15h1"/><circle cx="13" cy="5" r="2"/><circle cx="8" cy="10" r="2"/><circle cx="14" cy="15" r="2"/></svg>',close:H(1.4,'<path d="M2 2l6 6M8 2l-6 6"/>',10),minimise:H(1.6,'<path d="M4 8h8"/>'),plus:H(1.6,'<path d="M7 2.5v9M2.5 7h9"/>',14),chevron:'<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3 1.5l4 3.5-4 3.5z"/></svg>',reset:H(1.6,'<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/>'),resetAll:H(1.5,'<rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5"/><path d="M5.2 8.6a2.9 2.9 0 1 0 .9-2.6"/><path d="M5.3 4.6v1.8h1.8"/>'),undo:H(1.6,'<path d="M5.5 3.5L2.5 6.5l3 3"/><path d="M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7"/>'),redo:H(1.6,'<path d="M10.5 3.5l3 3-3 3"/><path d="M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3"/>'),warning:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7.13 2.5a1 1 0 0 1 1.74 0l5.6 9.75A1 1 0 0 1 13.6 13.75H2.4a1 1 0 0 1-.87-1.5z"/><path d="M8 6v3.2M8 11.2v.01" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',info:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><path d="M8 7.2v4M8 4.8v.01" stroke-linecap="round"/></svg>'};function De(e){let t=d("ul",{class:"list checks"}),n=d("div",{class:"empty",text:"No issues found."});return{el:d("div",null,n,t),update(i,s){n.hidden=i.length>0,t.hidden=i.length===0,t.replaceChildren(...i.map(r=>{let a=E(r.severity==="warning"?R.warning:R.info),l=r.fix&&!s?d("button",{type:"button",class:"btn",text:"Fix","aria-label":`Fix: ${r.message}`,onclick:()=>e(r.fix)}):null;return d("li",{class:`check ${r.severity}`,"data-id":r.id},d("span",{class:"ic",role:"img","aria-label":r.severity==="warning"?"Warning":"Info"},a),d("p",{text:r.message}),l)}))}}}function Ke(e,t){let n=[],o=d("div");for(let i of _){let s=e.filter(a=>a.group===i);if(!s.length)continue;let r=d("div",{class:"rows"});for(let a of s){let l=a.type==="color"?Ct(a,t):Tt(a,t);n.push(l),r.appendChild(l.el)}o.appendChild(d("details",{class:"group",open:!0},d("summary",null,E(R.chevron),i),r))}return{el:o,update(i,s,r){for(let a of n)a.update(i,s,r)}}}function Ue(e,t,n){let o=t.type==="color"?t.default:S(t.default)+(t.type==="size"?t.unit:"");return d("button",{class:"reset",type:"button","aria-label":`Reset ${e} to ${o}`,"data-tip":`Reset to ${o}`,"data-tip-pos":"left",onclick:n},E(R.reset))}function Tt(e,t){let n=j("range"),o=e.type==="size"?e.unit:"",i=e.type==="size"&&e.unit==="rem"?d("span",{class:"sub","aria-hidden":"true"}):null,s=d("input",{type:"range",id:n,min:String(e.min),max:String(e.max),step:String(e.step),oninput:()=>t.set(e.var,parseFloat(s.value)),onchange:()=>t.commit()}),r=d("input",{type:"text",inputmode:"decimal","aria-label":`${e.label} value${o?` in ${o}`:""}`,onkeydown:p=>{p.key==="Enter"&&r.blur(),p.key==="Escape"&&(r.value=c,r.blur())},onblur:()=>{let p=parseFloat(r.value);if(Number.isNaN(p)){r.value=c;return}t.set(e.var,O(Math.round(p*1e4)/1e4,e.min,e.max)),t.commit(),r.value=c}}),a=Ue(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),l=d("div",{class:"ctl"},d("div",{class:"ctl-head"},d("label",{for:n,text:e.label}),i,a,d("div",{class:"num"},r,o?d("span",{text:o,"aria-hidden":"true"}):null)),s),c="";return{el:l,update(p,f,v){let m=Number(p[e.var]);c=S(m),s.value!==String(m)&&(s.value=String(m)),s.style.setProperty("--p",(m-e.min)/(e.max-e.min)*100+"%"),Ge(r)||(r.value=c),i&&(i.textContent=S(m*16)+"px"),_e(l,a,!N(p[e.var],f[e.var])&&!v),s.disabled=r.disabled=v}}}function Ct(e,t){let n=j("hex"),o=d("input",{type:"color",class:"swatch","aria-label":`Pick ${e.label} colour`,oninput:()=>t.set(e.var,o.value.toLowerCase()),onchange:()=>t.commit()}),i=d("input",{type:"text",id:n,class:"hex",spellcheck:"false",autocomplete:"off",maxlength:"7",onkeydown:l=>{l.key==="Enter"&&i.blur(),l.key==="Escape"&&(i.value=a,i.blur())},onblur:()=>{let l=i.value.trim(),c=ie(l.startsWith("#")?l:"#"+l);c&&c!==a&&(t.set(e.var,c),t.commit()),i.value=c??a}}),s=Ue(e.label,e,()=>{t.set(e.var,e.default),t.commit()}),r=d("div",{class:"colour"},d("label",{for:n,text:e.label}),s,o,i),a="";return{el:r,update(l,c,p){a=String(l[e.var]),o.value!==a&&(o.value=a),Ge(i)||(i.value=a),_e(r,s,!N(l[e.var],c[e.var])&&!p),o.disabled=i.disabled=p}}}function Ge(e){return e.getRootNode().activeElement===e}function _e(e,t,n){e.classList.toggle("changed",n),t.setAttribute("aria-hidden",String(!n)),t.tabIndex=n?0:-1}function Je(e,t){let n=d("div",{class:"seg versions",role:"tablist","aria-label":"Versions"}),o=d("button",{type:"button",class:"icon-btn add","aria-label":"Try a new version","data-tip":"Try a new version",onclick:()=>{let g=e.createVersion();g&&y(g)}},E(R.plus)),i=d("div",{class:"top"},n,o,d("span",{class:"spacer"}),t),s=null,r=d("span",{class:"confirm-text"}),a=d("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>f()}),l=d("button",{type:"button",class:"btn danger",text:"Delete",onclick:()=>{let g=s;f(!1),e.deleteVersion(g),y(e.getState().active)}}),c=d("div",{class:"top confirm-row",hidden:!0,role:"group","aria-label":"Confirm delete"},r,a,l);c.addEventListener("keydown",g=>{g.key==="Escape"&&(g.stopPropagation(),f())});function p(g){let b=e.changesFor(e.getState().versions[g]).length;s=g,r.replaceChildren(d("strong",{text:`Delete Version ${g}?`})," ",d("span",{text:b?`Its ${b} change${b===1?"":"s"} will be lost.`:"It has no changes."})),i.hidden=!0,c.hidden=!1,a.focus()}function f(g=!0){let b=s;s=null,i.hidden=!1,c.hidden=!0,g&&b&&y(b)}let v=new Map,m=new Map,C=new Map,M="";function y(g){v.get(g)?.focus()}function V(g){v.clear(),m.clear(),C.clear(),n.replaceChildren(...g.map(b=>{let u=d("button",{type:"button",role:"tab",class:"vtab-btn",onclick:()=>e.view(b),...b==="original"?{}:{"aria-keyshortcuts":"Delete"}},b==="original"?"Original":b);if(v.set(b,u),b==="original")return u;let h=d("span",{class:"dot","aria-hidden":"true"});u.appendChild(h),m.set(b,h);let k=d("button",{type:"button",class:"vtab-x","aria-label":`Delete Version ${b}`,tabIndex:-1,onclick:w=>{w.stopPropagation(),p(b)}},E(R.close));return C.set(b,k),d("span",{class:"vtab"},u,k)}))}return n.addEventListener("keydown",g=>{let b=[...v.keys()],u=n.getRootNode().activeElement,h=b.findIndex(L=>v.get(L)===u);if(h<0)return;let k=b[h];if((g.key==="Delete"||g.key==="Backspace")&&k!=="original"&&e.versionIds().length>1){g.preventDefault(),p(k);return}let w=-1;g.key==="ArrowRight"?w=(h+1)%b.length:g.key==="ArrowLeft"?w=(h-1+b.length)%b.length:g.key==="Home"?w=0:g.key==="End"&&(w=b.length-1),!(w<0)&&(g.preventDefault(),e.view(b[w]),y(b[w]))}),{row:i,confirmRow:c,shortcut(g){if(!g.altKey||!g.shiftKey||g.metaKey||g.ctrlKey)return!1;let b=/^Digit([0-3])$/.exec(g.code);if(!b)return!1;let u=b[1]==="0"?"original":["A","B","C"][Number(b[1])-1];return u!=="original"&&!e.getState().versions[u]?!1:(e.view(u),y(u),!0)},render(){let g=e.getState(),b=["original",...e.versionIds()],u=b.join();u!==M&&(V(b),M=u);let h=b.length>2;for(let[k,w]of v){let L=k===g.active;w.setAttribute("aria-selected",String(L)),w.tabIndex=L?0:-1}for(let[k,w]of m)w.hidden=e.changesFor(g.versions[k]).length===0;for(let[k,w]of C){let L=h&&k===g.active;w.hidden=!L,w.parentElement.classList.toggle("deletable",L)}o.hidden=!e.canCreateVersion(),s&&!g.versions[s]&&f(!1)}}}var Xe=`
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
`;var St="design-tweaker-root";function We(){let e=document.createElement(St);e.style.setProperty("position","fixed","important"),e.style.setProperty("z-index","2147483000","important"),e.style.setProperty("display","block","important");let t=e.attachShadow({mode:"open"}),n=document.createElement("style");n.textContent=Xe;let o=d("div",{class:"root"});return t.append(n,o),document.body.appendChild(e),{host:e,shadow:t,root:o}}function Vt(e,t,n,o){let i=new Map,s=d("div",{class:`seg ${t}`,role:"tablist","aria-label":e});for(let r of n){let a=d("button",{type:"button",role:"tab",id:j("tab"),onclick:()=>o(r.id)},...r.content);i.set(r.id,a),s.appendChild(a)}return s.addEventListener("keydown",r=>{let a=[...i.keys()],l=a.findIndex(p=>i.get(p)===s.getRootNode().activeElement);if(l<0)return;let c=-1;r.key==="ArrowRight"?c=(l+1)%a.length:r.key==="ArrowLeft"?c=(l-1+a.length)%a.length:r.key==="Home"?c=0:r.key==="End"&&(c=a.length-1),!(c<0)&&(r.preventDefault(),o(a[c]),i.get(a[c]).focus())}),{el:s,buttons:i,select(r){for(let[a,l]of i){let c=a===r;l.setAttribute("aria-selected",String(c)),l.tabIndex=c?0:-1}}}}function Ze(e){let t=d("span",{class:"badge",hidden:!0});return{button:d("button",{type:"button",class:"launcher",onclick:e},E(R.sliders),t),badge:t}}function Ye(e,t,n,o){let i=!0,s=(a,l)=>{i=a,t.hidden=!a,e.hidden=a,l&&(a?n():e).focus(),o?.(a)},r=a=>{a.altKey&&a.shiftKey&&!a.ctrlKey&&!a.metaKey&&a.code==="KeyT"&&(a.preventDefault(),s(!i,!0))};return window.addEventListener("keydown",r),{set:s,isExpanded:()=>i,dispose:()=>window.removeEventListener("keydown",r)}}function qe(e,t){let{host:n,shadow:o,root:i}=We(),s=e.config,r=t.ui.tab,a=t.ui.expanded,l=()=>t.onUiChange({expanded:a,tab:r}),c=d("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>ne.set(!1,!0)},E(R.minimise)),p=Je(e,c),f=d("span",{class:"count",hidden:!0}),v=Vt("Sections","tabs",[{id:"controls",content:["Controls"]},{id:"checks",content:["Checks",f]},{id:"suggestions",content:["Suggestions"]}],x=>{r=x,l(),oe()}),m=Ke(s.tokens,{set:(x,T)=>e.set(x,T),commit:()=>e.commit()}),C=De(x=>e.apply(x)),M={controls:m.el,checks:C.el,suggestions:d("div",{class:"empty",text:"Suggestions arrive in milestone M4."})};for(let x of Object.keys(M)){let T=v.buttons.get(x),$=M[x];$.id=j("tabpanel"),$.setAttribute("role","tabpanel"),$.setAttribute("aria-labelledby",T.id),$.tabIndex=-1,T.setAttribute("aria-controls",$.id)}let y=d("div",{class:"body"},...Object.values(M)),V=/Mac|iPhone|iPad/.test(navigator.platform)?"\u2318":"Ctrl+",g=d("button",{type:"button",class:"icon-btn","aria-label":"Undo","data-tip":`Undo (${V}Z)`,"data-tip-pos":"start",onclick:()=>e.undo()},E(R.undo)),b=d("button",{type:"button",class:"icon-btn","aria-label":"Redo","data-tip":`Redo (${V}${V==="\u2318"?"\u21E7":"Shift+"}Z)`,onclick:()=>e.redo()},E(R.redo)),u=d("button",{type:"button",class:"icon-btn","aria-label":"Reset all","data-tip":"Reset all",onclick:()=>Q(!0)},E(R.resetAll)),h=d("button",{type:"button",class:"btn primary copy",onclick:()=>rt()}),k=d("div",{class:"footer-row"},g,b,u,d("span",{class:"spacer"}),h),w=d("button",{type:"button",class:"btn",text:"Cancel",onclick:()=>Q(!1,!0)}),L=d("div",{class:"footer-row confirm-row",hidden:!0,role:"group","aria-label":"Confirm reset"},d("span",{class:"confirm-text",text:"Reset this version to the original?"}),w,d("button",{type:"button",class:"btn primary",text:"Reset",onclick:()=>{e.resetAll(),Q(!1,!0)}}));L.addEventListener("keydown",x=>{x.key==="Escape"&&(x.stopPropagation(),Q(!1,!0))});let he=d("div",{class:"note",hidden:!0},E(R.info),"Showing the original design. Pick a version to edit."),nt=d("footer",{class:"footer"},k,L,he),q=!1;function Q(x,T=!1){q=x,oe(),x?w.focus():T&&(u.disabled?g:u).focus()}let D=d("div",{class:"toast",role:"status","aria-live":"polite"}),de;function ot(x){D.textContent=x,D.classList.add("show"),clearTimeout(de),de=setTimeout(()=>{D.classList.remove("show"),D.textContent=""},3e3)}let ee=d("textarea",{class:"manual-text",readonly:!0,"aria-label":"Changes to copy",spellcheck:"false"}),it=d("button",{type:"button",class:"btn",text:"Close",onclick:()=>me()}),te=d("div",{class:"manual",hidden:!0,role:"dialog","aria-label":"Copy this manually"},d("div",{class:"manual-head"},d("strong",{text:"Copy this manually"}),it),d("p",{text:"Copying to the clipboard didn't work. Select the text below, copy it, and paste it into Claude Code."}),ee);te.addEventListener("keydown",x=>{x.key==="Escape"&&(x.stopPropagation(),me())});function me(){te.hidden=!0,h.focus()}async function rt(){e.commit();let x=e.getState();if(x.active==="original"||e.changes().length===0)return;let T=Le(s,x.active,e.shownValues(),x.defaults);await Oe(T,o)==="failed"?(ee.value=T,te.hidden=!1,ee.focus(),ee.select()):ot("Copied \u2014 paste it into Claude Code")}let ue=d("section",{class:"win","aria-label":"Design Tweaker"},p.row,p.confirmRow,v.el,y,nt,te,D);ue.addEventListener("keydown",x=>{if(p.shortcut(x)){x.preventDefault();return}if(!(x.metaKey||x.ctrlKey)||x.altKey||x.code!=="KeyZ")return;let T=x.composedPath()[0];T instanceof HTMLInputElement&&T.type==="text"||(x.preventDefault(),x.shiftKey?e.redo():e.undo())});let K=Ze(()=>ne.set(!0,!0));i.append(K.button,ue);let ne=Ye(K.button,ue,()=>c,x=>{a=x,l()});ne.set(a,!1);function oe(){let x=e.getState(),T=x.active==="original",$=e.changes().length;p.render(),v.select(r);for(let xe of Object.keys(M))M[xe].hidden=xe!==r;m.update(e.shownValues(),x.defaults,T),(T||$===0)&&(q=!1),k.hidden=T||q,L.hidden=T||!q,he.hidden=!T,g.disabled=!e.canUndo(),b.disabled=!e.canRedo(),u.disabled=$===0,h.textContent=$===0?"Copy changes":`Copy ${$} change${$===1?"":"s"}`,h.disabled=$===0,K.badge.hidden=$===0,K.badge.textContent=String($),K.button.setAttribute("aria-label",`Open Design Tweaker${$?` (${$} unsaved change${$===1?"":"s"})`:""}`)}let U;function be(){clearTimeout(U),U=void 0;let x=je(s,e.shownValues()),T=x.filter($=>$.severity==="warning").length;C.update(x,e.getState().active==="original"),f.hidden=T===0,f.textContent=T?String(T):"",f.setAttribute("aria-label",`${T} warning${T===1?"":"s"}`)}let st=()=>{clearTimeout(U),U=setTimeout(be,100)},at=e.subscribe(()=>{oe(),st()});return oe(),be(),{destroy(){at(),clearTimeout(de),clearTimeout(U),ne.dispose(),n.remove()}}}function Qe(e){let{host:t,root:n}=We(),o=d("button",{type:"button",class:"icon-btn","aria-label":"Minimise Design Tweaker","data-tip":"Minimise (\u2325\u21E7T)",onclick:()=>r.set(!1,!0)},E(R.minimise)),i=d("section",{class:"win","aria-label":"Design Tweaker",style:"height:auto;min-height:0"},d("div",{class:"top"},d("strong",{text:"Design Tweaker"}),d("span",{class:"spacer"}),o),d("div",{class:"body error-msg",role:"alert"},d("strong",{text:"The tweak config couldn't be loaded."}),d("code",{text:e}),d("span",{text:"Fix tweak.config.json and reload the page."}))),s=Ze(()=>r.set(!0,!0));s.badge.hidden=!1,s.badge.classList.add("error"),s.badge.textContent="!",s.button.setAttribute("aria-label","Open Design Tweaker (config error)"),n.append(s.button,i);let r=Ye(s.button,i,()=>o);return r.set(!0,!1),{destroy(){r.dispose(),t.remove()}}}var ce="[design-tweaker]",P=null;function tt(e){if(P){console.warn(`${ce} mount() called twice; ignoring.`);return}let t=we(e);if(!t.ok){console.error(`${ce} ${t.error}`),P={panel:Qe(t.error)};return}let{config:n,warnings:o}=t;for(let y of o)console.warn(`${ce} ${y}`);let i=getComputedStyle(document.documentElement);for(let y of Te(n,V=>i.getPropertyValue(V)))console.warn(`${ce} Config out of date: ${y}`);let s=Ie(n),r=new le(n,{versions:s.versions,active:s.ui.active}),a=s.ui,l=Ee(n),c=()=>l.schedule({baseDefaults:r.getState().defaults,versions:r.committedVersions(),ui:{...a,active:r.getState().active}}),p=new ae,f=()=>p.write(Se(n,r.shownValues(),r.getState().defaults)),v=r.subscribe(f),m=r.subscribe(c);f(),P={panel:qe(r,{ui:a,onUiChange(y){a={...a,...y},c()}}),writer:p,stop:()=>{v(),m(),l.flush()}}}function $t(){P&&(P.stop?.(),P.writer?.remove(),P.panel.destroy(),P=null)}window.TweakPanel={mount:tt,unmount:$t};function et(){let e=document.getElementById("tweak-config");e&&e.getAttribute("type")==="application/json"&&tt(e.textContent??"")}document.body?et():document.addEventListener("DOMContentLoaded",et,{once:!0});})();
