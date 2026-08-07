const API_BASE_URL = "http://127.0.0.1:5001";

let academyChartInstance = null;
let revenueByCourseChartInstance = null;
let monthlyRevenueChartInstance = null;
let instructorWorkloadChartInstance = null;
let divisionRevenueChartInstance = null;
let StudentsTrainedChartInstance = null;


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    loadLoggedInUser();
    displayCurrentDate();

    await loadDashboard();
    await loadPopularCourse();

    loadRevenueByCourseChart();
    loadMonthlyRevenueChart();
    loadInstructorWorkloadChart();
    loadMembershipRenewals();
    loadDivisionRevenueChart();
    loadStudentTrained();
    applyRolePermissions();

});


/* =========================================================
   MAIN DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/dashboard`
        );

        if (!response.ok) {

            throw new Error(
                `Dashboard request failed: ${response.status}`
            );
        }

        const data = await response.json();


        document.getElementById("totalStudents").textContent =
            data.total_students ?? 0;


        document.getElementById("totalCourses").textContent =
            data.total_courses ?? 0;


        document.getElementById("totalMemberships").textContent =
            data.total_memberships ?? 0;


        document.getElementById("totalPayments").textContent =
            data.total_payments ?? 0;


        document.getElementById("totalRevenue").textContent =
            Number(
                data.total_revenue ?? 0
            ).toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency: "USD"
                }
            );


        drawAcademyChart(data);

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Failed to load dashboard. Make sure Flask is running on port 5001."
        );
    }
}
async function loadInstructorWorkloadChart() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/instructor-workload`
        );

        if (!response.ok) {
            throw new Error(
                `Instructor workload failed: ${response.status}`
            );
        }

        const data = await response.json();

        const labels = data.map(
            item => item.instructor_name
        );

        const workloads = data.map(
            item => Number(item.workload || 0)
        );

        const canvas =
            document.getElementById(
                "instructorWorkloadChart"
            );

        if (!canvas) return;

        if (instructorWorkloadChartInstance) {
            instructorWorkloadChartInstance.destroy();
        }

        instructorWorkloadChartInstance =
            new Chart(canvas, {
                type: "bar",

                data: {
                    labels: labels,

                    datasets: [{
                        label: "Qualifications Assigned",
                        data: workloads,
                        borderWidth: 1
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }
                        }
                    },

                    plugins: {
                        legend: {
                            display: true
                        }
                    }
                }
            });

    } catch (error) {
        console.error(
            "Instructor workload chart error:",
            error
        );
    }
}
async function loadMembershipRenewals() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/membership-renewals`
        );

        if (!response.ok) {
            throw new Error(
                `Membership renewals failed: ${response.status}`
            );
        }

        const data = await response.json();

        const element =
            document.getElementById("renewalsDue");

        if (element) {
            element.textContent =
                Array.isArray(data) ? data.length : 0;
        }

    } catch (error) {
        console.error(
            "Membership renewals error:",
            error
        );

        const element =
            document.getElementById("renewalsDue");

        if (element) {
            element.textContent = "0";
        }
    }
}
async function loadDivisionRevenueChart() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/division-revenue`
        );

        if (!response.ok) {
            throw new Error(
                `Division revenue failed: ${response.status}`
            );
        }

        const data = await response.json();

        const labels = data.map(
            item => item.division
        );

        const revenues = data.map(
            item => Number(item.revenue || 0)
        );

        const canvas =
            document.getElementById(
                "divisionRevenueChart"
            );

        if (!canvas) return;

        if (divisionRevenueChartInstance) {
            divisionRevenueChartInstance.destroy();
        }

        divisionRevenueChartInstance =
            new Chart(canvas, {
                type: "doughnut",

                data: {
                    labels: labels,

                    datasets: [{
                        label: "Revenue by Division",
                        data: revenues,
                        borderWidth: 1
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: "bottom"
                        },

                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: $${Number(
                                        context.raw
                                    ).toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });

    } catch (error) {
        console.error(
            "Division revenue chart error:",
            error
        );
    }
}
async function loadStudentsTrained() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5001/dashboard/students-trained"
        );

        const data = await response.json();

        console.log("Students trained API:", data);

        const element =
            document.getElementById("studentsTrained");

        if (element) {
            element.textContent = data.students_trained;
        } else {
            console.error("studentsTrained HTML element not found");
        }

    } catch (error) {
        console.error("Students trained error:", error);
    }
}


/* =========================================================
   LOGGED IN USER
========================================================= */

function loadLoggedInUser() {

    const fullName =
        localStorage.getItem("full_name");

    const role =
        localStorage.getItem("role");


    const loggedUser =
        document.getElementById("loggedInUser");


    if (!loggedUser) {
        return;
    }


    if (fullName && role) {

        loggedUser.textContent =
            `${fullName} (${role})`;

    } else if (fullName) {

        loggedUser.textContent =
            fullName;

    } else {

        loggedUser.textContent =
            "Administrator";
    }
}


/* =========================================================
   CURRENT DATE
========================================================= */

function displayCurrentDate() {

    const currentDate =
        document.getElementById(
            "currentDateTime"
        );


    if (!currentDate) {
        return;
    }


    currentDate.textContent =
        new Date().toLocaleString();
}


