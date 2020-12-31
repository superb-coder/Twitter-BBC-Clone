window['$'](document).on('click', 'a', function (evt) {
  // ...
  const href = evt.target.href || window['$'](evt.target).closest('a').prop('href')
  console.log('content-link.js', href, evt.target, window['$'](evt.target).closest('a'))
  chrome.runtime.sendMessage({message: 'linkOpen', data: href})
})
