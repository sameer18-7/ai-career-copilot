"""
Role Knowledge Base
====================
Maps job roles/categories to expected skills, tools, and keywords.

This serves as structured domain knowledge that the ML system uses for:
  - Suggested keyword generation
  - Role-resume similarity scoring
  - ATS sub-score computation

The knowledge base is editable and expandable.
"""

# ---------------------------------------------------------------------------
# Category-to-role mapping (maps our 24 dataset categories to user-facing roles)
# ---------------------------------------------------------------------------

CATEGORY_TO_ROLES: dict[str, list[str]] = {
    "INFORMATION-TECHNOLOGY": [
        "Software Engineer", "Backend Developer", "Frontend Developer",
        "Full-Stack Developer", "DevOps Engineer", "Cloud Engineer",
        "IT Manager", "Systems Administrator", "Network Engineer",
    ],
    "ENGINEERING": [
        "Mechanical Engineer", "Civil Engineer", "Electrical Engineer",
        "Chemical Engineer", "Engineering Technician", "Industrial Engineer",
    ],
    "FINANCE": [
        "Financial Analyst", "Investment Banker", "Financial Advisor",
        "Finance Manager", "Accountant",
    ],
    "ACCOUNTANT": ["Accountant", "Auditor", "Tax Specialist", "Bookkeeper"],
    "ADVOCATE": ["Lawyer", "Legal Advisor", "Attorney", "Paralegal"],
    "AGRICULTURE": ["Agronomist", "Farm Manager", "Agricultural Engineer"],
    "APPAREL": ["Fashion Designer", "Merchandiser", "Textile Designer"],
    "ARTS": ["Graphic Designer", "Artist", "Creative Director", "Illustrator"],
    "AUTOMOBILE": ["Automotive Engineer", "Mechanic", "Vehicle Designer"],
    "AVIATION": ["Pilot", "Aviation Engineer", "Air Traffic Controller"],
    "BANKING": ["Bank Manager", "Loan Officer", "Credit Analyst", "Teller"],
    "BPO": ["Customer Service Representative", "Call Center Agent", "BPO Manager"],
    "BUSINESS-DEVELOPMENT": [
        "Business Development Manager", "Sales Manager",
        "Account Executive", "Partnership Manager",
    ],
    "CHEF": ["Chef", "Sous Chef", "Pastry Chef", "Kitchen Manager"],
    "CONSTRUCTION": [
        "Construction Manager", "Site Engineer", "Project Manager",
        "Civil Engineer",
    ],
    "CONSULTANT": [
        "Management Consultant", "Strategy Consultant",
        "Business Consultant", "IT Consultant",
    ],
    "DESIGNER": [
        "UI/UX Designer", "Product Designer", "Graphic Designer",
        "Web Designer", "Interior Designer",
    ],
    "DIGITAL-MEDIA": [
        "Social Media Manager", "Content Creator", "Digital Marketer",
        "SEO Specialist", "Content Strategist",
    ],
    "FITNESS": [
        "Personal Trainer", "Fitness Instructor", "Nutritionist",
        "Sports Coach",
    ],
    "HEALTHCARE": [
        "Nurse", "Doctor", "Medical Assistant", "Healthcare Administrator",
        "Pharmacist",
    ],
    "HR": [
        "HR Manager", "Recruiter", "HR Business Partner",
        "Talent Acquisition Specialist",
    ],
    "PUBLIC-RELATIONS": [
        "PR Manager", "Communications Specialist", "Media Relations",
        "Brand Manager",
    ],
    "SALES": [
        "Sales Representative", "Account Manager", "Sales Director",
        "Retail Manager",
    ],
    "TEACHER": [
        "Teacher", "Professor", "Instructor", "Education Coordinator",
        "Tutor",
    ],
}

# ---------------------------------------------------------------------------
# Role-to-skills knowledge base
# ---------------------------------------------------------------------------

