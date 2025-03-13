//define cohort + API base URL
const COHORT = "2502-FTB-ET-WEB-FT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}/players`;

//run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

//fetch + display list of pup
    getPuppies();

//set up event listener for adding new pup
    const form = document.getElementById("puppy-form");
    if (form) {
        form.addEventListener("submit", addPuppy);
    } else {
        console.warn("Form with ID 'puppy-form' not found. Skipping form event listener.");
    }
});

//fetch all pups from API
async function getPuppies() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch puppies");

        const data = await response.json();
        console.log("Fetched Puppies Data:", data);

//make sure we have valid array of pups before rendering
        if (data.success && data.data && Array.isArray(data.data.players)) {
            renderPuppies(data.data.players);
        } else {
            console.error("Error: API did not return an array", data);
        }
    } catch (error) {
        console.error("Error fetching puppies:", error);
    }
}

//render fetched pups in the UI
function renderPuppies(puppyList) {
    const puppyListContainer = document.getElementById("puppy-list");

    if (!puppyListContainer) {
        console.warn("Puppy list container not found. Skipping render.");
        return;
    }

//clear existing pups before re-rendering
    puppyListContainer.innerHTML = "";

    puppyList.forEach((puppy) => {
        const puppyCard = document.createElement("li");
        puppyCard.classList.add("puppy-card");

//ensure each pup card has name, image, breed and buttons for removal + details
        puppyCard.innerHTML = `
            <h3>${puppy.name}</h3>
            <img src="${puppy.imageUrl}" alt="${puppy.breed}" onerror="this.src='https://via.placeholder.com/150'" />
            <p><strong>Breed:</strong> ${puppy.breed || "Unknown"}</p>
            <button onclick="viewPuppyDetails(${puppy.id})">See Details</button>
            <button class="remove-button" onclick="removePuppy(${puppy.id})">Remove</button>
        `;

        puppyListContainer.appendChild(puppyCard);
    });
}

//fetch individual pup's details when you click on "details" button of individual card
async function viewPuppyDetails(puppyId) {
    try {
        const response = await fetch(`${API_URL}/${puppyId}`);
        if (!response.ok) throw new Error("Failed to fetch puppy details");

        const puppyData = await response.json();
        console.log("Fetched Puppy Details:", puppyData);

//make sure pup details are valid before rendering
        if (puppyData.success && puppyData.data && puppyData.data.player) {
            renderPuppyDetails(puppyData.data.player);
        } else {
            console.warn("Puppy details are missing:", puppyData);
        }
    } catch (error) {
        console.error("Error fetching puppy details:", error);
    }
}

//add overlay for individual pup's card that we want to see in detail after clicking on "details" button
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

//modify function to show detailed individual pup's card in center of page when clicked on
function renderPuppyDetails(puppy) {
    const detailContainer = document.getElementById("puppy-detail-container");

    if (!detailContainer) {
        console.warn("Puppy detail container not found.");
        return;
    }

//make sure detailed individual pup's card is size proportional to other pups cards
    detailContainer.innerHTML = `
        <div class="modal-content">
            <h3>${puppy.name || "No Name"}</h3>
            <img src="${puppy.imageUrl}" alt="${puppy.breed}" onerror="this.src='https://via.placeholder.com/150'" />
            <p><strong>Breed:</strong> ${puppy.breed || "Unknown"}</p>
            <button onclick="closePuppyDetails()">Close</button>
        </div>
    `;

//changed to flex for centering
    detailContainer.style.display = "flex"; 
//show overlay when detailed individual pup's card is being opened
    overlay.style.display = "block"; 
}

//close popped up detailed individual pup's card and remove overlay
function closePuppyDetails() {
    const detailContainer = document.getElementById("puppy-detail-container");
    if (detailContainer) {
        detailContainer.style.display = "none";
//hide overlay when card closes
        overlay.style.display = "none"; 
    }
}

//add new pup when form is submitted
async function addPuppy(event) {

//no default form submission!
    event.preventDefault();

    const name = document.getElementById("puppy-name").value.trim();
    const breed = document.getElementById("puppy-breed").value.trim();
    let imageUrl = document.getElementById("puppy-image").value.trim();

    if (!name || !breed) {
        alert("Please enter a puppy name and breed.");
        return;
    }

    if (!imageUrl) {
        imageUrl = "https://via.placeholder.com/150";
    }

    const newPuppy = { name, breed, imageUrl };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPuppy),
        });

        if (!response.ok) throw new Error("Failed to add puppy");

        console.log("Added Puppy:", await response.json());

//refresh pup list after adding new one
        getPuppies();
    } catch (error) {
        console.error("Error adding puppy:", error);
    }

//clear form after submission
    document.getElementById("puppy-form").reset();
}

//remove pup when "remove" button is clicked
async function removePuppy(puppyId) {
    try {
        const response = await fetch(`${API_URL}/${puppyId}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete puppy");

        console.log("Deleted Puppy:", puppyId);
//refresh list after deletion
        getPuppies();
    } catch (error) {
        console.error("Error deleting puppy:", error);
    }
}


