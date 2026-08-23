from pydantic import BaseModel


class SchemeSummary(BaseModel):
    id: str
    name: str
    category: str
    level: str
    benefit: str = ""
    source: str = "myScheme"
    status: str = "needs_verification"


class SchemeSearchResult(BaseModel):
    total: int
    results: list[SchemeSummary] = []


class SchemeRead(BaseModel):
    id: str
    name: str
    summary: str = ""
    benefit: str = ""
    category: str
    categories: list[str] = []
    level: str
    requiredDocuments: list[str] = []
    requirementTags: list[str] = []
    tags: list[str] = []
    officialUrl: str | None = None
    source: str = "myScheme"
    sourceType: str = "dataset"
    status: str = "needs_verification"


class SchemeMatch(BaseModel):
    id: str
    name: str
    category: str
    level: str
    benefit: str = ""
    satisfied: int
    total: int
    matchedTags: list[str] = []
    missingTags: list[str] = []
    officialUrl: str | None = None
    source: str = "myScheme"
    status: str = "needs_verification"


class SchemeMatchResult(BaseModel):
    results: list[SchemeMatch] = []
