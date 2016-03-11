// ==UserScript==
// @name Colorful Comments
// @namespace http://ian.mccowan.space
// @description Color comments by username..
// @include http://www.metafilter.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @resource customCSS https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css
// @grant GM_addStyle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_getResourceText
// @run-at document-start
// ==/UserScript==

var spectrumCSS = GM_getResourceText("customCSS");
GM_addStyle(spectrumCSS);
GM_addStyle('.sp-replacer { border: none; background-color: transparent; }');
GM_addStyle('.sp-preview { width: 1em; height: 1em; }');

// Tip from http://wiki.greasespot.net/@grant#Scope
this.$ = this.jQuery = jQuery.noConflict(true);

var userColors = [];
GM_listValues().forEach(function(val) {
    userColors[val] = GM_getValue(val);
});

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
        "<input " +
            "type='text' " +
            "class='colorpicker' " +
            "value='" + (usercolor === undefined ? "#fff" : usercolor) + "' " +
            "name='" + username +
            "' />"
    );
}

function performColoring($comment, $userlink, username, usercolor)
{
    $comment.css("color", usercolor === undefined ? "" : usercolor);
    $comment.find('.colorpicker').spectrum("set", usercolor === undefined ? "#ffffff" : usercolor);
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

function initialSetup()
{
    console.log(userColors);
    var $comments = $("a[name]")
            .filter(function() { return this.name.match(/\d+/); })
            .next("div.comments");
    forComments($comments, addPicker);
    $(".colorpicker").each(function() {
        $(this).spectrum({
            change: function(color) {
                var colorHex = color.toHexString().toLowerCase();
                username = $(this).attr("name");
                userHash = hashCode(username).toString();
                if (colorHex == "#ffffff" || colorHex == "#fff") {
                    delete userColors[userHash];
                    GM_deleteValue(userHash);
                }
                else {
                    userColors[userHash] = colorHex;
                    GM_setValue(userHash, colorHex);
                }
                forComments($comments, performColoring);
            }
        });
    });
    forComments($comments, performColoring);
}

document.addEventListener('DOMContentLoaded', initialSetup, true);
