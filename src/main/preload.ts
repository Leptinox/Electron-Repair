import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Http2ServerResponse } from 'node:http2';
import path from 'node:path';
import util from 'node:util';
import os from 'node:os';
import { AppData } from 'data/data-context';

export type Channels = 'ipc-example';

const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const pug = require('pug');

const execPromise = util.promisify(exec);

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  message: {
    show(title: string, message: string, type: string) {
      const msg = {
        title,
        message,
        type,
      };
      ipcRenderer.send('electron-show-message', msg);
    },
  },
  store: {
    get(val: string) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property: string, val: string) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    delete(property: string) {
      ipcRenderer.send('electron-store-delete', property);
    },
    async run(fileName: string, isCustom: boolean, runType: string) {
      let out = '';
      let err: string | number = 0;
      const appPath = path.dirname(process.execPath);

      try {
        // wait for exec to complete
        const { stdout } = await execPromise(
          isCustom
            ? `powershell.exe -ExecutionPolicy Bypass -File ${fileName} -RunType ${runType}`
            : `powershell.exe -ExecutionPolicy Bypass -File ${appPath}\\resources\\assets\\scripts\\${fileName}.ps1 -RunType ${runType}`
        );
        out = stdout;
      } catch (error: any) {
        err = 'Script failed';
        if (error) {
          err = error.code;
          out = error.stdout;
          fs.readFile(
            isCustom
              ? `${fileName.slice(0, fileName.length - 4)}.log`
              : `${appPath}\\resources\\assets\\scripts\\${fileName}.log`,
            'utf8',
            (ferr: Error, data: string) => {
              if (ferr) throw ferr;
              ipcRenderer.send('electron-store-set', fileName, data);
              out = data;
            }
          );
        }
      }
      return [out, err];
    },
    reset() {
      ipcRenderer.send('electron-store-delete', 'data');
    },
  },
  fs: {
    getpath(key: string) {
      ipcRenderer.send('electron-fs-getpath', key);
    },
    savereport(techName: string, report: AppData[]) {
      const appPath = path.dirname(process.execPath);
      const htmlReport = pug.renderFile(
        `${appPath}\\resources\\assets\\templates\\private-notes.pug`,
        {
          sections: report,
          hostname: os.hostname,
          techName,
          date: Date(),
        }
      );
      ipcRenderer.send('electron-fs-savepath');
      const savePath = ipcRenderer.sendSync(
        'electron-store-get',
        'save-report-path'
      );
      if (!savePath) return;
      fs.writeFile(savePath, htmlReport, (err: Error) => {
        if (err) {
          ipcRenderer.send('electron-show-message', {
            title: 'Error saving report',
            message: `There was an error saving the report locally: \n ${err}`,
            type: 'error',
          });
        }
        ipcRenderer.send('electron-show-message', {
          title: 'Report saved',
          message: 'The report has been saved',
          type: 'info',
        });
      });
    },
  },
  syncro: {
    submit(privateNotes: string, publicNotes: string, fullName: string) {
      const postPublicComment = (ticketId: number) => {
        if (!publicNotes) {
          ipcRenderer.send('electron-show-message', {
            title: 'No public notes found',
            message: `There were no public notes to be published. Skipping public ticket comment.`,
            type: 'info',
          });
          return;
        }
        const commentData = JSON.stringify({
          subject: 'Public notes',
          body: publicNotes,
          hidden: false,
          do_not_email: false,
        });
        const newoptions = {
          hostname: 'company.syncromsp.com',
          port: 443,
          path: `/api/v1/tickets/${ticketId}/comment`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': commentData.length,
            Authorization:
              null, // Change to actual token
              // auth_token,
          },
        };
        const req = https.request(newoptions, (res: Http2ServerResponse) => {
          if (res.statusCode === 200) {
            ipcRenderer.send('electron-show-message', {
              title: 'Success',
              message: `Ticket number: ${ticketId}`,
              type: 'info',
            });
          } else {
            ipcRenderer.send('electron-show-message', {
              title: 'Error creating ticket',
              message: `An error occurred while creating a new ticket: status code ${res.statusCode}`,
              type: 'error',
            });
          }
        });
        req.on('error', (error: Error) => {
          ipcRenderer.send('electron-show-message', {
            title: 'Error creating ticket',
            message: `An error occurred while creating a new ticket:\n ${error}`,
            type: 'error',
          });
        });
        req.write(commentData);
        req.end();
      };
      const { ALLUSERSPROFILE } = process.env;
      let obj: any = {};
      fs.readFile(
        `${ALLUSERSPROFILE}\\Syncro\\data\\asset-info.txt`,
        'utf8',
        (ferr: Error, assetData: string) => {
          if (ferr)
            ipcRenderer.send('electron-show-message', {
              title: 'Error submitting report',
              message:
                'Asset info not found on disk or is incorrect. If the Syncro agent is installed, run the "Save asset info" script from Syncro.',
              type: 'error',
            });
          const customerId: number = +assetData.split('\n')[0];
          const assetId: number = +assetData.split('\n')[1];
          const hostName = os.hostname();
          const data = JSON.stringify({
            customer_id: customerId,
            subject: `Electron repair - Report for ${hostName}`,
            problem_type: 'Other',
            status: 'New',
            user_id: 84583,
            priority: '2 Normal',
            properties: {},
            asset_ids: [assetId],
            comments_attributes: [
              {
                subject: `${fullName}: Private notes`,
                body: privateNotes,
                hidden: true,
                do_not_email: true,
              },
              {
                subject: 'Public notes',
                body: publicNotes,
                hidden: true,
                do_not_email: true,
              },
            ],
          });
          const options = {
            hostname: 'company.syncromsp.com',
            port: 443,
            path: '/api/v1/tickets',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length,
              Authorization:
                null, // Change to actual token
                // auth_token,
            },
          };
          const req = https.request(options, (res: Http2ServerResponse) => {
            if (res.statusCode === 200) {
              ipcRenderer.send('electron-show-message', {
                title: 'Success',
                message: `A ticket was created successfully.`,
                type: 'info',
              });
            } else {
              ipcRenderer.send('electron-show-message', {
                title: 'Error creating ticket',
                message: `An error occurred while creating a new ticket: status code ${res.statusCode}`,
                type: 'error',
              });
            }
            let resData = '';
            res.on('data', (d) => {
              resData += d;
            });
            res.on('end', () => {
              obj = JSON.parse(resData);
              postPublicComment(obj.ticket.id);
            });
          });
          req.on('error', (error: Error) => {
            ipcRenderer.send('electron-show-message', {
              title: 'Error creating ticket',
              message: `An error occurred while creating a new ticket:\n${error}`,
              type: 'error',
            });
          });
          req.write(data);
          req.end();
          // ipcRenderer.send('electron-syncro-publish', assetInfo);
        }
      );
    },
  },
});
