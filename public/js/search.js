$(function () {
  var getContentLite = function (callback) {
    var data
    var retrieve = function () {
      $.getJSON('/content.lite.json').done(function (response) {
        data = response.pages
        callback(data)
      })
    }

    if (data) {
      callback(data)
    } else {
      retrieve()
    }
  }

  var t = function (string) {
    return function (object) {
      return Object.keys(object).reduce(function (result, key) {
        return result.replace('{' + key + '}', object[key])
      }, string)
    }
  }
  var templates = {
    main: t('<section><h2>Search Results</h2>{message}<ul class="pageColumns">{items}</ul></section>'),
    message: t('<div class="search-noresults">{body}</section>'),
    item: function (data) {
      data.fullTitle = (data.subtitle || data.title).replace(/^\d*\s-\s/, '')
      return templates._item(data)
    },
    _item: t('<li><a href="{href}">{fullTitle}</a></li>')
  }

  var filterData = function (opt) {
    return opt.data.filter(function (item) {
      return Object.keys(item)
        .map(function (key) { return item[key] })
        .filter(function (i) {
          return i && i.match && i.match(new RegExp(opt.match.replace(' ', '.*'), 'i'))
        }).length
    })
  }

  var displaySearch = function (match) {
    getContentLite(function (data) {
      var results = filterData({data: data, match: match})

      document.querySelector('.toc').setAttribute('hidden', true)
      document.querySelector('.search-results').removeAttribute('hidden')

      var items = results.map(templates.item).join('')
      var message = results.length ? '' : templates.message({body: 'Sorry, we could not find anything matching that. <br/>You can try manually searching on <a href="/all">our page with all content on it</a>'})
      document.querySelector('.search-results').innerHTML = templates.main({items: items, message: message})
    })
  }
  var hideSearch = function () {
    document.querySelector('.toc').removeAttribute('hidden')
    document.querySelector('.search-results').setAttribute('hidden', true)
  }

  var handleSearchChange = function (match) {
    if (match && match.length) {
      displaySearch(match)
    } else {
      hideSearch()
    }
  }

  handleSearchChange($('#index-search input.search-input').val())

  $('#index-search input.search-input').on('keyup', function (event) {
    handleSearchChange(event.target.value)
  })
})
