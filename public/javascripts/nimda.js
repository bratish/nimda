var Nimda = function(){

};


Nimda.prototype.getTheKeys = function(obj){
  if($(obj).val() != ''){
    $.ajax({
      url: '/get-keys/' + $(obj).val(),
      type: "GET",
      dataType: "json",
      success: function(response){
        var htmlStr = '';
        if(response.keys && response.keys.length > 0)
          for(var i=0; i < response.keys.length; i++ )
            htmlStr += "<div class='oneKey' onmouseover=\"$(this).addClass('onMouseOverKey')\" " +
              "onmouseout=\"$(this).removeClass('onMouseOverKey')\"> " +
              response.keys[i].substring(0, response.keys[i].indexOf(response.searchStr) - 1) +
              '<b>' + response.searchStr + '</b>' +
              response.keys[i].substring(response.keys[i].indexOf(response.searchStr) +
              response.searchStr.length) + "</div>"
        $("#keyListHolder").html(htmlStr);
      }
    });
  } else {
    $("#keyListHolder").html('');
  }
};

var nimda = new Nimda();