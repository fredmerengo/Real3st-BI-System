const API = "https://real3st-bi-system.onrender.com";
const API_URL = API; // legacy alias used by some dropdown loader functions

let qualificationsData = [];
let studentsData = [];
let studentsById = {};

async function loadInstructors() {
    try {
        const response = await fetch(`${API}/instructors`);

        if (!response.ok) {
            throw new Error(`Failed to load instructors: ${response.status}`);
        }

        const instructors = await response.json();

        const instructorSelect = document.getElementById("instructor");
        instructorSelect.innerHTML = '<option value="">Select Instructor</option>';

        instructors.forEach((instructor) => {
            const option = document.createElement("option");
            option.value = instructor.full_name;
            option.textContent = `${instructor.full_name} - ${instructor.specialty}`;
            instructorSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Instructor loading error:", error);
        alert("Could not load instructors.");
    }
}

async function loadStudentsDropdown() {
    try {
        const response = await fetch(`${API_URL}/students`);

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();
        const studentSelect = document.getElementById("student_id");

        studentSelect.innerHTML =
            '<option value="">Select Student</option>';

        studentsData = students;
        studentsById = {};

        students.forEach(student => {
            const id = student.id ?? student.student_id ?? "";
            const fullName = student.full_name ?? `${student.first_name || ''} ${student.last_name || ''}`.trim();
            const label = `${id} - ${fullName || ''}`.trim();

            studentsById[id] = fullName || String(id);

            const option = document.createElement("option");
            option.value = id;
            option.textContent = label;
            studentSelect.appendChild(option);
        });

        // apply any active search filter
        filterStudentOptions();

    } catch (error) {
        console.error("Student dropdown error:", error);
    }
}

async function loadQualifications() {
    try {
        const response = await fetch(
            `${API}/firearms_qualifications`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load qualifications: ${response.status}`
            );
        }

        qualificationsData = await response.json();

        const body =
            document.getElementById("qualificationsBody");

        body.innerHTML = "";

        qualificationsData.forEach((qualification) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${qualification.qualification_id}</td>

                <td>${escapeHTML(studentsById[qualification.student_id] ?? qualification.student_id ?? "")}</td>

                <td>
                    ${escapeHTML(
                qualification.qualification_name ?? ""
            )}
                </td>

                <td>
                    ${escapeHTML(
                qualification.qualification_level ?? ""
            )}
                </td>

                <td>
                    ${formatDate(
                qualification.issue_date ||
                qualification.qualification_date
            )}
                </td>

                <td>
                    ${escapeHTML(
                qualification.instructor ?? ""
            )}
                </td>

                <td>
                    <button
                        type="button"
                        onclick="editQualification(
                            ${qualification.qualification_id}
                        )"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteQualification(
                            ${qualification.qualification_id}
                        )"
                    >
                        Delete
                    </button>
                </td>
            `;

            body.appendChild(row);
        });

    } catch (error) {
        console.error("Qualification loading error:", error);

        alert(
            "Could not load qualifications. Make sure Flask is running."
        );
    }
}

function editQualification(qualificationId) {
    const qualification = qualificationsData.find(
        (item) =>
            Number(item.qualification_id) ===
            Number(qualificationId)
    );

    if (!qualification) {
        alert("Could not find the selected qualification.");
        return;
    }

    document.getElementById("qualificationId").value =
        qualification.qualification_id;

    document.getElementById("student_id").value =
        qualification.student_id ?? "";

    document.getElementById("qualificationName").value =
        qualification.qualification_name ?? "";

    document.getElementById("qualificationLevel").value =
        qualification.qualification_level ?? "";

    document.getElementById("issueDate").value =
        normalizeDate(
            qualification.issue_date ||
            qualification.qualification_date
        );

    document.getElementById("instructor").value =
        qualification.instructor ?? "";
}

function clearQualificationForm() {
    document.getElementById("qualificationId").value = "";
    document.getElementById("student_id").value = "";
    document.getElementById("qualificationName").value = "";
    document.getElementById("qualificationLevel").value = "";
    document.getElementById("issueDate").value = "";
    document.getElementById("instructor").value = "";
}

async function saveQualification() {
    const qualificationId =
        document.getElementById("qualificationId").value;

    const qualification = {
        student_id:
            document.getElementById("student_id").value.trim(),

        qualification_name:
            document
                .getElementById("qualificationName")
                .value
                .trim(),

        qualification_level:
            document.getElementById(
                "qualificationLevel"
            ).value,

        issue_date:
            document.getElementById("issueDate").value,

        instructor:
            document.getElementById("instructor").value
    };

    if (
        !qualification.student_id ||
        !qualification.qualification_name ||
        !qualification.qualification_level ||
        !qualification.issue_date ||
        !qualification.instructor
    ) {
        alert("Please fill in all qualification fields.");
        return;
    }

    const url = qualificationId
        ? `${API}/firearms_qualifications/${qualificationId}`
        : `${API}/firearms_qualifications`;

    const method = qualificationId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(qualification)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                result.message ||
                "Unable to save qualification."
            );
        }

        alert(result.message);

        clearQualificationForm();
        await loadQualifications();

    } catch (error) {
        console.error("Qualification save error:", error);
        alert(error.message);
    }
}

async function deleteQualification(qualificationId) {
    if (!confirm("Delete this qualification?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/firearms_qualifications/${qualificationId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                result.message ||
                "Unable to delete qualification."
            );
        }

        alert(result.message);

        clearQualificationForm();
        await loadQualifications();

    } catch (error) {
        console.error("Qualification delete error:", error);
        alert(error.message);
    }
}

function normalizeDate(value) {
    if (!value) {
        return "";
    }

    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const date = new Date(text);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().split("T")[0];
}

function formatDate(value) {
    return normalizeDate(value);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function filterStudentOptions() {
    const qEl = document.getElementById("student_search");
    const select = document.getElementById("student_id");

    if (!qEl || !select) return;

    const q = qEl.value.trim().toLowerCase();

    Array.from(select.options).forEach(opt => {
        // always keep the placeholder visible
        if (!opt.value) {
            opt.hidden = false;
            return;
        }

        const txt = (opt.textContent || "").toLowerCase();
        opt.hidden = q ? !txt.includes(q) : false;
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadStudentsDropdown();
    // wire up search filter after dropdown is present
    const searchEl = document.getElementById("student_search");
    if (searchEl) {
        searchEl.addEventListener("input", filterStudentOptions);
    }
    await loadInstructors();
    await loadQualifications();
});
