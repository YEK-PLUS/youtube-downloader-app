function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
window.onclick = function(event) {
  if (!event.target.matches('.videoSelector')) {
    $('.videoSelector').show();
    $('.list').hide();
    if (event.target.matches('.getvideo')) {
        let url = $(event.target).attr('url');
        let filename =makeid(8)+$(event.target).attr('filename');
        let base = "https://3000-dbb3848b-e466-4d80-bf5d-2e7efe200273.ws-eu0.gitpod.io";
        let buildreq = base+'/download';
        buildreq += '?url='+btoa(url);
        buildreq += '&filename='+filename;
        $.get( buildreq, function( data ) {
            let control = base+'/get';
            control += '?filename='+filename;
            let success = false;
            function controlFile(){
                if(success == false){
                    $.get(control,(data)=>{

                        if(data ==="success"){
                            $('.fadeCont').addClass('hidden')
                            success = true;
                            window.location=control+'&get=true'
                        }
                        else{
                            $('.fadeCont').removeClass('hidden')
                            var percent = (100*data.now)/data.file;
                            $('.progress-bar').css('width',~~percent+'%')
                            $(".percent").html(~~percent)
                            console.log(percent)
                            success = false;
                            setTimeout(() => {
                                controlFile()
                            }, 1000);
                        }
                    })
                }
            }
            controlFile();
        });
    }
  }
  else{
    $("."+event.target.id+'.list').show();
    $("#"+event.target.id).hide();
  }
}