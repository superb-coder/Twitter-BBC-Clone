////////////////////////////// Methods for iframe  ////////////////////////////////////////////////////////
if (typeof(list) === 'undefined') {
  list = []
}
var ENABLE_TWITTER_NAV_HIDING = true;
var MAX_POLLING_REQUESTS_FOR_TWITTER = 50; // this is used in createCollection which polls every 2 seconds at the moment

function addTwitterStyles() {
  var style = document.getElementById('extension-style');

  if (!style) {
    style = document.createElement('style');
    style.id = 'extension-style';

    document.head.appendChild(style);
  }

  var animationTime = '.5s';

  style.innerHTML = `
        @media (min-width: 0) and (max-width: 1900px) {
          [role="banner"] a[href="/compose/tweet"],
          body header[role="banner"],
          [role="banner"] [role="navigation"] a[role="link"]:not([href="/compose/tweet"]) [dir="auto"],
          [role="banner"] [aria-haspopup="true"] [dir="auto"],
          [role="banner"] a[href="/compose/tweet"] > div > span,
          [role="banner"] a[href="/compose/tweet"] > div > svg:not(.extension-svg),
          header[role="banner"] > div:first-child,
          header[role="banner"] > div:first-child > div:first-child,
          header[role="banner"] > div:first-child > div:first-child > div:first-child {
            transition: all ${animationTime} ease !important;
          }
          
          .body-collapsed [aria-labelledby="modal-header"][aria-modal="true"] {
            transform: translateX(-50%);
          }
          
          @keyframes resizeTweetButton {
            99% {
            }
            100% {
              width: 49px;
            }
          }
    
          .body-collapsed [role="banner"] a[href="/compose/tweet"] {
           min-width: 49px !important;
           min-height: 49px !important;
           height: 49px !important;
           padding: 2px !important;
           animation: resizeTweetButton ${animationTime} ease forwards;
          }
          
          @keyframes hidetext {
            99% {
            }
            100% {
              width: 0;
              overflow: hidden;
            }
          }
          
          .body-collapsed [role="banner"] [role="navigation"] a[role="link"]:not([href="/compose/tweet"]) [dir="auto"],
          .body-collapsed [role="banner"] a[href="/compose/tweet"] > div > span,
          .body-collapsed [role="banner"] [aria-haspopup="true"] [dir="auto"],
          .body-collapsed [role="banner"] a[href="/compose/tweet"] > div > svg:not(.extension-svg) {
            margin: 0 !important;
            padding: 0 !important;
            opacity: 0 !important;
            animation: hidetext ${animationTime} ease forwards;
          }
          
          .body-collapsed [role="banner"] [role="navigation"] {
            padding-left: 2px !important;
          }
          
          .body-collapsed [aria-labelledby="modal-header"][aria-modal="true"] {
            transform: translateX(-50%) !important;
          }
          
          .body-collapsed header[role="banner"] {
            flex-grow: 0 !important;
          }
          
          .body-collapsed header[role="banner"] > div:first-child > div:first-child {
            overflow: hidden !important;
          }
          
          .body-collapsed header[role="banner"] > div:first-child,
          .body-collapsed header[role="banner"] > div:first-child > div:first-child > div:first-child {
            width: 135px !important;
          }
          
          .body-collapsed header[role="banner"] > div:first-child > div:first-child > div:first-child {
            padding-left: 40px !important;;
          }
        }
    `;
}

function replaceButton() {
  function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
  }

  var svgCode = `
        <svg class="extension-svg" viewBox="0 0 24 24" style="color: rgb(255, 255, 255); height: 1.5em; flex-shrink: 0; user-select: none; vertical-align: text-bottom; position: relative; max-width: 100%; fill: currentcolor; display: inline-block;"><g><path d="M8.8 7.2H5.6V3.9c0-.4-.3-.8-.8-.8s-.7.4-.7.8v3.3H.8c-.4 0-.8.3-.8.8s.3.8.8.8h3.3v3.3c0 .4.3.8.8.8s.8-.3.8-.8V8.7H9c.4 0 .8-.3.8-.8s-.5-.7-1-.7zm15-4.9v-.1h-.1c-.1 0-9.2 1.2-14.4 11.7-3.8 7.6-3.6 9.9-3.3 9.9.3.1 3.4-6.5 6.7-9.2 5.2-1.1 6.6-3.6 6.6-3.6s-1.5.2-2.1.2c-.8 0-1.4-.2-1.7-.3 1.3-1.2 2.4-1.5 3.5-1.7.9-.2 1.8-.4 3-1.2 2.2-1.6 1.9-5.5 1.8-5.7z"></path></g></svg>
    `;

  var btn = document.querySelector('a[href="/compose/tweet"]');
  var btnInner = document.querySelector('a[href="/compose/tweet"] > div[dir="auto"]');

  var svg = btn.querySelector('.extension-svg');

  if (!svg) {
    var svg = createElementFromHTML(svgCode);
    btnInner.appendChild(svg);
  }
}

