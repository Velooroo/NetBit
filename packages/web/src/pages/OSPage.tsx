import React from 'react';
import { Desktop } from '../components/os';

interface OSPageProps {
  user?: any;
  onGetStarted?: () => void;
}

const OSPage: React.FC<OSPageProps> = ({ user, onGetStarted }) => {
  // OS-style desktop wallpaper with NetBit branding
  const wallpaper = `data:image/svg+xml,%3Csvg width='1920' height='1080' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23667eea'/%3E%3Cstop offset='100%25' stop-color='%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cg opacity='0.1'%3E%3Ccircle cx='400' cy='200' r='100' fill='white'/%3E%3Ccircle cx='1200' cy='400' r='150' fill='white'/%3E%3Ccircle cx='800' cy='700' r='80' fill='white'/%3E%3C/g%3E%3Ctext x='50%25' y='95%25' font-family='Arial, sans-serif' font-size='24' fill='white' text-anchor='middle' opacity='0.3'%3ENetBit OS Desktop%3C/text%3E%3C/svg%3E`;

  return (
    <Desktop 
      wallpaper={wallpaper}
      user={user}
      onGetStarted={onGetStarted}
    />
  );
};

export default OSPage;