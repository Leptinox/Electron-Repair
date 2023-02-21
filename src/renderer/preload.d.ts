import { Channels } from 'main/preload';
import { AppData } from '../data/data-context';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
      store: {
        delete: (key: string) => any;
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        // any other methods you've defined...
        run: (fileName: string, isCustom_: boolean, run: string) => string[];
        reset: () => void;
      };
      message: {
        show: (title: string, message: string, type: string) => void;
      };
      fs: {
        getpath: (key: string) => string;
        savereport: (techName: string, report: AppData[]) => void;
      };
      syncro: {
        submit: (
          privateNotes: string,
          publicNotes: string,
          fullName: string
        ) => void;
      };
    };
  }
}

export {};
