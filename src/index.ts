import { app, BrowserWindow, shell, autoUpdater, ipcMain } from 'electron'
import electronIsDev from 'electron-is-dev'
import vkAuthenticate from './mainProccess/vkAuthenticate'
declare const MAIN_WINDOW_WEBPACK_ENTRY: any

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  if (electronIsDev) {
    mainWindow.webContents.openDevTools()
  }

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    mainWindow.webContents.send('update-available', releaseName)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
if (!electronIsDev && process.argv[1] !== '--squirrel-firstrun') {
  const server = 'https://wallpaper.denexapp.me'
  const url = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL({ url })

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60000)
}

ipcMain.on('get-version', event => {
  event.reply('get-version', app.getVersion())
})

ipcMain.on('restart-to-update', event => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('vk-authenticate', async event => {
  try {
    const { accessToken, userId } = await vkAuthenticate()
    event.reply('vk-authenticate-success', { accessToken, userId })
  } catch {
    event.reply('vk-authenticate-fail')
  }
})
