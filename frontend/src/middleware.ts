import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.JWT_SECRET;

// Define literal types for allowed methods and roles
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type UserRole = 'superadmin' | 'admin' | 'homeroom' | 'verifiedartist' | 'user';
type PathKey = 'Editable' | 'anotherPath' | 'cms' | 'docs';

// Consolidated role mapping with proper typing
const ACCESS_CONTROL = {
  paths: {
    'Editable': ['superadmin', 'admin', 'homeroom', 'verifiedartist'] as UserRole[],
    'anotherPath': ['admin', 'verifiedartist'] as UserRole[],
    'cms': ['superadmin', 'admin', 'homeroom', 'user'] as UserRole[],
    'docs': ['superadmin', 'admin'] as UserRole[]
  } satisfies Record<PathKey, UserRole[]>,
  methods: {
    restricted: ['PUT', 'DELETE'] as HttpMethod[]
  }
} as const;

interface UserPayload {
  role: string[]; // Keep as string[] since the token payload might not be strictly typed
}

// Type guard to check if a string is a valid HTTP method
function isRestrictedMethod(method: string): method is HttpMethod {
  return ACCESS_CONTROL.methods.restricted.includes(method as HttpMethod);
}

// Type guard to check if a role is a valid UserRole
function isValidRole(role: string): role is UserRole {
  const allRoles = new Set([
    'superadmin',
    'admin',
    'homeroom',
    'verifiedartist',
    'user'
  ] as UserRole[]);
  return allRoles.has(role as UserRole);
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Early return for internal user profile requests
  if (pathname.includes('/api/contents/admins/')) {
    if (req.headers.get('x-internal-request') !== 'true') {
      return NextResponse.redirect(new URL('/auth/403', req.url));
    }
    return NextResponse.next();
  }

  // Skip auth check for login requests
  if (pathname === '/api/auth/signin') {
    return NextResponse.next();
  }

  // Determine if authentication is required
  const needsAuth = 
    isRestrictedMethod(req.method) ||
    Object.keys(ACCESS_CONTROL.paths).some(path => 
      pathname.endsWith(path) || pathname.includes(path.toLowerCase())
    );

  if (!needsAuth) {
    return NextResponse.next();
  }

  // Authentication check
  const token = await getToken({ req, secret });
  if (!token) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }

  const user = token as UserPayload;
  if (!user?.role) {
    return NextResponse.redirect(new URL('/auth/403', req.url));
  }

  // Authorization check
  const hasAccess = Object.entries(ACCESS_CONTROL.paths).some(([path, allowedRoles]) => {
    const pathMatch = pathname.endsWith(path) || pathname.includes(path.toLowerCase());
    return pathMatch && user.role.some(role => 
      isValidRole(role) && allowedRoles.includes(role)
    );
  });

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/auth/403', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/contents/:path*', 
    '/api/contents/admins/:id*',
    '/cms/:path*',
    '/docs'
  ],
};