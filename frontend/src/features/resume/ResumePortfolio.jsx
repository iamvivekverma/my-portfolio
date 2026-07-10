import React from "react";

const RuleThick = () => <hr style={{ border: "none", borderTop: "2px solid #111", margin: "9px 0 0" }} />;
const RuleThin = () => <hr style={{ border: "none", borderTop: "1px solid #bbb", margin: "4px 0 8px" }} />;

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontFamily: "'EB Garamond', Georgia, serif",
        fontSize: "11pt",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#0a0a0a",
        marginBottom: "1px",
      }}
    >
      {children}
    </div>
  );
}

function EntryHead({ org, location }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <span style={{ fontWeight: 700, fontSize: "10.5pt", color: "#0a0a0a" }}>{org}</span>
      <span style={{ fontSize: "9.2pt", color: "#444", whiteSpace: "nowrap", flexShrink: 0 }}>{location}</span>
    </div>
  );
}

function EntryMeta({ role, date }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "1px", gap: "8px" }}>
      <span style={{ fontStyle: "italic", fontSize: "9.8pt", color: "#2a2a2a" }}>{role}</span>
      <span style={{ fontSize: "9.2pt", color: "#444", whiteSpace: "nowrap", flexShrink: 0 }}>{date}</span>
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: "3.5px" }}>
      {items.map((text) => (
        <li
          key={text}
          style={{
            position: "relative",
            paddingLeft: "13px",
            fontSize: "9.9pt",
            lineHeight: "1.46",
            marginBottom: "2.5px",
            color: "#151515",
          }}
        >
          <span style={{ position: "absolute", left: "1px", top: 0, fontSize: "10pt", color: "#111", lineHeight: "1.46" }}>
            •
          </span>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </li>
      ))}
    </ul>
  );
}

function AchievementEntry({ title, meta, desc }) {
  return (
    <div style={{ marginBottom: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontWeight: 700, fontSize: "10.2pt" }}>{title}</span>
        <span style={{ fontSize: "9.2pt", color: "#444", whiteSpace: "nowrap", flexShrink: 0 }}>{meta}</span>
      </div>
      {desc && <div style={{ fontSize: "9.8pt", color: "#333", marginTop: "1px" }}>{desc}</div>}
    </div>
  );
}

const contactItems = [
  { label: "+91 72096 40726" },
  { label: "iamvivek.verma@icloud.com", href: "mailto:iamvivek.verma@icloud.com" },
  { label: "Portfolio", href: "https://whovivekverma.vercel.app" },
  { label: "LinkedIn", href: "https://linkedin.com/in/whovivekverma" },
  { label: "GitHub", href: "https://github.com/iamvivekverma" },
  { label: "Jaipur, India" },
];

const professionalExperience = [
  {
    org: "EmberKids Chess Academy – Enterprise LMS (emberkids.netlify.app)",
    location: "Client Project",
    role: "Lead Full Stack Engineer",
    date: "2026",
    bullets: [
      "Architected a full-stack LMS from scratch (Next.js 16, TypeScript, MongoDB), serving 500+ global students. Achieved a 90+ Lighthouse performance score and sub-200ms API response times.",
      "Built a scalable payment processing system using the Wise API and MongoDB ACID transactions, securely processing $50K+ in monthly volume with zero financial discrepancies.",
      "Designed a security-first backend featuring a custom RBAC system with 47 granular permissions, dual-token JWTs, and Helmet CSP, virtually eliminating unauthorized access attempts.",
      "Implemented Redis caching and automated Node-cron jobs for attendance tracking and portal lifecycle management, reducing administrative overhead by 80% and database load by 60%.",
      "Engineered a multi-channel automated notification system (Nodemailer, Twilio WhatsApp API) for trial reminders, renewals, and class updates, achieving a 95% delivery rate.",
    ],
  },
  {
    org: "Savrig - Digital Product Studio · savrig.vercel.app",
    location: "Jaipur, India",
    role: "Independent Full Stack Developer",
    date: "2026 - Present",
    bullets: [
      "Delivering <b>custom web applications, SaaS tools, and business automation solutions</b> for SMB clients—owning product planning, development, deployment, and maintenance end-to-end.",
      "Built client-facing Next.js applications with SEO optimization, lead-capture flows, and server-side data sync, leveraging modern workflows to accelerate delivery timelines vs traditional cycles.",
      "Established a repeatable delivery framework enabling consistent, high-quality output across multiple concurrent client engagements without additional headcount.",
    ],
  },
];

