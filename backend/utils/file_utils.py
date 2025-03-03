import os

def sanitize_filename(filename):
    """Sanitize filenames to avoid security issues."""
    return "".join(c for c in filename if c.isalnum() or c in ('.', '_')).rstrip()