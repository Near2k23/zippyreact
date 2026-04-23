import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TableShadcn from '../components/ui/TableShadcn';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import { useTranslation } from "react-i18next";
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { colors } from '../components/Theme/WebTheme';
import { Switch, TextField, Typography, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '../components/ui/icon-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const APP_OPTIONS = ['RIDER', 'DRIVER'];
const DEFAULT_COLOR = '#F97316';

const isValidHexColor = (value) => /^#(?:[0-9A-Fa-f]{3}){1,2}$/.test((value || '').trim());

const getReadableTextColor = (backgroundColor) => {
  const hex = (backgroundColor || DEFAULT_COLOR).replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
  return luminance > 186 ? '#111111' : '#FFFFFF';
};

const getSortedBanners = (items = []) => {
  return [...items].sort((a, b) => {
    const orderDiff = (parseInt(a.sortOrder, 10) || 0) - (parseInt(b.sortOrder, 10) || 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return (parseInt(b.createdAt, 10) || 0) - (parseInt(a.createdAt, 10) || 0);
  });
};

const getPreviewData = (banner) => {
  const backgroundColor = isValidHexColor(banner?.backgroundColor) ? banner.backgroundColor : DEFAULT_COLOR;
  return {
    backgroundColor,
    textColor: getReadableTextColor(backgroundColor)
  };
};

export default function Banners() {
  const { t } = useTranslation();
  const { editBanner } = api;
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settingsdata.settings);
  const bannerdata = useSelector(state => state.bannerdata);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const initialEditForm = useMemo(() => ({
    title: '',
    description: '',
    icon: 'megaphone-outline',
    url: '',
    app: 'RIDER',
    backgroundColor: DEFAULT_COLOR,
    active: true,
    sortOrder: 0
  }), []);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getSortedBanners(bannerdata?.banners || []));
  }, [bannerdata?.banners]);

  const showReadOnlyAlert = useCallback(() => {
    if (settings && settings.AllowCriticalEditsAdmin === false) {
      alert(t('demo_mode'));
      return true;
    }
    return false;
  }, [settings, t]);

  const handleToggleActive = useCallback((banner) => {
    if (showReadOnlyAlert()) {
      return;
    }
    dispatch(editBanner({
      ...banner,
      active: !banner.active,
      updatedAt: Date.now()
    }, "Update"));
  }, [dispatch, editBanner, showReadOnlyAlert]);

  const handleDeleteConfirm = () => {
    if (!itemToDelete) {
      return;
    }
    if (showReadOnlyAlert()) {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      return;
    }
    dispatch(editBanner(itemToDelete, "Delete"));
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
  };

  const handleEditSave = () => {
    const nextTitle = String(editForm.title || '').trim();
    const nextDescription = String(editForm.description || '').trim();
    const nextIcon = String(editForm.icon || '').trim();
    const nextApp = String(editForm.app || '').trim();
    const nextColor = String(editForm.backgroundColor || '').trim();

    if (showReadOnlyAlert()) {
      return;
    }
    if (!nextTitle || !nextDescription || !nextIcon || !nextApp || !nextColor) {
      alert('Completa todos los campos obligatorios.');
      return;
    }
    if (!isValidHexColor(nextColor)) {
      alert('El color de fondo debe ser un hex valido, por ejemplo #F97316.');
      return;
    }

    setEditSaving(true);
    const now = Date.now();
    const payload = {
      ...(itemToEdit || {}),
      ...editForm,
      title: nextTitle,
      description: nextDescription,
      icon: nextIcon,
      app: nextApp,
      backgroundColor: nextColor,
      url: String(editForm.url || '').trim(),
      sortOrder: parseInt(editForm.sortOrder, 10) || 0,
      updatedAt: now,
      createdAt: itemToEdit?.createdAt || now
    };

    dispatch(editBanner(payload, itemToEdit ? "Update" : "Add"));
    closeEditDialog();
  };

  const columns = useMemo(() => ([
    {
      accessorKey: 'preview',
      header: 'Preview',
      cell: ({ row }) => {
        const preview = getPreviewData(row.original);
        return (
          <div
            style={{
              width: 240,
              borderRadius: 18,
              background: preview.backgroundColor,
              color: preview.textColor,
              padding: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              boxShadow: '0 10px 28px rgba(15,23,42,0.12)'
            }}
          >
            <div
              style={{
                minWidth: 54,
                width: 54,
                height: 54,
                borderRadius: 16,
                background: `${preview.textColor}18`,
                border: `1px solid ${preview.textColor}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.1,
                padding: 6
              }}
              title={`Ionicons: ${row.original.icon || 'sin icono'}`}
            >
              {row.original.icon || 'icon'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.original.title}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {row.original.description}
              </div>
            </div>
          </div>
        );
      }
    },
    { accessorKey: 'title', header: 'Titulo' },
    { accessorKey: 'description', header: 'Descripcion' },
    { accessorKey: 'icon', header: 'Icono' },
    { accessorKey: 'app', header: 'App' },
    { accessorKey: 'sortOrder', header: 'Orden' },
    {
      accessorKey: 'backgroundColor',
      header: 'Color',
      cell: ({ row }) => {
        const preview = getPreviewData(row.original);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, background: preview.backgroundColor, border: '1px solid rgba(0,0,0,0.08)' }} />
            <span>{preview.backgroundColor}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'url',
      header: 'URL',
      cell: ({ row }) => row.original.url ? (
        <a href={row.original.url} target="_blank" rel="noreferrer" style={{ color: colors.Action_Button_Back, textDecoration: 'underline' }}>
          Abrir
        </a>
      ) : 'Informativo'
    },
    {
      accessorKey: 'active',
      header: 'Activo',
      cell: ({ row }) => (
        <Switch
          checked={!!row.original.active}
          onChange={() => handleToggleActive(row.original)}
          disabled={settings && settings.AllowCriticalEditsAdmin === false}
        />
      )
    }
  ]), [handleToggleActive, settings]);

  return bannerdata.loading ? (
    <CircularLoading />
  ) : (
    <ThemeProvider theme={theme}>
      <div style={{
        borderRadius: "8px",
        boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
        padding: "20px",
      }}>
        <TableShadcn
          columns={columns}
          data={data || []}
          initialFilterColumn={'title'}
          onAdd={() => {
            setItemToEdit(null);
            setEditForm(initialEditForm);
            setEditDialogOpen(true);
          }}
          addButtonLabel={'Agregar banner'}
          title={'Banner'}
          columnsButtonLabel={t('columns')}
          columnLabels={{
            preview: 'Preview',
            title: 'Titulo',
            description: 'Descripcion',
            icon: 'Icono',
            app: 'App',
            sortOrder: 'Orden',
            backgroundColor: 'Color',
            url: 'URL',
            active: 'Activo'
          }}
          renderActions={(row) => (
            <>
              <IconButton onClick={() => {
                setItemToEdit(row);
                setEditForm({
                  title: row.title || '',
                  description: row.description || '',
                  icon: row.icon || 'megaphone-outline',
                  url: row.url || '',
                  app: row.app || 'RIDER',
                  backgroundColor: row.backgroundColor || DEFAULT_COLOR,
                  active: !!row.active,
                  sortOrder: row.sortOrder ?? 0
                });
                setEditDialogOpen(true);
              }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => {
                setItemToDelete(row);
                setDeleteDialogOpen(true);
              }}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        />
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { closeEditDialog(); } }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{itemToEdit ? 'Editar banner' : 'Agregar banner'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 8 }}>
            <TextField
              label="Titulo"
              value={editForm.title}
              onChange={(event) => setEditForm(prev => ({ ...prev, title: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Icono Ionicons"
              value={editForm.icon}
              onChange={(event) => setEditForm(prev => ({ ...prev, icon: event.target.value }))}
              fullWidth
              required
              helperText="Ejemplo: megaphone-outline"
            />
            <TextField
              label="Descripcion"
              value={editForm.description}
              onChange={(event) => setEditForm(prev => ({ ...prev, description: event.target.value }))}
              fullWidth
              required
              multiline
              minRows={3}
              style={{ gridColumn: '1 / -1' }}
            />
            <TextField
              select
              label="App"
              value={editForm.app}
              onChange={(event) => setEditForm(prev => ({ ...prev, app: event.target.value }))}
              fullWidth
              required
            >
              {APP_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Color de fondo"
              value={editForm.backgroundColor}
              onChange={(event) => setEditForm(prev => ({ ...prev, backgroundColor: event.target.value }))}
              fullWidth
              required
              helperText="Hex valido, por ejemplo #F97316"
              error={!!editForm.backgroundColor && !isValidHexColor(editForm.backgroundColor)}
            />
            <TextField
              label="URL del boton"
              value={editForm.url}
              onChange={(event) => setEditForm(prev => ({ ...prev, url: event.target.value }))}
              fullWidth
              helperText="Si queda vacio, el banner sera solo informativo."
            />
            <TextField
              label="Orden"
              type="number"
              value={editForm.sortOrder}
              onChange={(event) => setEditForm(prev => ({ ...prev, sortOrder: event.target.value }))}
              fullWidth
            />
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 10 }}>
              <Typography style={{ marginRight: 10 }}>Activo</Typography>
              <Switch
                checked={!!editForm.active}
                onChange={() => setEditForm(prev => ({ ...prev, active: !prev.active }))}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
              <Typography style={{ fontWeight: 700, marginBottom: 10 }}>Preview</Typography>
              <div
                style={{
                  borderRadius: 22,
                  background: getPreviewData(editForm).backgroundColor,
                  color: getPreviewData(editForm).textColor,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'center',
                  minHeight: 120
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                    {editForm.title || 'Titulo del banner'}
                  </div>
                  <div style={{ opacity: 0.92, marginBottom: 10 }}>
                    {editForm.description || 'Descripcion corta del banner para rider o driver.'}
                  </div>
                  {String(editForm.url || '').trim() ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 88,
                      borderRadius: 999,
                      padding: '8px 14px',
                      background: `${getPreviewData(editForm).textColor}20`,
                      border: `1px solid ${getPreviewData(editForm).textColor}22`,
                      fontWeight: 700
                    }}>
                      Abrir
                    </div>
                  ) : null}
                </div>
                <div style={{
                  minWidth: 96,
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  background: `${getPreviewData(editForm).textColor}18`,
                  border: `1px solid ${getPreviewData(editForm).textColor}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  textAlign: 'center',
                  fontWeight: 700
                }}>
                  {editForm.icon || 'icon'}
                </div>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button type="button" className="px-4 py-2 rounded-md border" onClick={closeEditDialog}>
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: DEFAULT_COLOR, opacity: editSaving ? 0.7 : 1 }}
                onClick={handleEditSave}
                disabled={editSaving}
              >
                Guardar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar banner</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el banner seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
}
