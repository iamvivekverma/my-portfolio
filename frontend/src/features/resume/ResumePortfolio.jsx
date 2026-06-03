import React from "react";

const contactLinks = [
  { label: "+91 72096 40726" },
  { label: "iamvivek.verma@icloud.com", href: "mailto:iamvivek.verma@icloud.com" },
  { label: "whovivekverma.vercel.app", href: "https://whovivekverma.vercel.app" },
  { label: "linkedin.com/in/whovivekverma", href: "https://linkedin.com/in/whovivekverma" },
  { label: "github.com/iamvivekverma", href: "https://github.com/iamvivekverma" },
];

const experience = [
  {
    title: "Enterprise Portfolio Architecture & Headless CMS Engine",
    meta: "Production · Open Source",
    role: "Lead Systems Architect (React, Next.js, Node.js, Express, MongoDB, Framer Motion, DnD Kit)",
    dates: "2025 - Present",
    bullets: [
      "Designed and engineered a proprietary full-stack headless CMS from scratch, establishing central data ingestion for 7+ relational domains, successfully eliminating reliance on restrictive third-party content platforms.",
      "Hardened application security parameters by architecting a cryptographically sound dual-token security architecture (x-admin-secret / x-admin-token) combined with a zero-knowledge PIN verification matrix, successfully ensuring total isolation of proprietary client files and core infrastructure.",
      "Maximized runtime performance metrics, slashing Time-to-First-Byte (TTFB) by 40% and optimizing Lighthouse performance configurations to 98% via dynamic code-splitting, targeted tree-shaking, and multi-tier memory-caching layers.",
    ],
  },
  {
    title: "Savrig - Digital Product & SaaS Solutions Studio",
    meta: "Jaipur, India",
    role: "Founding Engineer & Technical Director (SaaS Architecture, Next.js, Cloud Infrastructure)",
    dates: "2026 - Present",
    bullets: [
      "Launched a technical engineering studio focused on delivering cloud-native applications, stateful SaaS tooling, and complex automation workflows for cross-industry SMB clients.",
      "Developed scalable Next.js consumer applications integrating optimized webhook listeners, server-side data synchronization engines, and granular SEO structures, expanding organic customer acquisition funnels for clients.",
      "Engineered a high-leverage development infrastructure utilizing automated generative AI compilation workflows, decreasing the standard Software Development Lifecycle (SDLC) by 35% while keeping quality control metrics immaculate.",
    ],
  },
  {
    title: "MediQ - Deep-Learning Intelligence & Healthcare Platform",
    meta: "Open Source",
    role: "Principal Engineer (Next.js, Node.js, MongoDB, OpenAI API Engine, WebSocket Protocols)",
    dates: "2026",
    bullets: [
      "Architected a production-grade AI-native healthcare ingestion system parsing complex symptoms and rare epidemiological disease vectors; leveraged fine-tuned LLM execution maps and guardrails to ensure clinically sound responses.",
      "Constructed a granular, 3-tier Role-Based Access Control (RBAC) safety mechanism protecting patient-doctor communications via asymmetric JWT encryption layers and server-side route guards.",
      "Engineered a real-time event pipeline using persistent WebSocket connections, reducing messaging delivery latency by 65% and successfully liquidating heavy database polling bottlenecks.",
    ],
  },
  {
    title: "Floatrec - Native Cross-Platform Screen Capture System",
    meta: "macOS · Windows",
    role: "Core Systems Engineer (Electron Core, Desktop Engine API, Native OS Bindings)",
    dates: "2026",
    bullets: [
      "Designed and built a hardware-accelerated desktop video overlay engine utilizing low-level Electron bindings, featuring absolute spatial memory window pinning, dynamic cross-axis transformation, and multi-threaded key-hook bindings.",
      "Developed a low-latency 2D canvas vector canvas layer supporting multi-color Bezier rendering, real-time bitmap manipulation, and continuous mutation stacks for instant frame annotations.",
    ],
  },
];

const expertise = [
  ["System Architectures", "React (Vite), Next.js (App Router), Node.js, Express, Electron, RESTful API Design"],
  ["State & Graphics", "Redux Toolkit, Context API, TailwindCSS, Framer Motion, DnD Kit, HTML5 Canvas API"],
  ["Data Infrastructure", "MongoDB, Mongoose (Aggregation Pipelines, Indexing Optimization), Redis Caching Layers"],
  ["Security & Networking", "Asymmetric JWT, Dual-Token Systems, RBAC Systems, WebSockets (WS/WSS), Rate Limiting Engine"],
  ["AI Integration", "OpenAI / Anthropic API Systems, Vector Processing, Advanced Context Engineering & Guardrails"],
  ["DevOps & Runtimes", "Git, GitHub Enterprise, Docker Containers, Postman Automation, Vercel Edge Networks"],
  ["Core Languages", "JavaScript (ES6+), TypeScript, Python, C++, HTML5/CSS3"],
];

