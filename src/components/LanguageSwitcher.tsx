import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    
    // Update user preferences in the database
    if (session?.user) {
      try {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: lng,
          }),
        });
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }

    // Refresh the page to apply the new language
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md ${
          i18n.language === 'en'
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded-md ${
          i18n.language === 'es'
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Español
      </button>
    </div>
  );
};

export default LanguageSwitcher; 