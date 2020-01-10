// ==UserScript==
// @name        Blackpearl IMDB
// @version     3.0.0
// @description Template Maker
// @author      Blackpearl_Team
// @icon        https://blackpearl.biz/favicon.png
// @homepage    https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/
// @supportURL  https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/issues/
// @updateURL   https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/master/script.user.js
// @downloadURL https://github.com/BlackPearl-Forum/Blackpearl-Template-Poster/raw/master/script.user.js
// @include     /^https:\/\/blackpearl\.biz\/forums\/(129|172|173|174|175|176|178|179|180|181|182|183|184|187|188|189|190|193|194|197|198|199|200|203|204|206|207|208|210|223)\/post-thread/
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

var Generate_Template = `
<button id="gmShowTemplate" name="template_button" style="display:none">Show</button>
<div id="OmdbGenerator">
<input type="text" id="hiddenIID" value="" style="display:none">
<div class="ui search">
<input type="text" class="prompt input" id="searchID" placeholder="IMDB ID or Title" onfocus="this.placeholder = ''" onblur="this.placeholder = 'IMDB ID or Title'">
<div class="results input" style="display:none"></div>
</div>
<input type="text" id="screensLinks" value="" class="input" placeholder="Screenshot Links" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Screenshot Links'">
<input type="text" id="ytLink" value="" class="input" placeholder="Youtube Trailer Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Youtube Trailer Link'">
<input type="text" id="ddl" value="" class="input" placeholder="Download Link" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Download Link'">
<textarea rows="1" style="width:100%;" class="input" id="Media_Info" placeholder="Mediainfo" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Mediainfo'"></textarea>
<div id="textarea_divider">&nbsp;</div>
<span>DownCloud</span>
<label class="switch">
<input type="checkbox" id="Downcloud" value="Downcloud" checked></input>
<span class="slider round"></span></label>
HideReactScore
<input type="number" id="HideReactScore" min="0" max="100" value="0">
HidePosts
<input type="number" id="HidePosts" min="0" max="50" value="0"> <br>
<div id="textarea_divider">&nbsp;</div>
<button id="gmGenerate" name="template_button" type="button">Generate Template</button>
<button id="gmClearBtn" name="template_button" type="reset">Clear</button>
<button id="gmHideTemplate" name="template_button" type="button">Hide</button>
</div>
`

var omdbinput = `
<button id="gmShowTemplate" name="template_button" style="display:none">Show</button>
<div id="OmdbGenerator">
<label>Enter Your OMDB API Key, Then Click On Save :)</label>
<input type="text" id="omdbKey" value="" class="input" placeholder="Omdb API Key">
<button id="gmGenerate" name="template_button" onClick="window.location.reload();" type="button">Save Key</button>
<button id="gmClearBtn" name="template_button" type="reset">Clear</button>
<button id="gmHideTemplate" name="template_button" type="button">Hide</button>
</div>
`

