import React, { useState, useEffect, useRef } from 'react';
import TableShadcn from '../components/ui/TableShadcn';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '../components/ui/icon-button';
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import { GoogleMap, DrawingManager, Polygon } from '@react-google-maps/api';
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
  DialogOverlay,
} from '../components/ui/dialog';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const currencies = [
  { symbol: '$', code: 'COP', name: 'Peso Colombiano', decimal: 0 },
  { symbol: '$', code: 'USD', name: 'US Dollar', decimal: 2 }
];

export default function Zones() {
  const { t } = useTranslation();
  const { editZone, fetchZones, setCurrentZone } = api;
  const settings = useSelector(state => state.settingsdata.settings);
  const zonesdata = useSelector(state => state.zonesdata);
  const dispatch = useDispatch();
  
  const isLoaded = window.google && window.google.maps;
  
  const columns = React.useMemo(() => ([
    { accessorKey: 'name', header: t('name') },
    { accessorKey: 'symbol', header: t('currency_symbol') },
    { accessorKey: 'code', header: t('currency_code') },
    { accessorKey: 'decimal', header: t('set_decimal') },
    { accessorKey: 'hasGeometry', header: t('area'), cell: ({ row }) => row.original.geometry && row.original.geometry.coordinates ? '✓' : '' },
    { accessorKey: 'isDefault', header: t('default'), cell: ({ row }) => row.original.isDefault ? '✓' : '' },
  ]), [t]);

  const [data, setData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    symbol: '',
    code: '',
    decimal: 2,
    geometry: null,
    isDefault: false
  });
  const [editSaving, setEditSaving] = useState(false);
  
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [drawingManagerRef, setDrawingManagerRef] = useState(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const mapRef = useRef(null);

  const initialEditForm = React.useMemo(() => ({
    name: '',
    symbol: '',
    code: '',
    decimal: 2,
    geometry: null,
    isDefault: false
  }), []);

  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch, fetchZones]);

  useEffect(() => {
    if (zonesdata.zones) {
      setData(zonesdata.zones);
    } else {
      setData([]);
    }
  }, [zonesdata.zones]);

  useEffect(() => {
    const defaultZone = data.find(z => z.isDefault) || data[0];
    if (defaultZone && !zonesdata.currentZone) {
      dispatch(setCurrentZone(defaultZone));
    }
  }, [data, zonesdata.currentZone, dispatch, setCurrentZone]);

  useEffect(() => {
    if (editForm.geometry && editForm.geometry.coordinates) {
      setPolygonCoordinates(editForm.geometry.coordinates);
    }
  }, [editForm.geometry]);

  const handleMapClick = (event) => {
    const newPoint = { lat: event.latLng.lat(), lng: event.latLng.lng() };
  };

  const onDrawingManagerLoad = (dm) => {
    setDrawingManagerRef(dm);
  };

  const onPolygonComplete = (polygon) => {
    const paths = polygon.getPath();
    const coordinates = paths.getArray().map((point) => [
      point.lng(),
      point.lat()
    ]);
    setPolygonCoordinates(coordinates);
    handleInputChange('geometry', { type: 'polygon', coordinates });
  };


  const clearPolygon = () => {
    setPolygonCoordinates([]);
    handleInputChange('geometry', null);
    if (drawingManagerRef) {
      drawingManagerRef.setDrawingMode(null);
    }
  };

  const closeEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditSaving(false);
    setPolygonCoordinates([]);
    setSelectedLocation(null);
    setMapCenter({ lat: 40.7128, lng: -74.0060 });
    setMapZoom(10);
  }, [initialEditForm]);

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      dispatch(editZone(itemToDelete, "Delete"));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      name: row.name || '',
      symbol: row.symbol || '',
      code: row.code || '',
      decimal: row.decimal || 2,
      geometry: row.geometry || null,
      isDefault: row.isDefault || false
    });
    
    if (row.geometry && row.geometry.coordinates && row.geometry.coordinates.length > 0) {
      const firstCoord = row.geometry.coordinates[0];
      setMapCenter({ lat: firstCoord[1], lng: firstCoord[0] });
      setPolygonCoordinates(row.geometry.coordinates);
    }
    
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editForm.name || !editForm.symbol || !editForm.code) {
      alert(t('please_enter_required'));
      return;
    }

    setEditSaving(true);
    
    if (itemToEdit) {
      const updated = {
        ...itemToEdit,
        ...editForm,
      };
      
      if (editForm.isDefault) {
        const otherZones = data.filter(z => z.id !== updated.id);
        otherZones.forEach(zone => {
          dispatch(editZone({ ...zone, isDefault: false }, "Update"));
        });
      }
      
      dispatch(editZone(updated, "Update"));
      
      if (updated.isDefault) {
        dispatch(setCurrentZone(updated));
      }
    } else {
      const newItem = {
        ...editForm,
        createdAt: Date.now()
      };
      
      if (editForm.isDefault) {
        const otherZones = data.filter(z => !z.id);
        otherZones.forEach(zone => {
          dispatch(editZone({ ...zone, isDefault: false }, "Update"));
        });
      }
      
      dispatch(editZone(newItem, "Add"));
      
      if (newItem.isDefault) {
        dispatch(setCurrentZone(newItem));
      }
    }
    
    closeEditDialog();
  };

  const handleEditCancel = () => {
    closeEditDialog();
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    zonesdata.loading ? <CircularLoading /> :
      <ThemeProvider theme={theme}>
        <div style={{
          direction: "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          padding: "20px",
        }}>
          <TableShadcn
            columns={columns}
            data={data || []}
            initialFilterColumn={'name'}
            onAdd={() => { 
              setItemToEdit(null); 
              setEditForm(initialEditForm); 
              setPolygonCoordinates([]);
              setMapCenter({ lat: 40.7128, lng: -74.0060 });
              setMapZoom(10);
              setEditDialogOpen(true); 
            }}
            addButtonLabel={t('add_zone')}
            title={t('zones')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              name: t('name'),
              symbol: t('currency_symbol'),
              code: t('currency_code'),
              decimal: t('set_decimal'),
              hasGeometry: t('area'),
              isDefault: t('default')
            }}
            renderActions={(row) => (
              <div style={{ display:'flex', gap: 6 }}>
                <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                  <EditIcon fontSize='small' />
                </IconButton>
                {settings.AllowCriticalEditsAdmin && (
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(row)}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                )}
              </div>
            )}
          />
        </div>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_confirmation')} "{itemToDelete?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) closeEditDialog(); else setEditDialogOpen(true); }}>
          <DialogOverlay onClick={closeEditDialog} />
          <DialogContent style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <DialogHeader>
              <DialogTitle>{ itemToEdit ? t('edit_zone') : t('add_zone') }</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" style={{ position:'relative' }}>
              {editSaving ? (
                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                  <CircularLoading />
                </div>
              ) : null}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={editSaving}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currency')} *
                </label>
                <select
                  value={editForm.code}
                  onChange={(e) => {
                    const selected = currencies.find(c => c.code === e.target.value);
                    if (selected) {
                      setEditForm(prev => ({
                        ...prev,
                        symbol: selected.symbol,
                        code: selected.code,
                        decimal: selected.decimal
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={editSaving}
                  required
                >
                  <option value="">{t('select_currency')}</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {editForm.code && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{t('currency_symbol')}:</span> {editForm.symbol} | 
                    <span className="font-medium ml-2">{t('currency_code')}:</span> {editForm.code} | 
                    <span className="font-medium ml-2">{t('set_decimal')}:</span> {editForm.decimal}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('draw_zone_area')}
                  </label>
                  {polygonCoordinates.length > 0 && (
                    <button
                      type="button"
                      onClick={clearPolygon}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200"
                      disabled={editSaving}
                    >
                      {t('clear_polygon')}
                    </button>
                  )}
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={mapZoom}
                    onClick={handleMapClick}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                  >
                    {polygonCoordinates.length > 0 && (
                      <Polygon
                        paths={polygonCoordinates.map(coord => ({ lat: coord[1], lng: coord[0] }))}
                        options={{
                          fillColor: '#008d99',
                          fillOpacity: 0.3,
                          strokeColor: '#008d99',
                          strokeOpacity: 0.8,
                          strokeWeight: 2
                        }}
                      />
                    )}
                    <DrawingManager
                      onLoad={onDrawingManagerLoad}
                      drawingMode={window.google.maps.drawing.OverlayType.POLYGON}
                      options={{
                        polygonOptions: {
                          fillColor: '#008d99',
                          fillOpacity: 0.3,
                          strokeColor: '#008d99',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          clickable: false,
                          editable: true,
                          zIndex: 1
                        }
                      }}
                      onPolygonComplete={onPolygonComplete}
                    />
                  </GoogleMap>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  disabled={editSaving}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('set_as_default')}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={editSaving}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                disabled={editSaving}
              >
                {t('save')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </ThemeProvider>
  );
}
