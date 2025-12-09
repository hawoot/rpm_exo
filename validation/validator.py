"""
Validation orchestration functions.
"""
from typing import Any

from pydantic import ValidationError as PydanticValidationError

from config import VALID_SECTIONS
from exceptions import ValidationError
from .common import CommonParams
from .sections import SECTION_PARAMS_MAP


def validate_common_params(raw_params: dict) -> CommonParams:
    """
    Validate common parameters from request.
    Handles both GET (query_params) and POST (body) formats.
    """
    # Extract the actual params based on request method
    if "method" in raw_params:
        if raw_params["method"] == "GET":
            params = raw_params.get("query_params", {})
        else:
            params = raw_params.get("body", {})
    else:
        # Fallback for direct params
        params = raw_params

    try:
        return CommonParams(**params)
    except PydanticValidationError as e:
        errors = []
        for err in e.errors():
            field = ".".join(str(x) for x in err["loc"])
            msg = err["msg"]
            errors.append(f"{field}: {msg}")
        raise ValidationError(f"Invalid common parameters: {'; '.join(errors)}")


def resolve_sections(section: str) -> list[str]:
    """
    Resolve section parameter to list of sections to run.
    'all' returns all sections, otherwise returns the single section.
    """
    if section == "all":
        return VALID_SECTIONS.copy()
    return [section]


def validate_section_params(
    raw_params: dict, sections: list[str]
) -> dict[str, Any]:
    """
    Validate section-specific parameters for each requested section.
    Returns a dict of section_name -> validated params model.
    """
    # Extract the actual params based on request method
    if "method" in raw_params:
        if raw_params["method"] == "GET":
            params = raw_params.get("query_params", {})
            # For GET, all extra params are shared across sections
            section_params_raw = {s: params for s in sections}
        else:
            params = raw_params.get("body", {})
            # For POST, section_params is nested
            section_params_raw = params.get("section_params", {})
    else:
        # Fallback
        params = raw_params
        section_params_raw = params.get("section_params", {})

    validated = {}
    errors = []

    for section in sections:
        model_class = SECTION_PARAMS_MAP.get(section)
        if model_class is None:
            errors.append(f"No parameter model for section '{section}'")
            continue

        # Get params for this section (empty dict if not provided)
        section_data = section_params_raw.get(section, {})

        # For GET requests, extract only the fields this section cares about
        if raw_params.get("method") == "GET":
            # Filter to only include fields in the model
            model_fields = set(model_class.model_fields.keys())
            section_data = {k: v for k, v in params.items() if k in model_fields}
            # Convert string values to appropriate types for GET requests
            section_data = _convert_get_params(section_data, model_class)

        try:
            validated[section] = model_class(**section_data)
        except PydanticValidationError as e:
            for err in e.errors():
                field = ".".join(str(x) for x in err["loc"])
                msg = err["msg"]
                errors.append(f"Section '{section}', {field}: {msg}")

    if errors:
        raise ValidationError(f"Invalid section parameters: {'; '.join(errors)}")

    return validated


def _convert_get_params(params: dict, model_class) -> dict:
    """
    Convert GET query string values (all strings) to appropriate types
    based on the model's field annotations.
    """
    converted = {}
    for field_name, field_info in model_class.model_fields.items():
        if field_name not in params:
            continue

        value = params[field_name]
        annotation = field_info.annotation

        # Handle Optional types
        origin = getattr(annotation, "__origin__", None)
        if origin is type(None):
            continue

        # Unwrap Optional
        if hasattr(annotation, "__args__"):
            args = [a for a in annotation.__args__ if a is not type(None)]
            if args:
                annotation = args[0]

        # Convert based on type
        try:
            if annotation is float:
                converted[field_name] = float(value)
            elif annotation is int:
                converted[field_name] = int(value)
            elif annotation is bool:
                converted[field_name] = value.lower() in ("true", "1", "yes")
            else:
                converted[field_name] = value
        except (ValueError, TypeError):
            converted[field_name] = value  # Let pydantic handle the error

    return converted