const education = [
  {
    degree: "Bachelor of Technology (B.Tech) - Computer Science & Engineering",
    location: "Jaipur, Rajasthan",
    institution: "Arya College of Engineering (RTU) · Specialization in Artificial Intelligence & Machine Learning",
    dates: "2024 - Present",
  },
  {
    degree: "Engineering Diploma - Mechanical Engineering Graduate",
    location: "Saharsa, Bihar",
    institution: "Government Polytechnic Institute · Focus on Complex Systems Thinking & Structural Analysis",
    dates: "2020 - 2023",
  },
];

const credentials = [
  {
    title: "Advanced MERN Architecture Certification - Grade A+ Distinction",
    meta: "WsCube Tech · 2026",
    desc: "Completed multi-month deep-dive into full-stack backend concurrency, database mapping optimization, and high-performance React design patterns. Verified credential ID: WS/2026/WSJP/54249.",
  },
  {
    title: "Live Architecture Challenge: Responsive Magic - 1st Place Winner",
    meta: "WsCube Tech Base · 2025",
    desc: "Awarded top ranking out of large field of engineers for building production-grade adaptive layouts under restrictive real-time timelines using strict CSS layout trees and responsive viewport calculations.",
  },
  {
    title: "UI Engineering Competition: Cascading Creativity - 1st Place Winner",
    meta: "WsCube Career School · 2025",
    desc: "Recognized for creative excellence and math-heavy animation architectures built purely using clean stylesheets and zero-overhead performance strategies.",
  },
  {
    title: "Advanced Artificial Intelligence Track - Distinction Award",
    meta: "IIT Patna & SBTE Bihar",
    desc: "Graduated with top marks from intensive institutional curriculum covering baseline neural layers, optimization algorithms, and modern deep-learning models.",
  },
];

const pageStyle = {
  width: "794px",
  minHeight: "1123px",
  margin: "0 auto",
  background: "#ffffff",
  padding: "40px 50px 48px",
  boxShadow: "0 10px 60px rgba(0,0,0,0.22)",
  fontFamily: "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif",
  fontSize: "10.2pt",
  color: "#111111",
  lineHeight: "1.44",
  WebkitFontSmoothing: "antialiased",
};

const sectionTitleStyle = {
  fontFamily: "'EB Garamond', Georgia, serif",
  fontSize: "11pt",
  fontWeight: "700",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#0a0a0a",
  marginBottom: "1px",
};

const ruleStyle = { border: "none", borderTop: "1px solid #bbbbbb", margin: "4px 0 8px" };

function SectionTitle({ children }) {
  return (
    <>
      <div style={sectionTitleStyle}>{children}</div>
      <hr style={ruleStyle} />
    </>
  );
}

function HeaderRow({ left, right, leftStyle = {}, rightStyle = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <span style={leftStyle}>{left}</span>
      <span style={{ fontSize: "9.2pt", color: "#444444", whiteSpace: "nowrap", flexShrink: 0, ...rightStyle }}>
        {right}
      </span>
    </div>
  );
}

