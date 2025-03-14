//define cohort + API base URL
const COHORT = "2502-FTB-ET-WEB-FT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}/players`;

//run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded...");

    //fetch + display puppies
    fetchAllPuppies();

    //set up event listener for adding new pup
    const form = document.getElementById("puppy-form");
    if (form) {
        form.addEventListener("submit", addNewPuppy);
    } else {
        console.warn("Form with ID 'puppy-form' not found. Skipping event listener.");
    }
});

//fetch all pups from API
async function fetchAllPuppies() {
    console.log("Trying to fetch puppies...");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) { 
            console.log("Error fetching puppies!"); 
            return;
        }

        const data = await response.json();
        console.log("Fetched Puppies Data:", data);

        //make sure I have valid array of pups before rendering
        if (data.success && data.data && Array.isArray(data.data.players)) {
            renderAllPuppies(data.data.players);
        } else {
            console.warn("API did not return an array of puppies!", data);
        }
    } catch (error) {
        console.error("Error fetching puppies:", error);
    }
}

//render all pupss in UI
function renderAllPuppies(puppyList) {
    const puppyListContainer = document.getElementById("puppy-list");

    if (!puppyListContainer) {
        console.warn("Puppy list container not found. Skipping render.");
        return;
    }

    //clear previous pups before re-rendering
    puppyListContainer.innerHTML = "";

    puppyList.forEach((puppy) => {
        const puppyCard = document.createElement("li");
        puppyCard.classList.add("puppy-card");

        //make sure each card has name, image, breed, and buttons
        puppyCard.innerHTML = `
            <h3>${puppy.name}</h3>
            <img src="${puppy.imageUrl}" alt="${puppy.breed}" onerror="this.src='https://via.placeholder.com/150'" />
            <p><strong>Breed:</strong> ${puppy.breed || "Unknown"}</p>
            <button onclick="fetchSinglePuppy(${puppy.id})">See Details</button>
            <button class="remove-button" onclick="removePuppy(${puppy.id})">Remove</button>
        `;

        puppyListContainer.appendChild(puppyCard);
    });
}

//fetch single pup's details when clicking "See Details"
async function fetchSinglePuppy(puppyId) {
    console.log(`Fetching details for puppy ID: ${puppyId}...`);
    try {
        const response = await fetch(`${API_URL}/${puppyId}`);
        if (!response.ok) { 
            console.log("Error fetching puppy details!"); 
            return;
        }

        const puppyData = await response.json();
        console.log("Fetched Puppy Details:", puppyData);

        //make sure data is valid before rendering
        if (puppyData.success && puppyData.data && puppyData.data.player) {
            renderPuppyDetails(puppyData.data.player);
        } else {
            console.warn("Puppy details are missing!", puppyData);
        }
    } catch (error) {
        console.error("Error fetching puppy details:", error);
    }
}

//add overlay for pup details pop-up
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

//show individual detailed pup details in card
function renderPuppyDetails(puppy) {
    const detailContainer = document.getElementById("puppy-detail-container");

    if (!detailContainer) {
        console.warn("Puppy detail container not found.");
        return;
    }

    //ensure details card is proportional in size
    detailContainer.innerHTML = `
        <div class="modal-content">
            <h3>${puppy.name || "No Name"}</h3>
            <img src="${puppy.imageUrl}" alt="${puppy.breed}" onerror="this.src='https://via.placeholder.com/150'" />
            <p><strong>Breed:</strong> ${puppy.breed || "Unknown"}</p>
            <button onclick="closePuppyDetails()">Close</button>
        </div>
    `;

    //show individual detailed pup cardin center
    detailContainer.style.display = "flex"; 
    overlay.style.display = "block"; 
}

//close detailed individual pup card (like closing pop-up)
function closePuppyDetails() {
    const detailContainer = document.getElementById("puppy-detail-container");
    if (detailContainer) {
        detailContainer.style.display = "none";
        overlay.style.display = "none"; 
    }
}

//add new pup 
async function addNewPuppy(event) {
    event.preventDefault(); //don't reload page!

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

    console.log("Adding new puppy:", newPuppy);
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPuppy),
        });

        if (!response.ok) { 
            console.log("Error adding puppy!"); 
            return;
        }

        console.log("Puppy added:", await response.json());

        fetchAllPuppies(); //refresh list after adding
    } catch (error) {
        console.error("Error adding puppy:", error);
    }

    document.getElementById("puppy-form").reset();
}

//remove pup
async function removePuppy(puppyId) {
    console.log(`Removing puppy ID: ${puppyId}...`);
    try {
        const response = await fetch(`${API_URL}/${puppyId}`, { method: "DELETE" });

        if (!response.ok) { 
            console.log("Error deleting puppy!"); 
            return;
        }

        console.log("Puppy removed:", puppyId);
        fetchAllPuppies(); //refresh list after removal
    } catch (error) {
        console.error("Error deleting puppy:", error);
    }
}
