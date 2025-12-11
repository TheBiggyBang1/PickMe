from typing import List, Dict
import re

# Comprehensive skill database
TECHNICAL_SKILLS = {
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "php", "ruby", "kotlin",
    "swift", "objective-c", "r", "matlab", "scala", "groovy", "perl", "bash", "shell", "sql", "plsql",
    
    # Web Frameworks & Libraries
    "react", "vue", "angular", "svelte", "next.js", "nuxt", "fastapi", "django", "flask", "spring", "express",
    "asp.net", "laravel", "rails", "gin", "echo", "fastify", "nestjs", "remix",
    
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra", "mariadb", "sqlite",
    "oracle", "sql server", "firebase", "couchdb", "neo4j", "influxdb", "timescaledb",
    
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins", "gitlab ci", "github actions",
    "terraform", "ansible", "helm", "ecs", "ec2", "s3", "lambda", "cloudformation", "docker compose",
    
    # Data & AI/ML
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "nltk", "spacy", "opencv",
    "spark", "hadoop", "etl", "airflow", "dbt", "tableau", "power bi", "looker",
    
    # Tools & Platforms
    "git", "linux", "docker", "ci/cd", "rest api", "graphql", "websocket", "grpc", "rabbitmq", "kafka",
    "jira", "confluence", "slack", "datadog", "splunk", "prometheus", "grafana", "sonarqube",
    
    # Other
    "microservices", "rest", "soap", "json", "xml", "html", "css", "webpack", "vite", "npm", "yarn",
}

SOFT_SKILLS = {
    "communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management",
    "project management", "agile", "scrum", "kanban", "negotiation", "presentations", "mentoring",
    "collaboration", "adaptability", "decision making", "conflict resolution",
}

CERTIFICATIONS = {
    "aws certified", "azure certified", "gcp certified", "kubernetes certified", "ckad", "cka",
    "ccna", "cissp", "oscp", "pmp", "capm", "scrum master", "csm", "pca", "aws solutions architect",
}


def extract_skills(text: str) -> Dict[str, List[str]]:
    """Extract technical, soft skills and certifications from resume text."""
    if not text:
        return {"technical": [], "soft": [], "certifications": []}
    
    text_lower = text.lower()
    
    # Extract technical skills with word boundaries
    technical = set()
    for skill in TECHNICAL_SKILLS:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            technical.add(skill)
    
    # Extract soft skills
    soft = set()
    for skill in SOFT_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            soft.add(skill)
    
    # Extract certifications
    certs = set()
    for cert in CERTIFICATIONS:
        pattern = r'\b' + re.escape(cert) + r'\b'
        if re.search(pattern, text_lower):
            certs.add(cert)
    
    return {
        "technical": sorted(list(technical)),
        "soft": sorted(list(soft)),
        "certifications": sorted(list(certs))
    }
