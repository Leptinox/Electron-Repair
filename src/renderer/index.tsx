import { createRoot } from 'react-dom/client';
import { ColorModeScript } from '@chakra-ui/react';
import theme from './theme';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
