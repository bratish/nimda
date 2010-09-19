var Nimda = function(){
  this.LAST_ACTIVE_ITEM = null;
  this.LAST_ACTIVE_ITEM_HTML = '';
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
              "onmouseout=\"$(this).removeClass('onMouseOverKey')\">"+
              "<a href='#' onclick=\"nimda.getKeyValue('"+ response.keys[i] +"', this)\"> " +
              "<img src='images/eye.png' id='eye' /></a>" +
              response.keys[i].substring(0, response.keys[i].indexOf(response.searchStr)) +
              '<b>' + response.searchStr + '</b>' +
              response.keys[i].substring(response.keys[i].indexOf(response.searchStr) +
              response.searchStr.length) + 
              "</div>";
        $("#keyListHolder").html(htmlStr);
      }
    });
  } else {
    $("#keyListHolder").html('');
  }
};

Nimda.prototype.getKeyType = function(key, obj){
  $.ajax({
    url: '/get-key-type/' + key,
    type: "GET",
    datatype: "json",
    success: function(response){
      if(response.keyType && response.keyType.length > 0){
        $(obj).html(response.keyType);
      }
    }
  });
}

Nimda.prototype.getKeyValue = function(key, obj){
  if($(nimda.LAST_ACTIVE_ITEM).attr('id') != $(obj).attr('id')){
    $.ajax({
      url: 'get-key-value/' + key,
      method: 'GET',
      datatype: "json",
      success: function(response){
        var keyType = response.keyType,
            result = response.result,
            innerHtml = $(obj).html() +
                        "<span style='float: right'>" +
                        keyType +
                        "</span>" +
                        "<div class='keyValue'>",
            i = 0;

        $(nimda.LAST_ACTIVE_ITEM).html(nimda.LAST_ACTIVE_ITEM_HTML);
        nimda.LAST_ACTIVE_ITEM = obj;
        nimda.LAST_ACTIVE_ITEM_HTML = $(obj).html();

        if(keyType == 'string'){
          innerHtml +=  result;
        } else if(keyType == 'hash'){
          innerHtml += "<ul>";
          $.each(result, function(key, value){
            innerHtml += "<li>" + key + " => "+ value + "</li>";
          });
          innerHtml += "</ul>"
        } else {
          innerHtml += "<ul>";
          for(i = 0; i < result.length; i++){
            innerHtml += "<li>" + result[i] + "</li>";
          }
          innerHtml += "</ul>"
        }
        innerHtml += "</div>";
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
  } else {
    $(obj).html(nimda.LAST_ACTIVE_ITEM_HTML);
    nimda.LAST_ACTIVE_ITEM = null;
  }
};

var nimda = new Nimda();