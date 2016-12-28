// JavaScript

// Globala variabler
var myApiKey = "3ea03792d5bd5b3869036afb2bf9b8a3";	// Min Flickr API key
var flickrImgElem;	// Referens till element där bilderna ska visas
var formElem;		// Referens till sökformuläret
var pageNrElem;		// Referens till elemengtför sidnummer
var largeImgElem;	// Referens till img-element för stor bild
var captionElem;	// Referens till element för bildtext
var tags;			// Taggar som anges i sökformuläret
var pageNr;			// Aktuellt sidnummer
var imgLocationElem;	// Referens till element för bildens koordinater
var moreImgElem;		// Referens till element för fler bilder
var map;				// Objekt för kartan


// Initiering av programmet
function init() {
	flickrImgElem = document.getElementById("flickrImg");
	formElem = document.getElementById("searchForm");
	pageNrElem = document.getElementById("pageNr");
	largeImgElem = document.querySelector("#largeImg img");
	captionElem = document.querySelector("#largeImg figcaption");
	imgLocationElem = document.getElementById("imgLocation");
	moreImgElem = document.getElementById("moreImg");
	addListener(formElem.searchBtn,"click",serchImg);
	addListener(document.getElementById("prevBtn"),"click",prevPage);
	addListener(document.getElementById("nextBtn"),"click",nextPage);
	pageNr = 1;
}
addListener(window,"load",init);


// Initiera en ny sökning
function serchImg() {
	tags = formElem.tags.value;
	pageNr = 1;
	requestNewImgs();
} // End serchImg


// Ajax-begäran av nya bilder med specifik tagg
function requestNewImgs() {
	var request; // Object för Ajax-anropet
	flickrImgElem.innerHTML = "<img src='pics/progress.gif' style='border:none;'>";
	pageNrElem.innerHTML = pageNr;
	if (XMLHttpRequest) { request = new XMLHttpRequest(); } // Olika objekt (XMLHttpRequest eller ActiveXObject), beroende på webbläsare
	else if (ActiveXObject) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
	else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
    
	request.open("GET","https://api.flickr.com/services/rest/?api_key=" + myApiKey + "&method=flickr.photos.search&has_geo=1&tags=" + tags + "&per_page=5&page=" +pageNr + "&format=json&nojsoncallback=1",true);
    
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if ( (request.readyState == 4) && (request.status == 200) ) newImgs(request.responseText);
	};
} // End requestNewImgs


// Tolka svaret och visa upp bilderna med response som parameter
function newImgs(response) {
	var i;			// Loopvariabel
	var photo;		// Ett foto i svaret
	var imgUrl;		// Adress till en bild
    
	response = JSON.parse(response);
	flickrImgElem.innerHTML = "";		
	for (i=0; i < response.photos.photo.length; i++) {
        
		photo = response.photos.photo[i];
        
		imgUrl = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
        
		newElem = document.createElement("img");  //skapar nytt element
		newElem.setAttribute("src",imgUrl);
		newElem.setAttribute("data-photo",JSON.stringify(photo));
		addListener(newElem,"click",enlargeImg);
        
		flickrImgElem.appendChild(newElem);
	}
} // End newImgs


// Hämta föregående uppsättning bilder
function prevPage() {
	if (pageNr > 1) {
		pageNr--;
		requestNewImgs();
	}
} // End prevPage


// Hämta nästa uppsättning bilder
function nextPage() {
	pageNr++;
	requestNewImgs();
} // End nextPage


// Visa större bild av den som användaren klickat på
function enlargeImg() {
	var photo;		// Objekt med data om fotot
	var imgUrl;		// Adress till en bild
    
	photo = JSON.parse(this.getAttribute("data-photo"));       //textsträng till json-objekt
    
	imgUrl = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg";
    
	largeImgElem.src = imgUrl;
	captionElem.innerHTML = photo.title;
    
	requestLocation(photo.id);
} // End enlargeImg


// ----- Följande är tillägg för lab6 -----

