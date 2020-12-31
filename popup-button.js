var EXT_URL = `chrome-extension://${chrome.runtime.id}`
var domainlist = []
var loadTimer = null
var dontdisplay = false
var shouldBeOpen = false
var user_subscribed = false
    let INSTALLED = 'installed-c'
    const vertical = {
        popup: 'z-index: 2147483647 !important;position: fixed;background-color: #fff;bottom: 160px;right: 20px;font-family: sans-serif !important;font-weight: 500;width: 200px;padding: 15px;border: 2px solid rgba(0, 0, 0, 0.1);box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);border-radius: 3px;',
        container: 'width: 24px;text-align: center;font-size: 80px;z-index: 21474836470;height: 140px;display: inline;cursor: pointer;position: fixed;bottom: 4px;right: 130px;',
        arrow: 'width: 12px;height: 0px;text-align: center;justify-content: center;margin: auto;background: rgba(49, 33, 119, 1);border-radius: 3px 3px 0px 0;',
        arrowDown: 'width: 0;height: 0;border-left: 12px solid transparent;border-right: 12px solid transparent;border-top: 20px solid rgba(49, 33, 119, 1);border-radius: 4px;'
    }
var installed = true
var isCurationClickedFromPopUp = false;
var TimeLoading = {
  SCRIPT: Date.now(),
  DOM: 0,
  STYLE: 0,
  LOAD: 0
}

var popupMailHtml = `<style>
                        .mail-extension {
                          padding: 10px;
                          background-color: #df7ee836;
                          border-color: #f5c6cb;
                          color: #721c24;
                          border-radius: 5px;
                          font-size: 12px;
                          line-height: 14px;
                          bottom: 10px;
                        }
                      </style>  
                      <div id="mailAlert-extension" class="mail-extension">
                      </div>`

var popupReadingListHtml = `<style>
                        .mail-extension {
                          padding: 10px;
                          background-color: #fff;
                          /* background-color: #d5e2ff; */
                          border: 1px solid grey;
                          border-color: gray;
                          color: black;
                          border-radius: 5px;
                          font-size: 14px;
						  font-weight: 700;
                          line-height: 18px;
                          bottom: 10px;
						  margin-right: 600px;
                        }
                      </style>  
                      <div id="mailAlert-extension" class="mail-extension">
                      </div>`

async function showMail(data) {
  let time_length_to_show_mail = 100E3
  mailAlert = document.getElementById('mailAlert-extension');
  if (!mailAlert) {
	document.querySelector('#extensionNotifications').style.setProperty("bottom", "10px", "important")
    rootEl = document.getElementById('extensionNotifications');
    rootEl.innerHTML = popupMailHtml;
    mailAlert = document.getElementById('mailAlert-extension');
  }
  if (mailAlert && !mailAlert.querySelector("div[id='" + 7000 + "']")) {
    let mailMesage = document.createElement('div');
    mailMesage.className = "error-message";
    mailMesage.id = 7000
    mailMesage.innerHTML = "<a id='mailAlert-extension' href=#><img src='https://writepublic-uploads.s3.amazonaws.com/icons/591254-mail-16.webp' style='vertical-align:middle;padding-right:4px'>You have one new message</a>";
    mailAlert.appendChild(mailMesage);
	window['$']('#mailAlert-extension').click({param1: data.mail.promo_url, param2: "123 test"}, openMailIframe);

    setTimeout(() => {
      mailAlert.removeChild(mailMesage);
      if (0 === mailAlert.children.length) {
        mailAlert.remove();
      }
    }, time_length_to_show_mail)
  }

}

async function showReadingListAlert(data) {
  let time_length_to_show_mail = 1000E3
  mailAlert = document.getElementById('mailAlert-extension');
  if (!mailAlert) {
    document.querySelector('#extensionNotifications').style.setProperty("opacity", "0")
    document.querySelector('#extensionNotifications').style.setProperty("right", "-100%")
    document.querySelector('#extensionNotifications').style.setProperty("width", "1040px", "important")
    document.querySelector('#extensionNotifications').style.setProperty("bottom", "2%", "important")
    document.querySelector('#extensionNotifications').style.setProperty("transition", "right 2s linear")
    rootEl = document.getElementById('extensionNotifications');
    rootEl.innerHTML = popupReadingListHtml;
    mailAlert = document.getElementById('mailAlert-extension');
    setTimeout(() => {
      document.querySelector('#extensionNotifications').style.setProperty("opacity", "1")
      document.querySelector('#extensionNotifications').style.setProperty("right", "2%")
    }, 500);
  }

  if (mailAlert && !mailAlert.querySelector("div[id='" + 7000 + "']")) {
    let mailMesage = document.createElement('div');
    mailMesage.className = "error-message";
    mailMesage.id = 7000
    mailMesage.innerHTML = "<center style='padding-bottom: 5px;'><img src='https://writepublic-uploads.s3.amazonaws.com/icons/conversationlogoconly721.png' style='display:inline; vertical-align: middle; width: 25px;padding-right: 4px;'><font size=1>THE CONVERSATION - FEED UPDATE</font></center><br><center><img height=25 width=25 src='https://image.flaticon.com/icons/svg/166/166088.svg' style='vertical-align:middle;padding-right:8px;display:inline;width:25px;'><a id='readingList-extension' style='color:#337ab7; font-weight: 600; font-size:13.5px;' href=#>2 new reading recommendations from Twitter Friends. </a></center><b style='margin-top: 5px;color:blue !important;text-decoration: underline;'>";
    mailAlert.appendChild(mailMesage);
    window['$']('#readingList-extension').click({reading_list_array: data.personalization.tweets_for_reading_list}, openReadingListPage);    
    setTimeout(() => {
      mailAlert.removeChild(mailMesage);
      if (0 === mailAlert.children.length) {
        mailAlert.remove();
      }
    }, time_length_to_show_mail)
  }

}

async function showFriendRecommendationsAlert(data) {
  let time_length_to_show_mail = 1000E3
  mailAlert = document.getElementById('mailAlert-extension');
  if (!mailAlert) {
    document.querySelector('#extensionNotifications').style.setProperty("opacity", "0")
    document.querySelector('#extensionNotifications').style.setProperty("right", "-100%")
    document.querySelector('#extensionNotifications').style.setProperty("width", "1040px", "important")
    document.querySelector('#extensionNotifications').style.setProperty("bottom", "2%", "important")
    document.querySelector('#extensionNotifications').style.setProperty("transition", "right 2s linear")
    rootEl = document.getElementById('extensionNotifications');
    rootEl.innerHTML = popupReadingListHtml;
    mailAlert = document.getElementById('mailAlert-extension');
    setTimeout(() => {
      document.querySelector('#extensionNotifications').style.setProperty("opacity", "1")
      document.querySelector('#extensionNotifications').style.setProperty("right", "2%")
    }, 500);
  }

  if (mailAlert && !mailAlert.querySelector("div[id='" + 7000 + "']")) {
    let mailMesage = document.createElement('div');
    mailMesage.className = "error-message";
    mailMesage.id = 7000
    mailMesage.innerHTML = "<center style='padding-bottom: 0px;'><img src='https://writepublic-uploads.s3.amazonaws.com/icons/conversationlogoconly721.png' style='display:inline; vertical-align: middle; width: 25px;padding-right: 4px;'><font size=1>THE CONVERSATION - FEED UPDATE</font></center><br><center><!--<img height=25 width=25 src='https://image.flaticon.com/icons/svg/166/166088.svg' style='vertical-align:middle;padding-right:8px;display:inline;width:25px;'>--><a id='readingList-extension' style='color:#337ab7; font-weight: 600; font-size:13.5px;' href=#>New Articles recommended by your Friends for " +  window.location.hostname.replace('www.','') + ".</a></center><b style='margin-top: 5px;color:blue !important;text-decoration: underline;'>";    
    mailAlert.appendChild(mailMesage);
    window['$']('#readingList-extension').click({recommends_list_array: data.personalization.same_publisher_tweets_from_people_you_follow}, openFriendsSameDomainPage);    
    setTimeout(() => {
      mailAlert.removeChild(mailMesage);
      if (0 === mailAlert.children.length) {
        mailAlert.remove();
      }
    }, time_length_to_show_mail)
  }

}

var popupErrorHtml = `<style>
                        .alert-extension {
                          padding: 10px;
                          background-color: #f8d7da;
                          border-color: #f5c6cb;
                          color: #721c24;
                          border-radius: 5px;
                          font-size: 12px;
                          line-height: 14px;
                        }
                      </style>  
                      <div id="errorsAlert-extension" class="alert-extension">
                      </div>`

function showError(err) {
  let time_length_to_show_error = 10E3
  if (err.code === 4007){
    time_length_to_show_error = 5000E3
  }
  if (err.code === 4003 || err.code === 4004 || err.code === 4005){
    time_length_to_show_error = 5E3
  }
  errorsAlert = document.getElementById('errorsAlert-extension');
  if (!errorsAlert) {
    rootEl = document.getElementById('extensionNotifications');
    rootEl.innerHTML = popupErrorHtml;
    errorsAlert = document.getElementById('errorsAlert-extension');
  }
  if (errorsAlert && !errorsAlert.querySelector("div[id='" + err.code + "']")) {
    let errorMesage = document.createElement('div');
    errorMesage.className = "error-message";
    errorMesage.id = err.code
    errorMesage.innerHTML = err.message;
    errorsAlert.appendChild(errorMesage);
    setTimeout(() => {
      errorsAlert.removeChild(errorMesage);
      if (0 === errorsAlert.children.length) {
        errorsAlert.remove();
      }
    }, time_length_to_show_error)
  }

}


