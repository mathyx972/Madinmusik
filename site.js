/* Madin Musik — script du site.
   Le contenu (sons, mixtapes, vidéos, émissions, artistes, archives, index, pubs, textes)
   est lu dans le dossier /content, que la page /admin met à jour. */
(()=>{
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth=reduce?'auto':'smooth';
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null&&text!=='')e.textContent=text;return e;};
  const setText=(sel,v)=>{const n=$(sel);if(n&&v!=null&&v!=='')n.textContent=v;};
  const toastEl=$('#toast');let toastT;
  function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),2800);}

  /* ---------- Images : illustration dessinée si une photo manque ou ne charge pas ---------- */
  function artFor(alt){alt=norm(alt);if(/vinyl|disque|mixtape|album|cassette/.test(alt))return'tape';if(/bele|tambou|instrument/.test(alt))return'ronde';if(/micro|radio|studio|console|emission/.test(alt))return'tape';if(/dj|platine|sound/.test(alt))return'speaker';return'flyer';}
  function artSvg(name){const w=document.createElement('span');w.innerHTML='<svg class="art-fb" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><use href="#'+name+'"/></svg>';return w.firstChild;}
  function guard(img,art){const fail=()=>{if(img.dataset.fb)return;img.dataset.fb='1';img.replaceWith(artSvg(art||artFor(img.alt)));};img.addEventListener('error',fail);if(img.complete&&img.naturalWidth===0&&img.getAttribute('src'))fail();}
  function picture(src,alt,art){if(!src)return artSvg(art||artFor(alt));const i=document.createElement('img');i.src=src;i.alt=alt||'';i.loading='lazy';guard(i,art);return i;}
  $$('img').forEach(i=>guard(i));
  function setPicture(holder,src,alt){if(!holder||!src)return;holder.replaceChildren(picture(src,alt));}

  /* ---------- Dossiers ---------- */
  const tabs=$$('[data-tab]');
  function selectTab(name){tabs.forEach(t=>{const on=t.dataset.tab===name;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));});$$('[data-pane]').forEach(p=>p.classList.toggle('active',p.dataset.pane===name));}
  tabs.forEach(t=>t.addEventListener('click',()=>selectTab(t.dataset.tab)));
  $$('[data-tab-link]').forEach(a=>a.addEventListener('click',()=>selectTab(a.dataset.tabLink)));

  /* ---------- Fenêtre (infos, fiches, résultats) ---------- */
  const backdrop=$('#dialogBackdrop'),dTitle=$('#dialogTitle'),dText=$('#dialogText'),dKicker=$('#dialogKicker'),dMedia=$('#dialogMedia'),dMeta=$('#dialogMeta'),dAudio=$('#dialogAudio'),dList=$('#dialogList'),dResults=$('#dialogResults'),dActions=$('#dialogActions');let lastFocus=null;
  const modalData={
    contribuer:['PARTICIPATION','Contribuer aux archives','Bientôt, chacun pourra proposer un flyer, une pochette, un extrait, une biographie ou une correction. L’équipe vérifie chaque information avant publication. En attendant, écrivez à la bibliothèque : l’adresse est en bas de la page.'],
    publicite:['PARTENARIAT','Un espace publicitaire intégré','Bannières et bandeaux pour les marques, événements et acteurs culturels, toujours signalés « Publicité ». Pour réserver un emplacement, écrivez à la bibliothèque.'],
    audio:['IDENTIFICATION COLLECTIVE','C’est quoi ce son ?','Le principe : déposer un court extrait audio, indiquer quelques indices, puis laisser la communauté identifier le titre, l’artiste ou le riddim. Cette fonction arrivera dans une prochaine version.'],
    archive:['DOCUMENTATION','Les véritables pièces arrivent','Les mixtapes, flyers, clips et événements du fonds Madin Musik sont ajoutés au fur et à mesure depuis la page d’administration.'],
    fiche:['FICHE DOCUMENTÉE','Une fiche par genre, artiste ou objet','Chaque fiche réunira une notice sourcée, les morceaux associés, les archives liées et les témoignages de la communauté.'],
    ecoute:['ÉCOUTE','Les extraits arrivent avec le fonds','Chaque fiche proposera des extraits courts, avec l’accord des ayants droit, et un lien vers les plateformes où écouter les morceaux en entier.']
  };
  function resetDialog(){dMedia.hidden=true;dMedia.replaceChildren();dMeta.hidden=true;dMeta.replaceChildren();dAudio.hidden=true;dAudio.pause();dAudio.removeAttribute('src');dList.hidden=true;dResults.hidden=true;dResults.replaceChildren();dActions.replaceChildren();dText.textContent='';}
  function showDialog(){lastFocus=document.activeElement;backdrop.classList.add('open');backdrop.setAttribute('aria-hidden','false');backdrop.querySelector('.modal').scrollTop=0;$('#closeDialog').focus();}
  function openDialog(key){resetDialog();const [k,t,d]=modalData[key]||modalData.archive;dKicker.textContent=k;dTitle.textContent=t;dText.textContent=d;showDialog();}
  function closeDialog(){if(!backdrop.classList.contains('open'))return;dAudio.pause();dMedia.replaceChildren();backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  function bindDialogs(root){(root||document).querySelectorAll('[data-dialog]').forEach(n=>{if(n.dataset.bound)return;n.dataset.bound='1';n.addEventListener('click',e=>{if(n.dataset.href)return;e.preventDefault();openDialog(n.dataset.dialog);});if(n.tagName!=='BUTTON')n.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openDialog(n.dataset.dialog);}});});}
  bindDialogs();
  $('#closeDialog').addEventListener('click',closeDialog);$('#dialogOk').addEventListener('click',closeDialog);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeDialog();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialog();closeMenu();}});

  /* ---------- Contenu ---------- */
  const DATA={reglages:{},sons:[],mixtapes:[],videos:[],emissions:[],artistes:[],archives:[],index:[],pubs:{}};
  const yt=u=>{const m=String(u||'').match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);return m?m[1]:null;};
  const fmtDate=d=>{if(!d)return'';const t=new Date(d);return isNaN(t)?String(d):t.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});};
  const KIND={
    sons:{label:()=> 'Son',title:i=>i.titre,sub:i=>i.artiste,meta:i=>[i.genre,i.annee],img:i=>i.image,text:i=>i.description,playable:i=>!!(i.audio||i.lien),
      rows:i=>[['Artiste',i.artiste],['Année',i.annee],['Genre',i.genre]],
      links:i=>[i.lien&&['ÉCOUTER LE MORCEAU ↗',i.lien]],audio:i=>i.audio},
    mixtapes:{label:i=>i.type||'Mixtape',title:i=>i.titre,sub:i=>i.auteur,meta:i=>[i.type,i.annee],img:i=>i.image,text:i=>i.description,playable:i=>!!(i.audio||i.lien),
      rows:i=>[['Par',i.auteur],['Année',i.annee],['Type',i.type]],list:i=>i.liste_titres,
      links:i=>[i.lien&&['ÉCOUTER ↗',i.lien]],audio:i=>i.audio},
    videos:{label:()=> 'Vidéo',title:i=>i.titre,sub:i=>i.artiste,meta:i=>['Vidéo',i.annee],img:i=>i.image||(yt(i.lien_video)?'https://img.youtube.com/vi/'+yt(i.lien_video)+'/hqdefault.jpg':''),text:i=>i.description,playable:i=>!!i.lien_video,
      rows:i=>[['Artiste',i.artiste],['Année',i.annee]],video:i=>i.lien_video,
      links:i=>[i.lien_video&&['VOIR SUR LA PLATEFORME ↗',i.lien_video]]},
    emissions:{label:()=> 'Émission',title:i=>i.titre,sub:i=>i.invite?'Avec '+i.invite:'Madin Musik',meta:i=>['Émission',fmtDate(i.date)],img:i=>i.image,text:i=>i.description,playable:i=>!!(i.audio||i.lien),
      rows:i=>[['Date',fmtDate(i.date)],['Invité',i.invite]],
      links:i=>[i.lien&&['ÉCOUTER L’ÉMISSION ↗',i.lien]],audio:i=>i.audio},
    artistes:{label:()=> 'Artiste',title:i=>i.nom,sub:i=>i.role,meta:i=>[i.ville],img:i=>i.photo,text:i=>i.bio,
      rows:i=>[['Rôle',i.role],['Ville',i.ville],['Actif',i.actif],['Styles',i.genres]],
      links:i=>[i.lien&&['SUIVRE L’ARTISTE ↗',i.lien]]},
    archives:{label:i=>i.type||'Archive',title:i=>i.titre,sub:i=>i.credit,meta:i=>[i.type,i.annee],img:i=>i.image,text:i=>i.description,
      rows:i=>[['Type',i.type],['Année',i.annee],['Crédit',i.credit]],links:()=>[]}
  };
  function openItem(kind,item){const K=KIND[kind];resetDialog();
    const vid=K.video&&yt(K.video(item));
    if(vid){const box=el('div','yt');const f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+vid;f.title=K.title(item)||'Vidéo';f.allow='accelerometer; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.loading='lazy';box.append(f);dMedia.append(box);dMedia.hidden=false;}
    else{const src=K.img(item);if(src){dMedia.append(picture(src,K.title(item)));dMedia.hidden=false;}}
    dKicker.textContent=[K.label(item)].concat(K.meta(item).slice(1)).filter(Boolean).join(' · ').toUpperCase();
    dTitle.textContent=K.title(item)||'Sans titre';
    const rows=(K.rows(item)||[]).filter(r=>r[1]);if(rows.length){rows.forEach(([a,b])=>dMeta.append(el('dt','',a),el('dd','',String(b))));dMeta.hidden=false;}
    const au=K.audio&&K.audio(item);if(au){dAudio.src=au;dAudio.hidden=false;}
    dText.textContent=K.text(item)||'';
    const li=K.list&&K.list(item);if(li){dList.textContent=li;dList.hidden=false;}
    (K.links(item)||[]).filter(Boolean).forEach(([label,href],n)=>{const a=el('a',n?'secondary':'primary',label);a.href=href;a.target='_blank';a.rel='noopener';dActions.append(a);});
    showDialog();}

  function card(kind,item){const K=KIND[kind];const b=el('button','item-card');b.type='button';
    const pic=el('span','ic-pic');pic.append(picture(K.img(item),K.title(item)+' '+K.label(item)));pic.append(el('span','ic-badge',K.label(item)));
    if(K.playable&&K.playable(item)){const p=el('span','ic-play');p.innerHTML='<svg width="14" height="14" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 9 5 2 9Z" fill="currentColor"/></svg>';pic.append(p);}
    const c=el('span','ic-copy');const meta=K.meta(item).filter(Boolean).join(' · ');if(meta)c.append(el('span','ic-meta',meta));c.append(el('h3','',K.title(item)||'Sans titre'));if(K.sub(item))c.append(el('span','ic-sub',K.sub(item)));
    b.append(pic,c);b.addEventListener('click',()=>openItem(kind,item));return b;}

  function renderList(kind,grid,moreRow,moreBtn,step,emptyMsg){let shown=step;
    const draw=()=>{moreBtn.onclick=()=>{shown+=step;draw();};const items=DATA[kind]||[];grid.replaceChildren();if(!items.length){const n=el('div','empty-note');n.innerHTML='';n.append(el('b','',emptyMsg),document.createTextNode(' Ajoutez-en depuis la page d’administration (/admin).'));grid.append(n);moreRow.hidden=true;return;}
      items.slice(0,shown).forEach(it=>grid.append(card(kind,it)));moreRow.hidden=items.length<=shown;};
    return {draw,reset(){shown=step;draw();}};}

  /* Média : 4 rubriques */
  let mediaKind='sons';const mediaTabs=$$('[data-media]');
  const mediaList={};['sons','mixtapes','videos','emissions'].forEach(k=>mediaList[k]=renderList(k,$('#mediaGrid'),$('#mediaMoreRow'),$('#mediaMore'),8,'Rien ici pour l’instant.'));
  function selectMedia(k){mediaKind=k;mediaTabs.forEach(t=>{const on=t.dataset.media===k;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));});mediaList[k].reset();}
  mediaTabs.forEach(t=>t.addEventListener('click',()=>selectMedia(t.dataset.media)));
  const artistesList=renderList('artistes',$('#artistesGrid'),$('#artistesMoreRow'),$('#artistesMore'),8,'Aucune fiche artiste pour l’instant.');
  const archivesList=renderList('archives',$('#archivesGrid'),$('#archivesMoreRow'),$('#archivesMore'),8,'Aucune pièce versée pour l’instant.');

  /* ---------- L'index : étagère de fiches ---------- */
  const CLASS={a:['CLASSEUR A','Tambour et danse'],b:['CLASSEUR B','Bal et salon'],c:['CLASSEUR C','Musiques actuelles'],d:['CLASSEUR D','Instruments et supports']};
  let FICHES=[['a','Bèlè',"Chant, tambour et danse, hérités des habitations et toujours vivants, notamment dans le nord atlantique de l'île.",'ronde'],['c','Ragga dancehall',"La scène underground des années 2000, le cœur de L'Otantik Style.",'flyer'],['c','Zouk',"Né dans les années 1980 entre Martinique et Guadeloupe, et parti faire le tour du monde.",'tape'],['d','Mixtape',"CD gravés et cassettes, faces A et B, qui passaient de main en main.",'tape']];
  const shelf=$('#shelf'),fb=$('#ficheBody'),artUse=$('#ficheArt use');let current=-1,swapT,spines=[],filter=null;
  const hoverable=matchMedia('(hover: hover)').matches;const legend=$$('.legend-btn');
  function showFiche(i,instant){const f=FICHES[i];if(!f||i===current)return;if(spines[current])spines[current].setAttribute('aria-pressed','false');current=i;spines[i].setAttribute('aria-pressed','true');
    const apply=()=>{$('#ficheNum').textContent='FICHE N° '+String(i+1).padStart(3,'0');$('#ficheClass').textContent=(CLASS[f[0]]||CLASS.a)[0];$('#ficheName').textContent=f[1];$('#ficheKind').textContent=(CLASS[f[0]]||CLASS.a)[1];$('#ficheText').textContent=f[2];artUse.setAttribute('href','#'+(f[3]||'flyer'));fb.classList.remove('swap');};
    clearTimeout(swapT);if(instant||reduce){apply();return;}fb.classList.add('swap');swapT=setTimeout(apply,130);}
  function buildShelf(){shelf.replaceChildren();current=-1;spines=FICHES.map((f,i)=>{const b=el('button','spine');b.type='button';b.dataset.k=f[0];b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',f[1]+', '+(CLASS[f[0]]||CLASS.a)[1]);b.style.height=(82+((i*37)%18))+'%';b.append(el('span','',f[1]),el('em','',(CLASS[f[0]]||CLASS.a)[1].split(' ')[0]));b.addEventListener('click',()=>showFiche(i));if(hoverable)b.addEventListener('mouseenter',()=>showFiche(i));shelf.append(b);return b;});
    $('#shelfHint').textContent=FICHES.length+' FICHES · TOUCHEZ UN DOS POUR L’OUVRIR';if(FICHES.length)showFiche(0,true);if(filter)setFilter(filter);}
  function findFiche(q){const w=norm(q);if(!w)return -1;let i=FICHES.findIndex(f=>norm(f[1])===w);if(i<0)i=FICHES.findIndex(f=>norm(f[1]).includes(w)||w.includes(norm(f[1])));return i;}
  function openFiche(name){const i=findFiche(name);if(i<0)return false;setFilter(null);showFiche(i);$('#index').scrollIntoView({behavior:smooth,block:'start'});return true;}
  function setFilter(k){filter=k;legend.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.k===k)));spines.forEach(s=>s.classList.toggle('dim',!!k&&s.dataset.k!==k));if(k&&FICHES[current]&&FICHES[current][0]!==k){const j=FICHES.findIndex(f=>f[0]===k);if(j>=0)showFiche(j);}}
  legend.forEach(b=>b.addEventListener('click',()=>setFilter(filter===b.dataset.k?null:b.dataset.k)));
  $$('[data-fiche]').forEach(n=>n.addEventListener('click',e=>{e.preventDefault();openFiche(n.dataset.fiche);}));
  buildShelf();

  /* ---------- Recherche dans tout le site ---------- */
  const form=$('#searchForm'),input=$('#searchInput');
  function runSearch(q){const w=norm(q);if(!w)return;const hits=[];
    ['sons','mixtapes','videos','emissions','artistes','archives'].forEach(k=>{const K=KIND[k];(DATA[k]||[]).forEach(it=>{const hay=norm([K.title(it),K.sub(it),K.text(it),K.meta(it).join(' '),it.genre,it.genres].join(' '));if(hay.includes(w))hits.push([k,it]);});});
    const fi=FICHES.map((f,i)=>[f,i]).filter(([f])=>norm(f[1]+' '+f[2]).includes(w)||w.includes(norm(f[1])));
    if(!hits.length&&fi.length===1){openFiche(fi[0][0][1]);toast('Fiche trouvée dans l’index : '+fi[0][0][1]);return;}
    resetDialog();dKicker.textContent='RECHERCHE';dTitle.textContent='« '+q.trim()+' »';
    if(!hits.length&&!fi.length){dText.textContent='Aucun résultat pour l’instant. Essayez « bèlè », « zouk », « mixtape » ou un nom d’artiste.';showDialog();return;}
    dText.textContent=(hits.length+fi.length)+' résultat'+((hits.length+fi.length)>1?'s':'')+' dans la bibliothèque.';
    fi.slice(0,6).forEach(([f])=>{const li=el('li');const b=el('button');b.type='button';b.append(el('b','',f[1]),el('span','','Fiche de l’index'));b.addEventListener('click',()=>{closeDialog();openFiche(f[1]);});li.append(b);dResults.append(li);});
    hits.slice(0,14).forEach(([k,it])=>{const K=KIND[k];const li=el('li');const b=el('button');b.type='button';b.append(el('b','',K.title(it)||'Sans titre'),el('span','',K.label(it)));b.addEventListener('click',()=>openItem(k,it));li.append(b);dResults.append(li);});
    dResults.hidden=false;showDialog();}
  form.addEventListener('submit',e=>{e.preventDefault();input.blur();runSearch(input.value);});
  function bindQuick(){$$('[data-quick]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{input.value=b.dataset.quick;runSearch(b.dataset.quick);});});}
  bindQuick();

  /* ---------- Menu mobile, en-tête, section active ---------- */
  const menu=$('#mainMenu'),toggle=$('#mobileMenuButton');
  function closeMenu(){menu.classList.remove('mobile-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';toggle.setAttribute('aria-label','Ouvrir le menu');}
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('mobile-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰';toggle.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('click',e=>{if(menu.classList.contains('mobile-open')&&!e.target.closest('.header-bar'))closeMenu();});
  const bar=$('#headerBar');const onScroll=()=>bar.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',onScroll,{passive:true});onScroll();
  const navLinks=$$('#mainMenu a[href^="#"]:not([data-tab-link]), .bottom-nav a[href^="#"]:not([data-tab-link])');
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}),{rootMargin:'-45% 0px -50% 0px'});['bibliotheque','index','media','decouvrir','madin-id','histoire'].forEach(id=>{const s=document.getElementById(id);if(s)io.observe(s);});}

  /* ---------- Madin ID (démonstration) ---------- */
  const live=$('#idLive');for(let i=0;i<28;i++){const b=document.createElement('i');b.style.setProperty('--d',(-(i*53)%800)+'ms');live.appendChild(b);}
  const demoBox=$('#idDemo'),trigger=$('#madinTest'),tryBtn=$('#madinTry'),file=$('#madinFile'),result=$('#madinResult'),status=$('#madinStatus'),prog=$('#madinProg'),steps=$$('#idSteps span');let iv;
  const STEPS=['ÉCOUTE EN COURS…','ANALYSE DE L’EMPREINTE SONORE…','RECHERCHE DANS LES ARCHIVES…'];
  const setStep=n=>steps.forEach((s,i)=>s.classList.toggle('on',n>=0&&i<=n));
  function btn(label,fn,alt){const b=el('button',alt?'alt':'',label);b.type='button';b.addEventListener('click',fn);return b;}
  function showResult(mode,name){result.replaceChildren();const k=el('div','r-kicker');const h=el('h3');const p=el('p');const acts=el('div','r-actions');
    if(mode==='demo'){status.textContent='EXEMPLE DE PARCOURS TERMINÉ';setStep(2);const s=(DATA.sons||[]).find(x=>x.a_la_une)||(DATA.sons||[])[0];k.textContent='EXEMPLE DE RÉSULTAT · AUCUN SON ANALYSÉ';
      if(s){h.textContent=(s.titre||'')+(s.artiste?' — '+s.artiste:'');p.textContent='Illustration du parcours : le morceau reconnu ouvre directement sa fiche dans la bibliothèque.';acts.append(btn('OUVRIR LA FICHE DU MORCEAU ↗',()=>openItem('sons',s)));}
      else{h.textContent='Méloman — Un Poco!';p.textContent='Illustration du résultat souhaité : titre, artiste, année, pochette et sources documentées.';}
      acts.append(btn('FICHE « RAGGA DANCEHALL »',()=>openFiche('Ragga dancehall'),true));}
    else{status.textContent='FICHIER SÉLECTIONNÉ';setStep(0);k.textContent='FICHIER LOCAL / NON ENVOYÉ';h.textContent=name;p.textContent='Le fichier est bien choisi, mais la reconnaissance audio n’est pas encore branchée. Le futur Madin ID cherchera dans la base, puis proposera une identification communautaire.';acts.append(btn('DEMANDER À LA COMMUNAUTÉ ↗',()=>$('#identifier').scrollIntoView({behavior:smooth})));}
    result.append(k,h,p,acts);result.classList.add('show');}
  function demo(){clearInterval(iv);result.classList.remove('show');demoBox.classList.add('listening');setStep(0);let t=0;const D=reduce?300:2700;prog.style.width='0%';
    iv=setInterval(()=>{t+=60;const p=Math.min(1,t/D);prog.style.width=(p*100)+'%';const n=Math.min(2,Math.floor(p*3));status.textContent=STEPS[n];setStep(Math.min(1,n));if(p>=1){clearInterval(iv);demoBox.classList.remove('listening');showResult('demo');}},60);}
  trigger.addEventListener('click',demo);tryBtn.addEventListener('click',demo);
  file.addEventListener('change',()=>{clearInterval(iv);demoBox.classList.remove('listening');prog.style.width='0%';if(file.files&&file.files[0])showResult('file',file.files[0].name);});

  /* ---------- Copier l'adresse ---------- */
  const mail=$('#mail'),copied=$('#copied');
  function selectMail(){const r=document.createRange();r.selectNodeContents(mail);const s=getSelection();s.removeAllRanges();s.addRange(r);copied.textContent='ADRESSE SÉLECTIONNÉE';}
  $('#copyMail').addEventListener('click',()=>{try{navigator.clipboard.writeText(mail.textContent).then(()=>{copied.textContent='ADRESSE COPIÉE';toast('Adresse copiée');},selectMail);}catch(e){selectMail();}});

  /* ---------- Mur de sound system (96 BPM) ---------- */
  const cv=$('#wall');let W=0,H=0,ctx=null,cells=[];
  function layoutWall(){const dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;if(!W||!H)return;cv.width=W*dpr;cv.height=H*dpr;ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    const cw=W<700?110:160,ch=cw*1.2,gap=10;const cols=Math.ceil(W/(cw+gap))+1,rows=Math.ceil(H/(ch+gap))+1;const ox=-((cols*(cw+gap)-gap-W)/2),oy=H-rows*(ch+gap)+gap;cells=[];
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++)cells.push({x:ox+k*(cw+gap),y:oy+r*(ch+gap),cw,ch,big:(r+k)%3!==0,hot:(r*7+k*3)%5===0,teal:(r*5+k)%11===0,ph:(r+k)*.6});paint(0);}
  function paint(t){if(!ctx)return;ctx.fillStyle='#071216';ctx.fillRect(0,0,W,H);const beat=t/1000*(96/60)*Math.PI*2;
    for(const c of cells){const kick=reduce?0:Math.pow(Math.max(0,Math.sin(beat-c.ph)),6);const cx=c.x+c.cw/2,cy=c.y+c.ch*.62;
      ctx.fillStyle='#14252a';ctx.fillRect(c.x,c.y,c.cw,c.ch);ctx.strokeStyle='#1f3439';ctx.lineWidth=2;ctx.strokeRect(c.x+5,c.y+5,c.cw-10,c.ch-10);
      ctx.fillStyle='#0a1619';ctx.beginPath();ctx.arc(cx,cy,c.cw*(c.big?.36:.3),0,7);ctx.fill();
      ctx.fillStyle='#1d3237';ctx.beginPath();ctx.arc(cx,cy,c.cw*((c.big?.24:.2)+kick*.035),0,7);ctx.fill();
      ctx.fillStyle=c.hot?'#ff742c':c.teal?'#6ed6c1':'#5a2a14';ctx.beginPath();ctx.arc(cx,cy,c.cw*(.08+kick*.02),0,7);ctx.fill();
      ctx.fillStyle='#0a1619';ctx.beginPath();ctx.arc(cx,c.y+c.ch*.2,c.cw*.12,0,7);ctx.fill();}
    const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(7,18,22,.15)');g.addColorStop(1,'rgba(7,18,22,.75)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  layoutWall();let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layoutWall,150);});
  if(!reduce&&'IntersectionObserver' in window){let raf=0;const loop=t=>{paint(t);raf=requestAnimationFrame(loop);};new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!raf)raf=requestAnimationFrame(loop);else if(!e.isIntersecting&&raf){cancelAnimationFrame(raf);raf=0;}})).observe(cv);}

  /* ---------- Application du contenu ---------- */
  function applyReglages(r){if(!r)return;setText('#toplineText',r.bandeau_haut);setText('#heroL1',r.titre_ligne1);setText('#heroL2',r.titre_ligne2);setText('#heroLead',r.accroche);
    if(Array.isArray(r.recherches_rapides)&&r.recherches_rapides.length){const box=$('#searchTags');box.replaceChildren(el('span','','EXPLORER :'));r.recherches_rapides.filter(Boolean).forEach(q=>{const b=el('button','',q);b.type='button';b.dataset.quick=q;box.append(b);});bindQuick();}
    const u=r.a_la_une;if(u){setText('#uneSurtitre',u.surtitre);setText('#uneTitre',u.titre);setText('#uneTexte',u.texte);if(u.image)setPicture($('#uneImage'),u.image,u.titre);if(u.fiche)$('#uneLien').dataset.fiche=u.fiche;}
    if(r.email){mail.textContent=r.email;}
    if(Array.isArray(r.reseaux)&&r.reseaux.length){const s=$('#socials');s.replaceChildren();r.reseaux.filter(x=>x&&x.lien).forEach(x=>{const a=el('a','',x.nom||x.lien);a.href=x.lien;a.target='_blank';a.rel='noopener';s.append(a);});s.hidden=!s.children.length;}}
  function applyPubs(p){if(!p)return;const b=p.banniere,d=p.bandeau;
    if(b){$('#pubBanniere').hidden=b.actif===false;setText('#pubSurtitre',b.surtitre);setText('#pubTitre',b.titre);setText('#pubAccent',b.titre_accent);setText('#pubTexte',b.texte);setText('#pubBouton',b.bouton);if(b.image)setPicture($('#pubImage'),b.image,'Publicité');linkAd($('#pubBouton'),b.lien);}
    if(d){$('#pubBandeau').hidden=d.actif===false;setText('#bandeauTitre',d.titre);setText('#bandeauAccent',d.titre_accent);setText('#bandeauBouton',d.bouton);linkAd($('#bandeauBouton'),d.lien);}}
  function linkAd(button,href){if(!button||!href)return;button.dataset.href=href;button.onclick=e=>{e.preventDefault();window.open(href,'_blank','noopener');};}
  function applyIndex(items){if(!Array.isArray(items)||!items.length)return;FICHES=items.filter(x=>x&&x.nom).map(x=>[CLASS[x.classeur]?x.classeur:'a',x.nom,x.texte||'',x.illustration||'flyer']);buildShelf();}
  function updateCounts(){const words={sons:['titre','titres'],mixtapes:['projet','projets'],videos:['vidéo','vidéos'],emissions:['émission','émissions']};
    $$('[data-count]').forEach(n=>{const k=n.dataset.count,c=(DATA[k]||[]).length;n.textContent=c+' '+words[k][c>1?1:0];});
    setText('#artistesCount',(DATA.artistes||[]).length+' FICHE'+((DATA.artistes||[]).length>1?'S':''));setText('#archivesCount',(DATA.archives||[]).length+' PIÈCE'+((DATA.archives||[]).length>1?'S':''));}
  function renderAll(){mediaList[mediaKind].reset();artistesList.reset();archivesList.reset();updateCounts();}
  renderAll();

  const FILES=['reglages','sons','mixtapes','videos','emissions','artistes','archives','index','pubs'];
  Promise.all(FILES.map(n=>fetch('content/'+n+'.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null))).then(res=>{
    res.forEach((j,i)=>{if(!j)return;const n=FILES[i];DATA[n]=Array.isArray(j.items)?j.items:j;});
    applyReglages(DATA.reglages);applyPubs(DATA.pubs);applyIndex(DATA.index);renderAll();});
})();
