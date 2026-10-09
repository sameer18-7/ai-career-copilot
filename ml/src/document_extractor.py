"""
Document Extractor
==================
Extracts plain text from PDF, DOCX, and DOC files using PyMuPDF and python-docx.
"""

import io
import os
import struct
from typing import Optional

import pymupdf  # PyMuPDF
from docx import Document as DocxDocument


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract plain text from a resume file.

    Args:
        file_bytes: Raw file content as bytes.
        filename: Original filename (used to determine format).

    Returns:
        Extracted plain text.

    Raises:
        ValueError: If file format is unsupported or file is empty/corrupt.
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        return _extract_pdf(file_bytes)
    elif ext == ".docx":
        return _extract_docx(file_bytes)
    elif ext == ".doc":
        return _extract_doc(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {ext}")


# ---------------------------------------------------------------------------
# PDF extraction (PyMuPDF)
# ---------------------------------------------------------------------------

def _extract_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Failed to open PDF: {exc}") from exc

    pages = []
    for page in doc:
        text = page.get_text("text")
        if text:
            pages.append(text)
    doc.close()

    result = "\n".join(pages).strip()
    if not result:
        raise ValueError("PDF contains no extractable text (may be image-based).")
    return result


# ---------------------------------------------------------------------------
# DOCX extraction (python-docx)
# ---------------------------------------------------------------------------

def _extract_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes using python-docx."""
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Failed to open DOCX: {exc}") from exc

    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)

    # Also extract text from tables
    for table in doc.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                paragraphs.append(" | ".join(cells))

    result = "\n".join(paragraphs).strip()
    if not result:
        raise ValueError("DOCX contains no extractable text.")
    return result


# ---------------------------------------------------------------------------
# DOC extraction (binary fallback)
# ---------------------------------------------------------------------------

def _extract_doc(file_bytes: bytes) -> str:
    """
    Extract text from legacy .doc files using basic binary text extraction.

    This is a best-effort approach that reads ASCII/UTF-8 text runs from the
    OLE2 binary stream. For production-quality .doc parsing, consider using
    antiword or LibreOffice in headless mode.
    """
    try:
        # Try to find readable text runs in the binary
        text = _extract_text_from_binary(file_bytes)
        if text and len(text.strip()) > 50:
            return text.strip()
    except Exception:
        pass

    raise ValueError(
        "Could not extract text from .doc file. "
        "For best results, convert to .docx or .pdf first."
    )


def _extract_text_from_binary(data: bytes) -> str:
    """
    Extract readable text from a binary file by finding long ASCII runs.
    Filters out control characters and very short fragments.
    """
    result = []
    current_run = []

    for byte in data:
        # Accept printable ASCII + common whitespace
        if 32 <= byte <= 126 or byte in (9, 10, 13):
            current_run.append(chr(byte))
        else:
            if len(current_run) >= 4:  # Minimum run length
                result.append("".join(current_run))
            current_run = []

    if len(current_run) >= 4:
        result.append("".join(current_run))

    # Join runs with spaces and clean up
    text = " ".join(result)

    # Remove excessive whitespace
    lines = []
    for line in text.split("\n"):
        line = " ".join(line.split())
        if line:
            lines.append(line)

    return "\n".join(lines)
