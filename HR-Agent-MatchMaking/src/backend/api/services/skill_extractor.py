from typing import List, Dict

DEFAULT_SKILLS = [
    "python", "aws", "docker", "kubernetes", "sql", "pandas", "numpy", "fastapi",
    "react", "node", "java", "c++", "linux", "git", "ci/cd",
]


def extract_skills(text: str) -> Dict[str, List[str]]:
    t = (text or "").lower()
    tech = sorted({s for s in DEFAULT_SKILLS if s in t})
    soft = []
    certs = []
    return {"technical": tech, "soft": soft, "certifications": certs}
