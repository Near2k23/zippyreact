import React from "react";
import { makeStyles } from "@mui/styles";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  heroBackground: {
    background: "transparent",
    position: "relative",
    overflow: "hidden",
    height: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "80px",
  },
  heroContent: {
    position: "absolute",
    top: "calc(50% + 40px)",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    textAlign: "center",
    color: "#1e293b",
    padding: "0px 20px",
    width: "100%",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: 700,
    marginBottom: "5px",
    color: "var(--text-primary)",
    [theme.breakpoints.down("md")]: {
      fontSize: "2rem",
    },
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "var(--text-secondary)",
    marginBottom: "0px",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
    [theme.breakpoints.down("md")]: {
      fontSize: "1rem",
    },
  },
  contentContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px 20px 40px 20px",
    background: "transparent",
    position: "relative",
    marginTop: "5px",
    [theme.breakpoints.down("md")]: {
      padding: "15px 15px 30px 15px",
      marginTop: "3px",
    },
  },
  sectionHeading: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "16px",
    marginTop: "32px",
    paddingBottom: "8px",
    borderBottom: "2px solid var(--border-light)",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-2px",
      left: 0,
      width: "60px",
      height: "2px",
      background: "var(--gradient-primary)",
    },
  },
  sectionContent: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "var(--text-secondary)",
    marginBottom: "24px",
    textAlign: "justify",
    [theme.breakpoints.down("md")]: {
      fontSize: "0.95rem",
      lineHeight: "1.6",
    },
  },
  sectionContentRTL: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "var(--text-secondary)",
    marginBottom: "24px",
    textAlign: "right",
    [theme.breakpoints.down("md")]: {
      fontSize: "0.95rem",
      lineHeight: "1.6",
    },
  },
  contactSection: {
    background: "var(--bg-secondary)",
    padding: "32px",
    borderRadius: "16px",
    marginTop: "20px",
    border: "1px solid var(--border-light)",
    boxShadow: "0 4px 6px -1px var(--shadow-medium), 0 2px 4px -1px var(--shadow-light)",
  },
  contactEmail: {
    color: "var(--primary-color)",
    textDecoration: "none",
    fontWeight: 600,
    "&:hover": {
      textDecoration: "underline",
      color: "var(--primary-dark)",
    },
  },
}));

export default function TermCondition(props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const classes = useStyles();
  return (
    <div>
      <Navbar 
        logoSrc={require("assets/img/logo.png")}
        logoSrcDark={require("assets/img/logo.png")}
        darkText={true}
      />
      
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-60 sm:h-60 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-100 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 rounded-full opacity-30"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className={classes.heroBackground}>
            <div className={classes.heroContent}>
              <h1 className={classes.heroTitle}>{t('term_condition')}</h1>
            </div>
          </div>

          <div className={classes.contentContainer}>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para1')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading1')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para2')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading2')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para3')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading3')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para4')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading4')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para5')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading5')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para6')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading6')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para7')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading7')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para8')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading8')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para9')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading9')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para10')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading10')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para11')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading11')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para12')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('term_condition_heading12')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('term_condition_para13')}
            </p>
            
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
