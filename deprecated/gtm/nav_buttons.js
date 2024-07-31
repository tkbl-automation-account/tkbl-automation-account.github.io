const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

window.dataLayer = window.dataLayer || [];
dataLayer.push({
    'site': urlParams.get('site'),
    'server': urlParams.get('server')
});

function build_nav_buttons() {
    const site = urlParams.get('site');
    const server = urlParams.get('server');

    const urls = {
        'Index': `https://tkbl-automation-account.github.io/new-approach/gtm/index.html?site=${site}&server=${server}`,
        'SA': `https://tkbl-automation-account.github.io/new-approach/gtm/sa.html?site=${site}&server=${server}`,
        'Post Purchase': `https://tkbl-automation-account.github.io/new-approach/gtm/pp.html?site=${site}&server=${server}`
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