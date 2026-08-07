const API_BASE_URL = "http://127.0.0.1:5001";

let usersData = [];


/* ==========================================
   ADMIN PAGE PROTECTION
========================================== */

function protectAdminPage() {

    const fullName =
        localStorage.getItem("full_name");

    const role =
        localStorage.getItem("role");


    if (!fullName || !role) {

        window.location.href = "login.html";


        return false;
    }


    // CEO cannot manage users
    if (role !== "Administrator") {

        alert(
            "Only the Administrator can access User Management."
        );

        window.location.href =
            "dashboard.html";

        return false;
    }


    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileRole =
        document.getElementById(
            "profileRole"
        );


    if (profileName) {

        profileName.textContent =
            fullName;
    }


    if (profileRole) {

        profileRole.textContent =
            role;
    }


    return true;
}


/* ==========================================
   LOAD USERS
========================================== */

async function loadUsers() {

    const usersBody =
        document.getElementById(
            "usersBody"
        );


    if (!usersBody) return;


    usersBody.innerHTML = `
        <tr>
            <td colspan="5">
                Loading users...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users`
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load users: ${response.status}`
            );
        }


        const data =
            await response.json();


        usersData =
            Array.isArray(data)
                ? data
                : [];


        /*
        Only show CEO and Administrator.
        */

        usersData =
            usersData.filter(user => {

                return (
                    user.role === "CEO" ||
                    user.role === "Administrator"
                );

            });


        renderUsers(
            usersData
        );


    } catch (error) {

        console.error(
            "Load users error:",
            error
        );


        usersBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Could not load users.
                </td>
            </tr>
        `;


        showUserMessage(
            "Could not load users.",
            "error"
        );
    }
}


/* ==========================================
   RENDER USERS
========================================== */

function renderUsers(users) {

    const usersBody =
        document.getElementById(
            "usersBody"
        );


    if (!usersBody) return;


    if (!users.length) {

        usersBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No CEO or Administrator accounts found.
                </td>
            </tr>
        `;

        return;
    }


    usersBody.innerHTML =
        users.map(user => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(
                user.user_id
            )}
                    </td>

                    <td>
                        ${escapeHTML(
                user.username
            )}
                    </td>

                    <td>
                        ${escapeHTML(
                user.full_name
            )}
                    </td>

                    <td>
                        ${escapeHTML(
                user.role
            )}
                    </td>

                    <td>

                        <button
                            onclick="editUser(
                                ${Number(user.user_id)}
                            )"
                        >
                            Edit
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


/* ==========================================
   EDIT USER
========================================== */

function editUser(userId) {

    const user =
        usersData.find(
            user =>
                Number(user.user_id) ===
                Number(userId)
        );


    if (!user) {

        showUserMessage(
            "User not found.",
            "error"
        );

        return;
    }


    document.getElementById(
        "userId"
    ).value =
        user.user_id;


    document.getElementById(
        "username"
    ).value =
        user.username ?? "";


    document.getElementById(
        "fullName"
    ).value =
        user.full_name ?? "";


    document.getElementById(
        "role"
    ).value =
        user.role ?? "";


    document.getElementById(
        "password"
    ).value =
        "";


    document.getElementById(
        "password"
    ).placeholder =
        "Leave blank to keep current password";


    showUserMessage(
        `Editing ${user.full_name}`,
        "success"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ==========================================
   SAVE USER
========================================== */

async function saveUser() {

    const userId =
        document.getElementById(
            "userId"
        ).value;


    if (!userId) {

        showUserMessage(
            "Select CEO or Administrator using the Edit button first.",
            "error"
        );

        return;
    }


    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const fullName =
        document.getElementById(
            "fullName"
        ).value.trim();


    const role =
        document.getElementById(
            "role"
        ).value;


    if (
        !username ||
        !fullName ||
        !role
    ) {

        showUserMessage(
            "Username, full name and role are required.",
            "error"
        );

        return;
    }


    if (
        role !== "CEO" &&
        role !== "Administrator"
    ) {

        showUserMessage(
            "Only CEO and Administrator roles are allowed.",
            "error"
        );

        return;
    }


    const userData = {

        username: username,

        full_name: fullName,

        role: role
    };


    /*
       Only update password when
       a new password was entered.
    */

    if (password) {

        userData.password =
            password;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/${userId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            userData
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "Unable to update user."
            );
        }


        showUserMessage(
            result.message ||
            "User updated successfully.",
            "success"
        );


        clearUserForm();

        await loadUsers();


    } catch (error) {

        console.error(
            "Save user error:",
            error
        );


        showUserMessage(
            error.message,
            "error"
        );
    }
}


/* ==========================================
   CLEAR FORM
========================================== */

function clearUserForm() {

    document.getElementById(
        "userId"
    ).value = "";


    document.getElementById(
        "username"
    ).value = "";


    document.getElementById(
        "password"
    ).value = "";


    document.getElementById(
        "fullName"
    ).value = "";


    document.getElementById(
        "role"
    ).value = "";


    document.getElementById(
        "password"
    ).placeholder =
        "New Password";
}


/* ==========================================
   MESSAGE
========================================== */

function showUserMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "userMessage"
        );


    if (!element) {

        alert(message);

        return;
    }


    element.textContent =
        message;


    element.className =
        type === "success"
            ? "status-message status-success"
            : "status-message status-error";


    clearTimeout(
        showUserMessage.timeout
    );


    showUserMessage.timeout =
        setTimeout(
            () => {

                element.textContent =
                    "";

                element.className =
                    "status-message";

            },
            3500
        );
}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
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


/* ==========================================
   LOGOUT
========================================== */

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


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            protectAdminPage()
        ) {

            loadUsers();
        }
    }
);