// JavaScript

// Globala variabler
//var myApiKey = "3ea03792d5bd5b3869036afb2bf9b8a3";	// Min Flickr API key
var myMap;				// Objekt för kartan
var myMarkers;			// Array med mina markeringar
var userMarker;			// Objekt för markering där användaren klickar

var markerData = [		// Data för markeringar som hör till knapparna
			{position:{lat:57.865312,lng:11.994844},title:"Gamla Torget"},
			{position:{lat:57.861835,lng:11.999271},title:"Bohus Fästning"},
			{position:{lat:57.874675,lng:11.977220},title:"Mimers Hus, Gymnasium"},
			{position:{lat:57.869805,lng:11.984311},title:"Trappan, Bio"},
			{position:{lat:57.869997,lng:11.993742},title:"Här bor jag"},
		];

var mapLocationElem;		// Element för utskrift av koordinater
var myApiKey = "xxx-xxx";	// Ersätt xxx-xxx med din egen Flickr API key
var flickrImgElem;			// Referens till element där bilderna ska visas

var btnElems;      //array för adressknapparna


//Initiering av programmet
function init() {
	myMarkers = [];
	initMap();

	mapLocationElem = document.getElementById("mapLocation");
	flickrImgElem = document.getElementById("flickrImg");
    
    btnElems = [];      

    //loop för att gå igenom varje plats i markeringarna i markerData  
    for(i=0; i<markerData.length; i++) {
       
        //referens för adressknapp "nr i"
       btnElems[i] = document.getElementById("addrBtns").getElementsByTagName("button")[i];
       
       btnElems[i].setAttribute("data-ix", i);      //atttributet "data-ix" får värdet "i" och läggs till varje knapp

        
       btnElems[i].innerHTML = markerData[i].title;     //i varje knapp skrivs motsvarande namn på plats
       
       addListener(btnElems[i], "click", showAddrMarker);   //anrop i varje knapp
   
   }
    
} // End init

addListener(window,"load",init);


// Skapa en karta och markeringar
function initMap() {
	var i;		// Loopvariabel
	var newMarker;	// Objekt för markering
	myMap = new google.maps.Map(
			document.getElementById('map'),
			{	center: {lat:57.869432, lng:11.974409},    //lat- och longitud för Kungälv
				zoom: 14,
				styles: [
					{featureType:"poi", stylers: [{visibility:"off"}]},  // Turn off points of interest.
					{featureType:"transit.station",stylers: [{visibility:"off"}]}  // Turn off bus stations, etc.
				]
			}
		);
    
	for (i=0; i<markerData.length; i++) {
		newMarker = new google.maps.Marker(markerData[i]);
		myMarkers.push(newMarker);    //lägger till markeringen i arrayen myMarkers
	}
    
	userMarker = new google.maps.Marker();
	google.maps.event.addListener(myMap,"click",showUserMarker);
    
} // End initMap


// Sätt markerns position till var användaren klickade och lägg in markern på kartan.
function showUserMarker(e) {
	hideMarkers();
	//userMarker.setPosition({lat:e.latLng.lat(),lng:e.latLng.lng()});
	userMarker.setPosition(e.latLng);
	userMarker.setMap(myMap);
    
    
    var lat = e.latLng.lat();        //latitud     
    var lng = e.latLng.lng();           //longitud  
                                      
    //alert(lat);
    //alert(lng); 
    
    //utskrift av latitud och longitud
    mapLocationElem.innerHTML = "<h5>Latitud : " +lat+ "</h5><h5>Longitud: " +lng+ "</h5>";                               
                                      
                                      
    requestImgsByLocation(lat,lng); //anrop med latitud och longitud som parametrar
    
} // End showUserMarker


// Visa marker för den adressknapp som användaren klickat på
function showAddrMarker() {    
    var i;          //loopvariabel
    var ix;         //index för knapp som klickats på
    hideMarkers;
    ix = this.getAttribute("data-ix");      //this = den knapp som klickats på
    
    for(i=0; i<myMarkers.length; i++) {     //går igenom arrayen myMarkers
        myMarkers[ix].setMap(myMap);        //den marker visas som indexeras av knappen som klickats på
        
    }
} // End showAddrMarker


// Dölj alla markeringar
function hideMarkers() {
	var i;	// Loopvariabel
	for (i=0; i<myMarkers.length; i++) {
		myMarkers[i].setMap(null);
	}
	userMarker.setMap(null);
} // End hideMarkers


// ----- Foton från Flickr ----- Extramerit

// Ajax-begäran av nya bilder
function requestImgsByLocation(lat,lon) {
	var request; // Object för Ajax-anropet
    
	if (XMLHttpRequest) { request = new XMLHttpRequest(); } // Olika objekt (XMLHttpRequest eller ActiveXObject), beroende på webbläsare
	else if (ActiveXObject) { request = new ActiveXObject("Microsoft.XMLHTTP"); }
	else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
    
	request.open("GET","https://api.flickr.com/services/rest/?api_key=3ea03792d5bd5b3869036afb2bf9b8a3&method=flickr.photos.search&lat=" +lat+ "&lon=" +lon+ "&per_page=3&format=json&nojsoncallback=1",true);
    
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
                                                                    // alert(response); 
                                                                // Här blev 'invalid key' om jag använde variabeln myApiKey
	response = JSON.parse(response);           //textsräng till json-objekt
    
    
	flickrImgElem.innerHTML = "";                  //tom sträng i flickrImgElem
    
	for (i=0; i<response.photos.photo.length; i++) {       
        
		photo = response.photos.photo[i];     
        
		imgUrl = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
                
		newElem = document.createElement("img");  //skapar nytt element
		newElem.setAttribute("src",imgUrl);
        
		flickrImgElem.appendChild(newElem);     //"sätter fast" newElem på flickrImgElem
	}
} // End showMoreImgs
