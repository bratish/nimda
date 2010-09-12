var Nimda = function(){
  this.ACTIVE_ITEM = null;
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
            htmlStr += "<div class='oneKey' id='keyHolder" + i.toString() + "'" +
              "onmouseover=\"$(this).addClass('onMouseOverKey')\" " +
              "onmouseout=\"$(this).removeClass('onMouseOverKey')\""+
              "onclick=\"nimda.getKeyValue('"+ response.keys[i] +"', this)\"> " +
              response.keys[i].substring(0, response.keys[i].indexOf(response.searchStr)) +
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

Nimda.prototype.getKeyValue = function(key, obj){
  $.ajax({
    url: 'get-key-value/' + key,
    method: 'GET',
    datatype: "json",
    success: function(response){
      var keyType = response.keyType,
          result = response.result,
          innerHtml = $(obj).html(),
          i = 0;
          
      if(keyType == 'string'){
        innerHtml += "<div class='keyValue'>" + result + "</div>";
      } else {
        innerHtml += "<div class='keyValue'><ul>";
        for(i = 0; i < result.length; i++){
          innerHtml += "<li>" + result[i] + "</li>";
        }
        innerHtml += "</ul></div>"
      }
      /*
      else if(keyType == 'list'){
        innerHtml += "<div class='keyValue'><ul>";
        for(i = 0; i < result.length; i++){
          innerHtml += "<li>" + result[i] + "</li>";
        }
        innerHtml += "</ul></div>"
      } else if(keyType == 'set'){
        innerHtml += "<div class='keyValue'><ul>";
        for(i = 0; i < result.length; i++){
          innerHtml += "<li>" + result[i] + "</li>";
        }
        innerHtml += "</ul></div>"
      } else if(keyType == 'zset'){
        innerHtml += "<div class='keyValue'><ul>";
        for(i = 0; i < result.length; i++){
          innerHtml += "<li>" + result[i] + "</li>";
        }
        innerHtml += "</ul></div>"
      } else if(keyType == 'hash'){
        innerHtml += "<div class='keyValue'><ul>";
        for(i = 0; i < result.length; i++){
          innerHtml += "<li>" + result[i] + "</li>";
        }
        innerHtml += "</ul></div>"
      } */
      $(obj).html(innerHtml);
    }
  });
};

var nimda = new Nimda();