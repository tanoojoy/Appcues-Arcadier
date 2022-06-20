$(document).ready(function(){
    var appcues_script = document.createElement("script");
    appcues_script.src = "//fast.appcues.com/86899.js";
    document.head.appendChild(appcues_script);

    var interval = setInterval(function(){
        Appcues.page();

        var userGuid = $("#userGuid").val();
        var token = getCookie('webapitoken');
        
        var settings = {
            "url": "/api/v2/users/" + userGuid + "?includes=addresses&includes=UserLogins",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        };

        $.ajax(settings).done(function(response){
            var custom_fields = response.CustomFields;
            var user_role;
            for(var i=0;i<custom_fields.length;i++){
                if(custom_fields[i].Code == "kinorauserrole-L7ISxLez3b"){
                    user_role = custom_fields[i].Values[0];
                }
            }

            window.Appcues.identify(
                response.UserLogins[0].ProviderKey,
                {
                    email: response.Email,
                    firstName: response.FirstName,
                    lastName: response.LastName,
                    birthdate: response.DOB,
                    suburb: response.Addresses[0].City,
                    state: response.Addresses[0].State
                }
            );
        });

        clearInterval(interval);
    }, 5000);

    function getCookie(name){
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }
    
});