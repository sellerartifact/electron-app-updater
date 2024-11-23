import pathLib from 'path';
import fs from 'fs';
import axios from 'axios';
import { app, dialog } from 'electron';

export class ElectronAppUpdater {
  checkVersionUrl: string;
  configJSONFileName: string;
  buildJSFileName: string;
  buildPath: string;
  constructor({
    checkVersionUrl,
    configJSONFileName,
    buildJSFileName,
  }: {
    checkVersionUrl: string;
    buildJSFileName?: string;
    configJSONFileName?: string;
  }) {
    this.checkVersionUrl = checkVersionUrl;
    this.configJSONFileName = configJSONFileName || 'config.json';
    this.buildJSFileName = buildJSFileName || 'build.js';
    this.buildPath = pathLib.join(__dirname, '/');
  }

  async checkVersion() {
    const currentVersion = await this.getNowVersion();
    const response: any = await axios.get(this.checkVersionUrl);
    const data = response.data.result;
    console.log(currentVersion, data);
    const nowVersion = Number(currentVersion);
    const remoteVersion = Number(data.version);
    if (remoteVersion != nowVersion) {
      console.log('need update');
      await this.changeVersion(remoteVersion, data.url);
      return false;
    }

    return true;
  }

  async changeVersion(remoteVersion: number, url: string) {
    if (app.isPackaged) {
      dialog.showMessageBox({
        type: 'info',
        title: '软件升级',
        message: `发现新版本，v${remoteVersion}, 正在下载`,
        buttons: ['是的'],
      });
      const configPath = this.getConfigPath();
      fs.writeFileSync(configPath, JSON.stringify({ version: remoteVersion }));
      const writePath = pathLib.join(this.buildPath, 'build.js');
      const buildResponse: any = await axios.get(url);
      fs.writeFileSync(writePath, buildResponse.data);
      setTimeout(() => {
        app.relaunch(); // 重启
        app.exit(0);
      }, 1200);
    }
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
