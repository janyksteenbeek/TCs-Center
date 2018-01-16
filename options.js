/**
 *
 * Script file for options
 * Contact me if you need some explanation
 *
 */

/* If you need to add node / element */

const languagesDOM = document.querySelectorAll('[data-type="language"]');
const productsDOM = document.querySelectorAll('[data-type="product"]');
const formSearch = document.getElementById('formSearch');
const formFeed = document.getElementById('formFeed');

/* Products/languages available for now */

import getLanguages from './src/js/class/Language.class.js';
import getProducts from './src/js/class/Product.class.js';
import getSearch from './src/js/class/Search.class.js';
import getFeed from './src/js/class/Feed.class.js';

let products = getProducts();
let languages = getLanguages();
let search = getSearch();
let feed = getFeed();

const defaultLanguage = languages.filter(function(obj) {
    return obj.active == true;
})[0];

const defaultProducts = products.filter(function(obj) {
    return obj.active == true;
});

var setNodes = new Promise(function(resolve, reject) {

    for (var i = languages.length - 1; i >= 0; i--) {
        document.querySelector('.list-language').appendChild(languages[i].node);
    }

    for (var i = products.length - 1; i >= 0; i--) {
        document.querySelector('.list-product').appendChild(products[i].node);
    }

    resolve({
        'languages': languages,
        'products': products
    });
});

setNodes.then(function(response) {
    bindProducts(response.products);
    bindLanguages(response.languages);
});

/* Options for products selection */

function bindProducts(products) {

    products.forEach(function(product, index) {

        product.node.addEventListener('click', function(e) {

            e.preventDefault();

            product.active = (product.active === true) ? false : true;

            if (product.active) {
                this.firstElementChild.classList.add('active');
            } else {
                this.firstElementChild.classList.remove('active');
            }

            let activeProducts = products.filter(function(elem) {
                return elem.active;
            });

            chrome.storage.sync.set({
                products: (activeProducts.length > 0) ? activeProducts : defaultProducts
            }, successDOM ({
                "datas": activeProducts,
                "type": 'products'
            }));

        }, false);

        tabEnter(product.node);
    });
}

/* Options for language selection */

function bindLanguages(languagesNodes) {

    languagesNodes.forEach(function(language, index) {

        language.node.addEventListener('click', function(e) {

            e.preventDefault();

            for (var i = languages.length - 1; i >= 0; i--) {
                languages[i].active = false;
                languages[i].node.firstElementChild.classList.remove('active');
            }

            language.active = true;

            this.firstElementChild.classList.add('active');

            chrome.storage.sync.set({
                language: language || defaultLanguage
            }, successDOM ({
                "datas": languages,
                "type": 'language'
            }));

        }, false);

        tabEnter(language.node);
    });
}

/* Insert message after the message "Options saved", it's a callback if u want */

function insertMessage(options) {

    let status = document.querySelector('[data-message="'+options.type+'"]');

    if (options.type == 'products' || options.type == 'language' || options.type == 'limit') {

        let datas = (Array.isArray(options.datas)) ? options.datas : [options.datas];

        if (datas.length > 0 || options.type == 'limit') {

            var i = document.createElement('i');

            datas = datas
            .filter(function(elem) {
                return elem.active;
            }).map(function(elem, index) {
                return elem.name || elem.limit;
            });

            i.textContent = '"'+datas.join(', ')+'"';

            var space = document.createTextNode("\u00A0");
            var span = document.createElement('span');
            span.textContent = " is selected";


            if (datas.length > 1) {
                span.textContent = " are selected";
            } else if (options.type == 'limit') {
                span.textContent = " result(s) will be display at most";
            } 

            status.appendChild(i);
            status.appendChild(space);
            status.appendChild(span);
        } else {
            status.textContent = 'No '+options.type+' selected'; 
        }

    }

    else if (options.type == 'feed') {
        var span = document.createElement('span');
        let w = (options.datas.active) ? 'will be' : 'will not be';
        span.innerHTML = 'Last <b>'+options.datas.content+'</b> from <b>'+options.datas.product+'</b> forum <b>'+w+'</b> display';
        status.appendChild(span);
        return false;
    } else {
       status.textContent = 'No '+options.type+' selected'; 
    }
}

