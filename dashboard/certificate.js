const API = "https://real3st-bi-system.onrender.com";

async function loadCertificates() {
    try {
        const response = await fetch(`${API}/certificates`);

        if (!response.ok) {
            throw new Error(`Failed to load certificates: ${response.status}`);
        }

        const certificates = await response.json();
        const body = document.getElementById("certificatesBody");

        body.innerHTML = "";

        certificates.forEach((certificate) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${certificate.certificate_id}</td>
                <td>${certificate.student_id ?? ""}</td>
                <td>${certificate.course_id ?? ""}</td>
                <td>${escapeHTML(certificate.certificate_number ?? "")}</td>
                <td>${formatDate(certificate.issue_date)}</td>
                <td>${formatDate(certificate.expiry_date)}</td>
                <td>
                    <button onclick="editCertificate(${certificate.certificate_id})">
                        Edit
                    </button>

                    <button onclick="deleteCertificate(${certificate.certificate_id})">
                        Delete
                    </button>
                </td>
            `;

            row.dataset.studentId = certificate.student_id ?? "";
            row.dataset.courseId = certificate.course_id ?? "";
            row.dataset.certificateNumber =
                certificate.certificate_number ?? "";
            row.dataset.issueDate = normalizeDate(certificate.issue_date);
            row.dataset.expiryDate = normalizeDate(certificate.expiry_date);

            body.appendChild(row);
        });

    } catch (error) {
        console.error("Certificate loading error:", error);
        alert(
            "Could not load certificates. Make sure the Flask server is running."
        );
    }
}

function editCertificate(certificateId) {
    const button = document.querySelector(
        `button[onclick="editCertificate(${certificateId})"]`
    );

    if (!button) {
        alert("Could not find the selected certificate.");
        return;
    }

    const row = button.closest("tr");

    document.getElementById("certificateId").value = certificateId;
    document.getElementById("studentId").value =
        row.dataset.studentId;
    document.getElementById("courseId").value =
        row.dataset.courseId;
    document.getElementById("certificateNumber").value =
        row.dataset.certificateNumber;
    document.getElementById("issueDate").value = row.dataset.issueDate;
    document.getElementById("expiryDate").value = row.dataset.expiryDate;
}

function clearCertificateForm() {
    document.getElementById("certificateId").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("courseId").value = "";
    document.getElementById("certificateNumber").value = "";
    document.getElementById("issueDate").value = "";
    document.getElementById("expiryDate").value = "";
}

async function saveCertificate() {
    const certificateId =
        document.getElementById("certificateId").value;

    const certificate = {
        student_id:
            document.getElementById("studentId").value.trim(),

        course_id:
            document.getElementById("courseId").value.trim(),

        certificate_number:
            document
                .getElementById("certificateNumber")
                .value
                .trim(),

        issue_date: document.getElementById("issueDate").value,

        expiry_date: document.getElementById("expiryDate").value
    };

    if (
        !certificate.student_id ||
        !certificate.course_id ||
        !certificate.certificate_number ||
        !certificate.issue_date ||
        !certificate.expiry_date
    ) {
        alert("Please fill in all certificate fields.");
        return;
    }

    const url = certificateId
        ? `${API}/certificates/${certificateId}`
        : `${API}/certificates`;

    const method = certificateId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(certificate)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                result.message ||
                "Unable to save certificate."
            );
        }

        alert(result.message);

        clearCertificateForm();
        await loadCertificates();

    } catch (error) {
        console.error("Certificate save error:", error);
        alert(error.message);
    }
}

async function deleteCertificate(certificateId) {
    const confirmed = confirm(
        "Are you sure you want to delete this certificate?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/certificates/${certificateId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                result.message ||
                "Unable to delete certificate."
            );
        }

        alert(result.message);

        clearCertificateForm();
        await loadCertificates();

    } catch (error) {
        console.error("Certificate delete error:", error);
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
    const normalized = normalizeDate(value);

    if (!normalized) {
        return "";
    }

    return normalized;
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
    localStorage.removeItem("username");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");

    window.location.href = "/login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    loadCertificates();
});
