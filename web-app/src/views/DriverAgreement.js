import React from "react";
import { makeStyles } from "@mui/styles";
import Navbar from "components/ui/navbar.jsx";
import Footer from "components/ui/footer.jsx";

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
    scrollPaddingTop: "120px",
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
  importantNotice: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "var(--text-secondary)",
    marginBottom: "24px",
    textAlign: "justify",
    fontWeight: 600,
    padding: "16px",
    backgroundColor: "var(--bg-secondary)",
    borderLeft: "4px solid var(--primary-color)",
    borderRadius: "4px",
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

export default function DriverAgreement(props) {
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
              <h1 className={classes.heroTitle}>Driver Independent Contractor Agreement</h1>
            </div>
          </div>

          <div className={classes.contentContainer}>
            <p className={classes.sectionContent}>
              <strong>WayGO Drive</strong>
            </p>
            <p className={classes.sectionContent}>
              <strong>Independent Contractor Agreement</strong>
            </p>
            <p className={classes.sectionContent}>
              Driver agreement for access to the WayGO Drive platform
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
                    <a href="#section-1" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-1")}>1. Parties; Purpose; Platform Access</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-2" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-2")}>2. Independent Contractor Status; No Employment</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-3" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-3")}>3. Driver Eligibility; Compliance; Background Checks</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-4" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-4")}>4. Vehicle; Insurance; Safety</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-5" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-5")}>5. Use of the App; Ratings; Deactivation</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-6" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-6")}>6. Fares, Fees, and Payment Processing</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-7" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-7")}>7. Taxes and Records</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-8" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-8")}>8. Confidentiality; IP; Brand Use</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-9" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-9")}>9. Indemnity; Limitation of Liability</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-10" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-10")}>10. Arbitration; Class Action Waiver</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-11" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-11")}>11. Termination</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-12" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-12")}>12. Miscellaneous</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <h3 id="section-1" className={classes.sectionHeading}>
              1. Parties; Purpose; Platform Access
            </h3>
            <p className={classes.sectionContent}>
              This Independent Contractor Agreement ("Agreement") is between WAYGODRIVER LLC ("WayGO") and you ("Driver").
            </p>
            <p className={classes.sectionContent}>
              WayGO provides a technology platform that enables Drivers to connect with riders and other customers seeking services. WayGO does not provide transportation or delivery and is not a motor carrier.
            </p>
            <p className={classes.sectionContent}>
              Driver seeks access to the platform for the Driver's independent business. Driver may accept or reject opportunities at Driver's sole discretion.
            </p>
            
            <h3 id="section-2" className={classes.sectionHeading}>
              2. Independent Contractor Status; No Employment
            </h3>
            <p className={classes.sectionContent}>
              Driver is an independent contractor and not an employee, partner, joint venturer, agent, or representative of WayGO.
            </p>
            <p className={classes.sectionContent}>
              Driver controls the manner and means of performing services, including when, where, and whether to provide services, subject to legal requirements and platform rules designed for safety and integrity.
            </p>
            <p className={classes.sectionContent}>
              Driver is not entitled to wages, overtime, benefits, workers' compensation, unemployment insurance, or any other employee benefits from WayGO.
            </p>
            <p className={classes.sectionContent}>
              Nothing in this Agreement creates an employment relationship. Driver may use other platforms and may perform services for others.
            </p>
            
            <h3 id="section-3" className={classes.sectionHeading}>
              3. Driver Eligibility; Compliance; Background Checks
            </h3>
            <p className={classes.sectionContent}>
              Driver represents that Driver holds and will maintain all required licenses, permits, and authorizations, and will comply with all applicable laws, including traffic laws and local regulations.
            </p>
            <p className={classes.sectionContent}>
              Driver must provide accurate information and may be required to undergo identity verification and background checks to the maximum extent permitted by law.
            </p>
            <p className={classes.sectionContent}>
              Driver will promptly notify WayGO of any incident, citation, license suspension, insurance cancellation, or material change affecting eligibility.
            </p>
            
            <h3 id="section-4" className={classes.sectionHeading}>
              4. Vehicle; Insurance; Safety
            </h3>
            <p className={classes.sectionContent}>
              Driver is solely responsible for obtaining and maintaining a safe and roadworthy vehicle, including inspections and maintenance.
            </p>
            <p className={classes.sectionContent}>
              Driver is solely responsible for maintaining required insurance coverage. Any optional coverage offered or referenced by WayGO does not alter Driver's obligations and may be subject to separate terms.
            </p>
            <p className={classes.sectionContent}>
              Driver must not drive while impaired and must follow safety policies. Driver must comply with non-discrimination and accessibility requirements.
            </p>
            
            <h3 id="section-5" className={classes.sectionHeading}>
              5. Use of the App; Ratings; Deactivation
            </h3>
            <p className={classes.sectionContent}>
              Driver will use the WayGO app only as permitted and will not reverse engineer, scrape, or misuse the app.
            </p>
            <p className={classes.sectionContent}>
              WayGO may use ratings, complaints, fraud indicators, and safety signals to protect the marketplace. WayGO may temporarily suspend or permanently deactivate access where necessary for safety, legal compliance, integrity, or risk management.
            </p>
            <p className={classes.sectionContent}>
              Deactivation decisions may be immediate in cases involving safety or fraud. Where feasible, WayGO may provide notice or an appeal process.
            </p>
            
            <h3 id="section-6" className={classes.sectionHeading}>
              6. Fares, Fees, and Payment Processing
            </h3>
            <p className={classes.sectionContent}>
              Driver acknowledges that amounts charged to riders may include applicable fees, tolls, surcharges, promotions, and taxes.
            </p>
            <p className={classes.sectionContent}>
              WayGO may facilitate payment collection as a limited agent. WayGO may deduct a platform service fee and other amounts disclosed in the app.
            </p>
            <p className={classes.sectionContent}>
              Driver authorizes WayGO to process payments, issue adjustments, correct errors, and recover chargebacks or fraud-related losses consistent with applicable law and platform policies.
            </p>
            
            <h3 id="section-7" className={classes.sectionHeading}>
              7. Taxes and Records
            </h3>
            <p className={classes.sectionContent}>
              Driver is solely responsible for all taxes arising from Driver's earnings, including income tax, self-employment tax, sales or use taxes where applicable, and required filings.
            </p>
            <p className={classes.sectionContent}>
              Driver is responsible for maintaining business records and receipts. WayGO may provide summaries that are for convenience and may not constitute tax advice.
            </p>
            
            <h3 id="section-8" className={classes.sectionHeading}>
              8. Confidentiality; IP; Brand Use
            </h3>
            <p className={classes.sectionContent}>
              Driver may receive confidential information (including operational rules, pricing mechanics, and safety processes). Driver agrees to keep such information confidential and to use it only for participating on the platform.
            </p>
            <p className={classes.sectionContent}>
              WayGO and its licensors retain all intellectual property rights in the app, platform, and brand assets.
            </p>
            <p className={classes.sectionContent}>
              Driver receives a limited, revocable, non-transferable license to use WayGO trademarks solely as permitted for platform participation. Driver must not register confusingly similar marks or domains.
            </p>
            
            <h3 id="section-9" className={classes.sectionHeading}>
              9. Indemnity; Limitation of Liability
            </h3>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              Driver agrees to indemnify and hold harmless WayGO and its affiliates, officers, directors, employees, and agents from and against any claims, losses, liabilities, damages, costs, and expenses (including attorneys' fees) arising out of Driver's services, conduct, vehicle condition, violations of law, or breach of this Agreement.
            </p>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              To the maximum extent permitted by law, WayGO is not liable for indirect, incidental, special, exemplary, punitive, or consequential damages, including lost profits, lost data, personal injury, or property damage, arising out of or related to the platform.
            </p>
            
            <h3 id="section-10" className={classes.sectionHeading}>
              10. Arbitration; Class Action Waiver
            </h3>
            <p className={classes.sectionContent}>
              Any dispute arising out of or relating to this Agreement will be resolved through binding individual arbitration under the Federal Arbitration Act, subject to limited exceptions (e.g., small claims where eligible).
            </p>
            <p className={classes.sectionContent}>
              Driver and WayGO waive any right to bring or participate in a class, collective, coordinated, consolidated, mass, or representative action.
            </p>
            
            <h3 id="section-11" className={classes.sectionHeading}>
              11. Termination
            </h3>
            <p className={classes.sectionContent}>
              Either party may terminate this Agreement at any time. WayGO may suspend or terminate access immediately where required for safety, legal compliance, fraud prevention, or marketplace integrity.
            </p>
            
            <h3 id="section-12" className={classes.sectionHeading}>
              12. Miscellaneous
            </h3>
            <p className={classes.sectionContent}>
              <strong>Governing law:</strong> Except as preempted by the FAA for arbitration, this Agreement will be governed by South Carolina law to the extent applicable.
            </p>
            <p className={classes.sectionContent}>
              <strong>Severability:</strong> If any provision is invalid, the remaining provisions remain enforceable.
            </p>
            <p className={classes.sectionContent}>
              <strong>Entire Agreement:</strong> This Agreement plus incorporated policies constitute the entire agreement regarding platform access for Drivers.
            </p>
            
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
