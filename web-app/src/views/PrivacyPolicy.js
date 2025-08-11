import React from "react";
import { makeStyles } from "@mui/styles";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import styles from '../styles/staticPages.js';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  ...styles,
  heroBackground: {
    background: "transparent",
    position: "relative",
    overflow: "hidden",
    height: "200px",
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
  contentContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px 20px 40px 20px",
    background: "transparent",
    position: "relative",
    marginTop: "2px",
    [theme.breakpoints.down("md")]: {
      padding: "15px 15px 30px 15px",
      marginTop: "1px",
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
    marginTop: "40px",
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

export default function PrivacyPolicy(props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const classes = useStyles();
  const settings = useSelector(state => state.settingsdata.settings);
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
              <h1 className={classes.heroTitle}>{t('privacy_policy')}</h1>
            </div>
          </div>

          <div className={classes.contentContainer}>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_para1')}
            </p>
            
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_para2')}
            </p>
            
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_para3')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_info')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_info_para1')}
            </p>
            <ul className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent} style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}>
              <li>{t('privacy_policy_info_list1')}</li>
              <li>{t('privacy_policy_info_list2')}</li>
              <li>{t('privacy_policy_info_list3')}</li>
              <li>{t('privacy_policy_info_list4')}</li>
            </ul>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_info_para2')}
            </p>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_info_para3')}
            </p>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_info_para4')}
            </p>
            <ul className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent} style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}>
              <li>{t('privacy_policy_info_list5')}</li>
              <li>{t('privacy_policy_info_list6')}</li>
              <li>{t('privacy_policy_info_list7')}</li>
            </ul>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_info_para5')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_log')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_log_para1')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_cookie')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_cookie_para1')}
            </p>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_cookie_para2')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_service')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_service_para1')}
            </p>
            <ul className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent} style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}>
              <li>{t('privacy_policy_service_list1')}</li>
              <li>{t('privacy_policy_service_list2')}</li>
              <li>{t('privacy_policy_service_list3')}</li>
              <li>{t('privacy_policy_service_list4')}</li>
            </ul>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_service_para2')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_security')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_security_para1')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_link')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_link_para1')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_children')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_children_para1')}
            </p>
            
            <h3 className={classes.sectionHeading}>
              {t('delete_account_lebel').toUpperCase()}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('delete_account_msg')}
            </p>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('delete_account_subheading')}
            </p>
            <ul className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent} style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}>
              <li>{t('delete_account_para1')}</li>
              <li>{t('delete_account_para2')}</li>
            </ul>
            
            <h3 className={classes.sectionHeading}>
              {t('privacy_policy_heading_change_privacy')}
            </h3>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_change_privacy_para1')}
            </p>
            <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
              {t('privacy_policy_change_privacy_para2')}
            </p>
            
            <div className={classes.contactSection}>
              <h3 className={classes.sectionHeading}>
                {t('privacy_policy_heading_contact')}
              </h3>
              <p className={isRTL === "rtl" ? classes.sectionContentRTL : classes.sectionContent}>
                {t('privacy_policy_contact_para1')} 
                {settings && settings.contact_email ? (
                  <a href={"mailto:" + settings.contact_email} className={classes.contactEmail}>
                    <strong>{settings.contact_email}</strong>
                  </a>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
