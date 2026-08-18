const API_BASE_URL = "https://real3st-bi-system.onrender.com";

let currentReportData = [];
let currentReportType = "students";


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setGeneratedDate();

        const reportType =
            document.getElementById(
                "reportType"
            );

        const searchInput =
            document.getElementById(
                "reportSearch"
            );


        if (reportType) {

            reportType.addEventListener(
                "change",
                async () => {

                    await loadSelectedReport();

                }
            );
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterReport
            );
        }


        await loadOverallRevenue();

        await loadSelectedReport();
    }
);


/* =========================================================
   DATE
========================================================= */

function setGeneratedDate() {

    const element =
        document.getElementById(
            "generatedDate"
        );

    if (!element) {
        return;
    }


    const today =
        new Date();


    element.textContent =
        today.toLocaleDateString(
            "en-GB"
        );
}


/* =========================================================
   OVERALL REVENUE
========================================================= */

async function loadOverallRevenue() {

    const revenueElement =
        document.getElementById(
            "totalRevenue"
        );


    if (!revenueElement) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments`
            );


        if (!response.ok) {

            throw new Error(
                `Payments request failed: ${response.status}`
            );
        }


        const payments =
            await response.json();


        if (!Array.isArray(payments)) {

            revenueElement.textContent =
                "$0.00";

            return;
        }


        const completedPayments =
            payments.filter(
                payment => {

                    return String(
                        payment.status || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        "completed";

                }
            );


        const totalRevenue =
            completedPayments.reduce(
                (total, payment) => {

                    return total +
                        Number(
                            payment.amount || 0
                        );

                },
                0
            );


        revenueElement.textContent =
            totalRevenue.toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency: "USD"
                }
            );

    } catch (error) {

        console.error(
            "Revenue error:",
            error
        );


        revenueElement.textContent =
            "$0.00";
    }
}


/* =========================================================
   LOAD REPORT
========================================================= */

async function loadSelectedReport() {

    const reportSelect =
        document.getElementById(
            "reportType"
        );


    if (!reportSelect) {
        return;
    }


    currentReportType =
        reportSelect.value ||
        "students";


    let endpoint = "";


    switch (currentReportType) {

        case "students":

            endpoint =
                "/students";

            break;


        case "courses":

            endpoint =
                "/courses";

            break;


        case "memberships":

            endpoint =
                "/memberships";

            break;


        case "payments":

            endpoint =
                "/payments";

            break;


        case "certificates":

            endpoint =
                "/certificates";

            break;


        case "qualifications":

            endpoint =
                "/firearms_qualifications";

            break;


        default:

            endpoint =
                "/students";

            currentReportType =
                "students";
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`
            );


        if (!response.ok) {

            throw new Error(
                `Report request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        currentReportData =
            Array.isArray(data)
                ? data
                : [];


        renderCurrentReport(
            currentReportData
        );


        updateCurrentRecords(
            currentReportData
        );


        setGeneratedDate();

        await loadOverallRevenue();


    } catch (error) {

        console.error(
            "Report loading error:",
            error
        );


        currentReportData = [];


        renderCurrentReport([]);

        updateCurrentRecords([]);


        showMessage(
            "Could not load report. Make sure Flask is running on port 5001.",
            "error"
        );
    }
}


/* =========================================================
   GENERATE REPORT
========================================================= */

async function generateReport() {

    await loadSelectedReport();

    setGeneratedDate();


    showMessage(
        "Report generated successfully.",
        "success"
    );
}


/* =========================================================
   REFRESH
========================================================= */

async function refreshReport() {

    await loadOverallRevenue();

    await loadSelectedReport();

    setGeneratedDate();


    showMessage(
        "Report refreshed successfully.",
        "success"
    );
}


/* =========================================================
   CURRENT RECORD COUNT
========================================================= */

function updateCurrentRecords(
    data
) {

    const element =
        document.getElementById(
            "recordCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        Array.isArray(data)
            ? data.length
            : 0;
}


/* =========================================================
   RENDER REPORT
========================================================= */

function renderCurrentReport(
    data
) {

    switch (currentReportType) {

        case "students":

            renderStudentReport(
                data
            );

            break;


        case "courses":

            renderCourseReport(
                data
            );

            break;


        case "memberships":

            renderMembershipReport(
                data
            );

            break;


        case "payments":

            renderPaymentReport(
                data
            );

            break;


        case "certificates":

            renderCertificateReport(
                data
            );

            break;


        case "qualifications":

            renderQualificationReport(
                data
            );

            break;
    }
}


/* =========================================================
   STUDENT REPORT
========================================================= */

function renderStudentReport(
    data
) {

    setReportTitle(
        "Student Report"
    );


    setTableHeaders([
        "ID",
        "Full Name",
        "Email",
        "Phone"
    ]);


    const rows =
        data.map(
            student => {


                let fullName =
                    student.full_name ??
                    student.student_name ??
                    student.name ??
                    "";


                if (!fullName) {

                    fullName =
                        `${student.first_name ?? ""} ${student.last_name ?? ""}`
                            .trim();
                }


                return [

                    student.student_id ??
                    student.id ??
                    "—",

                    fullName || "—",

                    student.email ??
                    "—",

                    student.phone ??
                    student.phone_number ??
                    "—"

                ];

            }
        );


    renderRows(
        rows
    );
}


/* =========================================================
   COURSE REPORT
========================================================= */

function renderCourseReport(
    data
) {

    setReportTitle(
        "Course Report"
    );


    setTableHeaders([
        "ID",
        "Course Name",
        "Category",
        "Duration",
        "Price"
    ]);


    const rows =
        data.map(
            course => {


                const price =
                    Number(
                        course.price || 0
                    ).toLocaleString(
                        "en-US",
                        {
                            style: "currency",
                            currency: "USD"
                        }
                    );


                return [

                    course.course_id ??
                    course.id ??
                    "—",

                    course.course_name ??
                    course.name ??
                    "—",

                    course.category ??
                    "—",

                    course.duration_days ??
                    course.duration ??
                    "—",

                    price

                ];

            }
        );


    renderRows(
        rows
    );
}


/* =========================================================
   MEMBERSHIP REPORT
========================================================= */

function renderMembershipReport(
    data
) {

    setReportTitle(
        "Membership Report"
    );


    setTableHeaders([
        "ID",
        "Student",
        "Membership Type",
        "Start Date",
        "Expiry Date",
        "Status"
    ]);


    const rows =
        data.map(
            membership => [

                membership.membership_id ??
                membership.id ??
                "—",

                membership.student_name ??
                membership.full_name ??
                membership.student_id ??
                "—",

                membership.membership_type ??
                membership.type ??
                "—",

                membership.start_date ??
                "—",

                membership.expiry_date ??
                membership.end_date ??
                "—",

                membership.status ??
                "—"

            ]
        );


    renderRows(
        rows
    );
}


/* =========================================================
   PAYMENT REPORT
========================================================= */

function renderPaymentReport(
    data
) {

    setReportTitle(
        "Payment Report"
    );


    setTableHeaders([
        "ID",
        "Student",
        "Course",
        "Amount",
        "Method",
        "Date",
        "Status"
    ]);


    const rows =
        data.map(
            payment => {


                const amount =
                    Number(
                        payment.amount || 0
                    ).toLocaleString(
                        "en-US",
                        {
                            style: "currency",
                            currency: "USD"
                        }
                    );


                return [

                    payment.payment_id ??
                    payment.id ??
                    "—",

                    payment.student_name ??
                    payment.student_id ??
                    "—",

                    payment.course_name ??
                    payment.course_id ??
                    "—",

                    amount,

                    payment.payment_method ??
                    "—",

                    payment.payment_date ??
                    "—",

                    payment.status ??
                    "—"

                ];

            }
        );


    renderRows(
        rows
    );
}


/* =========================================================
   CERTIFICATE REPORT
========================================================= */

function renderCertificateReport(
    data
) {

    setReportTitle(
        "Certificate Report"
    );


    setTableHeaders([
        "ID",
        "Student",
        "Course",
        "Certificate Number",
        "Issue Date",
        "Expiry Date"
    ]);


    const rows =
        data.map(
            certificate => [

                certificate.certificate_id ??
                certificate.id ??
                "—",

                certificate.student_name ??
                certificate.student_id ??
                "—",

                certificate.course_name ??
                certificate.course_id ??
                "—",

                certificate.certificate_number ??
                certificate.certificate_no ??
                "—",

                certificate.issue_date ??
                "—",

                certificate.expiry_date ??
                "—"

            ]
        );


    renderRows(
        rows
    );
}


/* =========================================================
   QUALIFICATION REPORT
========================================================= */

function renderQualificationReport(
    data
) {

    setReportTitle(
        "Qualification Report"
    );


    setTableHeaders([
        "ID",
        "Student",
        "Qualification",
        "Instructor",
        "Issue Date"
    ]);


    const rows =
        data.map(
            qualification => [

                qualification.qualification_id ??
                qualification.id ??
                "—",

                qualification.student_name ??
                qualification.student_id ??
                "—",

                qualification.qualification_name ??
                qualification.qualification_type ??
                qualification.firearm_type ??
                "—",

                qualification.instructor_name ??
                qualification.instructor ??
                "—",

                qualification.issue_date ??
                "—"

            ]
        );


    renderRows(
        rows
    );
}


/* =========================================================
   REPORT TITLE
========================================================= */

function setReportTitle(
    title
) {

    const element =
        document.getElementById(
            "reportTitle"
        );


    if (element) {

        element.textContent =
            title;
    }
}


/* =========================================================
   TABLE HEADERS
========================================================= */

function setTableHeaders(
    headers
) {

    const tableHead =
        document.getElementById(
            "reportTableHead"
        );


    if (!tableHead) {
        return;
    }


    tableHead.innerHTML = `
        <tr>
            ${headers
            .map(
                header =>
                    `<th>${escapeHtml(header)}</th>`
            )
            .join("")
        }
        </tr>
    `;
}


/* =========================================================
   TABLE ROWS
========================================================= */

function renderRows(
    rows
) {

    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    if (!tableBody) {
        return;
    }


    if (!rows.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    No records found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        rows
            .map(
                row => {

                    return `
                        <tr>

                            ${row
                            .map(
                                value =>
                                    `<td>${escapeHtml(value)}</td>`
                            )
                            .join("")
                        }

                        </tr>
                    `;

                }
            )
            .join("");
}


/* =========================================================
   SEARCH
========================================================= */

function filterReport() {

    const searchInput =
        document.getElementById(
            "reportSearch"
        );


    if (!searchInput) {
        return;
    }


    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchValue) {

        renderCurrentReport(
            currentReportData
        );


        updateCurrentRecords(
            currentReportData
        );


        return;
    }


    const filteredData =
        currentReportData.filter(
            record => {

                return Object
                    .values(record)
                    .some(
                        value => {

                            if (
                                value === null ||
                                value === undefined
                            ) {

                                return false;
                            }


                            return String(
                                value
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                );

                        }
                    );

            }
        );


    renderCurrentReport(
        filteredData
    );


    updateCurrentRecords(
        filteredData
    );
}


/* =========================================================
   EXPORT EXCEL
========================================================= */

function exportExcel() {

    if (
        !currentReportData ||
        currentReportData.length === 0
    ) {

        showMessage(
            "There is no report data to export.",
            "error"
        );

        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        showMessage(
            "Excel library could not be loaded.",
            "error"
        );

        return;
    }


    let fileName =
        "report.xlsx";


    let sheetName =
        "Report";


    let exportData = [];


    switch (
    currentReportType
    ) {


        /* STUDENTS */

        case "students":

            fileName =
                "students_report.xlsx";


            sheetName =
                "Students";


            exportData =
                currentReportData.map(
                    student => {


                        let fullName =
                            student.full_name ??
                            student.student_name ??
                            student.name ??
                            "";


                        if (!fullName) {

                            fullName =
                                `${student.first_name ?? ""} ${student.last_name ?? ""}`
                                    .trim();
                        }


                        return {

                            "Student ID":
                                student.student_id ??
                                student.id ??
                                "",


                            "Full Name":
                                fullName,


                            "Email":
                                student.email ??
                                "",


                            "Phone":
                                student.phone ??
                                student.phone_number ??
                                ""

                        };

                    }
                );

            break;



        /* COURSES */

        case "courses":

            fileName =
                "courses_report.xlsx";


            sheetName =
                "Courses";


            exportData =
                currentReportData.map(
                    course => ({

                        "Course ID":
                            course.course_id ??
                            course.id ??
                            "",


                        "Course Name":
                            course.course_name ??
                            course.name ??
                            "",


                        "Category":
                            course.category ??
                            "",


                        "Duration":
                            course.duration_days ??
                            course.duration ??
                            "",


                        "Price USD":
                            Number(
                                course.price || 0
                            )

                    })
                );

            break;



        /* MEMBERSHIPS */

        case "memberships":

            fileName =
                "memberships_report.xlsx";


            sheetName =
                "Memberships";


            exportData =
                currentReportData.map(
                    membership => ({

                        "Membership ID":
                            membership.membership_id ??
                            membership.id ??
                            "",


                        "Student":
                            membership.student_name ??
                            membership.full_name ??
                            membership.student_id ??
                            "",


                        "Membership Type":
                            membership.membership_type ??
                            membership.type ??
                            "",


                        "Start Date":
                            membership.start_date ??
                            "",


                        "Expiry Date":
                            membership.expiry_date ??
                            membership.end_date ??
                            "",


                        "Status":
                            membership.status ??
                            ""

                    })
                );

            break;



        /* PAYMENTS */

        case "payments":

            fileName =
                "payments_report.xlsx";


            sheetName =
                "Payments";


            exportData =
                currentReportData.map(
                    payment => ({

                        "Payment ID":
                            payment.payment_id ??
                            payment.id ??
                            "",


                        "Student":
                            payment.student_name ??
                            payment.student_id ??
                            "",


                        "Course":
                            payment.course_name ??
                            payment.course_id ??
                            "",


                        "Amount USD":
                            Number(
                                payment.amount || 0
                            ),


                        "Payment Method":
                            payment.payment_method ??
                            "",


                        "Payment Date":
                            payment.payment_date ??
                            "",


                        "Status":
                            payment.status ??
                            ""

                    })
                );

            break;



        /* CERTIFICATES */

        case "certificates":

            fileName =
                "certificates_report.xlsx";


            sheetName =
                "Certificates";


            exportData =
                currentReportData.map(
                    certificate => ({

                        "Certificate ID":
                            certificate.certificate_id ??
                            certificate.id ??
                            "",


                        "Student":
                            certificate.student_name ??
                            certificate.student_id ??
                            "",


                        "Course":
                            certificate.course_name ??
                            certificate.course_id ??
                            "",


                        "Certificate Number":
                            certificate.certificate_number ??
                            certificate.certificate_no ??
                            "",


                        "Issue Date":
                            certificate.issue_date ??
                            "",


                        "Expiry Date":
                            certificate.expiry_date ??
                            ""

                    })
                );

            break;



        /* QUALIFICATIONS */

        case "qualifications":

            fileName =
                "qualifications_report.xlsx";


            sheetName =
                "Qualifications";


            exportData =
                currentReportData.map(
                    qualification => ({

                        "Qualification ID":
                            qualification.qualification_id ??
                            qualification.id ??
                            "",


                        "Student":
                            qualification.student_name ??
                            qualification.student_id ??
                            "",


                        "Qualification":
                            qualification.qualification_name ??
                            qualification.qualification_type ??
                            qualification.firearm_type ??
                            "",


                        "Instructor":
                            qualification.instructor_name ??
                            qualification.instructor ??
                            "",


                        "Issue Date":
                            qualification.issue_date ??
                            ""

                    })
                );

            break;



        default:

            showMessage(
                "This report cannot be exported.",
                "error"
            );

            return;
    }


    try {

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            sheetName
        );


        XLSX.writeFile(
            workbook,
            fileName
        );


        showMessage(
            "Excel report exported successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Excel export error:",
            error
        );


        showMessage(
            "Could not export Excel report.",
            "error"
        );
    }
}


/* =========================================================
   PRINT / PDF
========================================================= */

function printReport() {

    window.print();
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    const statusElement =
        document.getElementById(
            "statusMessage"
        );


    if (!statusElement) {

        console.log(
            message
        );

        return;
    }


    statusElement.textContent =
        message;


    statusElement.className =
        type === "success"
            ? "status-message status-success"
            : "status-message status-error";


    window.clearTimeout(
        showMessage.timeout
    );


    showMessage.timeout =
        window.setTimeout(
            () => {

                statusElement.textContent =
                    "";

                statusElement.className =
                    "status-message";

            },
            3500
        );
}


/* =========================================================
   SECURITY
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? "—"
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
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

    window.location.href = "login.html";
}
