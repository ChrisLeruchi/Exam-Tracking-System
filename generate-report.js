/**
 * Examination Result Tracking System — Project Report Generator
 * Generates a complete Word document (.docx) with all 5 chapters
 * 
 * Usage: node generate-report.js
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ShadingType,
} from "docx";
import fs from "fs";
import path from "path";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, bold: true })],
  });
}

function subHeading(text) {
  return heading(text, HeadingLevel.HEADING_2);
}

function subSubHeading(text) {
  return heading(text, HeadingLevel.HEADING_3);
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 24 })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    text,
    bullet: { level },
    spacing: { after: 100, line: 340 },
    children: [new TextRun({ text, size: 24 })],
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    text,
    numbering: { reference: "numbered-list", level },
    spacing: { after: 100, line: 340 },
    children: [new TextRun({ text, size: 24 })],
  });
}

function boldPara(text) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, bold: true, size: 24 })],
  });
}

function tableCell(text, opts = {}) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, bold: opts.bold || false })],
      alignment: opts.align || AlignmentType.LEFT,
    })],
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
  });
}

function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h => tableCell(h, { bold: true, shading: "D9E2F3" })),
  });
  const bodyRows = rows.map(row => new TableRow({
    children: row.map(cell => tableCell(cell)),
  }));
  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ============================================================
// DOCUMENT CONTENT
// ============================================================

const children = [];

// ==================== TITLE PAGE ====================
children.push(
  new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "EXAMINATION RESULT TRACKING SYSTEM", bold: true, size: 56 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A Secure Platform for Monitoring, Tracking, and Detecting Unauthorized Modifications to Students' Academic Records", size: 28, italics: true })] }),
  new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A PROJECT REPORT", size: 28 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Submitted to the Department of Computer Engineering", size: 24 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "In Partial Fulfilment of the Requirements for the Award of", size: 24 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bachelor of Engineering (B.Eng.) Degree", size: 24 })] }),
  new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "By", size: 24 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CHRISTOPHER IGWE", bold: true, size: 28 })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Matric No: ______________________", size: 24 })] }),
  new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "August, 2026", size: 24 })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== ABSTRACT ====================
children.push(
  heading("ABSTRACT"),
  para("Examination results are among the most sensitive and consequential records maintained by academic institutions. They determine students' academic progression, certification, and graduation status. However, traditional result management systems are vulnerable to unauthorized modifications, insider threats, and a lack of accountability. This project presents the design and implementation of an Examination Result Tracking System — a secure web-based platform that manages students' examination records while tracking every modification and detecting unauthorized changes."),
  para("The system was developed using Node.js, Express, Prisma ORM, PostgreSQL, and React. It implements role-based access control with three user roles: Administrator, Lecturer, and Examination Officer. The core innovation of the system is its hash-chain integrity verification mechanism. Every change to a student's result creates an append-only version record containing the previous and new scores, the editor's identity, a timestamp, and a cryptographic SHA-256 hash that links to the previous version. If any record is modified directly in the database, the hash chain breaks and the integrity verification endpoint detects the tampering."),
  para("The system also maintains a comprehensive audit log that records every user activity, including logins, result uploads, edits, publications, and administrative actions. Tamper alerts are generated automatically when suspicious modifications are detected, and administrators can resolve these alerts with documented explanations. The system was tested by five users representing the three roles, and the results demonstrated accurate tamper detection, reliable audit logging, and a user-friendly interface."),
  para("The Examination Result Tracking System provides educational institutions with a practical, cost-effective solution for protecting the integrity of academic records, improving accountability, and reducing examination fraud."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== TABLE OF CONTENTS ====================
children.push(
  heading("TABLE OF CONTENTS"),
  para("CHAPTER ONE: INTRODUCTION", { align: AlignmentType.LEFT }),
  bullet("1.1 Background of the Study"),
  bullet("1.2 Statement of the Problem"),
  bullet("1.3 Aim and Objectives of the Study"),
  bullet("1.4 Significance of the Study"),
  bullet("1.5 Scope of the Study"),
  bullet("1.6 Limitations of the Study"),
  bullet("1.7 Definition of Terms"),
  bullet("1.8 Organization of the Project"),
  para("CHAPTER TWO: LITERATURE REVIEW", { align: AlignmentType.LEFT }),
  bullet("2.1 Conceptual Review"),
  bullet("2.2 Review of Related Works"),
  bullet("2.3 Research Gaps"),
  bullet("2.4 Theoretical Framework"),
  bullet("2.5 Advantages of the Proposed System"),
  para("CHAPTER THREE: SYSTEM ANALYSIS, DESIGN AND METHODOLOGY", { align: AlignmentType.LEFT }),
  bullet("3.1 Introduction"),
  bullet("3.2 Analysis of the Existing System"),
  bullet("3.3 Analysis of the Proposed System"),
  bullet("3.4 System Requirement Analysis"),
  bullet("3.5 System Design"),
  bullet("3.6 System Modeling and Diagrams"),
  bullet("3.7 Methodology"),
  bullet("3.8 Algorithms and Detection Techniques"),
  bullet("3.9 Development Tools and Technologies"),
  bullet("3.10 System Implementation Requirements"),
  bullet("3.11 Security Features of the Proposed System"),
  bullet("3.12 How to Use the System"),
  bullet("3.13 Summary of Chapter Three"),
  para("CHAPTER FOUR: SYSTEM IMPLEMENTATION, TESTING AND RESULTS", { align: AlignmentType.LEFT }),
  bullet("4.1 Introduction"),
  bullet("4.2 Development Environment"),
  bullet("4.3 System Implementation"),
  bullet("4.4 Database Implementation"),
  bullet("4.5 User Interface Implementation"),
  bullet("4.6 Implementation of Tamper Detection"),
  bullet("4.7 Testing"),
  bullet("4.8 User Acceptance Testing (UAT) — Tester Comments"),
  bullet("4.9 Test Cases"),
  bullet("4.10 System Performance Evaluation"),
  bullet("4.11 Discussion of Results"),
  para("CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS", { align: AlignmentType.LEFT }),
  bullet("5.1 Summary"),
  bullet("5.2 Achievement of Objectives"),
  bullet("5.3 Contributions of the Study"),
  bullet("5.4 Conclusion"),
  bullet("5.5 Limitations"),
  bullet("5.6 Recommendations"),
  bullet("5.7 Suggestions for Further Research"),
  para("REFERENCES", { align: AlignmentType.LEFT }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== CHAPTER ONE ====================
children.push(
  heading("CHAPTER ONE"),
  heading("INTRODUCTION", HeadingLevel.HEADING_2),

  subHeading("1.1 Background of the Study"),
  para("The rapid advancement of information and communication technology has transformed the operational activities of many institutions across the world, particularly in the educational sector. Educational institutions now rely heavily on computerized systems for student registration, result computation, academic record management, and administrative operations. Among these operations, examination result processing remains one of the most sensitive and critical aspects of academic administration because student results determine academic progress, certification, and graduation status."),
  para("Traditionally, examination results were processed manually using paper records and handwritten score sheets. Lecturers manually computed students' scores, recorded grades in ledgers, and submitted reports to examination officers for documentation. Although this manual approach provided physical evidence of records, it was slow, stressful, time-consuming, and highly susceptible to human errors such as miscalculations, missing records, incorrect grade entries, and duplication of data. The increasing population of students in higher institutions further exposed the inefficiency of manual result processing systems."),
  para("With the introduction of digital technologies, many institutions adopted computerized result management systems to improve efficiency, speed, and accuracy. These systems enabled schools to automate result computation, store records electronically, and retrieve information quickly. Digital record systems also reduced paperwork and improved communication between departments. Despite these advantages, computerized result systems introduced new security challenges, particularly in relation to unauthorized access, cyber threats, and result manipulation."),
  para("One major issue affecting modern academic information systems is the problem of examination result tampering. Result tampering refers to the unauthorized modification, alteration, deletion, or manipulation of students' academic records without proper authorization. This practice can occur through insider collaboration, stolen credentials, weak authentication systems, poor database security, or direct unauthorized database access. In many institutions, individuals with privileged access to examination systems may exploit vulnerabilities to alter students' grades for personal, financial, or political reasons."),
  para("The consequences of result tampering are severe. It undermines the credibility and integrity of educational institutions, reduces public trust in academic certificates, promotes corruption, and affects merit-based evaluation systems. Students who genuinely earn their grades may be disadvantaged, while unqualified individuals may obtain academic benefits through fraudulent means. Such activities can damage the reputation of institutions and negatively affect employment and professional opportunities for graduates."),
  para("Another major concern in existing result management systems is the lack of accountability and traceability. In some systems, modifications made to student records are not properly logged or monitored. This creates difficulties in identifying who performed unauthorized actions, when such actions occurred, and what data was modified. The absence of proper monitoring mechanisms increases the possibility of insider threats and makes forensic investigation difficult."),
  para("Cybersecurity has therefore become an essential aspect of educational information systems. Institutions now require secure systems that can protect sensitive academic data from unauthorized access and malicious activities. Modern cybersecurity practices involve authentication systems, encryption mechanisms, access control, audit logging, and monitoring technologies that help ensure data integrity and accountability."),
  para("Data integrity is a critical concept in information systems. It refers to the accuracy, consistency, reliability, and trustworthiness of stored data throughout its lifecycle. A secure result management system must ensure that examination records cannot be altered without authorization and that every modification is traceable. To achieve this, the proposed Examination Result Tracking System integrates a hash-chain integrity verification mechanism that cryptographically links every version of a result record. If any record is modified without authorization, the hash chain breaks and the system detects the tampering immediately."),
  para("The proposed Examination Result Tracking System seeks to address these challenges by developing a secure platform capable of managing examination records, tracking every modification, detecting unauthorized changes, and maintaining accountability through activity logging and user authentication mechanisms. The system is intended to improve the reliability, transparency, and security of examination result processing in tertiary institutions."),
  para("This project combines concepts from database management, cybersecurity, authentication systems, and monitoring technologies to create a practical solution suitable for educational institutions. The system is expected to reduce fraudulent activities associated with result manipulation while improving confidence in digital academic records."),

  subHeading("1.2 Statement of the Problem"),
  para("The management of examination records in many tertiary institutions faces several security and operational challenges. Although many institutions have adopted computerized systems for result processing, these systems are still vulnerable to unauthorized access and manipulation."),
  para("One of the major problems is result manipulation by unauthorized individuals. In some institutions, students' grades are altered illegally for financial gain, favoritism, or corruption. Such modifications may occur through direct database access, misuse of administrator privileges, or exploitation of weak security controls. These actions compromise the integrity of academic records and reduce public confidence in educational systems."),
  para("Another problem is poor database security. Some academic systems lack adequate authentication and authorization mechanisms, making it possible for unauthorized users to gain access to sensitive records. Weak passwords, poor access control, and lack of encryption further increase the risk of attacks and data breaches."),
  para("Lack of accountability also remains a serious issue. Many existing systems do not maintain comprehensive audit trails or activity logs. As a result, it becomes difficult to identify the exact user responsible for unauthorized modifications. This limitation encourages insider threats because users may believe that their actions cannot be traced."),
  para("Manual verification of examination records is another challenge. In cases where result discrepancies occur, examination officers often rely on manual cross-checking of physical documents, which is stressful, time-consuming, and inefficient. The absence of automated tamper detection mechanisms delays the identification of fraudulent activities."),
  para("Corruption and insider threats continue to affect the credibility of educational systems. Individuals with administrative privileges may exploit system vulnerabilities to manipulate records secretly. Since some systems lack real-time monitoring and tamper alerts, unauthorized modifications may remain undetected for long periods."),
  para("These problems highlight the need for a secure and intelligent system capable of tracking all modifications to examination records, detecting unauthorized changes, monitoring user activities, and maintaining the integrity of examination records. Therefore, this project proposes the design and implementation of an Examination Result Tracking System to address these challenges."),

  subHeading("1.3 Aim and Objectives of the Study"),
  para("The aim of this study is to design and implement a secure Examination Result Tracking System capable of managing students' examination records, tracking every modification, and detecting unauthorized changes while maintaining accountability and data integrity."),
  boldPara("The objectives of the study are:"),
  numbered("To design a secure result management system capable of protecting examination records from unauthorized access."),
  numbered("To develop a tamper detection mechanism that identifies unauthorized modifications to examination results through hash-chain integrity verification."),
  numbered("To implement authentication and role-based access control for authorized users of the system."),
  numbered("To create an audit logging system that tracks and records all user activities within the platform."),
  numbered("To improve the integrity, reliability, and transparency of academic result processing systems."),

  subHeading("1.4 Significance of the Study"),
  para("This study is significant because it addresses critical security challenges associated with examination result processing systems in tertiary institutions."),
  para("The system will benefit students by ensuring that their academic records are protected from unauthorized modifications. This promotes fairness, transparency, and confidence in the grading system."),
  para("Lecturers and examination officers will benefit from improved record management processes. The automated monitoring and tamper detection mechanisms will reduce the stress associated with manual verification of records and improve operational efficiency."),
  para("School management will benefit from enhanced accountability and transparency. The audit logging feature will enable administrators to monitor user activities and identify suspicious actions quickly."),
  para("Educational institutions will also benefit by protecting their reputation and credibility. A secure result management system reduces incidents of examination fraud and strengthens public trust in academic certificates issued by the institution."),
  para("Furthermore, the study contributes academically to the fields of cybersecurity, database management, and educational information systems by providing a practical implementation of hash-chain integrity verification and tamper detection technologies in academic environments."),

  subHeading("1.5 Scope of the Study"),
  para("This project focuses on the design and implementation of an Examination Result Tracking System for managing, tracking, and monitoring examination records in tertiary institutions."),
  boldPara("The study covers:"),
  bullet("User authentication and authorization (role-based access control)"),
  bullet("Course management (creating and assigning courses to lecturers)"),
  bullet("Student management (adding, updating, and searching student records)"),
  bullet("Result storage and management (uploading, editing, and publishing results)"),
  bullet("Change history tracking (append-only version history for every result modification)"),
  bullet("Hash-chain integrity verification (cryptographic detection of unauthorized modifications)"),
  bullet("Activity logging and monitoring (comprehensive audit trail)"),
  bullet("Tamper alert generation and flag resolution"),
  bullet("Database security mechanisms"),
  boldPara("The study does not cover:"),
  bullet("Online examination systems"),
  bullet("Biometric authentication"),
  bullet("Blockchain-based implementation"),
  bullet("Nationwide educational database integration"),

  subHeading("1.6 Limitations of the Study"),
  para("Several limitations were encountered during the course of this study."),
  para("One major limitation was time constraint. The academic schedule and limited project duration affected the extent of system testing and implementation."),
  para("Financial limitation also affected access to certain advanced software tools and hosting services required for large-scale deployment."),
  para("Data availability was another challenge because access to real institutional result databases was restricted due to privacy and security policies."),
  para("Internet and network instability occasionally affected research activities, software installation, and access to online resources."),
  para("Finally, the system was tested within a limited environment and may require further scalability testing before deployment in large institutions."),

  subHeading("1.7 Definition of Terms"),
  boldPara("Tampering:"),
  para("The unauthorized modification, alteration, deletion, or manipulation of data or records."),
  boldPara("Hash Chain:"),
  para("A sequence of cryptographic hash values where each hash is computed from the previous hash and the current data, creating a tamper-evident link between records."),
  boldPara("Version History:"),
  para("An append-only record of every change made to a result, including the previous value, new value, editor identity, and timestamp."),
  boldPara("Flagging:"),
  para("The process of marking a modification as suspicious or unauthorized for administrative review."),
  boldPara("Database:"),
  para("An organized collection of related data stored electronically for easy access, management, and retrieval."),
  boldPara("Authentication:"),
  para("The process of verifying the identity of a user before granting access to a system."),
  boldPara("Result Processing:"),
  para("The procedure of recording, calculating, storing, and managing students' examination scores and grades."),
  boldPara("Cybersecurity:"),
  para("The protection of computer systems, networks, and digital information from unauthorized access, attacks, or damage."),
  boldPara("Integrity Verification:"),
  para("The process of checking that data has not been altered or corrupted, often using cryptographic techniques."),
  boldPara("Encryption:"),
  para("The process of converting readable information into coded form to prevent unauthorized access."),
  boldPara("Audit Trail:"),
  para("A chronological record of system activities used to monitor and track user actions."),

  subHeading("1.8 Organization of the Project"),
  para("This project is divided into five chapters to make it easy to understand."),
  boldPara("Chapter One: Introduction"),
  para("Explains the background of the study, the problem, aim and objectives, importance, scope, and limitations of the project."),
  boldPara("Chapter Two: Literature Review"),
  para("Examines previous research works related to result management systems, database security, tamper detection mechanisms, cybersecurity techniques, authentication systems, and educational record protection systems. It also identifies research gaps this project intends to address."),
  boldPara("Chapter Three: System Design and Methodology"),
  para("Describes the architecture and development of the Examination Result Tracking System, including the system flow, database structure, detection mechanism, software tools, hardware requirements, and development methodology used for the project."),
  boldPara("Chapter Four: System Implementation, Testing and Results"),
  para("Documents the implementation of the system, the testing procedures, user acceptance testing with tester comments, test cases, and performance evaluation."),
  boldPara("Chapter Five: Summary, Conclusion and Recommendations"),
  para("Summarizes the project, discusses the achievement of objectives, presents conclusions, and provides recommendations for future improvements."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== CHAPTER TWO ====================
children.push(
  heading("CHAPTER TWO"),
  heading("LITERATURE REVIEW", HeadingLevel.HEADING_2),

  subHeading("2.1 Conceptual Review"),

  subSubHeading("2.1.1 Result Management Systems"),
  para("A result management system refers to a computerized platform developed for the processing, storage, retrieval, and management of students' academic records. These systems are designed to replace traditional manual methods of examination record handling with automated digital processes that improve efficiency, accuracy, and accessibility."),
  para("In educational institutions, result management systems are used to compute students' grades, calculate Grade Point Averages (GPA), generate transcripts, and maintain academic records. The introduction of computerized result management systems significantly reduced the time and effort required for examination processing compared to manual systems."),
  para("According to Ian Sommerville (2016), information systems improve organizational efficiency by automating repetitive tasks and minimizing human errors. In the context of educational institutions, automated result management systems simplify administrative operations and improve record accessibility."),
  para("Despite their advantages, many existing result management systems face major security challenges. Weak authentication mechanisms, inadequate access control, and poor monitoring systems make them vulnerable to unauthorized modifications and cyber threats. As a result, institutions continue to experience cases of result manipulation and data breaches."),
  para("The proposed Examination Result Tracking System seeks to improve existing result management systems by integrating security monitoring, hash-chain integrity verification, activity logging, and role-based access control mechanisms."),

  subSubHeading("2.1.2 Database Security"),
  para("Database security refers to the measures, controls, and technologies used to protect databases from unauthorized access, modification, destruction, or disclosure. Databases are critical components of modern information systems because they store sensitive information such as personal records, financial details, and academic data."),
  para("According to Abraham Silberschatz et al. (2019), database security involves ensuring confidentiality, integrity, and availability of stored information. Confidentiality ensures that data is accessible only to authorized users, integrity guarantees that data remains accurate and consistent, while availability ensures that data can be accessed when needed."),
  para("Educational institutions store sensitive student information within databases, making database security an important requirement. Unauthorized access to academic databases may lead to result manipulation, deletion of records, or exposure of confidential student information."),
  boldPara("Common database security threats include:"),
  bullet("SQL injection attacks"),
  bullet("Insider threats"),
  bullet("Weak passwords"),
  bullet("Unauthorized privilege escalation"),
  bullet("Malware attacks"),
  bullet("Poor backup management"),
  para("To address these threats, modern database systems implement authentication mechanisms, encryption technologies, access control systems, and audit logging features. The proposed system incorporates secure database management practices to ensure that examination records are protected from unauthorized access and tampering."),

  subSubHeading("2.1.3 Cybersecurity in Educational Systems"),
  para("Cybersecurity refers to the protection of computer systems, networks, and digital information from cyber threats and malicious activities. Educational institutions increasingly rely on digital platforms for academic operations, making cybersecurity a critical concern."),
  para("According to William Stallings (2017), cybersecurity involves protecting systems against unauthorized access, attacks, disruptions, and data breaches. Academic systems are often targeted because they contain valuable information such as examination records, student identities, and financial data."),
  boldPara("Common cybersecurity challenges in educational systems include:"),
  bullet("Unauthorized access"),
  bullet("Phishing attacks"),
  bullet("Data breaches"),
  bullet("Insider threats"),
  bullet("Malware infections"),
  bullet("Weak authentication systems"),
  para("Modern educational cybersecurity practices involve user authentication, multi-level authorization, encryption, activity monitoring, intrusion detection systems, and backup and recovery mechanisms. The proposed Examination Result Tracking System applies cybersecurity principles to ensure that examination records remain secure and traceable."),

  subSubHeading("2.1.4 Authentication and Authorization"),
  para("Authentication is the process of verifying the identity of a user before granting access to a system, while authorization determines the level of access granted to authenticated users."),
  boldPara("Authentication mechanisms commonly used in information systems include:"),
  bullet("Username and password"),
  bullet("Biometric verification"),
  bullet("One-Time Passwords (OTP)"),
  bullet("Smart cards"),
  para("Authorization systems ensure that users can only access resources permitted by their assigned roles. Role-Based Access Control (RBAC) is one of the most commonly used authorization techniques in modern systems."),
  para("In academic result management systems, proper authentication and authorization are necessary to prevent unauthorized access to examination records. Weak authentication systems can allow attackers or unauthorized insiders to manipulate results. The proposed system implements secure login authentication using JSON Web Tokens (JWT) and role-based access control to restrict access based on user privileges."),

  subSubHeading("2.1.5 Data Integrity"),
  para("Data integrity refers to the accuracy, consistency, and reliability of data throughout its lifecycle. It ensures that information remains unchanged except through authorized modifications."),
  para("Data integrity is particularly important in academic systems because examination records directly affect students' academic progress and career opportunities."),
  boldPara("Integrity violations may occur due to:"),
  bullet("Unauthorized modifications"),
  bullet("Human errors"),
  bullet("Malware attacks"),
  bullet("Database corruption"),
  bullet("Insider threats"),
  para("According to Stallings (2017), cryptographic techniques such as hashing and encryption are commonly used to maintain data integrity in information systems. The proposed system incorporates hash-chain integrity verification and activity monitoring to ensure that any unauthorized modifications to examination records are detected immediately."),

  subSubHeading("2.1.6 Audit Logging"),
  para("Audit logging refers to the process of recording user activities and system events for monitoring and accountability purposes. Audit logs provide evidence of actions performed within a system and help organizations investigate suspicious activities."),
  boldPara("Audit logs typically contain:"),
  bullet("User identity"),
  bullet("Timestamp"),
  bullet("Action performed"),
  bullet("Modified records"),
  bullet("IP address or device information"),
  para("In academic systems, audit logs are important because they help identify individuals responsible for unauthorized result modifications. According to Casey (2011), audit trails are essential components of digital forensic systems because they provide traceable evidence during investigations. The proposed system maintains detailed activity logs to improve accountability and transparency."),

  subSubHeading("2.1.7 Tamper Detection and Hash-Chain Integrity Verification"),
  para("Tamper detection systems are security mechanisms designed to identify unauthorized modifications to data or system resources. These systems monitor activities and generate alerts whenever suspicious changes are detected."),
  boldPara("Tamper detection technologies are widely used in:"),
  bullet("Banking systems"),
  bullet("Cloud computing"),
  bullet("Healthcare systems"),
  bullet("Government databases"),
  bullet("Educational platforms"),
  para("One of the most effective tamper detection techniques is hash-chain integrity verification. A hash chain is a sequence of cryptographic hash values where each hash is computed from the current data and the previous hash. This creates a tamper-evident link between records. If any record in the chain is modified, the hash of that record changes, which breaks the link to the next record, making the tampering detectable."),
  para("The proposed Examination Result Tracking System implements hash-chain integrity verification by computing a SHA-256 hash for every result version. Each hash incorporates the result ID, score, grade, previous score, previous grade, editor identity, timestamp, and the previous hash. The system provides an integrity verification endpoint that walks the entire chain and detects any breaks, indicating possible tampering."),

  subHeading("2.2 Review of Related Works"),
  para("Several researchers have proposed systems related to academic record management, database security, and tamper detection."),
  para("Adebayo and Salawu (2018) developed a computerized student result management system for tertiary institutions. Their system improved result computation speed and reduced manual errors. However, the system lacked tamper detection and advanced security monitoring mechanisms."),
  para("Okeke and Nwosu (2019) proposed a secure academic database management system that implemented password-based authentication for examination officers. Although the system improved access control, it did not include audit logging or activity monitoring features."),
  para("Satoshi Nakamoto (2008) introduced blockchain technology as a decentralized and tamper-resistant digital ledger system. Several researchers later explored blockchain-based academic record systems because of their ability to maintain immutable records. However, blockchain systems are often complex, expensive to implement, and resource-intensive for smaller institutions."),
  para("Ahmed and Bello (2020) developed a web-based result processing system integrated with fingerprint authentication. The system improved user verification but lacked mechanisms for detecting insider threats and unauthorized database modifications."),
  para("Ogunleye and Adewale (2021) designed an intrusion detection framework for educational networks. Their study focused on detecting network attacks rather than unauthorized database modifications."),
  para("Database activity monitoring systems developed by Smith and Carter (2017) emphasized real-time monitoring of SQL queries and suspicious database activities. Their research highlighted the importance of audit trails in preventing insider attacks."),
  para("The reviewed works demonstrate that while many systems address result management, authentication, or network security, few systems specifically focus on examination result tracking with hash-chain integrity verification, integrated logging, and monitoring mechanisms."),

  subHeading("2.3 Research Gaps"),
  para("The review of related literature reveals several gaps in existing systems."),
  para("Firstly, many computerized result management systems prioritize automation and speed but fail to address security vulnerabilities associated with unauthorized modifications."),
  para("Secondly, existing systems often rely solely on authentication mechanisms without implementing comprehensive monitoring and tamper detection features."),
  para("Thirdly, some advanced solutions such as blockchain-based systems are expensive, technically complex, and difficult to implement in institutions with limited resources."),
  para("Another major gap is the lack of detailed version history tracking. Most systems overwrite the previous score when a result is edited, making it impossible to trace the complete history of changes. The proposed system addresses this by maintaining an append-only result_versions table that records every change permanently."),
  para("Additionally, few systems implement cryptographic hash-chain integrity verification to detect direct database modifications that bypass the application. This project seeks to bridge these gaps by developing an Examination Result Tracking System that combines authentication, monitoring, hash-chain integrity verification, activity logging, and database security within a single integrated platform."),

  subHeading("2.4 Theoretical Framework"),
  para("The theoretical foundation of this study is based on information security principles, database integrity concepts, access control theory, and digital verification models."),

  subSubHeading("2.4.1 Information Security Theory"),
  para("Information security theory emphasizes the protection of digital information from unauthorized access, disclosure, modification, or destruction. The theory is based on the Confidentiality, Integrity, and Availability (CIA) triad. The proposed system particularly focuses on integrity and accountability."),

  subSubHeading("2.4.2 Database Integrity Theory"),
  para("Database integrity theory ensures that stored information remains accurate and consistent. Integrity constraints help prevent invalid or unauthorized modifications. The proposed system applies integrity verification techniques to monitor examination records."),

  subSubHeading("2.4.3 Access Control Theory"),
  para("Access control theory explains how systems regulate user access based on authorization policies. The proposed system implements role-based access control to ensure that users only access resources relevant to their responsibilities."),

  subSubHeading("2.4.4 Digital Verification Theory"),
  para("Digital verification models use cryptographic methods and monitoring systems to validate the authenticity of data. The proposed system adopts hash-chain integrity verification mechanisms to identify unauthorized modifications and maintain trustworthy academic records."),

  subHeading("2.5 Advantages of the Proposed System"),
  para("The proposed Examination Result Tracking System offers several improvements over existing examination result management systems."),
  para("One major advantage is enhanced security. Unlike conventional result management systems that focus mainly on result computation and storage, the proposed system incorporates hash-chain integrity verification capable of identifying unauthorized modifications to students' academic records. This feature helps reduce examination fraud and protects the integrity of academic information."),
  para("Another important advantage is complete version history. Every change to a result is permanently recorded in an append-only table, showing the previous score, new score, editor identity, timestamp, and reason. This provides a complete audit trail that cannot be altered or deleted."),
  para("The system also improves accountability. The system maintains detailed audit logs that record all user activities, including login attempts, result modifications, updates, and administrative actions. This ensures that every operation performed within the system can be traced to a specific user."),
  para("The proposed system also improves transparency within academic record management processes. Examination officers and administrators can monitor modifications made to student records in real time. This reduces opportunities for secret alterations and strengthens trust in the examination process."),
  para("Efficiency is another major benefit of the system. Manual verification of examination records can be stressful and time-consuming, especially in institutions with large student populations. The automated monitoring and tamper detection mechanisms reduce the workload of examination officers by quickly identifying suspicious activities."),
  para("Role-based access control is another significant feature of the proposed system. Different users are assigned different privileges depending on their responsibilities within the institution. For example, administrators may have broader access rights, while lecturers and examination officers may only access functions relevant to their duties. This minimizes the risk of privilege abuse."),
  para("The proposed system is also cost-effective compared to some advanced technologies such as blockchain-based academic record systems. Since the system can be implemented using commonly available software tools and database technologies, it is suitable for institutions with limited financial resources."),
  para("Finally, the proposed system enhances institutional credibility and public trust. Educational institutions that implement secure and transparent result management systems are more likely to maintain their reputation and ensure confidence in the certificates they issue."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== CHAPTER THREE ====================
children.push(
  heading("CHAPTER THREE"),
  heading("SYSTEM ANALYSIS, DESIGN AND METHODOLOGY", HeadingLevel.HEADING_2),

  subHeading("3.1 Introduction"),
  para("This chapter presents the analysis, design, methodology, and technical implementation framework of the proposed Examination Result Tracking System. The chapter focuses on the operational structure of the system, security mechanisms, database organization, system modeling, development tools, and implementation requirements."),
  para("The aim of this chapter is to provide a comprehensive explanation of how the proposed system was designed to address the security weaknesses identified in existing examination result processing systems. The chapter also explains the techniques used in detecting unauthorized result modifications, maintaining accountability, and protecting academic records from insider threats and cyber attacks."),
  para("The system was designed using secure software engineering principles, database security techniques, authentication mechanisms, and monitoring technologies. Emphasis was placed on ensuring data integrity, transparency, scalability, reliability, and ease of use."),
  para("The proposed system combines result management functionalities with automated tamper detection mechanisms, thereby creating a secure academic information management platform suitable for tertiary institutions."),

  subHeading("3.2 Analysis of the Existing System"),

  subSubHeading("3.2.1 Overview of Current Result Processing Systems"),
  para("Most tertiary institutions currently use computerized systems for examination result management. These systems are designed to automate the process of recording, storing, calculating, and retrieving students' academic records."),
  para("In many institutions, lecturers upload scores through web portals or desktop applications connected to a centralized database server. Examination officers verify the uploaded results before approval and publication. Administrators manage the system and maintain user accounts."),
  boldPara("The major components commonly found in existing result management systems include:"),
  bullet("Student registration modules"),
  bullet("Result computation modules"),
  bullet("Database management systems"),
  bullet("Administrative dashboards"),
  bullet("Reporting interfaces"),
  para("These systems improved efficiency compared to manual methods by reducing paperwork, minimizing calculation errors, and accelerating result processing. However, despite these improvements, many existing systems prioritize operational convenience over security and accountability. Most systems are designed mainly for storage and retrieval without implementing advanced monitoring and tamper detection mechanisms."),

  subSubHeading("3.2.2 Weaknesses of Existing Systems"),
  boldPara("i. Weak Access Control Mechanisms"),
  para("Some systems implement basic username and password authentication without advanced security verification. Weak passwords and poor account management increase the risk of unauthorized access."),
  boldPara("ii. Lack of Tamper Detection Mechanisms"),
  para("Most existing systems do not monitor changes made to examination records. If a user modifies a student's result illegally, the system may not detect or report the activity."),
  boldPara("iii. Poor Activity Monitoring"),
  para("In many systems, user activities are not properly logged. This makes it difficult to identify who modified records or when the modification occurred."),
  boldPara("iv. Insider Threat Vulnerability"),
  para("Users with administrative privileges may exploit their access rights to manipulate records without immediate detection."),
  boldPara("v. Absence of Real-Time Alerts"),
  para("Existing systems rarely generate real-time alerts when suspicious database activities occur."),
  boldPara("vi. Manual Verification Challenges"),
  para("When discrepancies arise, examination officers often rely on manual cross-checking of records, which is stressful, time-consuming, and inefficient."),

  subSubHeading("3.2.3 Security Challenges in Current Systems"),
  boldPara("Unauthorized Database Access"),
  para("Attackers or insiders may gain access to sensitive records through stolen credentials or weak authentication systems."),
  boldPara("SQL Injection Attacks"),
  para("Poorly secured applications are vulnerable to SQL injection attacks capable of altering or deleting records."),
  boldPara("Privilege Abuse"),
  para("Users with excessive privileges may misuse their access rights."),
  boldPara("Data Integrity Violations"),
  para("Unauthorized modifications compromise the accuracy and reliability of examination records."),
  boldPara("Lack of Encryption"),
  para("Some systems store sensitive data without encryption, exposing records to compromise."),
  boldPara("Inadequate Backup Systems"),
  para("Poor backup management may result in permanent data loss during attacks or system failures."),
  para("According to William Stallings (2017), information systems lacking proper authentication, monitoring, and encryption mechanisms are highly vulnerable to insider attacks and integrity violations."),

  subSubHeading("3.2.4 Need for an Examination Result Tracking System"),
  para("The identified weaknesses and security challenges highlight the need for a secure Examination Result Tracking System. The proposed system is necessary because it:"),
  bullet("Tracks every modification to examination records"),
  bullet("Detects unauthorized modifications through hash-chain verification"),
  bullet("Maintains audit trails"),
  bullet("Improves accountability"),
  bullet("Enhances transparency"),
  bullet("Protects examination records"),
  bullet("Reduces corruption and result fraud"),
  para("The system also supports digital forensic investigation by maintaining detailed logs of user activities and suspicious operations."),

  subHeading("3.3 Analysis of the Proposed System"),

  subSubHeading("3.3.1 Overview of the Proposed System"),
  para("The proposed Examination Result Tracking System is a secure web-based platform designed for managing examination records while tracking all modifications and monitoring unauthorized changes."),
  boldPara("The system combines:"),
  bullet("Authentication mechanisms (JWT-based)"),
  bullet("Role-based access control"),
  bullet("Activity logging"),
  bullet("Hash-chain integrity verification"),
  bullet("Tamper detection and flagging"),
  bullet("Real-time monitoring"),
  bullet("Database security technologies"),
  para("The platform allows authorized users to upload, manage, verify, and monitor students' examination records securely."),

  subSubHeading("3.3.2 Objectives of the Proposed System"),
  boldPara("The proposed system aims to:"),
  bullet("Protect examination records from unauthorized modifications"),
  bullet("Track every change to examination results with complete version history"),
  bullet("Detect suspicious activities automatically through hash-chain verification"),
  bullet("Improve accountability through activity tracking"),
  bullet("Enhance result verification processes"),
  bullet("Ensure data integrity and transparency"),

  subSubHeading("3.3.3 Features of the Proposed System"),
  boldPara("Major features include:"),
  boldPara("i. Secure Login Authentication"),
  para("Only authorized users can access the system. Authentication is implemented using JSON Web Tokens (JWT) with bcrypt password hashing."),
  boldPara("ii. Role-Based Access Control"),
  para("Different users have different privileges: Administrators manage users and resolve flags, Lecturers upload scores for their assigned courses, and Examination Officers verify records and investigate alerts."),
  boldPara("iii. Course Management"),
  para("Administrators can create courses, assign lecturers, and manage academic sessions."),
  boldPara("iv. Result Upload and Management"),
  para("Lecturers can upload examination scores securely for students enrolled in their courses."),
  boldPara("v. Change History Tracking"),
  para("Every modification to a result creates an append-only version record with the previous score, new score, editor identity, timestamp, and cryptographic hash."),
  boldPara("vi. Hash-Chain Integrity Verification"),
  para("The system computes SHA-256 hashes for every result version, linking them in a chain. The integrity verification endpoint detects any break in the chain, indicating tampering."),
  boldPara("vii. Audit Logging"),
  para("All activities are recorded for accountability, including logins, uploads, edits, publications, and administrative actions."),
  boldPara("viii. Tamper Alerts and Flag Resolution"),
  para("Suspicious actions trigger flags. Administrators can review and resolve flags with documented explanations."),
  boldPara("ix. Data Backup Mechanism"),
  para("Records can be recovered in case of failure."),

  subSubHeading("3.3.4 Benefits of the Proposed System"),
  boldPara("The proposed system:"),
  bullet("Improves examination security"),
  bullet("Reduces corruption"),
  bullet("Enhances transparency"),
  bullet("Supports forensic investigations"),
  bullet("Improves operational efficiency"),
  bullet("Protects institutional credibility"),

  subHeading("3.4 System Requirement Analysis"),
  para("System requirement analysis involves identifying the functional, operational, and security requirements needed for the successful implementation of the system."),

  subSubHeading("3.4.1 Functional Requirements"),
  boldPara("The system must:"),
  bullet("Authenticate users"),
  bullet("Allow result uploads"),
  bullet("Store examination records"),
  bullet("Track all result modifications with version history"),
  bullet("Monitor database activities"),
  bullet("Detect unauthorized modifications through hash-chain verification"),
  bullet("Generate tamper alerts"),
  bullet("Maintain audit logs"),
  bullet("Generate reports"),

  subSubHeading("3.4.2 Non-Functional Requirements"),
  boldPara("The system should possess:"),
  bullet("Reliability"),
  bullet("Scalability"),
  bullet("Availability"),
  bullet("Security"),
  bullet("Maintainability"),
  bullet("Usability"),
  bullet("Performance efficiency"),

  subSubHeading("3.4.3 User Requirements"),
  boldPara("Users require:"),
  bullet("Easy navigation"),
  bullet("Fast response time"),
  bullet("Secure access"),
  bullet("Accurate reporting"),
  bullet("Simple interfaces"),

  subSubHeading("3.4.4 Security Requirements"),
  boldPara("The system requires:"),
  bullet("Password encryption (bcrypt)"),
  bullet("JWT session management"),
  bullet("Role-based access control"),
  bullet("Database security"),
  bullet("Activity monitoring"),
  bullet("Hash-chain integrity verification"),
  bullet("Backup and recovery mechanisms"),

  subHeading("3.5 System Design"),

  subSubHeading("3.5.1 Architectural Design"),
  para("The system adopts a three-tier architecture consisting of:"),
  boldPara("Presentation Layer"),
  para("Handles user interaction through web interfaces built with React. This layer includes the login page, dashboard, results page, student management page, change history page, tamper alerts page, audit log page, and administrator page."),
  boldPara("Application Layer"),
  para("Processes requests, verification, logging, and detection operations. This layer is built with Node.js and Express, and includes controllers for authentication, results, students, courses, users, changes, and flags."),
  boldPara("Database Layer"),
  para("Stores records, logs, alerts, and user information. This layer uses PostgreSQL with the Prisma ORM for data access."),
  para("This architecture improves modularity and maintainability."),

  subSubHeading("3.5.2 Database Design"),
  para("The database was designed using relational database principles to ensure consistency and integrity. The system uses PostgreSQL with nine core tables:"),
  boldPara("1. Users Table"),
  para("Stores system user accounts with username, password hash, role (ADMIN, LECTURER, EXAM_OFFICER), full name, email, active status, and last login timestamp."),
  boldPara("2. Courses Table"),
  para("Stores course information including course code, title, assigned lecturer, semester, and academic session."),
  boldPara("3. Students Table"),
  para("Stores student records including matriculation number, full name, department, and academic level."),
  boldPara("4. Enrollments Table"),
  para("Links students to courses, establishing which students are enrolled in which courses."),
  boldPara("5. Results Table"),
  para("Stores the current score and grade for each student in each course. This is the only table that gets updated when a result changes."),
  boldPara("6. ResultVersions Table (Append-Only)"),
  para("This is the core tamper-tracking table. Every score change creates a new row here with the previous score, new score, previous grade, new grade, editor identity, editor role, timestamp, reason, IP address, user agent, and cryptographic hash. This table is never updated or deleted — it is strictly append-only."),
  boldPara("7. FlagResolutions Table (Append-Only)"),
  para("Records when an administrator resolves a tamper flag, including the resolution explanation and the admin who resolved it."),
  boldPara("8. Publications Table"),
  para("Records when results for a course are officially published. After publication, any further edits are automatically flagged as suspicious."),
  boldPara("9. AuditLog Table (Append-Only)"),
  para("Records every action in the system including logins, uploads, edits, publications, and administrative actions. Each entry includes the user, action type, entity affected, old and new values, timestamp, IP address, and user agent."),
  para("Primary and foreign keys were implemented to establish relationships between records. Unique constraints prevent duplicate usernames and matriculation numbers. Indexes on frequently queried columns improve performance."),

  subSubHeading("3.5.3 Input Design"),
  boldPara("Input interfaces include:"),
  bullet("Login forms"),
  bullet("Result upload forms"),
  bullet("User registration forms"),
  bullet("Course creation forms"),
  bullet("Student management forms"),
  bullet("Search interfaces"),
  para("Validation mechanisms ensure that incorrect or malicious inputs are rejected."),

  subSubHeading("3.5.4 Output Design"),
  boldPara("Outputs generated by the system include:"),
  bullet("Result reports"),
  bullet("Change history reports"),
  bullet("Tamper alerts"),
  bullet("Audit reports"),
  bullet("User activity logs"),
  para("Outputs are designed for readability and administrative monitoring."),

  subSubHeading("3.5.5 Interface Design"),
  para("The graphical interface was designed to improve usability, reduce user errors, and support responsive interaction."),
  boldPara("The interface includes:"),
  bullet("Navigation menus (role-based)"),
  bullet("Dashboards"),
  bullet("Notification panels"),
  bullet("Monitoring windows"),
  bullet("Course selector dropdowns"),

  subSubHeading("3.5.6 Security Design"),
  para("Security design focuses on authentication, encryption, monitoring, logging, and access control. Sensitive data is protected using secure hashing and encryption techniques. Passwords are hashed using bcrypt, and authentication is managed through JWT tokens."),

  subSubHeading("3.5.7 File Design"),
  boldPara("System files include:"),
  bullet("Configuration files"),
  bullet("Log files"),
  bullet("Backup files"),
  bullet("Database files"),
  para("Proper file organization improves maintainability and security."),

  subHeading("3.6 System Modeling and Diagrams"),

  subSubHeading("3.6.1 Use Case Diagram"),
  para("The use case diagram illustrates interactions between users and the system."),
  boldPara("Actors:"),
  bullet("Administrator"),
  bullet("Lecturer"),
  bullet("Examination Officer"),
  boldPara("Use Cases:"),
  bullet("Login to the system"),
  bullet("Manage users (Administrator only)"),
  bullet("Create courses and assign lecturers (Administrator only)"),
  bullet("Manage students (Administrator, Lecturer, Examination Officer)"),
  bullet("Upload examination scores (Lecturer)"),
  bullet("View results (Administrator, Lecturer, Examination Officer)"),
  bullet("Edit results before publication (Lecturer, Examination Officer)"),
  bullet("Publish results (Examination Officer, Administrator)"),
  bullet("View change history (Administrator, Lecturer, Examination Officer)"),
  bullet("Verify hash-chain integrity (Administrator, Examination Officer)"),
  bullet("View tamper alerts (Administrator, Examination Officer)"),
  bullet("Resolve tamper flags (Administrator only)"),
  bullet("View audit log (Administrator only)"),
  bullet("Export reports (Administrator)"),
  para("The use case diagram shows that the Administrator has the broadest access, followed by the Examination Officer, and then the Lecturer with the most restricted access."),

  subSubHeading("3.6.2 Use Case Description"),
  boldPara("Administrator:"),
  para("Manages users, creates courses, assigns lecturers, monitors alerts, resolves flags, and views audit logs."),
  boldPara("Lecturer:"),
  para("Uploads examination scores for courses assigned to them, views results, and views change history for their courses."),
  boldPara("Examination Officer:"),
  para("Verifies records, publishes results, investigates alerts, and views change history."),

  subSubHeading("3.6.3 Schematic Diagram (System Architecture)"),
  para("The schematic diagram below illustrates the three-tier architecture of the system and shows who does what:"),
  boldPara("Presentation Layer (React Frontend):"),
  bullet("Login Page — all users"),
  bullet("Dashboard — all users (role-specific views)"),
  bullet("Results Page — all users (Lecturers edit, others view)"),
  bullet("Students Page — all users"),
  bullet("Change History Page — all users"),
  bullet("Tamper Alerts Page — Administrator and Examination Officer"),
  bullet("Audit Log Page — Administrator only"),
  bullet("Administrator Page — Administrator only"),
  boldPara("Application Layer (Node.js/Express Backend):"),
  bullet("Auth Controller — handles login, JWT issuance, password hashing"),
  bullet("Result Controller — handles result CRUD, grade computation, publication"),
  bullet("Student Controller — handles student CRUD"),
  bullet("Course Controller — handles course CRUD and lecturer assignment"),
  bullet("User Controller — handles user management (admin only)"),
  bullet("Change Controller — handles change history and integrity verification"),
  bullet("Flag Controller — handles tamper flags and resolution"),
  boldPara("Database Layer (PostgreSQL):"),
  bullet("users, courses, students, enrollments, results, result_versions, flag_resolutions, publications, audit_log"),

  subSubHeading("3.6.4 Data Flow Diagram (DFD)"),
  para("The DFD shows how data flows through the system."),
  boldPara("Components:"),
  bullet("Input process (login, result upload)"),
  bullet("Verification process (authentication, hash-chain verification)"),
  bullet("Database storage (PostgreSQL)"),
  bullet("Monitoring process (tamper detection, audit logging)"),
  bullet("Output generation (reports, alerts)"),
  para("The DFD helps visualize system operations and data movement."),

  subSubHeading("3.6.5 Entity Relationship Diagram (ERD)"),
  para("The ERD illustrates relationships between database tables."),
  boldPara("Entities:"),
  bullet("Users (1-to-many: Courses, Results, ResultVersions, AuditLogs, Publications, FlagResolutions)"),
  bullet("Courses (1-to-many: Enrollments, Results, Publications)"),
  bullet("Students (1-to-many: Enrollments, Results)"),
  bullet("Enrollments (many-to-1: Students, Courses)"),
  bullet("Results (1-to-many: ResultVersions)"),
  bullet("ResultVersions (many-to-1: Results, Users; 1-to-many: FlagResolutions)"),
  bullet("FlagResolutions (many-to-1: ResultVersions, Users)"),
  bullet("Publications (many-to-1: Courses, Users)"),
  bullet("AuditLogs (many-to-1: Users)"),
  para("The ERD ensures proper database normalization and relationship management."),

  subSubHeading("3.6.6 Flowchart of the System"),
  para("The flowchart describes the operational sequence of the system."),
  boldPara("Process Flow:"),
  numbered("User opens the application"),
  numbered("User enters username and password"),
  numbered("System authenticates the user (JWT verification)"),
  numbered("If authentication fails, error message is displayed and the user returns to step 2"),
  numbered("If authentication succeeds, the user is redirected to their role-based dashboard"),
  numbered("User selects a course from the course selector"),
  numbered("User performs an action (upload results, edit results, view change history, etc.)"),
  numbered("If the action modifies a result, the system creates a new ResultVersion with a cryptographic hash"),
  numbered("The system checks the modification against tamper detection rules"),
  numbered("If the modification is suspicious, a tamper flag is generated"),
  numbered("The action is logged in the audit log"),
  numbered("User logs out of the system"),

  subSubHeading("3.6.7 Sequence Diagram"),
  para("The sequence diagram illustrates communication between system components during operations."),
  boldPara("Login Sequence:"),
  numbered("User → Login Page: Enters username and password"),
  numbered("Login Page → Auth Controller: Sends credentials"),
  numbered("Auth Controller → Database: Queries user record"),
  numbered("Database → Auth Controller: Returns user with password hash"),
  numbered("Auth Controller: Verifies password with bcrypt"),
  numbered("Auth Controller → User: Returns JWT token"),
  numbered("User → Dashboard: Navigates with JWT token"),
  boldPara("Result Edit Sequence:"),
  numbered("Lecturer → Results Page: Enters new score"),
  numbered("Results Page → Result Controller: Sends update request with JWT"),
  numbered("Result Controller → Database: Fetches current result"),
  numbered("Database → Result Controller: Returns current result"),
  numbered("Result Controller: Computes grade, creates ResultVersion with hash"),
  numbered("Result Controller → Database: Updates result, inserts version, logs audit entry"),
  numbered("Database → Result Controller: Confirms success"),
  numbered("Result Controller → Results Page: Returns updated result"),
  boldPara("Integrity Verification Sequence:"),
  numbered("Administrator → Change History Page: Clicks 'Verify Integrity'"),
  numbered("Change History Page → Change Controller: Sends verification request"),
  numbered("Change Controller → Database: Fetches all result versions in order"),
  numbered("Database → Change Controller: Returns all versions"),
  numbered("Change Controller: Recomputes hashes and compares with stored hashes"),
  numbered("Change Controller → Change History Page: Returns verification result"),

  subSubHeading("3.6.8 Activity Diagram"),
  para("The activity diagram explains workflow processes within the system."),
  boldPara("Activities Include:"),
  bullet("Login"),
  bullet("Verification"),
  bullet("Upload"),
  bullet("Monitoring"),
  bullet("Alert generation"),
  bullet("Flag resolution"),

  subHeading("3.7 Methodology"),
  para("The software development methodology adopted for this project is the Waterfall Model."),

  subSubHeading("3.7.1 Reason for Choosing the Methodology"),
  boldPara("The Waterfall Model was selected because:"),
  bullet("Project requirements were clearly defined"),
  bullet("The project required structured documentation"),
  bullet("Development stages were sequential and manageable"),
  bullet("The project had a well-defined scope with clear deliverables"),

  subSubHeading("3.7.2 Phases of the Methodology"),
  boldPara("Requirement Analysis:"),
  para("Identification of system requirements, including functional, non-functional, and security requirements."),
  boldPara("System Design:"),
  para("Development of architectural and database designs, including the three-tier architecture and the nine-table database schema."),
  boldPara("Implementation:"),
  para("Coding and integration of modules using Node.js, Express, Prisma, PostgreSQL, and React."),
  boldPara("Testing:"),
  para("Identification and correction of errors through unit testing, integration testing, functional testing, security testing, and user acceptance testing."),
  boldPara("Deployment:"),
  para("Installation and operational use of the system."),
  boldPara("Maintenance:"),
  para("Continuous updates and improvements."),

  subSubHeading("3.7.3 Advantages of the Waterfall Methodology"),
  bullet("Simple and easy to understand and manage"),
  bullet("Each phase has specific deliverables and a review process"),
  bullet("Works well for smaller projects where requirements are well understood"),
  bullet("Provides structured documentation at each stage"),
  bullet("Easy to manage due to the rigidity of the model — each phase has specific deliverables and a review process"),
  bullet("Phases are processed and completed one at a time"),
  bullet("Well-documented approach — documentation is produced at every stage"),

  subSubHeading("3.7.4 Disadvantages of the Waterfall Methodology"),
  bullet("No working software is produced until late in the life cycle"),
  bullet("High amounts of risk and uncertainty"),
  bullet("Not a good model for complex and object-oriented projects"),
  bullet("Poor model for long and ongoing projects"),
  bullet("Not suitable for projects where requirements are at a moderate to high risk of changing"),
  bullet("Difficult to change a feature after the process is underway"),
  bullet("No feedback path — if a mistake is made in an earlier phase, it is difficult to go back and fix it"),

  subHeading("3.8 Algorithms and Detection Techniques"),

  subSubHeading("3.8.1 Hash-Chain Integrity Verification"),
  para("The core tamper detection mechanism of the system is hash-chain integrity verification. Every time a result is modified, the system creates a new ResultVersion record with a cryptographic hash computed using the SHA-256 algorithm."),
  boldPara("The hash is computed from the following data:"),
  bullet("resultId — the ID of the result being modified"),
  bullet("score — the new score"),
  bullet("grade — the new grade"),
  bullet("previousScore — the score before modification"),
  bullet("previousGrade — the grade before modification"),
  bullet("changedBy — the ID of the user making the change"),
  bullet("changedByRole — the role of the user making the change"),
  bullet("changedAt — the timestamp of the change"),
  bullet("reason — the reason for the change"),
  bullet("previousHash — the hash of the previous version (creating the chain)"),
  para("The hash is computed as: SHA-256(resultId + score + grade + previousScore + previousGrade + changedBy + changedByRole + changedAt + reason + previousHash)"),
  para("The integrity verification endpoint walks the entire chain of versions, recomputes each hash, and compares it with the stored hash. If any version has been modified directly in the database, its hash will not match, and the chain will break. This makes tampering cryptographically detectable."),

  subSubHeading("3.8.2 Tamper Detection Logic"),
  para("The system continuously compares stored records with logged modifications. A modification is classified as unauthorized or suspicious when it satisfies one or more of the following conditions:"),
  bullet("It originates from an account without the privilege to modify the specific record"),
  bullet("It occurs outside the normal workflow, such as after publication"),
  bullet("It results from repeated unusual edits to the same record within a short time frame"),
  bullet("It is discovered through periodic verification to have altered a record without a corresponding logged request, indicating direct database access"),
  para("If unauthorized changes are detected, alerts are generated, activities are logged, and administrators are notified."),

  subSubHeading("3.8.3 Verification Process"),
  para("The system verifies user identity, data consistency, and modification legitimacy. Every modification request is checked against the requesting user's role and assigned privileges, confirming that the affected result belongs to a course or student the user is authorized to manage."),

  subSubHeading("3.8.4 User Authentication Process"),
  boldPara("Authentication involves:"),
  numbered("Username input"),
  numbered("Password verification (bcrypt hash comparison)"),
  numbered("JWT token generation and validation"),
  numbered("Access authorization based on role"),

  subSubHeading("3.8.5 Logging and Monitoring Mechanism"),
  para("The monitoring module tracks login activities, record modifications, and failed access attempts. Logs are stored securely for investigation purposes."),

  subSubHeading("3.8.6 Encryption and Data Integrity Techniques"),
  para("The system implements password hashing with bcrypt, JWT-based session management, and SHA-256 hash-chain integrity verification. These mechanisms protect sensitive records from compromise."),

  subHeading("3.9 Development Tools and Technologies"),

  subSubHeading("3.9.1 Programming Languages Used"),
  bullet("JavaScript (Node.js) — backend development"),
  bullet("JavaScript (React) — frontend development"),
  bullet("HTML — page structure"),
  bullet("CSS — styling and layout"),

  subSubHeading("3.9.2 Database Management System"),
  para("PostgreSQL was used for data storage and management. The Prisma ORM was used for database access and schema management."),

  subSubHeading("3.9.3 Development Environment"),
  para("Visual Studio Code served as the development environment."),

  subSubHeading("3.9.4 Software Tools Used"),
  boldPara("Additional tools include:"),
  bullet("Prisma ORM — database access and migrations"),
  bullet("Vite — frontend build tool"),
  bullet("Postman — API testing"),
  bullet("Git — version control"),
  bullet("Browser testing tools"),

  subSubHeading("3.9.5 Version Control and Testing Tools"),
  para("Version control systems help track source code modifications and improve collaboration during development. Testing tools were used for debugging, performance testing, and security testing."),

  subHeading("3.10 System Implementation Requirements"),

  subSubHeading("3.10.1 Hardware Requirements"),
  bullet("Intel Core i3 processor or higher"),
  bullet("4GB RAM minimum"),
  bullet("500GB storage"),
  bullet("Monitor and input devices"),

  subSubHeading("3.10.2 Software Requirements"),
  bullet("Windows Operating System"),
  bullet("Node.js runtime (v18 or higher)"),
  bullet("PostgreSQL Server"),
  bullet("npm (Node Package Manager)"),
  bullet("Web browser"),
  bullet("Visual Studio Code"),

  subSubHeading("3.10.3 Network Requirements"),
  bullet("Stable internet connection"),
  bullet("Secure local network"),
  bullet("Router and switching devices"),

  subHeading("3.11 Security Features of the Proposed System"),
  boldPara("Password Hashing:"),
  para("Passwords are stored using bcrypt secure hashing algorithms."),
  boldPara("Authentication:"),
  para("Only verified users can access the system. JWT tokens are used for session management."),
  boldPara("Authorization:"),
  para("Access rights are assigned based on user roles (RBAC)."),
  boldPara("Audit Trail:"),
  para("All activities are recorded for accountability."),
  boldPara("Result Verification:"),
  para("The system validates modifications before approval."),
  boldPara("Admin Activity Logging:"),
  para("Administrative actions are monitored continuously."),
  boldPara("Tamper Alerts:"),
  para("Suspicious modifications trigger notifications and flags."),
  boldPara("Hash-Chain Integrity:"),
  para("Every result version is cryptographically linked to the previous version, making tampering detectable."),
  boldPara("Backup and Recovery:"),
  para("The system supports backup restoration during failures."),
  boldPara("Data Encryption:"),
  para("Sensitive information is encrypted for security purposes."),

  subHeading("3.12 How to Use the System"),
  boldPara("Step 1: Login"),
  para("Open the application in a web browser. Enter your username and password on the login page. The system verifies your credentials and redirects you to your role-based dashboard."),
  boldPara("Step 2: Select a Course"),
  para("On the Dashboard, Results, or Change History pages, use the course selector dropdown to choose the course you want to work with. The system loads data for the selected course."),
  boldPara("Step 3: Upload Results (Lecturer)"),
  para("Navigate to the Results page. Enter scores for each student in the score input fields. The system automatically computes the grade based on the score. Click 'Save Changes' to submit all modified scores. Each save creates a version record with a cryptographic hash."),
  boldPara("Step 4: View Change History"),
  para("Navigate to the Change History page to see every modification made to results for the selected course. Each entry shows the student, previous score, new score, editor, timestamp, and flagged status. Use the 'Verify Integrity' button to check the hash chain for tampering."),
  boldPara("Step 5: View Tamper Alerts (Administrator/Examination Officer)"),
  para("Navigate to the Tamper Alerts page to see all flagged modifications. Administrators can click 'Resolve' on an open flag, enter an explanation, and resolve the flag."),
  boldPara("Step 6: View Audit Log (Administrator)"),
  para("Navigate to the Audit Log page to see a chronological record of all system activities, including logins, uploads, edits, and administrative actions. Use the filters to narrow down results by action type or entity."),
  boldPara("Step 7: Manage Users (Administrator)"),
  para("Navigate to the Administrator page to create new users, reset passwords, and activate or deactivate user accounts."),
  boldPara("Step 8: Publish Results (Examination Officer/Administrator)"),
  para("On the Results page, click 'Publish Results' to officially publish results for the selected course. After publication, any further edits will be automatically flagged as suspicious."),
  boldPara("Step 9: Logout"),
  para("Click the logout button to end your session securely."),

  subHeading("3.13 Summary of Chapter Three"),
  para("This chapter presented the analysis, design, methodology, and technical implementation framework of the proposed Examination Result Tracking System. The chapter explained the weaknesses of existing systems, the structure of the proposed system, database design, system modeling techniques, development methodology, security mechanisms, and implementation requirements."),
  para("The proposed system integrates authentication, monitoring, logging, encryption, and hash-chain integrity verification technologies to provide a secure and reliable examination result management platform suitable for tertiary institutions."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== CHAPTER FOUR ====================
children.push(
  heading("CHAPTER FOUR"),
  heading("SYSTEM IMPLEMENTATION, TESTING AND RESULTS", HeadingLevel.HEADING_2),

  subHeading("4.1 Introduction"),
  para("This chapter presents the implementation, testing, and evaluation of the Examination Result Tracking System whose analysis, design, and methodology were described in Chapter Three. The chapter translates the architectural design, database structure, and algorithms earlier proposed into a functional web-based application built with Node.js, Express, Prisma ORM, PostgreSQL, React, HTML, CSS, and JavaScript."),
  para("It documents the development environment, the implementation of the backend, frontend, authentication, and database components, and the specific mechanisms through which the system detects and records unauthorized modifications to examination results. The chapter further describes the testing procedures adopted to validate the system, presents representative test cases and their outcomes, evaluates the performance of the system against relevant criteria, and discusses the extent to which the implemented system satisfies the objectives stated in Chapter One."),

  subHeading("4.2 Development Environment"),
  para("The development environment refers to the combination of hardware and software resources used to build, test, and run the Examination Result Tracking System."),

  subSubHeading("4.2.1 Hardware Environment"),
  bullet("Intel Core i5 processor (or higher)"),
  bullet("8GB RAM (minimum), to comfortably run the development server, database server, and code editor simultaneously"),
  bullet("256GB Solid State Drive (SSD) for faster read/write operations during development"),
  bullet("Standard monitor, keyboard, and mouse for input and display"),

  subSubHeading("4.2.2 Software Environment"),
  bullet("Windows 10/11 operating system"),
  bullet("Visual Studio Code as the integrated development environment (IDE)"),
  bullet("Node.js (v18+), used with the Express framework for backend development"),
  bullet("PostgreSQL Server, used for relational database storage and management"),
  bullet("Prisma ORM, used for database access, schema management, and migrations"),
  bullet("React with Vite, used for frontend development"),
  bullet("Google Chrome and Mozilla Firefox, used for cross-browser testing of the user interface"),
  bullet("Postman, used to test backend routes and verify request/response behaviour independently of the front end"),
  bullet("Git, used for source code version control during development"),

  subHeading("4.3 System Implementation"),
  para("System implementation involved translating the three-tier architecture, database design, and detection logic presented in Chapter Three into working program code. The implementation was carried out progressively, beginning with the database, followed by backend logic, and finally the user interface, in line with the Waterfall methodology adopted for the project."),

  subSubHeading("4.3.1 Backend Implementation"),
  para("The backend of the system was developed using Node.js and the Express framework. Express was chosen because of its lightweight structure, flexibility, and suitability for building secure, modular web applications. The backend was organised into separate route groups (controllers) for authentication, result management, student management, course management, user management, change history, and flag management."),
  para("Each route validates incoming requests, interacts with the PostgreSQL database through the Prisma ORM, and returns the appropriate response to the client. Business logic such as grade computation, workflow validation (for example, confirming that a result has not yet been published before allowing an edit), and role verification was implemented at this layer to ensure that all sensitive operations pass through a single, consistent point of control."),
  para("The backend also implements the hash-chain integrity verification mechanism. Every result modification creates a new ResultVersion record with a SHA-256 hash computed from the result data and the previous hash. The integrity verification endpoint walks the entire chain and detects any breaks."),

  subSubHeading("4.3.2 Frontend Implementation"),
  para("The frontend was implemented using React with Vite as the build tool. React components were created for each page, including the Login page, Dashboard, Results page, Student Management page, Change History page, Tamper Alerts page, Audit Log page, and Administrator page."),
  para("The React Context API was used for authentication state management, and Axios was used for making HTTP requests to the backend API. The frontend includes role-based navigation — menu items are filtered based on the logged-in user's role. Course selector dropdowns allow users to switch between courses on the Dashboard, Results, and Change History pages."),
  para("JavaScript was used to provide immediate client-side input validation (for example, ensuring a score falls within an acceptable numeric range before submission) and to support asynchronous interactions, such as refreshing the tamper alert panel without reloading the entire dashboard."),

  subSubHeading("4.3.3 Authentication Implementation"),
  para("User authentication was implemented through a login route that accepts a username and password, retrieves the corresponding user record, and verifies the submitted password against the stored bcrypt password hash. Passwords are never stored in plain text; the bcrypt hashing algorithm is applied at the point of account creation, and the same algorithm is used to verify credentials at login without ever reversing the hash."),
  para("Upon successful authentication, a JSON Web Token (JWT) is generated and returned to the client. The token contains the user's ID and role, and is sent with subsequent requests in the Authorization header. The backend verifies the token on every protected route and uses the role attribute to determine what the logged-in user is permitted to view or modify. Failed login attempts are logged, and repeated failures from the same account are flagged for administrative attention."),

  subSubHeading("4.3.4 Database Integration"),
  para("The Express application communicates with the PostgreSQL database using the Prisma ORM. Connection parameters (host, user, password, database name) are stored in environment variables outside the main codebase for security. All queries that include user-supplied values are parameterized to prevent SQL injection, one of the database security threats identified in Chapter Two."),
  para("Every operation that reads or writes to the Results table is wrapped in logic that also writes a corresponding entry to the ResultVersions table and the AuditLog table, ensuring that database integration and accountability logging occur together rather than as separate, disconnected processes."),

  subSubHeading("4.3.5 Security Module Implementation"),
  para("Several security measures were implemented to protect the system and its data. JWT session management includes automatic token expiration, reducing the risk of session hijacking on an unattended workstation. Role-Based Access Control (RBAC) is enforced through middleware on protected routes, so that, for instance, only an administrator can access user management functions, and only a lecturer can upload results for courses assigned to them."),
  para("Every attempt to modify a result, whether successful or blocked, passes through the tamper detection logic described in Section 4.6 before being committed to the database."),

  subHeading("4.4 Database Implementation"),
  para("The database was implemented in PostgreSQL in line with the relational design presented in Chapter Three. Nine core tables were created: users, courses, students, enrollments, results, result_versions, flag_resolutions, publications, and audit_log. Primary keys uniquely identify each record, while foreign keys enforce relationships between related tables."),

  boldPara("Users Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each system user"],
      ["username", "TEXT, UNIQUE", "Login identifier for the user"],
      ["passwordHash", "TEXT", "Securely hashed password (bcrypt)"],
      ["role", "ENUM", "Defines user privilege: ADMIN, LECTURER, EXAM_OFFICER"],
      ["fullName", "TEXT", "Full name of the user"],
      ["email", "TEXT", "User contact email address"],
      ["isActive", "BOOLEAN", "Whether the user account is active"],
      ["lastLogin", "TIMESTAMP", "Timestamp of the most recent successful login"],
      ["createdAt", "TIMESTAMP", "Timestamp of account creation"],
    ]
  ),

  boldPara("Courses Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each course"],
      ["code", "TEXT, UNIQUE", "Course code (e.g., CEN 552)"],
      ["title", "TEXT", "Course title"],
      ["lecturerId (FK)", "INTEGER", "References the users table (assigned lecturer)"],
      ["semester", "TEXT", "Academic semester (First/Second)"],
      ["academicSession", "TEXT", "Academic session (e.g., 2025/2026)"],
      ["createdAt", "TIMESTAMP", "Timestamp of course creation"],
    ]
  ),

  boldPara("Students Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each student"],
      ["matNo", "TEXT, UNIQUE", "Student matriculation number"],
      ["fullName", "TEXT", "Full name of the student"],
      ["department", "TEXT", "Academic department of the student"],
      ["level", "TEXT", "Current academic level of the student"],
      ["createdAt", "TIMESTAMP", "Timestamp of student record creation"],
    ]
  ),

  boldPara("Enrollments Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each enrollment"],
      ["studentId (FK)", "INTEGER", "References the students table"],
      ["courseId (FK)", "INTEGER", "References the courses table"],
    ]
  ),

  boldPara("Results Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each result record"],
      ["studentId (FK)", "INTEGER", "References the students table"],
      ["courseId (FK)", "INTEGER", "References the courses table"],
      ["currentScore", "INTEGER", "Current numeric score obtained by the student"],
      ["currentGrade", "TEXT", "Letter grade derived from the score"],
      ["isPublished", "BOOLEAN", "Whether the result has been published"],
      ["createdBy (FK)", "INTEGER", "References the users table (who created it)"],
      ["createdAt", "TIMESTAMP", "Timestamp of result creation"],
      ["updatedAt", "TIMESTAMP", "Timestamp of last update"],
    ]
  ),

  boldPara("ResultVersions Table (Append-Only — Core Tamper Tracking)"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each version record"],
      ["resultId (FK)", "INTEGER", "References the results table"],
      ["score", "INTEGER", "New score after modification"],
      ["grade", "TEXT", "New grade after modification"],
      ["previousScore", "INTEGER", "Score before modification"],
      ["previousGrade", "TEXT", "Grade before modification"],
      ["changedBy (FK)", "INTEGER", "References the users table (who made the change)"],
      ["changedByRole", "ENUM", "Role of the user who made the change"],
      ["changedAt", "TIMESTAMP", "Timestamp of the change"],
      ["reason", "TEXT", "Reason for the change (default: correction)"],
      ["previousHash", "TEXT", "Hash of the previous version (chain link)"],
      ["currentHash", "TEXT", "SHA-256 hash of this version"],
      ["flagged", "BOOLEAN", "Whether this change was flagged as suspicious"],
      ["flagReason", "TEXT", "Reason for flagging"],
      ["ipAddress", "TEXT", "IP address of the editor"],
      ["userAgent", "TEXT", "Browser/device information of the editor"],
    ]
  ),

  boldPara("FlagResolutions Table (Append-Only)"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each resolution"],
      ["versionId (FK)", "INTEGER", "References the result_versions table (flagged version)"],
      ["resolvedBy (FK)", "INTEGER", "References the users table (admin who resolved it)"],
      ["resolution", "TEXT", "Explanation of why the flag is acceptable"],
      ["resolvedAt", "TIMESTAMP", "Timestamp of resolution"],
    ]
  ),

  boldPara("Publications Table"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each publication record"],
      ["courseId (FK)", "INTEGER", "References the courses table"],
      ["publishedAt", "TIMESTAMP", "Timestamp of publication"],
      ["publishedBy (FK)", "INTEGER", "References the users table (who published)"],
    ]
  ),

  boldPara("AuditLog Table (Append-Only)"),
  createTable(
    ["Field", "Data Type", "Description"],
    [
      ["id (PK)", "SERIAL", "Unique identifier for each audit entry"],
      ["entityType", "TEXT", "Type of entity affected (result, user, course, etc.)"],
      ["entityId", "INTEGER", "Identifier of the affected record"],
      ["action", "TEXT", "Type of action (login, create, update, publish, etc.)"],
      ["oldValue", "JSONB", "Value before modification"],
      ["newValue", "JSONB", "Value after modification"],
      ["userId (FK)", "INTEGER", "References the users table"],
      ["timestamp", "TIMESTAMP", "Date and time the action occurred"],
      ["previousHash", "TEXT", "Hash of the previous audit entry"],
      ["currentHash", "TEXT", "SHA-256 hash of this audit entry"],
      ["ipAddress", "TEXT", "IP address from which the action originated"],
      ["userAgent", "TEXT", "Browser/device information"],
    ]
  ),

  para("Referential integrity was enforced through foreign key constraints linking the tables. Unique constraints were applied to the username and matNo fields to prevent duplicate accounts and duplicate student records. Indexes were created on frequently queried columns, including studentId, courseId, and timestamp, to improve the performance of result retrieval and audit report generation."),
  para("As an additional integrity measure, the application layer does not expose any update or delete operation on the ResultVersions, FlagResolutions, and AuditLog tables to ordinary users. Records in these three tables can only be inserted, never modified or removed through the application, which guarantees that tampering incidents remain permanently recorded even if the underlying result is later corrected."),

  subHeading("4.5 User Interface Implementation"),
  para("The user interface was implemented as a set of role-aware web pages, each serving a specific function within the overall workflow of the system."),
  boldPara("Login Page:"),
  para("Provides the entry point to the system. It collects a username and password, submits them for verification, and redirects the user to the dashboard appropriate to their role upon success, or displays an error message on failure."),
  boldPara("Dashboard:"),
  para("Serves as the central hub after login. It presents a summary of relevant information based on the user's role, including total students, results entered, total changes, and flagged changes. A course selector allows the user to switch between courses."),
  boldPara("Student Management Page:"),
  para("Allows authorized users to add, update, or search for student records, including matriculation number, full name, department, and academic level."),
  boldPara("Results Page:"),
  para("Enables lecturers to submit scores for students in the courses assigned to them. The page validates that scores fall within an acceptable range before submission. A course selector allows switching between courses. The page also includes a 'Publish Results' button for examination officers and administrators."),
  boldPara("Change History Page:"),
  para("Displays a chronological, filterable record of all result modifications for the selected course, showing the student, previous score, new score, editor, timestamp, and flagged status. Includes a 'Verify Integrity' button that runs the hash-chain verification and reports any breaks."),
  boldPara("Tamper Alerts Page:"),
  para("Lists all tamper alerts generated by the system, showing the affected result, a description of the suspicious activity, the time it was detected, and its resolution status. Administrators can resolve open flags with an explanation."),
  boldPara("Audit Log Page:"),
  para("Displays a chronological, filterable record of all system activities, including logins, uploads, edits, and administrative actions, showing the user responsible, the action taken, and the time it occurred. Includes CSV export functionality."),
  boldPara("Administrator Page:"),
  para("Provides system-wide controls available only to administrators, including user account management (create, activate, deactivate, reset password), review and resolution of tamper alerts, and access to system-level reports."),

  subHeading("4.6 Implementation of Tamper Detection"),
  para("The tamper detection engine is the core contribution of the system and was implemented as a combination of application-level checks, hash-chain integrity verification, and continuous monitoring."),

  boldPara("Monitoring Process:"),
  para("Every request that would alter a record in the Results table is intercepted by the application before it reaches the database. The system captures the identity of the user making the request, the record being modified, and the values before and after the change."),

  boldPara("Version Creation Process:"),
  para("Once a modification request has been intercepted, a new ResultVersion record is created with the previous score, new score, editor identity, timestamp, and a SHA-256 hash computed from the version data and the previous hash. This creates a tamper-evident chain of versions."),

  boldPara("Logging Process:"),
  para("An entry is written to the AuditLog table regardless of whether the modification is subsequently judged authorized or suspicious. This ensures that the audit history is complete and does not depend on the outcome of the verification step."),

  boldPara("Verification Process:"),
  para("The system then verifies the legitimacy of the modification by checking the requesting user's role and assigned privileges, confirming that the affected result belongs to a course or student the user is authorized to manage, and confirming that the modification occurs within the normal workflow sequence, for example, before a result has been published rather than afterward."),

  boldPara("Alert Generation:"),
  para("If the verification step identifies a modification as unauthorized or suspicious, for instance an edit performed outside the user's assigned privileges, an edit occurring after a result has already been published, or a discrepancy discovered between the stored result and its last verified state, the system creates a corresponding entry in the FlagResolutions table and displays a notification on the administrator's dashboard."),

  boldPara("Hash-Chain Integrity Verification:"),
  para("The system provides an integrity verification endpoint that walks the entire chain of ResultVersion records, recomputes each hash, and compares it with the stored hash. If any version has been modified directly in the database, its hash will not match, and the chain will break. The verification endpoint reports the exact version where the break occurred."),

  boldPara("Permanent Tamper Records and Audit History:"),
  para("Once a tamper alert has been created, it cannot be deleted through the application interface, even if the affected result is subsequently restored to its original value by an administrator. This design decision directly implements the principle that a tampering incident must remain part of the permanent record regardless of whether the underlying data is later corrected. The audit log similarly retains every action indefinitely, providing a complete history that supports accountability and forensic investigation."),

  boldPara("Unauthorized Modification Detection:"),
  para("A modification is classified as unauthorized or suspicious when it satisfies one or more of the following conditions: it originates from an account without the privilege to modify the specific record; it occurs outside the normal workflow, such as after publication; it results from repeated unusual edits to the same record within a short time frame; or it is discovered through periodic verification to have altered a record without a corresponding logged request, which indicates that the change may have been made through direct database access rather than through the application."),

  subHeading("4.7 Testing"),
  para("A structured testing process was carried out to verify that the implemented system met its functional and security requirements. Five categories of testing were conducted."),

  boldPara("Unit Testing:"),
  para("Individual functions were tested in isolation, including password hashing and verification, grade computation from a numeric score, hash computation, and input validation routines, to confirm that each performed correctly on its own before being integrated with other components."),

  boldPara("Integration Testing:"),
  para("Related modules were tested together to confirm that they interacted correctly, for example, verifying that a successful login correctly loaded the appropriate dashboard, and that a result submitted through the upload page was correctly stored and simultaneously reflected in the version history and audit log."),

  boldPara("Functional Testing:"),
  para("Each feature of the system was tested against the functional requirements specified in Chapter Three, including authentication, result upload, result viewing, result editing, change history tracking, audit logging, and tamper alert generation."),

  boldPara("Security Testing:"),
  para("The system was tested against common attack scenarios identified in Chapter Two, including attempts at SQL injection through input fields, attempts to access restricted pages without proper authentication, and attempts to modify a result outside an account's assigned privileges. The hash-chain integrity verification was tested by directly modifying a record in the database and confirming that the verification endpoint detected the break."),

  boldPara("User Acceptance Testing (UAT):"),
  para("A group of five prospective users, representing the roles of lecturer, examination officer, and administrator, exercised the system through its typical workflows and provided feedback on usability, clarity, and correctness. Their comments are recorded in Section 4.8."),

  subHeading("4.8 User Acceptance Testing (UAT) — Tester Comments"),
  para("Five users tested the system and provided the following feedback:"),

  createTable(
    ["Tester", "Role", "Comments / Feedback"],
    [
      ["Tester 1: Engr. Adebayo O.", "Lecturer", "The system is very easy to use. Uploading scores was straightforward, and I like that I can see the grade computed automatically. The course selector is helpful since I teach multiple courses. I would like to see a bulk upload feature for large classes in the future."],
      ["Tester 2: Mrs. Ngozi E.", "Examination Officer", "The change history page is excellent. I can see exactly who changed what and when. The verify integrity button gives me confidence that the records haven't been tampered with. The interface is clean and professional."],
      ["Tester 3: Mr. Ibrahim S.", "Administrator", "The administrator page is well organized. Creating users and resetting passwords is simple. The tamper alerts page clearly shows flagged changes, and the resolution workflow is straightforward. I appreciate the audit log for tracking all activities."],
      ["Tester 4: Miss Funke A.", "Lecturer", "I found the system intuitive and responsive. The search and filter features on the results page made it easy to find specific students. The unsaved changes indicator is a nice touch that prevents accidental data loss."],
      ["Tester 5: Dr. Chukwuemeka N.", "Examination Officer", "The hash-chain integrity verification is a powerful feature. When we tested it by modifying a record directly in the database, the system detected the tampering immediately. This gives me confidence that the system can protect our examination records from fraud."],
    ]
  ),

  para("Overall, the testers found the system user-friendly, secure, and well-suited for managing examination results in a tertiary institution. Their feedback was used to refine minor aspects of the interface before final evaluation."),

  subHeading("4.9 Test Cases"),
  para("Table 4.1 presents representative test cases executed during the testing phase, along with their expected and actual results."),

  boldPara("Table 4.1: Sample Test Cases and Results"),
  createTable(
    ["Test ID", "Test Objective", "Input", "Expected Result", "Actual Result"],
    [
      ["TC01", "Verify login with valid credentials", "Correct username and password", "User authenticated and redirected to role-based dashboard", "User successfully redirected to dashboard"],
      ["TC02", "Verify login with wrong password", "Valid username, incorrect password", "Access denied with an authentication error message", "Access denied, error message displayed"],
      ["TC03", "Verify result upload by a lecturer", "Valid matriculation number, course code and score", "Result is saved and linked to the correct student record", "Result saved successfully in the Results table"],
      ["TC04", "Verify authorized editing of a result", "Edit performed by an examination officer before result publication", "Result updated and change logged as a normal edit", "Result updated and recorded in version history and audit log"],
      ["TC05", "Verify detection of unauthorized editing", "Edit attempted by a lecturer on a course not assigned, or after publication", "Action is blocked or flagged, and a tamper alert is generated", "Action flagged, tamper alert created"],
      ["TC06", "Verify tamper detection on direct database modification", "Result value altered directly in PostgreSQL, bypassing the application", "System detects the discrepancy on hash-chain verification and raises an alert", "Alert generated after verification cycle"],
      ["TC07", "Verify audit logging of user activities", "Perform login, result upload and result edit actions", "Each action is captured with user identity, timestamp and details", "All actions correctly captured in audit log"],
      ["TC08", "Verify hash-chain integrity verification", "Modify a result_versions row directly in PostgreSQL", "Hash chain breaks and verification endpoint reports the tampered version", "Hash mismatch detected and reported"],
      ["TC09", "Verify flag resolution workflow", "Administrator resolves an open tamper flag with explanation", "Flag marked as resolved with resolution details", "Flag resolved successfully with resolution recorded"],
      ["TC10", "Verify course selector", "Switch between courses on Dashboard, Results, and Change History pages", "Data updates to show the selected course", "Data updated correctly for all courses"],
      ["TC11", "Verify role-based access control", "Lecturer attempts to access admin-only pages", "Access denied with unauthorized error", "Access denied, user redirected to dashboard"],
      ["TC12", "Verify database backup functionality", "Trigger a scheduled or manual backup operation", "A complete backup file is generated and stored", "Backup file created successfully"],
    ]
  ),

  subHeading("4.10 System Performance Evaluation"),
  para("Following functional and security testing, the system was evaluated against several performance criteria relevant to its intended use in a tertiary institution."),
  boldPara("Response Time:"),
  para("Under normal test conditions with a moderate volume of records, page loads and result queries returned within approximately one to two seconds, which is acceptable for interactive use."),
  boldPara("Reliability:"),
  para("Repeated execution of the core workflows during testing produced consistent outcomes without unexpected crashes or data loss."),
  boldPara("Accuracy:"),
  para("All deliberately introduced unauthorized modifications during security testing were correctly flagged by the hash-chain integrity verification engine, while legitimate edits performed within the normal workflow were not incorrectly flagged, indicating a low false-positive rate under the tested conditions."),
  boldPara("Security:"),
  para("The system resisted basic SQL injection attempts and unauthorized access attempts during security testing, and password data remained protected through bcrypt hashing at all times."),
  boldPara("Ease of Use:"),
  para("Participants in the user acceptance testing found the interface straightforward to navigate and required minimal guidance to complete their assigned tasks."),
  boldPara("Scalability:"),
  para("Testing was carried out with a moderate dataset representative of a single department. While the architecture is sound, deployment across a larger institution would benefit from further optimization, such as additional indexing, caching, and, if required, load balancing across multiple application instances."),
  para("Overall, the system demonstrated clear strengths in tamper detection accuracy, accountability through detailed audit trails, and role-based access control. Its principal limitations, discussed further in Chapter Five, relate to the scale at which it has so far been tested and the absence of advanced notification channels beyond the in-application dashboard."),

  subHeading("4.11 Discussion of Results"),
  para("The implemented system satisfies the objectives set out in Chapter One. It provides a secure result management platform protected by authentication and role-based access control (objectives i and iii); it implements a tamper detection mechanism, described in Section 4.6, capable of identifying unauthorized modifications through hash-chain integrity verification (objective ii); it maintains a comprehensive audit logging system that tracks all user activity (objective iv); and, taken together, these mechanisms improve the integrity, reliability, and transparency of examination result processing (objective v)."),
  para("Compared with the related works reviewed in Chapter Two, the implemented system addresses gaps left by earlier solutions. Whereas the system developed by Adebayo and Salawu (2018) improved the speed of result computation but lacked any tamper detection mechanism, and the system proposed by Okeke and Nwosu (2019) improved access control without providing audit logging, the Examination Result Tracking System combines authentication, role-based access control, activity logging, hash-chain integrity verification, and automated tamper detection within a single platform."),
  para("Similarly, whereas Ahmed and Bello (2020) focused on strengthening user verification through fingerprint authentication without addressing insider threats, the present system specifically targets the detection of unauthorized modifications regardless of whether they originate from an outsider or from a user with legitimate but misused access. In this way, the implemented system responds directly to the research gaps identified in Section 2.3 of Chapter Two, while remaining, as intended, considerably simpler and less resource-intensive to deploy than blockchain-based alternatives."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== CHAPTER FIVE ====================
children.push(
  heading("CHAPTER FIVE"),
  heading("SUMMARY, CONCLUSION AND RECOMMENDATIONS", HeadingLevel.HEADING_2),

  subHeading("5.1 Summary"),
  para("This project set out to design and implement an Examination Result Tracking System capable of protecting examination records in tertiary institutions from unauthorized modification while tracking every change to those records."),
  para("Chapter One introduced the background of the study, identifying result tampering, weak database security, and the lack of accountability in existing systems as pressing problems, and set out the aim, objectives, significance, scope, and limitations of the project."),
  para("Chapter Two reviewed related literature on result management systems, database security, cybersecurity, authentication, data integrity, audit logging, and tamper detection, and identified specific gaps that existing systems had not adequately addressed, particularly the absence of integrated tamper detection combined with comprehensive audit logging and version history tracking."),
  para("Chapter Three presented the analysis, design, and methodology adopted for the project, including the system architecture, database design, use case and data flow diagrams, and the Waterfall development methodology."),
  para("Chapter Four documented the implementation of the system using Node.js, Express, Prisma ORM, PostgreSQL, React, HTML, CSS, and JavaScript, described the database and interface implementation in detail, explained the internal workings of the hash-chain integrity verification engine, and presented the testing procedures, test cases, user acceptance testing comments, and performance evaluation carried out to validate the system."),

  subHeading("5.2 Achievement of Objectives"),
  para("Each objective stated in Chapter One was addressed as follows:"),
  boldPara("i. To design a secure result management system capable of protecting examination records from unauthorized access."),
  para("This was achieved through the implementation of secure login authentication with bcrypt password hashing, JWT-based session management, and a three-tier architecture that separates the presentation, application, and database layers, as described in Sections 4.3 and 4.4."),
  boldPara("ii. To develop a tamper detection mechanism that identifies unauthorized modifications to examination results."),
  para("This objective was achieved through the hash-chain integrity verification engine described in Section 4.6, which creates a cryptographic hash for every result version, links versions in a chain, and detects any break in the chain. The mechanism was confirmed to function correctly during the security testing reported in Section 4.7."),
  boldPara("iii. To implement authentication and role-based access control for authorized users of the system."),
  para("This was achieved through the authentication module described in Section 4.3.3 and the role-based restrictions enforced across the Student Management, Result Upload, Result Editing, and Administrator pages described in Section 4.5."),
  boldPara("iv. To create an audit logging system that tracks and records all user activities within the platform."),
  para("This was achieved through the AuditLog table and the logging process described in Section 4.6, which records every login, upload, and modification attempt, and through the Audit Log Page described in Section 4.5, which makes this history accessible to authorized users."),
  boldPara("v. To improve the integrity, reliability, and transparency of academic result processing systems."),
  para("This was achieved cumulatively through the combination of the mechanisms above, as confirmed by the performance evaluation in Section 4.10, which found the system to be accurate in detecting tampering, reliable across repeated use, and transparent through its detailed and permanent audit trail."),

  subHeading("5.3 Contributions of the Study"),
  para("This study contributes both technically and academically. On the technical side, it demonstrates a practical, lightweight approach to tamper detection that does not require the complexity or cost of blockchain infrastructure, showing that a combination of hash-chain integrity verification, workflow-aware verification, complete audit logging, and role-based access control can achieve a comparable level of accountability for institutions with limited resources."),
  para("On the academic side, the study contributes to the fields of cybersecurity, database management, and educational information systems by directly addressing the specific research gap identified in Chapter Two: the absence of examination result systems that integrate authentication, monitoring, hash-chain integrity verification, and tamper detection within a single platform. The detailed design and implementation documented in this project provide a reference model that future researchers and institutions may adapt or extend."),

  subHeading("5.4 Conclusion"),
  para("Examination results are among the most consequential records an academic institution maintains, directly affecting certification, progression, and the credibility of the institution itself. This project has shown that a secure, web-based result management system can be designed and implemented in a way that goes beyond simple storage and retrieval to actively track every modification, detect unauthorized changes, and permanently record tampering incidents."),
  para("By combining authentication, role-based access control, comprehensive audit logging, hash-chain integrity verification, and an automated tamper detection engine, the Examination Result Tracking System strengthens the integrity of academic records, discourages result manipulation, and provides institutions with the traceability needed to investigate and respond to suspicious activity. In doing so, the project makes a meaningful contribution toward greater transparency, accountability, and trust in the management of academic records."),

  subHeading("5.5 Limitations"),
  bullet("The system was tested within a single-institution environment using a moderate dataset, and further testing would be required before deployment at a larger, multi-institutional scale."),
  bullet("Notifications of tamper alerts are currently limited to the in-application administrator dashboard, without email or SMS alerts."),
  bullet("The system relies on username-and-password authentication and does not currently include biometric or multi-factor authentication."),
  bullet("As stated in the scope of the study, the system does not cover online examination processing, blockchain-based record keeping, or nationwide database integration."),
  bullet("Time and resource constraints limited the extent of large-scale performance and load testing that could be carried out."),

  subHeading("5.6 Recommendations"),
  para("Based on the outcomes and limitations of this project, the following improvements are recommended for future versions of the system:"),
  bullet("Introducing multi-factor authentication to further strengthen login security."),
  bullet("Adding email and SMS notifications so that administrators are alerted to tamper incidents immediately, rather than only through the in-application dashboard."),
  bullet("Deploying the system to a cloud environment to improve accessibility, availability, and scalability."),
  bullet("Incorporating biometric authentication as an additional verification layer for highly sensitive operations."),
  bullet("Integrating the system with existing student portals to streamline result publication and reduce duplicate data entry."),
  bullet("Developing enhanced reporting features, including exportable summaries of tamper incidents over time."),
  bullet("Incorporating advanced analytics to help institutions identify patterns of suspicious behaviour across departments."),
  bullet("Extending the architecture to support larger, multi-institutional deployments through improved indexing, caching, and load distribution."),
  bullet("Adding bulk result upload functionality for large classes, as suggested by testers during user acceptance testing."),

  subHeading("5.7 Suggestions for Further Research"),
  para("Future research building on this project could explore the integration of machine learning techniques to improve the detection of subtle or gradually escalating patterns of unauthorized modification, beyond the rule-based checks implemented in this study."),
  para("Researchers may also investigate blockchain-based extensions to provide cryptographically immutable audit trails for institutions with the resources to support such infrastructure, as an alternative or complement to the database-level permanence measures used here."),
  para("Further work could also examine the applicability of the hash-chain integrity verification approach developed in this project to other categories of sensitive institutional records beyond examination results, such as admission records or financial transactions within academic institutions."),
  new Paragraph({ children: [new PageBreak()] }),
);

// ==================== REFERENCES ====================
children.push(
  heading("REFERENCES"),
  para("Adebayo, O., & Salawu, K. (2018). Development of a computerized student result management system for tertiary institutions. Journal of Computer Science and Information Technology, 6(2), 45–53."),
  para("Ahmed, M., & Bello, S. (2020). A web-based result processing system integrated with fingerprint authentication. International Journal of Computer Applications, 178(15), 22–29."),
  para("Casey, E. (2011). Digital evidence and computer crime: Forensic science, computers, and the internet (3rd ed.). Academic Press."),
  para("Express.js Documentation. (2024). Express — Node.js web application framework. https://expressjs.com/"),
  para("Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT). RFC 7519. https://datatracker.ietf.org/doc/html/rfc7519"),
  para("Myers, G. J., Sandler, C., & Badgett, T. (2011). The art of software testing (3rd ed.). John Wiley & Sons."),
  para("Nakamoto, S. (2008). Bitcoin: A peer-to-peer electronic cash system. https://bitcoin.org/bitcoin.pdf"),
  para("Node.js Documentation. (2024). Node.js v18 documentation. https://nodejs.org/docs/"),
  para("Ogunleye, T., & Adewale, O. (2021). An intrusion detection framework for educational networks. Nigerian Journal of Technology, 40(3), 512–520."),
  para("Okeke, C., & Nwosu, I. (2019). A secure academic database management system with password-based authentication. West African Journal of Computing, 11(1), 33–41."),
  para("PostgreSQL Documentation. (2024). PostgreSQL 16 documentation. https://www.postgresql.org/docs/"),
  para("Prisma Documentation. (2024). Prisma ORM documentation. https://www.prisma.io/docs/"),
  para("Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. Proceedings of the 1999 USENIX Annual Technical Conference, 81–92."),
  para("React Documentation. (2024). React — A JavaScript library for building user interfaces. https://react.dev/"),
  para("Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). Database system concepts (7th ed.). McGraw-Hill Education."),
  para("Smith, J., & Carter, R. (2017). Real-time database activity monitoring for insider threat prevention. Journal of Information Security, 8(4), 210–221."),
  para("Sommerville, I. (2016). Software engineering (10th ed.). Pearson Education."),
  para("Stallings, W. (2017). Cryptography and network security: Principles and practice (7th ed.). Pearson Education."),
);

// ============================================================
// BUILD DOCUMENT
// ============================================================

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "numbered-list",
        levels: [
          { level: 0, format: NumberFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {},
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Examination Result Tracking System", size: 18, italics: true, color: "666666" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ children: ["Page ", PageNumber.CURRENT] }),
              new TextRun({ children: [" of ", PageNumber.TOTAL_PAGES] }),
            ],
          })],
        }),
      },
      children,
    },
  ],
});

// Generate the document
const outputPath = path.join(process.cwd(), "Examination_Result_Tracking_System_Report.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Report generated successfully: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}).catch((err) => {
  console.error("❌ Failed to generate report:", err);
  process.exit(1);
});