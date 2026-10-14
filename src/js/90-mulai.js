// ---------- mulai ----------
adopt(loadLocal()||blank());
render();

function bootDb(){
  if(!window.claude||!window.claude.use)return;
  Promise.all([window.claude.use('db'),window.claude.use('user')]).then(function(r){
    var db=r[0],user=r[1];if(!db||!user||!user.id)return null;
    return user.id().then(function(id){
      if(!id)return null;
      dbDoc=db.collection('data/users/'+id+'/hafalan').doc('state');
      return dbDoc.get();
    });
  }).then(function(snap){
    if(!dbDoc)return;
    syncMode='akun';
    var remote=snap&&snap.exists?snap.data():null;
    if(remote&&remote.json){
      var o=null;try{o=JSON.parse(remote.json);}catch(e){}
      if(o&&(o.rev||0)>(S.rev||0)){adopt(o);saveLocal();if(!S.session&&(view==='study'||view==='done'))view='pick';render();return;}
    }
    if(S.rev){dbDoc.set({json:JSON.stringify(S),rev:S.rev}).catch(function(){});}
    render();
  }).catch(function(){});
}
bootDb();
