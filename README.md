FoodTrucksNearMe
================

Returns the list of food trucks near you!

Project Structure
-----------------

/deploy - Deploy script to push to my web host

/designs - Photoshop mock up I created when first designing the UI

/webapp - Code for the app here

Frameworks
----------

Server is written in PHP. No PHP framework was used as I self organized the code in the traditional way that I like organizing my PHP projects. A config file is used to specify global defines as well as sets up the project autoloader to lazy load classes as needed. Ajax endpoints are in the /ajax folder. All classes are in the /includes folder and each class is abstracted out to do only what it needs to do.

I chose PHP since it's the language that I am most familiar with and have the most experience with. Though I would most likely choose node.js as a close second as I am a fan of using more Javascript and the non-blocking nature of it because of the dependence on external REST endpoints.

Client is using Backbone.js to organize the code. At first I built the client in my own way (see /webapps/static/js/application.js) but I decided to go back and learn Backbone.js instead and found it quite pleasant and easy to use.

Mobile
------

I mobile optimized the UI at least for iPhone class devices using CSS media queries. Further responsive design can be added for other device classes such as higher resolution Android devices and/or tablets.

Possible Improvements
---------------------

If this project were to be scaled up and more classes/functionality added, the following tasks would be beneficial:

1. Compile all JS and CSS into one file respectively to reduce download size and cache on the browser
2. Load all JS async to increase initial page rendering speed
3. Use APC to cache the JSON from the API
4. As long as the API is fine with it, cache in memcache the business results to reduce the amount of calls we need to make and also serve as a buffer in case the API goes down

Other Code
----------

Feel free to peruse my open github projects at https://github.com/derekju. Most are prototypes of ideas or examples that I wanted to play around with such as using node.js as a traditional REST based API as well as a Websocket server (DjuChat).

I can supply code of my actual production iOS apps on the App Store on request (Study Room, Clear Countdown).

Or feel free to check out the marketing sites for them (super simple though but self designed):

http://www.studyroomapp.com
http://www.clearcountdownapp.com

LinkedIn
--------

http://www.linkedin.com/profile/view?id=55273250
