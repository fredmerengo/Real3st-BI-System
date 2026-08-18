const API = "https://real3st-bi-system.onrender.com";

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {

            alert(`${result.message}\nRole: ${result.user.role}`);

            // Save user information
            localStorage.setItem("full_name", result.user.full_name);
            localStorage.setItem("role", result.user.role);
            localStorage.setItem("username", result.user.username);

            window.location.href = "/dashboard.html";

        } else {

            document.getElementById("message").textContent = result.message;

        }

    } catch (error) {

        console.error(error);
        document.getElementById("message").textContent = "Unable to connect to the server.";

    }
}