GM.getValue("APIKEY", "foo").then(value => { const APIVALUE = value
if (APIVALUE !== 'foo'){
    var temphtml = document.getElementsByTagName("dd")[0];
    temphtml.innerHTML += Generate_Template;
} else {
    temphtml = document.getElementsByTagName("dd")[0];
    temphtml.innerHTML += omdbinput;
}

GM.getValue("APIKEY", "foo").then(value => {
    const APIKEY = value
    var section_check = document.getElementsByClassName("p-breadcrumbs")[0].innerText;
    if (section_check.includes("TV")){
        if (section_check.includes("Cartoons") | section_check.includes("Documentaries")) {
            var query = `https://www.omdbapi.com/?apikey=${APIKEY}&r=JSON&s={query}`
            } else {
                query = `https://www.omdbapi.com/?apikey=${APIKEY}&r=JSON&s={query}&type=series`
            }
    } else if (section_check.includes("Movies")) {
        query = `https://www.omdbapi.com/?apikey=${APIKEY}&r=JSON&s={query}&type=movie`
        }
    $('.ui.search')
        .search({
        type          : 'category',
        apiSettings: {
            url: query,
            onResponse : function(myfunc) {
                var
                response = {
                    results : {}
                };
                $.each(myfunc.Search, function(index, item) {
                    var
                    category   = item.Type.toUpperCase() || 'Unknown',
                        maxResults = 10;
                    if(index >= maxResults) {
                        return false;
                    }
                    if(response.results[category] === undefined) {
                        response.results[category] = {
                            name    : "~~~~~~~~~~"+category+"~~~~~~~~~~",
                            results : []
                        };
                    }
                    var Name = item.Title +" ("+ item.Year+")";
                    response.results[category].results.push({
                        title       : Name,
                        description : Name,
                        imdbID      : item.imdbID
                    });
                });
                return response;
            }
        },
        fields: {
            results : 'results',
            title   : 'name',
        },
        onSelect: function(response){
            $('#hiddenIID').val(response.imdbID);
            $('#searchID').val(response.title);
        },
        minCharacters : 3
    });

    $(document).on('keydown', function(event) {
        if (event.key == "Escape") {
            $("#OmdbGenerator").hide ();
            document.getElementById("gmShowTemplate").style.display = "block";
        }
    });

    $("#gmHideTemplate").click ( function () {
        document.getElementById("gmShowTemplate").style.display = "block";
        $("#OmdbGenerator").hide ();
    });

    $("#gmShowTemplate").click ( function () {
        document.getElementById("gmShowTemplate").style.display = "none";
        $("#OmdbGenerator").show ();
    });
    //--- Use jQuery to activate the dialog buttons.
    $("#gmGenerate").click ( function () {
        var omdbkey = $("#omdbKey").val ();
        var IID = $("#hiddenIID").val ();
        var screenshots = $("#screensLinks").val ();
        var uToob = $("#ytLink").val ();
        var ddl = $("#ddl").val ();
        var MEDIAINFO = $("#Media_Info").val ();
        var hidereactscore = $("#HideReactScore").val ();
        var hideposts = $("#HidePosts").val ();
        if (APIKEY == "foo") {
            if (omdbkey) {
                GM.setValue("APIKEY", omdbkey);
            } else {
                alert("You Didn't Enter Your Key!!")
            }
        } else {
            if (!IID){
                IID = $("#searchID").val ();
                if (IID.includes("imdb")) {
                    IID = IID.match(/tt\d+/)[0];
                }
            }
            if (!IID) {
                alert("You Didn't Select A Title or Enter a IMDB ID!");
            } else if (!ddl) {
                alert("Uh Oh! You Forgot Your Download Link! That's Pretty Important...");
            } else if (!MEDIAINFO){
                alert("You Don't Have Any Mediainfo? It's Required!");
            } else {
                if (Downcloud.checked){
                    var ddlsplit = ddl.split(" ");
                    ddl = ''
                    for (var dls of ddlsplit) {
                        ddl += `[DOWNCLOUD]${dls}[/DOWNCLOUD]\n`;
                    }
                } else {
                    ddl = ddl.replace(/\ /g, '\n');
                }
                ddl = '[HIDEREACT=1,2,3,4,5,6]\n' + ddl + '\n[/HIDEREACT]'
                if (hidereactscore !== "0"){
                    ddl = `[HIDEREACTSCORE=${hidereactscore}]` + ddl + '[/HIDEREACTSCORE]'
                }
                if (hideposts !== "0"){
                    ddl = `[HIDEPOSTS=${hideposts}]` + ddl + '[/HIDEPOSTS]'
                }
                if (screenshots) {
                    screenshots = screenshots.split(" ");
                    var screen = `\n[hr][/hr][indent][size=6][color=rgb(250, 197, 28)][b]Screenshots[/b][/color][/size][/indent]\n [Spoiler='screenshots']`;
                    for (var ss of screenshots) {
                        screen += `[img]${ss}[/img]`;
                    }
                    screen += `[/Spoiler] \n`;
                } else {
                    screen = ""
                }
                if (uToob.match(/[a-z]/)) {
                    var trailer = `\n[hr][/hr][indent][size=6][color=rgb(250, 197, 28)][b]Trailer[/b][/color][/size][/indent]\n ${uToob}`
                    } else {
                        trailer = ""
                    }
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `http://www.omdbapi.com/?apikey=${APIKEY}&i=${IID}&plot=full&y&r=json`,
                    onload: function(response) {
                        var json = JSON.parse(response.responseText);
                        if (json.Poster && json.Poster !== "N/A"){
                            var poster = "[center][img] " + json.Poster + " [/img]\n";
                        } else {
                            poster = ''
                        }
                        if (json.Title && json.Title !== "N/A"){
                            var title = "[color=rgb(250, 197, 28)][b][size=6] " + json.Title;
                        } else {
                            alert("You Messed Up! Check That You've Entered Something Into The IMDB Field!")
                        }
                        if (json.Year && json.Year !== "N/A"){
                            var year = json.Year + ")[/size][/b][/color]\n";
                        } else {
                            year = ''
                        }
                        if (json.imdbID && json.imdbID !== "N/A"){
                            var imdb_id = "[url=https://www.imdb.com/title/" + json.imdbID + "][img]https://i.imgur.com/rcSipDw.png[/img][/url]";;
                        } else {
                            imdb_id = ''
                        }
                        if (json.imdbRating && json.imdbRating !== "N/A"){
                            var rating = "[size=6][b]" + json.imdbRating + "[/b]/10[/size]\n";
                        } else {
                            rating = ''
                        }
                        if (json.imdbVotes && json.imdbVotes !== "N/A"){
                            var imdbvotes = "[size=6][img]https://i.imgur.com/sEpKj3O.png[/img]" + json.imdbVotes + "[/size][/center]\n";
                        } else {
                            imdbvotes = ''
                        }
                        if (json.Plot && json.Plot !== "N/A"){
                            var plot = "[hr][/hr][indent][size=6][color=rgb(250, 197, 28)][b]Plot[/b][/color][/size][/indent]\n\n " + json.Plot;
                        } else {
                            plot = ''
                        }
                        if (json.Rated && json.Rated !== "N/A"){
                            var rated = "[B]Rating: [/B]" + json.Rated + "\n";
                        } else {
                            rated = ''
                        }
                        if (json.Genre && json.Genre !== "N/A"){
                            var genre = "[*][B]Genre: [/B] " + json.Genre + "\n";
                        } else {
                            genre = ''
                        }
                        if (json.Director && json.Director !== "N/A"){
                            var director = "[*][B]Directed By: [/B] " + json.Director + "\n";
                        } else {
                            director = ''
                        }
                        if (json.Writer && json.Writer !== "N/A"){
                            var writer = "[*][B]Written By: [/B] " + json.Writer + "\n";
                        } else {
                            writer = ''
                        }
                        if (json.Actors && json.Actors !== "N/A"){
                            var actors = "[*][B]Starring: [/B] " + json.Actors + "\n";
                        } else {
                            actors = ''
                        }
                        if (json.Released && json.Released !== "N/A"){
                            var released = "[*][B]Release Date: [/B] " + json.Released + "\n";
                        } else {
                            released = ''
                        }
                        if (json.Runtime && json.Runtime !== "N/A"){
                            var runtime = "[*][B]Runtime: [/B] " + json.Runtime + "\n";
                        } else {
                            runtime = ''
                        }
                        if (json.Production && json.Production !== "N/A"){
                            var production = "[*][B]Production: [/B] " + json.Production + "\n";
                        } else {
                            production = ''
                        }
                        MEDIAINFO = "[hr][/hr][indent][size=6][color=rgb(250, 197, 28)][b]Media Info[/b][/color][/size][/indent]\n [spoiler='Click here to view Media Info']\n " + MEDIAINFO + "\n[/spoiler]\n"
                        ddl = "[hr][/hr][center][size=6][color=rgb(250, 197, 28)][b]Download Link[/b][/color][/size]\n" + ddl + "\n[/center]"
                        var dump = `${poster}${title} (${year}${imdb_id} ${rating}${imdbvotes}${plot}${trailer}${screen}
[hr][/hr][indent][size=6][color=rgb(250, 197, 28)][b]Movie Info[/b][/color][/size][/indent]
[LIST][*]${rated}${genre}${director}${writer}${actors}${released}${runtime}${production}[/LIST]\n${MEDIAINFO}${ddl}`;
                        GM_setClipboard (dump);
                        try {
                            document.getElementsByName("message")[0].value = dump;
                        } catch(err) {
                            alert('You should be running this in BBCode Mode. Check the Readme for more information!\n' + err);
                        } finally {
                            var xf_title_value = document.getElementById("title").value;
                            if (!xf_title_value){
                                document.getElementById("title").value = json.Title + " (" + json.Year + ")";
                            }
                        }
                    }
                })
            }
        }
    });
});

