from dependencies.auth import require_admin, require_reviewer_or_admin
from models.users import User, UserRole


def _make_user(role: UserRole = UserRole.user, can_review: bool = False) -> User:
    return User(email="test@example.com", hashed_password="hashed", role=role, can_review=can_review)


def test_require_admin_allows_admin():
    admin = _make_user(role=UserRole.admin)
    assert require_admin(admin) == admin


def test_require_admin_rejects_non_admin():
    user = _make_user(role=UserRole.user, can_review=True)
    try:
        require_admin(user)
        assert False, "Expected admin requirement to reject non-admin user"
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 403


def test_require_reviewer_or_admin_allows_reviewer():
    reviewer = _make_user(role=UserRole.user, can_review=True)
    assert require_reviewer_or_admin(reviewer) == reviewer


def test_require_reviewer_or_admin_rejects_regular_user():
    user = _make_user(role=UserRole.user, can_review=False)
    try:
        require_reviewer_or_admin(user)
        assert False, "Expected reviewer requirement to reject regular user"
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 403
