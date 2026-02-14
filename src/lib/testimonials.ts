export interface Testimonial {
  text: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  office: string;
  logo: string;
  logoClass: string;
}

export const testimonials: Testimonial[] = [
  {
    text: "Der Service war beeindruckend, von der Auswahl der Spaces, die Kommunikation bis hin zu den Besichtigungen war alles top geplant und stets mega freundlich. Ich empfehle den Service definitiv weiter.",
    name: "Melissa Blume",
    role: "Head of HR",
    company: "Salesfive Consulting GmbH",
    avatar: "/testimonial-melissa.jpg",
    office: "/office-melissa.webp",
    logo: "/logo-salesfive.svg",
    logoClass: "max-h-8 max-w-28",
  },
  {
    text: "NextOffice hat uns dabei unterstützt, das für uns optimal passende Büro zu finden und uns bis zum Vertragsabschluss betreut. Der Service war immer kompetent und freundlich!",
    name: "Dr. Ralf Heublein",
    role: "CEO",
    company: "Mediapool Content Services GmbH",
    avatar: "/testimonial-ralf.jpg",
    office: "/office-heublein.webp",
    logo: "/logo-mediapool.png",
    logoClass: "max-h-10 max-w-32",
  },
  {
    text: "NextOffice hat uns dabei geholfen, ein geeignetes Büro zu finden. Uns hat die schnelle, professionelle und freundliche Beratung überzeugt und wir können den Service wärmstens empfehlen.",
    name: "Thomas Urban",
    role: "CEO",
    company: "KUMAVISION GmbH",
    avatar: "/testimonial-thomas.jpg",
    office: "/office-thomas.webp",
    logo: "/logo-kumavision.png",
    logoClass: "max-h-14 max-w-40",
  },
];
