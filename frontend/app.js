const API_URL = "http://localhost:3000/api/motorcycles";

const bikeContainer = document.getElementById("bikeContainer");
const loading = document.getElementById("loading");
const noBike = document.getElementById("noBike");

const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const priceFilter = document.getElementById("priceFilter");

let motorcycles = [];


async function loadMotorcycles() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch motorcycles");
        }

        motorcycles = await response.json();

        loading.style.display = "none";

        createBrandFilter();

        displayMotorcycles(motorcycles);

    } catch (error) {

        loading.innerText = "Unable to load motorcycles.";

        console.error(error);
    }
}


function createBrandFilter() {

    const brands = [
        ...new Set(
            motorcycles
                .map(bike => bike.brand)
                .filter(Boolean)
        )
    ];

    brands.forEach(brand => {

        const option = document.createElement("option");

        option.value = brand;
        option.textContent = brand;

        brandFilter.appendChild(option);

    });
}


function displayMotorcycles(data) {

    bikeContainer.innerHTML = "";

    if (data.length === 0) {

        noBike.style.display = "block";

        return;
    }

    noBike.style.display = "none";


    data.forEach(bike => {

        const card = document.createElement("div");

        card.className = "bike-card";


        const imageName = bike.image || "default.jpg";

        const imageUrl =
            `http://localhost:3000/uploads/${imageName}`;


        card.innerHTML = `

            <img
                class="bike-image"
                src="${imageUrl}"
                alt="${bike.brand || ""} ${bike.model || ""}"
                onerror="this.src='http://localhost:3000/uploads/default.jpg'"
            >

            <div class="bike-info">

                <div class="bike-brand">
                    ${bike.brand || "Unknown Brand"}
                </div>

                <h3 class="bike-name">
                    ${bike.model || "Unknown Model"}
                </h3>

                <div class="bike-details">

                    <span class="detail">
                        ${bike.cc || "-"} CC
                    </span>

                    <span class="detail">
                        ${bike.year || "-"}
                    </span>

                    <span class="detail">
                        ${bike.color || "-"}
                    </span>

                </div>

                <div class="bike-price">
                    ৳ ${Number(bike.price || 0).toLocaleString()}
                </div>

            </div>

        `;


        bikeContainer.appendChild(card);

    });
}


function filterMotorcycles() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedBrand =
        brandFilter.value;

    const maxPrice =
        priceFilter.value;


    const filtered = motorcycles.filter(bike => {

        const fullName =
            `${bike.brand || ""} ${bike.model || ""}`
                .toLowerCase();


        const matchesSearch =
            fullName.includes(searchText);


        const matchesBrand =
            !selectedBrand ||
            bike.brand === selectedBrand;


        const matchesPrice =
            !maxPrice ||
            Number(bike.price) <= Number(maxPrice);


        return (
            matchesSearch &&
            matchesBrand &&
            matchesPrice
        );

    });


    displayMotorcycles(filtered);
}


searchInput.addEventListener(
    "input",
    filterMotorcycles
);

brandFilter.addEventListener(
    "change",
    filterMotorcycles
);

priceFilter.addEventListener(
    "change",
    filterMotorcycles
);


loadMotorcycles();