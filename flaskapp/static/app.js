let map;

//main function
function initMap() {

    // fetching information from stations app.py flask page
    // to add to the directions map information, markers locations and info windows.
    fetch("/stations").then(response => {
        return response.json();

    }).then(data => {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 53.349804, lng: -6.260310},
      zoom: 14,

    });

    //this is the code for adding current location of the user into the drop list but it is commented out since we dont have
        // the website running on https yet.
    // navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //         const pos = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude,
    //         };
    //
    //         var originDropDown = document.getElementById("start");
    //         var opt = document.createElement("option");
    //
    //         opt.value= [pos.lat, pos.lng];
    //         opt.innerHTML = "User's Current Location";
    //
    //         originDropDown.add(opt);
    //         // console.log(pos.lng);
    //     });

        // direction service values and set onto the map
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // function call on the cal of route when an event listener sees a change in the
        // drop lists for the stations of end and start
    const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
    };
    document.getElementById("start").addEventListener("change", onChangeHandler);
    document.getElementById("end").addEventListener("change", onChangeHandler);

    //the list is initialised
    citySelect();

    // this for loop is used to create and style the circles around the markers
        // they are a tell for how many bikes are available.
    data.forEach(stations => {
        if(stations.available_bikes > 5){
            let cityCircleAvail = new google.maps.Circle({
              strokeColor: "#00CC00",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#00CC00",
              fillOpacity: 0.35,
              map,
              center: { lat: stations.pos_lat, lng: stations.pos_lng },
              radius: 50,
        });
        } else if(stations.available_bikes <= 5 && stations.available_bikes > 0){
            let cityCircleAlmost = new google.maps.Circle({
              strokeColor: "#ffa500",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#ffa500",
              fillOpacity: 0.35,
              map,
              center: { lat: stations.pos_lat, lng: stations.pos_lng },
              radius: 50,
            });
        } else {
            let cityCircleNotAvail = new google.maps.Circle({
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              map,
              center: { lat: stations.pos_lat, lng: stations.pos_lng },
              radius: 50,
            });
        }
        //this is where the station markers is defined and styled
        const marker = new google.maps.Marker({
            position: { lat: stations.pos_lat, lng: stations.pos_lng },
            map: map,
            icon: {url: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"}


        });

        marker.addListener("click", () => {
            const infowindow = new google.maps.InfoWindow({

                content: '<h5>'+stations.name+'</h5><p> Available Stands: '+stations.available_bike_stands+
                '<br>Available Bikes: '+stations.available_bikes+'</p>',

            });
            infowindow.open(map,marker);

        });
    });

    }).catch(err => {
      console.log("OOPS!", err);
    });
}

// this function is from the google apo and it takes care of the query of calculating the distance
// between the start and end chosen values.
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService.route(
    {
      origin: {
        query: document.getElementById("start").value,
      },
      destination: {
        query: document.getElementById("end").value,
      },
      travelMode: google.maps.TravelMode.BICYCLING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

// this function work with stationlist page from flask app.py where the query requests
// the station names in alphabetical order and it populates the end and start list.
function citySelect(){

    fetch("/stationList").then(result => {
        return result.json();
    }).then(another => {
        // console.log("anotherone: ", another);
            another.forEach(station =>{

                var originDropDown = document.getElementById("start");
                var opt = document.createElement("option");

                opt.value= [station.pos_lat,station.pos_lng];
                opt.innerHTML = station.name;

                originDropDown.add(opt);

                var EndDropDown = document.getElementById("end");
                var opt = document.createElement("option");

                opt.value= [station.pos_lat,station.pos_lng];
                opt.innerHTML = station.name;

                EndDropDown.add(opt);

    });
    });
    // the current location is hardcoded here since the website is not over https yet
    // the code to populate the geolocation of the user is above in initMap() function.

    var originDropDown = document.getElementById("start");
    var opt2 = document.createElement("option");

    opt2.value= [53.349804, -6.260310];
    opt2.innerHTML = "User's Current Location";
    originDropDown.add(opt2);

}


//Weather
//SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value");
const descElement = document.querySelector(".temperature-description");

const locationElement = document.querySelector(".location");
const notificationElement = document.querySelector(".notification");
const windSpeedElement = document.querySelector(".notification");

//APP DATA
const weather = {};
weather.temperature = {
   unit: "celsius"
}


//Get weather from API
//window.onload = function getWeather(){
function weatherBallon(){

     fetch("/weather").then(response => {
         let weatherData =  response.json();
         return weatherData;
     })
         .then(function(weatherData){

              weather.temperature = parseInt(weatherData[0].temp);
             weather.description = weatherData[0].description;
            weather.iconId = weatherData[0].icon;
             weather.windSpeed = weatherData[0].wind_speed;
             //console.log(weatherData);
         })
         .then(function(weatherData){
             displayWeather();
          //   console.log(weatherData);
         })
}
window.onload = function() {
    weatherBallon();
}



//DISPLAY WEATHER TO UI
function displayWeather() {
    iconElement.innerHTML = `<img src="/static/icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML = `${weather.temperature}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = "Dublin";
    descElement.innerHTML = weather.description;


}



