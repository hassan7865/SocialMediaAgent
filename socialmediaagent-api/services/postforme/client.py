from __future__ import annotations

from typing import TypeVar

import httpx
from pydantic import BaseModel

from services.postforme.schemas import (
    CreateSocialPostBody,
    SocialAccountProviderAuthUrlDto,
    SocialAccountsListResponse,
    SocialPostDto,
)


class PostForMeClientError(Exception):
    def __init__(self, message: str, status_code: int | None = None, body: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


TModel = TypeVar("TModel", bound=BaseModel)


class PostForMeClient:
    def __init__(self, base_url: str, api_key: str) -> None:
        self._base = base_url.rstrip("/")
        self._api_key = api_key

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def create_social_account_auth_url(
        self,
        *,
        platform: str,
        external_id: str,
        permissions: list[str] | None = None,
    ) -> SocialAccountProviderAuthUrlDto:
        body: dict = {"platform": platform, "external_id": external_id}
        if permissions is not None:
            body["permissions"] = permissions
        return await self._request("POST", "/v1/social-accounts/auth-url", json_body=body, model=SocialAccountProviderAuthUrlDto)

    async def list_social_accounts(
        self,
        *,
        platforms: list[str],
        external_id: str | None = None,
        status: list[str] | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> SocialAccountsListResponse:
        params: list[tuple[str, str]] = [("limit", str(limit)), ("offset", str(offset))]
        for p in platforms:
            params.append(("platform", p))
        if external_id is not None:
            params.append(("external_id", external_id))
        if status:
            for s in status:
                params.append(("status", s))
        return await self._request("GET", "/v1/social-accounts", params=params, model=SocialAccountsListResponse)

    async def create_social_post(self, body: CreateSocialPostBody) -> SocialPostDto:
        return await self._request(
            "POST",
            "/v1/social-posts",
            json_body=body.model_dump(exclude_none=True),
            model=SocialPostDto,
        )

    async def disconnect_social_account(self, social_account_id: str) -> None:
        r = await self._request_raw("POST", f"/v1/social-accounts/{social_account_id}/disconnect", json_body={})
        if r.status_code >= 400:
            raise PostForMeClientError(
                f"Post for Me disconnect error: {r.status_code}",
                status_code=r.status_code,
                body=r.text[:2000],
            )

    async def _request_raw(
        self,
        method: str,
        path: str,
        *,
        json_body: dict | None = None,
        params: list[tuple[str, str]] | None = None,
    ) -> httpx.Response:
        url = f"{self._base}{path}"
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.request(method, url, headers=self._headers(), json=json_body, params=params)
            return r

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict | None = None,
        params: list[tuple[str, str]] | None = None,
        model: type[TModel],
    ) -> TModel:
        r = await self._request_raw(method, path, json_body=json_body, params=params)
        if r.status_code >= 400:
            raise PostForMeClientError(
                f"Post for Me API error: {r.status_code}",
                status_code=r.status_code,
                body=r.text[:2000],
            )
        return model.model_validate(r.json())
