const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const spinner = document.getElementById("loading-spinner");

let currentPage = 1;
const totalPages = 10; // Update with real pagination from API if needed

// Show spinner
function showSpinner() {
  spinner.style.display = "block";
}

// Hide spinner
function hideSpinner() {
  spinner.style.display = "none";
}

// Fetch recipes from the API
async function fetchRecipes(query, category = "", cuisine = "", page = 1) {
  const url = `${API_URL}${query}&category=${category}&cuisine=${cuisine}&page=${page}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    alert("Something went wrong while fetching recipes. Please try again.");
    return [];
  }
}

// Display recipes on the page
function displayRecipes(recipes) {
  const recipeContainer = document.getElementById("recipe-container");
  recipeContainer.innerHTML = ""; // Clear previous results

  if (recipes.length === 0) {
    recipeContainer.innerHTML = "<p>No recipes found. Try searching for something else!</p>";
    return;
  }

  recipes.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <h3>${recipe.strMeal}</h3>
      <a href="${recipe.strSource}" target="_blank">View Recipe</a>
      <button class="save-btn">Save to Favorites</button>
      <button class="view-btn">View Details</button>
    `;

    // Add event listeners
    recipeCard.querySelector(".save-btn").addEventListener("click", () => saveFavorite(recipe));
    recipeCard.querySelector(".view-btn").addEventListener("click", () => showModal(recipe));

    // Apply fade-in effect
    setTimeout(() => recipeCard.classList.add("loaded"), 100);

    recipeContainer.appendChild(recipeCard);
  });
}

// Save favorite recipe
function saveFavorite(recipe) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push(recipe);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Show recipe details in modal
function showModal(recipe) {
  document.getElementById("modal-title").textContent = recipe.strMeal;
  document.getElementById("modal-image").src = recipe.strMealThumb;
  document.getElementById("modal-instructions").textContent = recipe.strInstructions;
  document.getElementById("recipe-modal").style.display = "flex";
}

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("recipe-modal").style.display = "none";
});

// Event listener for the search button
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("search-bar").value.trim();
  const category = document.getElementById("category-filter").value;
  const cuisine = document.getElementById("cuisine-filter").value;

  if (!query) {
    alert("Please enter a recipe name!");
    return;
  }

  showSpinner();
  const recipes = await fetchRecipes(query, category, cuisine, currentPage);
  displayRecipes(recipes);
  hideSpinner();
});

// Event listener for dark mode toggle
document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.querySelector("header").classList.toggle("dark-mode");
  document.getElementById("search-btn").classList.toggle("dark-mode");
  document.getElementById("dark-mode-toggle").classList.toggle("dark-mode");
  document.querySelector("#filters").classList.toggle("dark-mode");
});

// Handle pagination
document.getElementById("next-btn").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadRecipes();
  }
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadRecipes();
  }
});

// Load recipes based on current page
async function loadRecipes() {
  showSpinner();
  const query = document.getElementById("search-bar").value.trim();
  const category = document.getElementById("category-filter").value;
  const cuisine = document.getElementById("cuisine-filter").value;
  const recipes = await fetchRecipes(query, category, cuisine, currentPage);
  displayRecipes(recipes);
  hideSpinner();

  // Update button states
  document.getElementById("prev-btn").classList.toggle("disabled", currentPage === 1);
  document.getElementById("next-btn").classList.toggle("disabled", currentPage === totalPages);
}

// Initialize page load
document.addEventListener("DOMContentLoaded", loadRecipes);