function openReadingListPage(event) {
  let openReadingListTab = null
  let reading_list = event.data.reading_list_array
  chrome.runtime.sendMessage({message: 'READING_LIST', 'reading_list': reading_list})
  openReadingListIframe()
  //chrome.tabs.create({url: EXT_URL + '/widget/reading_list.html'})
  //chrome.tabs.create({url: `chrome-extension://${chrome.runtime.id}/widget/reading_list.html`}, function (tab) {
    //openReadingListTab = tab;
  //});
}

async function openFriendsSameDomainPage(event) {
  let openReadingListTab = null
  let recommends_list = event.data.recommends_list_array
  var recommends_list_ids = []
  var recommends_listLength = recommends_list.length;
  for (var i = 0; i < recommends_listLength; i++) {
    console.log(recommends_list[i]['id']);
    recommends_list_ids.push(recommends_list[i]['id'])
}
  chrome.runtime.sendMessage({message: 'RECOMMENDS_LIST', 'recommends_list': recommends_list_ids})
  openReadingListIframe(mode='same_domain')
}
  
function twitterShowLeftPanel() {
  var svg = window['$']('.extension-svg');
  if (svg.length > 0) svg['remove']();
  window['document']['body']['classList']['remove']('body-collapsed');
}

function openReadingListIframe(mode='all_sites') {
  let iframe = document.querySelector('iframe#limitReached');
  if (!iframe || iframe == null) {
    iframe = document.createElement('iframe');
    iframe.src = `${EXT_URL + '/widget/reading_list.html'}`;
    if (mode == 'same_domain'){
      iframe.src = `${EXT_URL + '/widget/recommends_list.html'}`;
	}
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'yes');
    iframe.setAttribute('id', 'limitReached');
    iframe.setAttribute('style', `position: fixed;
          top: 25px;
          display: block;
          width: 100%;
          max-width: 1100px;
          height: 620px;
          left: 10%;
          margin-left: -1px;
          z-index: 99999999999999;
          -webkit-box-shadow: -12px 0px 148px 110px rgba(50,50,50,.3);
          //*-webkit-box-shadow: -12px 0px 148px 110px rgba(0,0,0,0.3);*//
          -moz-box-shadow: -12px 0px 148px 110px rgba(0,0,0,0.3);
          transition: opacity .5s linear;
          opacity: 0;
    `);
    setTimeout(() => {
      iframe.style.opacity = 1;
    }, 100);
    iframe.style.setProperty("z-index", "2147483647", "important");
    rootElement = document.querySelector('#overlay_Div1');
    document.body.appendChild(iframe);
    iframeClose = document.createElement('div');
    iframeClose.setAttribute('id', 'iframeClose');
    iframeClose.onclick = function() {
      document.querySelector('iframe#limitReached').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('iframe#limitReached').remove();
        this.remove();
      }, 100);
    }
    iframeClose.setAttribute('style', `position: fixed;
          top: 0;
          margin-top: 40px;
          display: block;
          height: 60%;
          left: 49%;
          margin-left: 330px;
          font-family: poppins, arial;
          font-size: 12px;
          color: gray;
          font-weight: 600;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          z-index: 2147483648;
      `);
    iframeClose.textContent = 'CLOSE';
    document.body.appendChild(iframeClose);
  }
  return iframe
}


function openLimitReachedIframe() {
  let iframe = document.querySelector('iframe#limitReached');
  if (!iframe || iframe == null) {
    iframe = document.createElement('iframe');
    iframe.src = "https://theconversation.social/limit_reached/";
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('id', 'limitReached');
    iframe.setAttribute('style', `position: fixed;
          top: 25px;
          display: block;
          width: 750px;
          height: 600px;
          left: 50%;
			    margin-left: -375px;
          z-index: 99999999999999;
          -webkit-box-shadow: -12px 0 48px 0 rgba(50,50,50,.20);
          //*-webkit-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0.35);*//
          -moz-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0);
          transition: opacity .5s linear;
          opacity: 0;
    `);
    setTimeout(() => {
      iframe.style.opacity = 1;
    }, 100);
    iframe.style.setProperty("z-index", "2147483647", "important");
    rootElement = document.querySelector('#overlay_Div1');
    document.body.appendChild(iframe);
    iframeClose = document.createElement('div');
    iframeClose.setAttribute('id', 'iframeClose');
    iframeClose.onclick = function() {
      document.querySelector('iframe#limitReached').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('iframe#limitReached').remove();
        this.remove();
      }, 100);
    }
    iframeClose.setAttribute('style', `position: fixed;
          top: 0;
          margin-top: 40px;
          display: block;
          height: 60%;
          left: 49%;
          margin-left: 330px;
          font-family: poppins, arial;
			    font-size: 12px;
			    color: gray;
			    font-weight: 600;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          z-index: 2147483648;
      `);
    iframeClose.textContent = 'CLOSE';
    document.body.appendChild(iframeClose);
  }
  return iframe
}

function openNoSubscriptionIframe() {
  let iframe = document.querySelector('iframe#limitReached');
  if (!iframe || iframe == null) {
    iframe = document.createElement('iframe');
    iframe.src = `${EXT_URL + '/widget/no_subscription.html'}`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('id', 'limitReached');
    iframe.setAttribute('style', `position: fixed;
          top: 25px;
          display: block;
          width: 750px;
          height: 600px;
          left: 50%;
			    margin-left: -375px;
          z-index: 99999999999999;
          -webkit-box-shadow: -12px 0 48px 0 rgba(50,50,50,.20);
          //*-webkit-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0.35);*//
          -moz-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0);
          transition: opacity .5s linear;
          opacity: 0;
    `);
    setTimeout(() => {
      iframe.style.opacity = 1;
    }, 100);
    iframe.style.setProperty("z-index", "2147483647", "important");
    rootElement = document.querySelector('#overlay_Div1');
    document.body.appendChild(iframe);
    iframeClose = document.createElement('div');
    iframeClose.setAttribute('id', 'iframeClose');
    iframeClose.onclick = function() {
      document.querySelector('iframe#limitReached').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('iframe#limitReached').remove();
        this.remove();
      }, 100);
    }
    iframeClose.setAttribute('style', `position: fixed;
          top: 0;
          margin-top: 40px;
          display: block;
          height: 60%;
          left: 49%;
          margin-left: 330px;
          font-family: poppins, arial;
			    font-size: 12px;
			    color: gray;
			    font-weight: 600;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          z-index: 2147483648;
      `);
    iframeClose.textContent = 'CLOSE';
    document.body.appendChild(iframeClose);
  }
  return iframe
}

async function openMailIframe(event) {
  let url_to_iframe = event.data.param1;
  let iframe = document.querySelector('iframe#limitReached');
  if (!iframe || iframe == null) {
    iframe = document.createElement('iframe');
    value1="false"
    // important -- to use this you must edit manifest.json; add your html where widget/index.html is
    //iframe.src = `${EXT_URL + '/widget/no_subscription.html'}`;
    //iframe.src = `${EXT_URL + '/widget/no_subscription.html?param1=' + value1}`
    //iframe.src = 'https://theconversation.social/promo_for_ext_user/'
    //iframe.src = 'https://theconversation.social/promo_for_send_invitations/'
    iframe.src = url_to_iframe // here we are passing a url from the backend API to know what to serve
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('id', 'limitReached');
    iframe.setAttribute('style', `position: fixed;
          top: 25px;
          display: block;
          width: 750px;
          height: 600px;
		      border: 2px solid grey;
          left: 50%;
			    margin-left: -375px;
          z-index: 99999999999999;
          -webkit-box-shadow: -12px 0 48px 0 rgba(50,50,50,.20);
          //*-webkit-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0.35);*//
          -moz-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0);
          transition: opacity .5s linear;
          opacity: 0;
    `);
    setTimeout(() => {
      iframe.style.opacity = 1;
    }, 100);
    iframe.style.setProperty("z-index", "2147483647", "important");
    rootElement = document.querySelector('#overlay_Div1');
    document.body.appendChild(iframe);
    iframeClose = document.createElement('div');
    iframeClose.setAttribute('id', 'iframeClose');
    iframeClose.onclick = function() {
      document.querySelector('iframe#limitReached').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('iframe#limitReached').remove();
        this.remove();
      }, 100);
    }
    iframeClose.setAttribute('style', `position: fixed;
          top: 0;
          margin-top: 40px;
          display: block;
          height: 60%;
          left: 49%;
          margin-left: 330px;
          font-family: poppins, arial;
			    font-size: 12px;
			    color: gray;
			    font-weight: 600;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          z-index: 2147483648;
      `);
    iframeClose.textContent = 'CLOSE';
    document.body.appendChild(iframeClose);
  }
  return iframe
}

function resetLoadParams() {
  load.timing = 0;
  load.frames_per_sec = 30;
  load.cur_speed = 1.5 / load.frames_per_sec;
  load.min_anim_speed = 4;
  clearInterval(load.load_interval);
  load.load_interval = null;
  load.cur_progress = 0;
}

