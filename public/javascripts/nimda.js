$.fn.selectRange = function(start, end) {
  return this.each(function() {
    if(this.setSelectionRange) {
      this.focus();
      this.setSelectionRange(start, end);
    } else if(this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  });
};

var Nimda = function(){
  this.LAST_ACTIVE_ITEM = null;
  this.LAST_ACTIVE_ITEM_HTML = '';
  this.ARROW = {left: 37, up: 38, right: 39, down: 40 },
  this.COMMAND_LIST = new Array(),
  this.COMMAND_LIST_POINTER = 0,
  this.PROMPT = 'redis&gt;&nbsp;';
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
              "</div></div>";
          }
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
    nimda.LAST_ACTIVE_ITEM = null;
  }
};

Nimda.prototype.checkEnter = function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which),
        command = $("#command").val();

    if(keycode == '13'){
      $("#commandHolder").append("<br />");
      if(command.length != 0){
        nimda.doWithCommand(command);
        nimda.inputBox(command);
      } else {
        $("#oneCommandHolder").remove();
        $("#commandHolder").append(nimda.PROMPT);
        $("#commandHolder").append("<div id='oneCommandHolder'>" + nimda.PROMPT + "<input id='command' type='text' style='border: 0px;' onkeypress='nimda.checkEnter(event)'/></div>");
        $("#command").focus();
      }
      return false;
    } else if(keycode == nimda.ARROW.up) {
      if(nimda.COMMAND_LIST_POINTER > 0){
        nimda.COMMAND_LIST_POINTER--;
        $("#command").val(nimda.COMMAND_LIST[nimda.COMMAND_LIST_POINTER]);
        setTimeout('$("#command").selectRange($("#command").val().length, $("#command").val().length)', 10);
      }
      return false;
    } else if(keycode == nimda.ARROW.down) {
      if(nimda.COMMAND_LIST_POINTER < (nimda.COMMAND_LIST.length - 1)){
        nimda.COMMAND_LIST_POINTER++;
        $("#command").val(nimda.COMMAND_LIST[nimda.COMMAND_LIST_POINTER]);
      } else {
        $("#command").val('');
      }

      return false;
    } else if((keycode > 47 && keycode < 58) || (keycode > 95 && keycode < 106)){
      return false;
    }
    return false;
  }

Nimda.prototype.inputBox = function(command){
    if(command){
      $("#oneCommandHolder").remove();
      //if($("#commandHolder").html().trim() != ''){
        //$("#commandHolder").append("<br />");
      //}
      $("#commandHolder").append(nimda.PROMPT + command);
    }
    $("#commandHolder").append("<div id='oneCommandHolder'>" + nimda.PROMPT + "<input id='command' type='text' style='border: 0px;' onkeypress='nimda.checkEnter(event)'/></div>");
    $("#command").focus();
  }

Nimda.prototype.doWithCommand = function(cmd){
    nimda.COMMAND_LIST.push(cmd);
    nimda.COMMAND_LIST_POINTER = nimda.COMMAND_LIST.length;
    console.log(cmd);
  }

$(document).ready(function(){
    nimda.inputBox();
    $("#commandLineHolder").click(function(){$("#command").focus();});
//    $("#commandLineHolder").focus(function(){$("#command").focus();});
  });
var nimda = new Nimda();

