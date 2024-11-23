import pathLib from 'path';
import fs from 'fs';
import axios from 'axios';

export class ElectronAppUpdater {
  checkVersionUrl: string;
  configJSONFileName: string;
  buildJSFileName: string;
  buildPath: string;
  app: any;
  dialog: any;
  constructor({
    checkVersionUrl,
    configJSONFileName,
    buildJSFileName,
    app,
    dialog,
  }: {
    checkVersionUrl: string;
    buildJSFileName?: string;
    configJSONFileName?: string;
    app: any;
    dialog: any;
  }) {
    this.checkVersionUrl = checkVersionUrl;
    this.configJSONFileName = configJSONFileName || 'config.json';
    this.buildJSFileName = buildJSFileName || 'build.js';
    this.buildPath = './';
    this.app = app;
    this.dialog = dialog;
  }

  async checkVersion() {
    const currentVersion = await this.getNowVersion();
    const response: any = await axios.get(this.checkVersionUrl);
    const data = response.data.result;
    const nowVersion = currentVersion;
    const remoteVersion = data.version;
    console.log(currentVersion, remoteVersion);
    if (remoteVersion != nowVersion) {
      console.log('need update');
      await this.changeVersion(remoteVersion, data.url);
      return false;
    }

    return true;
  }

  async changeVersion(remoteVersion: number, url: string) {
    this.dialog.showMessageBox({
      type: 'info',
      title: '软件升级',
      message: `发现新版本，v${remoteVersion}, 正在下载`,
      buttons: ['是的'],
    });
    const configPath = this.getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify({ version: remoteVersion }));
    const writePath = pathLib.join(this.buildPath, this.buildJSFileName);
    const buildResponse: any = await axios.get(url);
    fs.writeFileSync(writePath, buildResponse.data);
    setTimeout(() => {
      this.app.relaunch(); // 重启
      this.app.exit(0);
    }, 1200);
  }

  async getNowVersion() {
    const configPath = this.getConfigPath();
    try {
      const res = fs.readFileSync(configPath).toString();
      const data = JSON.parse(res);
      return data.version;
    } catch (e) {
      return 0;
    }
  }

  getConfigPath() {
    const configPath = pathLib.join(this.buildPath, this.configJSONFileName);
    return configPath;
  }

  getBuildJSPath() {
    const configPath = pathLib.join(this.buildPath, this.buildJSFileName);
    return configPath;
  }
}