function load () {
  // Got response in content script

  // init SVG animation vars
  resetLoadParams()
  load.cur_progress = window['$']('#curate_button_id').attr('data-progress') | 0
  //let cur_progress = 0

  // eslint-disable-next-line no-undef
  chrome.runtime.onMessage.addListener((request) => {
    const updateProgress = (value) => {
      const getPathData = (percentage) => {
        const getPathString = (startX, startY, startAngle, endAngle, radius) => {
          var x1 = (startX + radius * Math.cos(Math.PI * startAngle / 180)).toFixed(3)
          var y1 = (startY + radius * Math.sin(Math.PI * startAngle / 180)).toFixed(3)
          var x2 = (startX + radius * Math.cos(Math.PI * endAngle / 180)).toFixed(3)
          var y2 = (startY + radius * Math.sin(Math.PI * endAngle / 180)).toFixed(3)
          var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
          var pathString = 'M' + startX + ',' + startY + ' L' + x1 + ',' + y1 + ' A' + radius + ', ' + radius + ', 0, ' + largeArcFlag + ', 1, ' + x2 + ', ' + y2 + 'z'
          return pathString
        }

        const maxAngle = 360 / 100 * percentage;
        const svg = window['$']('#curate_button_id').find('svg');
        const svgElement = svg.get(0);

        const width = parseInt(svgElement ? svgElement.getAttribute('width') : '80');
        const height = parseInt(svgElement ? svgElement.getAttribute('height'): '80');

        return getPathString(width / 2, height / 2, -90, maxAngle - 90, 40)
      }

      value = parseFloat(value)
      if (value == 100) {
        value = 99.99
      }
      const speed_adjuster = ((1 / (value - load.cur_progress)) * 2) + 1
      const speed = ((value - load.cur_progress) / ((load.min_anim_speed * load.frames_per_sec) / speed_adjuster));
      load.cur_speed = speed
      // eslint-disable-next-line no-console
      console.log((load.timing / 1000).toFixed(2), load.cur_progress.toFixed(2), value.toFixed(2), load.cur_speed.toFixed(2), "Data")
      if (!load.load_interval) {
        load.load_interval = setInterval(function () {
          load.timing = load.timing + (1000 / load.frames_per_sec)
          load.cur_progress = load.cur_progress + load.cur_speed
          if (load.cur_progress > 99) {
            load.cur_progress = 99.99
          }
          const pathValue = getPathData(load.cur_progress)
          const path = document.getElementById('clip_path')
          path.setAttribute('d', pathValue)
          if (load.cur_progress == 99.99) {
            // eslint-disable-next-line no-console
            console.log('Finished at :', load.timing / 1000)
            clearInterval(load.load_interval)
          }
        }, 1000 / load.frames_per_sec)
      }
    }

    if (request.message === 'NOTIFICATION_ERROR') {
      showError(request.data)
    }
    else if (request.message === 'LIMIT_REACHED_ERROR') {
      openLimitReachedIframe()
    }
    else if (request.message === 'NO_SUBSCRIPTION_ERROR') {
      openNoSubscriptionIframe()
    }
    else if ((request.message === 'API') && (window.location.hostname !== 'twitter.com')) {
      if (request.data.mail){
      showMail(request.data)
      }
      if (request.data.personalization){
        if ((request.data.personalization.same_publisher_tweets_from_people_you_follow) &&
         (request.data.personalization.same_publisher_tweets_from_people_you_follow.length > 0)) {
           showFriendRecommendationsAlert(request.data)
		}	
        // removing tweets_for_reading_list alert
        else  {
          const arr = [{"description": "The first plan didn\u2019t go so well, but the Bucks still managed to overhaul their roster. Are the changes enough to get Giannis Antetokounmpo to commit to a supermax extension?", "title": "Milwaukee\u2019s Makeover Is Complete. Now Comes the $230 Million Question.", "url": "https://www.theringer.com/nba/2020/11/23/21591220/nba-free-agency-milwaukee-bucks-giannis-antetokounmpo", "image": [[{"url": "https://cdn.vox-cdn.com/thumbor/1rz6TbW24y-qHBAS3Mz2lY4xCgE=/0x2:1200x630/fit-in/1200x630/cdn.vox-cdn.com/uploads/chorus_asset/file/22067829/mahoney_giannis_getty_ringer.jpg", "width": 1200, "height": 630}]], "shared_by": {"verified": true, "screen_name": "RobMahoney", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/64682146/falco_normal.gif", "full_name": "Rob Mahoney", "time_stamp": "Mon Nov 23 17:35:28 +0000 2020", "time_ago": " 25m"}, "id": "1330921942656950273"}, {"description": "", "title": "How a bloody night of bullets quashed a young protest movement", "url": "https://edition.cnn.com/2020/11/18/africa/lagos-nigeria-lekki-toll-gate-feature-intl/index.html", "image": [""], "shared_by": {"verified": true, "screen_name": "OpenSociety", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/977234997722611719/-LguC_99_normal.jpg", "full_name": "Open Society Foundations", "time_stamp": "Mon Nov 23 17:34:42 +0000 2020", "time_ago": "  2m"}, "id": "1330927769744764929"}, {"description": "", "title": "Perspective | The GOP is now the Boiled Frog Party", "url": "https://www.washingtonpost.com/outlook/2020/11/22/gop-is-now-boiled-frog-party/", "image": [""], "shared_by": {"verified": true, "screen_name": "dandrezner", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1276720417944846336/QjM109Yg_normal.jpg", "full_name": "Daniel W. Drezner", "time_stamp": "Mon Nov 23 17:34:09 +0000 2020", "time_ago": "  2m"}, "id": "1330927632368721925"}, {"description": "John Kerry, the former secretary of state, will be climate czar, according to the Biden transition team.", "title": "Biden Will Nominate First Woman to Lead Intelligence, First Latino to Run Homeland Security", "url": "https://www.nytimes.com/2020/11/23/us/politics/biden-nominees.html", "image": [[{"url": "https://static01.nyt.com/images/2020/11/23/us/politics/23dc-biden-cabinet1-sub/23dc-biden-cabinet1-sub-facebookJumbo.jpg", "width": 1050, "height": 550}]], "shared_by": {"verified": true, "screen_name": "sam_vinograd", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1146535821236813824/g-KSK1B3_normal.jpg", "full_name": "Sam Vinograd", "time_stamp": "Mon Nov 23 17:33:39 +0000 2020", "time_ago": "  3m"}, "id": "1330927504748634115"}, {"description": "Leaked documents reveal Amazon's reliance on Pinkerton operatives to spy on workers and its extensive monitoring of labor unions and social movements.", "title": "Secret Amazon Reports Expose Company Spying on Labor, Environmental Groups", "url": "https://www.vice.com/en/article/5dp3yn/amazon-leaked-reports-expose-spying-warehouse-workers-labor-union-environmental-groups-social-movements", "image": [[{"url": "https://video-images.vice.com/articles/5fbbd84c131e330096afd2cc/lede/1606146309251-leaked-amazon-intelligence-reports-reveal-how-amazon-monitors-unions-and-social-movements-to-protect-itselflede-and-socialhf-1.jpeg?image-resize-opts=Y3JvcD0xeHc6MC40ODN4aDsweHcsMHhoJnJlc2l6ZT0xMjAwOiomcmVzaXplPTEyMDA6Kg", "width": 1200, "height": 674}]], "shared_by": {"verified": true, "screen_name": "onesarahjones", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1276517569294458880/IPbF_SqC_normal.jpg", "full_name": "Sarah Jones", "time_stamp": "Mon Nov 23 17:33:23 +0000 2020", "time_ago": "  3m"}, "id": "1330927439179096065"}, {"description": "President-elect Joe Biden on Monday announced the members of his foreign policy and national security team.", "title": "Joe Biden announces top foreign policy and national security picks", "url": "https://www.cnn.com/2020/11/23/politics/joe-biden-foreign-policy-national-security-cabinet/index.html", "image": [[{"url": "https://cdn.cnn.com/cnnnext/dam/assets/201122233533-joe-biden-1119-super-tease.jpg", "width": 1100, "height": 619}]], "shared_by": {"verified": true, "screen_name": "jimsciutto", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1135502950351159304/kGJgAERD_normal.jpg", "full_name": "Jim Sciutto", "time_stamp": "Mon Nov 23 17:31:07 +0000 2020", "time_ago": "  8m"}, "id": "1330926191549800451"}, {"description": "\u200eHistory \u00b7 2020", "title": "\u200eYou're Wrong About on Apple Podcasts", "url": "https://podcasts.apple.com/us/podcast/the-electoral-college/id1380008439", "image": [[{"url": "https://is5-ssl.mzstatic.com/image/thumb/Podcasts113/v4/2f/c1/29/2fc1293c-f0ed-edb9-3172-1edbfe3cab37/mza_6880413875887879581.jpg/1200x630wp.png", "width": 1200, "secure_url": "https://is5-ssl.mzstatic.com/image/thumb/Podcasts113/v4/2f/c1/29/2fc1293c-f0ed-edb9-3172-1edbfe3cab37/mza_6880413875887879581.jpg/1200x630wp.png", "type": "image/png", "height": 630}]], "shared_by": {"verified": false, "screen_name": "kottke", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/775300604646359040/6mkGOPp0_normal.jpg", "full_name": "kottke.org", "time_stamp": "Mon Nov 23 17:31:00 +0000 2020", "time_ago": "  5m"}, "id": "1330926838013636615"}, {"description": "The operation targeted immigrants who officials say had promised to leave the US but did not.", "title": "ICE Arrested More Than 180 Immigrants In A Nationwide Sweep", "url": "https://www.buzzfeednews.com/article/hamedaleaziz/ice-arrests-immigrants-nationwide-sweep", "image": [[{"url": "https://img.buzzfeed.com/buzzfeed-static/static/2020-11/18/21/asset/b537877860a1/sub-buzz-13830-1605734276-12.jpg?crop=3000%3A1570%3B0%2C215", "width": 3000, "height": 1570}]], "shared_by": {"verified": true, "screen_name": "CREWcrew", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1314282774493356032/U05fnjcs_normal.jpg", "full_name": "Citizens for Ethics", "time_stamp": "Mon Nov 23 17:30:42 +0000 2020", "time_ago": "  6m"}, "id": "1330926762096795654"}, {"description": "Spring can be just as itchy, sneezy, and wholly uncomfortable for some dogs as their allergy-prone owners. Our pups can also be allergic to particles of dust and pollen and foods like wheat and fish\u2014all the result of an overactive immune system fighting against harmless adversaries. And, just like their human pals, dogs develop allergies more often today than decades ago\u2014almost one in five make a trip to the vet for allergy relief, says Christopher Reeder, a dermatologist with BluePearl Veterinary Partners.", "title": "Your dog gets allergies for the same reasons you do", "url": "https://www.popsci.com/dog-allergies/", "image": [[{"url": "https://www.popsci.com/resizer/QOe--X2gbNu5oft-98MWqs6EVU8=/1200x628/smart/cloudfront-us-east-1.images.arcpublishing.com/bonnier/JDSUXM2BEX5BTSXDM2XGAA7QUM.jpg", "width": 1200, "height": 628}]], "shared_by": {"verified": true, "screen_name": "PopSci", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1029084163780079616/KL96wS4C_normal.jpg", "full_name": "Popular Science", "time_stamp": "Mon Nov 23 17:30:15 +0000 2020", "time_ago": "  6m"}, "id": "1330926649777549312"}, {"description": "\u200eBasketball \u00b7 2020", "title": "\u200eHollinger & Duncan NBA Show - NBA Basketball Podcast on Apple Podcasts", "url": "https://podcasts.apple.com/us/podcast/hollinger-duncan-nba-show-nba-basketball-podcast/id1483267868", "image": [[{"url": "https://is1-ssl.mzstatic.com/image/thumb/Podcasts123/v4/af/26/c2/af26c2d8-9f2c-724b-adb2-4f8d4c6bd1f8/mza_15861725590117347487.png/1200x630wp.png", "width": 1200, "secure_url": "https://is1-ssl.mzstatic.com/image/thumb/Podcasts123/v4/af/26/c2/af26c2d8-9f2c-724b-adb2-4f8d4c6bd1f8/mza_15861725590117347487.png/1200x630wp.png", "type": "image/png", "height": 630}]], "shared_by": {"verified": true, "screen_name": "NateDuncanNBA", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1273079491636551680/Xeaept2X_normal.jpg", "full_name": "Nate Duncan", "time_stamp": "Mon Nov 23 17:30:00 +0000 2020", "time_ago": "  6m"}, "id": "1330926587793993729"}, {"description": "John Kerry, the former secretary of state, will be climate czar, according to the Biden transition team.", "title": "Biden Will Nominate First Woman to Lead Intelligence, First Latino to Run Homeland Security", "url": "https://www.nytimes.com/2020/11/23/us/politics/biden-nominees.html", "image": [[{"url": "https://static01.nyt.com/images/2020/11/23/us/politics/23dc-biden-cabinet1-sub/23dc-biden-cabinet1-sub-facebookJumbo.jpg", "width": 1050, "height": 550}]], "shared_by": {"verified": true, "screen_name": "davidaxelrod", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1025494480303149056/TQxxSehL_normal.jpg", "full_name": "David Axelrod", "time_stamp": "Mon Nov 23 17:29:49 +0000 2020", "time_ago": "  6m"}, "id": "1330926541627404288"}, {"description": "News Analysis President Donald Trump&#39;s latest executive order bars U.S. investors from holding ownership stakes in a list ...", "title": "US Invested Billions Into Companies With Ties to Chinese Military", "url": "https://www.theepochtimes.com/us-invested-billions-into-companies-with-ties-to-chinese-military_3587923.html", "image": [{"url": "https://img.theepochtimes.com/assets/uploads/2020/11/23/GettyImages-1225933376-1200x800.jpg"}], "shared_by": {"verified": false, "screen_name": "FriedasMom7", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/950647842602823681/xV8EnANf_normal.jpg", "full_name": "Friedas Mom", "time_stamp": "Mon Nov 23 16:55:54 +0000 2020", "time_ago": "  2m"}, "id": "1330918007086981129"}, {"description": "", "title": "Trump Faces Growing Calls From Biz Leaders To Concede After Legal Battles Fall Flat", "url": "https://talkingpointsmemo.com/news/business-leaders-pressure-trump-concede", "image": [""], "shared_by": {"verified": true, "screen_name": "joshtpm", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1329623108815302656/KsxWarHh_normal.jpg", "full_name": "Josh Marshall", "time_stamp": "Mon Nov 23 16:54:09 +0000 2020", "time_ago": "  1m"}, "id": "1330917564315279360"}, {"description": "Jim Troupis, one of the Trump campaign lawyers seeking to throw out tens of thousands of 2020 ballots in the...", "title": "Trump Lawyer Tries To Toss Out His Own Vote In Wisconsin Recount", "url": "https://talkingpointsmemo.com/news/trump-lawyer-tries-to-toss-out-his-own-vote-in-wisconsin-recount", "image": [[{"url": "https://cdn.talkingpointsmemo.com/wp-content/uploads/2020/11/GettyImages-1283694778-804x536.jpg", "width": 804, "secure_url": "https://cdn.talkingpointsmemo.com/wp-content/uploads/2020/11/GettyImages-1283694778-804x536.jpg", "height": 536}]], "shared_by": {"verified": true, "screen_name": "joshtpm", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1329623108815302656/KsxWarHh_normal.jpg", "full_name": "Josh Marshall", "time_stamp": "Mon Nov 23 16:53:57 +0000 2020", "time_ago": "  2m"}, "id": "1330917516848328709"}, {"description": "Power Rangers and Rise of Ultraman writer Kyle Higgins and artist Marcelo Costa talk about their new creator-owned superhero series for Image Comics, Radiant Black\u2014a Tokusatsu-inspired riff on coming-of-age superhero stories with an older protagonist.", "title": "Radiant Black Team Talks Bringing Power Rangers Vibes to Older Heroes", "url": "https://io9.gizmodo.com/the-team-behind-radiant-black-talk-bringing-power-range-1845691447", "image": [[{"url": "https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_675,pg_1,q_80,w_1200/ys8cofzyi1joqpsbmtbt.png", "width": 1200, "height": 675}]], "shared_by": {"verified": true, "screen_name": "KyleDHiggins", "days_ago": "3", "avatar": "https://pbs.twimg.com/profile_images/1329596544798969856/amo4s-9i_normal.jpg", "full_name": "Kyle Higgins", "time_stamp": "Mon Nov 23 16:52:54 +0000 2020", "time_ago": "  3d"}, "id": "1329515231333154817"}, {"description": "Pennsylvania state lawmakers were split Friday morning as they prepared to vote on a state budget that would take $1.3 billion of federal emergency money originally intended to help coronavirus-battered segments of society and use it instead to shore up state finances.", "title": "Pennsylvania restaurants, taverns, others lose out as state lawmakers use $1.3 billion of federal coronavirus funds to plug budget gap", "url": "https://www.mcall.com/news/pennsylvania/capitol-ideas/mc-nws-pa-lawmakers-emergency-money-20201120-3rz2s7aj7va4dfz4jntciz43hi-story.html", "image": [[{"url": "https://www.mcall.com/resizer/4dFX60Zg9od5dv7sywsv4cQI7pA=/1200x0/top/cloudfront-us-east-1.images.arcpublishing.com/tronc/R27AR4H7CJAE3C5LUI3P6F377A.jpg", "width": 1200, "height": 800}]], "shared_by": {"verified": false, "screen_name": "AbbyCScience", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1258773350035468288/9zX7Sfun_normal.jpg", "full_name": "Abby", "time_stamp": "Mon Nov 23 16:51:49 +0000 2020", "time_ago": "  4m"}, "id": "1330916978463215619"}, {"description": "A group of NBA player met with the Pope at the Vatican to discuss social justice issues.", "title": "NBA players, Pope meet to talk social justice", "url": "https://www.espn.com/nba/story/_/id/30371187/nba-players-pope-meet-talk-social-justice", "image": [{"url": "https://a3.espncdn.com/combiner/i?img=%2Fphoto%2F2020%2F1007%2Fr757023_1296x729_16%2D9.jpg"}], "shared_by": {"verified": true, "screen_name": "ZachLowe_NBA", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/378800000547404235/8a06ce6d5a29c02e2e8e81c9874f3468_normal.png", "full_name": "Zach Lowe", "time_stamp": "Mon Nov 23 16:51:02 +0000 2020", "time_ago": "  5h"}, "id": "1330827920621907970"}, {"description": "If money is the oxygen on which the fire of global warming burns, then P.R. campaigns and snappy catchphrases are the kindling.", "title": "When \u201cCreatives\u201d Turn Destructive: Image-Makers and the Climate Crisis", "url": "https://www.newyorker.com/news/daily-comment/when-creatives-turn-destructive-image-makers-and-the-climate-crisis", "image": [[{"url": "https://media.newyorker.com/photos/5fb4464768ad65a860571e74/16:9/w_1280,c_limit/McKibben-CreativesvsFossilFuel.jpg", "width": 1280, "height": 720}]], "shared_by": {"verified": true, "screen_name": "billmckibben", "days_ago": "2", "avatar": "https://pbs.twimg.com/profile_images/772840695161774080/_FkC7iL3_normal.jpg", "full_name": "Bill McKibben", "time_stamp": "Mon Nov 23 16:50:46 +0000 2020", "time_ago": "  2d"}, "id": "1330134559183286273"}, {"description": "", "title": "Ethiopia: 45% of telecoms company Ethio to be sold off, despite conflict in the north", "url": "https://www.theafricareport.com/51731/ethiopia-45-of-telecoms-company-ethio-to-be-sold-off-despite-conflict-in-the-north/", "image": [""], "shared_by": {"verified": false, "screen_name": "TheAfricaReport", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1107694599324221443/xDVfskQj_normal.png", "full_name": "The Africa Report", "time_stamp": "Mon Nov 23 16:50:16 +0000 2020", "time_ago": "  5m"}, "id": "1330916586119684098"}, {"description": "A proposal in Washington state would use right-to-try laws to allow terminally ill patients access to psilocybin \u2014 the famed magic mushrooms of America\u2019s psychedelic \u201960s \u2014 to ease depression and anxiety.", "title": "New legal push in Washington state aims to speed magic mushrooms to dying patients", "url": "https://www.seattletimes.com/seattle-news/health/new-legal-push-in-washington-state-aims-to-speed-magic-mushrooms-to-dying-patients/", "image": [[{"url": "https://static.seattletimes.com/wp-content/uploads/2020/11/11222020_TZR_tzr_144036-375x241.jpg", "width": 200, "height": 200}]], "shared_by": {"verified": true, "screen_name": "KHNews", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/971053550192218113/FzdsKYxq_normal.jpg", "full_name": "Kaiser Health News", "time_stamp": "Mon Nov 23 16:49:23 +0000 2020", "time_ago": "  6m"}, "id": "1330916363779629059"}, {"description": "The players and officials from their union were invited last week to discuss their campaign at the Vatican.", "title": "N.B.A. Players Meet With Pope Francis on Social Justice Efforts", "url": "https://www.nytimes.com/2020/11/23/sports/basketball/nba-pope-francis-protests.html", "image": [[{"url": "https://static01.nyt.com/images/2020/11/23/sports/23nba-pope2/23nba-pope2-facebookJumbo.jpg", "width": 1050, "height": 549}]], "shared_by": {"verified": true, "screen_name": "ZachLowe_NBA", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/378800000547404235/8a06ce6d5a29c02e2e8e81c9874f3468_normal.png", "full_name": "Zach Lowe", "time_stamp": "Mon Nov 23 16:48:55 +0000 2020", "time_ago": "  1m"}, "id": "1330916247328989186"}, {"description": "In delaying the transition, the General Services Administration chief appears to be making an ideological choice.", "title": "Why Won&#39;t Emily Murphy Just Do Her Job?", "url": "https://www.theatlantic.com/ideas/archive/2020/11/why-wont-emily-murphy-just-do-her-job/617184/", "image": [{"url": "https://cdn.theatlantic.com/thumbor/Qai2aTAGy-sn_5TBhQ59IFm3Bws=/0x43:2000x1085/960x500/media/img/mt/2020/11/Alex_Edelman_Getty/original.jpg"}], "shared_by": {"verified": true, "screen_name": "anneapplebaum", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1298657574196334594/G7_P6eHF_normal.jpg", "full_name": "Anne Applebaum", "time_stamp": "Mon Nov 23 16:47:23 +0000 2020", "time_ago": "  3h"}, "id": "1330861863530336259"}, {"description": "The Nigerian rescue mission shows how CV-22B Ospreys and MC-130J Commando IIs based in the UK are truly America's \"9-1-1\" force.", "title": "America's Elite Flying Unit That Made The Recent Long-Range Hostage Rescue In Africa Possible", "url": "https://www.thedrive.com/the-war-zone/37738/americas-elite-flying-unit-that-made-the-recent-long-range-hostage-rescue-in-africa-possible", "image": [[{"url": "https://api.thedrive.com/wp-content/uploads/2020/11/325f.jpg?quality=85", "width": 1920, "height": 1080}]], "shared_by": {"verified": true, "screen_name": "jaredbkeller", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1188305865436270595/0z-Hw42x_normal.jpg", "full_name": "Jared Keller", "time_stamp": "Mon Nov 23 16:47:21 +0000 2020", "time_ago": "  2m"}, "id": "1330915856210161668"}, {"description": "While misinformation about the virus spread globally, Brazil\u2019s disinformation ecosystem remained isolated, shaped by the country\u2019s\u2026", "title": "New report analyzes Brazil\u2019s self-isolation from the global COVID-19 infodemic", "url": "https://medium.com/dfrlab/new-report-analyzes-brazils-self-isolation-from-the-global-covid-19-infodemic-34bcd1b0ea9c", "image": [[{"url": "https://miro.medium.com/max/1200/1*qjuzH8aGKt5hPlSi5FCvEg.png", "width": 1200, "height": 450}]], "shared_by": {"verified": true, "screen_name": "DFRLab", "days_ago": "0", "avatar": "https://pbs.twimg.com/profile_images/1174400539792150528/jP59J4AG_normal.jpg", "full_name": "DFRLab", "time_stamp": "Mon Nov 23 16:47:08 +0000 2020", "time_ago": "  3m"}, "id": "1330915801432547332"}]
		   chrome.runtime.sendMessage({message: 'READING_LIST', 'reading_list': arr})
           //showReadingListAlert(request.data) 
		}
	  } 
      const { data = {} } = request
      const dataProgress = window['$']('#curate_button_id').attr('data-progress') | 0
      if (data && (data.completion_percentage && (dataProgress < 100)) || (data.completion_percentage == 'undefined')) {
        const currentPercentage = data.completion_percentage | 1
	  //* use logic below if you want it to move at all times.
      //const currentPercentage = data.completion_percentage | 1
      //if (data && (dataProgress < 100) && (dataProgress < currentPercentage)) {
        updateProgress(currentPercentage)
        // eslint-disable-next-line no-console
        console.log('data-progress', currentPercentage)
        window['$']('#curate_button_id').attr('data-progress', currentPercentage)

        if (shouldBeOpen && (data.stats || {total_tweets: 0}).total_tweets > 0) {
          openWidget_popup()
        }

        if (((data.stats || {total_tweets: 0}).total_tweets > 0) || (data.status && data.status == 'finished')){
          const size = String(data.stats.total_tweets).length;
          window['$']('#curate_button_id .__badge').text(data.stats.total_tweets);
          window['$']('#curate_button_id .__badge').addClass('badge-size-' + size);
          window['$']('#curate_button_id .__badge').show();
        }
      }
    }
  })

  window.addEventListener('load', () => {
    TimeLoading.LOAD = Date.now()

    console.log('-------------------------------------------')
    console.log('DOM CONTENT LOADED', TimeLoading.DOM)
    console.log('STYLE LOADED', TimeLoading.STYLE)
    console.log('FULL LOADED', TimeLoading.LOAD)
    console.log('FULL LOADED  - DOM Content Loaded (sec)', (TimeLoading.LOAD - TimeLoading.DOM) / 1000)
    console.log('FULL LOADED  - STYLE LOADED', (TimeLoading.LOAD - TimeLoading.STYLE) / 1000)
    console.log('STYLE LOADED - DOM Content Loaded (sec)', (TimeLoading.STYLE - TimeLoading.DOM) / 1000)
    console.log('DOM Content Loaded - Content script inited (sec)', (TimeLoading.DOM - TimeLoading.SCRIPT) / 1000)
    console.log('-------------------------------------------')
  }, false)

  // Get information about tab id
  chrome.runtime.sendMessage({message: 'TAB_ID'}, (response) => {
    const {tabId} = response
    chrome.storage.onChanged.addListener((changes) => {
      if ('close' in changes && changes.close.newValue && changes.close.newValue.tabId === tabId) {
        const iframe = window['$']('#overlay_Div1 iframe')
        window['$'](iframe).animate({ 'right': '-=661px' }, 'slow', () => {
          window['$']('#overlay_Div1 iframe').remove()
        });
        twitterShowLeftPanel();
      } else if ('dontdisplay' in changes && changes.dontdisplay) {
        showHideCuration(changes.dontdisplay.newValue)
      }
    })
  })
  loadTimer = setInterval(initCurationDomain, 1000)
}

/**
 * Window event listener for messages sent from unit/iframe
 * When message is sent from an iframe/unit, function animateIframe is being invoked
 *
 * @param {string} "message" - a case-sensitive string representing the event type to listen for
 * @param {function} animateIframe - animate function used for animating iframe/unit
 *
 */
window.addEventListener("message", animateIframe, false);

var iframeCloseEvent = null;

/**
 * The event listener callback function for executing animation of an iframe.
 * Animation consists of two parts:
 *  - animating the unit to the center of the screen
 *  - animating unit to the original position
 *
 * @param {event} event - an event object sent from window event lisiner
 *
 */
function animateIframe(event) {
  if(event.origin === EXT_URL) {
    var expendWidth = 58.5;
    var marginWidth = (100 - expendWidth)/2;
    var screenWidth = jQuery(window).width();
    var iframeWidth = jQuery("#overlay_Div1 iframe").width();
    var iframeWidthProcentage = (iframeWidth * 100) / screenWidth;
    var translationWidth = 100 - iframeWidthProcentage - marginWidth;
    let width
    let expandedWidth = 58.5

    if (window.location.hostname === 'twitter.com') {
      width = 620
    } else {
      const percentageOf40px = 40 / screenWidth * 100
      expandedWidth += percentageOf40px
      translationWidth += percentageOf40px
      width = 661
    }

    if(event.data == "animate"){
      jQuery("#overlay_Div1 iframe").animate({
        left: "-=" + translationWidth + "%",
      width: expandedWidth + "%"}, 1025);
      jQuery("#overlay_Div1 iframe").addClass("animated");
      jQuery("#overlay_Div1").addClass("iframe-overlay-in");
      iframeCloseEvent = event;
    } else if(event.data == "do_not_animate"){
        // close logic
        jQuery("#overlay_Div1 iframe").animate({
          width: `${width}px`
        }, 925, function() {
          var percentWindow = screenWidth/100
          var framePosition = jQuery("#overlay_Div1 iframe").offset()
          translationWidth = (screenWidth-(width + framePosition.left))/percentWindow
          jQuery("#overlay_Div1 iframe").animate({
            left: "+=" + translationWidth + "%"
          }, 925);
        });

        jQuery("#overlay_Div1 iframe").removeClass("animated");
        jQuery("#overlay_Div1").removeClass("iframe-overlay-in");

        jQuery("#overlay_Div1").addClass("iframe-overlay-out");

        setTimeout(function(){
          jQuery("#overlay_Div1").removeClass("iframe-overlay-out");
        }, 3000);
        iframeCloseEvent = null;
    } else if(event.data == "iframe_closed") {
        jQuery("#overlay_Div1").removeClass("iframe-overlay-in");
        jQuery("#overlay_Div1").removeClass("iframe-overlay-out");
        iframeCloseEvent = null;
    }
  }
}

/**
 * Document event listener for click on the document
 *
 * @param {string} "click" - a case-sensitive string representing the event type to listen for
 * @param {function} - function used for sending message to an iframe that the user has clicked
 * on the document outside of the unit/iframe to invoke unit/iframe closure action
 *
 */
document.addEventListener("click", function(event){
  if(iframeCloseEvent !== null) {
    iframeCloseEvent.source.postMessage("trigger_close_click", EXT_URL);

  }
});

load()

function buttonAnimnation (url) {
  if (document.getElementById('curate_button_id') != null) {
    document.getElementById('curate_button_id').addEventListener('click', function () {
      document.getElementById('curate_button_id').style.animation = 'move 0.3s'
      // document.getElementById('curate_button_id').style.WebkitAnimationFillMode = " forwards";
      document.getElementById('curate_button_id').style.animationduration = ' 0.3s'
      var styleEl = document.createElement('style')
      styleEl.innerHTML = '@keyframes move{' +
             'from{transform: translateX(0); opacity : 1;animation-duration: 0.15s;}' +
             'to{transform: translate(4px, 4px);' +
             'animation-duration: 0.3s;}' +
             '}'
      document.head.appendChild(styleEl)
      setTimeout(function () {
        // var newUrl = 'https://theconversation.social/social-discovery/?q=' + url
        // console.log(newUrl)
        // var win = window.open(newUrl, '_blank')
        // win.focus()
        if (!document.getElementById('curate_button_id'))
          document.getElementById('curate_button_id').style.animation = 'unset'
      }, 2000)
      removeTooltip()
    })
        if ($('#c_tooltip').length) {
                $("#c_tooltip").on("click", function() {
                    removeTooltip()
                });
                $("#c_popup_tooltip").on("click", function() {
                    removeTooltip()
                });
                $(document).ready(
                    function() {
                        function animateMydiv() {
                            $('#c_tooltip').animate({
                                'bottom': '12px'
                            }, 1500).animate({
                                'bottom': '40px'
                            }, 1500, animateMydiv);
                        }
                        animateMydiv();
                    });
            }
        }
    }
    
    function removeTooltip() {
        if ($(`#c_tooltip`).length) {
            $(`#c_tooltip`).remove();
            $(`#c_popup_tooltip`).remove();
  }
}

function createIframe (rootElement) {
  const iframe = document.createElement('iframe')
  iframe.src = `${EXT_URL + '/widget/index.html'}`
  iframe.setAttribute('allowTransparency', 'true');
  iframe.setAttribute('id', 'widget_frame_id');
  iframe.setAttribute('style', `position: fixed;
        top: 0;
        display: block;
        right: -661px;
        width: 661px;
        height: 100%;
        z-index: 99999999999999;
        border: none;
        //*-webkit-box-shadow: -12px 0 48px 0 rgba(50,50,50,.20);*//
        //*-moz-box-shadow: 0px 0px 20px 9px rgba(0,0,0,0*//
  `)
  // window['$'](iframe).hide()
  rootElement.appendChild(iframe)
  return iframe
}

function openWidget_popup () {
  let iframe = document.querySelector('#overlay_Div1 iframe')
  if (!iframe || iframe == null) {
    addWidget_popup()
    iframe = document.querySelector('#overlay_Div1 iframe')
    shouldBeOpen = true
  }
  const progress = window['$']('#curate_button_id').attr('data-progress') || 0
  if (progress) {
    shouldBeOpen = false
    window['$'](iframe).animate({ 'right': '0' }, 'slow')
    document.querySelector('#curate_button_id').style.setProperty("z-index", "2147483646", "important")
    document.querySelector('#extensionNotifications').style.setProperty("z-index", "2147483646", "important")
    iframe.style.setProperty("z-index", "2147483647", "important")
  }
}

function addWidget_popup () {
  var g = document.querySelector('#overlay_Div1')
  const iframe = document.querySelector('#overlay_Div1 iframe')
  if (!iframe || iframe == null) {
    createIframe(g)
  }
}


function addCuration (autorun) {
  const COLOR_SCHEME = {
    default: {
      circle_white_black: '<circle style="stroke: black; fill: white" cx="39" cy="39" r="32" stroke="#000" stroke-width="1" style="filter:url(#dropshadow)" fill="#fff"></circle>',
      text_white_black: '<text x="39" y="43" alignment-baseline="middle" dominant-baseline="middle" font-size="48" fill="#000" text-anchor="middle" style=" font-size: 48px !important; font-family: poppins !important; font-weight: 500 !important;">C</text>',
      circle_black_white: '<circle style="fill: black" cx="39" cy="39" r="32" fill="#000"></circle>',
      text_black_white: '<text x="39" y="43" alignment-baseline="middle" dominant-baseline="middle" font-size="48" fill="#fff" text-anchor="middle" style=" font-size: 48px !important; font-family: poppins !important; font-weight: 500 !important;">C</text>',
    },
    gray: {
      circle_white_black: '<circle cx="39" cy="39" r="32" stroke="#000" stroke-width="1" style="filter:url(#dropshadow)" fill="#fff"></circle>',
      text_white_black: '<text x="39" y="43" alignment-baseline="middle" dominant-baseline="middle" font-size="48" fill="fff" text-anchor="middle" style=" font-size: 48px !important; font-family: poppins !important; font-weight: 500 !important;">C</text>',
      circle_black_white: '<circle cx="39" cy="39" r="32" fill="#d8dce3"></circle>',
      text_black_white: '<text x="39" y="43" alignment-baseline="middle" dominant-baseline="middle" font-size="48" fill="#202020" text-anchor="middle" style=" font-size: 48px !important; font-family: poppins !important; font-weight: 500 !important;">C</text>',
    }
  };

  const currentScheme = COLOR_SCHEME[autorun ? 'gray' : 'default'];
	    chrome.storage.local.get(INSTALLED, function(result) {
	        installed = result['installed-c']
	        return true
	    });
  chrome.storage.local.get({dontdisplay: false}, function (items) {
    dontdisplay = items.dontdisplay
    if (!dontdisplay) {
      var od = document.querySelector('#overlay_Div1')
      if(!od){
        console.log("added on ICON C on popup button")
        od = document.createElement('div')
        od.setAttribute('id', 'overlay_Div1')
        document.body.appendChild(od)
      }
      var cb = document.querySelector("#curate_button_id")
      if(!cb){
        const elNotification = document.createElement('div')
        od.appendChild(elNotification)
        elNotification.outerHTML = '<div id="extensionNotifications"></div>'

        const curateButtonId = document.createElement('div')
        curateButtonId.setAttribute('id', 'container_curate_button_id')
        od.appendChild(curateButtonId)
        // curateButtonId.outerHTML = '<div id="curate_button_id">'

        if (installed) {
            const tooltip = document.createElement('div')
            curateButtonId.appendChild(tooltip)
            tooltip.outerHTML = createToolTip()
            chrome.storage.local.set({
                'installed-c': false
            });
        }

        const elCurateButtonChild = document.createElement('div')
        curateButtonId.appendChild(elCurateButtonChild)
        elCurateButtonChild.outerHTML = `
          <div id="curate_button_id">
            <svg style="height: 80px !important; width: 80px !important;" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				
              <defs>
                  <filter id="dropshadow">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <!-- stdDeviation is how much to blur -->
                      <feMerge>
                          <feMergeNode/>
                          <!-- this contains the offset blurred image -->
                          <feMergeNode in="SourceGraphic" />
                          <!-- this contains the element that the filter is applied to -->
                      </feMerge>
                  </filter>
              </defs>
              <defs>
                  <clipPath id="cut-off-bottom" clip-rule="nonzero">
                      <path d="M0,0" id="clip_path"></path>
                  </clipPath>
              </defs>
              <g id="white_black">
                  ${currentScheme.circle_white_black}
                  ${currentScheme.text_white_black}
              </g>
              <g id="black_white" clip-path="url(#cut-off-bottom)">
                  ${currentScheme.circle_black_white}
                  ${currentScheme.text_black_white}
              </g>
            </svg>
            <span class="__badge" ></span>
            <span class="__mail" ></span>
          </div>`
      }
      if (autorun) {
        chrome.storage.local.get({'user_subscribed': false}, function (result) {
          if(result.user_subscribed)
            addWidget_popup()
          else{
            var url="https://theconversation.social/article_check/?url="+window.location.href;
            chrome.runtime.sendMessage({message: 'ARTICLE_CHECK', url: url}, (response) => {
            if(response.link_exists)
              addWidget_popup()
			})
          }
        })
      }
      // reads from friends
      addFriendsReads(od)
      window['$']('#curate_button_id').click(openWidget_popup)
      buttonAnimnation(window.location.href)
      if (isCurationClickedFromPopUp) {
        window['$']('#curate_button_id').click();
      }
    }
  })
}

function createToolTip() {
    return `<div id="c_popup_tooltip" style="${vertical.popup}">
                      <div style="line-height: 1.4rem;font-size: 13.5px;font-weight: 600; font-family: mulish, arial, san-serif, system-ui;">
                        A button from <strong>theconversation.social</strong> will always appear here on news articles.<br><br> <b>Try clicking it!</b>
                      </div>

                      <div style="${vertical.container}" id="c_tooltip">
                        <div style="${vertical.arrow}"></div>
                        <div style="${vertical.arrowDown}"></div>
                      </div>
            </div>`
}


function addFriendsReads (od) {
  let fr = document.querySelector("#fr_button_hover")
  if(!fr){
    const elFriendsReads = document.createElement('div')
    const icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFMElEQVR4Xu1bXWhcRRT+zpls0k1Nk8ZYf2orQVtqjDFlk5vdBNoq/gWKSkVBBPGxPvgcEESx9KWvPtTXgg9CoaJUUkTLUom7m2ugpH9BK1UTtaU1tVZbde/MkQkbXJPd7N11b5rSGchT5syc77tnzpk5ew7hFh90i+OHI6Cnp2f1qlWrnrCWQEQiIgEz/6G1/pWZLwVBcGFiYiJ/M1pKV1dXY0tLyzpjTIdSqs0YsxpAbB6L1vpTSqVSDxhjvlkCoAC4AOAcgLMAzhDRSa31cd/3p1cCMf39/RuUUluNMd1E9CAAi6mTmdfZ71pORyLqDEPAUhjPA8gBSAM4msvlJpeDEM/zHgHwmIjsAJAsAK1663oQsHDTaRE5TEQHc7mcJcVaTz0G9/f3P8rMLxhjdjLz+nosGgUBxXrNiMgBInovl8vN1KJwIpHY2NDQsNsY80q9QBfrETUBc3sZYzQzH2LmPZlM5kQYIqyJi8ibAJ5jZhVGppY5SxLAzDuCILjGzPcQ0X0icj+ALQC6ANxbw4Y2whxk5pFsNvtdKXnP8zqJaB+A55dyXkvsbZ3yaWPMlFLqWwDfG2N+EpFWZv5soVwlAjZlMhnr9ReNRCLR0djY2GeMGQSw3ToiAI1hSDHGXFdK7c3n8/vmw2sikYjFYrERrfUbzBwPsw6AvwFkrQMWkS8BfDU+Pv5LKdlUKrXFGHOmbgQsXGhoaKgln88/TkS7ADwDYE0lECJio8dLdh4RfQDAqyQD4AqAjwAcisfjn6fT6d9DyCByAoqVSKVScRHZJSKvARiqoKAFZEdrhXlfiMj+5ubmD9Pp9J9hQC/QKVoLKKdQMpkcEJG3AAxXq3TBMg5rrd/xfd+vRX5eZlktoJSiyWTSXljeFZHuMEC01pNE9Lrv+8fCzK8054YTYBUsOLq3tdYj5UJbIWTujcfje9LpdFAJWNj/rwgC5pX1PO+pgtNrKwZgjLmslHoxm80uCldhgZabt6IIsEp6nvc+Eb1crDARHchms6/+X7Cl5B0BUd8Dqv1qzgLcEXA+wDlBFwVcGHT3AHcRcjfBIgbcVdi9BdxjyL0G3XPY5QNcQsRlhKpNroSZ71JiLiUW8W+DYcyweI7LCbqcoMsJupygywm6nKDLCbqcoMsJupzgvwy4pOhKS4oCmLB1eUR0TUSuEtEVEbksIhdt+TwR/Qxgpr29/YfR0dG/qnkP1OstMDw83DQ7O7tRRDYw890A7hSRDiJaa6tDiahFRJpFZC0RbV2oY71qhcWWozLz1yIyRUSnRGQyFosdHxsbu1qKmGoJGBgYWGOM6SWiHmZ+SGttS3Y3F0DX3PVSLwLKfXwDYMqWsRLRMWY+mslkfgxTI2QbIIjIlsdvC4JgUCllAdcMtJyCURNQat9TRPSJiNja4m0LqsTSzOxrrXcqpWzXR+TjRhAQOahqNpgjoLe3t62pqWn3vKCIMBHZGn3bXGQrt5tt8TMRtYnI7SJyB4C7iOi2ajaLeq4xxvqb80R0UUQuMbOtQ/4NwPXCX15ENBHZozk3giDYX/O5so5Ja207OjoBbBIRe067ReThCMmxkegEM5+0DldEzhLRuYaGhulyDrcS8TUTsMTC1NfXt1kp5RHRYBAE22s80za6nGTmYyIyppTyM5mMbYKoVx/SHIQoCFjETSqVWq+1fhrAswCeJKKmUgQWmimOAPhYa33E933blRbpWBYCihEkEonWWCw2aIz5Ty+QUso2bI7Vasq1srTsBNSqaFRyjoComL1Z1v0HWYG5aOVz/FIAAAAASUVORK5CYII=';
    const buttonStyles = 'font-size:14px!important; position:relative; top:60px; left:90px; background:#fff!important; outline:none; border:none; padding:5px 15px!important;border: none!important; border-radius: 15px 15px 0 0!important; box-shadow: 0px -5px 15px rgba(0, 0, 0, 0.5)!important; transition: top 0.3s linear; cursor: pointer;';
    const imageStyles = 'margin-right:5px!important; display:inline!important; vertical-align:middle!important; width:18px!important; height:14px!important;';

    od.appendChild(elFriendsReads)
    
    elFriendsReads.outerHTML = "<div id='fr_button_hover' style='position:fixed!important;bottom:0;right:0;z-index:2147483645;width:250px!important;height:50px!important;'><button type='button' style='" + buttonStyles + "'><img width=18 height=14 src='"+ icon +"' style='"+ imageStyles +"'> Friends' Reads</button></div>"

    document.querySelector("#fr_button_hover").addEventListener("mouseover", function() {
      this.querySelector('button').style.top = '23px'
    })
    document.querySelector("#fr_button_hover").addEventListener("mouseout", function() {
      this.querySelector('button').style.top = '60px'
    })
    window['$']('#fr_button_hover button').click(openReadingListIframe);
  }
}
// function getInstancesFromPath (location, instance) {
//   return location.pathname.split('').filter(item => item === instance).length
// }

// function hasDigit (location) {
//   const firstPath = location.pathname.replace('/', '').split('/')[0]
//   return /^\d+$/.test(firstPath)
// }

// check if string has more than 2 hyphens
function checkHypen(t){
  return (t.match(/-/g) || []).length >= 2
}

// check if string has more than 2 underscores
function checkUnderscore(t){
  return (t.match(/_/g) || []).length >= 2
}

// check if string has number
function hasNumbers(t)
{
  var regex = /\d/g;
  return regex.test(t);
}

// main function for checking final string of a url after the final slash (or the second to last if no text after last)
function check_after_slash_on_url(str){
  if(str.includes("user") || str.includes("search") || str.includes("account")){
    return false
  } else {
    let last_index = str.lastIndexOf("/")
    if( last_index == -1){
      return false
    } else {
      let target_string = str.substring(last_index + 1)
	  if ((target_string == " " ) || !(target_string)){
	  target_string = str.split( '/' );
	  target_string = target_string[ target_string.length - 2 ]
	  }

      if(target_string.includes("index.html") || checkUnderscore(target_string) || checkHypen(target_string) || hasNumbers(target_string)){
        return true
      }
      return false
    }
  }
return false
}

function countHyphenCharacters (domainName) {
  const domainNameArray = domainName.split('').filter(item => item === '-')
  var count = domainNameArray.length
  return count
}

function countSlashCharacters (domainName) {
  const domainNameArray = domainName.split('').filter(item => item === '/')
  var count = domainNameArray.length
  return count
}

function addExtensionNotificationContainer() {
  const elNotification = document.createElement('div');
  elNotification.id = 'extensionNotifications';
  elNotification.style.right = 0;
  elNotification.style.width = '365px';
  elNotification.style.bottom = '70px';
  elNotification.style.setProperty('margin-right', '10px');
  document.body.appendChild(elNotification);
}

function initCurationDomain (isCurationClickedFromPopUp) {
  try {
    chrome.storage.local.get({'domainlist': [], 'autorun': false}, storageObj => {
      if (window.location.href.slice(0,40).indexOf('twitter.com') !== -1) {
        addExtensionNotificationContainer();
        return true
      }
      if (window.location.href.indexOf('theconversation.social') > -1) {
        return true
      }

      domainlist = storageObj.domainlist || []
      domainlist = domainlist.map(item => item.trim()).filter(item => item)

      // domainlist = domainlist;
      // localStorage.setItem("localStorageKey", JSON.stringify(domainlist));
      let inited = false
      // Rules below for domain matching logic:
      // - Removes http:// and https://
      // - Adds . period in front of url
      // - Adds . period in front of domain from domain list
      // - Removes / trailing url domain to get rid of domains-matching in non-domain section.
      let containsSupportedDomain = domainlist.some(domain => {
        let origin = window.location.origin;
        strippedProtocol = '.' + origin.substr(window.location.protocol.length + 2); // Strips the protocol then adds a dot infront
        return strippedProtocol.indexOf('.' + domain) > -1;
      });
	  if (isCurationClickedFromPopUp) {
		  domLoaded(storageObj.autorun)
	  }
      if(containsSupportedDomain) {
          inited = true
          if (window.location.href.indexOf('index.html') > -1) {
            domLoaded(storageObj.autorun)
          } else if (countSlashCharacters(window.location.href) >= 4 || countHyphenCharacters(window.location.href) >= 8) {
            // for nbcnews.com, cbsnews.com, msnbc.com, for foxnews.com
            let result_of_url_check = (storageObj.autorun && check_after_slash_on_url(window.location.href))
            return domLoaded(result_of_url_check)
          } 
          else if (targetUrl.indexOf('/news/') > -1 && countSlashCharacters(targetUrl) >= 3 && countHyphenCharacters (targetUrl) >= 8) {
            // for comicbook.com
            let result_of_url_check = (storageObj.autorun && check_after_slash_on_url(window.location.href))
            return domLoaded(result_of_url_check)
          } 
          // else if (targetUrl.indexOf('comicbook.com') == -1 && targetUrl.indexOf('/news/') > -1 && countSlashCharacters(targetUrl) >= 3 && countHyphenCharacters (targetUrl) >= 8) {
          //   // for comicbook.com - comment this in and the above rule out if needing domain specific
          //   let result_of_url_check = (storageObj.autorun && check_after_slash_on_url(window.location.href))
          //   return domLoaded(result_of_url_check)
          //   }
          else if (window.location.href.indexOf('.html') > -1) {
            // for nytimes.com, washingtonpost.com, latimes.com
            domLoaded(storageObj.autorun)
          } else if (window.location.href.indexOf('/story/') > -1 || window.location.href.indexOf('/article/') > -1) {
            // for usatoday.com
            domLoaded(storageObj.autorun)
          } else if (window.location.href.indexOf('/2018/') > -1 || window.location.href.indexOf('/2019/') > -1 || window.location.href.indexOf('/2020/') > -1 || window.location.href.indexOf('/2021/') > -1 || window.location.href.indexOf('/2022/') > -1 || window.location.href.indexOf('/2023/') > -1) {
            domLoaded(storageObj.autorun)
          }
        }
      }
      //"comment back in if you want C icon to always appear on non domain pages without autocuration even if it doesn't pass our domainslist rules"
      /* if (!inited) {
        domLoaded(false)
      } */
    )
  } catch (e) {
    if (e.message === 'Extension context invalidated.') {
      clearInterval(loadTimer)
    }
  }
}

// function hasArticleTags () {
//   let hasTag = document.querySelector('meta[content="article"][property="og:type"]') ||
//               document.querySelector('meta[itemprop="headline"]') ||
//               document.querySelector('link[rel="amphtml"]') ||
//               document.querySelector('[itemtype="http://schema.org/NewsArticle"]')

//   return hasTag || [...document.querySelectorAll('[type="application/ld+json"]')].find(elem => {
//     return elem && ((elem.innerHTML || '').indexOf('NewsArticle') >= 0)
//   })
// }

function showHideCuration (newValue) {
  const overlay = document.querySelector('#overlay_Div1')
  if (!newValue) {
    if (overlay) {
      window['$'](overlay).show()
    } else {
      // initCurationDomain()
    }
  } else {
    window['$'](overlay).hide()
  }
}

function domLoaded (autorun) {
  clearInterval(loadTimer)
  const loadedDom = function () {
    if (document.body) {
      TimeLoading.DOM = Date.now()
      addCuration(autorun)
    } else {
      setTimeout(loadedDom, 100)
    }
  }
  loadedDom()
}

function createVideoIframeContainer(id) {
  const IFRAME_WIDTH = `95%`;
  const IFRAME_HEIGHT = `95%`;
  const IFRAME_ANIMATION_TIME_S = `0.8`;

  const container = document.createElement(`div`);
  container.id = id;
  container.style.cssText = important(`
    position: fixed;
    display: block;
    left: calc(50% - 20px);
    top: 50%;
    width: ${IFRAME_WIDTH};
    height: ${IFRAME_HEIGHT};
    z-index: 2147483647;
    transform: scale(0) translate(-50%, -50%);
    transform-origin: 0 0;
    transition: all ${IFRAME_ANIMATION_TIME_S}s ease;
    background: white;
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
  `);

  return container;
}

function createCloseButton() {
  const closeButton = document.createElement(`button`);
  const line1 = document.createElement(`div`);

  line1.style.cssText = important(`
    width: 40px;
    height: 2px;
    background: #000000;
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    left: 50%;
  `);

  const line2 = line1.cloneNode(true);

  line2.style.setProperty(`transform`, `translate(-50%, -50%) rotate(-45deg)`, `important`);

  closeButton.style.cssText = important(`
    width: 60px;
    height: 60px;
    position: absolute;
    top: -2px;
    right: -25px;
    background: white;
    border: none;
    outline: none;
    padding: 0;
    box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);
    border-radius: 50%;
  `);

  closeButton.append(line1, line2);
  return closeButton;
}

function showVideoIframe(data) {
  const iframeContainerId = `theconversation__video-iframe-container`;

  if (document.querySelector(`#${iframeContainerId}`)) {
    return;
  }

  const video_link = `https://theconversation.social/v/${data.link_id}`;
  const container = createVideoIframeContainer(iframeContainerId);
  const closeButton = createCloseButton();
  const iframe = document.createElement(`iframe`);

  iframe.src = video_link;
  iframe.style.cssText = important(`
    position: absolute;
    display: block;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  `);

  closeButton.addEventListener(`click`, () => {
    container.remove();
  });

  container.append(iframe, closeButton);
  document.body.appendChild(container);
  container.clientWidth = container.offsetWidth;
  container.style.setProperty(`transform`, `scale(1) translate(-50%, -50%)`, `important`);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'DOM_URL_CHANGED_EVENT') {
    console.log('DOM_URL_CHANGED_EVENT', request.url); // new url is now in content scripts!

    var container = document.querySelector('#overlay_Div1');

    if (container) {
      container.remove();

      resetLoadParams();

      initCurationDomain();
    }
  }
  
  if (request.message == 'GET_METADATA') {
    page_metadata = {'title': false, 'description': false, 'pretty_url': false, 'date': false}
    var title = getMetaTag(['meta[property="og:title"]', 'title', 'h1'])
    if (title) {
        var description = getMetaTag(['meta[property="og:description"]', 'meta[name="description"]', 'h1', 'title', 'meta[property="og:title"]'])
        var date = getMetaTag(['meta[name="date"]', 'meta[name="displaydate"]', 'meta[name="pdate"]', 'meta[name="embedded_data_date"]'])
        if (!date)
            date = document.querySelector('time[itemprop="datePublished"]')
            if (date)
              date = date.dateTime

        // now get content - if not null
        var title_content = encodeURI(title.content)
        var description_content = null
        var date_content = null
        if (description)
            description_content = encodeURI(description.content)
        if (date)
            date_content = encodeURI(date)
        var pretty_url = getMetaTag(['link[rel="canonical"]', 'meta[property="og:url"']) // <!> syndication_url missed
        var pretty_url_content = null
        try {
            if (pretty_url)
                try {
                    pretty_url_content = encodeURI(pretty_url.href)
                } catch (err) {
                    pretty_url_content = encodeURI(pretty_url.content)
                }
        } catch (err) {}

        page_metadata.title = title_content
        page_metadata.description = description_content
        page_metadata.date = date_content
        page_metadata.pretty_url = pretty_url_content
    }
    sendResponse({page_metadata});
  }

  if (request.message == 'ADD_CURATION') {
    isCurationClickedFromPopUp = true;
    initCurationDomain(true);
  }

  if (request.message === `CLICK_VIDEO_LINK`) {
    showVideoIframe(request.data);
  }

});


function getMetaTag(preff) {
    for (const item of preff) {
        i = document.querySelector(item)
        if (!i)
            continue
        return i
    }

    return null
}

function important(stylesStr) {
  return stylesStr.replaceAll(`;`, ` !important;`);
}
