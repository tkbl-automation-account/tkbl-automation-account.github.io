//document.getElementById("nav_buttons").onload = function() {
//    build_nav_buttons();
//};

function build_page() {
    build_integration_fields();

    var div = document.createElement("div");
    // var text = document.createTextNode("Site with new values");
    // div.appendChild(text);
    document.getElementsByTagName('body')[0].appendChild(div);

    populate_integration_values();
    build_nav_buttons();
    build_integration_buttons();
}

function build_nav_buttons() {
    const query_params = '?site=' + site_data().site_slug + '&server=' + site_data().server_default + launch_campaigns_query_param();
    addButton("Index", 'index.html' + query_params);
    addButton("SA", 'sa.html' + query_params);
    addButton("EC", 'ec.html' + query_params);
    addButton("Loyalty", 'loyalty.html' + query_params);
    addButton("Signup", 'signup.html' + query_params);
    addButton("Post Purchase", 'pp.html' + query_params);
    console.log('Navigation buttons were build');
}

function launch_campaigns_query_param() {
    const launch_campaign_param = site_data().launch_campaigns;
    if (launch_campaign_param !== 'false') {
        return '&launch_campaigns=true';
    } else {
        return '&launch_campaigns=' + launch_campaign_param;
    }
}

function build_integration_fields() {
    build_integration_field("Site slug: ", "site-slug");
    build_integration_field("Server: ", "server");
    build_integration_field("Integration: ", "integration-src");
}

function populate_integration_values() {
    document.getElementById("site-slug").value = site_data().site_slug;
    document.getElementById("server").value = site_data().server;
    document.getElementById("integration-src").value = site_data().tkbl_integration_scr;
}

function build_integration_field(text, input_id) {
    var text2 = document.createTextNode(text);
    var input = document.createElement("input");
    var br = document.createElement("br");
    input.id = input_id
    input.disabled = 'true'
    var element = document.getElementById("site-values");
    element.appendChild(text2);
    element.appendChild(input);
    element.appendChild(br);
}

function build_integration_buttons() {
    create_email_input();
    add_integration_button('authenticate_customer', function () {
        authenticate_customer(document.getElementById("email_field").value)
    });
    add_integration_button('register_affiliate', function () {
        register_affiliate()
    });
    add_integration_button('show_loyalty', function () {
        show_loyalty()
    });
    add_integration_button('show_email_capture_offer', function () {
        show_email_capture_offer()
    });
    add_integration_button('register_loyalty', function () {
        register_loyalty(document.getElementById("email_field").value)
    });
}

function create_email_input() {
    var email_input = document.createElement("INPUT");
    email_input.setAttribute("type", "text");
    email_input.setAttribute("id", "email_field");
    email_input.style.margin = "10px 5px 10px 5px";
    email_input.placeholder = "Email";
    email_input.value = "default.email@gmail.com";
    var element = document.getElementById("integration_buttons");
    element.appendChild(email_input);
}

function add_integration_button(name, tlkb_function) {
    const btn = document.createElement("button");
    btn.innerHTML = name;
    btn.onclick = tlkb_function;
    btn.setAttribute("id", "integration_button");
    btn.style.margin = "10px 5px 10px 5px";
    var element = document.getElementById("integration_buttons");
    element.appendChild(btn);
}

function addButton(name, link) {
    var li = document.createElement("li");
    if (window.location.href.includes(link)) {
        li.class = 'active';
    }
    var a = document.createElement("a");
    a.href = link;
    var text = document.createTextNode(name);
    a.appendChild(text);
    li.appendChild(a);

    var element = document.getElementById("nav_buttons");
    element.appendChild(li);
}