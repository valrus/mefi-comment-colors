// ==UserScript==
// @name Colorful Comments
// @namespace http://ian.mccowan.space
// @description Color comments by username..
// @include http://www.metafilter.com/mefi/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @resource https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

// Tip from http://wiki.greasespot.net/@grant#Scope
this.$ = this.jQuery = jQuery.noConflict(true);

var userColors = [];
userColors["valrus"] = "#000";

function performColoring()
{
    var $comments = $("a[name]")
            .filter(function() { return this.name.match(/\d+/); })
            .next("div.comments");
    $comments.each(function() {
        var $userlink = $(this).find("span.smallcopy:first-child").filter("a");
        var username = $userlink.html();
        var usercolor = userColors[username];
        if (usercolor !== undefined) {
            $(this).attr("style", function(i, val) { return val + "color: " + usercolor + ";"; });
        }
    });
}

$(document).ready(
    function() {
        performColoring();
    }
);
