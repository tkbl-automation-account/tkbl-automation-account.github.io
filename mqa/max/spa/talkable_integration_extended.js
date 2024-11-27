// Extract query parameters from the URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Site and server configuration
const site_slug = "testmax-22nov2024";
const server_slug = "void";

// Initialize the dataLayer for analytics or tracking purposes
window.dataLayer = window.dataLayer || [];
dataLayer.push({
    site: site_slug,
    server: server_slug,
});

// Get the base path of the current SPA (e.g., "/mqa/max/")
const basePath = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname + "/";

// Function to insert additional scripts
function insertAdditionalScripts(siteId) {
    const server = server_slug;

    // Determine the placements script URL based on the server
    const placementsSrc =
        server !== "prod"
            ? `//talkable-labs.herokuapp.com/pl.js?lib=https://curebit-staging.s3.amazonaws.com/integration/clients/${siteId}.min.js`
            : `//talkable-labs.herokuapp.com/pl.js?lib=https://curebit.s3.amazonaws.com/integration/clients/${siteId}.min.js`;

    // Insert placements_obj script
    const placementsScript = document.createElement("script");
    placementsScript.src = placementsSrc;
    placementsScript.id = "placements_obj";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(placementsScript, s);
}

// Initial Talkable script integration
(function () {
    const tkbl = document.createElement("script");
    tkbl.type = "text/javascript";
    tkbl.async = true;
    tkbl.src = "integration_spa_fixed.js";

    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tkbl, s);
    insertAdditionalScripts(site_slug);
})();

// Helper function to get server URL
function getServer(server) {
    switch (server) {
        case "void":
            return "//void.talkable.com";
        case "bastion":
            return "//bastion.talkable.com";
        case "prod":
            return "//talkable.com";
        default:
            return server;
    }
}

// Initialize Talkable queue
window._talkableq = window._talkableq || [];
window._talkableq.unshift(["init", { site_id: site_slug, server: getServer(server_slug) }]);

// Navigation Handlers
function navigateHome() {
    window.history.pushState({}, "Home", `${basePath}`);
    document.title = "Home";
    const container = document.getElementById("page-title");
        container.innerHTML = `<h2>Home Page</h2>`;
        container.style.display = "block";
    hidePurchaseForm();
}

function navigatePurchase() {
    window.history.pushState({}, "Purchase", `${basePath}purchase`);
    document.title = "Purchase";
    showPurchaseForm();
}

function navigateStandalone() {
    window.history.pushState({}, "Standalone", `${basePath}sa`);
    document.title = "Standalone";
    const container = document.getElementById("page-title");
    container.innerHTML = `<h2>Standalone Page</h2>`;
    container.style.display = "block";
    hidePurchaseForm();
}

function navigateToProductOne() {
    window.history.pushState({}, "Product#1", `${basePath}product_one`);
    document.title = "Product#1";
    const container = document.getElementById("page-title");
    container.innerHTML = `<h2>Welcome to Product#1 Page</h2>`;
    container.style.display = "block";
    hidePurchaseForm();
}

// Show and Hide Purchase Form
function showPurchaseForm() {
    document.getElementById("purchaseFormSection").style.display = "block";
    document.getElementById("talkableCampaignButton").style.display = "none";
}

function hidePurchaseForm() {
    document.getElementById("purchaseFormSection").style.display = "none";
    document.getElementById("talkableCampaignButton").style.display = "block";
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // Display the site ID in the header
    document.getElementById("displaySiteId").textContent = site_slug;

    // Initially hide the purchase form and show the campaign button
    hidePurchaseForm();

    // Add event listener to the purchase form
    document.getElementById("purchaseForm").addEventListener("submit", function (e) {
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

        // Log success message
        console.log("Purchase registered successfully!");
    });

//    // Handle initial state based on the URL
//    const currentPath = window.location.pathname.replace(basePath, "");
//    switch (currentPath) {
//        case "purchase":
//            navigatePurchase();
//            break;
//        case "sa":
//            navigateStandalone();
//            break;
//        case "product_one":
//            navigateToProductOne();
//            break;
//        default:
//            navigateHome();
//    }
});