async function loadCount(endpoint, elementId) {
    try {
        const response = await fetch(`http://127.0.0.1:5001/${endpoint}`);
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
    fetch("http://127.0.0.1:5001/students").then(r => r.json()),
    fetch("http://127.0.0.1:5001/instructors").then(r => r.json()),
    fetch("http://127.0.0.1:5001/courses").then(r => r.json()),
    fetch("http://127.0.0.1:5001/memberships").then(r => r.json()),
    fetch("http://127.0.0.1:5001/certificates").then(r => r.json()),
    fetch("http://127.0.0.1:5001/firearms_qualifications").then(r => r.json())
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