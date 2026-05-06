'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import Typography from '@/components/Typography';

import { useGetCategories } from '@/app/links/hook/useCategory';
import { useGetFolders } from '@/app/links/hook/useFolder';
import { useCreateLink } from '@/app/links/hook/useLink';
import { useGetSubheadings } from '@/app/links/hook/useSubheading';

const GENERAL_CATEGORY_OPTION = '__general_category__';
const UNCATEGORIZED_CATEGORY_OPTION = '__uncategorized_category__';
const GENERAL_FOLDER_OPTION = '__general__';
const NO_SUBHEADING_OPTION = '__no_subheading__';

export default function AddLinkPage() {
  const router = useRouter();

  const { mutateAsync: createLink } = useCreateLink();
  const { data: categories, fetchCategories } = useGetCategories();
  const { data: folders, fetchFolders } = useGetFolders();
  const { data: subheadings, fetchSubheadings } = useGetSubheadings();

  // Form state
  const [selectedCategory, setSelectedCategory] = React.useState<string>(GENERAL_CATEGORY_OPTION);
  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  const [useSubheading, setUseSubheading] = React.useState<string>('tidak');
  const [selectedSubheading, setSelectedSubheading] =
    React.useState<string>('');
  const [linkTitle, setLinkTitle] = React.useState<string>('');
  const [linkUrl, setLinkUrl] = React.useState<string>('');

  // Filtered subheadings based on selected folder
  const filteredSubheadings = React.useMemo(() => {
    if (!selectedFolder || selectedFolder === GENERAL_FOLDER_OPTION || !subheadings) return [];
    return subheadings.filter((sub) => sub.folder_id === selectedFolder);
  }, [selectedFolder, subheadings]);

  const filteredFolders = React.useMemo(() => {
    if (selectedCategory === GENERAL_CATEGORY_OPTION) return [];
    if (selectedCategory === UNCATEGORIZED_CATEGORY_OPTION) {
      return folders.filter((folder) => !folder.category_id);
    }
    return folders.filter((folder) => folder.category_id === selectedCategory);
  }, [folders, selectedCategory]);

  const hasUncategorizedFolders = React.useMemo(
    () => folders.some((folder) => !folder.category_id),
    [folders]
  );

  React.useEffect(() => {
    fetchCategories();
    fetchFolders();
    fetchSubheadings();
  }, [fetchCategories, fetchFolders, fetchSubheadings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!linkTitle || !linkUrl) {
      alert('Judul link dan URL harus diisi!');
      return;
    }

    if (
      selectedCategory === UNCATEGORIZED_CATEGORY_OPTION &&
      selectedFolder === GENERAL_FOLDER_OPTION
    ) {
      alert('Pilih folder terlebih dahulu!');
      return;
    }

    // Prepare data
    const linkData = {
      category_id:
        selectedCategory !== GENERAL_CATEGORY_OPTION &&
        selectedCategory !== UNCATEGORIZED_CATEGORY_OPTION &&
        selectedFolder === GENERAL_FOLDER_OPTION
          ? selectedCategory
          : null,
      folder_id:
        selectedCategory === GENERAL_CATEGORY_OPTION ||
        selectedFolder === GENERAL_FOLDER_OPTION
          ? null
          : selectedFolder,
      subheading_id:
        selectedFolder === GENERAL_FOLDER_OPTION || useSubheading !== 'ya'
          ? null
          : selectedSubheading,
      title: linkTitle,
      link: linkUrl,
      weight: 0, // Default weight
    };

    // console.log('Submitting link:', linkData);

    try {
      const response = await createLink(linkData);
      if (response.status) {
        router.push('/links/admin');
      } else {
        alert(response.message || 'Gagal membuat link');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat membuat link');
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-lg space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <Typography
              as='h2'
              variant='h5'
              className='text-white font-bold tracking-tight'
            >
              Tambah Link
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl'
          >
            {/* 1. Kategori */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Kategori
              </label>
              <div className='relative'>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedFolder(GENERAL_FOLDER_OPTION);
                    setUseSubheading('tidak');
                    setSelectedSubheading('');
                  }}
                  className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                >
                  <option value={GENERAL_CATEGORY_OPTION} className='bg-gray-800 text-gray-300'>
                    Link tanpa folder
                  </option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id} className='bg-gray-800 text-white'>
                      {category.title}
                    </option>
                  ))}
                  {hasUncategorizedFolders && (
                    <option value={UNCATEGORIZED_CATEGORY_OPTION} className='bg-gray-800 text-white'>
                      Tanpa kategori
                    </option>
                  )}
                </select>
                <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Folder */}
            {selectedCategory !== GENERAL_CATEGORY_OPTION && (
              <div className='space-y-2 animate-fade-in'>
                <label className='block text-gray-200 text-sm font-medium ml-1'>
                  Folder
                </label>
                <div className='relative'>
                  <select
                    value={selectedFolder}
                    onChange={(e) => {
                      setSelectedFolder(e.target.value);
                      setUseSubheading('tidak');
                      setSelectedSubheading('');
                    }}
                    className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                  >
                    <option value={GENERAL_FOLDER_OPTION} className='bg-gray-800 text-gray-300'>
                      {selectedCategory === UNCATEGORIZED_CATEGORY_OPTION
                        ? 'Pilih folder'
                        : 'Langsung di kategori ini'}
                    </option>
                    {filteredFolders.map((folder) => (
                      <option
                        key={folder.folder_id}
                        value={folder.folder_id}
                        className='bg-gray-800 text-white'
                      >
                        {folder.title}
                      </option>
                    ))}
                  </select>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Pakai Subheading Toggle */}
            {selectedCategory !== GENERAL_CATEGORY_OPTION && (
              <div className='space-y-2 animate-fade-in'>
                <label className='block text-gray-200 text-sm font-medium ml-1'>
                  Pakai Subheading atau Tidak
                </label>
                <div className='relative'>
                  <select
                    value={useSubheading}
                    onChange={(e) => setUseSubheading(e.target.value)}
                    className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                  >
                    <option value='tidak' className='bg-gray-800 text-white'>
                      Tidak
                    </option>
                    <option value='ya' className='bg-gray-800 text-white'>
                      Ya
                    </option>
                  </select>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Pilih Subheading */}
            {selectedCategory !== GENERAL_CATEGORY_OPTION &&
              useSubheading === 'ya' && (
                <div className='space-y-2 animate-fade-in'>
                  <label className='block text-gray-200 text-sm font-medium ml-1'>
                    Pilih Subheading
                  </label>
                  <div className='relative'>
                    <select
                      value={selectedSubheading}
                      onChange={(e) => setSelectedSubheading(e.target.value)}
                      className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                    >
                      <option value='' className='bg-gray-800 text-gray-300'>
                        Pilih Subheading
                      </option>
                      {filteredSubheadings.map((sub) => (
                        <option
                          key={sub.subheading_id}
                          value={sub.subheading_id}
                          className='bg-gray-800 text-white'
                        >
                          {sub.title}
                        </option>
                      ))}
                    </select>
                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

            {/* 5. Judul Link */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Judul Link
              </label>
              <input
                type='text'
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder='Tambahkan judul link'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
            </div>

            {/* 6. Link URL */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Link yang ingin ditambahkan
              </label>
              <input
                type='url'
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder='Tambahkan link URL'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
            </div>

            {/* Actions */}
            <div className='pt-6 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300'
              >
                Submit
              </button>
            </div>
          </form>

          <BackButton />
        </div>
      </div>
    </>
  );
}
