// This options allows/forbids a user to override the default mode for showing bio data on twitter.com.
// To choose the default mode of bio data in twitter cards vs. seperated custom cards:
// - change the "defaulttwitttooltip" option on line 18 to true for twitter cards or false for custom cards
var LET_USER_CHOOSE_MODE=true;

// saves options to chrome.storage
function saveOptions () {
  chrome.storage.local.set({
    showforall: document.getElementById('showforall').checked,
    showontwitter: document.getElementById('showontwitter').checked,
    defaulttwittooltip: document.getElementById('defaulttwittooltip').checked,
    dontdisplay: document.getElementById('dontdisplay').checked,
    autorun: document.getElementById('autorun').checked,
    official: document.getElementById('official').checked,
    fullmode: document.getElementById('fullmode').checked,
  })
}

function restoreOptions () {
  chrome.storage.local.get({showforall: true, showontwitter: true, defaulttwittooltip: true, dontdisplay: false, autorun: false, official: false, fullmode: true}, function (items) {
    document.getElementById('showforall').checked = items.showforall
    document.getElementById('showontwitter').checked = items.showontwitter
    document.getElementById('defaulttwittooltip').checked = items.defaulttwittooltip
    document.getElementById('dontdisplay').checked = items.dontdisplay
    document.getElementById('autorun').checked = items.autorun
    document.getElementById('official').checked = items.official
    document.getElementById('fullmode').checked = items.fullmode
  })
}

if (!LET_USER_CHOOSE_MODE) {
    document.getElementById('labelfordeftt').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('showforall').addEventListener('change', saveOptions)
document.getElementById('showontwitter').addEventListener('change', saveOptions)
document.getElementById('defaulttwittooltip').addEventListener('change', saveOptions)
document.getElementById('dontdisplay').addEventListener('change', saveOptions)
document.getElementById('autorun').addEventListener('change', saveOptions)
document.getElementById('official').addEventListener('change', saveOptions)
document.getElementById('fullmode').addEventListener('change', saveOptions)
