const API_BASE_URL = "http://127.0.0.1:5001";

let paymentsData = [];

document.addEventListener("DOMContentLoaded", async () => {
    setTodayDate();

    await Promise.all([
        loadStudentsDropdown(),
        loadCoursesDropdown()
    ]);

    await loadPayments();
});

function setTodayDate() {
    const paymentDateInput =
        document.getElementById("paymentDate");

    if (!paymentDateInput.value) {
        const today = new Date();

        paymentDateInput.value =
            today.toISOString().split("T")[0];
    }
}

async function loadStudentsDropdown() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/students`
        );

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();

        const studentSelect =
            document.getElementById("studentId");

        studentSelect.innerHTML =
            '<option value="">Select Student</option>';

        students.forEach(student => {
            const studentId =
                student.student_id ?? student.id;

            const studentName =
                student.full_name ??
                student.name ??
                student.email ??
                `Student ${studentId}`;

            const option =
                document.createElement("option");

            option.value = studentId;
            option.textContent =
                `${studentId} - ${studentName}`;

            studentSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Student dropdown error:", error);

        showMessage(
            "Could not load students.",
            "error"
        );
    }
}

async function loadCoursesDropdown() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/courses`
        );

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();

        const courseSelect =
            document.getElementById("courseId");

        courseSelect.innerHTML =
            '<option value="">Select Course</option>';

        courses.forEach(course => {
            const option =
                document.createElement("option");

            option.value = course.course_id;

            const price = Number(
                course.price || 0
            ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD"
            });

            option.textContent =
                `${course.course_name} - ${price}`;

            option.dataset.price =
                Number(course.price || 0);

            courseSelect.appendChild(option);
        });

        courseSelect.addEventListener(
            "change",
            fillCoursePrice
        );

    } catch (error) {
        console.error("Course dropdown error:", error);

        showMessage(
            "Could not load courses.",
            "error"
        );
    }
}

function fillCoursePrice() {
    const courseSelect =
        document.getElementById("courseId");

    const selectedOption =
        courseSelect.options[
        courseSelect.selectedIndex
        ];

    if (
        selectedOption &&
        selectedOption.dataset.price
    ) {
        document.getElementById("amount").value =
            selectedOption.dataset.price;
    }
}

async function loadPayments() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/payments`
        );

        if (!response.ok) {
            throw new Error(
                `Failed with status ${response.status}`
            );
        }

        const data = await response.json();

        paymentsData =
            Array.isArray(data) ? data : [];

        renderPayments(paymentsData);
        updatePaymentSummary(paymentsData);

    } catch (error) {
        console.error("Load payments error:", error);

        paymentsData = [];

        renderPayments([]);
        updatePaymentSummary([]);

        showMessage(
            "Could not load payments. Check your Flask server.",
            "error"
        );
    }
}

function renderPayments(payments) {
    const tableBody =
        document.getElementById("paymentsTableBody");

    if (!payments.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No payment records found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = payments
        .map(payment => {
            const amount = Number(
                payment.amount || 0
            ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD"
            });

            return `
                <tr>
                    <td>
                        ${escapeHtml(payment.payment_id)}
                    </td>

                    <td>
                        ${escapeHtml(
                payment.student_name ??
                payment.student_id
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                payment.course_name ?? "—"
            )}
                    </td>

                    <td>${amount}</td>

                    <td>
                        ${escapeHtml(
                payment.payment_method
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                payment.payment_date
            )}
                    </td>

                    <td>
                        ${escapeHtml(payment.status)}
                    </td>

                    <td>
                        <div class="action-buttons">

                            <button
                                class="edit-btn"
                                onclick="editPayment(
                                    ${payment.payment_id}
                                )"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deletePayment(
                                    ${payment.payment_id}
                                )"
                            >
                                Delete
                            </button>

                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

