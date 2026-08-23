'use client';

import * as React from 'react';

import FolderCard from '@/components/links/FolderCard';
import LinkButton from '@/components/links/LinkButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 py-12 px-4 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-[1312px] space-y-10'>
          {/* Header */}
          <div className='space-y-3 max-w-2xl'>
            <h1 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#146637] tracking-tight'>
              Portal Link & Resource
            </h1>
            <p className='font-hanken text-lg sm:text-xl text-slate-600 leading-relaxed'>
              Akses cepat ke berbagai sumber daya, tautan penting, serta berkas resmi JMMI ITS.
            </p>
          </div>

          {/* Quick Navigation Buttons */}
          <div className='grid gap-4 sm:grid-cols-3'>
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

          {/* General Links section */}
          {general_links.length > 0 && (
            <div className='space-y-4 pt-4'>
              <h2 className='font-sora text-xl font-bold text-slate-900 border-b border-gray-100 pb-3'>
                Tautan Utama
              </h2>
              <div className='grid gap-3.5 sm:grid-cols-2'>
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
              <div key={category.category_id} className='space-y-5 pt-4'>
                <h2 className='font-sora text-xl font-bold text-slate-900 border-b border-gray-100 pb-3'>
                  {category.title}
                </h2>

                {categoryDirectLinks.length > 0 && (
                  <div className='grid gap-3 sm:grid-cols-2'>
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

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
            <div className='space-y-5 pt-4'>
              <h2 className='font-sora text-xl font-bold text-slate-900 border-b border-gray-100 pb-3'>
                Folder Lainnya
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
      </main>

      <Footer />
    </div>
  );
}

