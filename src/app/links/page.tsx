'use client';

import * as React from 'react';

import FolderCard from '@/components/links/FolderCard';
import LinkButton from '@/components/links/LinkButton';
import ProfileHeader from '@/components/links/ProfileHeader';
import Loading from '@/components/Loading';
import { DANGER_TOAST, showToast } from '@/components/Toast';
import Typography from '@/components/Typography';

import { useGetLinksHomepage } from '@/app/links/hook/useLink';

import { getLinkTargetUrl } from '@/lib/link-url';

import { Folder, Link } from '@/types/entities/links';

export default function LinksPage() {
  const {
    data: homepageData,
    isLoading,
    fetchLinksHomepage,
  } = useGetLinksHomepage();
  const linksData = React.useMemo(() => {
    if (!homepageData)
      return { general_links: [], category_links: [], folders: [], categories: [] };
    return {
      general_links: homepageData.general_links || [],
      category_links: homepageData.category_links || [],
      folders: homepageData.folders || [],
      categories: homepageData.categories || [],
    };
  }, [homepageData]);

  React.useEffect(() => {
    fetchLinksHomepage();
  }, [fetchLinksHomepage]);

  React.useEffect(() => {
    const hasInvalidFolderKey = sessionStorage.getItem('links:folder-key-invalid');
    if (!hasInvalidFolderKey) return;

    sessionStorage.removeItem('links:folder-key-invalid');
    showToast('Key folder salah', DANGER_TOAST);
  }, []);

  const { general_links, category_links, folders, categories } = linksData;

  // Group folders by category
  const foldersByCategory = React.useMemo(() => {
    const grouped: Record<string, Folder[]> = {};
    const uncategorized: Folder[] = [];

    folders.forEach((folder) => {
      if (folder.category_id) {
        if (!grouped[folder.category_id]) {
          grouped[folder.category_id] = [];
        }
        grouped[folder.category_id].push(folder);
      } else {
        uncategorized.push(folder);
      }
    });

    return { grouped, uncategorized };
  }, [folders]);

  const categoryLinksByCategory = React.useMemo(() => {
    const grouped: Record<string, Link[]> = {};

    category_links.forEach((link) => {
      if (!link.category_id) return;

      if (!grouped[link.category_id]) {
        grouped[link.category_id] = [];
      }

      grouped[link.category_id].push(link);
    });

    return grouped;
  }, [category_links]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        {/* Profile section with reusable component */}
        <ProfileHeader />

        {/* Content container */}
        <div className='w-full max-w-md md:max-w-3xl lg:max-w-5xl space-y-8'>
          {/* Static About Link */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <LinkButton
                title='Tentang Kabinet Ekselensi'
                url='/about'
                variant='orange'
                newTab={false}
              />
              <LinkButton
                title='Transparansi Keuangan'
                url='/finance'
                variant='general'
                newTab={false}
              />
                <LinkButton
                  title='Kalender Kegiatan'
                url='/kalender'
                variant='general'
                newTab={false}
              />
            </div>
          </div>

          {/* General Links section */}
          {general_links.length > 0 && (
            <div className='space-y-4'>
              <div className='space-y-3'>
                {general_links.map((link) => (
                  <LinkButton
                    key={link.link_id}
                    title={link.title}
                    url={getLinkTargetUrl(link)}
                    variant='blue'
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category Sections */}
          {categories.map((category) => {
            const categoryFolders =
              foldersByCategory.grouped[category.category_id];
            const categoryDirectLinks =
              categoryLinksByCategory[category.category_id] || [];

            if (
              (!categoryFolders || categoryFolders.length === 0) &&
              categoryDirectLinks.length === 0
            ) {
              return null;
            }

            return (
              <div key={category.category_id} className='space-y-4'>
                <div className='relative flex items-center justify-center my-6'>
                  <div className='absolute border-t border-white/30 w-full'></div>
                  <div className='relative bg-brand-green px-4'>
                    <Typography
                      as='h2'
                      variant='h6'
                      className='text-center text-white'
                      weight='medium'
                    >
                      {category.title}
                    </Typography>
                  </div>
                </div>

                {categoryDirectLinks.length > 0 && (
                  <div className='space-y-3'>
                    {categoryDirectLinks.map((link) => (
                      <LinkButton
                        key={link.link_id}
                        title={link.title}
                        url={getLinkTargetUrl(link)}
                        variant='blue'
                      />
                    ))}
                  </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {categoryFolders?.map((folder) => (
                    <FolderCard
                      key={folder.folder_id}
                      title={folder.title}
                      folderId={folder.folder_id}
                      isLocked={folder.is_locked}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized Folders */}
          {foldersByCategory.uncategorized.length > 0 && (
            <div className='space-y-4'>
              <div className='relative flex items-center justify-center my-6'>
                <div className='absolute border-t border-white/30 w-full'></div>
                <div className='relative bg-brand-green px-4'>
                  <Typography
                    as='h2'
                    variant='h6'
                    className='text-center text-white'
                    weight='medium'
                  >
                    Lainnya
                  </Typography>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                {foldersByCategory.uncategorized.map((folder) => (
                  <FolderCard
                    key={folder.folder_id}
                    title={folder.title}
                    folderId={folder.folder_id}
                    isLocked={folder.is_locked}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className='h-12'></div>
      </div>
    </>
  );
}
