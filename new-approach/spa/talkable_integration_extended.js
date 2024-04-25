const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

window.dataLayer = window.dataLayer || [];
dataLayer.push({
    'site': urlParams.get('site'),
    'server': urlParams.get('server')
});

(function() {
    var tkbl = document.createElement('script');
    tkbl.type = 'text/javascript';
    tkbl.async = true;
    tkbl.src = 'https://curebit-staging.s3.amazonaws.com/integration/clients/' + urlParams.get('site') + '.min.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(tkbl, s);
})();

window._talkableq = window._talkableq || [];
window._talkableq.unshift(['init', { site_id: urlParams.get('site') }]);

function triggerTalkableCampaign() {
    window._talkableq.push(['authenticate_customer', {}]);
    window._talkableq.push(['register_affiliate', {}]);
}

function hidePurchaseForm() {
    document.getElementById('purchaseFormSection').style.display = 'none';
    document.getElementById('talkableCampaignButton').style.display = 'block';
}

function hideTalkableOffer() {
    console.log('hideTalkableOffer function called');
    document.getElementById('talkable-offer').style.display = 'none';
    document.getElementById('homeButton').classList.add('active');
    document.getElementById('purchaseButton').classList.remove('active');
    document.getElementById('standaloneButton').classList.remove('active');
}

function showTalkableOffer() {
    console.log('showTalkableOffer function called');
    document.getElementById('talkable-offer').style.display = 'block';
    document.getElementById('homeButton').classList.remove('active');
    document.getElementById('purchaseButton').classList.remove('active');
    document.getElementById('standaloneButton').classList.add('active');
}

function showPurchaseForm() {
    console.log('showPurchaseForm function called');
    document.getElementById('purchaseFormSection').style.display = 'block';
    document.getElementById('talkableCampaignButton').style.display = 'none';
    document.getElementById('homeButton').classList.remove('active');
    document.getElementById('purchaseButton').classList.add('active');