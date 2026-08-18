const API = "https://real3st-bi-system.onrender.com";

async function loadCourses() {
    const response = await fetch(`${API}/courses`);
    const courses = await response.json();

    let body = "";

    courses.forEach(course => {
        const durationHours = course.duration_hours ?? course.duration_days ?? course.duration ?? '';
        body += `
        <tr>
            <td>${course.course_id}</td>
            <td>${course.course_name}</td>
            <td>${course.category || ''}</td>
            <td>${durationHours} hrs</td>
            <td>$${Number(course.price).toFixed(2)}</td>
            <td>
                <button onclick='editCourse(${course.course_id}, ${JSON.stringify(course.course_name)}, ${JSON.stringify(course.category)}, ${durationHours}, ${course.price})'>
                    Edit
                </button>
                <button onclick='deleteCourse(${course.course_id})'>
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    document.getElementById("coursesBody").innerHTML = body;
}

function editCourse(id, name, category, duration, price) {
    document.getElementById("courseId").value = id;
    document.getElementById("courseName").value = name;
    document.getElementById("category").value = category || '';
    document.getElementById("duration").value = duration;
    document.getElementById("price").value = price;
}

async function saveCourse() {

    const category = document.getElementById("category").value;

    const course = {
        course_name: document.getElementById("courseName").value,
        category: category,
        duration_days: document.getElementById("duration").value,
        price: document.getElementById("price").value
    };
    const id = document.getElementById("courseId").value;
    const isEdit = id && id.toString().trim() !== "";

    const url = isEdit ? `${API}/courses/${id}` : `${API}/courses`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(course)
        });

        const result = await response.json();

        alert(result.message);

        // clear edit state
        document.getElementById("courseId").value = "";

        loadCourses();

    } catch (error) {
        console.error(error);
        alert("Error saving course.");
    }
}

async function deleteCourse(id) {
    if (!confirm("Delete this course?")) return;
    const response = await fetch(`${API}/courses/${id}`, { method: "DELETE" });
    if (!response.ok) {
        const error = await response.text();
        console.error("Failed to delete course:", error);
        alert("Failed to delete course.");
        return;
    }

    // remove the row for this course from the table without reloading everything
    const result = await response.json();

    let removed = false;
    document.querySelectorAll('#coursesBody tr').forEach(row => {
        const firstCell = row.querySelector('td');
        if (firstCell && firstCell.textContent.trim() === String(id)) {
            row.remove();
            removed = true;
        }
    });

    if (!removed) {
        // fallback: reload list if row not found
        loadCourses();
    }

    alert(result.message);
}

loadCourses();
