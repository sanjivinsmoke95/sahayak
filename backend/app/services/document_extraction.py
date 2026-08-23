"""Extract readable text from the document formats accepted by the upload UI."""

from io import BytesIO


class DocumentExtractionError(ValueError):
    """An upload could not be converted to usable text."""


def extract_text(content: bytes, mime_type: str, filename: str) -> str:
    if not content:
        raise DocumentExtractionError("The uploaded file is empty.")

    if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
        return _extract_pdf_text(content)
    if mime_type.startswith("image/"):
        return _extract_image_text(content)
    raise DocumentExtractionError("Only PDF files and images can be analysed.")


def _extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise DocumentExtractionError(
            "This PDF could not be read. Try uploading a clearer copy."
        ) from exc

    if not text:
        text = _extract_scanned_pdf_text(content)
    return text


def _extract_scanned_pdf_text(content: bytes) -> str:
    """Render a scanned certificate's first pages and read them with OCR."""
    try:
        import fitz
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise DocumentExtractionError(
            "PDF OCR dependencies are missing on this server. Install the backend requirements."
        ) from exc

    try:
        pdf = fitz.open(stream=content, filetype="pdf")
        pages: list[str] = []
        # Certificates are normally one page. Limit OCR work so a hostile PDF
        # cannot tie up the server indefinitely.
        for page in list(pdf)[:5]:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = Image.open(BytesIO(pixmap.tobytes("png")))
            pages.append(pytesseract.image_to_string(image, lang="eng+hin+tel"))
        text = "\n".join(pages).strip()
    except pytesseract.TesseractNotFoundError as exc:
        raise DocumentExtractionError(
            "Certificate OCR is not installed on this server. Start the Docker setup "
            "or install Tesseract OCR."
        ) from exc
    except Exception as exc:
        raise DocumentExtractionError(
            "This scanned PDF could not be read. Try a clearer copy."
        ) from exc

    if not text:
        raise DocumentExtractionError(
            "No readable text was found in this scanned PDF. Try a clearer copy."
        )
    return text


def _extract_image_text(content: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise DocumentExtractionError(
            "Image OCR dependencies are missing on this server. Install the backend requirements."
        ) from exc

    try:
        text = pytesseract.image_to_string(Image.open(BytesIO(content)), lang="eng+hin+tel").strip()
    except pytesseract.TesseractNotFoundError as exc:
        raise DocumentExtractionError(
            "Image OCR is not installed on this server. Install Tesseract OCR, then try again."
        ) from exc
    except Exception as exc:
        raise DocumentExtractionError(
            "This image could not be read. Try a clearer, upright photo."
        ) from exc

    if not text:
        raise DocumentExtractionError(
            "No readable text was found in this image. Try a clearer photo."
        )
    return text
