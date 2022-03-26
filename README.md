
# Blackpearl OMDB Template Generator
OMDB Thread Template Generator userscript
<!-- keep image height ~ 500px -->
![](https://i.imgur.com/bBeusE2.png)

## Requirements:
A userscript manager + installing the script
<a href="https://github.com/BlackPearl-Forum/Blackpearl-Template-Posters/raw/Omdb/script.user.js">Click to install script </a>
<small>(A userscript engine, like [Violentmonkey](https://violentmonkey.github.io/get-it/) or [Tampermonkey](https://www.tampermonkey.net/))</small>

# How To Use

### 1.
First you'll want to navigate to the one of the Movie or TV Show sections and start to post a thread.

### 2.
There are two ways of using the IMDB field. You can start typing the name of the Movie or Show and this will present you with a list to choose from. Simply click the correct one and move to the next step. If you are having trouble finding the movie you want I recommend using the IMDB ID method below.

The other method is using the IMDB ID. This starts with "tt" and has numbers after it. For example Avengers: Endgame (2019) https://www.imdb.com/title/tt4154796/ the IMDB ID would be tt4154796. So I would enter tt4154796 into the field and go to the next step.
You may also paste the link itself into the IMDB field. For example: https://www.imdb.com/title/tt4154796/ then I would continue to the next step.


### 3.
Next if you have screenshots of the specific release you're posting. Enter them here with a space inbetween each link.

For example:
        `imgur.com/image.png imgur.com/image2.png imgur.com/image3.png`

### 4.
Next, you'll want to grab the offical trailer of the movie from youtube. Usually Googling the movie name and year will give you the trailer. Paste the Youtube Link into the "Youtube Trailer" Field.

### 5.
Enter your download link. Be sure it's one of the accepted file hosts. You can see all the allowed filehosts [HERE](https://blackpearl.biz/faq/#q-which-file-hosters-are-accepted-on-the-forum)

To enter multiple download links, ensure there is a space between each of the links.

For example: 
            `downloadlink1 downloadlink2 downloadlink3`
### 6.
Enter your mediainfo. You can get mediainfo locally using [MediaInfo](https://mediaarea.net/en/MediaInfo/Download)(Use View>Text to make life easier) or through a Remote. There are two ways of getting mediainfo remotely. One is at the bottom of [This Post](https://blackpearl.biz/threads/6085/) using Google Colab. The other is using an online tool such as this [Heroku App](https://overbits.herokuapp.com/mediainfo).

### 7.
The Downcloud button is clickable(Either on or off). The only reason you would need to turn it off is if you are posting multiple links or using a [Base64 Encoded String](https://www.base64encode.org/). HideReactScore has a maximum limit of 100 and minimum of 0 (0 will not add it).
HidePosts has a maximum limit of 50 and minimum of 0(0 will not add it) You can find more about what each of these do [HERE](https://blackpearl.biz/help/bb-codes/).

### 8.
Once you have set everything up, be sure that you are in BBCode Mode ![](https://i.imgur.com/oX1AzQ4.png) and press the "Generate Template" button and the post will be copied to your clipboard and pasted onto the site. The Title will be filled out with the Name of the Movie or Show and the Year of release. You will have to add all the other required information yourself.
If you have not selected anything for the IMDB field (Either clicked on a name or entered a proper TT ID number) You will be prompted with an alert box telling you so.
