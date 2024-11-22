const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

window.dataLayer = window.dataLayer || [];
dataLayer.push({
    site: urlParams.get("site"),
    server: urlParams.get("server"),
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
    document.body.appendChild(placementsScript);

    // Insert tkbl_integration_script
    if (integrationScriptSrc) {
        const integrationScript = document.createElement("script");
        integrationScript.src = integrationScriptSrc;
        integrationScript.id = "tkbl_integration_script";
        document.body.appendChild(integrationScript);
    }
}

// Initial Talkable script integration
//(function () {
//    const siteId = urlParams.get("site");
//    const tkbl = document.createElement("script");
//    tkbl.type = "text/javascript";
//    tkbl.async = true;
//    tkbl.src = `https://curebit-staging.s3.amazonaws.com/integration/clients/${siteId}.min.js`;
//    const s = document.getElementsByTagName("script")[0];
//    s.parentNode.insertBefore(tkbl, s);
//
//    // Remove the old script after it has been added
//    tkbl.onload = function () {
//        removeOldTalkableScript(siteId);
//    };
//})();

window._talkableq = window._talkableq || [];
window._talkableq.unshift(["init", { site_id: urlParams.get("site") }]);

// Function to remove the old Talkable script
function removeOldTalkableScript(siteId) {
    const scriptSrc = `https://curebit-staging.s3.amazonaws.com/integration/clients/${siteId}.min.js`;
    const scripts = document.querySelectorAll(`script[src="${scriptSrc}"]`);
    scripts.forEach((script) => {
        script.parentNode.removeChild(script);
        console.log(`Removed script with src: ${scriptSrc}`);
    });
}

// Highlight selected navigation button
function highlightNavButton(selectedId) {
    const buttons = document.querySelectorAll(".nav-link");
    buttons.forEach((button) => button.classList.remove("active"));

    const selectedButton = document.querySelector(`#${selectedId}`);
    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}

// Update title on the page
function updatePageTitle(titleText) {
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
        pageTitle.textContent = titleText;
    }
}

// Show and Hide Purchase Form
function showPurchaseForm() {
    document.getElementById("purchaseFormSection").style.display = "block";
    document.getElementById("talkableCampaignButton").style.display = "none";
    hideTalkableOffer();
    updatePageTitle("Purchase Page");
    highlightNavButton("purchaseNav");
}

function hidePurchaseForm() {
    document.getElementById("purchaseFormSection").style.display = "none";
    document.getElementById("talkableCampaignButton").style.display = "block";
    hideTalkableOffer();
    updatePageTitle("Home Page");
    highlightNavButton("homeNav");
}

// Show and Hide Talkable Offer
function hideTalkableOffer() {
    const offerElement = document.getElementById("talkable-offer");
    if (offerElement) {
        offerElement.style.display = "none";
    }
}

function showTalkableOffer() {
    let offerElement = document.getElementById("talkable-offer");

    // If the offer element does not exist, create it
    if (!offerElement) {
        offerElement = document.createElement("div");
        offerElement.id = "talkable-offer";
        document.body.appendChild(offerElement);
    }

    // Ensure the offer is visible
    offerElement.style.display = "block";
    updatePageTitle("Standalone Page");
    highlightNavButton("standaloneNav");
}

function triggerTalkableCampaign() {
    window._talkableq.push(['authenticate_customer', {}]);
    window._talkableq.push(['register_affiliate', {}]);
    console.log("Talkable Campaign Triggered!");
}

document.addEventListener("DOMContentLoaded", function () {
    const siteId = urlParams.get("site");
    const integrationScriptSrc = urlParams.get("integration_script");

    // Display the site ID
    document.getElementById("displaySiteId").textContent = siteId;

    // Display the tkbl_integration_script value
    document.getElementById("displayIntegrationScript").textContent =
        integrationScriptSrc || "Not provided";

    // Hide the purchase form and show the campaign button initially
    hidePurchaseForm();

    // Add event listener for purchase form submission
    document
        .getElementById("purchaseForm")
        .addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent default form submission
            const email = document.getElementById("email").value;
            const orderNumber = document.getElementById("orderNumber").value;
            const subtotal = document.getElementById("subtotal").value;

            // Construct the data object for Talkable
            const data = {
                purchase: {
                    order_number: orderNumber,
                    subtotal: subtotal,
                    email: email,
                    items: [],
                },
            };

            // Submit data to Talkable
            window._talkableq.push(["register_purchase", data]);

            // Optionally, clear the form or show a success message
//            alert("Purchase registered successfully!");
            console.log("Purchase registered successfully!");

        });

    // Insert additional scripts
    insertAdditionalScripts(siteId, integrationScriptSrc);
});