// Ajax-begäran av plats för bilden med id som parameter
function requestLocation(id) {
    var request; // Object för Ajax-anropet
	
	if (XMLHttpRequest) { request = new XMLHttpRequest(); } // Olika objekt (XMLHttpRequest eller ActiveXObject), beroende på webbläsare
	else if (ActiveXObject) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
	else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
    
	request.open("GET","https://api.flickr.com/services/rest/?api_key=" +myApiKey+ "&method=flickr.photos.geo.getLocation&photo_id=" +id+ "&format=json&nojsoncallback=1",true);
    
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if ( (request.readyState == 4) && (request.status == 200) ) showLocation(request.responseText);
	};
	
} // End requestLocation


// Visa koordinater
function showLocation(response) {
	var i;			// Loopvariabel
	var latitude;		// fotots latitud
    var longitude       //fotots longitud
	var imgUrl;		// Adress till en bild
    
    var lat;        //latitud i numerisk form för Google Maps
    var lon;        //longitud i numerisk form för Google Maps
    
	response = JSON.parse(response);                   //textsträng till json-objekt
	imgLocationElem.innerHTML = "";	                   //tom sträng
    
    latitude = response.photo.location.latitude;        //ref till bildens latitud
    longitude = response.photo.location.longitude;       //ref till bildens longitud
     
    //skriver ut koordinaterna
    imgLocationElem.innerHTML = "<h5>Latitud: " +latitude+ "</h5><h5>Longitud: " +longitude+ "</h5>";          
     
    requestImgsByLocation(latitude,longitude);  //anrop
    
    lat = parseFloat(latitude);
    lon = parseFloat(longitude);

    
    initMap(lat,lon);       //anrop till funktionen initMap
    
    
} // End showLocation


// Ajax-begäran av nya bilder med bildens latitud och longitud som parametrar
function requestImgsByLocation(lat,lon) {
	var request; // Object för Ajax-anropet
	moreImgElem.innerHTML = "<img src='pics/progress.gif' style='border:none;'>";
    
	if (XMLHttpRequest) { request = new XMLHttpRequest(); } // Olika objekt (XMLHttpRequest eller ActiveXObject), beroende på webbläsare
	else if (ActiveXObject) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
	else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
    
	request.open("GET","https://api.flickr.com/services/rest/?api_key=" + myApiKey + "&method=flickr.photos.search&lat=" +lat+ "&lon=" +lon+ "&per_page=5&format=json&nojsoncallback=1",true);
    
	request.send(null); // Skicka begäran till servern
	request.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
		if ( (request.readyState == 4) && (request.status == 200) ) showMoreImgs(request.responseText);
	};
} // End requestImgsByLocation


// Tolka svaret och visa upp bilderna.
function showMoreImgs(response) {
	var i;			// Loopvariabel
	var photo;		// Ett foto i svaret
	var imgUrl;		// Adress till en bild
    
	response = JSON.parse(response);
	moreImgElem.innerHTML = "";		
	for (i=0; i < response.photos.photo.length; i++) {
        
		photo = response.photos.photo[i];
        
		imgUrl = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
        
		newElem = document.createElement("img");  //skapar nytt element
		newElem.setAttribute("src",imgUrl);
		newElem.setAttribute("data-photo",JSON.stringify(photo));     //json-objekt till textsträng som attribut
        
		moreImgElem.appendChild(newElem);     //"sätter fast" newElem på moreImgElem
	}
} // End showMoreImgs



// ----- Karta från Google Maps ----- Extramerit

// Skapa en karta och markeringar
function initMap(lat,lng) {
	var myMarker;         //skapar en marker
    
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{	center: {lat, lng},    //lat- och longitud för platsen
				zoom: 6,
				styles: [
					{featureType:"poi", stylers: [{visibility:"off"}]},  // Turn off points of interest.
					{featureType:"transit.station",stylers: [{visibility:"off"}]}  // Turn off bus stations, etc.
				]
			}
		);
    
		myMarker = new google.maps.Marker(            //ny instans av objektet Marker
            {
                position: {lat, lng},
                title: "Image position"
            }
         );
         
        myMarker.setMap(myMap);         //kopplar kartan till markeringen med setMap
	
} // End initMap