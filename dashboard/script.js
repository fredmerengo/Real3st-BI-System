const API_BASE_URL = "https://real3st-bi-system.onrender.com";

async function loadCount(endpoint, elementId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        const data = await response.json();
        document.getElementById(elementId).textContent = data.length;
    } catch (error) {
        console.error(`Error loading ${endpoint}:`, error);
        document.getElementById(elementId).textContent = "Error";
    }
}

loadCount("students", "students");
loadCount("instructors", "instructors");
loadCount("courses", "courses");
loadCount("memberships", "memberships");
loadCount("certificates", "certificates");
loadCount("firearms_qualifications", "qualifications");
Promise.all([
    fetch(`${API_BASE_URL}/students`).then(r => r.json()),
    fetch(`${API_BASE_URL}/instructors`).then(r => r.json()),
    fetch(`${API_BASE_URL}/courses`).then(r => r.json()),
    fetch(`${API_BASE_URL}/memberships`).then(r => r.json()),
    fetch(`${API_BASE_URL}/certificates`).then(r => r.json()),
    fetch(`${API_BASE_URL}/firearms_qualifications`).then(r => r.json())
]).then(data => {

    const counts = data.map(item => item.length);

    const ctx = document.getElementById("academyChart");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Students",
                "Instructors",
                "Courses",
                "Memberships",
                "Certificates",
                "Qualifications"
            ],
            datasets: [{
                label: "Records",
                data: counts
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

});