function twitterHideLeftPanel() {
  replaceButton();
  document.body.classList.add('body-collapsed');
}

function createIframe (rootElement, statusId) {
  let WIDTH
  if (window.location.hostname === 'twitter.com') {
    WIDTH = 620
  } else {
    WIDTH = 661
  }
  const iframe = document.createElement('iframe')
  iframe.src = `${EXT_URL + '/widget/index.html?parent_host_name=' + window.location.hostname + '&status_id=' + statusId}`
  iframe.setAttribute('allowTransparency', 'true');
  iframe.setAttribute("class", "main-iframe"); /* |Vyacheslav Shvets| add line */
  iframe.setAttribute('style', `position: fixed;
        top: 0;
        display: block;
        right: -${WIDTH}px;
        width: ${WIDTH}px;
        border: none;
        height: 100%;
        z-index: 2147483646;
		//*-webkit-box-shadow: -12px 0 48px 0 rgba(50,50,50,.20);*//
        //*-moz-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0*//
	`)
  // window['$'](iframe).hide()
  rootElement.appendChild(iframe)
  setWidthToMainIframe();  /* |Vyacheslav Shvets| add line */
  return iframe
}

/* |Vyacheslav Shvets| Start */
function setWidthToMainIframe() {
  if ($(".main-iframe") === null) {
    return true;
  }

  let margin = 40;
  let width = 620;
  let twitterSidebarColumn = $("div[data-testid='sidebarColumn']");

  if (window.location.hostname === 'twitter.com') {
    let banner = document.querySelector('header[role="banner"]');

    if (window.innerWidth < 1480 && twitterSidebarColumn.length > 0) {
      width = window.innerWidth + margin - twitterSidebarColumn.offset().left;
      if (ENABLE_TWITTER_NAV_HIDING) {
        width += $(banner).width() - 140;
      }
    } else if (window.innerWidth >= 1600 && window.innerWidth <= 1900) {
      width = window.innerWidth - twitterSidebarColumn.get(0).getBoundingClientRect().x + margin + $(banner).width() - 140;
    } else {
      width = window.innerWidth - twitterSidebarColumn.get(0).getBoundingClientRect().x + margin;
    }
  } else {
    width = 661;
  }

  $(".main-iframe").css("width", width + "px");

  return true;
}

/**
 * Window resize event - Invoke setWidthToMainIframe function if unit is not animated
 * Unit is animated when positioned at the cented of the screen - iframe/unit has class "animated"
 *
 */
$(window).resize(function(){
  if(!jQuery("#overlay_Div1 iframe").hasClass("animated")){
    setWidthToMainIframe();
  }
});
/* |Vyacheslav Shvets| End */

function openWidget(statusId) {
  let iframe = document.querySelector('#overlay_Div1 iframe')
  if (!iframe || iframe == null) {

    addWidget(statusId)
    if (ENABLE_TWITTER_NAV_HIDING) {
      twitterHideLeftPanel();
    }
    iframe = document.querySelector('#overlay_Div1 iframe')
    shouldBeOpen = true
  }
  // const progress = window['$']('#curate_button_id').attr('data-progress-real') || 0
  // if (progress) {
  //   shouldBeOpen = false
  //   window['$'](iframe).animate({ 'right': '0' }, 'slow')
  // }
}

function addWidget (statusId) {
  var ov = document.createElement('div')
  ov.setAttribute('id', 'overlay_Div1')
  document.body.appendChild(ov)
  var styleEl = document.createElement('style')
  styleEl.innerHTML = '@keyframes move{' +
             'from{transform: translateX(0); opacity : 1;-webkit-box-shadow: 2px 2px 5px #D3D3D3;animation-duration: 0.15s;}' +
             'to{transform: translate(4px, 4px);' +
             '-webkit-box-shadow: px px 0px #D3D3D3;animation-duration: 0.3s;}' +
             '}'
  document.head.appendChild(styleEl)
  var g = document.querySelector('#overlay_Div1')
  const iframe = document.querySelector('#overlay_Div1 iframe')
  if (!iframe || iframe == null) {
    createIframe(g, statusId)
    // initClockAnimation()
  }
}

// function initClockAnimation () {
//   // Interval JOB
//   clearInterval(Progress.interval)
//   Progress.interval = setInterval(() => {
//     const nextTic = Progress.current + Progress.step
//     console.log('Timer tic', Progress.current, Progress.step)
//     Progress.current = Math.min(100, nextTic)
//     console.log('\tRESULT', Progress.current, nextTic)
//     // window['$']('#curate_button_id').attr('data-progress', Progress.current)
//     if (Progress.current === 100) {
//       loadingFinised()
//     }
//   }, Progress.stepTime)
// }

