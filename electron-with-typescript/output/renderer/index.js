"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const remote_1 = require("@electron/remote");
function main() {
    const btnLogin = document.querySelector("#btn-login");
    const btnLogout = document.querySelector("#btn-logout");
    const btnSendMessage = document.querySelector("#btn-send-message");
    const btnToggle = document.querySelector("#btn-toggle");
    const loginSection = document.querySelector("#login-section");
    const chatSection = document.querySelector("#chat-section");
    const writeSection = document.querySelector("#write-section");
    const message = document.querySelector("#message");
    const input_email = document.querySelector("#email");
    const input_password = document.querySelector("#password");
    const navMenu = document.querySelector(`#${btnToggle.dataset.target}`);
    btnToggle.addEventListener("click", () => {
        btnToggle.classList.toggle("is-active");
        navMenu.classList.toggle("is-active");
    });
    input_email.addEventListener("keypress", (e) => {
        if (e.code === "Enter") {
            input_password.focus();
        }
    });
    input_password.addEventListener("keypress", (e) => {
        if (e.code === "Enter") {
            if (input_email.value.length < 4 || !validateEmail(input_email.value)) {
                const win = remote_1.getCurrentWindow();
                remote_1.dialog
                    .showMessageBox(win, {
                    message: "Login Failed",
                    detail: "메일 주소가 유효하지 않습니다.",
                })
                    .then(() => {
                    input_email.focus();
                });
                return;
            }
            if (input_password.value.length < 4) {
                const win = remote_1.getCurrentWindow();
                remote_1.dialog
                    .showMessageBox(win, {
                    message: "Login Failed",
                    detail: "패스워드가 유효하지 않습니다.",
                })
                    .then(() => {
                    input_password.focus();
                });
                return;
            }
            const loginObj = {
                email: input_email.value,
                password: input_password.value,
            };
            electron_1.ipcRenderer.send("request-login", loginObj);
        }
    });
    btnLogin.addEventListener("click", () => {
        if (input_email.value.length < 4 || !validateEmail(input_email.value)) {
            const win = remote_1.getCurrentWindow();
            remote_1.dialog
                .showMessageBox(win, {
                message: "Login Failed",
                detail: "메일 주소가 유효하지 않습니다.",
            })
                .then(() => {
                input_email.focus();
            });
            return;
        }
        if (input_password.value.length < 4) {
            const win = remote_1.getCurrentWindow();
            remote_1.dialog
                .showMessageBox(win, {
                message: "Login Failed",
                detail: "패스워드가 유효하지 않습니다.",
            })
                .then(() => {
                input_password.focus();
            });
            return;
        }
        const loginObj = {
            email: input_email.value,
            password: input_password.value,
        };
        electron_1.ipcRenderer.send("request-login", loginObj);
    });
    btnLogout.addEventListener("click", () => {
        input_email.value = "";
        input_password.value = "";
        electron_1.ipcRenderer.send("request-logout");
    });
    btnSendMessage.addEventListener("click", () => {
        if (message.value === "") {
            console.log("no message");
            return;
        }
        electron_1.ipcRenderer.send("send-message", message.value);
        message.value = "";
    });
    message.addEventListener("keypress", (event) => {
        if (event.code === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (message.value === "") {
                return;
            }
            electron_1.ipcRenderer.send("send-message", message.value);
            message.value = "";
        }
    });
    electron_1.ipcRenderer.on("logout-success", () => {
        loginSection.style.display = "block";
        chatSection.style.display = "none";
        writeSection.style.display = "none";
        btnToggle.style.display = "block";
        btnToggle.classList.toggle("is-active");
        navMenu.classList.toggle("is-active");
    });
    electron_1.ipcRenderer.on("login-success", () => {
        console.log("login-success");
        loginSection.style.display = "none";
        chatSection.style.display = "block";
        writeSection.style.display = "block";
        btnToggle.style.display = "none";
        message.focus();
    });
    electron_1.ipcRenderer.on("login-error", (event, code) => {
        console.log("receive : login-error");
        if (code === "auth/user-not-found") {
            const win = remote_1.getCurrentWindow();
            remote_1.dialog
                .showMessageBox(win, {
                message: "Login Failed",
                detail: "등록되지 않은 이메일 주소입니다.",
            })
                .then(() => {
                input_email.focus();
            });
            return;
        }
        else if (code === "auth/wrong-password") {
            const win = remote_1.getCurrentWindow();
            remote_1.dialog
                .showMessageBox(win, {
                message: "Login Failed",
                detail: "잘못된 비밀번호 입니다.",
            })
                .then(() => {
                input_password.focus();
            });
            return;
        }
    });
    electron_1.ipcRenderer.on("general-message", (event, messageObjects) => {
        const messageHTML = messageObjects
            .map((messageObject) => {
            return `
            <div class="box">
                    <article class="media">
                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <strong>${messageObject.name}</strong> <small>${messageObject.email}</small> <small>${messageObject.time}</small>
                                    <br />
                                    ${messageObject.message}
                                </p>
                            </div>
                        </div>
                    </article>
                </div>`;
        })
            .join("");
        const messageContainer = document.querySelector("#message-container");
        messageContainer.innerHTML = messageHTML;
    });
}
document.addEventListener("DOMContentLoaded", main);
function validateEmail(email) {
    const re = /\S+@\S+\.\S\S+/;
    return re.test(email);
}
//# sourceMappingURL=index.js.map