function BulletList({ bullets }) {
  return (
    <ul style={{ listStyle: "none", padding: "0", marginTop: "3.5px" }}>
      {bullets.map((bullet) => (
        <li
          key={bullet}
          style={{
            position: "relative",
            paddingLeft: "13px",
            fontSize: "9.9pt",
            lineHeight: "1.46",
            marginBottom: "2.5px",
            color: "#151515",
          }}
        >
          <span style={{ position: "absolute", left: "1px", top: "0", fontSize: "10pt", color: "#111111", lineHeight: "1.46" }}>
            •
          </span>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

export default function ResumePortfolio() {
  return (
    <div className="resume-premium-shell" style={{ background: "#c8c3bc", padding: "36px 0", minHeight: "100vh" }}>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=EB+Garamond:wght@700&family=Source+Sans+3:wght@400;600;700&display=swap");

          @media (max-width: 840px) {
            .resume-premium-page {
              width: min(100% - 24px, 794px) !important;
              padding: 32px 24px 38px !important;
            }

            .resume-premium-contact {
              row-gap: 6px !important;
            }

            .resume-premium-contact span {
              border-right: 0 !important;
              line-height: 1.25 !important;
            }

            .resume-premium-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div className="resume-premium-page" style={pageStyle}>
        <header style={{ textAlign: "center", marginBottom: "9px" }}>
          <h1
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "28pt",
              fontWeight: "700",
              letterSpacing: "0.02em",
              lineHeight: "1",
              color: "#0a0a0a",
            }}
          >
            Vivek Kumar
          </h1>
          <div
            style={{
              marginTop: "5px",
              fontSize: "9.2pt",
              fontWeight: "700",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#3a3a3a",
            }}
          >
            Senior Full Stack Engineer &nbsp;·&nbsp; Enterprise Solutions Architect
          </div>

          <div
            className="resume-premium-contact"
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "7px",
              fontSize: "9.2pt",
              color: "#333333",
            }}
          >
            {contactLinks.map((item, index) => (
              <span
                key={item.label}
                style={{
                  padding: "0 8px",
                  borderRight: index === contactLinks.length - 1 ? "none" : "1px solid #999999",
                  lineHeight: "1",
                }}
              >
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ color: "#111111", textDecoration: "none" }}>
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </div>
          <div style={{ fontSize: "9.2pt", color: "#444444", marginTop: "4px" }}>Jaipur, Rajasthan, India</div>
        </header>

        <hr style={{ border: "none", borderTop: "2px solid #111111", margin: "9px 0 0" }} />
        <hr style={ruleStyle} />

        <section style={{ marginBottom: "10px" }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ fontSize: "10pt", color: "#1a1a1a", lineHeight: "1.52", textAlign: "justify" }}>
            Performance-driven Senior Full Stack Engineer with a definitive track record of architecting, scaling, and deploying secure, production-grade enterprise software systems and AI-native applications. Expert in optimizing the MERN stack and Next.js ecosystems for high-throughput workloads, implementing robust distributed architectures, complex multi-tier authentication matrices, and real-time synchronization systems. Combines rigorous computer science fundamentals with advanced AI-augmented engineering paradigms to slash product development lifecycles by up to 40% while engineering resilient, high-availability web products.
          </p>
        </section>

        <section style={{ marginBottom: "10px" }}>
          <SectionTitle>Technical Experience</SectionTitle>
          {experience.map((item) => (
            <div key={item.title} style={{ marginBottom: "9px" }}>
              <HeaderRow
                left={item.title}
                right={item.meta}
                leftStyle={{ fontWeight: "700", fontSize: "10.5pt", color: "#0a0a0a" }}
              />
              <HeaderRow
                left={item.role}
                right={item.dates}
                leftStyle={{ fontStyle: "italic", fontSize: "9.8pt", color: "#2a2a2a" }}
              />
              <BulletList bullets={item.bullets} />
            </div>
          ))}
        </section>

        <section style={{ marginBottom: "10px" }}>
          <SectionTitle>Core Technical Expertise</SectionTitle>
          <div className="resume-premium-grid" style={{ display: "grid", gridTemplateColumns: "125px 1fr", rowGap: "3.5px", fontSize: "9.9pt" }}>
            {expertise.map(([label, value]) => (
              <React.Fragment key={label}>
                <span style={{ fontWeight: "700", color: "#0a0a0a" }}>{label}</span>
                <span style={{ color: "#1a1a1a" }}>{value}</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "10px" }}>
          <SectionTitle>Academic Foundations</SectionTitle>
          {education.map((item) => (
            <div key={item.degree} style={{ marginBottom: "6px" }}>
              <HeaderRow
                left={item.degree}
                right={item.location}
                leftStyle={{ fontWeight: "700", fontSize: "10.5pt", color: "#0a0a0a" }}
              />
              <HeaderRow
                left={item.institution}
                right={item.dates}
                leftStyle={{ fontStyle: "italic", fontSize: "9.8pt", color: "#2a2a2a" }}
              />
            </div>
          ))}
        </section>

        <section style={{ marginBottom: "5px" }}>
          <SectionTitle>Technical Credentials & Honors</SectionTitle>
          {credentials.map((item) => (
            <div key={item.title} style={{ marginBottom: "5px" }}>
              <HeaderRow
                left={item.title}
                right={item.meta}
                leftStyle={{ fontWeight: "700", fontSize: "10.2pt" }}
              />
              <div style={{ fontSize: "9.8pt", color: "#333333", marginTop: "1px" }}>{item.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