async function savePayment() {
    const paymentId =
        document.getElementById("paymentId").value;

    const studentId =
        document.getElementById("studentId").value;

    const courseId =
        document.getElementById("courseId").value;

    const amount =
        document.getElementById("amount").value;

    const paymentMethod =
        document.getElementById("paymentMethod").value;

    const paymentDate =
        document.getElementById("paymentDate").value;

    const status =
        document.getElementById("paymentStatus").value;

    if (!studentId) {
        showMessage(
            "Please select a student.",
            "error"
        );

        return;
    }

    if (
        amount === "" ||
        Number(amount) < 0
    ) {
        showMessage(
            "Enter a valid payment amount.",
            "error"
        );

        return;
    }

    if (!paymentMethod) {
        showMessage(
            "Please select a payment method.",
            "error"
        );

        return;
    }

    if (!paymentDate) {
        showMessage(
            "Please select a payment date.",
            "error"
        );

        return;
    }

    const paymentData = {
        student_id: Number(studentId),
        course_id: courseId
            ? Number(courseId)
            : null,
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_date: paymentDate,
        status: status
    };

    const editing = Boolean(paymentId);

    const url = editing
        ? `${API_BASE_URL}/payments/${paymentId}`
        : `${API_BASE_URL}/payments`;

    const method = editing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Payment could not be saved"
            );
        }

        showMessage(
            result.message ||
            "Payment saved successfully.",
            "success"
        );

        clearPaymentForm();
        await loadPayments();

    } catch (error) {
        console.error("Save payment error:", error);

        showMessage(error.message, "error");
    }
}

function editPayment(paymentId) {
    const payment = paymentsData.find(
        item =>
            Number(item.payment_id) ===
            Number(paymentId)
    );

    if (!payment) {
        showMessage(
            "Payment record was not found.",
            "error"
        );

        return;
    }

    document.getElementById("paymentId").value =
        payment.payment_id;

    document.getElementById("studentId").value =
        payment.student_id ?? "";

    document.getElementById("courseId").value =
        payment.course_id ?? "";

    document.getElementById("amount").value =
        payment.amount ?? "";

    document.getElementById("paymentMethod").value =
        payment.payment_method ?? "";

    document.getElementById("paymentDate").value =
        payment.payment_date ?? "";

    document.getElementById("paymentStatus").value =
        payment.status ?? "Completed";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showMessage(
        "Edit the payment and click Save Payment.",
        "success"
    );
}

async function deletePayment(paymentId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/payments/${paymentId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Could not delete payment"
            );
        }

        showMessage(
            result.message ||
            "Payment deleted successfully.",
            "success"
        );

        await loadPayments();

    } catch (error) {
        console.error("Delete payment error:", error);

        showMessage(error.message, "error");
    }
}

function clearPaymentForm() {
    document.getElementById("paymentId").value = "";
    document.getElementById("studentId").value = "";
    document.getElementById("courseId").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("paymentMethod").value = "";
    document.getElementById("paymentStatus").value =
        "Completed";

    document.getElementById("paymentDate").value = "";

    setTodayDate();
}

function filterPayments() {
    const searchValue = document
        .getElementById("paymentSearch")
        .value
        .trim()
        .toLowerCase();

    if (!searchValue) {
        renderPayments(paymentsData);
        return;
    }

    const filtered = paymentsData.filter(payment => {
        return Object.values(payment).some(value => {
            return value !== null &&
                value !== undefined &&
                String(value)
                    .toLowerCase()
                    .includes(searchValue);
        });
    });

    renderPayments(filtered);
}

function updatePaymentSummary(payments) {
    document.getElementById("paymentCount")
        .textContent = payments.length;

    const completedPayments = payments.filter(
        payment =>
            String(payment.status)
                .toLowerCase() === "completed"
    );

    document.getElementById("completedPayments")
        .textContent = completedPayments.length;

    const totalRevenue = completedPayments.reduce(
        (total, payment) => {
            return total + Number(payment.amount || 0);
        },
        0
    );

    document.getElementById("totalRevenue")
        .textContent =
        totalRevenue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
}

function showMessage(message, type) {
    const statusMessage =
        document.getElementById("statusMessage");

    statusMessage.textContent = message;

    statusMessage.className =
        type === "success"
            ? "status-message status-success"
            : "status-message status-error";

    window.clearTimeout(showMessage.timeout);

    showMessage.timeout = window.setTimeout(() => {
        statusMessage.className = "status-message";
    }, 3500);
}

function escapeHtml(value) {
    return String(value ?? "—")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");

    window.location.href = "login.html";
}