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

export default function TermCondition(props) {
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
              <h1 className={classes.heroTitle}>Terms of Use</h1>
            </div>
          </div>

          <div className={classes.contentContainer}>
            <p className={classes.sectionContent}>
              <strong>WayGO Drive</strong>
            </p>
            <p className={classes.sectionContent}>
              <strong>U.S. Terms of Use</strong>
            </p>
            <p className={classes.sectionContent}>
              Extended version modeled on major U.S. marketplace platforms
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
                    <a href="#section-1" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-1")}>1. Contractual Relationship; Termination; and Modification</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-2" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-2")}>2. Arbitration Agreement (FAA; Individual; Class and Mass Action Waivers)</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-3" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-3")}>3. The Services</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-4" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-4")}>4. Third-Party Services and Content</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-5" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-5")}>5. Accessing the Services</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-6" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-6")}>6. User Conduct; Communications; Conflicts of Interest; and User Content</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-7" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-7")}>7. Payment</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-8" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-8")}>8. Disclaimers; Limitation of Liability; and Indemnity</a>
                  </li>
                  <li className={classes.tocItem}>
                    <a href="#section-9" className={classes.tocLink} onClick={(e) => handleTocClick(e, "section-9")}>9. Other Provisions</a>
                  </li>
                </ul>
              </div>
            </div>

            <p className={classes.importantNotice}>
              IMPORTANT: BY AGREEING TO THESE TERMS YOU ARE WAIVING YOUR RIGHT TO SEEK RELIEF IN A COURT OF LAW AND WAIVING YOUR RIGHT TO HAVE A JURY TRIAL ON YOUR CLAIMS, EXCEPT AS EXPRESSLY PROVIDED IN THE ARBITRATION AGREEMENT.
            </p>

            <h3 className={classes.sectionHeading}>
              Preamble and Acceptance
            </h3>
            <p className={classes.sectionContent}>
              These Terms of Use ("Terms") are a legally binding agreement between you and WAYGODRIVER LLC ("WayGO", "we", "us"), governing your access to and use of the WayGO Drive digital marketplace platform, including any mobile or web applications and related services (collectively, the "Services").
            </p>
            <p className={classes.sectionContent}>
              By accessing or using the Services you confirm that you have read, understand, and agree to be bound by these Terms. If you do not agree, do not access or use the Services.
            </p>
            <p className={classes.sectionContent}>
              Additional policies may apply to specific features or regions, including without limitation our Privacy Policy, Community Guidelines, Safety Standards, and any promotional terms ("Supplemental Terms"). If there is a conflict, Supplemental Terms control for that feature.
            </p>
            
            <h3 id="section-1" className={classes.sectionHeading}>
              1. Contractual Relationship; Termination; and Modification
            </h3>
            <p className={classes.sectionContent}>
              These Terms govern your use of the Services within the United States. If you use the Services in another country, different terms may apply.
            </p>
            <p className={classes.sectionContent}>
              WayGO may immediately terminate these Terms, suspend or deactivate your account, or deny access to the Services at any time for any reason, to the maximum extent permitted by law.
            </p>
            <p className={classes.sectionContent}>
              WayGO may modify these Terms or policies at any time. Updated versions will be posted through the Services or on our website. Continued use after posting constitutes acceptance.
            </p>
            
            <h3 id="section-2" className={classes.sectionHeading}>
              2. Arbitration Agreement
            </h3>
            <p className={classes.sectionContent}>
              This section is an agreement between you and WayGO to resolve Covered Disputes through binding individual arbitration and not in court, except as expressly stated below.
            </p>
            <p className={classes.sectionContent}>
              This Arbitration Agreement is governed by the Federal Arbitration Act (FAA) because the Services involve interstate commerce.
            </p>

            <h3 className={classes.sectionHeading}>
              2(a). Covered Disputes
            </h3>
            <p className={classes.sectionContent}>
              "Covered Disputes" include any dispute, claim, or controversy arising out of or relating to: (i) these Terms; (ii) your access to or use of the Services; (iii) any incidents, accidents, injuries, death, or property damage allegedly occurring in connection with the Services; and (iv) your relationship with WayGO. This Arbitration Agreement survives termination.
            </p>

            <h3 className={classes.sectionHeading}>
              2(b). Individual Arbitration Only; Class Action Waiver
            </h3>
            <p className={classes.sectionContent}>
              All Covered Disputes must be resolved in individual arbitration. You and WayGO waive the right to have any dispute brought, heard, administered, resolved, or arbitrated as a class, collective, coordinated, consolidated, mass, or representative action.
            </p>
            <p className={classes.sectionContent}>
              No arbitrator and no arbitration provider has authority to conduct or award relief in any such action or to award relief to anyone other than the individual party.
            </p>

            <h3 className={classes.sectionHeading}>
              2(c). Mass Action Waiver and Grouping
            </h3>
            <p className={classes.sectionContent}>
              To the maximum extent permitted by law, you and WayGO also waive any right to bring or participate in a mass arbitration or coordinated set of arbitration demands intended to function like a mass action.
            </p>
            <p className={classes.sectionContent}>
              If an arbitration provider or court requires grouping or batching for administration, the parties will cooperate in good faith to implement a procedure that preserves individualized merits decisions while improving efficiency.
            </p>

            <h3 className={classes.sectionHeading}>
              2(d). Exceptions
            </h3>
            <p className={classes.sectionContent}>
              This Arbitration Agreement does not require arbitration of: (i) individual claims in small claims court (if eligible and the matter remains individual); (ii) claims for sexual assault or sexual harassment occurring in connection with use of the Services, where you elect to proceed in court on an individual basis; and (iii) claims seeking injunctive or equitable relief to prevent actual or threatened infringement or misappropriation of intellectual property rights.
            </p>

            <h3 className={classes.sectionHeading}>
              2(e). Pre-Arbitration Informal Dispute Resolution
            </h3>
            <p className={classes.sectionContent}>
              Before initiating arbitration, the parties agree to make good-faith efforts to resolve disputes informally via a meet-and-confer by telephone or videoconference. Either party must send written notice describing the claim and requested relief.
            </p>
            <p className={classes.sectionContent}>
              This informal conference is a condition precedent to arbitration. Limitation periods are tolled while the parties complete this process.
            </p>

            <h3 className={classes.sectionHeading}>
              2(f). Arbitration Provider, Location, and Rules
            </h3>
            <p className={classes.sectionContent}>
              Unless the parties agree otherwise, arbitration will be administered by a neutral provider with operations in the state where the dispute arises, under the provider's applicable rules, except as modified by this Arbitration Agreement.
            </p>
            <p className={classes.sectionContent}>
              If you reside in the United States, the arbitration will be conducted in the county where you reside unless the parties agree otherwise.
            </p>
            <p className={classes.sectionContent}>
              The arbitrator may be a retired judge or an attorney licensed in the relevant state with experience in the underlying subject matter.
            </p>

            <h3 className={classes.sectionHeading}>
              2(g). Severability and Survival
            </h3>
            <p className={classes.sectionContent}>
              If any portion of this Arbitration Agreement is found unenforceable, that portion will be severed and the remainder will be enforced to the fullest extent permitted by law.
            </p>
            
            <h3 className={classes.sectionHeading}>
              3. The Services
            </h3>
            <p className={classes.sectionContent}>
              The Services are a digital marketplace platform that enables users to find, request, or receive services from independent third-party providers, including without limitation transportation, delivery, logistics, or other services ("Third-Party Services").
            </p>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              WAYGO IS NOT A COMMON CARRIER OR MOTOR CARRIER AND DOES NOT TRANSPORT PASSENGERS OR GOODS. THIRD-PARTY PROVIDERS ARE INDEPENDENT AND ARE NOT EMPLOYEES, AGENTS (ACTUAL OR APPARENT), OR REPRESENTATIVES OF WAYGO.
            </p>
            <p className={classes.sectionContent}>
              WayGO may provide supporting features such as payment processing, preferences, customer support, safety features, and personalized recommendations. Some features may be generated or enhanced by AI.
            </p>
            
            <h3 id="section-4" className={classes.sectionHeading}>
              4. Third-Party Services and Content
            </h3>
            <p className={classes.sectionContent}>
              Third-Party Services may be subject to additional terms imposed by the third-party provider. If there is a conflict, these Terms control as between you and WayGO.
            </p>
            <p className={classes.sectionContent}>
              The Services may include links or out-of-app experiences. WayGO does not control and is not responsible for third-party websites, services, or content.
            </p>
            
            <h3 className={classes.sectionHeading}>
              5. Accessing the Services
            </h3>
            <p className={classes.sectionContent}>
              You must register and maintain an active account. You may only possess one account and may not transfer your account to another person.
            </p>
            <p className={classes.sectionContent}>
              You must be at least 18 years old (or the age of legal majority where you live). We may request identity, age, or other verification and may deny access if verification is refused or cannot be completed.
            </p>
            <p className={classes.sectionContent}>
              You are responsible for all activity under your account and for maintaining confidentiality of credentials.
            </p>
            
            <h3 id="section-6" className={classes.sectionHeading}>
              6. User Conduct; Communications; Conflicts of Interest; and User Content
            </h3>
            <p className={classes.sectionContent}>
              You agree to comply with all applicable laws and to use the Services only for lawful purposes. You will not use the Services to cause nuisance, annoyance, inconvenience, damage, or loss to WayGO, any third-party provider, or any other party.
            </p>
            <p className={classes.sectionContent}>
              You will not: (i) reverse engineer, decompile, or attempt to extract source code; (ii) scrape, crawl, or use automated means to access the Services; (iii) reproduce or create derivative works; (iv) interfere with security-related features; or (v) misuse the Services to build competing products.
            </p>
            <p className={classes.sectionContent}>
              Communications: By creating an account you consent to receive communications via email, SMS, calls, WhatsApp, in-app chat, and push notifications, including automated messages. Message and data rates may apply. Opt-out options may be available but may impact functionality.
            </p>
            <p className={classes.sectionContent}>
              User Content: If you submit content (including feedback), you grant WayGO a worldwide, royalty-free, sublicensable license to use, host, store, reproduce, modify, publish, and distribute such content for operating and improving the Services, subject to the Privacy Policy.
            </p>
            
            <h3 className={classes.sectionHeading}>
              7. Payment
            </h3>
            <p className={classes.sectionContent}>
              Your use of the Services may result in charges ("Charges") for services or goods you receive from third-party providers and/or from WayGO, including taxes and fees where required.
            </p>
            <p className={classes.sectionContent}>
              Where applicable, WayGO may act as a limited payment collection agent for third-party providers. Payment via the Services is treated as payment made directly to the third-party provider.
            </p>
            <p className={classes.sectionContent}>
              Charges may include service fees, cancellation fees, tolls, government-mandated fees, surcharges, and fees for damage, cleaning, or lost items. Charges are generally final and non-refundable except as required by law or determined by WayGO and/or the third-party provider.
            </p>
            
            <h3 id="section-8" className={classes.sectionHeading}>
              8. Disclaimers; Limitation of Liability; and Indemnity
            </h3>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, WAYGO DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              WAYGO DOES NOT GUARANTEE THE QUALITY, SUITABILITY, SAFETY, OR ABILITY OF THIRD-PARTY PROVIDERS. YOUR USE OF THE SERVICES AND ANY THIRD-PARTY SERVICES IS AT YOUR SOLE RISK.
            </p>
            <p className={classes.sectionContent} style={{ fontWeight: 600 }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WAYGO WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES, OR FOR LOST PROFITS, LOST DATA, PERSONAL INJURY OR DEATH, OR PROPERTY DAMAGE, EVEN IF ADVISED OF THE POSSIBILITY.
            </p>
            <p className={classes.sectionContent}>
              Indemnity: You agree to indemnify and hold harmless WayGO and its affiliates, officers, directors, employees, and agents from and against any claims, losses, liabilities, costs, and expenses (including attorneys' fees) arising out of or related to your use of the Services, your breach of these Terms, your User Content, or your violation of any third-party rights.
            </p>
            
            <h3 id="section-9" className={classes.sectionHeading}>
              9. Other Provisions
            </h3>
            <p className={classes.sectionContent}>
              Choice of Law: Except as provided in the Arbitration Agreement, these Terms will be governed by the laws of the state where the dispute arises, without regard to conflict of law principles.
            </p>
            <p className={classes.sectionContent}>
              Notices: WayGO may provide notice through the Services, email, SMS, phone, or mail. Notices are deemed given as described in the notice.
            </p>
            <p className={classes.sectionContent}>
              Insurance: WayGO makes no representation that it will procure or maintain insurance unless required by law. Any insurance, if any, may be changed or canceled.
            </p>
            <p className={classes.sectionContent}>
              Assignment: You may not assign these Terms without our prior written approval. We may assign without your consent to affiliates or successors.
            </p>
            <p className={classes.sectionContent}>
              Severability: If any provision is held invalid or unenforceable, the remainder will be enforced to the fullest extent permitted by law.
            </p>
            <p className={classes.sectionContent}>
              Entire Agreement: These Terms and Supplemental Terms constitute the entire agreement regarding the Services.
            </p>
            
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
