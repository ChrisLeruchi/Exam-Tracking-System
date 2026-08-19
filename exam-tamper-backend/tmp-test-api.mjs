const base='http://127.0.0.1:4000/api';
(async ()=>{
  try{
    const loginRes=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin_johnson',password:'admin123'})});
    const login=await loginRes.json(); const token=login.token; console.log('token?', !!token);
    const coursesRes=await fetch(base+'/courses',{headers:{Authorization:'Bearer '+token}}); const courses=await coursesRes.json(); console.log('courses', courses.courses.map(c=>({id:c.id,code:c.code}))); const cid=courses.courses[0]?.id;
    const flagsRes=await fetch(`${base}/flags?resolved=false&courseId=${cid}`,{headers:{Authorization:'Bearer '+token}});
    const flags=await flagsRes.json(); console.log('/flags status', flagsRes.status, JSON.stringify(flags).slice(0,200));
    const changesRes=await fetch(`${base}/courses/${cid}/changes`,{headers:{Authorization:'Bearer '+token}});
    const changes=await changesRes.json(); console.log('/changes status', changesRes.status, JSON.stringify(changes).slice(0,200));
    const auditsRes=await fetch(base+'/audit/logs',{headers:{Authorization:'Bearer '+token}});
    const audits=await auditsRes.json(); console.log('/audit/logs status', auditsRes.status, JSON.stringify(audits).slice(0,200));
  }catch(e){console.error(e)}
})();