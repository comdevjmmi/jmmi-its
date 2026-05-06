'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Plus, RefreshCw, Trash2 } from 'lucide-react';

import Button from '@/components/buttons/Button';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import { useGetCategories } from '@/app/links/hook/useCategory';
import { useGetLinks } from '@/app/links/hook/useLink';
import { useGetFolders } from '@/app/links/hook/useFolder';
import { useGetSubheadings } from '@/app/links/hook/useSubheading';
import { api } from '@/lib/api';
import { buildShortUrl } from '@/lib/link-url';
import { cn } from '@/lib/utils';
import { Link } from '@/types/entities/links';

const GENERAL_FOLDER_OPTION = '__general__';
const NO_SUBHEADING_OPTION = '__no_subheading__';
const GENERAL_CATEGORY_OPTION = '__general_category__';
const UNCATEGORIZED_CATEGORY_OPTION = '__uncategorized_category__';

type LinkFormState = {
  title: string;
  link: string;
  folder_id: string;
  subheading_id: string;
};

const EMPTY_FORM: LinkFormState = {
  title: '',
  link: '',
  folder_id: GENERAL_FOLDER_OPTION,
  subheading_id: NO_SUBHEADING_OPTION,
};

const getLinkPlacementLabel = (item: Link) => {
  if (item.subheading_id) return 'Subheading';
  if (item.folder_id) return 'Folder';
  if (item.category_id) return 'Kategori';
  return 'Umum';
};

type PreviewToolbarButtonProps = {
  icon: typeof ArrowLeft;
  children: string;
  onClick: () => void;
  className?: string;
};

function PreviewToolbarButton({ icon, children, onClick, className }: PreviewToolbarButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      leftIcon={icon}
      onClick={onClick}
      className={cn(
        'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        className
      )}
    >
      {children}
    </Button>
  );
}

type DashboardActionButtonProps = {
  children: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'outline' | 'ghost';
  leftIcon?: typeof ArrowLeft;
  disabled?: boolean;
  className?: string;
};

function DashboardActionButton({
  children,
  onClick,
  type = 'button',
  variant = 'outline',
  leftIcon: LeftIcon,
  disabled,
  className,
}: DashboardActionButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size='sm'
      leftIcon={LeftIcon}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}

