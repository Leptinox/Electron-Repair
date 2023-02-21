import { useState, useEffect, createContext, ReactNode, useMemo } from 'react';

export enum ItemStatus {
  Loading = -1,
  Unset,
  Run,
  Error,
  CheckSuccess,
  QuickSuccess,
  FullSuccess,
}

export enum ItemFlag {
  Unset,
  Manual,
  Resolved,
  Auto,
}

export type Note = {
  id: number;
  noteTitle: string;
  noteBody: string;
  publish: boolean;
};

export type SubItemType = {
  subItemTitle: string;
  subItemStatus: number;
  id: number;
  subItemNotes: Note[];
  subItemFlag: number;
};

export type SectionItem = {
  itemTitle: string;
  itemStatus: number;
  default: boolean;
  itemFlag: number;
  itemCustom: boolean;
  description: string[];
  id: number;
  itemSubItems: SubItemType[];
  itemNotes: Note[];
  executable?: boolean;
  scriptFile: string | null;
  scriptOutput: string[] | null;
  scriptExitCode: number | null;
  scriptLog: string | null;
};

export interface AppData {
  sectionTitle: string;
  sectionStatus: string;
  id: number;
  sectionItems: SectionItem[];
}

interface Props {
  children: ReactNode;
}

const initData: AppData[] = [
  {
    sectionTitle: 'Inspect',
    sectionStatus: '',
    id: 0,
    sectionItems: [
      {
        itemTitle: 'Computer',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Make and Exact Model.'],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'get-computer-info',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Blow Out Dust',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          'Blow Out Dust.',
          'Check fans to be sure they are spinning freely with no bad bearings If hot during repair, make note to recheck fans and apply fresh thermal paste if needed. Best to do earlier in repair when possible than run scorching hot.',
        ],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Inspect Motherboard (Desktops)',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          'Be sure all capacitors look good and nothing is shorting/catching on fans.',
        ],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Inspect Display Assembly (Laptops)',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Loose or popping hinges.',
          '- Cracked screen, pressure spots, etc.',
        ],
        id: 3,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Inspect Chasis and Keyboard',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Check for signs on liquid damage, inspect further if necessary.',
          '- Check keyboard for missing, loose, or stuck keys.',
        ],
        id: 4,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'CPU',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Processor and Generation.'],
        id: 5,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'get-cpu-info',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Memory',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Amount and Slots Used.'],
        id: 6,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'get-memory-info',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'GPU',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['GPU Model.'],
        id: 7,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'get-gpu-info',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Check for SSD',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Check all drives and capacities.',
          'S.M.A.R.T. test drives.',
          'System drive should be SSD (note size needed).',
          'Upgrade HDD or smaller SSD to NVMe if supported.',
        ],
        id: 8,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-for-ssd',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Check Battery and Charging',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Be sure battery charges',
          '- Battery warnings',
          '- Loose or broken jack',
          '- Non-genuine charger',
        ],
        id: 9,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-battery',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Date/Time',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ["Be sure it's correct and has right time zone/DST set."],
        id: 10,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-date-time',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'HD Usage',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Check free space.',
          '- If drive is low run Disk Explorer to check why.',
        ],
        id: 11,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'hd-usage',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Customer concerns',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: ['Check/Note Customer Concerns if applicable.'],
        id: 12,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
  {
    sectionTitle: 'Standard Software Optimization',
    sectionStatus: '',
    id: 3,
    sectionItems: [
      {
        itemTitle: 'User Account Control',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: ['Slower systems lower to “Notify (do not dim)”.'],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-uac',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Check AV',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['- Check license expiration.', '- Remove bad AV.'],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-av',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Junk programs',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Adware (Maps, Toolbars, etc).',
          '- Flash/Shockwave.',
          '- Java (unless needed).',
          '- Pre-loaded junk.',
          '- Trials.',
          '- Office web apps.',
          '- Duplicates.',
          'For any adware found, check install date for more junk.',
        ],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'junk-programs',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Office App',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Note Office app:',
          '- Office 2013 or below not supported.',
          '- Office 365 license valid.',
          '- OpenOffice replace with LibreOffice.',
          '- Office missing load in LibreOffice.',
        ],
        id: 3,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-office',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'PatchMyPC',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Check updates for unwanted (be sure to uncheck after uninstalling).',
          '- Alternate Browser (if needed).',
          '- K-Lite Mega Codec (unless VLC present/preferred).',
          '- 7-Zip (unless WinRAR preferred).',
          '- Acrobat Reader DC (unless working alternate PDF program used).',
          '- LibreOffice (if needed).',
        ],
        id: 4,
        itemSubItems: [],
        itemNotes: [],
        executable: true,
        scriptFile: 'patch-my-pc',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'LibreOffice',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Default save to docx, xlsx, pptx.',
          '- Default Font Calibri.',
          '- Ribbon UI (unless standard preferred).',
        ],
        id: 5,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'libreoffice',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Appearance Tweaks',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Taskbar Search: Icon Only.',
          '- Combine Taskbar Buttons: When Taskbar is Full (unless taskbar loaded) -apply to 2nd monitor, if applicable-.',
          '- Desktop Icons: Computer, User’s Files, Recycle Bin.',
          '- News and Interests: Disable “Open on Hover”.',
        ],
        id: 6,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'appearance-tweaks',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
  {
    sectionTitle: 'Disinfect',
    sectionStatus: '',
    id: 4,
    sectionItems: [
      {
        itemTitle: 'AdwCleaner',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Run + Cleanup Adware, note # of unique items.',
          '- Junk cleanup may pick up useful pre-installed utilities.',
        ],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        executable: true,
        scriptFile: 'adwcleaner',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'HitmanPro',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Remove Infection items, note # of unique items.',
          '- Clean up tracking cookies.',
        ],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        executable: true,
        scriptFile: 'hitman-pro',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Browsers',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Uninstall if unused.',
          '- Remove junk extensions.',
          '- Install uBlock Origin.',
          '- Enable Private mode, access to file URLs.',
          '- Check search engines, default.',
          '- Check for notification spam.',
        ],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'web-browser',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
  {
    sectionTitle: 'Windows Updates',
    sectionStatus: '',
    id: 5,
    sectionItems: [
      {
        itemTitle: 'Windows Build',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Check Build, update to the latest (flash drive or update assistant) if needed.',
        ],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'windows-build',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Microsoft Update',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Windows Update > Advanced Options “Receive for other Microsoft Products”.',
        ],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'microsoft-update',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Office Update',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Office Update	Office app > File > Account > Update Options > Update Now.',
        ],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'office-update',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Microsoft Store',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Library > Get Updates.',
          '- Install Quick Assist.',
          '- Install Solitaire Collection.',
        ],
        id: 3,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'microsoft-store',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
  {
    sectionTitle: 'Drivers, BIOS and Firmware',
    sectionStatus: '',
    id: 6,
    sectionItems: [
      {
        itemTitle: 'BIOS',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Note BIOS version, check manufacturer for update.'],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'bios-version',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: "Vendor's Updater",
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          "- Be sure hardware vendor's updater is latest version (some don't auto-update).",
          '- Run updater, note drivers updated.',
          '- Remove Updater if needed (e.g., Dell Support Assist).',
        ],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Touchpad',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Check for smooth 2-finger scrolling.',
          '- Tap-to-click.',
          '- Disable if customer complains of random text jumping or disappearing.',
          '- Look for palm check or sensitivity if they complain but still want tap-to-click.',
        ],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Disk management',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Check for unformatted drives.',
          '- Check for Empty space.',
        ],
        id: 3,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'disk-management',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Device management',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Problem drivers (yellow exclamation).',
          '- Disabled drivers (up arrow icon next to them).',
          '- Missing/Unknown drivers.',
          '- Display driver (be sure not Generic Microsoft one).',
        ],
        id: 4,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'device-management',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Other updaters',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Run any other 3rd-party updaters.',
          '- For GPU, choose “clean install” unless customer has tweaks/optimizations.',
        ],
        id: 5,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Uncooperative Drivers',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Uninstall problem drivers, refresh device manager.',
          '- If problem driver returns, check “delete software” box when uninstalling.',
          '- Google Hardware ID for driver info.',
          '- Look under downloads for computer model, including compatible OSes.',
          '- Looks for generics from device manufacturer.',
          '- Side-load if necessary.',
          '- Run, then uninstall DriverBooster.',
        ],
        id: 6,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
  {
    sectionTitle: 'Optimize and Finalize',
    sectionStatus: '',
    id: 7,
    sectionItems: [
      {
        itemTitle: 'Fan running/System hot',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          'If noted hot during repair and not addressed, recheck fans and apply fresh thermal paste if needed.',
        ],
        id: 0,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Default Apps',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Default Browser.',
          '- Default Mail.',
          '- Default PDF Adobe (unless other installed).',
          '- Default ZIP Windows Explorer.',
        ],
        id: 1,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'default-apps',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Recheck for Junk',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Recheck Installed Programs for Junk & Duplicates.'],
        id: 2,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'junk-programs',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Quickbooks',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          'Be sure up-to-date, may require multiple updater runs.',
          'If license error occurs:',
          '- Delete %ProgramData%IntuitEntitlement Client\\v8 EntitlementDataStore.ecml',
          '- Activate again.',
        ],
        id: 3,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Check Drives',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- SSD check TRIM status.',
          '- SSD check drive alignment.',
          '- Check Partition Sizes.',
          '- Check SMART Status.',
        ],
        id: 4,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'check-drives',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Glary Utilities',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['Run Glary Optimization.'],
        id: 5,
        itemSubItems: [],
        itemNotes: [],
        executable: true,
        scriptFile: 'glary-utilities',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Wallpapers',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          'If default Windows one, copy Wallpapers folder, set slideshow (NOT random).',
        ],
        id: 6,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Windows Security Check',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: ['AV, Firewall, App & browser control all on.'],
        id: 7,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: 'windows-security-check',
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Backup Check',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Backup solution working and properly configured (if applicable).',
          '- OneDrive:',
          '-- Set to Backup.',
          '-- Enough space.',
          '-- Keep copy locally.',
          '-- Conflicts resolved.',
          '- LiveDrive:',
          '-- Backing Up.',
          '-- Interval Set.',
          '-- Bandwidth limited.',
        ],
        id: 8,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'System Restore',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          '- Clear Restore Points.',
          '- Check size and disks.',
          '- Create Restore Point.',
        ],
        id: 9,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Reboot',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Check startup time.',
          '- Be sure no errors or pop-ups coming up on boot.',
        ],
        id: 10,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Recheck Customer Concerns',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: true,
        itemCustom: false,
        description: [
          'Check customer concerns on ticket to be sure they have all been checked.',
        ],
        id: 11,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
      {
        itemTitle: 'Clean Computer',
        itemStatus: ItemStatus.Unset,
        itemFlag: ItemFlag.Unset,
        default: false,
        itemCustom: false,
        description: [
          '- Check repairs done, be sure all completed and screws/dongles/etc all back in.',
          '- Be sure our devices are removed.',
          '- Clean case and screen.',
        ],
        id: 12,
        itemSubItems: [],
        itemNotes: [],
        scriptFile: null,
        scriptOutput: null,
        scriptExitCode: null,
        scriptLog: null,
      },
    ],
  },
];

