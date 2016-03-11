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
userColors["valrus"] = "#000";

/*
$("head").append (
    '<link href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css" rel="stylesheet" type="text/css">'
);
 */

function addPicker($userlink)
{
    var username = $userlink.html();
    var usercolor = userColors[username];
    $userlink.after(
        "<input " +
            "type='text' " +
            "class='colorpicker' " +
            "value='" + (usercolor === undefined ? "#fff" : usercolor) + "' " +
            "name='" + username +
            "' />"
    );
}

function performColoring($userlink)
{
    var username = $userlink.html();
    var usercolor = userColors[username];
    if (usercolor !== undefined) {
        $(this).attr("style", function(i, val) {
            return (val === undefined ? '' : val) + "color: " + usercolor + ";";
        });
    }
}

function forComments($comments, func)
{
    $comments.each(function() {
        var $userlink = $(this).find("span.smallcopy > a:first");
        func($userlink);
    });
}

function initialSetup()
{
    var $comments = $("a[name]")
            .filter(function() { return this.name.match(/\d+/); })
            .next("div.comments");
    forComments($comments, addPicker);
    forComments($comments, performColoring);
    $(".colorpicker").spectrum({});
}

document.addEventListener('DOMContentLoaded', initialSetup, true);
