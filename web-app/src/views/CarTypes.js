import React, { useState, useEffect, useRef } from "react";
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import PhotoSizeSelectSmallIcon from "@mui/icons-material/PhotoSizeSelectSmall";
import { makeStyles } from "@mui/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import { useTranslation } from "react-i18next";
import { useNavigate,useLocation } from "react-router-dom";
import { Modal, Grid, Typography } from "@mui/material";
import Button from "components/CustomButtons/Button.js";
import CancelIcon from "@mui/icons-material/Cancel";
import AlertDialog from "../components/AlertDialog";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { colors } from "../components/Theme/WebTheme";
import { carTypeColumns, optionsRequired } from "common/sharedFunctions";
import { FONT_FAMILY, SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import BlankTable from '../components/Table/BlankTable';
import TableStyle from '../components/Table/Style';
import localization from '../components/Table/Localization';
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
  const { editCarType, convertLanguage } = api;
  const [data, setData] = useState([]);
  const cartypes = useSelector((state) => state.cartypes);
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
    { accessorKey: 'base_fare', header: t('base_fare'), cell: ({row}) => row.original.base_fare ? formatAmount(row.original.base_fare, settings.decimal, settings.country) : 0 },
    { accessorKey: 'rate_per_unit_distance', header: t('rate_per_unit_distance'), cell: ({row}) => row.original.rate_per_unit_distance ? formatAmount(row.original.rate_per_unit_distance, settings.decimal, settings.country) : 0 },
    { accessorKey: 'rate_per_hour', header: t('rate_per_hour'), cell: ({row}) => row.original.rate_per_hour ? formatAmount(row.original.rate_per_hour, settings.decimal, settings.country) : 0 },
    { accessorKey: 'min_fare', header: t('min_fare'), cell: ({row}) => row.original.min_fare ? formatAmount(row.original.min_fare, settings.decimal, settings.country) : 0 },
    { accessorKey: 'convenience_fees', header: t('convenience_fee'), cell: ({row}) => row.original.convenience_fees ? formatAmount(row.original.convenience_fees, settings.decimal, settings.country) : 0 },
    { accessorKey: 'convenience_fee_type', header: t('convenience_fee_type'), cell: ({row}) => row.original.convenience_fee_type === 'flat' ? t('flat') : t('percentage') },
    { accessorKey: 'fleet_admin_fee', header: t('fleet_admin_comission'), cell: ({row}) => row.original.fleet_admin_fee ? formatAmount(row.original.fleet_admin_fee, settings.decimal, settings.country) : 0 },
    { accessorKey: 'extra_info', header: t('extra_info') },
    { accessorKey: 'pos', header: t('position') },
  ]), [t, settings]);

  useEffect(() => {
    if (cartypes.cars) {
      setData(cartypes.cars);
    } else {
      setData([]);
    }
  }, [cartypes.cars]);

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
    setEditDialogOpen(true);
  };

  const handleEdit = (row) => {
    setItemToEdit(row);
    setEditForm({
      name: row.name || '',
      image: row.image || '',
      base_fare: row.base_fare || 0,
      rate_per_unit_distance: row.rate_per_unit_distance || 0,
      rate_per_hour: row.rate_per_hour || 0,
      min_fare: row.min_fare || 0,
      convenience_fees: row.convenience_fees || 0,
      convenience_fee_type: row.convenience_fee_type || 'flat',
      fleet_admin_fee: row.fleet_admin_fee || 0,
      extra_info: row.extra_info || '',
      pos: row.pos || 0,
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    const isEmpty = (v) => !v || String(v).trim() === '';
    if (isEmpty(editForm.name)) {
      setCommonAlert({ open: true, msg: t('please_enter_required') || 'Por favor completa los campos obligatorios' });
      return;
    }
    const payload = { ...itemToEdit, ...editForm };
    if (itemToEdit) {
      dispatch(editCarType(payload, 'Update'));
    } else {
      dispatch(editCarType({ ...editForm, createdAt: Date.now() }, 'Add'));
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
        }}>
          <TableShadcn
            columns={columns}
            data={data || []}
            initialFilterColumn={'name'}
            onAdd={handleAdd}
            addButtonLabel={t('add_carType')}
            title={t('car_type_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              name: t('name'),
              image: t('image'),
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ itemToEdit ? t('edit') : t('add_carType') }</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <input type="text" value={editForm.name} onChange={(e)=>setEditForm(prev=>({...prev, name: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('image')}</label>
              <input type="text" value={editForm.image} onChange={(e)=>setEditForm(prev=>({...prev, image: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('base_fare')}
                  <InfoTooltip 
                    title="Tarifa Base"
                    content="Costo fijo que se suma al inicio de cada viaje. Ejemplo: $2.50 base + (distancia × tarifa/km) + (tiempo × tarifa/hora)"
                  />
                </label>
                <input type="number" value={editForm.base_fare} onChange={(e)=>setEditForm(prev=>({...prev, base_fare: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('rate_per_unit_distance')}
                  <InfoTooltip 
                    title="Tarifa por Distancia"
                    content="Costo por cada kilómetro recorrido. Ejemplo: $1.50/km × 10km = $15.00"
                  />
                </label>
                <input type="number" value={editForm.rate_per_unit_distance} onChange={(e)=>setEditForm(prev=>({...prev, rate_per_unit_distance: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('rate_per_hour')}
                  <InfoTooltip 
                    title="Tarifa por Tiempo"
                    content="Costo por cada hora de viaje (incluyendo esperas). Ejemplo: $20/hora × 0.5 horas = $10.00"
                  />
                </label>
                <input type="number" value={editForm.rate_per_hour} onChange={(e)=>setEditForm(prev=>({...prev, rate_per_hour: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('min_fare')}
                  <InfoTooltip 
                    title="Tarifa Mínima"
                    content="Costo mínimo garantizado para cualquier viaje. Si el cálculo es menor, se cobra este monto. Ejemplo: Viaje corto calculado en $8, pero tarifa mínima es $12 → se cobra $12"
                  />
                </label>
                <input type="number" value={editForm.min_fare} onChange={(e)=>setEditForm(prev=>({...prev, min_fare: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('convenience_fee')}
                  <InfoTooltip 
                    title="Tarifa de Conveniencia"
                    content="Cargo adicional por servicios de conveniencia. Puede ser fijo ($2) o porcentual (5% del total). Se suma al final del cálculo."
                  />
                </label>
                <input type="number" value={editForm.convenience_fees} onChange={(e)=>setEditForm(prev=>({...prev, convenience_fees: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('convenience_fee_type')}
                  <InfoTooltip 
                    title="Tipo de Tarifa de Conveniencia"
                    content="Flat: Cantidad fija (ej: $2). Percentage: Porcentaje del total (ej: 5% de $50 = $2.50)"
                  />
                </label>
                <select value={editForm.convenience_fee_type} onChange={(e)=>setEditForm(prev=>({...prev, convenience_fee_type: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="flat">{t('flat')}</option>
                  <option value="percentage">{t('percentage')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {t('fleet_admin_comission')}
                  <InfoTooltip 
                    title="Comisión de Administrador de Flota"
                    content="Porcentaje que recibe el administrador de flota por cada viaje. Se calcula sobre el total del viaje. Ejemplo: 10% de $50 = $5"
                  />
                </label>
                <input type="number" value={editForm.fleet_admin_fee} onChange={(e)=>setEditForm(prev=>({...prev, fleet_admin_fee: Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
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
          <div className="flex justify-end space-x-2 mt-6">
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

      {/* Existing image modal and other Material UI modals remain for image handling */}
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