const urlGeo = 'http://api.openweathermap.org/geo/1.0/direct?q=';
const urlWeather = 'https://api.openweathermap.org/data/2.5/weather?';
const apiKey = 'f380121599977826ab769d5624051442';

const form = document.querySelector('form');
const input = document.querySelector('input');
const h1 = document.querySelector('h1');
const humidity = document.querySelector('#humidityDisplay');
const wind = document.querySelector('#windDisplay');
const windArrow = document.querySelector('#arrow');
const temp = document.querySelector('#tempDisplay');
const feelsLike = document.querySelector('#feelsLike span');
const icon = document.querySelector('#weatherIcon');
const p = document.querySelector('#top p');
const unitBtn = document.querySelector('#unitBtn');

let units = 'c';
let exactTemp = 0;
let feelsLikeTemp = 0;

// Hämtar stadens koordinater med hjälp av inputen. 
const getCoords = async () => {
    const searchTerm = input.value;
    try {
        h1.textContent = searchTerm.toUpperCase();
        const res = await axios.get(`${urlGeo}${searchTerm}&appid=${apiKey}`);
        const coords = {
            lon: res.data[0].lon,
            lat: res.data[0].lat
        }
        return coords;
    } catch (e) {
        document.querySelector('main').style.opacity = 0;
        h1.textContent = `INVALID CITY NAME: "${searchTerm.toUpperCase()}"`;
    }
}

const getWeatherData = async () => {
    const coords = await getCoords();
    const res = await axios.get(`${urlWeather}lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`);
    input.value = '';
    return res.data;
}

const displayWeatherData = async () => {
    const data = await getWeatherData();
    h1.textContent += `, ${data.sys.country.toUpperCase()}`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed}M/S`;
    setTimeout(() => {
        windArrow.style.transform = `rotate(${data.wind.deg}deg)`;
    }, 300)
    exactTemp = data.main.temp;
    feelsLikeTemp = data.main.feels_like;
    temp.textContent = `${Math.floor(exactTemp)}°C`
    feelsLike.textContent = `FEELS LIKE ${Math.floor(feelsLikeTemp)}°C`;


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

    document.querySelector('main').style.opacity = 1;

}


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    displayWeatherData();
})

const makeF = () => {
    const f = Math.floor((exactTemp * 9 / 5) + 32);
    const ffeelslike = Math.floor((feelsLikeTemp * 9 / 5) + 32);
    tempDisplay.textContent = `${f}°F`;
    feelsLike.textContent = `FEELS LIKE ${ffeelslike}°F`;
    units = 'f';
    unitBtn.textContent = 'C';
}
const makeC = () => {
    temp.textContent = `${Math.floor(exactTemp )}°C`
    feelsLike.textContent = `FEELS LIKE ${Math.floor(feelsLikeTemp)}°C`;
    units = 'c';
    unitBtn.textContent = 'F';
}

unitBtn.addEventListener('click', () => {
    if (units === 'c') {
        makeF();
    } else {
        makeC();
    }
})