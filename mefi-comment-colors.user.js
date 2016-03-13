// ==UserScript==
// @name Colorful Comments
// @namespace http://ian.mccowan.space
// @description Color comments by username.
// @include http://www.metafilter.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require https://raw.githubusercontent.com/valrus/tinycolorpicker/master/lib/jquery.tinycolorpicker.js
// @grant GM_addStyle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_getResourceURL
// @run-at document-start
// ==/UserScript==

GM_addStyle('.colorPicker { width: 20px; height: 20px; position: relative; clear: both; display: inline-block;}' );
GM_addStyle('.colorPicker .color { width: 18px; height: 18px; padding: 1px; border: 1px solid #ccc; display: block; position: relative; z-index: 11; background-color: #EFEFEF; -webkit-border-radius: 27px; -moz-border-radius: 27px; border-radius: 27px; cursor: pointer; }');
GM_addStyle('.colorPicker .colorInner { display: inline-block; width: 18px; height: 18px; -webkit-border-radius: 20px; -moz-border-radius: 20px; border-radius: 20px; }');
GM_addStyle('#shared-dropdown { list-style: none; display: none; width: 18px; position: absolute; top: 28px; border: 1px solid #ccc; left: 0; z-index: 1000; }');
GM_addStyle('#shared-dropdown li { height: 16px; width: 16px; cursor: pointer; }');

// Tip from http://wiki.greasespot.net/@grant#Scope
this.$ = this.jQuery = jQuery.noConflict(true);

var userColors = [];
GM_listValues().forEach(function(val) {
    userColors[val] = GM_getValue(val);
});

/* Debugging
var e = document.createElement("script");

e.src = 'https://raw.githubusercontent.com/valrus/tinycolorpicker/master/lib/jquery.tinycolorpicker.js';
e.type="text/javascript";
document.getElementsByTagName("head")[0].appendChild(e);
*/

function hashCode(str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5) - hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function addPicker($comment, $userlink, username, usercolor)
{
    $userlink.after(
        "<div class='colorPicker' " +
            "value='" + (usercolor === undefined ? "#ffffff" : usercolor) + "' " +
            "name='" + username +

            "'><a class='color'><div class='colorInner'></div></a><input type='hidden' class='colorInput'/></div>"
    );
}

function performColoring($comment, $userlink, username, usercolor)
{
    $comment.css("color", usercolor === undefined ? "" : usercolor);
    var $picker = $comment.find(".colorPicker");
    $picker.data("plugin_tinycolorpicker").setColor(usercolor === undefined ? "#ffffff" : usercolor, $picker);
}

function forComments($comments, func)
{
    $comments.each(function() {
        var $userlink = $(this).find("span.smallcopy > a:first");
        var username = $userlink.html();
        var usercolor = userColors[hashCode(username)];
        func($(this), $userlink, username, usercolor);
    });
}

function colorChange(elem, colorHex, colorRgb) {
    var lcColor = colorHex.toLowerCase();
    username = elem.attr("name");
    userHash = hashCode(username).toString();
    if (lcColor == "#ffffff" || lcColor == "#fff") {
        delete userColors[userHash];
        GM_deleteValue(userHash);
    }
    else {
        userColors[userHash] = lcColor;
        GM_setValue(userHash, lcColor);
    }
    var $comments = $("a[name]")
            .filter(function() { return this.name.match(/\d+/); })
            .next("div.comments");
    forComments($comments, performColoring);
}

function initialSetup()
{
    console.log(userColors);
    $("div[role=main]").after(
        '<div id="shared-track"></div><ul id="shared-dropdown"></ul>'
    );
    var $comments = $("a[name]")
            .filter(function() { return this.name.match(/\d+/); })
            .next("div.comments");
    forComments($comments, addPicker);
    $(".colorPicker").tinycolorpicker({sharedId: "shared", change: colorChange});
    forComments($comments, performColoring);
}

document.addEventListener('DOMContentLoaded', initialSetup, true);