const DataContext = createContext({
  data: [],
  onReset: () => {},
  onItemAdd: (_id: number) => {},
  onItemChange: (
    _sectionId: number,
    _itemId: number,
    _itemData: SectionItem
  ) => {},
  onItemRemove: (_sectionId: number, _itemId: number) => {},
  onSubItemAdd: (_sectionId: number, _itemId: number) => {},
  onItemAddNote: (_sectionId: number, _itemId: number) => {},
  onItemNoteChange: (
    _sectionId: number,
    _itemId: number,
    _noteId: number,
    _newNote: Note
  ) => {},
  onSubItemChange: (
    _sectionId: number,
    _itemId: number,
    _subItemId: number,
    _subData: SubItemType
  ) => {},
  onSubItemNoteAdd: (
    _sectionId: number,
    _itemId: number,
    _subItemId: number
  ) => {},
  onItemNoteRemove: (
    _sectionId: number,
    _itemId: number,
    _noteId: number
  ) => {},
  onSubItemNoteChange: (
    _sectionId: number,
    _itemId: number,
    _subItemId: number,
    _noteId: number,
    _newNote: Note
  ) => {},
  onSubItemNoteRemove: (
    _sectionId: number,
    _itemId: number,
    _subItemId: number,
    _noteId: number
  ) => {},
  onSubItemRemove: (
    _sectionId: number,
    _itemId: number,
    _subItemId: number
  ) => {},
});

