/**
 * Core Resume Data Model
 * Structured data that drives both the UI and LaTeX generation
 */

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeHeader {
  name: string;
  phone: string;
  email: string;
  links: ResumeLink[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface SkillsEntry {
  id: string;
  category: string;
  skills: string[];
}

export interface CustomEntry {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export type SectionType =
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "custom";

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  entries: (
    | ExperienceEntry
    | EducationEntry
    | ProjectEntry
    | SkillsEntry
    | CustomEntry
  )[];
}

export interface Resume {
  header: ResumeHeader;
  sections: ResumeSection[];
}

export const createDefaultResume = (): Resume => ({
  header: {
    name: "Sarvesh Patil",
    phone: "+918483900303",
    email: "sarveshp273@gmail.com",
    links: [
      { label: "Portfolio Website", url: "portfolio-website-url.com" },
      { label: "LinkedIn", url: "linkedin.com/in/yourprofile" },
      { label: "GitHub", url: "github.com/yourusername" },
    ],
  },
  sections: [
    {
      id: "experience-1",
      type: "experience",
      title: "EXPERIENCE",
      entries: [
        {
          id: "exp-1",
          company: "Truboard Credit Monitoring Services Pvt. Ltd.",
          role: "Software Engineer",
          location: "Mumbai",
          startDate: "2023-06",
          endDate: "Present",
          bullets: [
            "Spearheaded the development of SSR-capable dashboards using Next.js, improving load time by 35% and increasing user engagement by 18%.",
            "Implemented modular micro-frontend architectures for 3+ enterprise scale applications, enhancing scalability and team collaboration across diverse product lines.",
            "Architected and optimised backend systems using Node.js and Django, encompassing comprehensive database design, efficient CRUD operations, and extensive API integration for diverse project deployments.",
            "Led a development team for multiple projects, overseeing project execution from conception to deployment, ensuring features were delivered on time and met stringent quality standards.",
          ],
        },
        {
          id: "exp-2",
          company: "Neosoft Technologies Pvt Ltd.",
          role: "Software Engineer",
          location: "Pune",
          startDate: "2022-01",
          endDate: "2023-03",
          bullets: [
            "Elevated user experience across client-side products by independently building and maintaining key features using React and Redux, integrated with REST APIs.",
            "Drove a 30% reduction in web application defects by building and implementing a robust automated end-to-end test suite with Cypress, significantly boosting software reliability.",
            "Reviewed code and conducted static analysis to pinpoint and resolve security vulnerabilities and performance bottlenecks, leading to more secure and efficient applications.",
            "Implemented PostgreSQL database optimisations reducing API latency by 25% for critical data operations.",
          ],
        },
        {
          id: "exp-3",
          company: "Freelancer",
          role: "Full Stack Developer",
          location: "Mumbai",
          startDate: "2021-07",
          endDate: "2022-04",
          bullets: [
            "Pioneered web applications featuring immersive user experiences, leveraging Three.js for interactive 3D animations and Framer Motion for fluid, performant UI interactions.",
            "Developed end-to-end full-stack solutions for diverse clients, encompassing custom frontend development with React.js and Next.js, alongside robust backend APIs using Node.js and Python.",
            "Orchestrated seamless data migration from databases to cloud-based PostgreSQL, resulting in zero data loss and slashing infrastructure costs by 20% via optimized resource allocation.",
            "Implemented secure user authentication and authorisation systems, protecting sensitive data and enhancing application reliability.",
          ],
        },
        {
          id: "exp-4",
          company: "Excursify Inc - Travel & Leisure",
          role: "Web Developer",
          location: "Delhi",
          startDate: "2019-12",
          endDate: "2021-04",
          bullets: [
            "Successfully migrated a legacy Angular application to a scalable React.js framework, improving application performance by 15% and significantly enhancing maintainability.",
            "Created five custom DOM directives, increasing the modularity and reusability of frontend components across various sections of the web platform.",
            "Collaborated on the implementation of new user-facing features for a travel platform, directly contributing to an improved user interface and engagement.",
          ],
        },
      ],
    },
    {
      id: "education-1",
      type: "education",
      title: "EDUCATION",
      entries: [
        {
          id: "edu-1",
          institution: "Mumbai University",
          degree: "B.Tech, Computer Science",
          location: "Mumbai",
          startDate: "2015-08",
          endDate: "2019-05",
          details: [
            "Achieved a strong academic record with a GPA of 8.3. Focused on core computer science principles, including algorithms, data structures, and software engineering.",
          ],
        },
      ],
    },
    {
      id: "awards-1",
      type: "custom",
      title: "AWARDS",
      entries: [
        {
          id: "award-1",
          title: "Global Assessment of Information Technology - Bronze",
          subtitle: "Verified Credential",
          location: "",
          startDate: "",
          endDate: "2021-01",
          bullets: [],
        },
        {
          id: "award-2",
          title: "Smart India Hackathon 2020 Finalist",
          subtitle:
            "Led my college in the finals of the Smart India Hackathon (SIH) 2020, a national-level hackathon where we worked on the problem statement of Adani Ports & SEZ, a leading port management company in India, to improve the Turn Around Time (TAT) of ships and containers, eventually improving the port operation efficiency by 15% and were awarded with second prize.",
          location: "Delhi",
          startDate: "",
          endDate: "2020-08",
          bullets: [
            "Certificate for SIH 2020, organized by Ministry of Human Resources",
          ],
        },
      ],
    },
    {
      id: "certifications-1",
      type: "custom",
      title: "CERTIFICATIONS",
      entries: [
        {
          id: "cert-1",
          title: "React Specialisation - Full-Stack Web Development with React",
          subtitle: "by The Hong Kong University of Science and Technology",
          location: "",
          startDate: "",
          endDate: "",
          bullets: ["Verified Credential"],
        },
        {
          id: "cert-2",
          title: "Python Specialisation - Python for Everybody",
          subtitle: "by University of Michigan",
          location: "",
          startDate: "",
          endDate: "2019-06",
          bullets: ["Verified Credential"],
        },
      ],
    },
    {
      id: "skills-1",
      type: "skills",
      title: "TECHNICAL SKILLS",
      entries: [
        {
          id: "skill-1",
          category: "Languages",
          skills: ["Python", "JavaScript", "SQL"],
        },
        {
          id: "skill-2",
          category: "Frameworks & Libraries",
          skills: [
            "React",
            "Next.js",
            "Node.js",
            "Django",
            "Redux",
            "Angular",
            "Three.js",
            "Framer Motion",
          ],
        },
        {
          id: "skill-3",
          category: "Developer Tools",
          skills: ["Git", "Docker", "Redis", "Cypress"],
        },
        {
          id: "skill-4",
          category: "Databases",
          skills: ["PostgreSQL"],
        },
      ],
    },
  ],
});
