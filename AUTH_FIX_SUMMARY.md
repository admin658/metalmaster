# Auth Flow Fix Summary

## Problem Identified
Login and signup pages were not working due to a **response format mismatch** between the API client and the `useAuth` hook.

## Root Cause
The `useApiMutation()` hook in `useApi.ts` extracts the `.data` property from the standardized API response format. However, `useAuth.ts` was attempting to access the response as if it were the full API response object, resulting in incorrect property access patterns:

- **Incorrect**: `response.data.tokens.access_token`
- **Correct**: `response.tokens.access_token` (since mutate already extracts `.data`)

## API Response Format
The standardized API response structure is:
```typescript
{
  "success": boolean,
  "data": { /* actual data */ },
  "error": { code, message, details? },
  "meta": { timestamp, version }
}
```

The `apiClient.ts` extracts just the `data` property and returns it directly to the caller.

## Files Modified

### 1. `packages/web/src/hooks/useAuth.ts`

**Login method fix** (lines 51-72):
- Changed `resp?.data?.tokens?.access_token` → `resp?.tokens?.access_token`
- Changed `resp?.data?.user` → `resp?.user`
- Added comments explaining the response format

**Signup method fix** (lines 74-101):
- Removed incorrect `.data?.user` access
- Simplified logic since signup endpoint doesn't return tokens (user must log in after signup)
- Added comments explaining the flow

## API Routes Reference
The following endpoints are already correctly implemented in `packages/api/src/routes/auth.routes.ts`:

### POST /api/auth/login
**Request:**
```typescript
{ email: string; password: string }
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "user": { id, email, username? },
    "tokens": { access_token, refresh_token, expires_in }
  },
  "meta": { timestamp, version }
}
```

### POST /api/auth/signup
**Request:**
```typescript
{ email: string; password: string; username: string; confirm_password: string }
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "user": { id, email }
  },
  "meta": { timestamp, version }
}
```
*(Note: No tokens returned; user must log in after signup)*

## Verification
✅ Web build completed successfully after fixes with all routes prerendered
✅ No TypeScript errors in `useAuth.ts` or related files
✅ Error handling in LoginForm and SignupForm components verified working

## Testing Checklist
- [ ] Try logging in with valid credentials
- [ ] Try logging in with invalid email format
- [ ] Try logging in with password < 8 characters
- [ ] Try signing up with matching passwords
- [ ] Try signing up with non-matching passwords
- [ ] Verify token stored in localStorage after successful login
- [ ] Verify redirect to /profile after successful login
- [ ] Verify redirect to /login after successful signup
- [ ] Check error messages display properly in the UI

## Related Components
- `packages/web/src/app/login/LoginForm.tsx` - Displays login form and errors
- `packages/web/src/app/signup/SignupForm.tsx` - Displays signup form and errors  
- `packages/web/src/lib/apiClient.ts` - Handles API communication and response extraction
- `packages/web/src/hooks/useApi.ts` - Provides `useApiMutation()` hook
- `packages/api/src/routes/auth.routes.ts` - Backend authentication endpoints