//--- CSS styles make it work...
GM_addStyle ( "                                                   \
    @media screen and (min-width: 300px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  8px;                          \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Buttons */                                               \
      button[name=template_button] {                              \
            background-color:       #4caf50;                      \
            color:                  white;                        \
            text-align:             center;                       \
            text-decoration:        none;                         \
            display:                inline-block;                 \
            font-size:              14px;                         \
            font-weight:            600;                          \
            padding:                4px;                          \
            cursor:                 pointer;                      \
            outline:                none;                         \
            margin-right:           8px;                          \
            border:                 none;                         \
            border-radius:          3px;                          \
            border-color:           #67bd6a;                      \
            margin-top:             5px;                          \
            box-shadow:             0 0 2px 0 rgba(0,0,0,0.14),   \
                                    0 2px 2px 0 rgba(0,0,0,0.12), \
                                    0 1px 3px 0 rgba(0,0,0,0.2);  \
        }                                                         \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
      }                                                           \
      #textarea_divider {                                         \
            margin-top:             -11px;                        \
      }                                                           \
      /* Start Rounded sliders Checkboxes */                      \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
}                                                                 \
    @media screen and (min-width: 768px) {                        \
      /* Divide Buttons */                                        \
      .divider{                                                   \
            width:                  15px;                         \
            height:                 auto;                         \
            display:                inline-block;                 \
      }                                                           \
      /* Buttons */                                               \
      button[name=template_button] {                              \
            background-color:       #4caf50;                      \
            color:                  white;                        \
            text-align:             center;                       \
            text-decoration:        none;                         \
            display:                inline-block;                 \
            font-size:              15px;                         \
            font-weight:            600;                          \
            padding:                6px;                          \
            cursor:                 pointer;                      \
            outline:                none;                         \
            margin-right:           8px;                          \
            border:                 none;                         \
            border-radius:          3px;                          \
            border-color:           #67bd6a;                      \
            margin-top:             5px;                          \
            box-shadow:             0 0 2px 0 rgba(0,0,0,0.14),   \
                                    0 2px 2px 0 rgba(0,0,0,0.12), \
                                    0 1px 3px 0 rgba(0,0,0,0.2);  \
        }                                                         \
      /* Reactscore & Posts */                                    \
      input[type=number]{                                         \
            border-bottom:          2px solid teal;               \
            border-image: linear-gradient(to right, #11998e,#38ef7d);\
            border-image-slice:     1;                            \
            background:             transparent;                  \
            color:                  white;                        \
      }                                                           \
      #textarea_divider {                                         \
            margin-top:             -11px;                        \
      }                                                           \
      .switch {                                                   \
            position:               relative;                     \
            display:                inline-block;                 \
            width:                  42px;                         \
            height:                 17px;                         \
      }                                                           \
      .switch input {                                             \
            opacity:                0;                            \
            width:                  0;                            \
            height:                 0;                            \
      }                                                           \
      .slider {                                                   \
            position:               absolute;                     \
            cursor:                 pointer;                      \
            top:                    0;                            \
            left:                   0;                            \
            right:                  0;                            \
            bottom:                 0;                            \
            background-color:       #ccc;                         \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      .slider:before {                                            \
            position:               absolute;                     \
            content:                '';                           \
            height:                 13px;                         \
            width:                  13px;                         \
            left:                   2px;                          \
            bottom:                 2px;                          \
            background-color:       #42464D;                      \
            -webkit-transition:     .4s;                          \
            transition:             .4s;                          \
      }                                                           \
      input:checked + .slider {                                   \
            background-color:       #4caf50;                      \
      }                                                           \
      input:focus + .slider {                                     \
            box-shadow:             0 0 1px #4caf50;              \
      }                                                           \
      input:checked + .slider:before {                            \
            -webkit-transform:      translateX(26px);             \
            -ms-transform:          translateX(26px);             \
            transform:              translateX(26px);             \
      }                                                           \
      /* Rounded sliders */                                       \
      .slider.round {                                             \
            border-radius:          34px;                         \
      }                                                           \
      .slider.round:before {                                      \
            border-radius:          50%;                          \
      }                                                           \
}                                                                 \
")});