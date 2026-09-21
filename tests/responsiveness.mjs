// node tests/responsiveness.mjs
// Requires Playwright, or PLAYWRIGHT_MODULE pointing to its index.mjs.
// Runs an isolated Vite server with fixtures; no login, uploads, payouts or live data writes.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const fixture = `
import React, {createContext, useContext, useState, useEffect} from 'react';
const Context = createContext(null);
export const OPERATOR_PAYOUT = 45000;
const report = {id:'report-123456789012345678901234567890', title:'Sampah di jalan utama lingkungan warga', location:'Jl. Lingkungan Warga No. 123, Kecamatan Kota', time:'Baru saja', status:'New', citizenName:'Warga', citizenProfile:'#', photoUrl:'/images/trash_debris.png', details:'Deskripsi laporan '.repeat(15), notes:''};
export function AppProvider({children}) {
 const params=new URLSearchParams(location.search);
 const [reports,setReports]=useState([]);
 useEffect(()=>{if(!params.has('empty'))setTimeout(()=>setReports([{...report,...(params.has('processing')?{status:'Processing',operatorId:'operator-1'}:{})},{...report,id:'other',title:'Pekerjaan operator lain',status:'Processing',operatorId:'other',operatorName:'Operator Lain'}]),50);},[]);
 const value={role:params.get('role')==='login'?null:params.get('role') || 'staff',loading:false,userId:'operator-1',
 user:{name:'Operator Dengan Nama Panjang',email:'operator@example.test',points:1250,cashBalance:100000},reports,
 projects:[{id:'project-1',title:'Gotong royong lingkungan',location:report.location,volunteers:12,donated:120000,target:1000000,emoji:'🌳'}],
 transactions:[{id:'tx1',description:'Laporan Diselesaikan: '+report.title,amount:150,type:'points',time:'Hari ini'}],
 volunteerTask:{id:'task1',location:report.location,issue:report.title,distanceKm:1.2,etaMin:8,payout:45000,rating:4.8,completedTasks:127,status:'accepted'},
 acceptReport:async(id)=>{if(window.failAccept)throw Error('Simulasi gagal menerima');setReports(rs=>rs.map(r=>r.id===id?{...r,status:'Processing',operatorId:'operator-1'}:r));},
 submitOperatorReport:async(id,note,photo)=>{window.testSubmits=(window.testSubmits||0)+1;if(window.failSubmit)throw Error('Simulasi gagal mengunggah');await new Promise(r=>setTimeout(r,150));setReports(rs=>rs.map(r=>r.id===id?{...r,status:'Selesai',notes:note,proofPhotoUrl:'/images/trash_debris.png'}:r));return{payout:45000,balance:145000};},
 logout:async()=>{},joinProject:async()=>true
 };
 return React.createElement(Context.Provider,{value},children);
}
export const useApp=()=>useContext(Context);
`;
const server = await createServer({
 server: {host:'127.0.0.1',port:5187,strictPort:true},
 plugins:[{name:'responsive-fixture',enforce:'pre',load(id){if(id.replaceAll('\\','/').endsWith('/src/context/AppContext.tsx'))return fixture;}}],
});
await server.listen();
const browser = await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const page = await browser.newPage({permissions:['camera']});
const errors=[];
const failures=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://**',route=>route.abort());
const base='http://127.0.0.1:5187';
const title='Sampah di jalan utama lingkungan warga';
const sizes=[[320,568],[375,667],[390,844],[768,1024],[1024,768],[1280,800],[1536,864],[1920,1080],[844,390]];
await mkdir('output/responsive-checks',{recursive:true});
async function check(label) {
 const bad=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{
   const box=el.getBoundingClientRect(),css=getComputedStyle(el);
   if(css.filter.includes('blur('))return false; // Decorative login background blobs.
   return box.width && box.height && (box.left < -1 || box.right > innerWidth+1 ||
     (el.clientWidth && el.scrollWidth > el.clientWidth+2 && !el.querySelector(':scope > .blur-3xl') && !['auto','scroll'].includes(css.overflowX) && css.textOverflow!=='ellipsis' && !['INPUT','TEXTAREA','SELECT'].includes(el.tagName)));
 }).map(el=>({tag:el.tagName,class:el.className,text:el.textContent?.slice(0,45)})).slice(0,6));
 if(bad.length)failures.push({label,bad});
}
async function reachable(locator) {
 await locator.scrollIntoViewIfNeeded();
 const box=await locator.boundingBox(),viewport=page.viewportSize();
 assert(box && box.y>=0 && box.y+box.height<=viewport.height+1,'Control must be reachable');
}
async function openReport() {
 await page.getByRole('button',{name:'Buka laporan '+title,exact:true}).click();

}
try {
 for(const [width,height] of sizes) {
   await page.setViewportSize({width,height});
   await page.goto(base);
   await page.getByRole('button',{name:'Buka laporan '+title,exact:true}).waitFor();
   await check(width+' inbox list');
   await page.getByRole('button',{name:'Buka laporan '+title,exact:true}).click();
   await check(width+' inbox detail');
   assert.equal(await page.getByRole('button',{name:'Detail Laporan',exact:true}).count(),0);
   assert.equal(await page.getByRole('button',{name:/^Tindakan Operator/}).count(),0);
   assert(await page.locator('#report-details').isVisible());
   assert(await page.locator('#operator-actions').isVisible(), 'Operator actions must not be hidden behind a mobile tab');
   if(width<1536) {
     const details=await page.locator('#report-details').boundingBox();
     const actions=await page.locator('#operator-actions').boundingBox();
     assert(actions.y>=details.y+details.height-1, 'Actions follow the details on the same page');
   }
  
   await page.getByRole('button',{name:'Accept & Process'}).click();
   await page.getByText('Laporan Progress Operator',{exact:true}).waitFor();
   await check(width+' operator form');
   await reachable(page.getByRole('button',{name:'Unggah',exact:true}));
   await reachable(page.getByLabel('Deskripsi Pekerjaan'));
   await reachable(page.getByRole('button',{name:'Kirim Laporan & Selesaikan',exact:true}));
   if([375,1024,1536].includes(width))await page.screenshot({path:'output/responsive-checks/staff-'+width+'.png'});
   for(const tab of ['Home','Forum Aksi']) {
     if(width<1024)await page.getByRole('button',{name:'Buka navigasi staff'}).click();
     await page.getByRole('button',{name:tab,exact:true}).click();
     await check(width+' staff '+tab);
   }
   await page.goto(base+'/?role=volunteer');
   for(const tab of ['Home','Forum','Scan','Community','Store']) {
     const name=width>=1024?({Scan:'Scan / Report',Store:'Store / Rewards'}[tab]||tab):tab;
     await page.getByRole('button',{name,exact:true}).last().click();
     await check(width+' citizen '+tab);
   }
   console.log('Checked '+width+'x'+height);
 }
 // A previously accepted report exposes every work control without switching tabs.
 await page.setViewportSize({width:375,height:667});await page.goto(base+'/?processing');await openReport();
 assert(await page.getByText('Laporan Progress Operator',{exact:true}).isVisible());
 await reachable(page.getByRole('button',{name:'Kamera',exact:true}));
 await reachable(page.getByRole('button',{name:'Unggah',exact:true}));
 await reachable(page.getByLabel('Deskripsi Pekerjaan'));
 await reachable(page.getByRole('button',{name:'Kirim Laporan & Selesaikan',exact:true}));
 await page.screenshot({path:'output/responsive-checks/mobile-inline-operator.png'});
 // Phone workflow: errors retain the draft and successful submission shows a reachable receipt.
 await page.setViewportSize({width:375,height:667});await page.goto(base);await openReport();
 await page.evaluate(()=>window.failAccept=true);
 await page.getByRole('button',{name:'Accept & Process'}).click();
 assert.match(await page.getByRole('alert').innerText(),/gagal menerima/);
 await page.evaluate(()=>window.failAccept=false);
 await page.getByRole('button',{name:'Accept & Process'}).click();
 const submit=page.getByRole('button',{name:'Kirim Laporan & Selesaikan',exact:true});
 await submit.click();assert.match(await page.getByRole('alert').innerText(),/foto hasil/);
 await page.getByLabel('Foto hasil pekerjaan',{exact:true}).setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});
 assert.match(await page.getByRole('alert').innerText(),/maksimal 20MB/);
 await page.getByLabel('Foto hasil pekerjaan',{exact:true}).setInputFiles({name:'proof.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=','base64')});
 await submit.click();assert.match(await page.getByRole('alert').innerText(),/laporan singkat/);
 await page.getByLabel('Deskripsi Pekerjaan').fill('Pembersihan selesai, lokasi sudah aman.');
 assert.match(await page.locator('[aria-current="step"]').innerText(),/Kirim & Dibayar/);
 await page.getByRole('button',{name:'← List',exact:true}).click();
 await page.getByRole('button',{name:'Buka laporan '+title,exact:true}).click();
 assert.equal(await page.getByLabel('Deskripsi Pekerjaan').inputValue(),'Pembersihan selesai, lokasi sudah aman.');
 await page.getByRole('button',{name:'Ambil Ulang',exact:true}).click();
 await page.getByRole('button',{name:'Ambil Foto',exact:true}).click();
 await page.getByRole('img',{name:'Foto hasil pekerjaan',exact:true}).waitFor();
 await check('phone camera capture');
 await page.evaluate(()=>window.failSubmit=true);await submit.click();
 assert.match(await page.getByRole('alert').innerText(),/gagal mengunggah/);
 assert(await page.getByRole('img',{name:'Foto hasil pekerjaan',exact:true}).isVisible());
 await page.evaluate(()=>window.failSubmit=false);await submit.click();
 await page.getByRole('dialog',{name:'Tugas Selesai!'}).waitFor();
 await page.setViewportSize({width:667,height:320});
 await reachable(page.getByRole('button',{name:'Tutup',exact:true}));await check('landscape completion');
 await page.getByRole('button',{name:'Tutup',exact:true}).click();
 assert(await page.getByText('Laporan Selesai',{exact:true}).isVisible());
 // A different operator's task remains read-only on mobile.
 await page.getByRole('button',{name:'← List',exact:true}).click();
 await page.getByRole('button',{name:'Buka laporan Pekerjaan operator lain',exact:true}).click();
 assert(await page.getByText('Sedang dikerjakan oleh').isVisible());
 assert.equal(await page.getByLabel('Deskripsi Pekerjaan').count(),0);
 await page.goto(base+'/?empty');await page.getByText('Tidak ada laporan aktif di inbox.').waitFor();await check('empty inbox');
 for(const width of [320,768]) {
   await page.setViewportSize({width,height:667});await page.goto(base+'/?role=login');
   await page.getByRole('heading',{name:'Selamat Datang Kembali'}).waitFor();await check(width+' login');
   await page.getByRole('button',{name:'Daftar Sekarang'}).click();await check(width+' volunteer registration');
   await page.getByRole('button',{name:'Staff Portal',exact:true}).click();await check(width+' staff registration');
 }
 assert.deepEqual(errors,[],'No browser errors');
 assert.deepEqual(failures,[],'No horizontal overflow or clipped content');
 console.log('Responsive layouts and operator workflow passed.');
} catch(error) {
 console.error('Browser errors:',errors);
 console.error('Page:',(await page.locator('body').innerText()).slice(0,500));
 console.error('Layout failures:',JSON.stringify(failures,null,2));
 throw error;
} finally {await browser.close();await server.close();}
