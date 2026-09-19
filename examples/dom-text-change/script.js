const greeting = document.querySelector("#greeting");
const changeButton = document.querySelector("#change-button");

changeButton.addEventListener("click", () => {
  if (greeting.textContent === "안녕하세요") {
    greeting.textContent = "반가워요";
  } else {
    greeting.textContent = "안녕하세요";
  }
});
