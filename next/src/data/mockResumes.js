// Mock resume texts keyed by simulated filename
// In production, these would be extracted from actual uploaded PDFs

export const mockResumeTexts = {
    'resume_ankit_sharma.pdf': `
ANKIT SHARMA
Email: ankit.sharma@email.com | Phone: +91-9876543210
LinkedIn: linkedin.com/in/ankitsharma | GitHub: github.com/ankitsharma

EDUCATION
B.Tech in Computer Science — IIT Delhi (2022-2026) | CGPA: 8.7/10

EXPERIENCE
Software Engineering Intern — Google (May 2025 - Aug 2025)
• Built a real-time data pipeline using Apache Beam and Google Cloud Dataflow
• Optimized query performance on BigQuery, reducing latency by 40%
• Developed internal dashboards using React and TypeScript

Open Source Contributor — TensorFlow (2024-present)
• Contributed 5 PRs to TensorFlow documentation and testing utilities
• Fixed memory leak bug in tf.data pipeline (merged)

PROJECTS
Smart Campus App (React Native, Firebase, Node.js)
• Built a campus management app with 2000+ active users
• Implemented push notifications, event scheduling, and mess menu features

Algorithm Visualizer (React, D3.js, TypeScript)
• Interactive web app visualizing 15+ sorting and graph algorithms
• 500+ GitHub stars, featured on Hacker News

SKILLS
Languages: Python, JavaScript, TypeScript, C++, Java, Go
Frontend: React, Next.js, React Native, Tailwind CSS
Backend: Node.js, Express, Django, Flask
Cloud: Google Cloud Platform, AWS (S3, Lambda), Docker, Kubernetes
Data: BigQuery, PostgreSQL, MongoDB, Apache Beam
Other: System Design, Data Structures & Algorithms (Codeforces Expert 1700+)

ACHIEVEMENTS
• Google Summer of Code 2024 participant
• ICPC Asia Regionalist (2024)
• 500+ problems solved on LeetCode
`,

    'resume_priya_verma.pdf': `
PRIYA VERMA
Email: priya.verma@email.com | Phone: +91-9123456780
Portfolio: priyaverma.dev | GitHub: github.com/priyaverma

EDUCATION
B.Tech in Computer Science — NIT Trichy (2022-2026) | CGPA: 9.1/10

EXPERIENCE
Frontend Engineering Intern — Microsoft (Jun 2025 - Aug 2025)
• Developed accessible UI components for Microsoft Teams using React and Fluent UI
• Implemented WCAG 2.1 AA compliance across 3 product surfaces
• Wrote comprehensive unit tests achieving 94% code coverage

Research Intern — IISc Bangalore (Jan 2025 - Apr 2025)
• Published paper on "Attention Mechanisms in Vision Transformers" at CVPR Workshop
• Implemented custom PyTorch models for image classification

PROJECTS
E-Commerce Platform (Next.js, Stripe, PostgreSQL)
• Full-stack e-commerce site with payment integration, admin dashboard
• Deployed on Vercel with CI/CD pipeline

Women in Tech Blog (Gatsby, GraphQL, Contentful)
• Technical blog platform with 50+ published articles
• SEO optimized, achieving top 3 Google rankings for targeted keywords

SKILLS
Languages: JavaScript, TypeScript, Python, C++
Frontend: React, Next.js, Vue.js, Tailwind CSS, Figma, Accessibility (WCAG)
Backend: Node.js, Express, GraphQL
Database: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, Vercel, Azure DevOps, Jest, Cypress
ML: PyTorch, TensorFlow, Computer Vision

ACHIEVEMENTS
• Microsoft Engage Mentee 2024
• Grace Hopper Celebration Scholar 2024
• 1st Place - HackMIT 2024
`,

    'resume_rahul_gupta.pdf': `
RAHUL GUPTA
Email: rahul.gupta@email.com | Phone: +91-9988776655
GitHub: github.com/rahulgupta

EDUCATION
B.Tech in Information Technology — BITS Pilani (2022-2026) | CGPA: 7.8/10

EXPERIENCE
Backend Engineering Intern — Razorpay (May 2025 - Jul 2025)
• Developed payment webhook processing system handling 10K+ events/min
• Built microservices using Go and gRPC with Protocol Buffers
• Implemented rate limiting and circuit breaker patterns

Campus Ambassador — AWS (2024)
• Organized 3 cloud computing workshops for 200+ students

PROJECTS
Distributed Key-Value Store (Go, Raft Consensus)
• Implemented a fault-tolerant distributed KV store using Raft consensus algorithm
• Supports linearizable reads and consistent hashing for sharding

Real-time Chat Application (Node.js, Socket.io, Redis)
• WebSocket-based chat app supporting 500+ concurrent users
• Message persistence with Redis pub/sub for horizontal scaling

SKILLS
Languages: Go, Java, Python, JavaScript, C++
Backend: Go (Gin, Echo), Node.js, Spring Boot, gRPC, REST APIs
Database: PostgreSQL, MySQL, Redis, MongoDB, DynamoDB
DevOps: Docker, Kubernetes, Terraform, Jenkins, GitHub Actions
Cloud: AWS (EC2, S3, Lambda, SQS, DynamoDB), GCP
Other: Distributed Systems, Microservices, System Design, Kafka

ACHIEVEMENTS
• AWS Certified Solutions Architect - Associate
• Completed MIT 6.824 Distributed Systems course
• 400+ LeetCode problems solved
`,

    'resume_sneha_reddy.pdf': `
SNEHA REDDY
Email: sneha.reddy@email.com | Phone: +91-9876123450
LinkedIn: linkedin.com/in/snehareddy

EDUCATION
B.Tech in Computer Science — IIIT Hyderabad (2022-2026) | CGPA: 9.3/10

EXPERIENCE
Data Science Intern — Amazon (Jun 2025 - Aug 2025)
• Built demand forecasting model using XGBoost, improving accuracy by 18%
• Created automated reporting pipeline with Apache Airflow and Redshift
• A/B testing framework for recommendation engine optimization

Research Assistant — IIIT Hyderabad ML Lab (2024-present)
• Working on NLP project for low-resource Indian language translation
• Fine-tuned LLaMA-2 for Hindi-English code-switching detection

PROJECTS
Stock Price Predictor (Python, LSTM, Streamlit)
• Deep learning model for stock price prediction with 87% directional accuracy
• Interactive Streamlit dashboard for real-time predictions

Sentiment Analysis Pipeline (Python, HuggingFace, FastAPI)
• NLP pipeline analyzing 100K+ product reviews
• Deployed as REST API with FastAPI, containerized with Docker

SKILLS
Languages: Python, R, SQL, JavaScript, C++
ML/AI: TensorFlow, PyTorch, Scikit-learn, HuggingFace, XGBoost, LLMs
Data: Pandas, NumPy, Apache Spark, Airflow, Redshift, BigQuery
Visualization: Matplotlib, Seaborn, Plotly, Tableau, Streamlit
Backend: FastAPI, Flask, Django
Cloud: AWS (SageMaker, S3, Redshift), GCP (Vertex AI)

ACHIEVEMENTS
• Kaggle Competitions Expert (top 5% globally)
• Published at ACL Workshop 2025
• Amazon ML Summer School 2024
`,

    'resume_vikram_singh.pdf': `
VIKRAM SINGH
Email: vikram.singh@email.com | Phone: +91-9012345678
GitHub: github.com/vikramsingh

EDUCATION
B.Tech in Computer Science — DTU Delhi (2022-2026) | CGPA: 8.2/10

EXPERIENCE
Mobile Development Intern — Flipkart (May 2025 - Jul 2025)
• Developed features for Flipkart's React Native app (50M+ installs)
• Implemented lazy loading and image optimization, reducing load time by 30%
• Built A/B testing framework for UI experiments

Freelance Developer (2023-present)
• Built 5 mobile apps for clients using React Native and Flutter
• Published 3 apps on Google Play Store with 15K+ combined downloads

PROJECTS
Fitness Tracker (React Native, Firebase, HealthKit)
• Cross-platform fitness app with workout tracking and social features
• Integration with Apple HealthKit and Google Fit APIs

Food Delivery Clone (Flutter, Dart, Firebase, Google Maps API)
• Full-featured food delivery app with real-time order tracking
• Payment integration with Razorpay SDK

SKILLS
Languages: JavaScript, TypeScript, Dart, Python, Java, Kotlin
Mobile: React Native, Flutter, SwiftUI (basic), Android (Kotlin)
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, Express, Firebase, Supabase
Database: Firestore, PostgreSQL, SQLite, Realm
Tools: Git, Fastlane, CodePush, Firebase Analytics, Figma

ACHIEVEMENTS
• Published 3 apps on Google Play Store
• Flipkart GRiD 5.0 finalist
• 300+ LeetCode problems solved
`,

    'resume_deepika_jain.pdf': `
DEEPIKA JAIN
Email: deepika.jain@email.com | Phone: +91-9876012345
Portfolio: deepikajain.design | GitHub: github.com/deepikajain

EDUCATION
B.Des + B.Tech (dual degree) in Design & CS — IIT Bombay (2022-2027) | CGPA: 8.9/10

EXPERIENCE
UX Engineering Intern — Adobe (Jun 2025 - Aug 2025)
• Designed and built interactive prototypes for Adobe Express
• Created a design system component library with 40+ React components
• Conducted user research with 50+ participants, improving task completion by 25%

UI/UX Design Intern — Swiggy (Jan 2025 - Mar 2025)
• Redesigned checkout flow, increasing conversion rate by 12%
• Created high-fidelity prototypes in Figma with micro-interactions

PROJECTS
Design System (React, Storybook, TypeScript)
• Comprehensive design system with 60+ accessible components
• Full Storybook documentation with interactive examples

Portfolio Website (Next.js, Three.js, Framer Motion)
• Award-winning portfolio with 3D animations and smooth transitions
• Featured on Awwwards and CSS Design Awards

SKILLS
Languages: JavaScript, TypeScript, Python, HTML/CSS
Frontend: React, Next.js, Svelte, Tailwind CSS, Framer Motion, Three.js
Design: Figma, Adobe XD, Sketch, Illustrator, After Effects
Backend: Node.js, Express (basic), Supabase
Testing: Jest, React Testing Library, Storybook
Other: Design Systems, User Research, Accessibility, Responsive Design

ACHIEVEMENTS
• Awwwards Honorable Mention 2025
• Adobe Creative Jam Winner 2024
• Google UX Design Certificate
`,

    'resume_arjun_nair.pdf': `
ARJUN NAIR
Email: arjun.nair@email.com | Phone: +91-9234567890
GitHub: github.com/arjunnair

EDUCATION
B.Tech in Computer Science — VIT Vellore (2022-2026) | CGPA: 8.5/10

EXPERIENCE
DevOps Engineering Intern — Atlassian (May 2025 - Jul 2025)
• Managed CI/CD pipelines for 20+ microservices using Jenkins and ArgoCD
• Implemented infrastructure-as-code with Terraform on AWS
• Set up monitoring and alerting with Prometheus and Grafana

Cloud Engineering Intern — TCS (Jan 2025 - Apr 2025)
• Migrated legacy applications to AWS ECS with Docker containers
• Wrote Ansible playbooks for server configuration automation

PROJECTS
Kubernetes Auto-scaler (Go, Kubernetes, Prometheus)
• Custom Horizontal Pod Autoscaler based on application-specific metrics
• Integrated with Prometheus for real-time metric collection

GitOps Pipeline (ArgoCD, Helm, Terraform)
• End-to-end GitOps pipeline for multi-environment deployments
• Automated rollbacks and canary deployments

SKILLS
Languages: Python, Go, Bash, JavaScript, Java
DevOps: Docker, Kubernetes, Terraform, Ansible, Jenkins, ArgoCD
Cloud: AWS (EC2, ECS, Lambda, RDS, CloudFormation), GCP, Azure
Monitoring: Prometheus, Grafana, ELK Stack, Datadog
CI/CD: GitHub Actions, Jenkins, CircleCI, GitLab CI
Other: Linux, Networking, Security, Helm, Istio

ACHIEVEMENTS
• AWS Certified Solutions Architect - Associate
• Kubernetes Administrator (CKA) Certified
• HashiCorp Terraform Associate Certified
`,

    'resume_kavya_menon.pdf': `
KAVYA MENON
Email: kavya.menon@email.com | Phone: +91-9345678901
GitHub: github.com/kavyamenon

EDUCATION
B.Tech in Computer Science — NSUT Delhi (2022-2026) | CGPA: 7.5/10

EXPERIENCE
Software Engineering Intern — Zoho (Jun 2025 - Aug 2025)
• Developed CRM module features using Java and Spring Boot
• Implemented RESTful APIs with pagination and caching (Redis)
• Wrote integration tests improving coverage from 60% to 85%

PROJECTS
Library Management System (Java, Spring Boot, MySQL, React)
• Full-stack CRUD application with role-based access control
• REST API documentation with Swagger/OpenAPI

Personal Blog Platform (Django, PostgreSQL, Bootstrap)
• Blog with user authentication, comments, and markdown support
• Deployed on DigitalOcean with Nginx reverse proxy

SKILLS
Languages: Java, Python, JavaScript, C++, SQL
Backend: Java (Spring Boot), Django, Flask, Node.js, REST APIs
Frontend: React (basic), HTML/CSS, Bootstrap
Database: MySQL, PostgreSQL, MongoDB, Redis
Tools: Git, Docker, Maven, Postman, Swagger
Other: Data Structures & Algorithms, OOP, SOLID principles

ACHIEVEMENTS
• Smart India Hackathon 2024 finalist
• 250+ LeetCode problems solved
• TCS CodeVita Round 2 qualifier
`,
};
