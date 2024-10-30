'use client';
import { LicenseInfo } from '@mui/x-license';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_MUI_X_LICENSE_KEY: string;
    }
  }
}

const MuiXLicense: React.FC = () => {
  LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY);
  return null;
};

export default MuiXLicense;