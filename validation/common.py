"""
Common parameter validation models.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator

from config import DATE_FORMAT, TIME_OF_DAY_VALUES, VALID_SECTIONS


class CommonParams(BaseModel):
    """
    Common parameters required for all requests.
    """
    section: str
    time_of_day: Literal["Live", "Open", "Close"]
    books: list[str]
    pos_date: str
    env_date: str

    @field_validator("section")
    @classmethod
    def validate_section(cls, v: str) -> str:
        if v != "all" and v not in VALID_SECTIONS:
            raise ValueError(
                f"Invalid section '{v}'. Must be 'all' or one of: {VALID_SECTIONS}"
            )
        return v

    @field_validator("books", mode="before")
    @classmethod
    def validate_books(cls, v) -> list[str]:
        if isinstance(v, str):
            # Handle comma-separated string from GET request
            books = [b.strip() for b in v.split(",") if b.strip()]
        elif isinstance(v, list):
            books = v
        else:
            raise ValueError("books must be a string or list")

        if not books:
            raise ValueError("books cannot be empty")
        return books

    @field_validator("pos_date", "env_date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, DATE_FORMAT)
        except ValueError:
            raise ValueError(f"Date must be in format {DATE_FORMAT}, got '{v}'")
        return v
