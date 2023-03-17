import { app, ipcMain, BrowserWindow } from "electron";
import { initialize, enable } from "@electron/remote/main";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, Auth } from "firebase/auth";
import { Database, getDatabase, ref, DatabaseReference, child, DataSnapshot, get, set, push, update } from "firebase/database";
import * as path from "path";
import * as url from "url";
import { LoginObj, MessageObjectType } from "../common/type";
import { config } from "dotenv";

config();

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

const database: Database = getDatabase(firebaseApp);
const auth: Auth = getAuth();

//onAuthStateChanged(auth, (user: { email: string }) => {});

// 둘 중 하나가 참이면 => protocol 뒤에 //가 붙는다.
// protocol begins with http, https, ftp, gopher, or file
//slashes is true
const html: string = url.format({
    protocol: "file",
    pathname: path.join(__dirname, "../../static/index.html"),
});

app.on("ready", () => {
    console.log("ready");
    initialize();
    const win = new BrowserWindow({
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
    enable(win.webContents);

    win.loadURL(html);

    ipcMain.on("request-login", async (event: Electron.IpcMainEvent, arg: LoginObj) => {
        let user = null;
        try {
            user = await signInWithEmailAndPassword(auth, arg.email, arg.password);
        } catch (e) {
            if (isFirebaseError(e)) {
                console.log(e);
                event.sender.send("login-error", e.code);
                return;
            } else {
                throw e;
            }
        }
        if (user) {
            event.sender.send("login-success");
            const dbRef: DatabaseReference = ref(database);
            get(child(dbRef, "general/")).then((snapshot: DataSnapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messageObjects: MessageObjectType[] = Object.keys(data).map((id) => {
                        const messageObject: MessageObjectType = {
                            id,
                            email: data[id].email,
                            name: data[id].name,
                            message: data[id].message,
                            time: data[id].time,
                        };
                        return messageObject;
                    });
                    win.webContents.send("general-message", messageObjects);
                } else {
                    console.log("No data available");
                }
            });
        }
    });

    ipcMain.on("request-logout", async (event: Electron.IpcMainEvent) => {
        try {
            await signOut(auth);
            event.sender.send("logout-success");
        } catch (e) {
            console.log(e);
        }
    });

    ipcMain.on("send-message", (event: Electron.IpcMainEvent, message) => {
        if (auth.currentUser) {
            const newPostKey = push(child(ref(database), "general")).key;
            const updates = {};
            const data = {
                email: auth.currentUser.email,
                name: "sujin Lee",
                message,
                time: new Date().toISOString(),
            };
            updates["/general/" + newPostKey] = data;
            update(ref(database), updates);

            const dbRef: DatabaseReference = ref(database);
            get(child(dbRef, "general/")).then((snapshot: DataSnapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messageObjects: MessageObjectType[] = Object.keys(data).map((id) => {
                        const messageObject: MessageObjectType = {
                            id,
                            email: data[id].email,
                            name: data[id].name,
                            message: data[id].message,
                            time: data[id].time,
                        };
                        return messageObject;
                    });
                    win.webContents.send("general-message", messageObjects);
                } else {
                    console.log("No data available");
                }
            });
        }
    });
});

function isFirebaseError(arg) {
    return arg.code !== undefined && arg.message !== undefined;
}
