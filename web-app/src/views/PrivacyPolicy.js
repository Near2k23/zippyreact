import React from "react";
import { makeStyles } from "@mui/styles";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";
import styles from '../styles/staticPages.js';

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
    scrollPaddingTop: "120px",
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
  legalInfoTable: {
    background: "var(--bg-secondary)",
    padding: "0",
    borderRadius: "16px",
    marginTop: "32px",
    marginBottom: "32px",
    border: "1px solid var(--border-light)",
    boxShadow: "0 4px 6px -1px var(--shadow-medium), 0 2px 4px -1px var(--shadow-light)",
    overflow: "hidden",
  },
  legalInfoHeader: {
    background: "var(--gradient-primary)",
    padding: "20px 24px",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "1.1rem",
  },
  legalInfoBody: {
    padding: "20px 24px",
  },
  legalInfoRow: {
    display: "flex",
    padding: "16px 0",
    borderBottom: "1px solid var(--border-light)",
    "&:last-child": {
      borderBottom: "none",
      paddingBottom: "0",
    },
    "&:first-of-type": {
      paddingTop: "0",
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      padding: "12px 0",
    },
  },
  legalInfoLabel: {
    fontWeight: 600,
    minWidth: "180px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      marginBottom: "6px",
      fontSize: "0.9rem",
    },
  },
  legalInfoValue: {
    color: "var(--text-secondary)",
    flex: 1,
    fontSize: "0.95rem",
    lineHeight: "1.6",
  },
  tableOfContents: {
    background: "var(--bg-secondary)",
    padding: "0",
    borderRadius: "16px",
    marginTop: "32px",
    marginBottom: "32px",
    border: "1px solid var(--border-light)",
    boxShadow: "0 4px 6px -1px var(--shadow-medium), 0 2px 4px -1px var(--shadow-light)",
    overflow: "hidden",
  },
  tocHeader: {
    background: "var(--gradient-primary)",
    padding: "20px 24px",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "1.1rem",
    margin: 0,
  },
  tocBody: {
    padding: "20px 24px",
  },
  tocList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "8px",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
    },
  },
  tocItem: {
    marginBottom: "0",
  },
  tocLink: {
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
    lineHeight: "1.8",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "var(--bg-primary)",
      color: "var(--primary-color)",
      transform: "translateX(4px)",
    },
    "&::before": {
      content: '"●"',
      marginRight: "10px",
      color: "var(--primary-color)",
      fontSize: "0.7rem",
    },
  },
}));

