 const searchForm = document.querySelector('.search-form');
const nav = document.querySelector(".list");
const navOpen = document.querySelector(".List-open");
const navclose = document.querySelector(".close-list");
const container = document.querySelector('.resultes');

navOpen.onclick = () => {
    ShowNav();
}
navclose.onclick = () => {
    ShowNav();
}
if(window.location.href.includes("home")){
    document.querySelector(".explore-btn").onclick = ()=>{
        document.getElementById('explore').scrollIntoView(true);
    } 
    
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        const query = e.target.searchInput.value;
        e.target.searchInput.value = "";
        document.querySelector('.load').classList.toggle('hide')
        container.innerHTML = "";
        search(query);
    }
}
    
if(window.location.href.includes("contact")){ 
    const contactform = document.querySelector('.contact-form');
    if (contactform) {
        contactform.onsubmit = (e) => {
            e.preventDefault();
            const userInfo = {
                name: e.target.name.value,
                email: e.target.email.value,
                message: e.target.desc.value
            };
            
            // Validate fields
            for (let key in userInfo) {
                if (userInfo[key].trim() === "") {
                    createModule("Please fill in all fields");
                    return;
                }
            }
            
            console.log(userInfo);
            
            // Clear form fields
            e.target.name.value = "";
            e.target.email.value = "";
            e.target.desc.value = "";
            
            // Show confirmation message
            createModule(`Thank you, <span>${userInfo.name}</span>! Your message has been received. We'll get back to you shortly.`);
        };
    }
}

function ShowNav() {
    nav.classList.toggle('show-list');
    document.querySelector(".overly").classList.toggle("hide");
}

// Function to reduce image quality
async function reduceImageQuality(imageUrl, quality = 0.5) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match the image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to a lower quality JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', quality); // Adjust quality here
            resolve(dataUrl);
        };
        
        img.onerror = (error) => {
            reject(error);
        };
    });
}

async function search(keyword) {
    try {
        const responsse = await axios.get('./database.json');
        const data = responsse.data;

        if (data) {
            container.innerHTML = await DisplayData(data, keyword);
        }

    } catch (error) {
        console.log(error.message);
        document.querySelector('.load').classList.toggle('hide'); // Ensure loading is stopped on error
    }
}

async function DisplayData(arry, query) {
    const resultes = [];
    const lowerCaseQuery = query.toLowerCase();

    for (const country of arry.countries) {
        for (const city of country.cities) {
            if (
                city.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery)) ||
                city.description.toLowerCase().includes(lowerCaseQuery) ||
                city.name.toLowerCase().includes(lowerCaseQuery) ||
                country.country.toLowerCase().includes(lowerCaseQuery)
            ) {
                // Process image with reduced quality
                const lowQualityImageUrl = await reduceImageQuality(city.imageUrl, 0.2);

                const htmlCode = `
                    <div class="element">
                        <div class="img">
                            <img src="${lowQualityImageUrl}" alt="${city.name}">
                        </div>
                        <div class="info">
                            <div class="title">
                                <h4>${city.name}</h4>
                            </div>
                            <p class="desc">${city.description}</p>
                        </div>
                    </div>`;
                resultes.push(htmlCode);
            }
        }
    }

    document.querySelector('.load').classList.toggle('hide'); // Toggle loading indicator

    if (resultes.length === 0) {
        createModule(`couldn't find <span>${query}</span>`);
        return "";
    } else {
        return resultes.join("");
    }
}

function createModule(content) {
    const el = document.createElement("div");
    el.classList.add("module");
    el.innerHTML = `<p>${content}</p>`;
    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 4000);
}

