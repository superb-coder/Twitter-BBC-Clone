(function (global) {
  // now all code is inside function initWidget like this:
  // global.initWidget = function() {
  // <here all the code>
  // }
  // later when using on server it is needed to move code outside this function
  // and remove this function
  // or leave it but user after setting configuration needs to use initWidget() in html file
  
  global.initVideoClickHadler = (data) => {
    $('.video_link').unbind(`click`);
    $('.video_link').on('click', () => {
      chrome.tabs.getCurrent(function(currTab) {
        if (currTab) {
          chrome.tabs.sendMessage(currTab.id, {message: 'CLICK_VIDEO_LINK', data: data})
        }
      });
    });
  }

  global.initWidget = function (options, URL, Ajax) {
    for (var option in options) {
      var key = 'social_curation_' + option
      if (global[key] !== undefined) {
        options[option] = global[key]
      }
    }

    for (var option in options) {
      var key = 'social_curation_' + option
      if (global[key] !== undefined) {
        options[option] = global[key]
      }
    }

    var element = document.getElementById(options.id)
    if (!element) {
      throw Error('Unable to find element with id', options.id)
    }

    var cssId = 'social-curation-css-file'
    if (!document.getElementById(cssId)) {
      var head = document.getElementsByTagName('head')[0]
      var link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = options.css_file
      link.media = 'all'
      head.appendChild(link)
    }

    var getClosest = function (elem, selector) {
      // Element.matches() polyfill
      if (!Element.prototype.matches) {
        Element.prototype.matches =
                        Element.prototype.matchesSelector ||
                        Element.prototype.mozMatchesSelector ||
                        Element.prototype.msMatchesSelector ||
                        Element.prototype.oMatchesSelector ||
                        Element.prototype.webkitMatchesSelector ||
                        function (s) {
                          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                            i = matches.length
                          while (--i >= 0 && matches.item(i) !== this) {}
                          return i > -1
                        }
      }

      // Get closest match
      for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem
      }

      return null
    }

    var get = function (obj, key) {
      if (key === '') { return obj }
      key = key.split('.')
      var currKey = key.shift()
      key = key.join('.')

      if (!isNaN(currKey)) { currKey = parseInt(currKey) }

      if (currKey === '*') {
        var ret = []
        if (obj.length) {
          for (var i = 0; i < obj.length; i++) {
            ret.push(get(obj[i], key))
          }
        } else if (Object.keys(obj).length) {
          for (var _k in obj) {
            ret.push(get(obj[_k], key))
          }
        }
        if (ret.constructor === Array) {
          ret = [].concat.apply([], ret)
        }
        return ret
      }
      if (typeof obj[currKey] == 'undefined' || obj[currKey] === null) {
        return obj[currKey]
      } else {
        return get(obj[currKey], key)
      }
    }

    var reorder = function (list, key) {
      if (list.length) {
        list.sort(function (a, b) {
          if (get(a, key) > get(b, key)) {
            return -1
          }
          else if (get(a, key) < get(b, key)) {
            return 1
          }
          return 0
        })
      }
    }
    
    var time_ago = function (time) {
      switch (typeof time) {
        case 'number':
          break
        case 'string':
          time = +new Date(time)
          break
        case 'object':
          if (time.constructor === Date) time = time.getTime()
          break
        default:
          time = +new Date()
      }
      var time_formats = [
        [60, 'seconds', 1], // 60
        [120, '1 minute ago', '1 minute from now'], // 60*2
        [3600, 'minutes', 60], // 60*60, 60
        [7200, '1 hour ago', '1 hour from now'], // 60*60*2
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
        [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
        [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
        [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
        [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
      ]
      var seconds = (+new Date() - time) / 1000,
        token = 'ago',
        list_choice = 1

      if (seconds == 0) {
        return 'Just now'
      }
      if (seconds < 0) {
        seconds = Math.abs(seconds)
        token = 'from now'
        list_choice = 2
      }
      var i = 0, format
      while (format = time_formats[i++]) {
        if (seconds < format[0]) {
          if (typeof format[2] == 'string') {
            return format[list_choice]
          } else {
            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token
          }
        }
      }
      return time
    }

    var formatDate = function (date) {
      var getMonth = function (month) {
        return ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep', 'Oct','Nov','Dec'][parseInt(month)]
      }
      var time = new Date(date)
      var ampm = (time.getHours() >= 12) ? 'PM' : 'AM'
      var hours = (time.getHours() >= 12) ? time.getHours() - 12 : time.getHours()
      var timeText = hours + ':' + time.getMinutes() + ' ' + ampm + ' - ' + time.getDate() + ' ' + getMonth(time.getMonth()) + ' ' + time.getFullYear()
      return timeText
    }

    var apiurl = 'https://theconversation.social/social_curation/'

    //var url = 'data.json'; // COMMENT OUT WHEN USING ON SERVER


    url = apiurl + '?url=' + encodeURIComponent(URL)
    pageurl = URL
    if (options.speaker_types.news_comments) {
      url += '&newscomments=true'
    }

    var timesQueried = 0

    var request = function (success) {
      Ajax.request({
        url: url,
        method: 'get'
      }, function (data) {
        if (data) {
          success(data)
        }
      })
    }

	// Personalized read recommendations using site domain
    function extractHostname(url) {
      var hostname;
      //find & remove protocol (http, ftp, etc.) and get hostname
  
      if (url.indexOf("//") > -1) {
          hostname = url.split('/')[2];
      }
      else {
          hostname = url.split('/')[0];
      }
  
      //find & remove port number
      hostname = hostname.split(':')[0];
      //find & remove "?"
      hostname = hostname.split('?')[0];
  
      return hostname;
  }

    var getCurrentTabUrl = () => {  
      var queryInfo = {
        active: true, 
        currentWindow: true
      };
    
      return new Promise((res, rej)=>{
        chrome.tabs.query(queryInfo, function(tabs) {
          var tab = tabs[0]; 
          var url = tab.url;
          res(url);
        });
      })
    }

    var readDomainName = async () => {
      var url = await getCurrentTabUrl()
      var hostName = extractHostname(url)
      var domain = hostName;
    
      if (hostName != null) {
          var parts = hostName.split('.').reverse();
          
          if (parts != null && parts.length > 1) {
              domain = parts[1] + '.' + parts[0];
          }
      }
      return domain.toUpperCase()
    }

    //////////////////////////////

    function media_events(data){

       let redirect_link = `https://theconversation.social/c/${data.link_id}`

       if(is_left_bar) {
         $('.leftside_bar_js').css({'display': 'flex'})
       }

       $('.spinner').hide() // ONLY FOR DEMO
       $('.no_result').show()
       $('.link_text').text(redirect_link);
       $('.bottom_link_redirect').attr('href', redirect_link)
       global.initVideoClickHadler(data);

       if(data.article_summary){
        $('.link_text_share').attr('href', `https://twitter.com/compose/tweet?text=The%20@the%20conversation%20on%20${data.article_summary.title}%20https://theconversation.social/c/${data.link_id}`)
       }
    }

    var scrollTop = 0
    var timesShown = 1
    var ulId = 'ROOT_ELEMENT'
    var ulElement = null
    var currentSlide = 0
    var refresh_tweets = true;
    var tweets_count = 0;

    var query = function (refresh_tweets) {
      request(function (data) {
        timesQueried += 1

        console.log('Times queried', timesQueried, 'max_queries_before_stop', options.max_queries_before_stop)
        if (timesQueried > options.max_queries_before_stop || data.link_id === null || !data.link_id || 
          ((data.errors) && (JSON.stringify(data.errors).includes('1003')))) {
          global.interval.clearAsyncInterval();
        }

        if (data['status'] === 'pending') {
          return
        }
        if (data['status'] === 'incomplete') {
          // Illia start
          media_events(data)
          if(refresh_tweets && tweets_count < data.stats.total_tweets && data.stats.tweets_count_added_in_last_update > 0) {
            $('.refresh_js').text(`${data.stats.tweets_count_added_in_last_update} tweets added`);
            tweets_count = data.stats.total_tweets
          }
          setTimeout(() => {
            $('.refresh_js').text('')
          }, 2500);
          // Illia end
          parseData(data)
        }
        if (data['status'] === 'finished') {
          // Illia start
          media_events(data)
          setTimeout(() => {
            $('.refresh_js').text('')
          }, 2500);
          // Illia end
          parseData(data)
          console.log(data)
          global.interval.clearAsyncInterval();
        }
      })
    }

    global.interval = new AsyncInterval(async function () {
      //console.log('Times queried', timesQueried, 'max_queries_before_stop', options.max_queries_before_stop)
      // sleep before the second request (api call) to give the server time to handle the init request
      if (timesQueried == 1) {
       await sleep(1.5);
      }
      $('.refresh_js').text('') // removing "Refreshing..." because it is distracting
      query(refresh_tweets)
      console.log('INTERVAL LOADS')
    }, options.query_frequency_seconds * 1000)
    query()

    var parseData = async function (data) {
      var filter_tweets = function (tweet_list, key, value, exclude = false) {
        return filter_many_tweets(tweet_list, [key], value, exclude)
      }

      var filter_many_tweets = function (tweet_list, keys, values, exclude = false) {
        values = values.split(',')
        var ret = []
        for (var i = 0; i < tweet_list.length; i++) {
          var cond = exclude
          for (var j = 0; j < keys.length; j++) {
            var tweetVal = get(tweet_list[i], keys[j])
            if (values.indexOf(tweetVal) !== -1) {
              cond = !exclude
            } else if (tweetVal && tweetVal.constructor === Array) {
              for (var k = 0; k < tweetVal.length; k++) {
                if (values.indexOf(tweetVal[k]) !== -1) {
                  cond = !exclude
                }
              }
            }
          }

          if (cond) ret.push(tweet_list[i])
        }
        return ret
      }

      var filter_category_tags = function (tweet_list) {
        if (options.category_tags_whitelist.length === 0) {
          return tweet_list
        }
        var keys = [
          'twitter_category.category',
          'twitter_category.subcategory',
          'category.category',
          'category.subcategory',
          'tags'
        ]
        return filter_many_tweets(tweet_list, keys,
          options.category_tags_whitelist)
      }

      var remove_duplicate_id = function (list) {
        var ids = []
        var res = []

        for (var i = 0; i < list.length; i++) {
          if (ids.indexOf(list[i]['id']) === -1) {
            res.push(list[i])
            ids.push(list[i]['id'])
          }
        }
        return res
      }

      var remove_widelyreported_duplicates = function (list) {
        var keys = {} // key -> pos
        var res = []

        for (var i = 0; i < list.length; i++) {
          if (list[i]['media_section'] != 'widelyreported') {
            res.push(list[i])
            continue
          }

          var pos = keys[list[i]['cluster_id']]
          if (pos !== undefined && res[pos]['followers'] < list[i]['followers']) {
            res[pos] = list[i]
            continue
          }

          res.push(list[i])
          keys[list[i]['cluster_id']] = res.length - 1
        }
        return res
      }

      var tweets = []
      var post_tweets_section = function (name, tw, max_items = 0) {
        if (tw.length) {
          if (max_items > 0) {
            tw = tw.slice(0, max_items)
          }
          tweets.push({section: name, tweets: tw})
          console.log(name, tw.length)
        }
      }
      
      // Personalization Section - Topical Tweets from People you follow
      if (true) {
        var tw = []

        tw.push.apply(tw, get(data, 'personalization.topical_tweets_from_people_you_follow'))

        tw = remove_duplicate_id(tw)

        post_tweets_section('From Friends & People You Follow', tw, 10)
        // if (options.required_speaker_types.other_public_figures && !tw.length) {
        //   console.log('Other public figures required but empty')
        //   return
        // }
      }
      // End Personalization Section - Topical Tweets from People you follow

      if (options.speaker_types.public_figures) {
        var tw = []

        // public figures involved
        // before
        tw.push.apply(tw, get(data, 'public_figures_involved.tweets'))
        tw.push.apply(tw, get(data, 'vpublic_figures_involved.facebook_posts'))

        tw = filter_category_tags(tw)

        var section_title = options.display_top_section_header ? 'Public figures involved' : '&nbsp;'
        post_tweets_section(section_title, tw, options.max_results_per_section.public_figures)
        if (options.required_speaker_types.public_figures && !tw.length) {
          console.log('Public figures required but empty')
          return
        }
      }
      if (options.speaker_types.other_public_figures) {
        var tw = []

        // More public figures
        tw.push.apply(tw, get(data, 'notable_people_and_orgs.tweets'))

        // EVAN: WHAT IS THIS DOING????????? FILTERING OUT COMMENTATOR AND REPORTER? FROM WHERE ???????
        // p = get(data, 'fb-posts')
        // if(p) p = filter_many_tweets(p, ['category.category'], 'commentator,reporter', true);
        // tw.push.apply(tw, p);

        tw.push.apply(tw, get(data, 'notable_people_and_orgs.facebook_posts'))

        // REMOVE 7/28  Related people
        // REMOVE 7/28  var rtw = [];
        // REMOVE 7/28  rtw.push.apply(rtw, get(data, 'related-peoples.valid_fb_posts.*'));
        // REMOVE 7/28  delete Related people tweets with news category
        // REMOVE 7/28  rtw = filter_tweets(rtw, 'twitter_category.category', 'news', true);
        // REMOVE 7/28  tw.push.apply(tw, rtw);

        // EVAN OPTIMIZATION: Only needed if we want to filter by category??????????????????
        //tw = filter_category_tags(tw);

        // EVAN: do we need to dedupe??????????????????
        tw = remove_duplicate_id(tw)

        post_tweets_section('Notable People', tw, options.max_results_per_section.other_public_figures)
        if (options.required_speaker_types.other_public_figures && !tw.length) {
          console.log('Other public figures required but empty')
          return
        }
      }
      if (options.speaker_types.media) {
        // media
        var tw = []
        tw.push.apply(tw, get(data, 'media.tweets'))

        // EVAN: Is this needed???????????????? COMMENTED OUT FOR NOW AS IT BROKE WIDGET
        // if(p) p = filter_tweets(p, 'media_category', 'news_organization');
        // tw.push.apply(tw, p);

        // EVAN: Is this needed???????????????? COMMENTED OUT FOR NOW AS IT BROKE WIDGET
        // p = get(data, 'fb-posts');
        // console.log('P: ', p, data);

        // EVAN: Is this needed???????????????? COMMENTED OUT FOR NOW AS IT BROKE WIDGET
        // if(p) p = filter_many_tweets(p, ['category.category'], 'commentator,reporter');

        // //for (var i=0; i < p.length; i++) {
        // //    p[i].overall_relevance = p[i].likes_count;
        // //    var m = {'commentator': 'commentators', 'reporter': 'reporter'};
        // //    p[i].media_section = m[p[i].category.category];
        // //}
        // EVAN: Is this needed???????????????? COMMENTED OUT FOR NOW AS IT BROKE WIDGET
        // //tw.push.apply(tw, p);

        var allow_news = 'commentators,reporter,notprinted'
        allow_news += ',' + options.allow_news

        // //tw = filter_many_tweets(tw, ['media_section'], allow_news)

        if (tw.length) {
          tw = remove_widelyreported_duplicates(tw)

          // for (var k1 = 0; k1 < tw.length; k1++) {
          //   switch (tw[k1].media_section) {
          //     case 'commentators':
          //       tw[k1].overall_relevance += 5000000
          //       break
          //     case 'reporter':
          //       tw[k1].overall_relevance += 4000000
          //       break
          //     case 'storydevelopmet':
          //       if (options.storydevlopment_prefer_date) {
          //         tw[k1].overall_relevance = parseFloat(tw[k1].minutes_old)
          //       }
          //       tw[k1].overall_relevance += 3000000
          //       break
          //     case 'notprinted':
          //       tw[k1].overall_relevance += 2000000
          //       break
          //     case 'widelyreported':
          //       tw[k1].overall_relevance += 1000000
          //       break
          //     default:
          //       break
          //   }
          // }

          const sortMedia = (list, sortOptions, orderValue = null) => {
            if (list.length && orderValue) {
              // Sort by media_section_api
              const sortByObject = orderValue.reduce(
                (obj, item, index) => ({
                    ...obj,
                    [item]: index
                }), {})
              list.sort((a, b) => sortByObject[a[sortOptions.group]] - sortByObject[b[sortOptions.group]])

              //Group by media_section_api
              var groupedTweets = {}
              orderValue.forEach(value => {
                groupedTweets[value] = list.filter(function(tweet) {
                  if(tweet[sortOptions.group] == value) {
                    return tweet
                  }
                })
              });

              //Catch when no group or not listed in sortOptions
              // uncomment this if you want others to appear with nonlisted subsection
              // groupedTweets['others'] = list.filter(function(tweet) {
              //   if(tweet[sortOptions.group] == undefined || !(tweet[sortOptions.group] in orderValue)) {
              //     return tweet
              //   }
              // });
              // groupedTweets['others'].sort(sortByRelevance(sortOptions))

              //Sort by relevance after being grouped by media_section_api
              orderValue.forEach(value => {
                groupedTweets[value].sort(sortByRelevance(sortOptions))
              });

              //Merge sorted results
              list = Object.keys(groupedTweets).reduce(function (r, k) {
                return r.concat(groupedTweets[k]);
              }, []);
              return list;
            }
          }

          const sortByRelevance = function(key) {
            return function(a, b) {
              if (a[key.key] < b[key.key]) return key.order == 'desc' ? 1 : -1; // will be 1 if DESC
              else return key.order == 'desc' ? -1 : 1; // will be -1 if DESC
            }
          }

          const sortOptions = {
            group: 'media_section_api', // grouping or subsection field
            key: 'overall_relevance', // sort field after grouping
            order: 'desc' // sorting order with the key (overall_relevance), use "asc" or "desc"
          }

          const orderValue = [
            'commentators_opinion',
            'reporters_opinion',
            'reporters_storydevelopments'
          ] // Add your media_section_api here in order you want

          tw = sortMedia(tw, sortOptions, orderValue)

          if (options.max_results_per_section.media > 0) {
            tw = tw.slice(0, options.max_results_per_section.media)
          }
          tweets.push({
            section: 'Media',
            tweets: tw
          })
        }

        console.log('Media', tw.length)
        if (options.required_speaker_types.media && !tw.length) {
          console.log('Media required but empty')
          return
        }
      }
      if (options.speaker_types.the_public) {
        // the public
        var tw = []
        tw.push.apply(tw, get(data, 'general_public.tweets'))

        post_tweets_section('The public', tw, options.max_results_per_section.the_public)
        if (options.required_speaker_types.the_public && !tw.length) {
          console.log('The public required but empty')
          return
        }
      }

      // Personalized Section - Reads from Same Domain Publisher Sharing
      if (true) {
        var tw = []

        tw.push.apply(tw, get(data, 'personalization.same_publisher_tweets_from_people_you_follow'))

        tw = remove_duplicate_id(tw)

        if (tw.length > 0) {
          var domainName = await readDomainName()
          post_tweets_section('What Your Friends Are Reading On ' + domainName, tw, 10)
        }
        // if (options.required_speaker_types.other_public_figures && !tw.length) {
        //   console.log('Other public figures required but empty')
        //   return
        // }
      }
      // End - Personalized Section - Reads from Same Domain Publisher Sharing

      var comments = []
      if (options.speaker_types.news_comments) {
        if (data['general_public.news_comments'] || data['general_public.facebook_comments']) {
          for (var i = 0; i < data['news_comments'].length; i++) {
            var k = 0

            var addThisRow = true

            if (options.news_comments_from_domains.length > 0) {
              var matchFound = false

              for (var k1 = 0; k1 < options.news_comments_from_domains.length; k1++) {
                var domain = options.news_comments_from_domains[k1]
                domain = domain.trim().toLowerCase()

                var newsDomain = data['news_comments'][i]['from_domain']
                newsDomain = newsDomain.trim().toLowerCase()

                if (domain == newsDomain) {
                  console.log('Match found for domain', newsDomain)
                  matchFound = true
                  break
                }
              }

              if (!matchFound) addThisRow = false
            }

            if (!addThisRow) continue

            for (var commentType in options.news_comments_types) {
              var active = options.news_comments_types[commentType]

              if (active) {
                if (data['news_comments'][i][commentType] && data['news_comments'][i][commentType].length) {
                  for (k = 0; k < data['news_comments'][i][commentType].length; k++) {
                    if (data['news_comments'][i][commentType][k].is_eligible) {
                      //hack to add the source_url
                      var source_url = data['news_comments'][i].from_full_url
                      if (commentType == 'fb_comments') { source_url = 'facebook.com'}
                      data['news_comments'][i][commentType][k].from_full_url = source_url

                      comments.push(data['news_comments'][i][commentType][k])
                      console.log('Add comment', commentType, comments[comments.length - 1])
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (comments.length) {
        if (options.max_results_per_section.news_comments > 0) {
          comments = comments.slice(0, options.max_results_per_section.news_comments)
        }
      }
      console.log('comments', comments.length)
      if (options.required_speaker_types.news_comments && !comments.length) {
        console.log('Comments required but empty')
        return
      }

      var tweetsToShow = []
      for (var i = 0; i < tweets.length; i++) {
        var tw = []
        for (var i1 = 0; i1 < tweets[i]['tweets'].length; i1++) {
          if (tweets[i]['tweets'][i1].is_low_confidence && !options.allow_low_confidence) {
            continue
          }
          if (tweets[i]['tweets'][i1].followers === undefined) {
            tw.push(tweets[i]['tweets'][i1])
          } else if (tweets[i]['tweets'][i1].followers >= options.min_popularity) {
            tw.push(tweets[i]['tweets'][i1])
          }
        }
        if (tw.length) {
          tw.sort(function (a, b) {
            if (a.overall_relevance > b.overall_relevance) {
              return -1
            }
            if (a.overall_relevance < b.overall_relevance) {
              return 1
            }
            return 0
          })
          for (var k = 0; k < tw.length; k++) {
            tw[k]['SECTION'] = tweets[i]['section']
            tweetsToShow.push(tw[k])
          }
        }
      }

      switch (options.display_mode) {
        case 'suggestions':
          showSuggestions(tweetsToShow, comments)
          break
        case 'compact':
          showCompact(tweetsToShow, comments)
          break
        case 'full':
          showFull(tweetsToShow, undefined, comments)
          break
        case 'slideshow':
          showSlideshow(tweetsToShow, comments)
          break
      }

      if (ulElement) {
        ulElement.removeEventListener('scroll', scrollHandler)
      }
      ulElement = document.getElementById(ulId)
      ulElement.addEventListener('scroll', scrollHandler)

      if (options.display_mode === 'full' || options.display_mode === 'compact' || options.display_mode === 'suggestions') {
        var items = ulElement.querySelectorAll('* > li')
        var maxElements = options.max_results * timesShown
        if (options.display_mode === 'compact') maxElements = 3
        console.log('Show up to', maxElements)
        for (var i = 0; i < maxElements; i++) {
          if (items[i] !== undefined) {
            items[i].classList.remove('social-curation__hidden')
          }
        }
        if (ulElement.querySelectorAll('li.social-curation__hidden').length === 0) {
          var more = ulElement.querySelectorAll('.social-curation__more')
          if (more && more[0]) {
            more[0].style['display'] = 'none'
          }
        }
        ulElement.scrollTop = scrollTop
      } else if (options.display_mode === 'slideshow') {
        var items = ulElement.querySelectorAll('* > li')
        var length = items.length
        if (currentSlide < length && length > 0 && currentSlide != 0) { // currentSlide is 0-based
          console.log('Redraw slide', currentSlide, 'of', length, 'slides')
          items[currentSlide].classList = 'social-curation__current'
          items[0].classList = 'social-curation__hidden'
        }
      }
    }

    var getHeader = function (mode) {
      var opts = {}
      opts.className = 'social-curation social-curation__' + mode
      opts.ulId = ulId
      opts.header = options.header
      opts.mode = mode

      var tmpl = '<ul class="<%this.className%>" id="<%this.ulId%>">' +
                    '<%if (this.header) {%>' +
                        '<h4 class="social-curation__header"><%this.header%>' +
                            '<%if (this.mode==="full") {%>' +
                                '' +
                            '<% } %>' +
                        '</h4>' +
                    '<% } %>'
      return TemplateEngine(tmpl, opts)
    }

    var scrollHandler = function () {
      if (ulElement && ulElement.scrollTop !== undefined) {
        scrollTop = ulElement.scrollTop
      }
    }

    var footer = '</ul>'

    var fadeIn = function (el, time) {
      el.style.opacity = 0;
    
      var last = +new Date();
      var tick = function() {
        el.style.opacity = +el.style.opacity + (new Date() - last) / time;
        last = +new Date();
    
        if (+el.style.opacity < 1) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        }
      };
    
      tick();
    }

    var slideDown = function (el, height, occurence) {
      let s = el.style
      if(occurence < 1) {
        s.transition = "height .5s ease"
        s.height = 0
        s.overflow = "hidden"
        s.display = "block"
        s.zIndex = 5
        setTimeout(function() {
          s.height = height
        }, 1)
      }else {
        s.opacity = 0
        setTimeout(function() {
          s.opacity = 1
        }, 500)
      }
    }

    var clickHandler = function (e) {
      e.preventDefault()
      var list = getClosest(this, '.social-curation')
      var items = list.querySelectorAll('li.social-curation__hidden')
      let scrollPosition = document.body.scrollTop
      for (var i = 0; i < options.max_results; i++) {
        if (items[i] !== undefined) {
          items[i].classList.remove('social-curation__hidden')
          // use below for a fade in effect of the tweets on pagination.  comment slideDown out.
          fadeIn(items[i], 1000) // this is the time the fade occurs
          // use below for a slide down effect of the tweets on pagination.   comment fadeIn out.
          // slideDown(items[i], items[i].offsetHeight, i)
        }
      }
      if (list.querySelectorAll('li.social-curation__hidden').length === 0) {
        this.style['display'] = 'none'
      }
      timesShown += 1
      document.body.scrollTop = scrollPosition
    }

    var nextHandler = function () {
      var list = getClosest(this, '.social-curation')
      var items = list.querySelectorAll('li')
      var next = false
      var current = false
      for (var i = 0; i < items.length; i++) {
        if (items[i].classList.contains('social-curation__current')) {
          next = i + 1
          current = i
          break
        }
      }
      if (next !== false) {
        if (next >= items.length) {
          next = 0
        }
        currentSlide = next
        console.log('current slide', currentSlide)
        items[current].classList = 'social-curation__hidden'
        items[next].classList = 'social-curation__current'
      }
    }

    var prevHandler = function () {
      var list = getClosest(this, '.social-curation')
      var items = list.querySelectorAll('li')
      var prev = false
      var current = false
      for (var i = 0; i < items.length; i++) {
        if (items[i].classList.contains('social-curation__current')) {
          prev = i - 1
          current = i
          break
        }
      }
      if (prev !== false) {
        if (prev < 0) {
          prev = items.length - 1
        }
        currentSlide = prev
        console.log('current slide', currentSlide)
        items[current].classList = 'social-curation__hidden'
        items[prev].classList = 'social-curation__current'
      }
    }

    var addFooter = function (html, index, max_results) {
      if (index > max_results) {
        html += "<li class='social-curation__more--wrapper'>"
        html += "<a class='social-curation__more' href='#'>Show more</a>"
        html += '</li>'
      }
      html += footer
      var anchors = document.getElementsByClassName('social-curation__more')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.removeEventListener('click', clickHandler)
      }

      element.innerHTML = html

      var anchors = document.getElementsByClassName('social-curation__more')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.addEventListener('click', clickHandler, false)
      }
    }

    var generateListItem = function (tweet, settings, mode) {
      tweet.tw_media_html = tweet.tw_media_html || {};
      var opts = {
        itemType: tweet.itemType,
        profile_image_url: '',
        username: '',
        user_account: '',
        account_url: '',
        is_user_verified: tweet.is_user_verified,
        tweet_url: tweet.tweet_url,
        profile_url: tweet.profile_url,
        bio: '',
        text: tweet.text,
        date: '',
        social_link: '',
        show_community_feedback: options.show_community_feedback,
        retweets: tweet.retweets,
        favorites: tweet.favorites,
        likes_count: tweet.likes_count,
        pageurl: pageurl,
        tw_media_html: (options.fullmode? tweet.tw_media_html.full_mode: tweet.tw_media_html.compact_mode) || "",
        from_full_url: tweet.from_full_url
      }
      opts.tw_media_html = opts.tw_media_html.replace('id=','class=');

      // profile image
      if (tweet.profile_image_url) {
        opts.profile_image_url = tweet.profile_image_url
      } else if (tweet.picture) {
        opts.profile_image_url = tweet.picture
      } else if (tweet.profile_url) {
        var fbId = tweet.id.split('_')[0]
        opts.profile_image_url = 'https://graph.facebook.com/' + fbId + '/picture?type=square'
      }

      // username
      if (tweet.user_name) {
        opts.username = tweet.user_name
      } else if (tweet.full_name) {
        opts.username = tweet.full_name
      } else {
        opts.username = tweet.username
      }

      opts.user_account = tweet.user_account

      // account_url
      if (tweet.user_account) {
        if (tweet.tweet_url) {
          opts.account_url = 'https://twitter.com/' + tweet.user_account
        } else if (tweet.profile_url) {
          opts.account_url = tweet.profile_url
        } else {
          opts.profile_url = ''
        }
      }

      // bio
      if (options.bio === 'original' && tweet.bio_from_twitter) {
        opts.bio = tweet.bio_from_twitter
      }
      if (options.bio === 'wikipedia' && tweet.bio) {
        opts.bio = tweet.bio
      }

      if (options.bio === 'category') {
        var twitter_bio = get(tweet, 'twitter_category.subcategory')
        if (!twitter_bio) twitter_bio = get(tweet, 'twitter_category.category')
        if (!twitter_bio) twitter_bio = get(tweet, 'category.subcategory')
        if (!twitter_bio) twitter_bio = get(tweet, 'category.category')

        opts.bio = twitter_bio
        if (opts.bio) opts.bio = opts.bio.charAt(0).toUpperCase() + opts.bio.substring(1)
      }


      // date
      var created_date = tweet.date ? tweet.date : tweet.created
      if(created_date !== undefined) {
        created_date = created_date.split('+')[0]
        created_date = created_date.replace(' ', 'T')
        if (settings && settings.date_format === 'since') {
          opts.date = time_ago(created_date)
        } else if (settings && settings.date_format === 'hour_date') {
          opts.date = formatDate(created_date)
        } else {
          opts.date = tweet.date
        }
      }

      // social link
      if (tweet.tweet_url) {
        opts.social_link = tweet.tweet_url
      }
      if (tweet.post_url) {
        opts.social_link = tweet.post_url
      }

      var tmpl = '' +
                    '<div class="social-curation__left">' +
                        '<% if (this.profile_image_url) { %>' +
                            '<img class="social-curation__picture" src="<% this.profile_image_url %>" >' +
                        '<% } %>' +
                    '</div>' +
                    '<div class="social-curation__right">' +
                        '<h3 class="social-curation__person">' +
                            '<% this.username %>' +
                            '<%if (this.is_user_verified) {%> <div class="twitter-icon-verified"></div> <% } %>' +
                            '<%if (this.user_account) {%> ' +
                                ' <i class="social-curation__person-link">' +
                                    '<%if (this.account_url) {%> ' +
                                        '<a href="<% this.account_url %>" style="color: #8899A6;text-decoration: none;">@<% this.user_account %></a>' +
                                    ' <% } else { %>' +
                                        '@<% this.user_account %>' +
                                    ' <% } %>' +
                                '</i>' +
                            ' <% } %>' +
                        '</h3>' +

                        '<%if (this.tweet_url) {%> ' +
                            '<div class="twitter-icon"></div>' +
                        '<%} else if (this.profile_url || this.from_full_url === "facebook.com") {%>' +
                            '<div class="facebook-icon"></div>' +
                        '<%} else if (this.from_full_url) {%>' +
                            '<img class="domain-icon" src="https://www.google.com/s2/favicons?domain_url=<%this.from_full_url%>">' +
                        '<%} else {%>' +
                            '<img class="domain-icon" src="https://www.google.com/s2/favicons?domain_url=<%this.pageurl%>">' +
                        '<%}%>' +

      //'<%if (this.bio) {%> ' +
                            '<div class="social-curation__bio"> <% this.bio %> </div>' +
                        //'<%}%>' +

                        '<div class="social-curation__message <% this.itemType %>"> <% this.text %> <% this.tw_media_html %> </div>' +
                        '<div class="social-curation__bottom">' +
                            '<div class="social-curation__date"> <% this.date %> </div>' +
                            '<%if (this.social_link) {%> ' +
                                '<div class="social-curation__link"> <% this.social_link %> </div>' +
                            '<%}%>' +
                            '<%if (this.show_community_feedback) {%> ' +
                                '<%if (this.retweets) {%> ' +
                                    '<div class="social-curation__retweets">' +
                                        '<div class="twitter-icon-retweet"></div> <% this.retweets %>' +
                                    '</div>' +
                                '<%}%>' +
                                '<%if (this.favorites) {%> ' +
                                    '<div class="social-curation__likes">' +
                                        '<div class="twitter-icon-favorite"></div> <% this.favorites %>' +
                                    '</div>' +
                                '<%}%>' +
                                '<%if (this.likes_count || !this.favorites) {%> ' +
                                    '<div class="social-curation__retweets">' +
                                        '<% this.likes_count %> <div class="facebook-like-icon"></div>' +
                                    '</div>' +
                                '<%}%>' +
                            '<%}%>' +
                        '</div>' +
                    '</div>'

      return TemplateEngine(tmpl, opts)
    }

    var placeholderCount = 0
    var addPlaceholder = function (html, max_items, index = 0) {
      var max_items_to_show = max_items !== undefined ? max_items : options.max_results
      if (options.placeholder_frequency > 0) {
        placeholderCount++
        var start = '<li>'
        if (index + 1 > max_items_to_show) {
          start = "<li class='social-curation__hidden'>"
        }

        if (placeholderCount % options.placeholder_frequency === 0) {
          return start + options.placeholder_html + '</li>'
        }
      }
      return ''
    }

    var showFull = function (tweets, max_items, comments, mode) {
      var html = getHeader('full')
      if (mode !== undefined) {
        var html = getHeader(mode)
      } else {
        mode = 'full'
      }
      var i = 0
      var max_items_to_show = max_items !== undefined ? max_items : options.max_results
      var sectionHeader = ''
      for (i = 0; i < tweets.length; i++) {
        var tweet = tweets[i]
        var blank_class = tweet.SECTION === '&nbsp;' ? 'blank': ''
        if (tweet.SECTION !== sectionHeader) {
          if (options.category_section_headers) {
            if (i + 1 > max_items_to_show) {
              html += "<li class='social-curation__section social-curation__hidden'>"
            } else {
              html += "<li class='social-curation__section " + blank_class + "'>"
            }
            sectionHeader = tweet.SECTION
            html += sectionHeader
            html += '</li>'
          }
        }
        if (i + 1 > max_items_to_show) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += '<li>'
        }

        html += generateListItem(tweet, {
          date_format: 'since'
        }, mode)

        html += '</li>'

        html += addPlaceholder(html, max_items_to_show, i)
      } // loop end

      if (comments.length) {
        if (i + 1 > max_items_to_show) {
          html += "<li class='social-curation__section social-curation__hidden'>"
        } else {
          html += "<li class='social-curation__section'>"
        }
        html += 'News comments'
        html += '</li>'
      }

      for (var k = 0; k < comments.length; k++) {
        var comment = comments[k]
        if (k + i + 1 > max_items_to_show) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += '<li>'
        }

        var modified = {
          itemType: 'comment',
          profile_image_url: comment.author_pic_url,
          user_name: comment.author_name,
          text: comment.comment,
          from_full_url: comment.from_full_url,
          likes_count: comment.likes,
          date: comment.created
        }

        html += generateListItem(modified, {
          date_format: 'since'
        }, mode)

        html += '</li>'

        html += addPlaceholder(html, max_items, i)
      }

      var count = i
      var max_results = options.max_results
      if (max_items !== undefined) {
        count = 0
        max_results = 0
      }
      if ((tweets.length + comments.length) > 0) {
        addFooter(html, count, max_results)
      }
    }

    var showSuggestions = function (tweets, comments) {
      var html = getHeader('suggestions')
      var i = 0
      var sectionHeader = ''
      for (i = 0; i < tweets.length; i++) {
        var tweet = tweets[i]
        if (tweet.SECTION !== sectionHeader) {
          if (options.category_section_headers) {
            if (i + 1 > options.max_results) {
              html += "<li class='social-curation__section social-curation__hidden'>"
            } else {
              html += "<li class='social-curation__section'>"
            }
            sectionHeader = tweet.SECTION
            html += sectionHeader
            html += '</li>'
          }
        }
        if (i + 1 > options.max_results) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += '<li>'
        }

        html += "<div class='social-curation__suggestion'>"

        html += "<span class='social-curation__suggestion__person'>"
        if (tweet.user_name) {
          html += tweet.user_name
        } else if (tweet.full_name) {
          html += tweet.full_name
        } else {
          html += tweet.username
        }
        html += '</span>'

        if (tweet.tags && tweet.tags[0]) {
          html += ", <span class='social-curation__suggestion__category'>"
          html += tweet.tags[0]
          html += ',</span>'
        } else if (tweet.twitter_category && tweet.twitter_category.subcategory) {
          html += ", <span class='social-curation__suggestion__category'>"
          html += tweet.twitter_category.subcategory
          html += ',</span>'
        }

        html += ' said: "' + tweet.text + '"'

        html += " <span class='social-curation__suggestion__link'>"
        if (tweet.tweet_url) {
          html += '<a href=\'' + tweet.tweet_url + '\'>Link</a>'
        } else if (tweet.post_url) {
          html += '<a href=\'' + tweet.post_url + '\'>Link</a>'
        }
        html += '</span>'

        html += '</div>'

        html += '</li>'
      } // loop end

      if (comments.length) {
        if (i + 1 > options.max_results) {
          html += "<li class='social-curation__section social-curation__hidden'>"
        } else {
          html += "<li class='social-curation__section'>"
        }
        html += 'News comments'
        html += '</li>'
      }

      for (var k = 0; k < comments.length; k++) {
        var comment = comments[k]

        if (k + i + 1 > options.max_results) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += '<li>'
        }

        html += "<div class='social-curation__suggestion'>"

        html += "<span class='social-curation__suggestion__person'>"
        html += comment.author_name
        html += '</span>'

        html += ' said: "' + comment.comment + '"'

        html += '</div>'

        html += '</li>'
      }
      if ((tweets.length + comments.length) > 0) {
        addFooter(html, i, options.max_results)
      }
    }

    var showCompact = function (tweets, comments) {
      return showFull(tweets, 3, comments, 'compact')
    }

    var showSlideshow = function (tweets, comments) {
      var html = getHeader('slideshow')
      for (var i = 0; i < tweets.length; i++) {
        var tweet = tweets[i]
        if (i > 0) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += "<li class='social-curation__current'>"
        }
        html += generateListItem(tweet, {
          date_format: 'hour_date'
        }, 'slideshow')
        html += '</li>'
      } // loop end

      for (var k = 0; k < comments.length; k++) {
        var comment = comments[k]
        if (k + i > 0) {
          html += "<li class='social-curation__hidden'>"
        } else {
          html += "<li class='social-curation__current'>"
        }
        var modified = {
          profile_image_url: comment.author_pic_url,
          user_name: comment.author_name,
          text: comment.comment,
          from_full_url: comment.from_full_url,
          likes_count: comment.likes,
          date: comment.created
        }
        html += generateListItem(modified, {
          date_format: 'hour_date'
        }, 'slideshow')
        html += '</li>'
      }

      if (tweets.length > 1) {
        html += '<div class="social-curation__next">'

        html += '</div>'
        html += '<div class="social-curation__prev">'

        html += '</div>'
      }

      html += footer

      var anchors = document.getElementsByClassName('social-curation__next')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.removeEventListener('click', nextHandler)
      }

      var anchors = document.getElementsByClassName('social-curation__prev')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.removeEventListener('click', prevHandler)
      }

      if ((tweets.length + comments.length) > 0) {
        console.log('Showing html for ' + (tweets.length + comments.length))
        element.innerHTML = html
      }

      var anchors = document.getElementsByClassName('social-curation__next')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.addEventListener('click', nextHandler, false)
      }

      var anchors = document.getElementsByClassName('social-curation__prev')
      for (var i = 0; i < anchors.length; i++) {
        var current = anchors[i]
        current.addEventListener('click', prevHandler, false)
      }

      return html
    }

    var TemplateEngine = function (html, opt) {
      // from http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
      var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match
      var add = function (line, js) {
        js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '')
        return add
      }
      while (match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true)
        cursor = match.index + match[0].length
      }
      add(html.substr(cursor, html.length - cursor))
      code += 'return r.join("");'
      return new Function(code.replace(/[\r\t\n]/g, '')).apply(opt)
    }
  }

  // class we added so we could sleep before second api request -- note this only 
  // applies to places where custom widget (not twitter one is used)
  class AsyncInterval {
    constructor(cb, interval) {
      this.asyncIntervals = [];
      this.intervalIndex = this.asyncIntervals.length;
      this.setAsyncInterval(cb, interval);
    }

    setAsyncInterval(cb, interval) {
      if (cb && typeof cb === "function") {
        this.asyncIntervals.push(true);
        this._runAsyncInterval(cb, interval, this.intervalIndex);
        return this.intervalIndex;
      } else {
        throw new Error('Callback must be a function');
      }
    }

    clearAsyncInterval() {
      if (this.asyncIntervals[this.intervalIndex]) {
        this.asyncIntervals[this.intervalIndex] = false;
      }
    }

    async _runAsyncInterval(cb, interval, intervalIndex) {
      await cb();
      if (this.asyncIntervals[this.intervalIndex]) {
        setTimeout(() => this._runAsyncInterval(cb, interval, this.intervalIndex), interval);
      }
    }

  }
  // sleep function for sleeping before something is done (we use this to sleep before second api request)
  function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
  }

  // sharing
  const is_left_bar = false; //Choose if you need lefside bar or bottom bar for custom widget

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
  }

  $('.link_text_copy').click(function(e){
    e.preventDefault();
    copyToClipboard(this);
    $(this).addClass('copiedInfo');
    setTimeout(() => $(this).removeClass('copiedInfo'), 1500);
  })

  // Show/hide bottom bar on scroll event
  $.fn.scrollStopped = function(callback) {
    var that = this, $this = $(that);
    $this.scroll(function(ev) {
      $('.bottom_bar').fadeOut('fast');
      clearTimeout($this.data('scrollTimeout'));
      $this.data('scrollTimeout', setTimeout(callback.bind(that), 250, ev));
    });
  };

    if(!is_left_bar){
      // Show bottom bar if coursos is over the widget
      // $(window).scrollStopped(() =>{
      //   if($('.widget_body').find("#ROOT_ELEMENT:hover").length){
      //     $('.bottom_bar').css({'display': 'flex'})
      //   }
      // });

      // Show/hide bottom bar if cursor is over the widget
      // $( ".widget_body" ).mouseleave(() => {
      //   $( ".bottom_bar" ).css({'display': 'none'})
      // });
      // $( ".widget_body" ).mouseenter(() => {
      //   $( ".bottom_bar" ).css({'display': 'flex'})
      // });
    }
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
    $('.left_side_bar').hover(function() {
      if (findGetParameter('parent_host_name') === "twitter.com") {
        $( this ).fadeTo( 500, 1 ); // speed of fade of side buttons actually is controlled in style.css .left_side_bar transition
      } else {
        $( this ).hide();
      }
    }, function() {
      $( this ).fadeTo( 500, 0 );
    })
    
}(window))
