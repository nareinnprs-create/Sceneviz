const { app, BrowserWindow, shell, dialog, Menu, session } = require('electron');
const path = require('path');
const { register: registerLocalInference } = require('./lib/localInference');
const { register: registerWan2gp } = require('./lib/wan2gpProvider');

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    try {
        dialog.showErrorBox('Sceneviz — Unexpected Error', err && err.stack ? err.stack : String(err));
    } catch (_) {
        // dialog unavailable this early; the console log above is the fallback
    }
});

// Ubuntu 24.04+ sets kernel.apparmor_restrict_unprivileged_userns=1 which
// blocks Chromium's user namespace sandbox. The .deb package ships an AppArmor
// profile that grants the permission cleanly. When running the AppImage on an
// affected system, run once: sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
// or pass --no-sandbox on the command line.
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-dev-shm-usage');
}

let mainWindow;

function isHttpUrl(u) {
    try {
        const x = new URL(u);
        return x.protocol === 'https:' || x.protocol === 'http:';
    } catch {
        return false;
    }
}

function buildMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        }] : []),
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                ...(!app.isPackaged ? [{ role: 'toggleDevTools' }, { type: 'separator' }] : []),
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Sceneviz Website',
                    click: () => {
                        const url = 'https://sceneviz.opraiz.com';
                        if (isHttpUrl(url)) shell.openExternal(url);
                    },
                },
                {
                    label: 'About Sceneviz',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'About Sceneviz',
                            message: `Sceneviz ${app.getVersion()}`,
                            detail: '© 2026 Opraiz Technology Pvt Ltd\nhttps://sceneviz.opraiz.com',
                        });
                    },
                },
            ],
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
    const isMac = process.platform === 'darwin';

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 640,
        webPreferences: {
            webSecurity: true,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        ...(isMac ? { titleBarStyle: 'hiddenInset' } : {}),
        backgroundColor: '#101319',
        show: false,
        title: 'Sceneviz',
    });

    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
        console.error('Failed to load index.html:', err);
        mainWindow.show();
    });

    mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
        console.error('did-fail-load:', code, desc);
    });

    // No router in the renderer (single-page, no hash/pushState); block all
    // frame-initiated navigation so the window always stays on the app file.
    mainWindow.webContents.on('will-navigate', (e) => e.preventDefault());

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isHttpUrl(url)) shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    buildMenu();

    // No feature in the renderer uses camera/mic/geolocation/notifications — deny all.
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

    createWindow();

    try {
        registerLocalInference();
        registerWan2gp();
    } catch (err) {
        console.error('Failed to register local-ai/wan2gp handlers:', err);
        dialog.showErrorBox(
            'Local AI features unavailable',
            `Sceneviz started, but local model support failed to initialize:\n\n${err.message}`
        );
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