ROLE_SKILLS: dict[str, list[str]] = {
    # Tech roles
    "software engineer": [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "Go",
        "Data Structures", "Algorithms", "System Design", "REST APIs",
        "Git", "Docker", "SQL", "NoSQL", "Testing", "CI/CD",
        "Agile", "Microservices", "Cloud Computing",
    ],
    "backend developer": [
        "Python", "Java", "Node.js", "Go", "Rust", "C#",
        "REST APIs", "GraphQL", "SQL", "PostgreSQL", "MongoDB", "Redis",
        "Docker", "Kubernetes", "CI/CD", "System Design",
        "Authentication", "Caching", "Message Queues", "Kafka",
        "Testing", "Microservices", "AWS", "Linux",
    ],
    "frontend developer": [
        "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Next.js", "HTML", "CSS", "Tailwind CSS", "Sass",
        "Responsive Design", "Accessibility", "Performance Optimization",
        "Webpack", "Vite", "Testing Library", "Jest", "Cypress",
        "State Management", "Redux", "Zustand", "Figma",
    ],
    "full-stack developer": [
        "JavaScript", "TypeScript", "Python", "React", "Node.js",
        "Next.js", "REST APIs", "GraphQL", "SQL", "PostgreSQL",
        "MongoDB", "Docker", "Git", "AWS", "CI/CD", "Testing",
        "HTML", "CSS", "Tailwind CSS", "System Design",
    ],
    "data scientist": [
        "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn",
        "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning",
        "Statistics", "Data Visualization", "Matplotlib", "Seaborn",
        "A/B Testing", "NLP", "Computer Vision", "Jupyter",
        "Feature Engineering", "Model Evaluation",
    ],
    "data analyst": [
        "SQL", "Python", "Excel", "Tableau", "Power BI",
        "Data Visualization", "Pandas", "Statistics", "R",
        "Data Cleaning", "ETL", "Looker", "Google Analytics",
        "A/B Testing", "Reporting", "Dashboard Design",
    ],
    "machine learning engineer": [
        "Python", "TensorFlow", "PyTorch", "Scikit-learn",
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "MLOps", "Docker", "Kubernetes", "AWS SageMaker",
        "Feature Engineering", "Model Deployment", "Data Pipelines",
        "SQL", "Pandas", "NumPy", "Statistics",
    ],
    "devops engineer": [
        "Docker", "Kubernetes", "Terraform", "AWS", "Azure", "GCP",
        "CI/CD", "Jenkins", "GitHub Actions", "Ansible",
        "Linux", "Shell Scripting", "Monitoring", "Prometheus",
        "Grafana", "Datadog", "Nginx", "Infrastructure as Code",
        "Networking", "Security",
    ],
    "cloud engineer": [
        "AWS", "Azure", "GCP", "Terraform", "CloudFormation",
        "Docker", "Kubernetes", "Serverless", "Lambda",
        "EC2", "S3", "VPC", "IAM", "Networking", "Linux",
        "CI/CD", "Monitoring", "Cost Optimization", "Security",
    ],
    "product manager": [
        "Product Strategy", "Roadmap Planning", "User Research",
        "A/B Testing", "Data Analysis", "Agile", "Scrum",
        "Stakeholder Management", "Market Research", "PRD",
        "Wireframing", "Analytics", "SQL", "Communication",
        "Leadership", "Cross-functional Collaboration",
    ],
    # Non-tech roles
    "hr manager": [
        "Recruitment", "Talent Acquisition", "Employee Relations",
        "Performance Management", "HRIS", "Compliance",
        "Onboarding", "Training", "Compensation", "Benefits",
        "Labor Law", "Conflict Resolution", "Leadership",
    ],
    "sales representative": [
        "CRM", "Salesforce", "Lead Generation", "Cold Calling",
        "Negotiation", "Pipeline Management", "B2B", "B2C",
        "Account Management", "Revenue Growth", "Presentation",
        "Relationship Building", "Quota Achievement",
    ],
    "financial analyst": [
        "Financial Modeling", "Excel", "SQL", "Python",
        "Valuation", "DCF", "Financial Reporting", "Budgeting",
        "Forecasting", "Data Analysis", "Bloomberg", "Power BI",
        "Accounting", "Risk Analysis",
    ],
    "teacher": [
        "Curriculum Development", "Lesson Planning", "Classroom Management",
        "Student Assessment", "Communication", "Differentiated Instruction",
        "Educational Technology", "Mentoring", "Parent Communication",
    ],
    "nurse": [
        "Patient Care", "Clinical Skills", "EMR", "Vital Signs",
        "Medication Administration", "Patient Assessment",
        "CPR", "BLS", "Communication", "Team Collaboration",
        "Critical Thinking", "Time Management",
    ],
    "graphic designer": [
        "Adobe Photoshop", "Illustrator", "InDesign", "Figma",
        "Typography", "Color Theory", "Branding", "Layout Design",
        "UI Design", "Print Design", "Digital Design", "Creativity",
    ],
    "digital marketer": [
        "SEO", "SEM", "Google Ads", "Facebook Ads", "Content Marketing",
        "Email Marketing", "Social Media", "Analytics", "Google Analytics",
        "A/B Testing", "Conversion Optimization", "Copywriting",
        "Marketing Automation", "HubSpot",
    ],
    "consultant": [
        "Strategy", "Analysis", "Problem Solving", "Presentation",
        "Stakeholder Management", "Data Analysis", "Excel", "PowerPoint",
        "Communication", "Project Management", "Research",
        "Change Management", "Process Improvement",
    ],
    "accountant": [
        "Accounting", "Bookkeeping", "Tax Preparation", "Auditing",
        "Financial Reporting", "GAAP", "QuickBooks", "Excel",
        "Payroll", "Accounts Payable", "Accounts Receivable",
        "General Ledger", "Compliance",
    ],
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_role_skills(role: str) -> list[str]:
    """
    Get expected skills for a given role.

    Performs fuzzy matching: tries exact match first, then substring matching.
    Falls back to an empty list if no match is found.
    """
    key = role.lower().strip()

    # Exact match
    if key in ROLE_SKILLS:
        return ROLE_SKILLS[key]

    # Substring match
    for role_key, skills in ROLE_SKILLS.items():
        if key in role_key or role_key in key:
            return skills

    # Partial word match
    words = key.split()
    best_match = None
    best_overlap = 0
    for role_key, skills in ROLE_SKILLS.items():
        role_words = set(role_key.split())
        overlap = len(set(words) & role_words)
        if overlap > best_overlap:
            best_overlap = overlap
            best_match = skills

    return best_match or []


def get_category_for_role(role: str) -> str | None:
    """
    Find the dataset category that best matches a user-entered role.

    Returns the category string (e.g. 'INFORMATION-TECHNOLOGY') or None.
    """
    key = role.lower().strip()

    for category, roles in CATEGORY_TO_ROLES.items():
        for r in roles:
            if key == r.lower() or key in r.lower() or r.lower() in key:
                return category

    return None


def get_all_categories() -> list[str]:
    """Return all available dataset categories."""
    return list(CATEGORY_TO_ROLES.keys())
