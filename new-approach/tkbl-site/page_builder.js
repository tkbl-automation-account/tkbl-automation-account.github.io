//document.getElementById("nav_buttons").onload = function() {
//    build_nav_buttons();
//};

function build_page(){
         build_integration_fields();

         var div = document.createElement("div");
         var text = document.createTextNode("Site with new values");
         div.appendChild(text);
         document.getElementsByTagName('body')[0].appendChild(div);

         populate_integration_values();

         build_nav_buttons();
 }

 function build_nav_buttons(){
          addButton("Index", 'index.html');
          addButton("SA", 'sa.html');
          addButton("EC", 'ec.html');
          addButton("Loyalty", 'loyalty.html');
          addButton("Signup", 'signup.html');
          addButton("Post Purchase", 'pp.html');
          console.log('Navigation buttons were build');
  }

 function build_integration_fields(){
    build_integration_field("Site slug: ", "site-slug");
    build_integration_field("Server: ", "server");
    build_integration_field("Integration: ", "integration-src");
 }

 function populate_integration_values(){
       document.getElementById("site-slug").value = site_data().site_slug;
       document.getElementById("server").value = site_data().server;
       document.getElementById("integration-src").value = site_data().tkbl_integration_scr;
 }

 function build_integration_field(text, input_id){
    var text = document.createTextNode(text);
    var input = document.createElement("input");
    var br = document.createElement("br");
    input.id = input_id
    input.disabled = 'true'
    var element = document.getElementById("site-values");
    element.appendChild(text);
    element.appendChild(input);
    element.appendChild(br);

 }

  function addButton(name, link){
        var li = document.createElement("li"); // <p></p>
        if(window.location.href.includes(link)){
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