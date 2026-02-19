import React, { useState, useEffect, useRef } from "react";
// import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import { Modal, Grid, Typography } from "@mui/material";
import Button from "components/CustomButtons/Button.js";
import CancelIcon from "@mui/icons-material/Cancel";
import AlertDialog from "../components/AlertDialog";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { colors } from "../components/Theme/WebTheme";
import moment from "moment/min/moment-with-locales";
import Switch from "@mui/material/Switch";
import { useNavigate, useLocation } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { FONT_FAMILY, SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
// import BlankTable from '../components/Table/BlankTable';
// import TableStyle from '../components/Table/Style';
// import localization from '../components/Table/Localization';
import { getLangKey } from "common/src/other/getLangKey";
import { VEHICLE_COLORS, getVehicleColorByKey } from 'common/src/other/VehicleColors';
import TableShadcn from '../components/ui/TableShadcn';
import IconButton from '../components/ui/icon-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '../components/ui/dialog';
import {
  AlertDialog as ShadAlertDialog,
  AlertDialogAction as ShadAlertDialogAction,
  AlertDialogCancel as ShadAlertDialogCancel,
  AlertDialogContent as ShadAlertDialogContent,
  AlertDialogDescription as ShadAlertDialogDescription,
  AlertDialogFooter as ShadAlertDialogFooter,
  AlertDialogHeader as ShadAlertDialogHeader,
  AlertDialogTitle as ShadAlertDialogTitle,
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
    width: 500,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function CarsList() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector((state) => state.settingsdata.settings);
  const userdata = useSelector((state) => state.usersdata);
  const auth = useSelector((state) => state.auth);
  const cartypes = useSelector((state) => state.cartypes);
  const { updateUserCar, editCar } = api;
  const [driversObj, setDriversObj] = useState();
  const [data, setData] = useState([]);
  const carlistdata = useSelector((state) => state.carlistdata);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const classes = useStyles();
  const [role, setRole] = useState(null);
  const { state } = useLocation()
  const [currentPage, setCurrentPage] = useState(null)

  useEffect(() => {
    setCurrentPage(state?.pageNo)
  }, [state])

  useEffect(() => {
    if (role !== "driver" && userdata.users) {
      let arr = userdata.users.filter(
        (user) =>
          user.usertype === "driver" &&
          ((role === "fleetadmin" &&
            user.fleetadmin &&
            user.fleetadmin === auth.profile.uid) ||
            role === "admin")
      );
      let obj = {};
      for (let i = 0; i < arr.length; i++) {
        let user = arr[i];
        obj[user.id] = `${user.firstName} ${user.lastName} (${settings.AllowCriticalEditsAdmin ? user.mobile : t("hidden_demo")}) ${settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo")}`;
      }
      setDriversObj(obj);
    }
  }, [
    userdata.users,
    settings.AllowCriticalEditsAdmin,
    role,
    auth.profile.uid,
    t,
  ]);

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  useEffect(() => {
    if (carlistdata?.cars && driversObj) {
      const updatedData = carlistdata.cars.map((car) => ({
        ...car,
        driverName: driversObj[car?.driver] || " ",
      }));
      setData(updatedData);
    } else {
      setData([]);
    }
  }, [carlistdata?.cars, driversObj]);

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
    if (settings.AllowCriticalEditsAdmin) {
      if (selectedImage) {
        setLoading(true);
        let finalData = userData;
        finalData.car_image = selectedImage;
        dispatch(editCar(finalData, "UpdateImage"));
        setProfileModal(false);
        setTimeout(() => {
          setSelectedImage(null);
          setLoading(false);
        }, 10000);
      } else {
        setCommonAlert({ open: true, msg: t("choose_image_first") });
      }

    } else {
      setCommonAlert({ open: true, msg: t('demo_mode') })
    }
  }

  const onClick = (rowData) => {
    setImageData(rowData.car_image);
    setProfileModal(true);
    setUserData(rowData);
  };

  // TableShadcn columns
  const columns = React.useMemo(() => ([
    { accessorKey: 'createdAt', header: t('createdAt'), cell: ({ row }) => row.original.createdAt ? moment(row.original.createdAt).format('lll') : null },
    { accessorKey: 'driverName', header: t('driver'), cell: ({ row }) => row.original.driverName || null },
    { accessorKey: 'carType', header: t('car_type'), cell: ({ row }) => row.original.carType ? t(getLangKey(row.original.carType)) : null },
    { accessorKey: 'vehicleNumber', header: t('vehicle_reg_no') },
    { accessorKey: 'vehicleMake', header: t('vehicle_model_name') },
    { accessorKey: 'vehicleModel', header: t('vehicle_model_no') },
    { accessorKey: 'other_info', header: t('other_info') },
    {
      accessorKey: 'vehicleColor', header: t('vehicle_color'), cell: ({ row }) => {
        const colorObj = getVehicleColorByKey(row.original.vehicleColor);
        return colorObj ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', backgroundColor: colorObj.hex, border: '1px solid #E2E9EC' }} />
            <span>{t(colorObj.labelKey)}</span>
          </div>
        ) : null;
      }
    },
    {
      accessorKey: 'car_image', header: t('image'), cell: ({ row }) => row.original.car_image ? (
        <button onClick={() => onClick(row.original)}><img alt='CarImage' src={row.original.car_image} style={{ width: 50 }} /></button>
      ) : null
    },
    {
      accessorKey: 'active', header: t('active_status'), cell: ({ row }) => (
        <Switch disabled checked={!!row.original.active} />
      )
    },
    {
      accessorKey: 'approved', header: t('approved'), cell: ({ row }) => (
        <Switch
          checked={!!row.original.approved}
          onChange={() => handelApproved(row.original)}
          disabled={!(settings.AllowCriticalEditsAdmin && settings.carApproval && role === 'admin')}
        />
      )
    },
  ]), [t, settings, role]);

  const handelApproved = (rowData) => {
    if (settings.carApproval && role === "admin") {
      dispatch(
        updateUserCar(rowData.driver, {
          carApproved: !rowData.approved,
        })
      );
      dispatch(editCar({ ...rowData, approved: !rowData.approved }, "Update"));
    }
  };
  const handelActiveStatus = (rowData) => {
    const updateData = { ...rowData, active: !rowData.active };
    return updateData;
  };

  // Shadcn add/edit modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const initialEditForm = React.useMemo(() => ({
    driver: '',
    carType: '',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    other_info: '',
    active: true,
    approved: false,
  }), []);
  const [editForm, setEditForm] = useState(initialEditForm);

  const handleAddClick = () => {
    setItemToEdit(null);
    setEditForm(initialEditForm);
    setEditDialogOpen(true);
  };
  const handleEditClick = (row) => {
    setItemToEdit(row);
    setEditForm({
      driver: row.driver || '',
      carType: row.carType || '',
      vehicleNumber: row.vehicleNumber || '',
      vehicleMake: row.vehicleMake || '',
      vehicleModel: row.vehicleModel || '',
      vehicleColor: row.vehicleColor || '',
      other_info: row.other_info || '',
      active: !!row.active,
      approved: !!row.approved,
    });
    setEditDialogOpen(true);
  };
  const handleSave = () => {
    const isEmpty = (v) => !v || String(v).trim() === '';
    if (isEmpty(editForm.carType) || isEmpty(editForm.vehicleNumber)) {
      setCommonAlert({ open: true, msg: t('please_enter_required') || 'Por favor completa los campos obligatorios' });
      return;
    }
    if (itemToEdit) {
      const updated = { ...itemToEdit, ...editForm };
      dispatch(editCar(updated, 'Update'));
    } else {
      const newItem = { ...editForm, createdAt: Date.now() };
      dispatch(editCar(newItem, 'Add'));
    }
    setEditDialogOpen(false);
    setItemToEdit(null);
  };

  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.active) {
        alert(t('active_car_delete'));
      } else {
        dispatch(editCar(itemToDelete, 'Delete'));
      }
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return carlistdata.loading ? (
    <CircularLoading />
  ) : (
    <div ref={rootRef}>
      <ThemeProvider theme={theme}>
        <div style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          padding: '20px',
        }}>
          <TableShadcn
            columns={columns}
            data={data || []}
            initialFilterColumn={'vehicleNumber'}
            onAdd={handleAddClick}
            addButtonLabel={t('add_car')}
            title={t('cars_title')}
            columnsButtonLabel={t('columns')}
            columnLabels={{
              createdAt: t('createdAt'),
              driverName: t('driver'),
              carType: t('car_type'),
              vehicleNumber: t('vehicle_reg_no'),
              vehicleMake: t('vehicle_model_name'),
              vehicleModel: t('vehicle_model_no'),
              other_info: t('other_info'),
              vehicleColor: t('vehicle_color'),
              car_image: t('image'),
              active: t('active_status'),
              approved: t('approved')
            }}
            renderActions={(row) => (
              <div style={{ display: 'flex', gap: 6 }}>
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
      </ThemeProvider>

      {/* Modal edición/alta */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) setEditDialogOpen(false); else setEditDialogOpen(true); }}>
        <DialogOverlay onClick={() => setEditDialogOpen(false)} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemToEdit ? t('edit') : t('add_car')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('driver')}</label>
              <select value={editForm.driver} onChange={(e) => setEditForm(prev => ({ ...prev, driver: e.target.value }))} disabled={role === 'driver'} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">{t('select_driver')}</option>
                {driversObj && Object.keys(driversObj).map((id) => (
                  <option key={id} value={id}>{driversObj[id]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('car_type')}</label>
                <select
                  value={editForm.carType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, carType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('select_vehicle_type')}</option>
                  {cartypes?.cars && cartypes.cars
                    .sort((a, b) => (a.pos || 0) - (b.pos || 0))
                    .map((carType) => (
                      <option key={carType.name} value={carType.name}>
                        {t(getLangKey(carType.name))}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle_reg_no')}</label>
                <input type="text" value={editForm.vehicleNumber} onChange={(e) => setEditForm(prev => ({ ...prev, vehicleNumber: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle_model_name')}</label>
                <input type="text" value={editForm.vehicleMake} onChange={(e) => setEditForm(prev => ({ ...prev, vehicleMake: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle_model_no')}</label>
                <input type="text" value={editForm.vehicleModel} onChange={(e) => setEditForm(prev => ({ ...prev, vehicleModel: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('other_info')}</label>
              <textarea value={editForm.other_info} onChange={(e) => setEditForm(prev => ({ ...prev, other_info: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicle_color')}</label>
              <select
                value={editForm.vehicleColor}
                onChange={(e) => setEditForm(prev => ({ ...prev, vehicleColor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('select_vehicle_color')}</option>
                {VEHICLE_COLORS.map((colorItem) => (
                  <option key={colorItem.key} value={colorItem.key}>
                    {t(colorItem.labelKey)}
                  </option>
                ))}
              </select>
              {editForm.vehicleColor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', backgroundColor: getVehicleColorByKey(editForm.vehicleColor)?.hex || '#CCC', border: '1px solid #E2E9EC' }} />
                  <span className="text-sm">{t(getVehicleColorByKey(editForm.vehicleColor)?.labelKey || '')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm(prev => ({ ...prev, active: e.target.checked }))} className="h-4 w-4" />
                {t('active_status')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editForm.approved} onChange={(e) => setEditForm(prev => ({ ...prev, approved: e.target.checked }))} className="h-4 w-4" />
                {t('approved')}
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={() => setEditDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              {t('cancel')}
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              {t('save')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado */}
      <ShadAlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ShadAlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{t('confirm_delete')}</ShadAlertDialogTitle>
            <ShadAlertDialogDescription>
              {t('delete_confirmation') || '¿Eliminar este registro?'}
            </ShadAlertDialogDescription>
          </ShadAlertDialogHeader>
          <ShadAlertDialogFooter>
            <ShadAlertDialogCancel onClick={() => setConfirmOpen(false)}>{t('cancel')}</ShadAlertDialogCancel>
            <ShadAlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</ShadAlertDialogAction>
          </ShadAlertDialogFooter>
        </ShadAlertDialogContent>
      </ShadAlertDialog>

      {/* Modal imagen existente */}
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
                  style={{ backgroundColor: colors.RED, fontFamily: FONT_FAMILY }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleSetProfileModal}
                  variant="contained"
                  color="secondaryButton"
                  style={{ marginLeft: 10, backgroundColor: colors.GREEN, fontFamily: FONT_FAMILY }}
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
