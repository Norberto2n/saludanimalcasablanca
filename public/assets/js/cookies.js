document.addEventListener("DOMContentLoaded", () => {

  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const rejectBtn = document.getElementById("reject-cookies");

  const cookieChoice = localStorage.getItem("cookies_choice");

  if (!cookieChoice) {
    banner.classList.add("show");
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookies_choice", "accepted");
    banner.classList.remove("show");
  });

  rejectBtn.addEventListener("click", () => {
    localStorage.setItem("cookies_choice", "rejected");
    banner.classList.remove("show");
  });

});