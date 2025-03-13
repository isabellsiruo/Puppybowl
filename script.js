const COHORT = "2502-FTB-ET-WEB-FT"; // Replace with your cohort code
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${COHORT}/players`;

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    // Fetch and display all puppies
    getPuppies();

    // Add event listener to the form
    const form = document.getElementById("puppy-form");
    if (form) {
        form.addEventListener("submit", addPuppy);
    } else {
        console.warn("Form with ID 'puppy-form' not found.");
    }
});

// Fetch all puppies
async function getPuppies() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch puppies");

        const data = await response.json();
        console.log("Fetched Puppies Data:", data);

        // Extracting the correct array from the response
        if (data.data && Array.isArray(data.data.players)) {
            renderPuppies(data.data.players);
        } else {
            console.error("Error: API did not return an array", data);
        }
    } catch (error) {
        console.error("Error fetching puppies:", error);
    }
}

// Render puppies in the UI
function renderPuppies(puppyList) {
    const puppyListContainer = document.getElementById("puppy-list");

    if (!puppyListContainer) {
        console.warn("Puppy list container not found.");
        return;
    }

    // Clear previous list
    puppyListContainer.innerHTML = "";

    puppyList.forEach((puppy) => {
        const puppyCard = document.createElement("li");

        puppyCard.innerHTML = `
            <h3>${puppy.name}</h3>
            <img src="${puppy.imageUrl}" alt="${puppy.breed}" onerror="this.src='https://via.placeholder.com/150'" />
            <p><strong>Breed:</strong> ${puppy.breed}</p>
            <button onclick="viewPuppyDetails('${puppy.id}')">See Details</button>
            <button class="remove-button" onclick="removePuppy('${puppy.id}')">Remove</button>
        `;

        puppyListContainer.appendChild(puppyCard);
    });
}

// View a single puppy's details
function viewPuppyDetails(puppyId) {
    const detailContainer = document.getElementById("puppy-detail-container");
    if (!detailContainer) return;

    detailContainer.innerHTML = "<p>Loading...</p>"; // Show loading state
    detailContainer.classList.remove("hidden"); // Show details section

    fetch(`${API_URL}/${puppyId}`)
        .then(response => response.json())
        .then(puppy => {
            detailContainer.innerHTML = `
                <h2>Puppy Details</h2>
                <h3>${puppy.data.name}</h3>
                <img src="${puppy.data.imageUrl}" alt="${puppy.data.breed}" onerror="this.src='https://via.placeholder.com/150'" />
                <p><strong>Breed:</strong> ${puppy.data.breed}</p>
                <button onclick="hideDetails()">Back to List</button>
            `;
        })
        .catch(error => {
            console.error("Error fetching puppy details:", error);
            detailContainer.innerHTML = "<p>Error loading details.</p>";
        });
}

// Hide details section
function hideDetails() {
    const detailContainer = document.getElementById("puppy-detail-container");
    if (detailContainer) detailContainer.classList.add("hidden");
}

// Add a new puppy
async function addPuppy(event) {
    event.preventDefault();

    const name = document.getElementById("puppy-name").value;
    const breed = document.getElementById("puppy-breed").value;
    let imageUrl = document.getElementById("puppy-image").value || "https://via.placeholder.com/150";

    const newPuppy = { name, breed, imageUrl };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPuppy),
        });

        if (!response.ok) throw new Error("Failed to add puppy");

        console.log("Added Puppy:", await response.json());

        getPuppies();
    } catch (error) {
        console.error("Error adding puppy:", error);
    }

    document.getElementById("puppy-form").reset();
}

// Remove a puppy
async function removePuppy(puppyId) {
    try {
        const response = await fetch(`${API_URL}/${puppyId}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete puppy");

        console.log("Deleted Puppy:", puppyId);
        getPuppies();
    } catch (error) {
        console.error("Error deleting puppy:", error);
    }
}