export default function PrivacyPolicy(props) {
  const classes = useStyles();

  const handleTocClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

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
              <h1 className={classes.heroTitle}>Privacy Policy</h1>
            </div>
          </div>

          <div className={classes.contentContainer}>
            <p className={classes.sectionContent}>
              <strong>WayGO Drive</strong>
            </p>
            <p className={classes.sectionContent}>
              <strong>Privacy Policy</strong>
            </p>
            <p className={classes.sectionContent}>
              Extended privacy disclosures for riders, drivers, and visitors
            </p>

            <div className={classes.legalInfoTable}>
              <div className={classes.legalInfoHeader}>
                Legal Information
              </div>
              <div className={classes.legalInfoBody}>
                <div className={classes.legalInfoRow}>
                  <div className={classes.legalInfoLabel}>Legal entity:</div>
                  <div className={classes.legalInfoValue}>WAYGODRIVER LLC</div>
                </div>
                <div className={classes.legalInfoRow}>
                  <div className={classes.legalInfoLabel}>Registered address:</div>
                  <div className={classes.legalInfoValue}>
                    425 Percival Road<br />
                    Columbia, South Carolina 29206<br />
                    United States
                  </div>
                </div>
                <div className={classes.legalInfoRow}>
                  <div className={classes.legalInfoLabel}>Jurisdiction:</div>
                  <div className={classes.legalInfoValue}>South Carolina, USA</div>
                </div>
                <div className={classes.legalInfoRow}>
                  <div className={classes.legalInfoLabel}>Effective date:</div>
                  <div className={classes.legalInfoValue}>January 2026</div>
                </div>
              </div>
            </div>

            <p className={classes.sectionContent}>
              This document is a contractual framework for use of the WayGO Drive platform. It is not legal advice. Consider having counsel review for your specific operations and applicable local regulations.
            </p>

            <div className={classes.tableOfContents}>
              <h3 className={classes.tocHeader}>Table of Contents</h3>
              <div className={classes.tocBody}>
                <ul className={classes.tocList}>
                  <li className={classes.tocItem}>
                    <a href="#section-1" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-1")}>1. Scope and Roles</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-2" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-2")}>2. Information We Collect</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-3" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-3")}>3. How We Use Information</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-4" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-4")}>4. How We Share Information</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-5" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-5")}>5. Location Data; Sensors; Audio/Video</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-6" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-6")}>6. Cookies and Tracking</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-7" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-7")}>7. Retention</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-8" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-8")}>8. Security</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-9" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-9")}>9. Your Rights (including CCPA/CPRA)</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-10" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-10")}>10. International Transfers</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-11" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-11")}>11. Children and Teens</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-12" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-12")}>12. Changes</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-13" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-13")}>13. Contact</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <h3 id="section-1" className={classes.sectionHeading}>
              1. Scope and Roles
            </h3>
            <p className={classes.sectionContent}>
              This Privacy Policy explains how WAYGODRIVER LLC ("WayGO") collects, uses, shares, and protects personal information in connection with WayGO Drive Services.
            </p>
            <p className={classes.sectionContent}>
              Depending on your interaction, you may be a rider, a driver/applicant, a guest user, or a visitor to our websites.
            </p>
            
            <h3 id="section-2" className={classes.sectionHeading}>
              2. Information We Collect
            </h3>
            <p className={classes.sectionContent}>
              We collect information you provide, information generated through your use of the Services, and information from third parties.
            </p>
            <ul className={classes.sectionContent} style={{paddingLeft: "20px"}}>
              <li><strong>Account and identity:</strong> name, email, phone, address, date of birth, government ID where required, profile photo (still or live).</li>
              <li><strong>Payment and financial:</strong> payment method tokens, transaction history, billing address, refunds, chargebacks.</li>
              <li><strong>Trip and service data:</strong> pickup and drop-off, route, timestamps, service type, fees, tips, ratings, communications.</li>
              <li><strong>Location:</strong> precise location (GPS) while the app is in use; approximate location derived from IP or device signals.</li>
              <li><strong>Device and network:</strong> IP address, device identifiers, OS version, app version, crash logs, cookies/SDK identifiers.</li>
              <li><strong>Safety and compliance:</strong> incident reports, support tickets, verification results, fraud signals.</li>
              <li><strong>Drivers:</strong> vehicle data (registration, insurance, inspections), driver license, background check results where permitted.</li>
            </ul>
            
            <h3 id="section-3" className={classes.sectionHeading}>
              3. How We Use Information
            </h3>
            <p className={classes.sectionContent}>
              We use information to provide, personalize, and improve the Services, including:
            </p>
            <ul className={classes.sectionContent} style={{paddingLeft: "20px"}}>
              <li>Create and manage accounts; verify identity and eligibility.</li>
              <li>Match riders with independent third-party providers; facilitate trips and deliveries.</li>
              <li>Process payments; prevent fraud; resolve disputes and charge issues.</li>
              <li>Provide customer support; respond to requests and inquiries.</li>
              <li>Safety and security: detect and prevent harmful conduct; investigate incidents; cooperate with insurers and authorities where required.</li>
              <li>Analytics and product improvement, including the use of AI to detect abuse, improve matching, and enhance user experience.</li>
              <li>Compliance with legal obligations, including tax, accounting, and regulatory requirements.</li>
            </ul>
            
            <h3 id="section-4" className={classes.sectionHeading}>
              4. How We Share Information
            </h3>
            <p className={classes.sectionContent}>
              We share information only as needed for the Services and legitimate business purposes:
            </p>
            <ul className={classes.sectionContent} style={{paddingLeft: "20px"}}>
              <li><strong>With other users:</strong> limited information required to complete a trip (e.g., first name, pickup/drop-off, driver/rider info).</li>
              <li><strong>With service providers:</strong> payment processors, cloud hosting, analytics, customer support vendors, mapping providers.</li>
              <li><strong>With independent providers:</strong> to facilitate requested services and to support safety, receipts, and disputes.</li>
              <li><strong>With affiliates and successors:</strong> in connection with corporate transactions (merger, acquisition, asset sale).</li>
              <li><strong>With insurers, regulators, and law enforcement:</strong> when required by law or to protect rights, safety, and property.</li>
            </ul>
            
            <h3 id="section-5" className={classes.sectionHeading}>
              5. Location Data; Sensors; Audio/Video
            </h3>
            <p className={classes.sectionContent}>
              Location data may be collected before, during, and after a trip to enable matching, routing, safety features, and fraud prevention.
            </p>
            <p className={classes.sectionContent}>
              Certain features may allow in-app calls or chats; communications may be monitored or recorded as permitted by law and for safety and support.
            </p>
            <p className={classes.sectionContent}>
              If camera, microphone, or sensor recordings are enabled for safety or quality (including in connection with third-party technology), you consent to such collection where required and as configured in the app.
            </p>
            
            <h3 id="section-6" className={classes.sectionHeading}>
              6. Cookies and Tracking
            </h3>
            <p className={classes.sectionContent}>
              We and our partners may use cookies, SDKs, and similar technologies to operate our websites and apps, prevent fraud, measure performance, and personalize content.
            </p>
            <p className={classes.sectionContent}>
              You can manage cookie preferences through your browser and certain in-app settings.
            </p>
            
            <h3 id="section-7" className={classes.sectionHeading}>
              7. Retention
            </h3>
            <p className={classes.sectionContent}>
              We retain information for as long as necessary to provide the Services and for legitimate business purposes such as compliance, dispute resolution, and fraud prevention.
            </p>
            <p className={classes.sectionContent}>
              Retention periods may vary by category and legal requirement and may extend for multiple years where required by law.
            </p>
            
            <h3 id="section-8" className={classes.sectionHeading}>
              8. Security
            </h3>
            <p className={classes.sectionContent}>
              We use administrative, technical, and physical safeguards designed to protect personal information, including encryption in transit, access controls, logging, and monitoring.
            </p>
            <p className={classes.sectionContent}>
              No method of transmission or storage is 100% secure; you are responsible for protecting account credentials.
            </p>
            
            <h3 id="section-9" className={classes.sectionHeading}>
              9. Your Rights (including CCPA/CPRA)
            </h3>
            <p className={classes.sectionContent}>
              Depending on where you live, you may have rights to access, correct, delete, or obtain a copy of your personal information, and to opt out of certain processing.
            </p>
            <p className={classes.sectionContent}>
              California residents: You may have rights under CCPA/CPRA including the right to know, delete, correct, and limit use of sensitive personal information, subject to exceptions.
            </p>
            <p className={classes.sectionContent}>
              We do not sell personal information in the traditional sense. If we engage in sharing for targeted advertising, we will provide applicable opt-out mechanisms.
            </p>
            
            <h3 id="section-10" className={classes.sectionHeading}>
              10. International Transfers
            </h3>
            <p className={classes.sectionContent}>
              We may process and store information in the United States and other countries where we or our service providers operate.
            </p>
            <p className={classes.sectionContent}>
              Where required, we use appropriate safeguards for cross-border transfers.
            </p>
            
            <h3 id="section-11" className={classes.sectionHeading}>
              11. Children and Teens
            </h3>
            <p className={classes.sectionContent}>
              The Services are generally not directed to children under 13. Accounts generally require users to be at least 18, unless a feature explicitly supports teen accounts with parental controls.
            </p>
            <p className={classes.sectionContent}>
              If we learn we collected personal information from a child without appropriate consent, we will take steps to delete it.
            </p>
            
            <h3 id="section-12" className={classes.sectionHeading}>
              12. Changes
            </h3>
            <p className={classes.sectionContent}>
              We may update this Privacy Policy from time to time. Updates will be posted with a revised effective date.
            </p>
            
            <div id="section-13" className={classes.contactSection}>
              <h3 className={classes.sectionHeading}>
                13. Contact
              </h3>
              <p className={classes.sectionContent}>
                <strong>WAYGODRIVER LLC</strong>
              </p>
              <p className={classes.sectionContent}>
                425 Percival Road<br />
                Columbia, South Carolina 29206<br />
                United States
              </p>
              <p className={classes.sectionContent} style={{marginTop: "16px"}}>
                For privacy requests, use the in-app Help feature or the contact channel provided in the Services.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
