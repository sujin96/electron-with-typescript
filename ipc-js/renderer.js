const { ipcRenderer } = require("electron");

const btn = document.querySelector("#btn");
btn.addEventListener("click", () => {
    console.log("click");
    ipcRenderer.send("hello", "world");
});
