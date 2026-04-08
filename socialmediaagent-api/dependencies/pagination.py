from dataclasses import dataclass

from fastapi import Query


@dataclass
class PaginationParams:
    skip: int = 0
    limit: int = 20

    @property
    def page(self) -> int:
        return (self.skip // self.limit) + 1 if self.limit else 1


def get_pagination_params(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100)) -> PaginationParams:
    return PaginationParams(skip=skip, limit=limit)
