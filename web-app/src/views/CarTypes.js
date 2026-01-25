import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import { useNavigate,useLocation } from "react-router-dom";
import { Modal, Grid, Typography } from "@mui/material";
import Button from "components/CustomButtons/Button.js";
import CancelIcon from "@mui/icons-material/Cancel";
import AlertDialog from "../components/AlertDialog";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { colors } from "../components/Theme/WebTheme";
import { FONT_FAMILY, SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import { getLangKey } from "common/src/other/getLangKey";
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import InfoIcon from '@mui/icons-material/Info';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '../components/ui/dialog';
import {
  AlertDialog as ShadAlertDialog,
  AlertDialogContent as ShadAlertDialogContent,
  AlertDialogHeader as ShadAlertDialogHeader,
  AlertDialogTitle as ShadAlertDialogTitle,
  AlertDialogDescription as ShadAlertDialogDescription,
  AlertDialogFooter as ShadAlertDialogFooter,
  AlertDialogCancel as ShadAlertDialogCancel,
  AlertDialogAction as ShadAlertDialogAction,
} from '../components/ui/alert-dialog';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submit3: {
    width: "100%",
    borderRadius: 3,
    marginTop: 2,
    padding: 4,
  },
  paper: {
    width: 700,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    cursor: 'help',
    '&:hover': {
      color: '#008d99',
    },
  },
  tooltipContent: {
    maxWidth: 300,
    fontSize: '14px',
    lineHeight: '1.4',
  },
}));

