// Function to fetch data from the API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.jobs;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

let page = null;
const savedJobs = JSON.parse(localStorage.getItem('fiver')) || [];

// Function to display job cards in the content container
function displayJobCards(jobs) {
    const contentContainer = document.querySelector('#contentContainer');
    contentContainer.innerHTML = '';

    if (jobs.length === 0) {
        if (page === "loadSavedJobs") {
            contentContainer.innerHTML = `
                <div class="text-center">
                    <p>No saved jobs.</p>
                </div>`;
        } else {
            contentContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading jobs...</p>
                </div>`;
        }
        return;
    }

    jobs.forEach((job, index) => {
        const saveStatus = checkElementByID(job.id) ? 'Remove job' : 'Save this JOB';
        const color = checkElementByID(job.id) ? 'danger' : 'success';

        const jobCard = document.createElement('div');
        jobCard.classList.add('job-card', 'card', 'mb-3');
        jobCard.style.width = '18rem';

        jobCard.innerHTML = `
            <img src="${job.company_logo}" class="card-img-top" style="max-width: 100%; height: auto;" alt="Company Logo">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5 class="card-title">${job.title}</h5>
                    <p class="card-text"><strong>Company:</strong> ${job.company_name}</p>
                    <p class="card-text"><strong>Location:</strong> ${job.candidate_required_location}</p>
                    <p class="card-text"><strong>Salary:</strong> ${job.salary}</p>
                </div>
                <div class="overflow-auto" style="max-height: 200px;">${job.description}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <a href="${job.url}" class="btn btn-primary mt-2">Apply</a>
                    <button id="saveButton_${job.id}" class="btn btn-${color} mt-2" onclick="updateStatus(${JSON.stringify(job).split('"').join("&quot;")})">${saveStatus}</button>
                </div>
            </div>
            <div class="card-footer">
                <p class="card-text"><strong>Type:</strong> ${job.job_type}</p>
            </div>`;
        contentContainer.appendChild(jobCard);

        if (index === 0) {
            jobCard.classList.add('active');
        }
    });
}


// Function to save a job to the local storage
function saveJob(job){
    savedJobs.push(job)
    localStorage.setItem("fiver", JSON.stringify(savedJobs))
}

// Function to remove a job from local storage
function remove(item){
    savedJobs.splice(item, 1)
    localStorage.setItem("fiver", JSON.stringify(savedJobs));

    if (page === "loadSavedJobs"){
        loadSavedJobs();
    }
}

// Function to update the save status of a job
function updateStatus(job) {
    let button = document.querySelector(`#saveButton_${job.id}`);
    if (checkElementByID(job.id)) {
        remove(job);
        button.innerText = "Save this JOB";
        button.classList = 'btn btn-success mt-2';
    } else {
        saveJob(job);
        button.innerText = "Remove job";
        button.classList = 'btn btn-danger mt-2';
    }
}

// Function to check if a job with a given ID is saved
function checkElementByID(id) {
    for (let i = 0; i < savedJobs.length; i++) {
        if (savedJobs[i].id == id) {
            return true;
        }
    }
    return false;
}

// Function to load saved jobs from local storage
function loadSavedJobs() {
    page = "loadSavedJobs";
    displayJobCards(savedJobs);
}

// Function to load categories dropdown menu
function loadCategoriesDropdown(categories) {
    const categoriesMenu = document.querySelector('#categoriesMenu');
    categoriesMenu.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('li');
        categoryItem.innerHTML = `<a class="dropdown-item" href="#" onclick="loadJobsByCategory('${category.name}')">${category.name}</a>`;
        categoriesMenu.appendChild(categoryItem);
    });
}

// Function to load the homepage
function loadHomePage() {
    page = "home";
    const contentContainer = document.querySelector('#contentContainer');
    contentContainer.innerHTML = '<h1>Welcome to Remote Jobs Site</h1>';
}

// Function to load all jobs
function loadAllJobs() {
    loadSavedJobs();
    const apiUrl = 'https://remotive.com/api/remote-jobs?limit=50';
    fetchData(apiUrl).then(jobs => displayJobCards(jobs));
    page = "AllJobs";

}

// Function to load jobs by category
function loadJobsByCategory(category) {
    const apiUrl = `https://remotive.com/api/remote-jobs?category=${category}&limit=10`;
    fetchData(apiUrl).then(jobs => displayJobCards(jobs));
}

// Function to search jobs based on user input
function searchJobs() {
    const searchInput = document.querySelector('#searchInput').value;
    const apiUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchInput)}&limit=10`;
    fetchData(apiUrl).then(jobs => displayJobCards(jobs));
}

// Load the homepage by default
loadHomePage();

// Load categories dropdown on page load
fetchData('https://remotive.com/api/remote-jobs/categories').then(categories => loadCategoriesDropdown(categories));