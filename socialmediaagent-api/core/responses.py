from typing import Any


def success_response(message: str, data: Any = None) -> dict[str, Any]:
    return {"status": "success", "message": message, "data": data}


def error_response(message: str, data: Any = None) -> dict[str, Any]:
    return {"status": "error", "message": message, "data": data}
