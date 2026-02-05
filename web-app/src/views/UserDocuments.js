import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Typography, 
  Grid, 
  Card, 
  Avatar, 
  Button, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Box,
  Fade,
  Backdrop,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { colors } from "../components/Theme/WebTheme";
import CircularLoading from "../components/CircularLoading";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AlertDialog from "../components/AlertDialog";
import { api } from "common";
import { updateUserDocumentStatus } from "common/src/actions/usersactions";
import { MAIN_COLOR, SECONDORY_COLOR, FONT_FAMILY } from "../common/sharedFunctions";
import { makeStyles } from "@mui/styles";
import GoBackButton from "components/GoBackButton";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    background: `linear-gradient(135deg, ${colors.WHITE} 0%, ${SECONDORY_COLOR} 100%)`,
    minHeight: "100vh",
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: "100vw",
    boxSizing: "border-box",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      alignItems: "stretch",
    },
  },
  documentCard: {
    borderRadius: "24px",
    backgroundColor: colors.WHITE,
    boxShadow: "0 20px 40px rgba(0, 141, 153, 0.1)",
    border: `1px solid ${colors.TABLE_BORDER}`,
    overflow: "hidden",
    transition: "all 0.3s ease",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    "&:hover": {
      boxShadow: "0 25px 50px rgba(0, 141, 153, 0.15)",
      transform: "translateY(-2px)",
    },
    [theme.breakpoints.down("sm")]: {
      borderRadius: 0,
      borderLeft: "none",
      borderRight: "none",
    },
  },
  imageCard: {
    borderRadius: "20px",
    backgroundColor: colors.WHITE,
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
    border: `2px solid ${colors.TABLE_BORDER}`,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    height: 400,
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      transform: "translateY(-8px) scale(1.02)",
      boxShadow: "0 15px 35px rgba(0, 141, 153, 0.2)",
      borderColor: MAIN_COLOR,
    },
    "&:hover .zoom-overlay": {
      opacity: 1,
    },
    [theme.breakpoints.down("sm")]: {
      margin: 0,
      padding: theme.spacing(1),
      height: 300,
      borderRadius: "16px",
    },
  },
  imageContainer: {
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    "&:hover .zoom-icon": {
      opacity: 1,
      transform: "scale(1.1)",
    },
  },
  zoomOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 141, 153, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "all 0.3s ease",
    borderRadius: "16px",
  },
  zoomIcon: {
    color: colors.WHITE,
    fontSize: 48,
    transition: "all 0.3s ease",
    opacity: 0,
  },
  uploadArea: {
    width: "100%",
    height: 280,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    border: `3px dashed ${colors.TABLE_BORDER}`,
    backgroundColor: `${SECONDORY_COLOR}20`,
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    flex: 1,
    "&:hover": {
      borderColor: MAIN_COLOR,
      backgroundColor: `${MAIN_COLOR}10`,
      transform: "scale(1.02)",
    },
    "&:hover .upload-icon": {
      transform: "scale(1.1) rotate(5deg)",
      color: MAIN_COLOR,
    },
    [theme.breakpoints.down("sm")]: {
      height: 200,
      borderRadius: "16px",
    },
  },
  uploadIcon: {
    fontSize: 80,
    color: colors.TABLE_BORDER,
    marginBottom: theme.spacing(2),
    transition: "all 0.3s ease",
    [theme.breakpoints.down("sm")]: {
      fontSize: 50,
      marginBottom: theme.spacing(1),
    },
  },
  buttonStyle: {
    borderRadius: "25px",
    minHeight: 56,
    minWidth: 160,
    margin: theme.spacing(1),
    textAlign: "center",
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    fontWeight: 600,
    textTransform: "none",
    fontSize: "16px",
    boxShadow: "0 4px 15px rgba(0, 141, 153, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 141, 153, 0.3)",
    },
  },
  previewDialog: {
    "& .MuiDialog-paper": {
      borderRadius: "20px",
      maxWidth: "90vw",
      maxHeight: "90vh",
      backgroundColor: "transparent",
      boxShadow: "none",
    },
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "80vh",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    cursor: "grab",
    transition: "transform 0.1s ease",
    userSelect: "none",
    zIndex: 1,
    "&:active": {
      cursor: "grabbing",
    },
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  previewContainer: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: colors.WHITE,
    zIndex: 1000,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      transform: "scale(1.1)",
    },
    transition: "all 0.2s ease-in-out",
  },
  documentStatusCard: {
    borderRadius: "16px",
    backgroundColor: colors.WHITE,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    border: `1px solid ${colors.TABLE_BORDER}`,
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 30px rgba(0, 141, 153, 0.15)",
      transform: "translateY(-2px)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.5),
      margin: 0,
      marginBottom: theme.spacing(2),
    },
  },
}));

