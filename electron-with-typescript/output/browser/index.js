"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const main_1 = require("@electron/remote/main");
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const database_1 = require("firebase/database");
const path = require("path");
const url = require("url");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};
const firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
const database = (0, database_1.getDatabase)(firebaseApp);
const auth = (0, auth_1.getAuth)();
//onAuthStateChanged(auth, (user: { email: string }) => {});
// 둘 중 하나가 참이면 => protocol 뒤에 //가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
//slashes is true
const html = url.format({
    protocol: "file",
    pathname: path.join(__dirname, "../../static/index.html"),
});
electron_1.app.on("ready", () => {
    console.log("ready");
    (0, main_1.initialize)();
    const win = new electron_1.BrowserWindow({
        width: 800,
        minWidth: 800,
        maxWidth: 800,
        height: 800,
        minHeight: 800,
        maxHeight: 800,
        maximizable: false,
        webPreferences: {
            plugins: true,
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
            webSecurity: false,
        },
    });
    (0, main_1.enable)(win.webContents);
    win.loadURL(html);
    electron_1.ipcMain.on("request-login", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
        let user = null;
        try {
            user = yield (0, auth_1.signInWithEmailAndPassword)(auth, arg.email, arg.password);
        }
        catch (e) {
            if (isFirebaseError(e)) {
                console.log(e);
                event.sender.send("login-error", e.code);
                return;
            }
            else {
                throw e;
            }
        }
        if (user) {
            event.sender.send("login-success");
            const dbRef = (0, database_1.ref)(database);
            (0, database_1.get)((0, database_1.child)(dbRef, "general/")).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messageObjects = Object.keys(data).map((id) => {
                        const messageObject = {
                            id,
                            email: data[id].email,
                            name: data[id].name,
                            message: data[id].message,
                            time: data[id].time,
                        };
                        return messageObject;
                    });
                    win.webContents.send("general-message", messageObjects);
                }
                else {
                    console.log("No data available");
                }
            });
        }
    }));
    electron_1.ipcMain.on("request-logout", (event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, auth_1.signOut)(auth);
            event.sender.send("logout-success");
        }
        catch (e) {
            console.log(e);
        }
    }));
    electron_1.ipcMain.on("send-message", (event, message) => {
        if (auth.currentUser) {
            const newPostKey = (0, database_1.push)((0, database_1.child)((0, database_1.ref)(database), "general")).key;
            const updates = {};
            const data = {
                email: auth.currentUser.email,
                name: "sujin Lee",
                message,
                time: new Date().toISOString(),
            };
            updates["/general/" + newPostKey] = data;
            (0, database_1.update)((0, database_1.ref)(database), updates);
            const dbRef = (0, database_1.ref)(database);
            (0, database_1.get)((0, database_1.child)(dbRef, "general/")).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messageObjects = Object.keys(data).map((id) => {
                        const messageObject = {
                            id,
                            email: data[id].email,
                            name: data[id].name,
                            message: data[id].message,
                            time: data[id].time,
                        };
                        return messageObject;
                    });
                    win.webContents.send("general-message", messageObjects);
                }
                else {
                    console.log("No data available");
                }
            });
        }
    });
});
function isFirebaseError(arg) {
    return arg.code !== undefined && arg.message !== undefined;
}
//# sourceMappingURL=index.js.map