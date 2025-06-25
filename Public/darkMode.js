document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("darkModeToggle");

    if (!toggle) return;

    let mode = localStorage.getItem("darkMode");

    if (mode === null || mode === "true") {
        // Default to dark mode
        document.body.classList.add("dark-mode");
        toggle.classList.remove("bi-moon-fill");
        toggle.classList.add("bi-sun-fill");
        localStorage.setItem("darkMode", "true"); // Save the default
    } else {
        document.body.classList.remove("dark-mode");
        toggle.classList.remove("bi-sun-fill");
        toggle.classList.add("bi-moon-fill");
    }

    toggle.addEventListener("click", function () {
        const nowDark = document.body.classList.toggle("dark-mode");

        // Update icon
        toggle.classList.toggle("bi-moon-fill", !nowDark);
        toggle.classList.toggle("bi-sun-fill", nowDark);

        // Save user preference
        localStorage.setItem("darkMode", nowDark);
    });
});




document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("image");
    const fileNameDisplay = document.getElementById("fileName");

    if (imageInput) {
        imageInput.addEventListener("change", function () {
            const fileName = imageInput.files.length > 0 ? imageInput.files[0].name : "No file selected";
            fileNameDisplay.textContent = fileName;
        });
    }
});


