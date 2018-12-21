
var Smile = (function() {

    // PRIVATE VARIABLES
    // The backend we'll use for Part 2. For Part 3, you'll replace this 
    // with your backend.
    // var apiUrl = 'https://smile451.herokuapp.com';  //Ruby on Rails backend
    var apiUrl = 'https://hein-warmup.herokuapp.com';    //Flask-Python backend
    //var apiUrl = 'http://localhost:5000'; //backend running on localhost

    // FINISH ME (Task 4): You can use the default smile space, but this means
    //            that your new smiles will be merged with everybody else's
    //            which can get confusing. Change this to a name that 
    //            is unlikely to be used by others. 
    var smileSpace = "jhsp"; // The smile space to use. 
                    //jonnyheinsmilespace

    var smiles; // smiles container, value set in the "start" method below
    var smileTemplateHtml; // a template for creating smiles. Read from index.html
                           // in the "start" method
    var create; // create form, value set in the "start" method below


    // PRIVATE METHODS
      
   /**
    * HTTP GET request 
    * @param  {string}   url       URL path, e.g. "/api/smiles"
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
   var makeGetRequest = function(url, onSuccess, onFailure) {
       $.ajax({
           type: 'GET',
           url: apiUrl + url,
           dataType: "json",
           success: onSuccess,
           error: onFailure
       });
   };

    /**
     * HTTP POST request
     * @param  {string}   url       URL path, e.g. "/api/smiles"
     * @param  {Object}   data      JSON data to send in request body
     * @param  {function} onSuccess   callback method to execute upon request success (200 status)
     * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
     * @return {None}
     */
    var makePostRequest = function(url, data, onSuccess, onFailure) {
        $.ajax({
            type: 'POST',
            url: apiUrl + url,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: onSuccess,
            error: onFailure
        });
    };
        
    /**
     * Insert smile into smiles container in UI
     * @param  {Object}  smile       smile JSON
     * @param  {boolean} beginning   if true, insert smile at the beginning of the list of smiles
     * @return {None}
     */
    var insertSmile = function(smile, beginning) {
        // Start with the template, make a new DOM element using jQuery
        var newElem = $(smileTemplateHtml);
        // Populate the data in the new element
        // Set the "id" attribute 
        newElem.attr('id', smile.id); 
        // Now fill in the data that we retrieved from the server
        newElem.find('.title').text(smile.title);
        // FINISH ME (Task 2): fill-in the rest of the data
        newElem.find('.story').text(smile.story);
        newElem.find('.like_count').text(smile.like_count);
        var happiness = "happiness-level-" + smile.happiness_level;
        newElem.find('.happiness-level').addClass(happiness);
        newElem.find('.created_at').text(smile.created_at);
        newElem.attr('updated_at', smile.updated_at);
        if (beginning) {
            smiles.prepend(newElem);
        } else {
            smiles.append(newElem);
        }
    };


     /**
     * Get recent smiles from API and display 10 most recent smiles
     * @return {None}
     */

/**In scripts/smiles.js, fill in the function displaySmiles to make a GET
request to our Smile server to get the most recently created 10 smiles.


You will need to show the smiles sorted in decreasing order of the
created time.
Our API by default returns smiles sorted with the most recently updated
smile first.
You'll need to pass in the right params to our API (see below for
documentation) to get the proper sorting order. 
Please be aware that requests to Heroku backends sometimes take a
few seconds to return, especially if the backend has not been
used in a while. */
    var displaySmiles = function() {
        // Prepare the AJAX handlers for success and failure

        var onSuccess = function(data) {
            /* FINISH ME (Task 2): display smiles with most recent smiles at the beginning */
            console.log(data);
            $.each(data, function(index, item) {
                $.each(item, function(key, val) {
                    insertSmile(val,true);
                }); 
            });
            
        };
        var onFailure = function() { 
            console.error('display smiles failed'); 
        };
        /* FINISH ME (Task 2): make a GET request to get recent smiles */ 
        makeGetRequest("/api/smiles?space=jhsp&count=5&order_by=created_at", onSuccess, onFailure);
    };

    /**
     * Add event handlers for clicking like.
     * @return {None}
     */
    var attachLikeHandler = function(e) {
        // Attach this handler to the 'click' action for elements with class 'like'
        smiles.on('click', '.likebtn', function(e) {
            // FINISH ME (Task 3): get the id of the smile clicked on to use in the POST request
            var myobj = $(this).parents()[2];
            var smileId = $(this).parents()[2].id;
            console.log(smileId); 
            // Prepare the AJAX handlers for success and failure
            var onSuccess = function(data) {
                /* FINISH ME (Task 3): update the like count in the UI */
                $(myobj).find(".like_count").text(data.smile.like_count)
                    
            };
            var onFailure = function() { 
                console.error('like smile error'); 
            };
            /* FINISH ME (Task 3): make a POST request to like this smile */
            makePostRequest("/api/smiles/" + smileId + "/like", smileId, onSuccess, onFailure);
        });
    };


    /**
     * Add event handlers for submitting the create form.
     * @return {None}
     */
    var attachCreateHandler = function(e) {
        // First, hide the form, initially 
        create.find('form').hide();

        // FINISH ME (Task 4): add a handler to the 'Share a smile...' button to
        //                     show the 'form' and hide to button
        create.on('click', '.create-smile', function(e) {
            create.find('form').show();
            create.find('.create-smile').hide();
            smiles.hide();
        });
        // FINISH ME (Task 4): add a handler for the 'Cancel' button to hide the form
        // and show the 'Shared a smile...' button
        create.on('click', '.cancel-link', function(e) {
            e.preventDefault ();
            create.find('form').hide();
            create.find('.create-smile').show();
            smiles.show();
        });
        // The handler for the Post button in the form
        create.on('click', '.submit-input', function (e) {
            e.preventDefault (); // Tell the browser to skip its default click action

            var smile = {}; // Prepare the smile object to send to the server

            smile.title = create.find('.title-input').val();
            if (!smile.title)
            {
                alert("ERROR: *Title* field is empty!");
                return;
            }
            else if (smile.title.length > 64)
            {
                alert("ERROR: *Title* field is too long!");
                return;
            }
            smile.story = create.find('.story-input').val();
            if (!smile.story)
            {
                alert("ERROR: *Story* field is empty!");
                return;
            }
            else if (smile.story.length > 2048)
            {
                alert("ERROR: *Story* field is too long!");
                return;
            }
            smile.happiness_level = create.find('.happinesslvl').val();
            if (smile.happiness_level == 0)
            {
                alert("ERROR: *Happiness Level* not selected!");
                return;
            }
            smile.like_count = 0;
            smile.space = smileSpace;
            
            // FINISH ME (Task 4): collect the rest of the data for the smile
            var onSuccess = function(data) {
                // FINISH ME (Task 4): insert smile at the beginning of the smiles container
                insertSmile(data.smile,true);
            };
            var onFailure = function() { 
                console.error('create smile failed'); 
            };
            
            // FINISH ME (Task 4): make a POST request to create the smile, then 
            //            hide the form and show the 'Shared a smile...' button
            makePostRequest('/api/smiles',smile, onSuccess, onFailure);
            create.find('form').hide();
            create.find('.create-smile').show();
            smiles.show();
        });

    };

    
    /**
     * Start the app by displaying the most recent smiles and attaching event handlers.
     * @return {None}
     */
    var start = function() {
        smiles = $(".smiles");
        create = $(".create");

        // Grab the first smile, to use as a template
        smileTemplateHtml = $(".smiles .smile")[0].outerHTML;
        // Delete everything from .smiles
        smiles.html('');

        displaySmiles();
        attachLikeHandler();
        attachCreateHandler();
    };
    

    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Smile.key_name, e.g. Smile.start()
    return {
        start: start
    };
    
})();
