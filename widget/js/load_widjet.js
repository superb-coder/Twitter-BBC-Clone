
window['SERVER_API'] = 'https://theconversation.social/social_curation/'
const MAX_COLLECTION_URL_WAIT_BEFORE_BACKUP_USE = 3000;
var SHOW_RELATED_CONVERSATION_MAIN_TWEET = true;
var MAIN_TWEET_ID = null;
var animation_lock = false;
chrome.tabs.getCurrent(tabInfo => {
    const location = new URL(tabInfo.url)
    if (location.hostname != 'twitter.com'){
		SHOW_RELATED_CONVERSATION_MAIN_TWEET = false; // override flag
    }
})

const options = {
  display_mode: 'full',
  speaker_types: {
    public_figures: true,
    other_public_figures: true,
    media: true,
    the_public: true,
    news_comments: true
  },
  required_speaker_types: {
    public_figures: false,
    other_public_figures: false,
    media: false,
    the_public: false,
    news_comments: false
  },
  news_comments_from_domains: [],
  news_comments_types: {
    disqus_comments: true,
    fb_comments: true,
    fb_plugin_comments: true,
    fyre_comments: true,
    g_comments: true,
    nytimes_comments: true,
    viafoura_comments: true
  },
  max_results_per_section: {
    public_figures: 0,
    other_public_figures: 0,
    media: 0,
    the_public: 0,
    news_comments: 0
  },
  max_results: 10,
  min_popularity: 0,
  category_tags_whitelist: '',
  id: 'ROOT_ELEMENT',
  allow_low_confidence: true,
  allow_news: 'storydevelopmet,widelyreported',
  bio: 'wikipedia', // 'original', 'wikipedia', 'category', false
  show_community_feedback: true,
  category_section_headers: true,
  header: 'Top Conversation',
  display_top_section_header: true,
  css_file: 'style.css',
  max_queries_before_stop: 90,
  query_frequency_seconds: 1, // how often to query api in seconds
  placeholder_html: '',
  placeholder_frequency: 0,
  storydevlopment_prefer_date: false
}

var Ajax = {
  request: function (ops, callback) {
    chrome.runtime.sendMessage({message: 'API', data: ops}, (response) => {
      console.log('ÁPI', response)
      callback && callback(response)
    })
  }
}

function loadingInfo (tabInfo, linkId) {
  const apiurl = 'https://theconversation.social/social_curation/'
  let url
  if (linkId) {
    url = `${apiurl}?createcollection=true&link_id=${linkId}`
  } else {
    url = tabInfo.url
  }
  return new Promise((resolve) => {
    Ajax.request({url, method: 'get'}, (data) => {
      resolve(data);
    })
  })
}

