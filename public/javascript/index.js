window.onclick = function(event) {
  if (!event.target.matches('.videoSelector')) {
    $('.videoSelector').show();
    $('.list').hide();
  }
  else{
    $("#"+event.target.id).hide();
    $("."+event.target.id+'.list').show();
  }
}