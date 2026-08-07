const API = "http://127.0.0.1:5001";

async function loadMemberships() {

    const response = await fetch(`${API}/memberships`);
    const memberships = await response.json();

    let body = "";

    memberships.forEach(member => {

        body += `
        <tr>
            <td>${member.membership_id}</td>
            <td>${member.student_id}</td>
            <td>${member.membership_type}</td>
            <td>${member.start_date}</td>
            <td>${member.expiry_date}</td>
            <td>
                <button onclick='editMembership(${member.membership_id}, ${member.student_id}, ${JSON.stringify(member.membership_type)}, ${JSON.stringify(member.start_date)}, ${JSON.stringify(member.expiry_date)})'>Edit</button>
                <button onclick='deleteMembership(${member.membership_id})'>Delete</button>
            </td>
        </tr>
        `;
    });

    document.getElementById("membershipsBody").innerHTML = body;
}

async function saveMembership() {

    const membership = {
        student_id: document.getElementById("studentId").value,
        membership_type: document.getElementById("membershipType").value,
        start_date: document.getElementById("startDate").value,
        expiry_date: document.getElementById("expiryDate").value
    };

    const id = document.getElementById("membershipId").value;
    const isEdit = id && id.toString().trim() !== "";

    const url = isEdit ? `${API}/memberships/${id}` : `${API}/memberships`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(membership)
        });

        const result = await response.json();
        alert(result.message);

        // if edit, clear edit state
        document.getElementById("membershipId").value = "";
        document.getElementById("studentId").value = "";
        document.getElementById("membershipType").value = "";
        document.getElementById("startDate").value = "";
        document.getElementById("expiryDate").value = "";

        // reload memberships to reflect changes
        loadMemberships();
    } catch (err) {
        console.error(err);
        alert("Error saving membership.");
    }
}

function editMembership(id, studentId, membershipType, startDate, expiryDate) {
    document.getElementById("membershipId").value = id;
    document.getElementById("studentId").value = studentId;
    document.getElementById("membershipType").value = membershipType || "";
    document.getElementById("startDate").value = startDate || "";
    document.getElementById("expiryDate").value = expiryDate || "";
}

async function deleteMembership(id) {
    if (!confirm("Delete this membership?")) return;

    try {
        const response = await fetch(`${API}/memberships/${id}`, { method: "DELETE" });
        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to delete membership:", error);
            alert("Failed to delete membership.");
            return;
        }

        const result = await response.json();

        // remove row from table
        let removed = false;
        document.querySelectorAll('#membershipsBody tr').forEach(row => {
            const firstCell = row.querySelector('td');
            if (firstCell && firstCell.textContent.trim() === String(id)) {
                row.remove();
                removed = true;
            }
        });

        if (!removed) loadMemberships();

        alert(result.message);
    } catch (err) {
        console.error(err);
        alert("Error deleting membership.");
    }
}

// initial load
loadMemberships();