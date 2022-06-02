
//* API-grejer vvvvvv
const urlGeo = 'http://api.openweathermap.org/geo/1.0/direct?q=';
// urlGeo hämtar koordinater och godtar platsnamn som sökterm.
const urlWeather = 'https://api.openweathermap.org/data/2.5/weather?';
// urlWeather hämtar väderdata med latitud och longitud som söktermer.
const apiKey = 'f380121599977826ab769d5624051442';
//* API-grejer ^^^^^

//* DOM-selectors vvvvv
const form = document.querySelector('form');                    // Sökrutans container
const input = document.querySelector('input');                  // Själva sökrutan
const h1 = document.querySelector('h1');                        // Huvudrubrik
const humidity = document.querySelector('#humidityDisplay');    // Span som visar luftfuktighet
const wind = document.querySelector('#windDisplay');            // Span som visar vind
const windArrow = document.querySelector('#arrow');             // Diven som innehåller vind-pilen
const temp = document.querySelector('#tempDisplay');            // Span som visar temperatur
const feelsLike = document.querySelector('#feelsLike span');    // Span som visar "känns som" temperatur
const icon = document.querySelector('#weatherIcon');            // Pixel art bild som reflekterar vädret
const p = document.querySelector('#top p');                     // Paragrafen i mitten
const unitBtn = document.querySelector('#unitBtn');             // C/F knappen som byter enheter
//* DOM-selectors ^^^^^

//* Globala variabler
let exactTemp, feelsLikeTemp;
// Jag mötte på ett problem när jag implementerade funtkionerna "makeC" och "makeF", som ändrar mellan
// Celsius och Fahrenheit i temperatur-displayen. Jag la temperaturvärdet från API:n i tempDisplay,
// och sedan omvandlade jag tempDisplay.textContent till Fahrenheit när man tröck på knappen. 
// Sedan när man tröck på knappen igen för att ändra till Celsius igen så tog jag återigen talet i tempDisplay
// och omvandlade det till C. Problemet med denna approach var att det vara samma tal som kastades fram och tillbaka
// varje gång man tröck på knappen, och vid varje omvandling fick talet en massa decimaler som avrundades nedåt.
// Resultatet av detta var att om man tröck på knappen många gånger så sjönk temperaturen.
// Min lösning till problemet är dessa två variabler. De får temperaturvärden från funktionen getWeatherData.
// Jag gjorde om makeC och makeF så att de alltid refererar till dessa variabler, vilket innebär att 
// temperaturen förblir konstant oavsett hur många gånger man växlar mellan temperatur-enheter. 
//* Globala variabler


//* Hämtar stadens koordinater med hjälp av inputen. 
const getCoords = async () => {
    const searchTerm = input.value;                                             // searchTerm är strängen man skriver i sökrutan.
    try {                                                       
        h1.textContent = searchTerm.toUpperCase();            
        const res = await axios.get(`${urlGeo}${searchTerm}&appid=${apiKey}`);  // Söker efter koordinaterna.
        const coords = {                                                        // "Packar" koordinaterna i ett objekt.
            lon: res.data[0].lon,
            lat: res.data[0].lat
        }
        return coords;                                                          // Returnerar objektet innehållande lat & lon.
    } catch (e) {
        document.querySelector('main').style.opacity = 0;
        // Gömmer main-elementet, som innehåller allt förutom sidhuvudet med rubrik och sökfunktion.
        h1.textContent = `INVALID CITY NAME: "${searchTerm.toUpperCase()}"`;
    }
    // Prova söka på "wokweokw" eller något i sökrutan för att se hur errorhanteringen ser ut. 
}


//* Hämtar väderdata med hjälp av koordinater
const getWeatherData = async () => {
    const coords = await getCoords();           // Får koordinaterna som returnerat i getCoords().
    const res = await axios.get(`${urlWeather}lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`);
    // Raden ovanför anropar nästa API, som faktiskt hämtar väderdata. I searchqueryn ingår koordinaterna från getCoords()
    input.value = '';   // Nollställer sökrutan efter en sökning
    return res.data;    // Returnerar all väderdata.
}