function UserDocuments() {
  const { id, rId } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settingsdata.settings);
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const { fetchUsersOnce, updateLicenseImage } = api;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [images, setImages] = useState({
    idImage: null,
    licenseImageFront: null,
    licenseImageBack: null,
    vehicleRegistrationCard: null
  });
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const [previewImage, setPreviewImage] = useState({ open: false, src: "", title: "" });
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const classes = useStyles();

  // Estado para gestión de documentos - usando useRef para evitar re-renders
  const documentStatusesRef = useRef({
    verifyIdImage: { status: 'pending', note: '' },
    selfieImg: { status: 'pending', note: '' },
    licenseImageFront: { status: 'pending', note: '' },
    licenseImageBack: { status: 'pending', note: '' },
    vehicleRegistrationCard: { status: 'pending', note: '' }
  });
  const driverNotesRef = useRef('');
  const adminNotesRef = useRef('');
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const [localDriverNotes, setLocalDriverNotes] = useState('');
  const [localAdminNotes, setLocalAdminNotes] = useState('');

  useEffect(() => {
    dispatch(fetchUsersOnce());
  }, [dispatch, fetchUsersOnce]);

  useEffect(() => {
    if (staticusers) {
      const user = staticusers.find((user) => user.id === id.toString());
      if (!user) {
        navigate("/404");
      } else {
        setData(user);
        if (user.documentStatus) {
          documentStatusesRef.current = user.documentStatus;
        }
        driverNotesRef.current = user.driver_notes || '';
        adminNotesRef.current = user.admin_notes || '';
        setLocalDriverNotes(user.driver_notes || '');
        setLocalAdminNotes(user.admin_notes || '');
        setForceUpdate(prev => prev + 1);
      }
    }
  }, [staticusers, id, navigate]);

  const handleImageChange = useCallback((field) => (e) => {
    setImages(prev => ({ ...prev, [field]: e.target.files[0] }));
  }, []);

  const handleStatusChange = useCallback((docType, field, value) => {
    documentStatusesRef.current = {
      ...documentStatusesRef.current,
      [docType]: {
        ...documentStatusesRef.current[docType],
        [field]: value,
        updatedAt: new Date().getTime(),
        updatedBy: 'admin'
      }
    };
  }, []);

  const handleDriverNotesChange = useCallback((value) => {
    setLocalDriverNotes(value);
    driverNotesRef.current = value;
  }, []);

  const handleAdminNotesChange = useCallback((value) => {
    setLocalAdminNotes(value);
    adminNotesRef.current = value;
  }, []);

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': 
      default: return 'warning';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch(status) {
      case 'approved': return t('approved');
      case 'rejected': return t('rejected');
      case 'pending':
      default: return t('pending');
    }
  }, [t]);

  const handleSaveUser = useCallback(() => {
    setLoading(true);
    let isAnyIdUploaded = false;
    if (settings.AllowCriticalEditsAdmin) {
      Object.entries(images).forEach(([field, image]) => {
        if (image) {
          isAnyIdUploaded = true;
          dispatch(updateLicenseImage(data.id, image, field));
        }
      });
      if (!isAnyIdUploaded) {
        setCommonAlert({ open: true, msg: t("no_doc_uploaded") });
      }
      setTimeout(() => {
        setImages({ idImage: null, licenseImageFront: null, licenseImageBack: null, vehicleRegistrationCard: null });
        setEditable(false);
        setLoading(false);
        dispatch(fetchUsersOnce());
      }, 3000);
    } else {
      setCommonAlert({ open: true, msg: t("demo_mode") });
      setLoading(false);
    }
  }, [settings.AllowCriticalEditsAdmin, images, data.id, dispatch, t, fetchUsersOnce, updateLicenseImage]);

  const handleCancel = useCallback(() => {
    setImages({ idImage: null, licenseImageFront: null, licenseImageBack: null, vehicleRegistrationCard: null });
    setEditable(false);
  }, []);

  const handleSaveDocumentStatuses = useCallback(async () => {
    setLoading(true);
    const updateData = {
      documentStatus: documentStatusesRef.current,
      driver_notes: driverNotesRef.current,
      admin_notes: adminNotesRef.current
    };
    const rejectedDocs = Object.entries(documentStatusesRef.current).filter(
      ([, val]) => val.status === 'rejected'
    );
    await dispatch(updateUserDocumentStatus(data.id, updateData, rejectedDocs.length > 0));
    setLoading(false);
    setCommonAlert({ open: true, msg: t('document_status_updated') });
  }, [data.id, dispatch, t]);

  const handleImagePreview = useCallback((imageUrl, title) => {
    if (imageUrl) {
      setPreviewImage({ open: true, src: imageUrl, title });
      setIsZoomed(false);
      setZoomLevel(1);
      setDragState({ isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 });
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImage({ open: false, src: "", title: "" });
    setIsZoomed(false);
    setZoomLevel(1);
    setDragState({ isDragging: false, startX: 0, startY: 0, translateX: 0, translateY: 0 });
  }, []);

  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    if (e.detail === 2) {
      const newZoomLevel = zoomLevel === 1 ? 2 : 1;
      setZoomLevel(newZoomLevel);
      setIsZoomed(newZoomLevel > 1);
    }
  }, [zoomLevel]);

  const handleMouseDown = useCallback((e) => {
    if (zoomLevel > 1) {
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        startX: e.clientX - prev.translateX,
        startY: e.clientY - prev.translateY
      }));
    }
  }, [zoomLevel]);

  const handleMouseMove = useCallback((e) => {
    if (dragState.isDragging && zoomLevel > 1) {
      setDragState(prev => ({
        ...prev,
        translateX: e.clientX - prev.startX,
        translateY: e.clientY - prev.startY
      }));
    }
  }, [dragState.isDragging, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoomLevel);
    setIsZoomed(newZoomLevel > 1);
  }, [zoomLevel]);

  const commonFields = [
    { title: t("verifyid_image"), imageUrl: data?.verifyIdImage, placeholder: t("verifyid_image"), field: "verifyIdImage" },
    { title: t("selfie_image") || "Selfie", imageUrl: data?.selfieImg, placeholder: t("selfie_image") || "Selfie", field: "selfieImg" },
  ];

  const driverFields = [
    { title: t("license_image_front"), imageUrl: data?.licenseImage, placeholder: t("license_image_front"), field: "licenseImage" },
    { title: t("license_image_back"), imageUrl: data?.licenseImageBack, placeholder: t("license_image_back"), field: "licenseImageBack" },
    { title: t("vehicle_registration_card_image"), imageUrl: data?.vehicleRegistrationCard, placeholder: t("upload_vehicle_registration_card"), field: "vehicleRegistrationCard" },
  ];

  const imageFields = data.usertype === "driver" ? [...commonFields, ...driverFields] : commonFields;

  const DocumentStatusCard = ({ docType, title, imageUrl }) => {
    const [localStatus, setLocalStatus] = useState(documentStatusesRef.current[docType]?.status || 'pending');
    const [localNote, setLocalNote] = useState(documentStatusesRef.current[docType]?.note || '');
    
    useEffect(() => {
      const currentStatus = documentStatusesRef.current[docType] || { status: 'pending', note: '' };
      setLocalStatus(currentStatus.status);
      setLocalNote(currentStatus.note);
    }, [docType, forceUpdate]);
    
    const handleStatusChangeLocal = (value) => {
      setLocalStatus(value);
      handleStatusChange(docType, 'status', value);
    };
    
    const handleNoteChangeLocal = (value) => {
      setLocalNote(value);
      handleStatusChange(docType, 'note', value);
    };
    
    return (
      <Card className={classes.documentStatusCard} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: MAIN_COLOR }}>
          {title}
        </Typography>
        
        <ImageCard imageUrl={imageUrl} title={title} showTitle={false} />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id={`${docType}-status-label`}>{t('status')}</InputLabel>
          <Select
            labelId={`${docType}-status-label`}
            id={`${docType}-status-select`}
            value={localStatus}
            label={t('status')}
            onChange={(e) => handleStatusChangeLocal(e.target.value)}
          >
            <MenuItem value="pending">{t('pending')}</MenuItem>
            <MenuItem value="approved">{t('approved')}</MenuItem>
            <MenuItem value="rejected">{t('rejected')}</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('admin_note')}
          value={localNote}
          onChange={(e) => handleNoteChangeLocal(e.target.value)}
          sx={{ mt: 2 }}
        />
      </Card>
    );
  };

  const ImageUpload = ({ image, onClick, altText, uploadText }) => (
    <Card className={classes.imageCard} onClick={onClick}>
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: "center", 
          fontSize: 18, 
          fontWeight: 600, 
          fontFamily: FONT_FAMILY,
          marginBottom: 2,
          color: MAIN_COLOR,
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {altText}
      </Typography>
      {image ? (
        <div className={classes.imageContainer} style={{ flex: 1 }}>
          <img 
            src={URL.createObjectURL(image)} 
            alt={altText} 
            style={{ 
              width: "100%", 
              maxWidth: "100%",
              height: "100%", 
              borderRadius: "16px",
              objectFit: "cover"
            }} 
          />
          <div className={`${classes.zoomOverlay} zoom-overlay`}>
            <ZoomInIcon className={`${classes.zoomIcon} zoom-icon`} />
          </div>
        </div>
      ) : (
        <div className={classes.uploadArea}>
          <FileUploadIcon className={`${classes.uploadIcon} upload-icon`} />
          <Typography 
            sx={{ 
              textAlign: "center", 
              fontSize: 16,
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              color: colors.TABLE_BORDER
            }}
          >
            {uploadText}
          </Typography>
        </div>
      )}
    </Card>
  );

  const ImageCard = ({ title, imageUrl, placeholder, onClick, showTitle = true }) => (
    <Card className={classes.imageCard} onClick={imageUrl ? () => handleImagePreview(imageUrl, title) : onClick}>
      {showTitle && (
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: "center", 
            fontSize: 18, 
            fontWeight: 600, 
            fontFamily: FONT_FAMILY,
            marginBottom: 2,
            color: MAIN_COLOR,
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {title}
        </Typography>
      )}
      {imageUrl ? (
        <div className={classes.imageContainer} style={{ flex: 1 }}>
          <img 
            src={imageUrl} 
            alt={title} 
            style={{ 
              width: "100%", 
              maxWidth: "100%",
              height: "100%", 
              borderRadius: "16px",
              objectFit: "cover"
            }} 
          />
          <div className={`${classes.zoomOverlay} zoom-overlay`}>
            <ZoomInIcon className={`${classes.zoomIcon} zoom-icon`} />
          </div>
        </div>
      ) : (
        <div className={classes.uploadArea}>
          <FileUploadIcon className={`${classes.uploadIcon} upload-icon`} />
          <Typography 
            sx={{ 
              textAlign: "center", 
              fontSize: 16,
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              color: colors.TABLE_BORDER
            }}
          >
            {placeholder}
          </Typography>
        </div>
      )}
    </Card>
  );

  const EditButtonGroup = ({ editable, onEdit, onSave, onCancel, isDriver = false }) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
      {!editable ? (
        <>
          {isDriver && (
            <Button
              className={classes.buttonStyle}
              sx={{
                backgroundColor: MAIN_COLOR,
                width: 200,
                "&:hover": {
                  backgroundColor: SECONDORY_COLOR,
                  transform: "translateY(-3px)",
                },
              }}
              variant="contained"
              onClick={handleSaveDocumentStatuses}
              startIcon={<SaveIcon />}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 600, fontFamily: FONT_FAMILY, color: colors.WHITE }}>
                {t("save_document_status")}
              </Typography>
            </Button>
          )}
          <Button
            className={classes.buttonStyle}
            sx={{
              backgroundColor: MAIN_COLOR,
              width: 120,
              "&:hover": {
                backgroundColor: SECONDORY_COLOR,
                transform: "translateY(-3px)",
              },
            }}
            variant="contained"
            onClick={onEdit}
            startIcon={<EditIcon />}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: FONT_FAMILY, color: colors.WHITE }}>
              {t("edit")}
            </Typography>
          </Button>
        </>
      ) : (
        <>
          <Button
            className={classes.buttonStyle}
            sx={{ 
              backgroundColor: colors.GREEN, 
              width: 100,
              "&:hover": { 
                backgroundColor: "#2e7d32",
                transform: "translateY(-3px)",
              } 
            }}
            variant="contained"
            onClick={onSave}
            startIcon={<SaveIcon />}
          >
            <Typography sx={{ color: colors.WHITE, fontSize: 14, fontWeight: 600, fontFamily: FONT_FAMILY }}>
              {t("save")}
            </Typography>
          </Button>
          <Button 
            className={classes.buttonStyle} 
            sx={{ 
              backgroundColor: colors.RED, 
              width: 100,
              "&:hover": {
                backgroundColor: "#d32f2f",
                transform: "translateY(-3px)",
              }
            }} 
            variant="contained" 
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            <Typography sx={{ color: colors.WHITE, fontSize: 14, fontWeight: 600, fontFamily: FONT_FAMILY }}>
              {t("cancel")}
            </Typography>
          </Button>
        </>
      )}
    </Box>
  );

  return loading ? (
    <CircularLoading />
  ) : (
    <Box className={classes.mainContainer}>
      <Card className={classes.documentCard} sx={{ margin: { xs: 0, sm: 2 }, padding: { xs: 1.5, sm: 3 }, maxWidth: "100%", borderRadius: { xs: 0, sm: "24px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: isRTL === "rtl" ? "flex-end" : "flex-start", gap: 2, marginBottom: data.usertype === "driver" ? 3 : 0 }}>
          <GoBackButton isRTL={isRTL} onClick={() => navigate(`/users/${rId}`, { state: { pageNo: state?.pageNo } })} />
          {data.usertype === "driver" && (
            <Typography variant="h5" sx={{ fontWeight: 600, color: MAIN_COLOR }}>
              {t('status')}
            </Typography>
          )}
        </Box>
        
        {data.usertype === "driver" ? (
          <Box sx={{ mt: 2 }}>
            
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <DocumentStatusCard
                  docType="verifyIdImage"
                  title={t("verifyid_image")}
                  imageUrl={data?.verifyIdImage}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <DocumentStatusCard
                  docType="selfieImg"
                  title={t("selfie_image") || "Selfie"}
                  imageUrl={data?.selfieImg}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <DocumentStatusCard
                  docType="licenseImageFront"
                  title={t("license_image_front")}
                  imageUrl={data?.licenseImage}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <DocumentStatusCard
                  docType="licenseImageBack"
                  title={t("license_image_back")}
                  imageUrl={data?.licenseImageBack}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <DocumentStatusCard
                  docType="vehicleRegistrationCard"
                  title={t("vehicle_registration_card_image")}
                  imageUrl={data?.vehicleRegistrationCard}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('driver_notes')}
                value={localDriverNotes}
                onChange={(e) => handleDriverNotesChange(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('admin_notes')}
                value={localAdminNotes}
                onChange={(e) => handleAdminNotesChange(e.target.value)}
              />
            </Box>

          </Box>
        ) : (
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="center" alignItems="stretch" sx={{ marginY: { xs: 1, sm: 2 } }}>
            {editable ? (
              imageFields?.map((field, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ImageUpload 
                    image={images[field.field]} 
                    onClick={() => document.getElementById(field.field).click()} 
                    altText={field.title} 
                    uploadText={t(field.placeholder)} 
                  />
                </Grid>
              ))
            ) : (
              imageFields?.map((field, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ImageCard 
                    title={field.title} 
                    imageUrl={field.imageUrl} 
                    placeholder={field.placeholder} 
                    onClick={() => setEditable(true)} 
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}
        
        <EditButtonGroup 
          editable={editable} 
          onEdit={() => setEditable(true)} 
          onSave={handleSaveUser} 
          onCancel={handleCancel}
          isDriver={data.usertype === "driver"}
        />
        
        {imageFields?.map((field) => (
          <input key={field.field} id={field.field} type="file" hidden onChange={handleImageChange(field.field)} />
        ))}
        
        <AlertDialog open={commonAlert.open} onClose={() => setCommonAlert({ open: false, msg: "" })}>
          {commonAlert.msg}
        </AlertDialog>
      </Card>

      <Dialog
        open={previewImage.open}
        onClose={handleClosePreview}
        className={classes.previewDialog}
        maxWidth="lg"
        fullWidth
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <DialogContent sx={{ padding: 0, position: "relative" }}>
          <IconButton
            className={classes.closeButton}
            onClick={handleClosePreview}
            size="large"
          >
            <CloseIcon />
          </IconButton>
          
          <Box 
            className={classes.previewContainer}
            onWheel={handleWheel}
          >
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className={classes.previewImage}
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              style={{
                transform: `scale(${zoomLevel}) translate(${dragState.translateX}px, ${dragState.translateY}px)`,
                cursor: dragState.isDragging ? "grabbing" : (zoomLevel > 1 ? "grab" : "zoom-in"),
                transition: dragState.isDragging ? "none" : "transform 0.1s ease",
              }}
              draggable={false}
            />
          </Box>
          
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: colors.WHITE,
              padding: "8px 16px",
              borderRadius: "20px",
              fontFamily: FONT_FAMILY,
              fontWeight: 500
            }}
          >
            {previewImage.title} {zoomLevel > 1 && `(${Math.round(zoomLevel * 100)}%)`}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              bottom: 60,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: colors.WHITE,
              padding: "4px 12px",
              borderRadius: "12px",
              fontFamily: FONT_FAMILY,
              fontSize: "12px"
            }}
          >
            Doble clic para zoom • Rueda del mouse para zoom • Arrastra cuando esté ampliado
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default UserDocuments;