const technicalProjects = [
  {
    org: "Floatrec - Cross-Platform Screen Recording Utility",
    location: "macOS · Windows",
    role: "Developer · Electron · React · Canvas API",
    date: "2026",
    bullets: [
      "Shipped a cross-platform camera overlay app (always-on-top window, drag/resize, flip controls, keyboard shortcuts) delivering native-grade UX without traditional platform expertise.",
      "Implemented <b>10+ robust annotation tools</b> (pen, eraser, color picker, undo/redo stack, Bezier-based drawing) within a fullscreen layer, demonstrating deep DOM manipulation expertise.",
    ],
  },
  {
    org: "MernHub - Developer Learning Platform",
    location: "Open Source",
    role: "Lead Developer · Next.js · Express.js · MongoDB",
    date: "2026",
    bullets: [
      "Designed a scalable learning platform covering <b>50+ MERN stack topics and structured project roadmaps</b> using Next.js and Express.",
      "Built a modular content architecture engineered specifically for community-driven contributions and future scalability.",
    ],
  },
];

const skills = [
  { label: "Frontend", value: "React, Next.js, Vite, TailwindCSS, Redux Toolkit, Framer Motion, DnD Kit, React Router" },
  { label: "Backend", value: "Node.js, Express.js, REST API Design, WebSockets, Rate Limiting, Input Validation" },
  { label: "Database", value: "MongoDB, Mongoose (Schema Design, Indexing, Query Optimization, Aggregation)" },
  { label: "Cloud & CI/CD", value: "AWS (EC2, S3), GitHub Actions, Vercel, Render, Railway, Docker" },
  { label: "Security & Auth", value: "JWT, Role-Based Access Control (RBAC), Password Hashing (bcrypt), CAPTCHA Protection" },
  { label: "Testing & Tools", value: "Jest, Cypress, Postman, Git, Electron, OpenAI API, Prompt Engineering" },
  { label: "Languages", value: "JavaScript (ES6+), TypeScript, Python, C++" },
];

const achievements = [
  {
    title: "MERN Stack Web Development - Grade A+ (Distinction)",
    meta: "WsCube Tech, Jaipur · Feb 2026",
    desc: "Completed 6-month intensive MERN programme. Verifiable at wscubetech.com/verify-certificate (Reg: WS/2026/WSJP/54249).",
  },
  {
    title: "Responsive Magic Event - 1st Place (Winner)",
    meta: "WsCube Career School, Jaipur · Sep 2025",
    desc: "Ranked 1st in a live frontend challenge; recognized for responsive design execution and UI quality.",
  },
  {
    title: "Cascading Creativity Event - 1st Place (Winner)",
    meta: "WsCube Career School, Jaipur · Jun 2025",
    desc: "Won competitive CSS/design event; recognized for creative implementation and technical precision.",
  },
  {
    title: "Hack Nexus 2.0 - 24-Hour Hackathon",
    meta: "Arya College of Engineering · Apr 2025",
    desc: "Built and presented a functional product within a 24-hour constraint at an institutional hackathon.",
  },
  {
    title: "Artificial Intelligence Certification - Grade AB (Distinction)",
    meta: "IIT Patna & SBTE Bihar · 2023",
    desc: "Completed Basic & Advanced AI curriculum with Excellence grade - IIT Patna certified programme.",
  },
];

const sectionStyle = { marginBottom: "10px" };
const entryStyle = { marginBottom: "9px" };

