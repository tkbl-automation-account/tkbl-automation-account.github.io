// app.js
document.getElementById("fileInput").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            JSZip.loadAsync(e.target.result).then(zip => {
                return zip.file("pass.json").async("string").then(data => {
                    const passData = JSON.parse(data);
                    displayPassData(passData, zip);
                    displayPassDetails(passData);
                });
            }).catch(err => {
                console.error("Error reading .pkpass file:", err);
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function displayPassData(passData, zip) {
    const passDisplay = document.getElementById("passDisplay");
    passDisplay.innerHTML = ''; // Clear previous content

    const header = document.createElement("div");
    header.className = "header";
    header.textContent = passData.organizationName || "Pass";
    passDisplay.appendChild(header);

    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = `
        <h3>${passData.description || "Wallet Pass"}</h3>
        <p><strong>Type:</strong> ${passData.passTypeIdentifier}</p>
        <p><strong>Serial No.:</strong> ${passData.serialNumber}</p>
    `;
    passDisplay.appendChild(content);

    if (passData.barcodes && passData.barcodes.length > 0) {
        const barcodeContainer = document.createElement("div");
        barcodeContainer.className = "barcode";
        const barcodeData = passData.barcodes[0].message;

        const barcodeText = document.createElement("p");
        barcodeText.textContent = `Barcode: ${barcodeData}`;
        barcodeContainer.appendChild(barcodeText);
        passDisplay.appendChild(barcodeContainer);
    }

    zip.file("icon.png").async("base64").then(base64Icon => {
        const iconImage = document.createElement("img");
        iconImage.src = "data:image/png;base64," + base64Icon;
        iconImage.style.width = "80px";
        iconImage.style.margin = "auto";
        iconImage.style.borderRadius = "10px";
        content.insertBefore(iconImage, content.firstChild);
    }).catch(() => {
        console.log("No icon available in pass.");
    });
}

function displayPassDetails(passData) {
    const passDetails = document.getElementById("passDetails");
    passDetails.innerHTML = '<h3>Pass Details</h3>';

    // Flatten and display all key-value pairs in pass.json
    for (const key in passData) {
        if (passData.hasOwnProperty(key)) {
            const field = document.createElement("div");
            field.className = "field";
            field.innerHTML = `<label>${key}:</label> <span>${JSON.stringify(passData[key])}</span>`;
            passDetails.appendChild(field);
        }
    }
}
