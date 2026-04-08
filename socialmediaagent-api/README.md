# SocialMediaAgent API

## RBAC bootstrap

The API uses two roles in `users.role`: `admin` and `user`. Reviewer capability is controlled by `users.can_review`.

To safely bootstrap the first admin account after migrations:

1. Register the initial user account normally via `/api/auth/register`.
2. Run a one-time SQL update in your database:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

3. After this, use `PATCH /api/admin/users/{user_id}/reviewer` as admin to grant/revoke reviewer permission for other users.