export default function ResumePortfolio() {
  return (
    <div
      className="resume-print-shell"
      style={{
        background: "#c8c3bc",
        padding: "36px 0",
        minHeight: "100vh",
        fontFamily: "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap");

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          body {
            margin: 0;
            background: #fff !important;
          }

          .resume-print-shell {
            padding: 0 !important;
            background: #fff !important;
          }

          .resume-sheet {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div
        className="resume-sheet"
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          background: "#fff",
          padding: "40px 50px 48px",
          boxShadow: "0 10px 60px rgba(0,0,0,0.22)",
          fontSize: "10.2pt",
          color: "#111",
          lineHeight: "1.44",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "9px" }}>
          <h1
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "28pt",
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              color: "#0a0a0a",
            }}
          >
            Vivek Kumar
          </h1>
          <div
            style={{
              marginTop: "5px",
              fontSize: "9.2pt",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#3a3a3a",
            }}
          >
            Full Stack Engineer &nbsp;·&nbsp; Modern Web Applications &nbsp;·&nbsp; Scalable SaaS Systems
          </div>
          <div
            className="resume-contact"
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "7px",
              fontSize: "9.2pt",
              color: "#333",
            }}
          >
            {contactItems.map((item, index) => (
              <span
                key={item.label}
                style={{
                  padding: "0 8px",
                  lineHeight: 1,
                  borderRight: index < contactItems.length - 1 ? "1px solid #999" : "none",
                }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    style={{ color: "#111", textDecoration: "none" }}
                  >
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </div>
        </header>

        <RuleThick />
        <RuleThin />

        <section style={sectionStyle}>
          <SectionTitle>Professional Summary</SectionTitle>
          <RuleThin />
          <p style={{ fontSize: "10pt", color: "#1a1a1a", lineHeight: "1.52", textAlign: "justify", margin: "4px 0" }}>
            Full Stack Engineer specializing in building production-grade SaaS platforms, secure backend systems, and 
            scalable web applications from concept to deployment. Experienced in architecting complete business workflows, 
            designing modular APIs, implementing Role-Based Access Control (RBAC), and integrating complex payment gateways. 
            Leveraging a background in mechanical engineering and systems thinking to architect resilient, high-performance software solutions.
          </p>
        </section>

        <section style={sectionStyle}>
          <SectionTitle>Professional Experience</SectionTitle>
          <RuleThin />
          {professionalExperience.map((experience) => (
            <div key={experience.org} style={entryStyle}>
              <EntryHead org={experience.org} location={experience.location} />
              <EntryMeta role={experience.role} date={experience.date} />
              <Bullets items={experience.bullets} />
            </div>
          ))}
        </section>

        <section style={sectionStyle}>
          <SectionTitle>Technical Projects</SectionTitle>
          <RuleThin />
          {technicalProjects.map((project) => (
            <div key={project.org} style={entryStyle}>
              <EntryHead org={project.org} location={project.location} />
              <EntryMeta role={project.role} date={project.date} />
              <Bullets items={project.bullets} />
            </div>
          ))}
        </section>

        <section style={sectionStyle}>
          <SectionTitle>Technical Skills</SectionTitle>
          <RuleThin />
          <div className="resume-grid" style={{ display: "grid", gridTemplateColumns: "112px 1fr", rowGap: "3.5px", fontSize: "9.9pt" }}>
            {skills.map((skill) => (
              <React.Fragment key={skill.label}>
                <span style={{ fontWeight: 700, color: "#0a0a0a" }}>{skill.label}</span>
                <span style={{ color: "#1a1a1a" }}>{skill.value}</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionTitle>Education</SectionTitle>
          <RuleThin />
          <div style={{ marginBottom: "6px" }}>
            <EntryHead org="B.Tech - Computer Science & Engineering (Lateral Entry)" location="Jaipur, India" />
            <EntryMeta role="Arya College of Engineering · RTU, Rajasthan" date="2024 - Present" />
          </div>
          <div>
            <EntryHead org="Diploma - Mechanical Engineering" location="Saharsa, Bihar" />
            <EntryMeta role="Government Polytechnic Saharsa · Engineering Fundamentals & Systems Thinking" date="2020 - 2023" />
            <div style={{ fontSize: "9.8pt", color: "#333", marginTop: "1px" }}>CGPA: 8.2/10</div>
          </div>
        </section>

        <section style={sectionStyle}>
          <SectionTitle>Certifications & Achievements</SectionTitle>
          <RuleThin />
          {achievements.map((achievement) => (
            <AchievementEntry key={achievement.title} title={achievement.title} meta={achievement.meta} desc={achievement.desc} />
          ))}
        </section>
      </div>
    </div>
  );
}