/* =========================================================
   ACADEMY STATISTICS
========================================================= */

function drawAcademyChart(data) {

    const canvas =
        document.getElementById(
            "academyChart"
        );


    if (!canvas) {
        return;
    }


    if (academyChartInstance) {

        academyChartInstance.destroy();
    }


    academyChartInstance =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: [
                    "Students",
                    "Courses",
                    "Memberships",
                    "Payments"
                ],

                datasets: [{

                    label:
                        "Academy Statistics",

                    data: [

                        Number(
                            data.total_students ?? 0
                        ),

                        Number(
                            data.total_courses ?? 0
                        ),

                        Number(
                            data.total_memberships ?? 0
                        ),

                        Number(
                            data.total_payments ?? 0
                        )
                    ],

                    borderWidth: 1
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true,

                        position: "top"
                    }
                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0
                        }
                    }
                }
            }
        });
}


/* =========================================================
   MONTHLY REVENUE
========================================================= */

async function loadMonthlyRevenueChart() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/dashboard/revenue-chart`
        );


        if (!response.ok) {

            throw new Error(
                `Monthly revenue failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        const labels =
            data.map(
                item => item.month
            );


        const revenues =
            data.map(
                item =>
                    Number(
                        item.revenue || 0
                    )
            );


        const canvas =
            document.getElementById(
                "monthlyRevenueChart"
            );


        if (!canvas) {

            console.warn(
                "monthlyRevenueChart canvas not found"
            );

            return;
        }


        if (monthlyRevenueChartInstance) {

            monthlyRevenueChartInstance.destroy();
        }


        monthlyRevenueChartInstance =
            new Chart(canvas, {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Monthly Revenue (USD)",

                        data: revenues,

                        tension: 0.3,

                        borderWidth: 2,

                        pointRadius: 4
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function (value) {

                                        return "$" +
                                            value;
                                    }
                            }
                        }
                    },

                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return "$" +
                                            Number(
                                                context.raw
                                            ).toFixed(2);
                                    }
                            }
                        }
                    }
                }
            });

    } catch (error) {

        console.error(
            "Monthly revenue chart error:",
            error
        );
    }
}


/* =========================================================
   REVENUE BY COURSE
========================================================= */

async function loadRevenueByCourseChart() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/dashboard/revenue-by-course`
        );


        if (!response.ok) {

            throw new Error(
                `Revenue by course failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        const labels =
            data.map(
                item => item.course
            );


        const revenues =
            data.map(
                item =>
                    Number(
                        item.revenue || 0
                    )
            );


        const canvas =
            document.getElementById(
                "revenueByCourseChart"
            );


        if (!canvas) {

            console.warn(
                "revenueByCourseChart canvas not found"
            );

            return;
        }


        if (
            revenueByCourseChartInstance
        ) {

            revenueByCourseChartInstance
                .destroy();
        }


        revenueByCourseChartInstance =
            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [{

                        label:
                            "Revenue by Course (USD)",

                        data: revenues,

                        borderWidth: 1
                    }]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function (value) {

                                        return "$" +
                                            value;
                                    }
                            }
                        }
                    },

                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return "$" +
                                            Number(
                                                context.raw
                                            ).toFixed(2);
                                    }
                            }
                        }
                    }
                }
            });

    } catch (error) {

        console.error(
            "Revenue by course chart error:",
            error
        );
    }
}


/* =========================================================
   MOST POPULAR COURSE
========================================================= */

async function loadPopularCourse() {

    const courseElement =
        document.getElementById(
            "popularCourse"
        );

    const countElement =
        document.getElementById(
            "popularCourseCount"
        );


    try {

        const response = await fetch(
            `${API_BASE_URL}/dashboard/popular-course`
        );


        if (!response.ok) {

            throw new Error(
                `Popular course failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        if (courseElement) {

            courseElement.textContent =
                data.course || "None";
        }


        const studentCount =
            Number(
                data.students || 0
            );


        if (countElement) {

            countElement.textContent =
                `${studentCount} student${studentCount === 1
                    ? ""
                    : "s"
                }`;
        }

    } catch (error) {

        console.error(
            "Popular course error:",
            error
        );


        if (courseElement) {

            courseElement.textContent =
                "Unavailable";
        }


        if (countElement) {

            countElement.textContent =
                "0 students";
        }
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "full_name"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userRole"
    );


    window.location.href =
        "login.html";
}
// Load students trained separately
document.addEventListener("DOMContentLoaded", function () {
    loadStudentsTrained();
});
function applyRolePermissions() {

    const role =
        localStorage.getItem("role");

    const fullName =
        localStorage.getItem("full_name");


    // Welcome text
    const loggedUser =
        document.getElementById("loggedUser");


    if (loggedUser && fullName) {
        loggedUser.textContent =
            `Welcome ${fullName}`;
    }


    // CEO = Dashboard + Reports only
    if (role === "CEO") {

        const restrictedLinks = [
            "studentsLink",
            "coursesLink",
            "membershipsLink",
            "paymentsLink",
            "certificatesLink",
            "qualificationsLink",
            "userManagementLink"
        ];


        restrictedLinks.forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                element.style.display = "none";
            }

        });
    }
}