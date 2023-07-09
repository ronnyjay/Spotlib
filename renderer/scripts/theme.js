document.addEventListener("DOMContentLoaded", async function () {
  var themeStyle = document.getElementById("theme-style");
  var themes = ["sunset.css", "velvet.css", "charcoal.css"];

  var currentIndex = 0;

  // Retrieve the current theme index
  // Would prefer to be using localstorage but it broke randomly
  // So, we use a custom localstorage
  var savedThemeIndex = await pages.getTheme();
  if (savedThemeIndex) {
    currentIndex = savedThemeIndex;
    var savedTheme = themes[currentIndex];
    themeStyle.setAttribute("href", "../styles/themes/" + savedTheme);
  }

  var defaultThemeButton = document.getElementById("theme-sunset");
  var velvetThemeButton = document.getElementById("theme-velvet");
  var charcoalThemeButton = document.getElementById("theme-charcoal");

  if (!defaultThemeButton || !velvetThemeButton || !charcoalThemeButton) {
    return;
  }

  defaultThemeButton.addEventListener("click", function () {
    currentIndex = 0;
    themeStyle.setAttribute("href", "../styles/themes/" + themes[currentIndex]);
    pages.setTheme(currentIndex);
  });

  velvetThemeButton.addEventListener("click", function () {
    currentIndex = 1;
    themeStyle.setAttribute("href", "../styles/themes/" + themes[currentIndex]);
    pages.setTheme(currentIndex);
  });

  charcoalThemeButton.addEventListener("click", function () {
    currentIndex = 2;
    themeStyle.setAttribute("href", "../styles/themes/" + themes[currentIndex]);
    pages.setTheme(currentIndex);
  });

  // THIS WAS HORRIBLE TO GET WORKING BUT IT LOOKS SO BEAUTIFUL
  const themeSelect = document.querySelector(".theme-select");
  const themeDropdown = document.getElementById("dropdown");

  let timeout;

  themeSelect.addEventListener("mouseenter", function () {
    themeSelect.classList.add("hovered");
    themeDropdown.style.display = "flex";
    themeDropdown.style.animation = "";
  });

  themeSelect.addEventListener("mouseleave", function () {
    themeSelect.classList.remove("hovered");
    themeDropdown.style.display = "flex";
    themeDropdown.style.animation = "shrink 0.7s forwards";
    timeout = setTimeout(function () {
      themeDropdown.style.display = "none";
    }, 750);
  });
});
