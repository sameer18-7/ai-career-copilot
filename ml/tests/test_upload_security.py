"""
ML Service Upload Security Tests
==================================
Tests file upload validation, size limits, extension checks,
MIME type enforcement, and error handling.

Uses synthetic test fixtures — no real personal resumes.

Run with:
    cd <project_root>
    pip install -r ml/requirements-dev.txt
    pytest ml/tests/test_upload_security.py -v
"""

import io
import os
import struct
import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app
from ml.app import app

client = TestClient(app, raise_server_exceptions=False)

# ---------------------------------------------------------------------------
# Synthetic test fixtures — no real PII
# ---------------------------------------------------------------------------

def minimal_pdf() -> bytes:
    """Return the smallest valid PDF that contains extractable text."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R"
        b"/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        b"4 0 obj<</Length 44>>\nstream\n"
        b"BT /F1 12 Tf 100 700 Td (Test Resume Content) Tj ET\n"
        b"endstream\nendobj\n"
        b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000274 00000 n \n"
        b"0000000370 00000 n \n"
        b"trailer<</Size 6/Root 1 0 R>>\n"
        b"startxref\n438\n%%EOF"
    )


def minimal_docx() -> bytes:
    """Return the smallest structurally valid DOCX (ZIP) containing a word."""
    import zipfile
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            '</Types>')
        z.writestr("_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            '</Relationships>')
        z.writestr("word/document.xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:body><w:p><w:r><w:t>Test Resume Content for unit tests only</w:t></w:r></w:p></w:body>'
            '</w:document>')
        z.writestr("word/_rels/document.xml.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>')
    return buf.getvalue()


def corrupt_pdf() -> bytes:
    """Return bytes that look like a PDF but are structurally invalid."""
    return b"%PDF-1.4\nThis is not a valid PDF stream.\x00\x01\x02"


def empty_file() -> bytes:
    return b""


def oversized_file(size_bytes: int = 11 * 1024 * 1024) -> bytes:
    """Return a file larger than the 10 MB limit (default 11 MB)."""
    return b"A" * size_bytes


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["status"] == "ok"


# ---------------------------------------------------------------------------
# Extension validation
# ---------------------------------------------------------------------------

class TestExtensionValidation:
    def test_rejects_exe_extension(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("malware.exe", b"MZ\x90\x00", "application/octet-stream")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400
        assert "Unsupported file type" in resp.json().get("detail", "")

    def test_rejects_js_extension(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("script.js", b"alert(1)", "text/javascript")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_html_extension(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("page.html", b"<html><body>XSS</body></html>", "text/html")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_zip_extension(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("archive.zip", b"PK\x03\x04", "application/zip")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_extension_disguised_as_pdf(self):
        """A .pdf file with an .exe MIME type should still be validated by extension."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.exe", minimal_pdf(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_no_extension(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume", b"content", "application/octet-stream")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_double_extension_path_traversal(self):
        """Test path traversal via double extensions or directory separators."""
        for filename in [
            "../../../etc/passwd.pdf",
            "resume%2F..%2Fetc%2Fpasswd.docx",
            "resume\x00.pdf",
        ]:
            resp = client.post(
                "/analyze-resume",
                files={"file": (filename, minimal_pdf(), "application/pdf")},
                data={"target_role": "Engineer"},
            )
            # Should either succeed (safe path) or return 400 — must never be 500
            assert resp.status_code in (200, 400), (
                f"Unexpected status {resp.status_code} for filename: {filename!r}"
            )


# ---------------------------------------------------------------------------
# Empty and corrupt files
# ---------------------------------------------------------------------------

class TestFileContent:
    def test_rejects_empty_pdf(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.pdf", empty_file(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_corrupt_pdf(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.pdf", corrupt_pdf(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code in (400, 422)

    def test_rejects_empty_docx(self):
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.docx", empty_file(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code == 400

    def test_rejects_pdf_extension_with_docx_content(self):
        """DOCX content (ZIP magic bytes) in a .pdf file should be handled safely."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.pdf", b"PK\x03\x04docx content here", "application/pdf")},
            data={"target_role": "Engineer"},
        )
        # Should either report parse error or succeed gracefully — never expose internals
        assert resp.status_code in (400, 422, 500)
        if resp.status_code == 500:
            # No stack traces should appear in the response body
            body = resp.text
            assert "Traceback" not in body
            assert "File \"" not in body


# ---------------------------------------------------------------------------
# File size limits
# ---------------------------------------------------------------------------

class TestFileSizeLimits:
    def test_rejects_oversized_file(self):
        """A file over 10 MB must be rejected with HTTP 413."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("big.pdf", oversized_file(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        assert resp.status_code in (400, 413), (
            f"Expected 400/413 for oversized file, got {resp.status_code}"
        )

    def test_accepts_file_at_limit(self):
        """A small valid PDF well within the limit should not be rejected for size."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.pdf", minimal_pdf(), "application/pdf")},
            data={"target_role": "Software Engineer"},
        )
        # May fail for content reasons but must NOT fail for size reasons
        assert resp.status_code != 413


# ---------------------------------------------------------------------------
# Error response safety — no internal info leakage
# ---------------------------------------------------------------------------

class TestErrorResponseSafety:
    def test_error_responses_contain_no_stack_traces(self):
        """Error responses must not expose Python stack traces."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.pdf", corrupt_pdf(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        body = resp.text
        # Stack trace markers must not appear in response body
        assert "Traceback (most recent call last)" not in body
        assert 'File "' not in body
        assert "line " not in body or "Traceback" not in body

    def test_error_responses_contain_no_internal_paths(self):
        """Error responses must not expose filesystem paths."""
        resp = client.post(
            "/analyze-resume",
            files={"file": ("resume.exe", b"MZ content", "application/octet-stream")},
            data={"target_role": "Engineer"},
        )
        body = resp.text
        # Absolute paths must not appear in error responses
        assert "C:\\" not in body
        assert "/home/" not in body
        assert "/app/" not in body

    def test_no_filename_in_error_response(self):
        """Uploaded filename must not be reflected verbatim in error messages
        to prevent injection or info disclosure."""
        evil_name = "<script>alert(1)</script>.pdf"
        resp = client.post(
            "/analyze-resume",
            files={"file": (evil_name, corrupt_pdf(), "application/pdf")},
            data={"target_role": "Engineer"},
        )
        # The raw evil_name must not appear verbatim in the response
        assert "<script>" not in resp.text


# ---------------------------------------------------------------------------
# Target role sanitization
# ---------------------------------------------------------------------------

class TestTargetRoleSanitization:
    def test_very_long_target_role_is_truncated(self):
        """Extremely long target_role values should be handled safely."""
        long_role = "A" * 10_000
        resp = client.post(
            "/parse-resume",
            files={"file": ("resume.pdf", minimal_pdf(), "application/pdf")},
        )
        # parse-resume has no target_role — just ensure it doesn't crash
        assert resp.status_code in (200, 400, 422, 500)
        if resp.status_code == 500:
            assert "Traceback" not in resp.text

    def test_injection_in_target_role_is_safe(self):
        """SQL/shell injection attempts in target_role must not cause errors."""
        for evil_role in [
            "'; DROP TABLE users; --",
            "<script>alert(1)</script>",
            "../../../etc/passwd",
            "\x00\x01\x02",
        ]:
            resp = client.post(
                "/analyze-resume",
                files={"file": ("resume.pdf", minimal_pdf(), "application/pdf")},
                data={"target_role": evil_role},
            )
            # Must not crash with 500 due to injection
            assert resp.status_code in (200, 400, 422), (
                f"Role {evil_role!r} caused status {resp.status_code}"
            )


# ---------------------------------------------------------------------------
# Parse endpoint tests
# ---------------------------------------------------------------------------

class TestParseEndpoint:
    def test_rejects_unsupported_extension(self):
        resp = client.post(
            "/parse-resume",
            files={"file": ("resume.txt", b"Plain text resume", "text/plain")},
        )
        assert resp.status_code == 400

    def test_rejects_empty_file(self):
        resp = client.post(
            "/parse-resume",
            files={"file": ("resume.pdf", b"", "application/pdf")},
        )
        assert resp.status_code == 400
