console.log("student.js loaded");
const API = "http://127.0.0.1:5001";

async function loadStudents() {
    try {
        const response = await fetch(`${API}/students`);
        const students = await response.json();

        const tbody = document.getElementById("studentsBody");
        tbody.innerHTML = "";

        students.forEach(student => {
            tbody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>${student.phone}</td>
                    <td>
                        <button onclick='editStudent(${student.id}, ${JSON.stringify(student.first_name)}, ${JSON.stringify(student.last_name)}, ${JSON.stringify(student.gender)}, ${JSON.stringify(student.date_of_birth)}, ${JSON.stringify(student.email)}, ${JSON.stringify(student.phone)}, ${JSON.stringify(student.address)})'>Edit</button>
                        <button onclick='deleteStudent(${student.id})'>Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;

    try {
        const response = await fetch(`${API}/students/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Student deleted.");
            loadStudents();
        } else {
            alert("Delete failed.");
        }

    } catch (error) {
        console.error(error);
    }
}

window.onload = loadStudents;
async function addStudent() {

    const student = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        gender: document.getElementById("gender").value,
        date_of_birth: document.getElementById("date_of_birth").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value
    };

    const response = await fetch("http://127.0.0.1:5001/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    });

    if (response.ok) {
        alert("Student added successfully!");
        loadStudents();
    } else {
        alert("Failed to add student.");
    }
}
let selectedStudentId = null;

function editStudent(id, firstName, lastName, gender, dateOfBirth, email, phone, address) {
    selectedStudentId = id;

    document.getElementById("first_name").value = firstName;
    document.getElementById("last_name").value = lastName;
    document.getElementById("gender").value = gender;
    document.getElementById("date_of_birth").value = dateOfBirth;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    document.getElementById("address").value = address;
}
async function updateStudent() {
    if (!selectedStudentId) {
        alert("Select a student first.");
        return;
    }

    const student = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        gender: document.getElementById("gender").value,
        date_of_birth: document.getElementById("date_of_birth").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value
    };

    const response = await fetch(`http://127.0.0.1:5001/students/${selectedStudentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    });

    if (response.ok) {
        alert("Student updated successfully!");
        loadStudents();
    } else {
        alert("Update failed.");
    }
}