function sleep (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

function loadJs () {
  const originalAppend = HTMLElement.prototype.appendChild;
  if(!originalAppend.updated){
    // Handle overriding twitter 30 second polling from their server's https://platform.twitter.com/widgets.js', 
    // with it changed to 2 seconds, then adding a timestamp so that we solve 
    // the caching that prevented the frontend from updating with the polled data.
    HTMLElement.prototype.appendChild = function(){
      const args = [...arguments];
      try{
        if(this === document.body){
          const n = args[0]
          if (n && n.tagName && n.tagName.toLowerCase() === 'script' && n.src) {
            const parts = n.src.split('?');
            if (parts.length > 1) {
              parts[1].split('&').map((p) => {
                if (p.split('=')[0] === 'callback') {
                  const cb = decodeURIComponent(p.split('=')[1]);
                  if (!cb.includes('__twttr.callbacks.')) return;
                  n.src = n.src + '&_=' + (new Date().getTime());
                  const name = cb.replace('__twttr.callbacks.','');
                  const oldFunc = __twttr.callbacks[name];
                  if(oldFunc.inBox) return;
                  __twttr.callbacks[name] = function(){
                    const args = [...arguments];
                    if(args.length>0 && args[0].headers ){
                      args[0].headers.xPolling = 2;
                    }
                    console.log('Calling old callback', new Date().toUTCString());
                    oldFunc(...args);
                  }
                  __twttr.callbacks[name].inBox = true;
                }
              });
              args[0]=n;
            }
          }
        }
      }catch (e){}
      originalAppend.call(this,...args);
    }
    HTMLElement.prototype.appendChild.updated = true;
  }

  var head = document.getElementsByTagName('head')[0]
  var script = document.createElement('script')
  script.src = 'https://platform.twitter.com/widgets.js'
  head.appendChild(script)
}

// Illia start
const is_left_bar = false; //Choose if you need lefside bar or bottom bar for twitter widget

function media_events(data){
  if (data.collection_url) {
    var redirect_link = data.collection_url
  }
  else {
	  var redirect_link = `https://theconversation.social/c/${data.link_id}`
  }

  if(is_left_bar) {
    $('.leftside_bar_js').css({'display': 'flex'})
  }

  $('.spinner').hide() // ONLY FOR DEMO
  $('.no_result').show()
  $('.link_text').text(redirect_link);
  $('.bottom_link_redirect').attr('href', redirect_link)
  window.initVideoClickHadler && window.initVideoClickHadler(data)
  if(data.article_summary && data.collection_url){
   let topic_title = data.article_summary.title
   // take first 105 characters
   topic_title = topic_title.slice(0, 105)
   // get all text before the final space character, then add elipse ... to the end
   topic_title = topic_title.slice(0, topic_title.lastIndexOf(' ')) + "...";
   // now encode it so strings like ampersand and quotes don't mess things up
   topic_title = encodeURIComponent(topic_title)
   
   $('.link_text_share').attr('href', `https://twitter.com/compose/tweet?text=I%27m%20reading%20the%20twitter%20conversation%20on%3A%0A%0A%22${topic_title}%22%0A%0A${data.collection_url}%20https://theconversation.social/c/${data.link_id}`)
  }
  else if(data.article_summary){
   $('.link_text_share').attr('href', `https://twitter.com/compose/tweet?text=I%27m%20reading%20the%20twitter%20conversation%20on%3A%0A%0A%22${topic_title}%22%0A%0Ahttps://theconversation.social/c/${data.link_id}`)
  }
}
// Illia end

async function enableOfficialTwitterWidget (tabInfo, lastLinkId=null, collectionURL = null) {
  let count = 0
  let linkId = lastLinkId

  let response = await  Promise.race([loadingInfo(tabInfo, linkId), new Promise((resolve) => {
    setTimeout(resolve, MAX_COLLECTION_URL_WAIT_BEFORE_BACKUP_USE);
  })]);

  if (!response && !!collectionURL) {
    console.log('Using existing CollectionURL');
    response = {
      collection_url: collectionURL,
      url: 'https://twitter.com/i/status/' + findGetParameter('status_id'),
      article_summary: {curation_scope : 'single_tweet', title: 'This Topic'}
    }
  }

  while (count < 30) {    
    if (response && response.collection_url) {
      const ROOT_ELEMENT = document.querySelector('#ROOT_ELEMENT')
      if (ROOT_ELEMENT) {
        ROOT_ELEMENT.innerHTML = `
          <a class="twitter-timeline" href=${response.collection_url}>Loading...</a>
        `
        loadJs()
        media_events(response)
        if(SHOW_RELATED_CONVERSATION_MAIN_TWEET) {
          let status_id = findGetParameter('status_id')
          if (!response.url){
            response.url = 'https://twitter.com/i/status/' + status_id
          } 			
          if (!response.article_summary){
            response.article_summary = {curation_scope : 'single_tweet', title: 'This Topic'}
          }
          MAIN_TWEET_ID = status_id
          const curation_scope = response.article_summary ? response.article_summary.curation_scope : 'single_tweet'
          showRelatedConversation(response.url, curation_scope)
        }
        break
      }
    }
    await sleep(5000)
    count++
    console.log(count, 'enableOfficialTwitterWidget COUNT')
    response = await loadingInfo(tabInfo, linkId);
  }
}

async function enableOfficialTwitterWidgetOnNewsArticle (tabInfo, lastLinkId=null) {
  let count = 0
  let linkId = lastLinkId
  while (count < 30) {
    const response = await loadingInfo(tabInfo, linkId)
    linkId = response.link_id
    if (response.collection_url) {
      const ROOT_ELEMENT = document.querySelector('#ROOT_ELEMENT')
      if (ROOT_ELEMENT) {
        ROOT_ELEMENT.innerHTML = `
          <a class="twitter-timeline" href=${response.collection_url}>The Conversation</a>
        `
        loadJs()
        media_events(response)
        break
      }
    }
    await sleep(5000)
    count++
    console.log(count, 'enableOfficialTwitterWidget COUNT')
  }
}

function showRelatedConversation(url, title) {
  $('.widget_body').css('overflow', 'hidden')
  let titleType = 'on this Tweet'
  if(title !== 'single_tweet') {
    titleType = 'on this Story';
  }
  $(`#${options.id}`).css({opacity: 0})
  let res = new Promise((resolve) => {
    $.ajax({url: `https://publish.twitter.com/oembed?&url=${url}&hide_media=true&hide_thread=true`}).done((data) => {
      resolve(data);
    })
  })
  res.then(twt => {
    $html = `<div class="related_conversation">
    <div class="related_conversation-load">Loading...</div>
    <div class="related_conversation-title">Related Conversation ${titleType}</div>
    <div id="temporary-tweet">${twt.html}</div>
    </div>`

    const RC_TWEET = document.querySelector('#RC_TWEET')
    $(RC_TWEET).append($html)

    $('.related_conversation-title').hide()
    
    setTimeout((function() {
      $('.related_conversation-load').hide()
      $('.related_conversation-title').fadeIn()
      $('#twitter-widget-1').css('max-width', '100%')
      $('#temporary-tweet .twitter-tweet').css({
        margin: '10px 0 30px',
      })
      $('#temporary-tweet').css({
        opacity: 1,
        height: 'auto',
        transition: 'opacity .5s linear'
      })
      setTimeout((function() {
        $('.widget_body').css('overflow', 'auto')
        $(`#${options.id}`).css({
          opacity: 1,
          transition: 'opacity .5s linear'
        })
      }), 100);
    }), 1500);
  }).catch((error) => {
    $('.widget_body').css('overflow', 'auto')
    $(`#${options.id}`).css({
      opacity: 1,
      transition: 'opacity .5s linear'
    })
    console.log('error', error)
  })
}

function closeHandler (tabInfo) {
  window['$']('#close').click(() => {
    // Illia start
    // Don`t show bars arter re-open widget during spinner works
    window['$']('.bottom_bar_js').hide()
    window['$']('.leftside_bar_js').hide()
    window['$']('.left_side_bar_js').hide()
    // Illia end
    chrome.storage.local.set({
      'close': {
        tabId: tabInfo.id,
        rnd: Math.random()
      }
    });
  })
}

function enableOwnWidget (tabInfo) {
  window['Module'] && window['Module'](window)
  window['initWidget'] && window['initWidget'](options, tabInfo.url, Ajax)

  closeHandler(tabInfo)
}

function doChangeIframeStyle() {
  if ($("#twitter-widget-0").contents().find("head").length == 0) {
    setTimeout(function(){
     doChangeIframeStyle();
    }, 100);
    return false;
  }

  let head = $("#twitter-widget-0").contents().find("head");
  let css = `<style>
      .timeline-Tweet-text {
          margin-left: 50px!important;
          font-size: 16.5px!important;
          font-weight: 400!important;
      }
      ${MAIN_TWEET_ID && `
      .timeline-Tweet-text a[href*="${MAIN_TWEET_ID}"] {
          display: none!important;
        }
      `}
      .TweetAuthor-name  {
		  font-size: 15px!important;
      }
      .TweetAuthor-avatar  {
          width: 40px!important;
          height: 40!important;
      }
      .timeline-Tweet-author  {
          padding-left: 50px!important;
      }
      .timeline-Tweet  {
		  padding-right: 30px!important;
      }
      .timeline-Header-title  {
		  font-size: 16.5px!important;
		  font-weight: 800!important;
		  letter-spacing: 0.5px!important;
		  font-family: system-ui!important;
      }
      .timeline-Tweet-inReplyTo  {
          padding-left: 50px!important;
      }
      ${SHOW_RELATED_CONVERSATION_MAIN_TWEET && `
        .timeline-Header {
          display: none!important;
        }
      `}
  </style>`;

  $(head).append(css);
  return true;
}

chrome.tabs.getCurrent(tabInfo => {
  //  debugger
  chrome.storage.local.get({official: false, lastLinkId: null, collectionURL: null, fullmode: true}, items => {
    const location = new URL(tabInfo.url)
    if (location.hostname === 'twitter.com' && items.lastLinkId) {
      enableOfficialTwitterWidget(tabInfo, items.lastLinkId, items.collectionURL).then(_ => {
        chrome.storage.local.set({'lastLinkId': null, collectionURL: null}, function() {
          console.log('lastLinkId is set to null');
          doChangeIframeStyle()
        });
        closeHandler(tabInfo)
      })
    } else if (items.official) {
      enableOfficialTwitterWidgetOnNewsArticle(tabInfo).then(_ => {
        closeHandler(tabInfo)
      })
    } else {
      if (items.fullmode) {
        options.fullmode = items.fullmode;
      }
      enableOwnWidget(tabInfo)
    }
  })
})

window['$'](document).on('click', 'a', (evt) => {
  const url = evt.target.href || window['$'](evt.target).closest('a').prop('href')
  if (/https?:\/\//.test(url)) {
    evt.preventDefault()
    if($(evt.target).data('openinparent')) {
      chrome.tabs.update(null, {url})
    } else {
      chrome.tabs.create({url})
    }
    return false
  }
})

// for checking if user is on twitter.com -- whether to show the widget side buttons
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

$( document ).ready(function() {
    if (findGetParameter('parent_host_name') === "twitter.com") {
      $(".widget_inner").addClass("widget_inner_for_twitter");
      jQuery('.non_twitter_left_side_bar').hide();
    }
    $(".widget_body").show();
    
    /**
     * Window event listener for message sent from parent to unit/iframe
     * When message is sent from a parent, function iframeClose is being invoked
     * 
     * @param {string} "message" - a case-sensitive string representing the event type to listen for
     * @param {function} iframeClose - function used invoking iframe closure action
     * 
     */
    window.addEventListener("message", iframeClose, false);

    /**
     * Click event for triggering animation logic
     * 
     * @param {function} - function for triggering animation of the unit/iframe
     * 
     */
    jQuery("#expand-trigger").click(function() {
      if(!animation_lock) {
        expandTrigger();
        animation_lock = true;
      }
    });
    
    if (findGetParameter('parent_host_name') !== "twitter.com") {
      jQuery(".right-sidebar").css({marginLeft: '40px'})
    }
  
    /**
     * Click event for sending message to parent for reseting background overlay
     */
    jQuery("#close").click(function(){
      parent.postMessage("iframe_closed", "*");
    });
});

/**
 * Function for triggering unit/iframe animation
 */
function expandTrigger() {
  var animate = jQuery("#expand-trigger").hasClass("animate");
  if(animate) {
    jQuery("#expand-trigger").removeClass("animate");
    parent.postMessage("animate", "*");
    resetAnimation();
    setAnimationCSS();    
  } else {
    jQuery("#expand-trigger").css({"transform": "rotate(360deg)"});
    jQuery("#expand-trigger").addClass("animate");
    parent.postMessage("do_not_animate", "*");
    resetAnimation();
    unsetAnimationCSS();
  }

}

/**
 * Function for reseting animation lock. 
 * Lock is being used to prevent user for invoking animation until the previous animation is completed.
 */
function resetAnimation() {
  setTimeout(function(){
    animation_lock = false;
   }, 3000);
}

/**
 * Function used for applying override css when the unit/iframe is animated
 */
function setAnimationCSS() {
  setTimeout(function(){
    var animateCss = `
      <style id="animate_css">
        #ROOT_ELEMENT.social-curation {
          padding: 10px 50px !important;
          transition: padding 1s;
        }
        
        #ROOT_ELEMENT.social-curation li {
            padding-top: 23px !important;
            padding-bottom: 18px !important;
            transition: padding 1s;
        }
        
        #ROOT_ELEMENT.social-curation .social-curation__right {
            padding: 0 0 0 24px !important;
            transition: padding 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__picture {
            height: 65px !important;
            width: 65px !important;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__header {
            font-size: 24px !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__section {
            font-size: 19px !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__person {
            font-size: 18px !important;
            transition: font-size 1s;
        }
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__person-link {
            font-size: 17px !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__bio {
            font-size: 14.5px !important;
            margin: 2px 0 19px 0 !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__retweets {
            font-size: 13px !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__likes {
            font-size: 13px !important;
            transition: font-size 1s;
        }
        
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__date {
            font-size: 13px !important;
            transition: font-size 1s;
        }
        #ROOT_ELEMENT.social-curation.social-curation__full .social-curation__message {
          font-size: 17.5px !important;
          color: #313131 !important;
          transition: font-size 1s;
        }
      </style>`;
      jQuery("head").append(animateCss);
   }, 200);
}

/**
 * Function for resetting css when unit/iframe animation is reverted
 */
function unsetAnimationCSS() {
  jQuery("style#animate_css").remove();
}

/**
 * The event listener callback function for closing unit/iframe when user clicks outside of the unit/iframe.
 * Function is invoked only when unit/iframe is animated.
 * 
 * @param {event} event - an event object sent from window event lisiner
 * 
 */
function iframeClose(event) {
  var animate = jQuery("#expand-trigger").hasClass("animate");

  if(event.origin == window.document.location.ancestorOrigins[0] && 
    event.data === "trigger_close_click") {
    if(!animate) {
      jQuery("#close").trigger("click");
    }
  }  
}
// end for checking if user is on twitter.com -- whether to show the widget side buttons