export function DataContextProvider({ children }: Props) {
  if (!window.electron.store.get('data')) {
    window.electron.store.set('data', initData);
  }
  const [items, addData] = useState(window.electron.store.get('data'));

  useEffect(() => {
    window.electron.store.set('data', items);
  }, [items]);

  const handleReset = () => {
    addData(initData);
  };

  const handleSectionItemsAdd = (id: number) => {
    const newItem = {
      itemTitle: '',
      itemStatus: ItemStatus.Unset,
      itemFlag: ItemFlag.Manual,
      default: false,
      itemCustom: true,
      description: [],
      id: Math.random(),
      itemSubItems: [],
      itemNotes: [],
      scriptFile: null,
      scriptOutput: null,
      scriptExitCode: null,
      scriptLog: null,
    };
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === id) {
          section.sectionItems.push(newItem);
          return section;
        }
        return section;
      })
    );
  };

  const handleItemNotesAdd = (sectionId: number, itemId: number) => {
    const newNote: Note = {
      noteTitle: '',
      noteBody: '',
      id: Math.random(),
      publish: false,
    };
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemNotes.push(newNote);
            }
          });
        }
        return section;
      })
    );
  };

  const handleItemChange = (
    sectionId: number,
    itemId: number,
    itemData: SectionItem
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemTitle = itemData.itemTitle;
              item.itemStatus = itemData.itemStatus;
              item.itemFlag = itemData.itemFlag;
              item.itemNotes = itemData.itemNotes;
              item.scriptOutput = itemData.scriptOutput;
              item.scriptExitCode = itemData.scriptExitCode;
              item.scriptFile = itemData.scriptFile;
              item.scriptLog = itemData.scriptLog;
            }
          });
        }
        return section;
      })
    );
  };

  const handleItemSubItemsAdd = (sectionId: number, itemId: number) => {
    const newSubItem: SubItemType = {
      subItemTitle: '',
      subItemStatus: ItemStatus.Unset,
      id: Math.random(),
      subItemNotes: [],
      subItemFlag: ItemFlag.Manual,
    };
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.push(newSubItem);
            }
          });
        }
        return section;
      })
    );
  };

  const handleSubItemNotesAdd = (
    sectionId: number,
    itemId: number,
    subItemId: number
  ) => {
    const newNote: Note = {
      noteTitle: '',
      noteBody: '',
      id: Math.random(),
      publish: false,
    };
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.forEach((subItem: SubItemType) => {
                if (subItem.id === subItemId) {
                  subItem.subItemNotes.push(newNote);
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleSubItemNoteChange = (
    sectionId: number,
    itemId: number,
    subItemId: number,
    noteId: number,
    newNote: Note
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.forEach((subItem: SubItemType) => {
                if (subItem.id === subItemId) {
                  subItem.subItemNotes.forEach((note: Note) => {
                    if (note.id === noteId) {
                      note.noteTitle = newNote.noteTitle;
                      note.noteBody = newNote.noteBody;
                      note.publish = newNote.publish;
                    }
                  });
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleSubItemChange = (
    sectionId: number,
    itemId: number,
    subItemId: number,
    subData: SubItemType
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.forEach((subItem: SubItemType) => {
                if (subItem.id === subItemId) {
                  subItem.subItemTitle = subData.subItemTitle;
                  subItem.subItemStatus = subData.subItemStatus;
                  subItem.subItemFlag = subData.subItemFlag;
                  subItem.subItemNotes = subData.subItemNotes;
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleItemNoteChange = (
    sectionId: number,
    itemId: number,
    noteId: number,
    newNote: Note
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemNotes.forEach((note: Note) => {
                if (note.id === noteId) {
                  note.noteTitle = newNote.noteTitle;
                  note.noteBody = newNote.noteBody;
                  note.publish = newNote.publish;
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleItemNoteRemove = (
    sectionId: number,
    itemId: number,
    noteId: number
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemNotes.forEach((note: Note) => {
                if (note.id === noteId) {
                  const index = item.itemNotes.indexOf(note);
                  item.itemNotes.splice(index, 1);
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleSubItemRemove = (
    sectionId: number,
    itemId: number,
    subItemId: number
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.forEach((subItem: SubItemType) => {
                if (subItem.id === subItemId) {
                  const index = item.itemSubItems.indexOf(subItem);
                  item.itemSubItems.splice(index, 1);
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleSubItemNotesRemove = (
    sectionId: number,
    itemId: number,
    subItemId: number,
    noteId: number
  ) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              item.itemSubItems.forEach((subitem: SubItemType) => {
                if (subitem.id === subItemId) {
                  subitem.subItemNotes.forEach((note: Note) => {
                    if (note.id === noteId) {
                      const index = subitem.subItemNotes.indexOf(note);
                      subitem.subItemNotes.splice(index, 1);
                    }
                  });
                }
              });
            }
          });
        }
        return section;
      })
    );
  };

  const handleItemRemove = (sectionId: number, itemId: number) => {
    addData((prevData: AppData[]) =>
      prevData.map((section): AppData => {
        if (section.id === sectionId) {
          section.sectionItems.forEach((item: SectionItem) => {
            if (item.id === itemId) {
              const index = section.sectionItems.indexOf(item);
              section.sectionItems.splice(index, 1);
            }
          });
        }
        return section;
      })
    );
  };

  const context = useMemo(
    () => ({
      data: items,
      onReset: handleReset,
      onItemAdd: handleSectionItemsAdd,
      onItemChange: handleItemChange,
      onItemAddNote: handleItemNotesAdd,
      onItemNoteRemove: handleItemNoteRemove,
      onItemNoteChange: handleItemNoteChange,
      onItemRemove: handleItemRemove,
      onSubItemAdd: handleItemSubItemsAdd,
      onSubItemChange: handleSubItemChange,
      onSubItemNoteAdd: handleSubItemNotesAdd,
      onSubItemNoteRemove: handleSubItemNotesRemove,
      onSubItemNoteChange: handleSubItemNoteChange,
      onSubItemRemove: handleSubItemRemove,
    }),
    [items]
  );

  return (
    <DataContext.Provider value={context}>{children}</DataContext.Provider>
  );
}

export default DataContext;