// function loadingFinised () {
//   clearInterval(Progress.interval)
//   console.log('\tcurrentPercentage STPOP')
//   Progress.interval = null
// }

////////////////////////////////////////////////////////////////////////////////////

window['Payload'] = (function () {
  console.log('Document ready.')
  console.log(window['SERVER'])
  // #twittercardsturnoff - modify in background.js
  // Background.js has a setting "USE_TOOLTIPS" which is the only one to be modified
  // for TRUE/FALSE to allow tooltips (custom or twitter cards) on or off with admin override.
  // Please do not modify setting below, it is a fallback that should always be set to false
  // in case there is a problem with background.js
  var USE_TOOLTIPS = false;
  // Should also be modified in backround.js only.
  var USE_DEFAULT_TWITTER_TOOLTIP = true;

  // MODES:
  // 0 - insert on each new tweet
  // 1 - insert on mouseover
  // 2 - insert when user is not scrolling
  // 3 - insert on mouseover and user not scrolling
  const INSERT_ICON_AND_CATEGORY_MODE = 0;
  // This is a delay before performing code operations for settings 2 and 3
  // AFTER the scroll has finished
  const SCROLL_TIMER_PERIOD = 200;

  window['listeners_on'] = INSERT_ICON_AND_CATEGORY_MODE == 1 || INSERT_ICON_AND_CATEGORY_MODE == 3;
  var putTooltipOnTweetLoadOptional = function(addedNode) {}
  chrome.storage.local.get({usetooltips : null, defaulttwittooltip : null}, (items) => {
    if (!chrome.runtime.lastError) {
      USE_TOOLTIPS = items.usetooltips;
      USE_DEFAULT_TWITTER_TOOLTIP = items.defaulttwittooltip;

      if (USE_TOOLTIPS) {
        if (INSERT_ICON_AND_CATEGORY_MODE >= 2) {
          addScrollTimer();
        }

        if (USE_DEFAULT_TWITTER_TOOLTIP) {
          observeDefaultTooltip();
        }
        else {
          if(INSERT_ICON_AND_CATEGORY_MODE === 0) {
            putTooltipOnTweetLoadOptional = window['putTooltipOnTwitterPost'];
          }
          else if (INSERT_ICON_AND_CATEGORY_MODE === 1) {
            putTooltipOnTweetLoadOptional = function(addedNode) {
              $(addedNode).on('mouseenter', function () {
                window['putTooltipOnTwitterPost'](addedNode);
              });
              $(addedNode).on('mouseleave', function () {
                window['removeIcons'](addedNode);
              });
            }
          }
          else if (INSERT_ICON_AND_CATEGORY_MODE === 3) {
            putTooltipOnTweetLoadOptional = function(addedNode) {
              $(addedNode).on('mouseenter', function () {
                if (!isScrolling) {
                  window['putTooltipOnTwitterPost'](addedNode);
                }
              });
              $(addedNode).on('mouseleave', function () {
                window['removeIcons'](addedNode);
              });
            }
          }
          else if (INSERT_ICON_AND_CATEGORY_MODE === 2) {
            putTooltipOnTweetLoadOptional = function(addedNode) {
              window['putTooltipOnTwitterPost']();
              putTooltipOnTweetLoadOptional = function(addedNode) {};
            }
          }
        }
      }
    }
  })


  //////////////////////////////////////////////////// Methods for notification ////////////////////////////////////////////////////

  function setHandlerForLinks(){
    console.log('SET HANDLERS FOR LINKS')
    console.log($(".request-elem"))
    let allLinks = $(".request-elem")
    for(let i=0; i < allLinks.length; i++){
      if(allLinks[i].childNodes[5].innerText.startsWith('0 tweets') || allLinks[i].childNodes[5].innerText.includes('ERROR!')) {}
      else {
        var clickListener = function(e){
          const collectionURL = e.target.parentElement.getAttribute('collectionurl') || '';
          chrome.storage.local.set({'lastLinkId': e.target.id, collectionURL}, function() {
            console.log('lastLinkId is set to ', e.target.id );
            openWidget(e.target.parentElement.id.split('-')[0])
            let position = $('#overlay_Div1 iframe').css('right')
            if(position == '-620px') $('#overlay_Div1 iframe').animate({ 'right': '0' }, 'fast')
            removeListItemForClickedElement(e);
          });
        }
        allLinks[i].childNodes[1].addEventListener('click', clickListener);
        allLinks[i].childNodes[5].addEventListener('click', clickListener);
      }
    }
    // $(".request-link").click(function(e){
    //   openWidget()
    //   chrome.storage.local.set({'lastLinkId': e.target.id}, function() {
    //     console.log('lastLinkId is set to ', e.target.id );
    //   });
    //   let position = $('#overlay_Div1 iframe').css('right')
    //   if(position == '-620px') $('#overlay_Div1 iframe').animate({ 'right': '0' }, 'slow')
    // })
  }

  function updatePercentage(htmlId,response,id){
    // todo / note: we don't create list[i]errors if we get at least 1 tweet -- this might affect something else?
    for(let i in list){
      if(list[i].id == htmlId) {
        list[i].finished_with_no_results = false;
        list[i].linkId = id
        if(response.data.errors && !response.data.tweets) list[i].errors = response.data.errors
        else {
          if (response.data.percentage == 100 && !response.data.tweets) list[i].finished_with_no_results = true;
          list[i].percentage = parseInt(response.data.percentage)
          list[i].tweets = response.data.tweets
          list[i].collectionURL = response.data.collectionURL
        }
        // <span class='request-status'>${list[i].errors ? `ERROR!` : `[${list[i].tweets} tweets gathered |${list[i].percentage}%]`}  </span>
        $(`#${htmlId}-elem`).replaceWith(`
          <li id="${htmlId}-elem" class="request-elem" collectionUrl=${list[i].collectionURL}> 
            <span id="${list[i].linkId}" class="request-link">${list[i].text}</span> 
            <span class='request-remove'>X</span>
            <span class='request-status'>${list[i].errors ? `ERROR!` : list[i].finished_with_no_results ? `No Results | ${list[i].percentage}%` : `${list[i].tweets} tweets gathered | ${list[i].percentage}%`}  </span>
          </li>`
        )
      }
    }
  }

  function removeListItemForClickedElement(e) {
    const elemSuffix = '-elem';
        let id = e.target.parentElement.id.substring(0, e.target.parentElement.id.length - elemSuffix.length);
        // if(e.target.parentElement.innerText.includes('ERROR')) text = e.target.parentElement.innerText.replace('X','').trim().split('[')[0].replace('\n','').split('\n')[0]
        // else text = e.target.parentElement.innerText.replace('X','').trim().split('[')[0].replace('\n','')

        for(i in list){
          if(list[i].id === id){
            list.splice(i, 1);
          }
        }
        if(list.length == 0){
          $(".request-elem").fadeTo('fast',0.2)
          $("#notification").
          animate({height:HEIGHT_NOTIFICATION},500, () => {
            $(".request-elem").remove()
            $('#list-notification').hide()
            $('.expand').hide()
          });
          removeNotificationList();
        }
        else renderList()
  }

  function setHandlerRemove(){
    $(".request-remove")
      .click(function(e){
        removeListItemForClickedElement(e);
        e.preventDefault();
        if(list.length == 0 ){
          removeNotificationList();
        }
      });
  }

  function newHeightRender(newHeight,duration){
    $("#notification").animate({height:newHeight},duration, ()=>{
      $(".request-elem").remove()
      // <span class='request-status'>${list[i].errors ? `ERROR!` : `[${list[i].tweets} tweets/${list[i].percentage}%]`}  </span>
      for(let i in list){
        $("#list-notification").append(`
        <li id="${list[i].id}-elem" class="request-elem" collectionUrl=${list[i].collectionURL}> 
          <span id="${list[i].linkId}" class="request-link">${list[i].text}</span>
          <span class='request-remove'>X</span>
          <span class='request-status'>${list[i].errors ? `ERROR!` : list[i].finished_with_no_results ? `No Results | ${list[i].percentage}%` : `${list[i].tweets} tweets gathered | ${list[i].percentage}%`}  </span>
        </li>`)
      }
      $('#list-notification').show()

      setHandlerForLinks()
      setHandlerRemove()
    });
  }

  function renderList(){
    let needHeight = HEIGHT_NOTIFICATION + list.length * HEIGHT_EACH_REQUEST
    $(".request-elem").remove()
    newHeightRender(needHeight,500)
    $("#extensionNotifications").animate({bottom: `${needHeight + 50}px`}, 500);
  }

  function sleep (time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  function updateLogo(htmlId,str){
    // this dov may have intentional been broken
    $(`#${htmlId}`).replaceWith(`<div data-twitter-id="lillyspickup" id="${htmlId}" style="display: flex; float:right;" class="related-button" has-listener="true">
                                          <img src="${EXT_URL}/c-icon.png" style="width: 15px;height: 15px;margin-top: 4px;">
                                          <dov style="color: grey;margin-top: 4px;text-transform: none;margin-left: 3px;font-family:system-ui;font-weight:100;">
                                            ${str}
                                          </dov>
                                        </div>`)
  }


  function createCollection(htmlId,id, countRequest=0) {
    chrome.runtime.sendMessage({
      method: 'createCollection',
      linkId: id,
      countRequest: countRequest
    }, async (response) => {
      console.log('RESPONSE !!!')
      console.log(response)
      if(response.data.errors && !response.data.tweets){
        countRequest = 0
        updatePercentage(htmlId,response,id)
        updateLogo(htmlId,'Failed')
        requests.queue.pop()
        requests.failed.push(1)
      }
      else{
        if(!response.success && countRequest < MAX_POLLING_REQUESTS_FOR_TWITTER) {
          countRequest++
          // updatePercentage(htmlId,response,id)
          if(response.data.percentage == 100) {
            requests.queue.pop()
            requests.failed.push(1)
			if (!response.data.tweets){
			    updatePercentage(htmlId,response,id)
			    updateLogo(htmlId,'No Results')
			}
			else {
			    updatePercentage(htmlId,response,id)
			    updateLogo(htmlId,'Success but with errors')
			    setHandlerForLinks()
			}
            countRequest = 0
          }
          else{
            updatePercentage(htmlId,response,id)
            //if(countRequest == 9 && response.data.collectionURL != "") countRequest = 0 // This logic is causing the loop to begin again on count 9. Commenting out.
            setHandlerForLinks();
            await sleep(2000)
            createCollection(htmlId,id,countRequest)
          }
          setHandlerForLinks();
        }
        // over the `80 max retry limit and no tweets
        else if(!response.success && countRequest >= MAX_POLLING_REQUESTS_FOR_TWITTER && !response.data.tweets) {
          for(let i in list){
            if(list[i].id == htmlId) list[i].percentage = 0
          }
          countRequest = 0
          requests.queue.pop()
          requests.failed.push(1)
          updateLogo(htmlId,'No Tweets and Timed Out In Polling')
        }
        // over the 180 max retry limit but at least one tweet
        else if(!response.success && countRequest >= MAX_POLLING_REQUESTS_FOR_TWITTER && response.data.tweets) {
          countRequest = 0
          updatePercentage(htmlId,response,id)
          requests.queue.pop()
          requests.success.push(1)
          updateLogo(htmlId,'Success but Timed Out')
          setHandlerForLinks()
        }
        else{
          countRequest = 0
          // Update percentage
          updatePercentage(htmlId,response,id)

          if(response.data.percentage < 100){
            await sleep(2000)
            createCollection(htmlId,id,countRequest)
          }
          else{
            requests.queue.pop()
            requests.success.push(1)
            updateLogo(htmlId,'Success')
          }
          setHandlerForLinks()
        }
      }

      if(document.getElementById('notification').style.display == 'none'){
       updateLogo(htmlId,'Canceled')
        return
      }

      // $("#text-notification").replaceWith(`<span id='text-notification'>${requests.queue.length} requests in process</span>`);
      if(requests.queue.length == 0) $("#text-notification").replaceWith(`<span id='text-notification'>Related conversation ready to view</span>`);
      else  $("#text-notification").replaceWith(`<span id='text-notification'>Still looking</span>`);


      // if(!document.getElementById('result-notification')){
      //   $("#notification").fadeIn("slow")
      //   $('#container-noification').append(`<span id='result-notification'>success: ${requests.success.length},  failed: ${requests.failed.length}</span>`);
      // }
      // else{
      //   $("#result-notification").replaceWith(`<span id='result-notification'>success: ${requests.success.length},  failed: ${requests.failed.length}</span>`);
      // }

      // if(requests.success.length > 1) $('.expand').show()

        // if(!hasHandler){
        //   hasHandler = true
        //   $(".expand").click((e)=>{
        //     let height = $("#notification").height()
        //     if(height != HEIGHT_NOTIFICATION) {
        //       $(".request-elem").fadeTo('fast',0.2)
        //       $("#notification").animate({height:HEIGHT_NOTIFICATION},500, () => {
        //         $(".request-elem").remove()
        //         $('#list-notification').hide()
        //       });
        //     }
        //     else renderList()
        //   })
        // }

    })
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////// Create notification ////////////////////////////////////////////////////
  const HEIGHT_NOTIFICATION = 25
  const HEIGHT_EACH_REQUEST = 20

  var requests = {
    queue:[],
    success:[],
    failed:[]
  }
  var hasHandler = false

  const notifContainer = document.createElement('div')
  const secondContainer = document.createElement('div')
  const notifClose = document.createElement('span')
  const listRequests = document.createElement('ul')
  const notifExpand = document.createElement('span')

  notifClose.className = 'close-notif'
  notifClose.innerText = 'x'
  notifExpand.className = 'expand'
  notifExpand.style = 'display: none'
  notifContainer.id = 'notification'
  notifContainer.className = 'ext_conversation_twitter'
  secondContainer.id = 'container-noification'
  listRequests.id = 'list-notification'
  notifContainer.style = 'display: none'
  listRequests.style = `display:none;
                        margin: 0;
                        list-style: none;
                        padding: 0;`
  secondContainer.style = `bottom: 0px;
                          position: absolute;
                          width: 97%;`
  notifContainer.appendChild(secondContainer)
  notifContainer.appendChild(listRequests)
  secondContainer.appendChild(notifClose)
  secondContainer.appendChild(notifExpand)
  document.body.appendChild(notifContainer)

  function removeNotificationList() {
    $("#notification").animate({height:HEIGHT_NOTIFICATION},100, () => {
      $(".expand").off('click')
      $('.expand').hide()
      hasHandler = false
      list = []
      $("#text-notification").remove()
      $(".request-elem").remove()
      $("#result-notification").remove()
      $("#list-notification").hide()
      $("#notification").hide()
    })
    for(field in requests){
      requests[field] = []
    }
  }
  $(".close-notif").click(function(e){
        removeNotificationList();
  });

  $("#notification").click(function(e){
    if (e.target.id != 'text-notification') {
      return;
    }
    if(list.length === 1 && !list[0].errors){
      const collectionURL = list[0].collectionURL || '';
      chrome.storage.local.set({'lastLinkId': list[0].linkId, collectionURL}, function() {
        openWidget(list[0].id)
        let position = $('#overlay_Div1 iframe').css('right')
        if(position == '-620px') $('#overlay_Div1 iframe').animate({ 'right': '0' }, 'fast')
        removeNotificationList();
      });
    }
  });
  $( "#notification" ).off('mouseover');
  $( "#notification" ).mouseover(function() {
    if($("#notification").height() == HEIGHT_NOTIFICATION && list.length > 0){
      renderList()
    }
  });

  $( "#notification" ).off('mouseleave');
  $( "#notification" ).mouseleave(function() {
    let height = $("#notification").height()
    if(height != HEIGHT_NOTIFICATION) {
      $(".request-elem").fadeTo('fast',0.2)
      $("#notification").animate({height:HEIGHT_NOTIFICATION},500, () => {
        $(".request-elem").remove()
        $('#list-notification').hide()
      })
      $("#extensionNotifications").animate({bottom: '70px'}, 500);
    }
  });
// BUGS IN NEW DESIGN!!!
  // document.getElementsByTagName('body')[0].addEventListener("keydown", event => {
  //   console.log($('.css-1dbjc4n section')[0].childNodes[1].firstChild.firstChild)
  //   $('.css-1dbjc4n section')[0].childNodes[1].firstChild.firstChild.style.cssText = 'padding-top:0px !important; padding-bottom: 400px !important;'
  //   console.log($('.css-1dbjc4n section')[0].childNodes[1].firstChild.firstChild)
  // });

/////////////////////////////////////////////////////////////////////////////////////////////

  var isScrolling = false;

  function onScrollingTimer() {
    isScrolling = false;
    if (INSERT_ICON_AND_CATEGORY_MODE === 2) {
      window['putTooltipOnTwitterPost']();
    }
  }

  function addScrollTimer() {
    var scrollTimer = window.setTimeout(onScrollingTimer, SCROLL_TIMER_PERIOD);
    $(window).scroll(function() {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(onScrollingTimer, SCROLL_TIMER_PERIOD);
    });
  }


  if (window.location.hostname === window['SERVER']) {
    return
  }
  if (document.location.href.indexOf(window['SERVER'] + '/recipient/') !== -1) {
    return
  }


  if (window.location.hostname === 'twitter.com') {
    addTwitterStyles();
    ////////////////////////////  Styles for iframe  ////////////////////////////////////////////////////
    // var g = document.createElement('div')
    // g.setAttribute('id', 'overlay_Div1')
    // document.body.appendChild(g)
    // var styleEl = document.createElement('style')
    // styleEl.innerHTML = '@keyframes move{' +
    //        'from{transform: translateX(0); opacity : 1;-webkit-box-shadow: 2px 2px 5px #D3D3D3;animation-duration: 0.15s;}' +
    //        'to{transform: translate(4px, 4px);' +
    //        '-webkit-box-shadow: px px 0px #D3D3D3;animation-duration: 0.3s;}' +
    //        '}'
    // document.head.appendChild(styleEl)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    chrome.runtime.connect().onDisconnect.addListener(function () {
      var needUpdateCharlotteIcons
      window['$'](document).on('newTweetsLoad', function (e, addedNode) {
        needUpdateCharlotteIcons = false
        window['putRelatedConversation'](addedNode)
        putTooltipOnTweetLoadOptional(addedNode);
      })

      if (chrome.runtime.lastError) {
        needUpdateCharlotteIcons = true
        window['$'](document).on('newTweetsLoad', function (e, addedNode) {

          const ourButtons = $('.related-button')//e.target.querySelectorAll('.related-button') || ''

          ////////////////////////////  NEW DESIGN Styles for buttons on each tweet  ////////////////////////////////////////////////////
          if ($('.r-1mdbhws').length > 0) {
            let divs = $('.r-1mdbhws')
            // let shareButtons = $('[data-testid="caret"]').parent()
            // In case the above selector breaks, the above line may allow it to work. also the line below which is for the right corner
            // dropdown also seems to work, though it's not desired to use versus the more specific selector below.
            // let shareButtons = $('.css-1dbjc4n.r-18u37iz.r-1h0z5md.r-1joea0r')
            let shareButtons = $('.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-156q2ks.r-1mdbhws')
            for (let i = 0; i < divs.length; i++) {
              if (!divs[i].hasAttribute('expanded')) {
                divs[i].setAttribute('expanded', true)
                divs[i].style.cssText = 'max-width:525px;'
              }
              if (!shareButtons[i].hasAttribute('expanded')) {
                shareButtons[i].setAttribute('expanded', true)
                // shareButtons[i].style.cssText = 'width:60px'
              }
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////
          function getStatusId(linkArray) {
            let statusId;
            for (let ind in linkArray) {
              if (linkArray[ind].hasAttribute('href') && linkArray[ind].href.split('status').length > 1) {
                statusId = linkArray[ind].href.split('status')[1].substring(1)
                statusId = statusId.split('/')[0]
                break;
              }
            }
            return statusId
          }


          if (ourButtons.length) {
            for (var i = 0; i < ourButtons.length; i++) {
              if (!ourButtons[i].getAttribute('has-listener')) {
                ourButtons[i].setAttribute('has-listener', true)

                ourButtons[i].addEventListener("click", function (e) {
                  e.preventDefault()
                  let permalink;
                  let text;
                  let el = $(e.target).parent().parent().parent().parent().parent();
                  let statusId;
                  let twitterId;

                  let nameSelector = '.css-901oao.css-bfa6kz.r-18u37iz.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0 span';

                  let linkArray = el.find('a').toArray();
                  statusId = getStatusId(linkArray);
                  if (!statusId) {
                    linkArray = el.parent().find('a').toArray();
                    statusId = getStatusId(linkArray);
                  }
                  twitterId = el.find(nameSelector).first().text().replace('@', '').toLowerCase()

                  let buttonElement = $(e.target).parent();
                  //TODO: get id; get data-twitter-id
                  permalink = `https://twitter.com/${twitterId}/status/${statusId}`;
                  text = buttonElement.closest('article').find('.css-901oao.r-1qd0xha.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0')[0].innerText;
                  if (text.indexOf('More') != -1) {
                    text = text.split('More')[1];
                  }

                  // if (document.querySelector('.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-zl2h9q.charlotte-modified') != null) {
                  //   // e.preventDefault()
                  //   permalink = `${e.path[5].childNodes[1].querySelectorAll('a')[1]}`
                  //   if(!permalink.match(/\\*\/status\/\d+/)) {
                  //     console.warn('Found a permalink without status/1234, scrapping the second a tag')
                  //     permalink = `${e.path[5].childNodes[1].querySelectorAll('a')[2]}`
                  //     console.log('Found: ', permalink)
                  //   }
                  //   text = e.path[5].childNodes[1].querySelectorAll('.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0')[0].innerText
                  // } else {
                  //   // permalink = `https://twitter.com${e.path[6].dataset.permalinkPath}`
                  //   text = e.path[5].innerText.split('More')[1]
                  // }
                  if (text.includes('Retweete')) {
                    text = text.split('\n')[4]
                  }

                  text = text.substring(0, 20) + '...';
                  text = text.trim().replace('\n', '');
                  requests.queue.push(1)
                  let kek = statusId;

                  list.push({
                    id: kek,
                    text: text,
                    tweets: 0,
                    percentage: 0,
                    linkId: 0,
                    collectionURL: ''
                  })

                  let height = $("#notification").height()
                  let needHeight = HEIGHT_NOTIFICATION + list.length * HEIGHT_EACH_REQUEST

                  if (height != HEIGHT_NOTIFICATION || list.length == 1) {
                    newHeightRender(needHeight, 100)
                  }

                  if (!document.getElementById('text-notification')) {
                    $("#notification").fadeIn("slow")
                    // $("#container-noification").append(`<span id='text-notification'>${requests.queue.length} requests in process</span>`);
                    $("#container-noification").append(`<span id='text-notification'>Starting to gather related conversation</span>`);
                  } else {
                    // $("#text-notification").replaceWith(`<span id='text-notification'>${requests.queue.length} requests in process</span>`);
                    if (requests.queue.length == 0) $("#text-notification").replaceWith(`<span id='text-notification'>Related conversation ready to view/span>`);
                    else $("#text-notification").replaceWith(`<span id='text-notification'>Still looking</span>`);
                  }

                  let elem = $(this).context
                  $(this).replaceWith(`<div id="${statusId}">
                                          <div id="loader" ">
                                            <div class="swirl-big" style="float:right; background-image: url(${EXT_URL}/spinner_200.svg)"></div>
                                          </div>
                                        </div>`);

                  chrome.runtime.sendMessage({
                        method: 'socialCurationInit',
                        linkTitle: permalink
                      }, (response) => {
                        list[list.length - 1].linkId = response.data
                        console.log('\n\nRESPONSE WITH LINK ID:', response.data)
                        createCollection(statusId, response.data) // <------ REQUEST
                      }
                  )

                });
              }
            }
            // console.log(ourButtons)
          }


          needUpdateCharlotteIcons = true
        })
//        chrome.runtime.sendMessage({
//          method: 'checkShowOnTwitter'
//        }, function (response) {
//          if (response.result) {
//            if (needUpdateCharlotteIcons) {
//              needUpdateCharlotteIcons = false
//              if (window['useDefaultTwitterTooltip']) {
//                if (!isScrolling) {
//                  window['twitterInsertDefaultTooltip']();
//                }
//              }
//              else {
//                window['twitterTooltipEntryPoint']()
//              }
//            }
//            window['putRelatedConversation']()
//          }
//        })
      } else {
        window['$'](document).off('newTweetsLoad')
      }
      needUpdateCharlotteIcons = true
    })
  }
  observeNewTweets();


  // else {
  //   // setInterval(function () {
  //     chrome.runtime.connect().onDisconnect.addListener(function () {
  //       var needUpdateCharlotteIcons
  //       if (chrome.runtime.lastError) {
  //         needUpdateCharlotteIcons = true
  //         window['$'](document).bind('DOMSubtreeModified', function () {
  //           needUpdateCharlotteIcons = true
  //         })
  //         chrome.runtime.sendMessage({
  //           method: 'checkShowForAllWebsite'
  //         }, function (response) {
  //           if (response && response.result) {
  //             var checkArr = response.domainlist
  //             var checkDo = window.location.hostname
  //             for (var i = 0; i < checkArr.length; i++) {
  //               if (checkDo.indexOf(checkArr[i].split('.')[0]) !== -1) {
  //                 if (needUpdateCharlotteIcons) {
  //                   needUpdateCharlotteIcons = false
  //                   window['NewputTooltipOnWebsitePost']()
  //                 }
  //               }
  //             }
  //           }
  //         })
  //       } else {
  //         window['$'](document).unbind('DOMSubtreeModified')
  //       }
  //       window['$'](document).bind('DOMSubtreeModified', function () {
  //         needUpdateCharlotteIcons = false
  //       })
  //     })
  //   // }, 1000)
  //   // ..
  //   // setInterval(function() {
  //   //     chrome.runtime.sendMessage({method: "checkShowForAllWebsite"}, function(response) {
  //   //         console.log(response.result);
  //   //         var needUpdateCharlotteIcons = true;
  //   //         if (response.result) {
  //   //             if (needUpdateCharlotteIcons) {
  //   //                 needUpdateCharlotteIcons = false;
  //
  //   //                 console.log('Update tooltip on Webpage.');
  //   //                 NewputTooltipOnWebsitePost();
  //   //             }
  //   //         }
  //   //     });
  //   // }, 5000);
  //
  //   // setInterval(function() {
  //   //     chrome.runtime.sendMessage({method: "checkShowForAllWebsite"}, function(response) {
  //   //         console.log(response.result);
  //   //         if (response.result) {
  //   //             NewputTooltipOnWebsitePost();
  //   //         }
  //   //     });
  //   // }, 1000);
  // }
})()

function observeDefaultTooltip() {
  const callback = function(mutationsList)  {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length > 0) {
          window['addToDefaultTooltip']({srcElement : mutation.addedNodes[0]});
        }
      }
    }
  }

  function addObserverWhenTwitterLoad() {
    var target = document.querySelector('#react-root > div[data-reactroot] > div > h2 + div');
    if(!target) {
      //The twiiter container node not loaded yet. Wait 500ms and try again
      window.setTimeout(addObserverWhenTwitterLoad,500);
      return;
    }
    const observer = new MutationObserver(callback);
    observer.observe(target, {attributes: false, childList: true, subtree: false});
  }

  addObserverWhenTwitterLoad();
}

function observeNewTweets() {
  var newTweetsEvent = window['$'].Event('newTweetsLoad');
  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList'
          && $(mutation.addedNodes).find('article').length > 0
      ) {
        window['$'](document).trigger(newTweetsEvent, $(mutation.addedNodes[0]).find('article')[0]);
      }
    }
  };


  const observer = new MutationObserver(callback);

  function addObserverWhenTwitterLoad() {
    var tmpArt = document.querySelector("main div[data-testid=\"primaryColumn\"] section > div.css-1dbjc4n article");
    if(!tmpArt) {
      //The twiiter container node not loaded yet. Wait 500ms and try again
      window.setTimeout(addObserverWhenTwitterLoad,500);
      return;
    }
    var target = document.querySelector("main div[data-testid=\"primaryColumn\"] section > div.css-1dbjc4n > div");

    const config = {
      attributes: false,
      childList: true,
      subtree: false,
    };
    observer.observe(target, config);

    $('article').each(function () {
      window['$'](document).trigger(newTweetsEvent, $(this)[0]);
    });
  }
  addObserverWhenTwitterLoad();
}
