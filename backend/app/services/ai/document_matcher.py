import re
from typing import Literal

MatchState = Literal["FOUND", "NOT_FOUND_IN_UPLOADED_DOCUMENTS", "UNCERTAIN"]

def normalize_doc_name(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r'\b(card|certificate|document|proof|copy)\b', '', name).strip()
    
    equivalents = {
        "driving licence": "driving license",
        "dl": "driving license",
        "voter id": "voter identity",
        "pan": "pan",
        "aadhaar": "aadhaar",
        "aadhar": "aadhaar"
    }
    
    if name in equivalents:
        return equivalents[name]
    return name

def evaluate_requirement(req: str, uploaded: list[str]) -> MatchState:
    norm_req = normalize_doc_name(req)
    
    generic_terms = ["address", "identity", "id", "photo id", "age", "residence", "residential"]
    if norm_req in generic_terms:
        return "UNCERTAIN"
        
    for doc in uploaded:
        norm_doc = normalize_doc_name(doc)
        # Check for exact match or word-bounded substring match (e.g. "pan" inside "residential proof: ... pan")
        if norm_req == norm_doc or re.search(rf'\b{re.escape(norm_doc)}\b', norm_req):
            return "FOUND"
            
    return "NOT_FOUND_IN_UPLOADED_DOCUMENTS"

def match_documents(required_docs: list[str], uploaded_doc_titles: list[str]) -> list[dict]:
    results = []
    for req in required_docs:
        state = evaluate_requirement(req, uploaded_doc_titles)
        results.append({"requirement": req, "state": state})
    return results
