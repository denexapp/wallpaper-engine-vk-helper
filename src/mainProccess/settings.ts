import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  OpenDialogOptions,
} from 'electron';
import electronSettings from 'electron-settings';
import { JsonDecoder } from 'ts.data.json';
import { defaultLocale, LocaleCode } from '../localization';

export interface Settings {
  wallpaperEngineFolder?: string;
  locale: LocaleCode;
}

// export type PartialSettings = Partial<Settings>

const settingsDecoder = JsonDecoder.object<Settings>(
  {
    wallpaperEngineFolder: JsonDecoder.optional(JsonDecoder.string),
    locale: JsonDecoder.failover(
      defaultLocale,
      JsonDecoder.oneOf(
        [JsonDecoder.isExactly('en-US'), JsonDecoder.isExactly('ru-RU')],
        'locale'
      )
    ),
  },
  'settingsDecoder'
);

// const partialSettingsDecoder = JsonDecoder.objectStrict<PartialSettings>(
//   {
//     wallpaperEngineFolder: JsonDecoder.optional(JsonDecoder.string)
//   },
//   'partialSettingsDecoder'
// )

const settings = () => {
  ipcMain.on('settings-get', async (event, showErrorDialogOnError: boolean) => {
    try {
      const settingsObject = await electronSettings.get();
      const decodedSettings = await settingsDecoder.decodePromise(
        settingsObject
      );
      event.reply('settings-get-success', decodedSettings);
    } catch {
      event.reply('settings-get-fail');
      if (showErrorDialogOnError) {
        dialog
          .showMessageBox({
            type: 'error',
            message: "The app can't get settings",
          })
          .then(() => app.quit())
          .catch(() => app.quit());
      }
    }
  });

  // ipcMain.on('settings-set', async (event, settings) => {
  //   try {
  //     const decodedSettings = await partialSettingsDecoder.decodePromise(
  //       settings
  //     )
  //     const entries = Object.entries(decodedSettings)
  //     for (const [key, value] of entries) {
  //       if (value !== undefined) await electronSettings.set(key, value)
  //     }
  //     event.reply('settings-set-success')
  //   } catch {
  //     event.reply('settings-set-fail')
  //   }
  // })

  ipcMain.on('settings-set-wallpaper-engine-folder', async (event) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      const properties: OpenDialogOptions = {
        properties: ['openDirectory'],
      };

      const promise =
        mainWindow === null
          ? dialog.showOpenDialog(properties)
          : dialog.showOpenDialog(mainWindow, properties);

      const [path] = (await promise).filePaths;

      if (path !== undefined) {
        await electronSettings.set('wallpaperEngineFolder', path);
        event.reply('settings-set-wallpaper-engine-folder-success', true);
      } else {
        event.reply('settings-set-wallpaper-engine-folder-success', false);
      }
    } catch {
      event.reply('settings-set-wallpaper-engine-folder-fail');
    }
  });

  ipcMain.on('settings-set-locale', async (event, localeCode: LocaleCode) => {
    try {
      await electronSettings.set('locale', localeCode);
      event.reply('settings-set-locale-success', localeCode);
    } catch {
      event.reply('settings-set-locale-fail');
    }
  });

  ipcMain.on('settings-window-show', async (event) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    if (mainWindow !== null) {
      mainWindow.show();
      event.reply('settings-window-show-success');
    } else {
      event.reply('settings-window-show-fail');
      dialog
        .showMessageBox({
          type: 'error',
          message: "The app can't show the main window",
        })
        .then(() => app.quit())
        .catch(() => app.quit());
    }
  });
};

export default settings;
