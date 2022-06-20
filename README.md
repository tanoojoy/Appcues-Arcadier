# AppCues-Arcadier

Understanding this requires in-depth knowledge and experience of [Arcadier's APIs](apiv2.arcadier.com), [Arcadier's Developer Resources](https://api.arcadier.com/), and [Appcues Developer Resources](www.appcues.com)

This plugin allows your AppCues account to be connected to your Arcadier marketplace. After setting up your your account on Appcues, the JS script of this plugin will send the user GUID of the logged in user to AppCues's backend and display the correct flow specified by you.

Source code running on Admin Portal: None.

Source code running on Buyer/Seller pages: `user` -> `scripts` -> `scripts.js`

## How it works

[Line 3](https://github.com/Arcadier/appcues-x-arcadier/blob/14de8dd72c6263953ccd491141d19bfe19f67462/user/scripts/scripts.js#L3) in `scripts.js` is what identifies allows Arcadier to identify you AppCues account.

As soon as the page is ready, the script appends the following script to the page head:

```javascript
$(document).ready(function(){

    var appcues_script = document.createElement("script");
    appcues_script.src = "//fast.appcues.com/88888.js";  //this number is an identifier given to you by AppCues
    document.head.appendChild(appcues_script);

});
```
---

Next, the function ```Appcues.page();``` needs to be run. This function is defined by the script added to the page previously.

Because of the sequence of loading of plugin scripts on Arcadier pages, ```Appcues.page();``` needs to run strictly after all Arcadier's own scripts and page contents are loaded. So, it is made to run in a ```setInterval()``` function which runs only once.

5 seconds is chosen arbritrarily here to make sure everything has had time to load.

```javascript
$(document).ready(function(){

    //include AppCues script in the page
    var appcues_script = document.createElement("script");
    appcues_script.src = "//fast.appcues.com/88888.js";
    document.head.appendChild(appcues_script);

    //start an interval that will only run 5 sec after the previous line is executed
    var interval = setInterval(function(){

        //initialises AppCues
        Appcues.page();

        //stops the setInterval
        clearInterval(interval);
    }, 5000);

});
```
---

Next, the identity of the current user needs to be identified and sent to AppCues, this is done by calling the User API:
```javascript
$(document).ready(function(){

    //include AppCues script in the page
    var appcues_script = document.createElement("script");
    appcues_script.src = "//fast.appcues.com/88888.js";
    document.head.appendChild(appcues_script);

    //start an interval that will only run 5 sec after the previous line is executed
    var interval = setInterval(function(){

        //initialises AppCues
        Appcues.page();

        //get User GUID from the page HTML
        var userGuid = $("#userGuid").val();

        //get user authentication token from cookie
        var token = getCookie('webapitoken');
        
        //Arcadier API call
        var settings = {
            "url": "/api/v2/users/" + userGuid + "?includes=addresses&includes=UserLogins",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        };

        $.ajax(settings).done(function(response){
            //handle API response to send to AppCues
        }

        //stops the setInterval
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
```
---

Next the response from Arcadier API is parsed and the information required by AppCues is sent to AppCues using ```window.Appcues.identify()```

```javascript
$(document).ready(function(){

    //include AppCues script in the page
    var appcues_script = document.createElement("script");
    appcues_script.src = "//fast.appcues.com/88888.js";
    document.head.appendChild(appcues_script);

    //start an interval that will only run 5 sec after the previous line is executed
    var interval = setInterval(function(){

        //initialises AppCues
        Appcues.page();

        //get User GUID from the page HTML
        var userGuid = $("#userGuid").val();

        //get user authentication token from cookie
        var token = getCookie('webapitoken');
        
        //Arcadier API call
        var settings = {
            "url": "/api/v2/users/" + userGuid + "?includes=addresses&includes=UserLogins",
            "method": "GET",
            "headers": {
                "Authorization": "Bearer " + token
            }
        };

        $.ajax(settings).done(function(response){
            window.Appcues.identify(
                response.UserLogins[0].ProviderKey,
                {
                    email: response.Email,
                    firstName: response.FirstName,
                    lastName: response.LastName,
                    birthdate: response.DOB,
                    suburb: response.Addresses[0].City,  //Addresses[0] needs to be emphasized here because in case of many addresses, this line of code will only take the first address
                    state: response.Addresses[0].State
                }
            );
        });

        //stops the setInterval
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
```
---

That's all the plugin needs to function.

Any futher customisation is done on AppCues's dashboard like:
* Which user/groups of users see what content
* Which page URL will trigger which AppCues flow

To test if AppCues was properly installed and connected to Arcadier, just add `?hey_appcues` to any URL like so:

`https://your-marketplace.sandbox.arcadier.io/user/marketplace/dashboard?hey_appcues`