/* Insert message after select/saved/change an option */

function successDOM(options, timeOut = 750) {
    if (typeof options === 'object') {
        var status = document.querySelector('[data-message="'+options.type+'"]');
        status.classList.add('active');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            while (status.firstChild) {
                status.removeChild(status.firstChild);
            }
            status.classList.remove('active');

            insertMessage(options);
        }, timeOut);
    }
}

/* If user use keyboard shortcuts to move in the different options */

function tabEnter(element) {
    element.addEventListener('focusin', function(e){
        element.onkeydown = function(e) {
            if (e.keyCode == 13) {
                element.click();
            }
        };
    }, false);
}

/* Options for limit selection */

formSearch.addEventListener('submit', function(e) {

    e.preventDefault();

    search.setLimit(document.getElementById('limit').value);
    search.setSave(document.getElementById('saveSearch').checked); 
    search.value = (search.save === true) ? search.value : '';

    chrome.storage.sync.set({
        search: search
    }, successDOM ({
        "datas": search,
        "type": 'limit'
    }));

    return false;

}, false);

/* Options for RSS feed selection */

formFeed.addEventListener('submit', function(e) {

    e.preventDefault();

    feed.setActive(document.getElementById('showFeed').checked);
    feed.setProduct(document.getElementById('productFeed').value);
    feed.setContent(document.getElementById('contentFeed').value);

    chrome.storage.sync.set({
        feed: feed
    }, successDOM ({
        "datas": feed,
        "type": 'feed'
    }));

}, false);

/* Get chrome storage */

function restore_options() {
    chrome.storage.sync.get({
        language: defaultLanguage,
        products: defaultProducts,
        search: search,
        feed: feed
    }, function(items) {

        products.forEach(function(element, index) {
            element.active = false;
            for (var i = items.products.length - 1; i >= 0; i--) {
                if (items.products[i].name == element.name) {
                    element.active = true;
                    element.node.firstElementChild.classList.add('active');
                    continue;
                }
            }
        });

        for (var i = languages.length - 1; i >= 0; i--) {
            languages[i].active = false;
            if (languages[i].name == items.language.name) {
                languages[i].active = true;
                languages[i].node.firstElementChild.classList.add('active');
            }
        }

        feed = getFeed(items.feed);
        search = getSearch(items.search);

        document.querySelectorAll('.message').forEach( function(element, index) {

            if (element.getAttribute('data-message') == 'products') {
                var options = {
                    "datas": products,
                    "type": 'products'
                };
            } else if (element.getAttribute('data-message') == 'language') {
                var options = {
                    "datas": languages,
                    "type": 'language'
                };
            } else if (element.getAttribute('data-message') == 'limit') {
                var options = {
                    "datas": search,
                    "type": 'limit'
                }
            } else if (element.getAttribute('data-message') == 'feed') {
                var options = {
                    "datas": feed,
                    "type": 'feed'
                };
            }

            if (options) {
                insertMessage(options);
            }
        });

        document.getElementById('limit').value = search.limit
        if (feed.active) { document.getElementById('showFeed').setAttribute('checked', 'checked'); }
        if (search.save) { document.getElementById('saveSearch').setAttribute('checked', 'checked'); }
        document.getElementById('contentFeed').value = items.feed.content;
        document.getElementById('productFeed').value = items.feed.product;
        tabEnter(document.getElementById('showFeed'));
        tabEnter(document.getElementById('saveSearch'));
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

// Go hover a product node
Bubblesee.bind('[data-type][title]', 'skew');
Bubblesee.bind('a.star i[title]', 'rotate');