export default function CarTypes() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector((state) => state.settingsdata.settings);
  const { editCarType, convertLanguage, fetchZones } = api;
  const [data, setData] = useState([]);
  const cartypes = useSelector((state) => state.cartypes);
  const zonesdata = useSelector((state) => state.zonesdata);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [rowIndex, setRowIndex] = useState();
  const [modalType, setModalType] = useState();
  const {state} = useLocation()
  const [currentPage,setCurrentPage] = useState(null)
  const auth = useSelector((state) => state.auth);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const initialEditForm = React.useMemo(()=>({
    name: '',
    image: '',
    base_fare: 0,
    rate_per_unit_distance: 0,
    rate_per_hour: 0,
    min_fare: 0,
    convenience_fees: 0,
    convenience_fee_type: 'flat',
    fleet_admin_fee: 0,
    extra_info: '',
    pos: 0,
  }),[]);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedZones, setSelectedZones] = useState([]);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [activeZoneTab, setActiveZoneTab] = useState(null);
  const [zonePrices, setZonePrices] = useState({});

  useEffect(()=>{
    setCurrentPage(state?.pageNo)
  },[state])
  
  const HandalePageChange = (page)=>{
    setCurrentPage(page)
  }

  const onClick = (rowData) => {
    setImageData(rowData.image);
    setProfileModal(true);
    setUserData(rowData);
  };

  function formatAmount(value, decimal, country) {
    const number = parseFloat(value || 0);
    if (country === "Vietnam") {
      return number.toLocaleString("vi-VN", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    } else {
      return number.toLocaleString("en-US", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    }
  }

  const columns = React.useMemo(()=> ([
    { accessorKey: 'name', header: t('name'), cell: ({row}) => row.original.name ? t(getLangKey(row.original.name)) : null },
    { accessorKey: 'image', header: t('image'), cell: ({row}) => row.original.image ? (
      <button onClick={() => onClick(row.original)}><img alt='CarImage' src={row.original.image} style={{ width: 50 }}/></button>
    ) : null },
    { accessorKey: 'zones', header: t('zones'), cell: ({row}) => {
      const zones = row.original.zones || [];
      if (zones.length === 0) return 'Sin zonas';
      return zones.slice(0, 2).map(zoneId => {
        const zone = zonesdata.zones?.find(z => z.id === zoneId);
        return zone ? zone.name : zoneId;
      }).join(', ') + (zones.length > 2 ? ` +${zones.length - 2}` : '');
    }},
    { accessorKey: 'base_fare', header: t('base_fare'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.base_fare || 0;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'rate_per_unit_distance', header: t('rate_per_unit_distance'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.rate_per_unit_distance || 0;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'rate_per_hour', header: t('rate_per_hour'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.rate_per_hour || 0;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'min_fare', header: t('min_fare'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.min_fare || 0;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'convenience_fees', header: t('convenience_fee'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.convenience_fees || 0;
      if ((p.convenience_fee_type || 'flat') === 'percentage') return `${value}%`;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'convenience_fee_type', header: t('convenience_fee_type'), cell: ({row}) => {
      const p = row.original.zonePrices?.[selectedZone] || {};
      return p.convenience_fee_type === 'percentage' ? t('percentage') : t('flat');
    } },
    { accessorKey: 'fleet_admin_fee', header: t('fleet_admin_comission'), cell: ({row}) => {
      if(selectedZone==='all') return "--";
      const zone = zonesdata.zones?.find(z => z.id === selectedZone);
      const p = row.original.zonePrices?.[selectedZone] || {};
      const value = p.fleet_admin_fee || 0;
      return `${zone?.symbol || ''}${formatAmount(value, zone?.decimal || settings.decimal, settings.country)}`;
    } },
    { accessorKey: 'extra_info', header: t('extra_info') },
    { accessorKey: 'pos', header: t('position') },
  ]), [t, settings.decimal, settings.country, zonesdata.zones, selectedZone]);

  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch, fetchZones]);

  useEffect(() => {
    const defaultZone = zonesdata.zones?.find(z => z.isDefault) || zonesdata.zones?.[0];
    if (defaultZone && !selectedZone) {
      setSelectedZone(defaultZone);
    }
  }, [zonesdata.zones]);

  useEffect(() => {
    if (cartypes.cars) {
      if(selectedZone === 'all') {
        setData(cartypes.cars);
      } else {
        setData(cartypes.cars.filter(ct => Array.isArray(ct.zones) && ct.zones.includes(selectedZone)));
      }
    } else {
      setData([]);
    }
  }, [cartypes.cars, selectedZone]);

  const [selectedImage, setSelectedImage] = useState(null);
  const handleProfileModal = (e) => {
    setProfileModal(false);
    setSelectedImage(null);
  };

  const [userData, setUserData] = useState();
  const [profileModal, setProfileModal] = useState(false);
  const [imageData, setImageData] = useState(false);
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const [loading, setLoading] = useState(false);

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };

  const handleSetProfileModal = (e) => {
    e.preventDefault();
    if(settings.AllowCriticalEditsAdmin){
    if (selectedImage) {
      setLoading(true);
      let finalData = userData;
      finalData.image = selectedImage;
      dispatch(editCarType(finalData, "UpdateImage"));
      setProfileModal(false);
      setTimeout(() => {
        setSelectedImage(null);
        setLoading(false);
      }, 10000);
    } else {
      setCommonAlert({ open: true, msg: t("choose_image_first") });
    }
  }else{
    setLoading(false); 
    setCommonAlert({ open: true, msg: t('demo_mode') })
  }
  };

  const [userDataState, setUserDataState] = useState({});

  const handleAdd = () => {
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setSelectedZones([]);
    setZonePrices({});
    setActiveZoneTab(null);
    setEditDialogOpen(true);
  };

  const getCurrentZonePrices = (zoneId) => {
    return zonePrices[zoneId] || {
      base_fare: 0,
      rate_per_unit_distance: 0,
      rate_per_hour: 0,
      min_fare: 0,
      convenience_fees: 0,
      convenience_fee_type: 'flat',
      fleet_admin_fee: 0,
    };
  };

  const updateZonePrice = (zoneId, field, value) => {
    setZonePrices(prev => ({
      ...prev,
      [zoneId]: {
        ...getCurrentZonePrices(zoneId),
        [field]: value,
      },
    }));
  };

  const toggleZone = (zoneId) => {
    setSelectedZones(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(z => z !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  const handleEdit = (row) => {
    setItemToEdit(row);
    setSelectedZones(row.zones || []);
    setZonePrices(row.zonePrices || {});
    if (row.zones && row.zones.length > 0) {
      setActiveZoneTab(row.zones[0]);
    }
    setEditForm({
      name: row.name || '',
      image: row.image || '',
      extra_info: row.extra_info || '',
      pos: row.pos || 0,
      zones: row.zones || [],
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    const isEmpty = (v) => !v || String(v).trim() === '';
    if (isEmpty(editForm.name)) {
      setCommonAlert({ open: true, msg: t('please_enter_required') || 'Por favor completa los campos obligatorios' });
      return;
    }
    if (selectedZones.length === 0) {
      setCommonAlert({ open: true, msg: 'Por favor selecciona al menos una zona' });
      return;
    }
    const payload = { 
      ...itemToEdit, 
      ...editForm, 
      zones: selectedZones,
      zonePrices: zonePrices,
    };
    if (itemToEdit) {
      dispatch(editCarType(payload, 'Update'));
    } else {
      dispatch(editCarType({ ...editForm, zones: selectedZones, zonePrices, createdAt: Date.now() }, 'Add'));
    }
    setEditDialogOpen(false);
  };

  const handleDelete = (row) => {
    setItemToDelete(row);
    setConfirmDeleteOpen(true);
  };

  const onConfirmDelete = () => {
    if (itemToDelete) {
      dispatch(editCarType(itemToDelete, 'Delete'));
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const InfoTooltip = ({ title, content }) => (
    <Tooltip 
      title={
        <div className={classes.tooltipContent}>
          <strong>{title}</strong><br />
          {content}
        </div>
      } 
      arrow
      placement="top"
    >
      <InfoIcon className={classes.infoIcon} />
    </Tooltip>
  );

  return cartypes.loading ? (
    <CircularLoading />
  ) : (
    <div ref={rootRef}>
      <ThemeProvider theme={theme}>
        <div style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          padding: "20px",
        }}>
          <TableShadcn
            columns={columns}
            data={data || []}
            initialFilterColumn={'name'}
            onAdd={handleAdd}
            addButtonLabel={t('add_carType')}
            title={t('car_type_title')}
            columnsButtonLabel={t('columns')}
            toolbarRight={
              zonesdata.zones && zonesdata.zones.length > 0 ? (
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px",
                    minWidth: "180px"
                  }}
                >
                  <option value="all">{t('all_zones') || 'Todos'}</option>
                  {zonesdata.zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.symbol}{zone.code})
                    </option>
                  ))}
                </select>
              ) : null
            }
            columnLabels={{
              name: t('name'),
              image: t('image'),
              zones: t('zones'),
              base_fare: t('base_fare'),
              rate_per_unit_distance: t('rate_per_unit_distance'),
              rate_per_hour: t('rate_per_hour'),
              min_fare: t('min_fare'),
              convenience_fees: t('convenience_fee'),
              convenience_fee_type: t('convenience_fee_type'),
              fleet_admin_fee: t('fleet_admin_comission'),
              extra_info: t('extra_info'),
              pos: t('position')
            }}
            renderActions={(row) => (
              <div style={{ display:'flex', gap: 6 }}>
                <IconButton aria-label="edit" onClick={() => handleEdit(row)}>
                  <EditIcon fontSize='small' />
                </IconButton>
                {settings.AllowCriticalEditsAdmin && (
                  <IconButton aria-label="delete" onClick={() => handleDelete(row)}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                )}
              </div>
            )}
          />
        </div>
      </ThemeProvider>

      <Dialog open={editDialogOpen} onOpenChange={(open)=> { if(!open) setEditDialogOpen(false); else setEditDialogOpen(true); }}>
        <DialogOverlay onClick={()=>setEditDialogOpen(false)} />
        <DialogContent className="!max-w-[95vw] !w-[95vw] md:!max-w-[50vw] md:!w-[50vw]" style={{ 
          maxHeight: '85vh', 
          display: 'flex', 
          flexDirection: 'column', 
          top: '80px', 
          transform: 'translateX(-50%)' 
        }}>
          <DialogHeader style={{ flexShrink: 0 }}>
            <DialogTitle>{ itemToEdit ? t('edit') : t('add_carType') }</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" style={{ 
            overflowY: 'auto', 
            flex: 1, 
            paddingRight: '8px',
            maxHeight: 'calc(85vh - 140px)',
            minHeight: '200px'
          }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_zones')}</label>
              <div 
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '8px', 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9'
                }}
                onClick={() => setShowZoneSelector(!showZoneSelector)}
              >
                {selectedZones.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedZones.map(zoneId => {
                      const zone = zonesdata.zones?.find(z => z.id === zoneId);
                      return zone ? (
                        <span key={zoneId} style={{ backgroundColor: '#008d99', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {zone.name}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleZone(zoneId);
                            }}
                            style={{ marginLeft: '4px', background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Clic para seleccionar zonas</div>
                )}
              </div>
              {showZoneSelector && (
                <div style={{ marginTop: '8px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', backgroundColor: 'white' }}>
                  {zonesdata.zones?.map(zone => (
                    <label key={zone.id} style={{ display: 'block', padding: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedZones.includes(zone.id)}
                        onChange={() => toggleZone(zone.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {zone.name} ({zone.symbol}{zone.code})
                    </label>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setShowZoneSelector(false)}
                    className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <input type="text" value={editForm.name} onChange={(e)=>setEditForm(prev=>({...prev, name: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('image')}</label>
              <input type="text" value={editForm.image} onChange={(e)=>setEditForm(prev=>({...prev, image: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
            </div>

            {selectedZones.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('prices_by_zone')}</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {selectedZones.map(zoneId => {
                      const zone = zonesdata.zones?.find(z => z.id === zoneId);
                      return zone ? (
                        <button
                          key={zoneId}
                          type="button"
                          onClick={() => setActiveZoneTab(zoneId)}
                          style={{
                            padding: '8px 16px',
                            border: `2px solid ${activeZoneTab === zoneId ? '#008d99' : '#ddd'}`,
                            borderRadius: '4px',
                            backgroundColor: activeZoneTab === zoneId ? '#f0f9ff' : 'white',
                            color: activeZoneTab === zoneId ? '#008d99' : '#333',
                            fontWeight: activeZoneTab === zoneId ? 'bold' : 'normal',
                            cursor: 'pointer'
                          }}
                        >
                          {zone.name}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>

                {activeZoneTab && (
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px' }}>
                    {(() => {
                      const currentPrices = getCurrentZonePrices(activeZoneTab);
                      const zone = zonesdata.zones?.find(z => z.id === activeZoneTab);
                      return (
                        <div>
                          <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #008d99' }}>
                            <div className="text-sm font-medium text-gray-700 mb-1">Zona: {zone?.name || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-600">{zone?.symbol}{zone?.code} (Decimales: {zone?.decimal || 2})</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('base_fare')}
                  <InfoTooltip 
                    title="Tarifa Base"
                                  content="Costo fijo que se suma al inicio de cada viaje."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.base_fare} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'base_fare', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('rate_per_unit_distance')}
                                <InfoTooltip 
                                  title="Tarifa por Distancia"
                                  content="Costo por cada kilómetro recorrido."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.rate_per_unit_distance} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'rate_per_unit_distance', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('rate_per_hour')}
                                <InfoTooltip 
                                  title="Tarifa por Tiempo"
                                  content="Costo por cada hora de viaje."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.rate_per_hour} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'rate_per_hour', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('min_fare')}
                                <InfoTooltip 
                                  title="Tarifa Mínima"
                                  content="Costo mínimo garantizado para cualquier viaje."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.min_fare} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'min_fare', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('convenience_fee')}
                                <InfoTooltip 
                                  title="Tarifa de Conveniencia"
                                  content="Cargo adicional por servicios de conveniencia."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.convenience_fees} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'convenience_fees', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('convenience_fee_type')}
                                <InfoTooltip 
                                  title="Tipo de Tarifa de Conveniencia"
                                  content="Flat: Cantidad fija. Percentage: Porcentaje del total."
                                />
                              </label>
                              <select 
                                value={currentPrices.convenience_fee_type} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'convenience_fee_type', e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="flat">{t('flat')}</option>
                                <option value="percentage">{t('percentage')}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('fleet_admin_comission')}
                                <InfoTooltip 
                                  title="Comisión de Administrador de Flota"
                                  content="Porcentaje que recibe el administrador de flota."
                                />
                              </label>
                              <input 
                                type="number" 
                                value={currentPrices.fleet_admin_fee} 
                                onChange={(e)=>updateZonePrice(activeZoneTab, 'fleet_admin_fee', Number(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                {t('position')}
                                <InfoTooltip 
                                  title="Posición en Lista"
                                  content="Orden de aparición en la lista de tipos de vehículo."
                  />
                </label>
                              <input 
                                type="number" 
                                value={editForm.pos} 
                                onChange={(e)=>setEditForm(prev=>({...prev, pos: Number(e.target.value)}))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('position')}
                  <InfoTooltip 
                    title="Posición en Lista"
                    content="Orden de aparición en la lista de tipos de vehículo. Números menores aparecen primero. Ejemplo: 1 = primer lugar, 2 = segundo lugar"
                  />
                </label>
                <input type="number" value={editForm.pos} onChange={(e)=>setEditForm(prev=>({...prev, pos: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('extra_info')}</label>
              <textarea value={editForm.extra_info} onChange={(e)=>setEditForm(prev=>({...prev, extra_info: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6" style={{ flexShrink: 0, borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <button onClick={()=>setEditDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              {t('cancel')}
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              {t('save')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ShadAlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <ShadAlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{t('confirm_delete')}</ShadAlertDialogTitle>
            <ShadAlertDialogDescription>{t('delete_confirmation') || '¿Eliminar este registro?'}</ShadAlertDialogDescription>
          </ShadAlertDialogHeader>
          <ShadAlertDialogFooter>
            <ShadAlertDialogCancel onClick={()=>setConfirmDeleteOpen(false)}>{t('cancel')}</ShadAlertDialogCancel>
            <ShadAlertDialogAction onClick={onConfirmDelete}>{t('delete')}</ShadAlertDialogAction>
          </ShadAlertDialogFooter>
        </ShadAlertDialogContent>
      </ShadAlertDialog>

      <Modal
        disablePortal
        disableEnforceFocus
        disableAutoFocus
        open={profileModal}
        onClose={handleProfileModal}
        className={classes.modal}
        container={() => rootRef.current}
      >
        <Grid
          container
          spacing={1}
          className={classes.paper}
          style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
        >
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Typography component="h1" variant="h6" style={{ fontFamily: FONT_FAMILY }} >
              {t("upload_car_image")}

              <input
                type="file"
                style={{ marginLeft: 10, fontFamily: FONT_FAMILY }}
                name={t("image")}
                onChange={(event) => {
                  setSelectedImage(event.target.files[0]);
                }}
              />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            {selectedImage && !loading ? (
              <Tooltip style={{ fontFamily: FONT_FAMILY }} title={t("cancel")}>
                <CancelIcon
                  onClick={() => setSelectedImage(null)}
                  style={{
                    fontSize: 30,
                    backgroundColor: colors.RED,
                    borderRadius: 50,
                    color: colors.WHITE,
                  }}
                />
              </Tooltip>
            ) : null}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            {selectedImage ? (
              <img
                alt="not fount"
                width={"200px"}
                height={"200px"}
                src={URL.createObjectURL(selectedImage)}
                style={{ marginTop: 15, marginBottom: 20 }}
              />
            ) : (
              <img
                alt="not fount"
                width={"200px"}
                height={"200px"}
                src={imageData}
                style={{ marginTop: 10 }}
              />
            )}
            <br />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            style={{ textAlign: isRTL === "rtl" ? "right" : "left" }}
          >
            {loading ? (
              <Grid
                container
                spacing={0}
                alignItems="center"
                justify="center"
                style={{ minHeight: "5vh" }}
              >
                <CircularProgress />
              </Grid>
            ) : (
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                style={{ textAlign: isRTL === "rtl" ? "right" : "left" }}
              >
                <Button
                  onClick={handleProfileModal}
                  variant="contained"
                  style={{ backgroundColor:colors.RED, fontFamily: FONT_FAMILY  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleSetProfileModal}
                  variant="contained"
                  style={{ marginLeft: 10 , backgroundColor:colors.GREEN, fontFamily: FONT_FAMILY  }}
                >
                  {t("save")}
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Modal>
      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
        {commonAlert.msg}
      </AlertDialog>
    </div>
  );
}