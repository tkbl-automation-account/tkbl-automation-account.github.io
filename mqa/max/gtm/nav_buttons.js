const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

window.dataLayer = window.dataLayer || [];
dataLayer.push({
    'site': urlParams.get('site'),
    'server': urlParams.get('server')
    'js_lib': urlParams.get('js_lib')
});

function build_nav_buttons() {
    const site = urlParams.get('site');
    const server = urlParams.get('server');
    var js_lib;
    if(urlParams.get('js_lib') != 'undefined'){
        js_lib = '&' + urlParams.get('js_lib');
    }

    const urls = {
        'Index': `https://tkbl-automation-account.github.io/new-approach/gtm/index.html?site=${site}&server=${server}${js_lib}`,
        'SA': `https://tkbl-automation-account.github.io/new-approach/gtm/sa.html?site=${site}&server=${server}${js_lib}`,
        'Post Purchase': `https://tkbl-automation-account.github.io/new-approach/gtm/pp.html?site=${site}&server=${server}${js_lib}`
    };

    const navButtons = document.getElementById('nav_buttons');

    for (const [name, url] of Object.entries(urls)) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.textContent = name;
        li.appendChild(a);
        navButtons.appendChild(li);
    }
}