//var siteId = 'integrationtest402'; // Define site_id as a variable


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

window.dataLayer = window.dataLayer || [];
dataLayer.push({
    'site': urlParams.get('site'),
    'server': urlParams.get('server')
});

// Function to insert additional scripts
function insertAdditionalScripts(siteId, integrationScriptSrc) {
    const server = urlParams.get("server");

    // Determine the placements script URL based on the server
    const placementsSrc =
        server !== "prod"
            ? `//talkable-labs.herokuapp.com/pl.js?lib=https://curebit-staging.s3.amazonaws.com/integration/clients/${siteId}.min.js`
            : `//talkable-labs.herokuapp.com/pl.js?lib=https://curebit.s3.amazonaws.com/integration/clients/${siteId}.min.js`;

    // Insert placements_obj script
    const placementsScript = document.createElement("script");
    placementsScript.src = placementsSrc;
    placementsScript.id = "placements_obj";
    var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(placementsScript, s);
}

// Initial Talkable script integration
(function() {
    var tkbl = document.createElement('script');
    tkbl.type = 'text/javascript';
    tkbl.async = true;
    tkbl.src = 'spa_exclusions_fix.js';
//    tkbl.src = 'https://curebit-staging.s3.amazonaws.com/integration/clients/' + urlParams.get('site') + '.min.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(tkbl, s);
    insertAdditionalScripts(urlParams.get('site'));
})();


window._talkableq = window._talkableq || [];
window._talkableq.unshift(['init', { site_id: urlParams.get('site') }]);

// Function to trigger Talkable campaign
function triggerTalkableCampaign() {
    // Example: Trigger a Talkable campaign. Adjust according to your campaign setup.
    window._talkableq.push(['authenticate_customer', {}]);
    window._talkableq.push(['register_affiliate', {}]);
}

// Show and Hide Purchase Form
function showPurchaseForm() {
    document.getElementById('purchaseFormSection').style.display = 'block';
    document.getElementById('talkableCampaignButton').style.display = 'none'; // Hide campaign button when showing the purchase form
}

function hidePurchaseForm() {
    document.getElementById('purchaseFormSection').style.display = 'none';
    document.getElementById('talkableCampaignButton').style.display = 'block'; // Show campaign button when not on the purchase form
}

function hideTalkableOffer() {
    document.getElementById('talkable-offer').style.display = 'none';
}

function showTalkableOffer() {
    document.getElementById('talkable-offer').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("displaySiteId").textContent = urlParams.get('site');
    hidePurchaseForm(); // Initially hide the purchase form and show the campaign button

    document.getElementById("purchaseForm").addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission
        var email = document.getElementById("email").value;
        var orderNumber = document.getElementById("orderNumber").value;
        var subtotal = document.getElementById("subtotal").value;

        // Construct the data object for Talkable
        var data = {
            purchase: {
                order_number: orderNumber,
                subtotal: subtotal,
                email: email,
                items: []
            }
        };

        // Submit data to Talkable
        window._talkableq.push(['register_purchase', data]);

        // Optionally, clear the form or show a success message
//        alert("Purchase registered successfully!");
        console.log("Purchase registered successfully!");
    });
});