//* Visar väderdata i DOM
const displayWeatherData = async () => {
    const data = await getWeatherData();                            // Hämtar väderdata från getWeatherData()
    h1.textContent += `, ${data.sys.country.toUpperCase()}`;        // Tillägger landskod (t.ex SE för Sverige) till rubriken.
    humidity.textContent = `${data.main.humidity}%`;                // Visar luftfuktighet.
    wind.textContent = `${data.wind.speed}M/S`;                     // Visar vindhastighet
    setTimeout(() => {                                              // Roterar diven med vindpilen efter 300 millisekunder.
        windArrow.style.transform = `rotate(${data.wind.deg}deg)`;  
    }, 300)

    exactTemp = data.main.temp;                                  
    feelsLikeTemp = data.main.feels_like;                        
    // Ger de globala variablerna temperaturvärden. 

    temp.textContent = `${Math.floor(exactTemp)}°C`                         // Visar temperatur
    feelsLike.textContent = `FEELS LIKE ${Math.floor(feelsLikeTemp)}°C`;    // Visar temperatur det känns som

    if (data.weather[0].main === 'Clear') {                         
        icon.style.backgroundImage = 'url(assets/sunny.png)';
        p.textContent = 'Yes! The weather is amazing right now. Take a break and get some sun on that pale face.'
    } else if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Drizzle') {
        icon.style.backgroundImage = 'url(assets/rainy.png)';
        p.textContent = 'Stay inside, you have bugs to solve anyway.'
    } else if (data.weather[0].main === 'Thunderstorm') {
        icon.style.backgroundImage = 'url(assets/thunder.png)';
        p.textContent = 'Stay inside, you have bugs to solve anyway.'
    } else if (data.weather[0].main === 'Snow') {
        icon.style.backgroundImage = 'url(assets/snow.png)';
        p.textContent = 'Stay inside, you have bugs to solve anyway.'
    } else {
        icon.style.backgroundImage = 'url(assets/cloudy.png)';
        p.textContent = 'The weather is decent but not great. You should probably keep working on those Javascript skills instead.'
    }
    // Detta är en kedja av if och else if statements som bestämmer 
    // vilken av bilderna som ska visas, beroende på vädret.

    document.querySelector('main').style.opacity = 1;       
    // Gör allting i main-elementet synligt. Det är osynligt by default eftersom det inte finns
    // någon väderinformation att visa innan man gjort sin första sökning.
}


//* Lyssnar efter submit event från sökrutan.
form.addEventListener('submit', async (e) => {
    e.preventDefault();         // Standardsätt att stoppa sidan från att laddas om när man lämnar in ett formulär. 
    displayWeatherData();       
})


//* Gör så att man kan ändra mellan Celsius och Fahrenheit
let units = 'c';    // Håller reda på vilken temperatur som visas. 

const makeF = () => {   // Gör om temperaturen till Farenheit
    const f = Math.floor((exactTemp * 9 / 5) + 32);                 // Räknar om exactTemp till farenheit.        
    const ffeelslike = Math.floor((feelsLikeTemp * 9 / 5) + 32);    // Upplevd temperatur i farenheit
    tempDisplay.textContent = `${f}°F`;                             // Visar farenheit temp
    feelsLike.textContent = `FEELS LIKE ${ffeelslike}°F`;           // Visar upplevd farenheit temp

    units = 'f';                                                    // Ändrar variablen units från 'c' till 'f'.
                                                                    // detta innebär att knappen kommer anropa 
                                                                    // makeC nästa gång man trycker.

    unitBtn.textContent = 'C';                                      // Gör så att det står C i knappen, för att indikera
                                                                    // att ett knapptryck kommer ändra till C igen.
}

const makeC = () => {                                                           
    temp.textContent = `${Math.floor(exactTemp )}°C`
    feelsLike.textContent = `FEELS LIKE ${Math.floor(feelsLikeTemp)}°C`;
    units = 'c';
    unitBtn.textContent = 'F';
    // I princip samma logik som i makeF, men istället för att konvertera temperaturen så hämtar man helt enkelt
    // värdet från exactTemp och feelsLikeTemp, som deklarerades högre upp.
}

unitBtn.addEventListener('click', () => {
    if (units === 'c') {
        makeF();
    } else {
        makeC();
    }
    // Lyssnar efter klick på enhetsknappen. Om variablen units är C, vilket den är 
    // när sidan laddas, så anropar den funktionen makeF för att ändra till Farenheit.
    // Om units !=== 'c' så innebär det att det måste vara F, och då anropar den makeC.
})

