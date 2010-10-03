var Nimda = function(){
};


Nimda.prototype.getTheKeys = function(obj){
  if($(obj).val() != ''){
    $.ajax({
      url: '/get-keys/' + $(obj).val(),
      type: "GET",
      dataType: "json",
      success: function(response){
        var htmlStr = '', divId = '';
        if(response.keys && response.keys.length > 0)
          for(var i=0; i < response.keys.length; i++ ){
            divId = "keyHolder" + i.toString();
            htmlStr += "<div class='oneKey' id='" + divId + "'" +
              "onmouseover=\"$(this).addClass('onMouseOverKey')\" " +
              "onmouseout=\"$(this).removeClass('onMouseOverKey')\">"+
              "<img src='images/arrow_collapsed.png' id='arrow' onclick=\"nimda.getKeyValue('"+ response.keys[i] +"', '" + divId + "');\" />" +
              "<div class='keyName'>" +
              response.keys[i].substring(0, response.keys[i].indexOf(response.searchStr)) +
              '<b>' + response.searchStr + '</b>' +
              response.keys[i].substring(response.keys[i].indexOf(response.searchStr) +
              response.searchStr.length) + 
              "</div>" +
              "<div class='actions'>" +
              "<img src='images/database_edit.png' onclick=\"nimda.editKey('"+ response.keys[i] +"', '" + divId + "');\" title=\"Edit this key\"/>" +
              "<img src='images/database_delete.png' onclick=\"nimda.deleteKey('"+ response.keys[i] +"', '" + divId + "');\" title=\"Delete this key\"/>" +
              "</div>" +
              "</div>";
          }
        $("#keyListHolder").html(htmlStr);
      }
    });
  } else {
    $("#keyListHolder").html('');
  }
};

Nimda.prototype.onMouseOverActivities = function(obj){
  $(obj).addClass('onMouseOverKey');
  $(obj).find('IMG').css('display', 'block');
}

Nimda.prototype.onMouseOutActivities = function(obj){
  $(obj).removeClass('onMouseOverKey');
  $(obj).find('IMG').css('display', 'none');
}


Nimda.prototype.editKey = function(key, divId) {
  $("#" + divId + " .keyName").html("<input type='text' value='" + key + "' id='editKey' /><input type='button' value='Go' onclick=\"nimda.renameKey('" + key + "', '" + divId + "');\"><input type='button' value='Cancel' onclick=\"$('#" + divId + " .keyName').html('" + key + "');\"> ");
}

Nimda.prototype.renameKey = function(key, divId){
  var newKey = $("#" + divId + " #editKey").val();
  $.ajax({
    url: '/rename/' + key + "/" + newKey,
    type: 'GET',
    datatype: 'json',
    success: function(response){
      if(response.renamedKey){
        $('#' + divId + " .keyName").html(response.renamedKey);
      }
    }
  });
}

Nimda.prototype.deleteKey = function(key, divId){
  $.ajax({
    url: '/delete/' + key,
    type: 'GET',
    datatype: 'json',
    success: function(response){
      if(response.deleted){
        $('#' + divId).remove();
      }
    }
  });
}

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

Nimda.prototype.getKeyValue = function(key, divId){
  var obj = $("#" + divId);

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
        $("#" + divId + " #arrow").attr('src', "images/arrow_expanded.png");
      }
    
    });
  } else {
    $(obj).html(nimda.LAST_ACTIVE_ITEM_HTML);
//    $("#" + divId + " .keyValue").remove();
//    $("#" + divId + " #arrow").attr('src', "images/arrow_collapsed.png");
//    $("#" + divId + " #arrow").attr('onclick', "nimda.getKeyValue('"+ key +"', '" + divId + "');");
    nimda.LAST_ACTIVE_ITEM = null;
  }
};



$(document).ready(function(){
    $("#keyInput").focus();
  });
  
var nimda = new Nimda();

