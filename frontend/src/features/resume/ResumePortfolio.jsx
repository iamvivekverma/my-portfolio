const sidebarSections = [
  {
    title: 'Education',
    items: [
      {
        heading: 'B.Tech - Computer Science',
        body: ['Arya College of Engineering', 'RTU, Rajasthan (Lateral Entry)'],
        meta: '2024 - Present',
        note: 'Focus: Artificial Intelligence & Machine Learning',
      },
      {
        heading: 'Diploma - Mechanical Eng.',
        body: ['Government Polytechnic Saharsa'],
        meta: '2020 - 2023',
      },
    ],
  },
  {
    title: 'Technical Skills',
    items: [
      {
        label: 'Frontend & UI',
        body: ['React, Next.js, TailwindCSS, Redux Toolkit, Framer Motion, Glassmorphism UI'],
      },
      {
        label: 'Backend & Data',
        body: ['Node.js, Express.js, MongoDB, REST APIs'],
      },
      {
        label: 'Tools & AI',
        body: ['Git, GitHub, Postman, Docker, OpenAI API Integration'],
      },
    ],
  },
  {
    title: 'Core Strengths',
    items: [
      {
        label: 'Engineering & Design:',
        body: ['Interactive physics-based UI, minimalist aesthetics, production scale'],
      },
      {
        label: 'Technical Rigor:',
        body: ['System design, algorithm optimization, rapid technology adoption'],
      },
      {
        label: 'Project Leadership:',
        body: ['End-to-end architecture, cross-functional vision'],
      },
    ],
  },
  {
    title: 'Languages',
    items: [
      { body: ['Hindi: Native Fluency'] },
      { body: ['English: Professional'] },
    ],
  },
];

const projects = [
  {
    name: 'Savrig',
    meta: 'Jaipur, India',
    role: 'Founder & Developer | Software & Web Solutions',
    bullets: [
      'Built Savrig as a founder-led brand for websites, SaaS products, and business tools.',
      'Developed a responsive Next.js website with services, product pages, and contact flow.',
      'Created clear brand messaging around clean design and reliable engineering.',
    ],
  },
  {
    name: 'MernHub',
    meta: 'Open Source',
    role: 'Next.js • Express.js • MongoDB',
    bullets: [
      'Built a developer learning platform focused on MERN stack concepts, practical guides, and real-world project practice.',
      'Designed structured learning modules with clean documentation, topic-wise navigation, and beginner-friendly explanations.',
      'Created a scalable full-stack foundation to support tutorials, project modules, and future interactive learning features.',
    ],
  },
  {
    name: 'MediQ',
    meta: 'Open Source',
    role: 'Next.js • Express.js • MongoDB • OpenAI API • WebSockets',
    bullets: [
      'Built an AI-powered healthcare platform for symptom analysis, medical queries, and rare disease awareness.',
      'Developed role-based dashboards for patients, doctors, and admins with secure access control.',
      'Added real-time Q&A and doctor directory updates using WebSockets for faster user interaction.',
    ],
  },
  {
    name: 'Floatrec',
    meta: 'macOS & Windows',
    role: 'Founder & Developer | Native Camera Overlay App for Screen Recording',
    bullets: [
      'Built a native macOS facecam overlay using SwiftUI and AVFoundation with an always-on-top transparent camera window.',
      'Added drag/resize, locked 1:1 aspect ratio, circle/square modes, adjustable corner radius, horizontal/vertical flip, and Space shortcut start/stop.',
      'Implemented a polished fullscreen annotation layer with a native-feeling floating toolbox, cursor/pen/eraser tools, color picker, pen-width control, smooth Bezier strokes, undo, clear all, and thread-safe camera session handling.',
    ],
  },
];

const achievements = [
  {
    title: 'Responsive Magic Event - 1st Position',
    source: 'WsCube Career School, Jaipur • Sep 2025',
    tag: 'Winner',
  },
  {
    title: 'Cascading Creativity Event - 1st Position',
    source: 'WsCube Career School, Jaipur • Jun 2025',
    tag: 'Winner',
  },
  {
    title: 'Artificial Intelligence Certification',
    source: 'IIT Patna & SBTE Bihar • 2023',
    detail: 'Basic & Advanced AI (Grade AB)',
    tag: 'Excellence',
  },
  {
    title: 'Hack Nexus 2.0 - 24h Hackathon',
    source: 'Arya College of Engineering • Apr 2025',
  },
];

function SectionTitle({ children }) {
  return (
    <h2 className="resume-section-title">
      {children}
    </h2>
  );
}

function SidebarSection({ section }) {
  return (
    <section className="resume-sidebar-section">
      <SectionTitle>{section.title}</SectionTitle>
      <div className="space-y-4">
        {section.items.map((item, index) => (
          <div key={`${section.title}-${index}`} className="resume-sidebar-item">
            {item.label && <p className="resume-label">{item.label}</p>}
            {item.heading && <h3>{item.heading}</h3>}
            {item.body?.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {item.meta && <p className="resume-muted italic">{item.meta}</p>}
            {item.note && <p className="resume-muted italic">{item.note}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectItem({ project }) {
  return (
    <article className="resume-project">
      <div className="resume-project-heading">
        <h3>{project.name}</h3>
        <span>{project.meta}</span>
      </div>
      <p className="resume-project-role">{project.role}</p>
      <ul>
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ResumePortfolio() {
  return (
    <main className="resume-page">
      <article className="resume-document">
        <header className="resume-hero">
          <div>
            <h1>
              <span>Vivek</span> Kumar
            </h1>
            <p>Full Stack Developer & Engineer</p>
          </div>
          <address>
            <strong>+91 72096 40726</strong>
            <a href="mailto:iamvivek.verma@icloud.com">iamvivek.verma@icloud.com</a>
            <a href="https://whovivekverma.vercel.app" target="_blank" rel="noreferrer">
              whovivekverma.vercel.app
            </a>
            <span>Jaipur, Rajasthan</span>
          </address>
        </header>

        <div className="resume-body">
          <aside className="resume-sidebar">
            {sidebarSections.map((section) => (
              <SidebarSection key={section.title} section={section} />
            ))}
          </aside>

          <div className="resume-main">
            <section>
              <SectionTitle>Professional Summary</SectionTitle>
              <p className="resume-summary">
                Full Stack Developer and Engineer with demonstrated expertise in shipping
                <strong> production-grade MERN applications</strong>. I combine robust backend
                systems-thinking with a highly trained eye for premium, minimalist web aesthetics
                to build seamless digital experiences.
              </p>
              <div className="resume-callout">
                <strong>Technical Vision:</strong> Proven track record of building and deploying
                complex ecosystems, from AI-driven healthcare platforms to NDA-protected enterprise
                e-commerce solutions.
              </div>
            </section>

            <section>
              <SectionTitle>Key Projects</SectionTitle>
              <div>
                {projects.map((project) => (
                  <ProjectItem key={project.name} project={project} />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Certifications & Achievements</SectionTitle>
              <div className="resume-achievements">
                {achievements.map((achievement) => (
                  <article key={achievement.title} className="resume-achievement">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.source}</p>
                    {achievement.detail && <p>{achievement.detail}</p>}
                    {achievement.tag && <strong>{achievement.tag}</strong>}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="resume-footer">
          <div>
            <h2>Vivek Kumar</h2>
            <p>Full Stack Developer</p>
          </div>
          <span />
          <div>
            <p>Jaipur, Rajasthan, India</p>
            <strong>Open to Opportunities</strong>
          </div>
        </footer>
      </article>
    </main>
  );
}
