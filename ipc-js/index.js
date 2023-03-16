const { app, BrowserWindow, ipcMain } = require("electron");

app.on("ready", () => {
    console.log("electorn ready");

    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.loadURL(`file://${__dirname}/index.html`);

    ipcMain.on("hello", () => {
        console.log("hello");
    });
});