export default function AdminLinksDashboardPage() {
  const queryClient = useQueryClient();
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  const { data: categories = [] } = useGetCategories();
  const { data: links } = useGetLinks();
  const { data: folders = [] } = useGetFolders();
  const { data: subheadings = [] } = useGetSubheadings();

  const [draftLinks, setDraftLinks] = useState<Link[]>([]);
  const [formState, setFormState] = useState<LinkFormState>(EMPTY_FORM);
  const [formCategoryId, setFormCategoryId] = useState<string>(GENERAL_CATEGORY_OPTION);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderCategoryId, setNewFolderCategoryId] = useState('');
  const [newFolderIsLocked, setNewFolderIsLocked] = useState(false);
  const [newFolderAccessKey, setNewFolderAccessKey] = useState('');
  const [newSubheadingTitle, setNewSubheadingTitle] = useState('');
  const [newSubheadingFolderId, setNewSubheadingFolderId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingSubheading, setIsCreatingSubheading] = useState(false);
  const [activeCreateModal, setActiveCreateModal] = useState<'category' | 'folder' | 'subheading' | 'link' | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSubheadingId, setEditingSubheadingId] = useState<string | null>(null);
  const [categoryDraftTitle, setCategoryDraftTitle] = useState('');
  const [categoryDraftWeight, setCategoryDraftWeight] = useState('0');
  const [folderDraftTitle, setFolderDraftTitle] = useState('');
  const [folderDraftWeight, setFolderDraftWeight] = useState('0');
  const [folderDraftCategoryId, setFolderDraftCategoryId] = useState('');
  const [folderDraftIsLocked, setFolderDraftIsLocked] = useState(false);
  const [folderDraftWasLocked, setFolderDraftWasLocked] = useState(false);
  const [folderDraftAccessKey, setFolderDraftAccessKey] = useState('');
  const [subheadingDraftTitle, setSubheadingDraftTitle] = useState('');
  const [subheadingDraftWeight, setSubheadingDraftWeight] = useState('0');
  const [subheadingDraftFolderId, setSubheadingDraftFolderId] = useState('');
  const [isStructureBusy, setIsStructureBusy] = useState(false);
  const sortedOriginalLinks = useMemo(() => {
    return [...(links ?? [])].sort((a, b) => b.weight - a.weight);
  }, [links]);

  const previewKey = useMemo(() => {
    const linkStamp = sortedOriginalLinks
      .map(
        (item) =>
          `${item.link_id}:${item.title}:${item.link}:${item.category_id ?? ''}:${item.folder_id ?? ''}:${item.subheading_id ?? ''}:${item.weight}`
      )
      .join('|');
    const categoryStamp = categories
      .map((item) => `${item.category_id}:${item.title}:${item.weight}`)
      .join('|');
    const folderStamp = folders
      .map(
        (item) => `${item.folder_id}:${item.title}:${item.category_id ?? ''}:${item.weight}`
      )
      .join('|');
    const subheadingStamp = subheadings
      .map((item) => `${item.subheading_id}:${item.title}:${item.folder_id}:${item.weight}`)
      .join('|');

    return [linkStamp, categoryStamp, folderStamp, subheadingStamp, previewVersion].join('::');
  }, [categories, folders, previewVersion, sortedOriginalLinks, subheadings]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.weight - a.weight);
  }, [categories]);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => b.weight - a.weight);
  }, [folders]);

  const sortedSubheadings = useMemo(() => {
    return [...subheadings].sort((a, b) => b.weight - a.weight);
  }, [subheadings]);

  const refreshStructureData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['folders'] }),
      queryClient.invalidateQueries({ queryKey: ['subheadings'] }),
      queryClient.invalidateQueries({ queryKey: ['links-homepage'] }),
    ]);
    setPreviewVersion((value) => value + 1);
  };

  const openCategoryEditor = (id: string) => {
    const item = categories.find((category) => category.category_id === id);
    if (!item) return;

    setEditingCategoryId(id);
    setCategoryDraftTitle(item.title);
    setCategoryDraftWeight(String(item.weight));
  };

  const openFolderEditor = (id: string) => {
    const item = folders.find((folder) => folder.folder_id === id);
    if (!item) return;

    setEditingFolderId(id);
    setFolderDraftTitle(item.title);
    setFolderDraftWeight(String(item.weight));
    setFolderDraftCategoryId(item.category_id ?? '');
    setFolderDraftIsLocked(item.is_locked);
    setFolderDraftWasLocked(item.is_locked);
    setFolderDraftAccessKey('');
  };

  const openSubheadingEditor = (id: string) => {
    const item = subheadings.find((subheading) => subheading.subheading_id === id);
    if (!item) return;

    setEditingSubheadingId(id);
    setSubheadingDraftTitle(item.title);
    setSubheadingDraftWeight(String(item.weight));
    setSubheadingDraftFolderId(item.folder_id);
  };

  const resetStructureEditors = () => {
    setEditingCategoryId(null);
    setEditingFolderId(null);
    setEditingSubheadingId(null);
    setCategoryDraftTitle('');
    setCategoryDraftWeight('0');
    setFolderDraftTitle('');
    setFolderDraftWeight('0');
    setFolderDraftCategoryId('');
    setFolderDraftIsLocked(false);
    setFolderDraftWasLocked(false);
    setFolderDraftAccessKey('');
    setSubheadingDraftTitle('');
    setSubheadingDraftWeight('0');
    setSubheadingDraftFolderId('');
  };

  const closeCreateModal = () => {
    setActiveCreateModal(null);
    resetForm();
    setNewCategoryTitle('');
    setNewFolderTitle('');
    setNewFolderCategoryId('');
    setNewFolderIsLocked(false);
    setNewFolderAccessKey('');
    setNewSubheadingTitle('');
    setNewSubheadingFolderId('');
  };

  useEffect(() => {
    setDraftLinks((previous) => {
      const hasSameOrderAndContent =
        previous.length === sortedOriginalLinks.length &&
        previous.every((item, index) => {
          const nextItem = sortedOriginalLinks[index];
          return (
            item.link_id === nextItem?.link_id &&
            item.title === nextItem?.title &&
            item.link === nextItem?.link &&
            item.category_id === nextItem?.category_id &&
            item.folder_id === nextItem?.folder_id &&
            item.subheading_id === nextItem?.subheading_id &&
            item.weight === nextItem?.weight
          );
        });

      return hasSameOrderAndContent ? previous : sortedOriginalLinks;
    });
  }, [sortedOriginalLinks]);

  const formSubheadings = useMemo(() => {
    if (!formState.folder_id || formState.folder_id === GENERAL_FOLDER_OPTION) {
      return [];
    }

    return subheadings.filter((subheading) => subheading.folder_id === formState.folder_id);
  }, [formState.folder_id, subheadings]);

  const uncategorizedFolders = useMemo(() => {
    return folders.filter((folder) => !folder.category_id);
  }, [folders]);

  const formCategoryFolders = useMemo(() => {
    if (formCategoryId === GENERAL_CATEGORY_OPTION) {
      return [];
    }

    if (formCategoryId === UNCATEGORIZED_CATEGORY_OPTION) {
      return uncategorizedFolders;
    }

    return folders.filter((folder) => folder.category_id === formCategoryId);
  }, [folders, formCategoryId, uncategorizedFolders]);

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setFormCategoryId(GENERAL_CATEGORY_OPTION);
    setEditingId(null);
  };

  const handleOpenEdit = (item: Link) => {
    const selectedFolder = item.folder_id
      ? folders.find((folder) => folder.folder_id === item.folder_id)
      : null;

    setEditingId(item.link_id);
    setFormCategoryId(
      item.category_id
        ? item.category_id
        : item.folder_id
        ? selectedFolder?.category_id ?? UNCATEGORIZED_CATEGORY_OPTION
        : GENERAL_CATEGORY_OPTION
    );
    setFormState({
      title: item.title,
      link: item.link,
      folder_id: item.folder_id ?? GENERAL_FOLDER_OPTION,
      subheading_id: item.subheading_id ?? NO_SUBHEADING_OPTION,
    });
    setActiveCreateModal('link');
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm('Hapus link ini?');
    if (!shouldDelete) return;

    try {
      await api.delete(`/links/items/${id}`);
      showToast('Link berhasil dihapus', SUCCESS_TOAST);
      await queryClient.invalidateQueries({ queryKey: ['links'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menghapus link', DANGER_TOAST);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.link.trim()) {
      showToast('Judul dan URL wajib diisi', DANGER_TOAST);
      return;
    }

    try {
      new URL(formState.link);
    } catch {
      showToast('Format URL tidak valid', DANGER_TOAST);
      return;
    }

    if (
      formCategoryId === UNCATEGORIZED_CATEGORY_OPTION &&
      formState.folder_id === GENERAL_FOLDER_OPTION
    ) {
      showToast('Pilih folder terlebih dahulu', DANGER_TOAST);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formState.title.trim(),
      link: formState.link.trim(),
      category_id:
        formCategoryId !== GENERAL_CATEGORY_OPTION &&
        formCategoryId !== UNCATEGORIZED_CATEGORY_OPTION &&
        formState.folder_id === GENERAL_FOLDER_OPTION
          ? formCategoryId
          : null,
      folder_id:
        formCategoryId === GENERAL_CATEGORY_OPTION ||
        formState.folder_id === GENERAL_FOLDER_OPTION
          ? null
          : formState.folder_id,
      subheading_id:
        formState.folder_id === GENERAL_FOLDER_OPTION ||
        formState.subheading_id === NO_SUBHEADING_OPTION
          ? null
          : formState.subheading_id,
      weight: editingId
        ? draftLinks.find((item) => item.link_id === editingId)?.weight ?? draftLinks.length + 1
        : draftLinks.length + 1,
    };

    try {
      if (editingId) {
        await api.put(`/links/items/${editingId}`, payload);
        showToast('Link berhasil diperbarui', SUCCESS_TOAST);
      } else {
        await api.post('/links/items', payload);
        showToast('Link berhasil ditambahkan', SUCCESS_TOAST);
      }

      closeCreateModal();
      await queryClient.invalidateQueries({ queryKey: ['links'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menyimpan link', DANGER_TOAST);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLinksHome = () => {
    if (!previewFrameRef.current) return;

    previewFrameRef.current.src = `/links?preview=${encodeURIComponent(previewKey)}`;
  };

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCategoryTitle.trim()) {
      showToast('Nama kategori wajib diisi', DANGER_TOAST);
      return;
    }

    setIsCreatingCategory(true);
    try {
      await api.post('/links/categories', {
        title: newCategoryTitle.trim(),
        weight: categories.length + 1,
      });
      showToast('Kategori berhasil ditambahkan', SUCCESS_TOAST);
      closeCreateModal();
      await refreshStructureData();
    } catch {
      showToast('Gagal menambahkan kategori', DANGER_TOAST);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateFolder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newFolderTitle.trim() || !newFolderCategoryId) {
      showToast('Nama folder dan kategori wajib dipilih', DANGER_TOAST);
      return;
    }

    if (newFolderIsLocked && !newFolderAccessKey.trim()) {
      showToast('Key folder wajib diisi saat folder dikunci', DANGER_TOAST);
      return;
    }

    setIsCreatingFolder(true);
    try {
      await api.post('/links/folders', {
        title: newFolderTitle.trim(),
        category_id: newFolderCategoryId,
        weight: folders.length + 1,
        access_key: newFolderIsLocked ? newFolderAccessKey.trim() : null,
      });
      showToast('Folder berhasil ditambahkan', SUCCESS_TOAST);
      closeCreateModal();
      await refreshStructureData();
    } catch {
      showToast('Gagal menambahkan folder', DANGER_TOAST);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCreateSubheading = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newSubheadingTitle.trim() || !newSubheadingFolderId) {
      showToast('Nama subheading dan folder wajib dipilih', DANGER_TOAST);
      return;
    }

    setIsCreatingSubheading(true);
    try {
      const selectedFolderSubheadings = subheadings.filter(
        (subheading) => subheading.folder_id === newSubheadingFolderId
      );

      await api.post('/links/subheadings', {
        title: newSubheadingTitle.trim(),
        folder_id: newSubheadingFolderId,
        weight: selectedFolderSubheadings.length + 1,
      });
      showToast('Subheading berhasil ditambahkan', SUCCESS_TOAST);
      closeCreateModal();
      await refreshStructureData();
    } catch {
      showToast('Gagal menambahkan subheading', DANGER_TOAST);
    } finally {
      setIsCreatingSubheading(false);
    }
  };

  const handleUpdateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingCategoryId) return;
    if (!categoryDraftTitle.trim()) {
      showToast('Nama kategori wajib diisi', DANGER_TOAST);
      return;
    }

    setIsStructureBusy(true);
    try {
      await api.put(`/links/categories/${editingCategoryId}`, {
        title: categoryDraftTitle.trim(),
        weight: Number.parseInt(categoryDraftWeight, 10) || 0,
      });
      showToast('Kategori berhasil diperbarui', SUCCESS_TOAST);
      resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui kategori', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleUpdateFolder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingFolderId) return;
    if (!folderDraftTitle.trim()) {
      showToast('Nama folder wajib diisi', DANGER_TOAST);
      return;
    }

    setIsStructureBusy(true);
    try {
      if (folderDraftIsLocked && !folderDraftWasLocked && !folderDraftAccessKey.trim()) {
        showToast('Key folder wajib diisi saat pertama kali mengunci folder', DANGER_TOAST);
        return;
      }

      const payload: Record<string, string | number | null> = {
        title: folderDraftTitle.trim(),
        weight: Number.parseInt(folderDraftWeight, 10) || 0,
      };

      if (folderDraftCategoryId) {
        payload.category_id = folderDraftCategoryId;
      }

      if (!folderDraftIsLocked) {
        payload.access_key = null;
      } else if (folderDraftAccessKey.trim()) {
        payload.access_key = folderDraftAccessKey.trim();
      }

      await api.put(`/links/folders/${editingFolderId}`, payload);
      showToast('Folder berhasil diperbarui', SUCCESS_TOAST);
      resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui folder', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleUpdateSubheading = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSubheadingId) return;
    if (!subheadingDraftTitle.trim() || !subheadingDraftFolderId) {
      showToast('Nama subheading dan folder wajib diisi', DANGER_TOAST);
      return;
    }

    setIsStructureBusy(true);
    try {
      await api.put(`/links/subheadings/${editingSubheadingId}`, {
        title: subheadingDraftTitle.trim(),
        folder_id: subheadingDraftFolderId,
        weight: Number.parseInt(subheadingDraftWeight, 10) || 0,
      });
      showToast('Subheading berhasil diperbarui', SUCCESS_TOAST);
      resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui subheading', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const shouldDelete = window.confirm('Hapus kategori ini? Folder di dalamnya juga akan ikut terhapus.');
    if (!shouldDelete) return;

    setIsStructureBusy(true);
    try {
      await api.delete(`/links/categories/${id}`);
      showToast('Kategori berhasil dihapus', SUCCESS_TOAST);
      if (editingCategoryId === id) resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal menghapus kategori', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    const shouldDelete = window.confirm('Hapus folder ini? Subheading dan link di dalamnya juga akan ikut terhapus.');
    if (!shouldDelete) return;

    setIsStructureBusy(true);
    try {
      await api.delete(`/links/folders/${id}`);
      showToast('Folder berhasil dihapus', SUCCESS_TOAST);
      if (editingFolderId === id) resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal menghapus folder', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleDeleteSubheading = async (id: string) => {
    const shouldDelete = window.confirm('Hapus subheading ini? Link di dalamnya juga akan ikut terhapus.');
    if (!shouldDelete) return;

    setIsStructureBusy(true);
    try {
      await api.delete(`/links/subheadings/${id}`);
      showToast('Subheading berhasil dihapus', SUCCESS_TOAST);
      if (editingSubheadingId === id) resetStructureEditors();
      await refreshStructureData();
    } catch {
      showToast('Gagal menghapus subheading', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const ordered = [...sortedCategories];
    const index = ordered.findIndex((item) => item.category_id === categoryId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = ordered[index];
    const target = ordered[targetIndex];

    if (!current || !target) return;

    setIsStructureBusy(true);
    try {
      await Promise.all([
        api.put(`/links/categories/${current.category_id}`, { weight: target.weight }),
        api.put(`/links/categories/${target.category_id}`, { weight: current.weight }),
      ]);
      showToast('Urutan kategori berhasil diperbarui', SUCCESS_TOAST);
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui urutan kategori', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleReorderFolder = async (folderId: string, direction: 'up' | 'down') => {
    const current = sortedFolders.find((item) => item.folder_id === folderId);
    if (!current) return;

    const siblingFolders = sortedFolders
      .filter((item) => item.category_id === current.category_id)
      .sort((a, b) => b.weight - a.weight);
    const index = siblingFolders.findIndex((item) => item.folder_id === folderId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const target = siblingFolders[targetIndex];

    if (!target) return;

    setIsStructureBusy(true);
    try {
      await Promise.all([
        api.put(`/links/folders/${current.folder_id}`, { weight: target.weight }),
        api.put(`/links/folders/${target.folder_id}`, { weight: current.weight }),
      ]);
      showToast('Urutan folder berhasil diperbarui', SUCCESS_TOAST);
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui urutan folder', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  const handleReorderSubheading = async (subheadingId: string, direction: 'up' | 'down') => {
    const current = sortedSubheadings.find((item) => item.subheading_id === subheadingId);
    if (!current) return;

    const siblingSubheadings = sortedSubheadings
      .filter((item) => item.folder_id === current.folder_id)
      .sort((a, b) => b.weight - a.weight);
    const index = siblingSubheadings.findIndex((item) => item.subheading_id === subheadingId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const target = siblingSubheadings[targetIndex];

    if (!target) return;

    setIsStructureBusy(true);
    try {
      await Promise.all([
        api.put(`/links/subheadings/${current.subheading_id}`, { weight: target.weight }),
        api.put(`/links/subheadings/${target.subheading_id}`, { weight: current.weight }),
      ]);
      showToast('Urutan subheading berhasil diperbarui', SUCCESS_TOAST);
      await refreshStructureData();
    } catch {
      showToast('Gagal memperbarui urutan subheading', DANGER_TOAST);
    } finally {
      setIsStructureBusy(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-green-700 to-brand-green-500 p-6 text-white shadow-lg'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard Link</h1>
          <p className='mt-2 text-sm text-white/80'>
            Kelola link seperti Linktree: tambah cepat, ubah, hapus, dan drag-and-drop urutan.
          </p>
        </div>
      </div>

      <section className='rounded-2xl bg-white p-5 shadow'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Kelola Struktur Data</h2>
            <p className='text-sm text-slate-500'>
              Semua pengeditan, pemindahan parent, dan pengurutan dilakukan langsung di halaman ini.
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <DashboardActionButton
              onClick={() => setActiveCreateModal('category')}
              leftIcon={Plus}
              className='justify-center border-brand-green-200 bg-white text-brand-green-700 hover:bg-brand-green-50'
            >
              Tambah Kategori
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => setActiveCreateModal('folder')}
              leftIcon={Plus}
              disabled={categories.length === 0}
              className='justify-center border-brand-green-200 bg-white text-brand-green-700 hover:bg-brand-green-50'
            >
              Tambah Folder
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => setActiveCreateModal('subheading')}
              leftIcon={Plus}
              disabled={folders.length === 0}
              className='justify-center border-brand-green-200 bg-white text-brand-green-700 hover:bg-brand-green-50'
            >
              Tambah Subheading
            </DashboardActionButton>
            <DashboardActionButton
              onClick={() => {
                resetForm();
                setActiveCreateModal('link');
              }}
              leftIcon={Plus}
              className='justify-center border-brand-green-200 bg-white text-brand-green-700 hover:bg-brand-green-50'
            >
              Tambah Link
            </DashboardActionButton>
            {isStructureBusy && (
              <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'>
                Menyimpan perubahan...
              </div>
            )}
          </div>
        </div>

        {(categories.length === 0 || folders.length === 0) && (
          <div className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900'>
            {categories.length === 0
              ? 'Tambahkan kategori terlebih dahulu sebelum membuat folder.'
              : 'Tambahkan folder terlebih dahulu sebelum membuat subheading.'}
          </div>
        )}

        <div className='max-h-[980px] space-y-4 overflow-y-auto pr-1'>
          {sortedCategories.length === 0 && uncategorizedFolders.length === 0 && sortedOriginalLinks.length === 0 ? (
            <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
              Belum ada data struktur link.
            </div>
          ) : (
            <>
              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>Link Umum</p>
                    <p className='text-xs text-slate-500'>Link yang tidak berada dalam kategori atau folder.</p>
                  </div>
                  <span className='rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200'>
                    {sortedOriginalLinks.filter((link) => !link.category_id && !link.folder_id).length}
                  </span>
                </div>

                <div className='space-y-2'>
                  {sortedOriginalLinks.filter((link) => !link.category_id && !link.folder_id).length === 0 ? (
                    <p className='text-xs text-slate-500'>Belum ada link umum.</p>
                  ) : (
                    sortedOriginalLinks
                      .filter((link) => !link.category_id && !link.folder_id)
                      .map((link) => (
                        <div key={link.link_id} className='rounded-lg border border-slate-200 bg-white px-3 py-2'>
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <div className='min-w-0'>
                              <p className='truncate text-xs font-semibold text-slate-900'>{link.title}</p>
                              <p className='truncate text-[11px] text-slate-500'>{link.link}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700'>
                                {getLinkPlacementLabel(link)}
                              </span>
                              <DashboardActionButton
                                onClick={() => handleOpenEdit(link)}
                                variant='outline'
                                className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                              >
                                Ubah
                              </DashboardActionButton>
                              <DashboardActionButton
                                onClick={() => handleDelete(link.link_id)}
                                variant='ghost'
                                className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                              >
                                Hapus
                              </DashboardActionButton>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {sortedCategories.map((category, categoryIndex) => {
                const categoryFolders = sortedFolders.filter(
                  (folder) => folder.category_id === category.category_id
                );
                const categoryLinks = sortedOriginalLinks.filter(
                  (link) =>
                    link.category_id === category.category_id &&
                    !link.folder_id &&
                    !link.subheading_id
                );

                return (
                  <div key={category.category_id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='rounded-full bg-brand-green-700 px-2 py-0.5 text-[11px] font-semibold text-white'>
                            Kategori
                          </span>
                          <p className='truncate text-base font-semibold text-slate-900'>{category.title}</p>
                        </div>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <DashboardActionButton
                          onClick={() => handleReorderCategory(category.category_id, 'up')}
                          disabled={isStructureBusy || categoryIndex === 0}
                          variant='ghost'
                          className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        >
                          Naik
                        </DashboardActionButton>
                        <DashboardActionButton
                          onClick={() => handleReorderCategory(category.category_id, 'down')}
                          disabled={isStructureBusy || categoryIndex === sortedCategories.length - 1}
                          variant='ghost'
                          className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        >
                          Turun
                        </DashboardActionButton>
                        <DashboardActionButton
                          onClick={() =>
                            editingCategoryId === category.category_id
                              ? resetStructureEditors()
                              : openCategoryEditor(category.category_id)
                          }
                          disabled={isStructureBusy}
                          variant='outline'
                          className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                        >
                          {editingCategoryId === category.category_id ? 'Tutup' : 'Ubah'}
                        </DashboardActionButton>
                        <DashboardActionButton
                          onClick={() => handleDeleteCategory(category.category_id)}
                          disabled={isStructureBusy}
                          variant='ghost'
                          className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                        >
                          Hapus
                        </DashboardActionButton>
                      </div>
                    </div>

                    {editingCategoryId === category.category_id && (
                      <form onSubmit={handleUpdateCategory} className='mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3'>
                        <div className='space-y-1.5'>
                          <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Nama Kategori</label>
                          <input
                            type='text'
                            value={categoryDraftTitle}
                            onChange={(event) => setCategoryDraftTitle(event.target.value)}
                            className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                            disabled={isStructureBusy}
                          />
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <DashboardActionButton type='submit' variant='primary' disabled={isStructureBusy} className='justify-center'>
                            Simpan
                          </DashboardActionButton>
                          <DashboardActionButton
                            type='button'
                            variant='ghost'
                            onClick={resetStructureEditors}
                            disabled={isStructureBusy}
                            className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          >
                            Batal
                          </DashboardActionButton>
                        </div>
                      </form>
                    )}

                    {categoryLinks.length > 0 && (
                      <div className='mt-4 space-y-2 rounded-xl border border-dashed border-slate-300 bg-white p-3'>
                        <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                          Link langsung di kategori
                        </p>
                        <div className='space-y-2'>
                          {categoryLinks.map((link) => (
                            <div key={link.link_id} className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                              <p className='text-sm font-medium text-slate-900'>{link.title}</p>
                              <p className='truncate text-xs text-slate-500'>{link.link}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='mt-4 space-y-3 border-l-2 border-slate-200 pl-4'>
                      {categoryFolders.length === 0 ? (
                        <div className='rounded-xl border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500'>
                          Belum ada folder dalam kategori ini.
                        </div>
                      ) : (
                        categoryFolders.map((folder, folderIndex) => {
                          const folderSubheadings = sortedSubheadings.filter(
                            (subheading) => subheading.folder_id === folder.folder_id
                          );
                          const directLinks = sortedOriginalLinks.filter(
                            (link) => link.folder_id === folder.folder_id && !link.subheading_id
                          );

                          return (
                            <div key={folder.folder_id} className='rounded-2xl border border-slate-200 bg-white p-4'>
                              <div className='flex flex-wrap items-start justify-between gap-3'>
                                <div className='min-w-0'>
                                  <div className='flex items-center gap-2'>
                                    <span className='rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800'>
                                      Folder
                                    </span>
                                    {folder.is_locked && (
                                      <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800'>
                                        Terkunci
                                      </span>
                                    )}
                                    <p className='truncate text-sm font-semibold text-slate-900'>{folder.title}</p>
                                  </div>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                  <DashboardActionButton
                                    onClick={() => handleReorderFolder(folder.folder_id, 'up')}
                                    disabled={isStructureBusy || folderIndex === 0}
                                    variant='ghost'
                                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  >
                                    Naik
                                  </DashboardActionButton>
                                  <DashboardActionButton
                                    onClick={() => handleReorderFolder(folder.folder_id, 'down')}
                                    disabled={isStructureBusy || folderIndex === categoryFolders.length - 1}
                                    variant='ghost'
                                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  >
                                    Turun
                                  </DashboardActionButton>
                                  <DashboardActionButton
                                    onClick={() =>
                                      editingFolderId === folder.folder_id
                                        ? resetStructureEditors()
                                        : openFolderEditor(folder.folder_id)
                                    }
                                    disabled={isStructureBusy}
                                    variant='outline'
                                    className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                                  >
                                    {editingFolderId === folder.folder_id ? 'Tutup' : 'Ubah'}
                                  </DashboardActionButton>
                                  <DashboardActionButton
                                    onClick={() => handleDeleteFolder(folder.folder_id)}
                                    disabled={isStructureBusy}
                                    variant='ghost'
                                    className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                                  >
                                    Hapus
                                  </DashboardActionButton>
                                </div>
                              </div>

                              {editingFolderId === folder.folder_id && (
                                <form onSubmit={handleUpdateFolder} className='mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3'>
                                  <div className='space-y-1.5'>
                                    <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Kategori</label>
                                    <select
                                      value={folderDraftCategoryId}
                                      onChange={(event) => setFolderDraftCategoryId(event.target.value)}
                                      className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                                      disabled={isStructureBusy}
                                    >
                                      <option value=''>Pilih kategori</option>
                                      {sortedCategories.map((item) => (
                                        <option key={item.category_id} value={item.category_id}>
                                          {item.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className='space-y-1.5'>
                                    <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Nama Folder</label>
                                    <input
                                      type='text'
                                      value={folderDraftTitle}
                                      onChange={(event) => setFolderDraftTitle(event.target.value)}
                                      className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                                      disabled={isStructureBusy}
                                    />
                                  </div>
                                  <div className='space-y-1.5'>
                                    <label className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                                      <input
                                        type='checkbox'
                                        checked={folderDraftIsLocked}
                                        onChange={(event) => {
                                          const checked = event.target.checked;
                                          setFolderDraftIsLocked(checked);
                                          if (!checked) {
                                            setFolderDraftAccessKey('');
                                          }
                                        }}
                                        disabled={isStructureBusy}
                                      />
                                      Kunci Folder
                                    </label>
                                    {folderDraftIsLocked && (
                                      <>
                                        <input
                                          type='text'
                                          value={folderDraftAccessKey}
                                          onChange={(event) => setFolderDraftAccessKey(event.target.value)}
                                          placeholder={folderDraftWasLocked ? 'Isi untuk ganti key (kosong = tetap)' : 'Masukkan key folder'}
                                          className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                                          disabled={isStructureBusy}
                                        />
                                        <p className='text-[11px] text-slate-500'>
                                          {folderDraftWasLocked
                                            ? 'Key lama tidak ditampilkan. Isi jika ingin mengganti key.'
                                            : 'Folder baru dikunci wajib memiliki key.'}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                  <div className='flex flex-wrap gap-2'>
                                    <DashboardActionButton type='submit' variant='primary' disabled={isStructureBusy} className='justify-center'>
                                      Simpan
                                    </DashboardActionButton>
                                    <DashboardActionButton
                                      type='button'
                                      variant='ghost'
                                      onClick={resetStructureEditors}
                                      disabled={isStructureBusy}
                                      className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    >
                                      Batal
                                    </DashboardActionButton>
                                  </div>
                                </form>
                              )}

                              <div className='mt-3 space-y-3 border-l-2 border-slate-200 pl-4'>
                                {folderSubheadings.map((subheading, subheadingIndex) => {
                                  const subheadingLinks = sortedOriginalLinks.filter(
                                    (link) => link.subheading_id === subheading.subheading_id
                                  );

                                  return (
                                    <div key={subheading.subheading_id} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                                      <div className='flex flex-wrap items-start justify-between gap-3'>
                                        <div className='min-w-0'>
                                          <div className='flex items-center gap-2'>
                                            <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800'>
                                              Subheading
                                            </span>
                                            <p className='truncate text-sm font-semibold text-slate-900'>{subheading.title}</p>
                                          </div>
                                        </div>
                                        <div className='flex flex-wrap gap-2'>
                                          <DashboardActionButton
                                            onClick={() => handleReorderSubheading(subheading.subheading_id, 'up')}
                                            disabled={isStructureBusy || subheadingIndex === 0}
                                            variant='ghost'
                                            className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                          >
                                            Naik
                                          </DashboardActionButton>
                                          <DashboardActionButton
                                            onClick={() => handleReorderSubheading(subheading.subheading_id, 'down')}
                                            disabled={isStructureBusy || subheadingIndex === folderSubheadings.length - 1}
                                            variant='ghost'
                                            className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                          >
                                            Turun
                                          </DashboardActionButton>
                                          <DashboardActionButton
                                            onClick={() =>
                                              editingSubheadingId === subheading.subheading_id
                                                ? resetStructureEditors()
                                                : openSubheadingEditor(subheading.subheading_id)
                                            }
                                            disabled={isStructureBusy}
                                            variant='outline'
                                            className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                                          >
                                            {editingSubheadingId === subheading.subheading_id ? 'Tutup' : 'Ubah'}
                                          </DashboardActionButton>
                                          <DashboardActionButton
                                            onClick={() => handleDeleteSubheading(subheading.subheading_id)}
                                            disabled={isStructureBusy}
                                            variant='ghost'
                                            className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                                          >
                                            Hapus
                                          </DashboardActionButton>
                                        </div>
                                      </div>

                                      {editingSubheadingId === subheading.subheading_id && (
                                        <form onSubmit={handleUpdateSubheading} className='mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3'>
                                          <div className='space-y-1.5'>
                                            <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Folder</label>
                                            <select
                                              value={subheadingDraftFolderId}
                                              onChange={(event) => setSubheadingDraftFolderId(event.target.value)}
                                              className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                                              disabled={isStructureBusy}
                                            >
                                              {sortedFolders.map((item) => (
                                                <option key={item.folder_id} value={item.folder_id}>
                                                  {item.title}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className='space-y-1.5'>
                                            <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Nama Subheading</label>
                                            <input
                                              type='text'
                                              value={subheadingDraftTitle}
                                              onChange={(event) => setSubheadingDraftTitle(event.target.value)}
                                              className='w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-green-500'
                                              disabled={isStructureBusy}
                                            />
                                          </div>
                                          <div className='flex flex-wrap gap-2'>
                                            <DashboardActionButton type='submit' variant='primary' disabled={isStructureBusy} className='justify-center'>
                                              Simpan
                                            </DashboardActionButton>
                                            <DashboardActionButton
                                              type='button'
                                              variant='ghost'
                                              onClick={resetStructureEditors}
                                              disabled={isStructureBusy}
                                              className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                            >
                                              Batal
                                            </DashboardActionButton>
                                          </div>
                                        </form>
                                      )}

                                      <div className='mt-3 space-y-2 border-l-2 border-slate-200 pl-4'>
                                        {subheadingLinks.length === 0 ? (
                                          <p className='text-xs text-slate-500'>Belum ada link pada subheading ini.</p>
                                        ) : (
                                          subheadingLinks.map((link) => (
                                            <div key={link.link_id} className='rounded-lg border border-slate-200 bg-white px-3 py-2'>
                                              <div className='flex flex-wrap items-center justify-between gap-2'>
                                                <div className='min-w-0'>
                                                  <p className='truncate text-xs font-semibold text-slate-900'>{link.title}</p>
                                                  <p className='truncate text-[11px] text-slate-500'>{link.link}</p>
                                                </div>
                                                <div className='flex gap-2'>
                                                  <DashboardActionButton
                                                    onClick={() => handleOpenEdit(link)}
                                                    variant='outline'
                                                    className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                                                  >
                                                    Ubah
                                                  </DashboardActionButton>
                                                  <DashboardActionButton
                                                    onClick={() => handleDelete(link.link_id)}
                                                    variant='ghost'
                                                    className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                                                  >
                                                    Hapus
                                                  </DashboardActionButton>
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {directLinks.length > 0 && (
                                  <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3'>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                                      Link tanpa subheading
                                    </p>
                                    <div className='space-y-2'>
                                      {directLinks.map((link) => (
                                        <div key={link.link_id} className='rounded-lg border border-slate-200 bg-white px-3 py-2'>
                                          <div className='flex flex-wrap items-center justify-between gap-2'>
                                            <div className='min-w-0'>
                                              <p className='truncate text-xs font-semibold text-slate-900'>{link.title}</p>
                                              <p className='truncate text-[11px] text-slate-500'>{link.link}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                              <DashboardActionButton
                                                onClick={() => handleOpenEdit(link)}
                                                variant='outline'
                                                className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                                              >
                                                Ubah
                                              </DashboardActionButton>
                                              <DashboardActionButton
                                                onClick={() => handleDelete(link.link_id)}
                                                variant='ghost'
                                                className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                                              >
                                                Hapus
                                              </DashboardActionButton>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>Tanpa Kategori</p>
                    <p className='text-xs text-slate-500'>Folder yang belum dipindahkan ke kategori.</p>
                  </div>
                  <span className='rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200'>
                    {uncategorizedFolders.length}
                  </span>
                </div>

                <div className='space-y-3 border-l-2 border-slate-200 pl-4'>
                  {uncategorizedFolders.length === 0 ? (
                    <p className='text-xs text-slate-500'>Belum ada folder tanpa kategori.</p>
                  ) : (
                    uncategorizedFolders.map((folder, index) => {
                      const folderSubheadings = sortedSubheadings.filter(
                        (subheading) => subheading.folder_id === folder.folder_id
                      );

                      return (
                        <div key={folder.folder_id} className='rounded-xl border border-slate-200 bg-white p-3'>
                          <div className='flex flex-wrap items-start justify-between gap-2'>
                            <div className='min-w-0'>
                              <div className='flex items-center gap-2'>
                                <span className='rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800'>
                                  Folder
                                </span>
                                {folder.is_locked && (
                                  <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800'>
                                    Terkunci
                                  </span>
                                )}
                                <p className='truncate text-sm font-semibold text-slate-900'>{folder.title}</p>
                              </div>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <DashboardActionButton
                                onClick={() => handleReorderFolder(folder.folder_id, 'up')}
                                disabled={isStructureBusy || index === 0}
                                variant='ghost'
                                className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              >
                                Naik
                              </DashboardActionButton>
                              <DashboardActionButton
                                onClick={() => handleReorderFolder(folder.folder_id, 'down')}
                                disabled={isStructureBusy || index === uncategorizedFolders.length - 1}
                                variant='ghost'
                                className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              >
                                Turun
                              </DashboardActionButton>
                              <DashboardActionButton
                                onClick={() =>
                                  editingFolderId === folder.folder_id
                                    ? resetStructureEditors()
                                    : openFolderEditor(folder.folder_id)
                                }
                                disabled={isStructureBusy}
                                variant='outline'
                                className='justify-center border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50'
                              >
                                {editingFolderId === folder.folder_id ? 'Tutup' : 'Ubah'}
                              </DashboardActionButton>
                              <DashboardActionButton
                                onClick={() => handleDeleteFolder(folder.folder_id)}
                                disabled={isStructureBusy}
                                variant='ghost'
                                className='justify-center border-red-200 bg-white text-red-700 hover:bg-red-50'
                              >
                                Hapus
                              </DashboardActionButton>
                            </div>
                          </div>

                          {folderSubheadings.length > 0 && (
                            <p className='mt-2 text-xs text-slate-500'>Subheading: {folderSubheadings.length}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </section>

      {activeCreateModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl'>
            <div className='mb-4 flex items-start justify-between gap-3'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>
                  {activeCreateModal === 'category'
                    ? 'Tambah Kategori'
                    : activeCreateModal === 'folder'
                    ? 'Tambah Folder'
                    : activeCreateModal === 'subheading'
                    ? 'Tambah Subheading'
                    : editingId
                    ? 'Ubah Link'
                    : 'Tambah Link'}
                </h3>
                <p className='text-sm text-slate-500'>
                  {activeCreateModal === 'category'
                    ? 'Kategori dipakai untuk mengelompokkan folder agar lebih rapi.'
                    : activeCreateModal === 'folder'
                    ? 'Folder akan ditempatkan di dalam kategori yang dipilih.'
                    : activeCreateModal === 'subheading'
                    ? 'Subheading digunakan untuk membagi isi link dalam folder.'
                    : 'Kelola data link langsung lewat popup tanpa card tambahan.'}
                </p>
              </div>
              <DashboardActionButton
                onClick={closeCreateModal}
                variant='ghost'
                className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              >
                Tutup
              </DashboardActionButton>
            </div>

            {activeCreateModal === 'category' && (
              <form onSubmit={handleCreateCategory} className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Nama Kategori
                  </label>
                  <input
                    type='text'
                    value={newCategoryTitle}
                    onChange={(event) => setNewCategoryTitle(event.target.value)}
                    placeholder='Contoh: Akademik'
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <DashboardActionButton
                    type='button'
                    variant='ghost'
                    onClick={closeCreateModal}
                    disabled={isCreatingCategory}
                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  >
                    Batal
                  </DashboardActionButton>
                  <DashboardActionButton
                    type='submit'
                    variant='primary'
                    disabled={isCreatingCategory}
                    className='justify-center'
                  >
                    {isCreatingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
                  </DashboardActionButton>
                </div>
              </form>
            )}

            {activeCreateModal === 'folder' && (
              <form onSubmit={handleCreateFolder} className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Kategori
                  </label>
                  <select
                    value={newFolderCategoryId}
                    onChange={(event) => setNewFolderCategoryId(event.target.value)}
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  >
                    <option value=''>Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Nama Folder
                  </label>
                  <input
                    type='text'
                    value={newFolderTitle}
                    onChange={(event) => setNewFolderTitle(event.target.value)}
                    placeholder='Contoh: Departemen Media'
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                    disabled={categories.length === 0}
                  />
                </div>

                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    <input
                      type='checkbox'
                      checked={newFolderIsLocked}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setNewFolderIsLocked(checked);
                        if (!checked) {
                          setNewFolderAccessKey('');
                        }
                      }}
                    />
                    Kunci Folder
                  </label>
                  {newFolderIsLocked && (
                    <input
                      type='text'
                      value={newFolderAccessKey}
                      onChange={(event) => setNewFolderAccessKey(event.target.value)}
                      placeholder='Masukkan key folder'
                      className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                    />
                  )}
                </div>

                <div className='flex justify-end gap-2'>
                  <DashboardActionButton
                    type='button'
                    variant='ghost'
                    onClick={closeCreateModal}
                    disabled={isCreatingFolder}
                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  >
                    Batal
                  </DashboardActionButton>
                  <DashboardActionButton
                    type='submit'
                    variant='primary'
                    disabled={isCreatingFolder || categories.length === 0}
                    className='justify-center'
                  >
                    {isCreatingFolder ? 'Menyimpan...' : 'Simpan Folder'}
                  </DashboardActionButton>
                </div>
              </form>
            )}

            {activeCreateModal === 'subheading' && (
              <form onSubmit={handleCreateSubheading} className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Folder
                  </label>
                  <select
                    value={newSubheadingFolderId}
                    onChange={(event) => setNewSubheadingFolderId(event.target.value)}
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  >
                    <option value=''>Pilih folder</option>
                    {folders.map((folder) => (
                      <option key={folder.folder_id} value={folder.folder_id}>
                        {folder.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                    Nama Subheading
                  </label>
                  <input
                    type='text'
                    value={newSubheadingTitle}
                    onChange={(event) => setNewSubheadingTitle(event.target.value)}
                    placeholder='Contoh: Form dan Dokumen'
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                    disabled={folders.length === 0}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <DashboardActionButton
                    type='button'
                    variant='ghost'
                    onClick={closeCreateModal}
                    disabled={isCreatingSubheading}
                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  >
                    Batal
                  </DashboardActionButton>
                  <DashboardActionButton
                    type='submit'
                    variant='primary'
                    disabled={isCreatingSubheading || folders.length === 0}
                    className='justify-center'
                  >
                    {isCreatingSubheading ? 'Menyimpan...' : 'Simpan Subheading'}
                  </DashboardActionButton>
                </div>
              </form>
            )}

            {activeCreateModal === 'link' && (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Judul</label>
                  <input
                    type='text'
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, title: event.target.value }))
                    }
                    placeholder='Contoh: Form Pendaftaran'
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>URL</label>
                  <input
                    type='url'
                    value={formState.link}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, link: event.target.value }))
                    }
                    placeholder='https://...'
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Kategori</label>
                  <select
                    value={formCategoryId}
                    onChange={(event) => {
                      const categoryValue = event.target.value;
                      setFormCategoryId(categoryValue);
                      setFormState((previous) => ({
                        ...previous,
                        folder_id: GENERAL_FOLDER_OPTION,
                        subheading_id: NO_SUBHEADING_OPTION,
                      }));
                    }}
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                  >
                    <option value={GENERAL_CATEGORY_OPTION}>Link tanpa folder</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.title}
                      </option>
                    ))}
                    {uncategorizedFolders.length > 0 && (
                      <option value={UNCATEGORIZED_CATEGORY_OPTION}>Tanpa kategori</option>
                    )}
                  </select>
                </div>

                {formCategoryId !== GENERAL_CATEGORY_OPTION && (
                  <div className='space-y-1.5'>
                    <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Folder</label>
                    <select
                      value={formState.folder_id}
                      onChange={(event) => {
                        const folderValue = event.target.value;
                        setFormState((previous) => ({
                          ...previous,
                          folder_id: folderValue,
                          subheading_id: NO_SUBHEADING_OPTION,
                        }));
                      }}
                      className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                    >
                      <option value={GENERAL_FOLDER_OPTION}>
                        {formCategoryId === UNCATEGORIZED_CATEGORY_OPTION
                          ? 'Pilih folder'
                          : 'Langsung di kategori ini'}
                      </option>
                      {formCategoryFolders.map((folder) => (
                        <option key={folder.folder_id} value={folder.folder_id}>
                          {folder.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Subheading</label>
                  <select
                    value={formState.subheading_id}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, subheading_id: event.target.value }))
                    }
                    disabled={formState.folder_id === GENERAL_FOLDER_OPTION || !formState.folder_id}
                    className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500 disabled:bg-slate-100'
                  >
                    <option value={NO_SUBHEADING_OPTION}>Tanpa subheading</option>
                    {formSubheadings.map((subheading) => (
                      <option key={subheading.subheading_id} value={subheading.subheading_id}>
                        {subheading.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex justify-end gap-2'>
                  <DashboardActionButton
                    type='button'
                    variant='ghost'
                    onClick={closeCreateModal}
                    disabled={isSubmitting}
                    className='justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  >
                    Batal
                  </DashboardActionButton>
                  <DashboardActionButton type='submit' variant='primary' disabled={isSubmitting} className='justify-center'>
                    {isSubmitting
                      ? editingId
                        ? 'Menyimpan perubahan...'
                        : 'Menambahkan link...'
                      : editingId
                      ? 'Simpan Perubahan'
                      : 'Tambah Link'}
                  </DashboardActionButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <section className='min-w-0 rounded-2xl bg-white p-5 shadow'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Pratinjau Halaman Link</h2>
            <p className='text-sm text-slate-500'>
              Pratinjau langsung halaman publik link dari dashboard admin.
            </p>
          </div>

          <div className='flex w-full flex-wrap gap-2 md:w-auto'>
            <PreviewToolbarButton
              icon={ArrowLeft}
              onClick={handleBackToLinksHome}
              className='w-full justify-center md:w-auto'
            >
              Kembali ke Awal
            </PreviewToolbarButton>

            <PreviewToolbarButton
              icon={RefreshCw}
              onClick={() => setPreviewVersion((value) => value + 1)}
              className='w-full justify-center md:w-auto'
            >
              Muat Ulang Pratinjau
            </PreviewToolbarButton>

            <PreviewToolbarButton
              icon={ExternalLink}
              onClick={() => window.open('/links', '_blank', 'noopener,noreferrer')}
              className='w-full justify-center md:w-auto'
            >
              Buka Halaman
            </PreviewToolbarButton>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
          <iframe
            ref={previewFrameRef}
            key={previewKey}
            title='Pratinjau halaman link'
            src={`/links?preview=${encodeURIComponent(previewKey)}`}
            className='h-[720px] w-full bg-white'
          />
        </div>
      </section>
    </div>
  );
}
