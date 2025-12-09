"""
Custom exceptions for the pos_env API.
"""


class PosEnvError(Exception):
    """Base exception for all pos_env errors."""
    pass


class ValidationError(PosEnvError):
    """Raised when request validation fails."""
    pass


class SectionError(PosEnvError):
    """Raised when a section execution fails."""

    def __init__(self, section_name: str, message: str):
        self.section_name = section_name
        super().__init__(f"Error in section '{section_name}': {message}")


class StorageError(PosEnvError):
    """Raised when storage operations fail."""
    pass


class CacheError(PosEnvError):
    """Raised when cache operations fail."""
    pass
