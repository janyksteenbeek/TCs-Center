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
const displayName = document.getElementById('displayName');
const addDN = document.getElementById('saveDisplayName');

/* Products/languages available for now */

import getLanguages from './src/js/class/Language.class.js';
import getProducts from './src/js/class/Product.class.js';
import getSearch from './src/js/class/Search.class.js';
import { getFeed, productsAvailable } from './src/js/class/Feed.class.js';
import User from './src/js/class/User.class.js';

let products = getProducts();
let languages = getLanguages();
let search = getSearch();
let feed = getFeed();
let user;

const defaultLanguage = languages.filter(language => language.active)[0];
const defaultProducts = products.filter(product => product.active);

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

setNodes.then(response => {
    bindProducts(response.products);
    bindLanguages(response.languages);
});

/* Options for products selection */

function bindProducts(products) {

    products.forEach((product, index) => {

        product.node.addEventListener('click', function(e) {

            e.preventDefault();

            product.active = (product.active === true) ? false : true;

            if (product.active) this.firstElementChild.classList.add('active');
            else this.firstElementChild.classList.remove('active');

            let activeProducts = products.filter(product => product.active);

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

    languagesNodes.forEach((language, index) => {

        language.node.addEventListener('click', function(e) {

            e.preventDefault();

            for (var i = languages.length - 1; i >= 0; i--) {
                languages[i].active = false;
                languages[i].node.firstElementChild.classList.remove('active');
            }

            language.active = true;

            feed.topics = [];
            feed.status = 200;

            chrome.browserAction.setBadgeText({
                text: ''
            });

            chrome.runtime.sendMessage(null, { update: 'feed' });

            this.firstElementChild.classList.add('active');

            chrome.storage.sync.set({
                language: language || defaultLanguage,
                feed: feed,
                lastUpdateFeed: null,
                lastTopic: null
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

            let i = document.createElement('i');

            datas = datas.filter(data => data.active).map(data => data.name || data.limit);

            i.textContent = '"'+datas.join(', ')+'"';

            let space = document.createTextNode("\u00A0");
            let span = document.createElement('span');
            span.textContent = " is selected";

            if (datas.length > 1) span.textContent = " are selected";
            else if (options.type == 'limit') span.textContent = " result(s) will be displayed at most";

            status.appendChild(i);
            status.appendChild(space);
            status.appendChild(span);
        } else {
            status.textContent = 'No '+options.type+' selected';
        }

    }

    else if (options.type == 'feed') {
        let span = document.createElement('span');
        let w = (options.datas.active) ? 'will be' : 'will not be';
        span.innerHTML = `The last <b>${options.datas.number}</b> <b>${options.datas.content}</b> from <b>${options.datas.product.name}</b> forum <b>${w}</b> displayed`;
        status.appendChild(span);
        return false;
    } else if (options.type == 'user') {
        if (options.datas != null) {
            let b = document.createElement('b');
            b.textContent = `"${options.datas.name}"`;
            status.textContent = 'Your display name is ';
            status.appendChild(b);
        } else {
            status.textContent = 'No display name provided';
        }
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
            if (e.keyCode == 13) element.click();
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
    feed.setNotification(document.getElementById('showNotification').checked);
    feed.setProduct(document.getElementById('productFeed').value);
    feed.setNumber(document.getElementById('numberFeed').value);
    feed.setContent(document.getElementById('contentFeed').value);

    feed.status = 200;
    feed.topics = [];

    chrome.browserAction.setBadgeText({
        text: ''
    });

    chrome.runtime.sendMessage(null, { update: 'feed' });

    chrome.storage.sync.set({
        feed: feed,
        lastUpdateFeed: null,
        lastTopic: null
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
        feed: feed,
        user: null
    }, items => {

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

        for (var i = 0; i < languages.length; i++) {
            languages[i].active = false;
            if (languages[i].name == items.language.name) {
                languages[i].active = true;
                languages[i].node.firstElementChild.classList.add('active');
            }
        }

        for (var i = productsAvailable.length - 1; i >= 0; i--) {
            let option = document.createElement('option');
            option.setAttribute('value', productsAvailable[i].id);
            option.textContent = productsAvailable[i].name;
            document.getElementById('productFeed').appendChild(option);
        }

        feed = getFeed(items.feed);
        search = getSearch(items.search);
        user = items.user;

        document.querySelectorAll('.message').forEach((element, index) => {

            let options = null;

            if (element.getAttribute('data-message') == 'products') {
                options = {
                    "datas": products,
                    "type": 'products'
                };
            } else if (element.getAttribute('data-message') == 'language') {
                options = {
                    "datas": languages,
                    "type": 'language'
                };
            } else if (element.getAttribute('data-message') == 'limit') {
                options = {
                    "datas": search,
                    "type": 'limit'
                }
            } else if (element.getAttribute('data-message') == 'feed') {
                options = {
                    "datas": feed,
                    "type": 'feed'
                };
            } else if (element.getAttribute('data-message') == 'user') {
                options = {
                    "datas": user,
                    "type": 'user'
                };
            }

            if (options) insertMessage(options);
        });

        document.getElementById('limit').value = search.limit
        if (feed.active) document.getElementById('showFeed').setAttribute('checked', 'checked');
        if (feed.notification) document.getElementById('showNotification').setAttribute('checked', 'checked');
        if (search.save) document.getElementById('saveSearch').setAttribute('checked', 'checked');
        document.getElementById('contentFeed').value = items.feed.content;
        document.getElementById('productFeed').value = items.feed.product.id;
        document.getElementById('numberFeed').value = items.feed.number;
        tabEnter(document.getElementById('showFeed'));
        tabEnter(document.getElementById('saveSearch'));

        if (items.user) {
            displayName.classList.add('active');
            displayName.textContent = items.user.name;
        }

    });
}

displayName.addEventListener('focus', function (e) {
    if (!user) this.classList.add('active');
}, false);

displayName.addEventListener('blur', function (e) {
    if (this.textContent.trim() == '') {
        user = null;
        this.classList.remove('active');
    }

    this.textContent = this.textContent.trim();

}, false);

addDN.addEventListener('click', function (e) {
    if (displayName.textContent.trim() != '') {
        user = new User(displayName.textContent.toString());
        chrome.storage.sync.set({
            user: user
        }, successDOM({
            "datas": user,
            "type": 'user'
        }));
    }
});

document.addEventListener('DOMContentLoaded', restore_options);

// Go hover a product node
Bubblesee.bind('[data-type][title]', 'skew');
Bubblesee.bind('a.star i[title]', 'rotate');