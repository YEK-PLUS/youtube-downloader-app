window.onclick = function(event) {
  if (!event.target.matches('#videoSelector')) {
    $('#videoSelector').show();
    $('.list').hide();
  }
  else{
      $('#videoSelector').hide();
    $('.list').show();
  }
}