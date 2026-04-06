type AuthProfileBackend = 'shop' | 'beeyield' | 'ceba';

interface BuildProfilePayloadInput {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  backend: AuthProfileBackend;
}

interface ProfileNameParts {
  firstName: string;
  lastName: string;
}

const cleanNamePart = (value?: string | null) => value?.trim() ?? '';

const splitDisplayName = (displayName?: string | null): ProfileNameParts => {
  const normalized = cleanNamePart(displayName);
  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = normalized.split(/\s+/);
  return {
    firstName: firstName ?? '',
    lastName: rest.join(' '),
  };
};

export const getProfileNameParts = (
  metadata?: Record<string, unknown> | null
): ProfileNameParts => {
  const firstName = cleanNamePart(
    typeof metadata?.first_name === 'string'
      ? metadata.first_name
      : typeof metadata?.given_name === 'string'
        ? metadata.given_name
        : null
  );
  const lastName = cleanNamePart(
    typeof metadata?.last_name === 'string'
      ? metadata.last_name
      : typeof metadata?.family_name === 'string'
        ? metadata.family_name
        : null
  );

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  return splitDisplayName(
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : null
  );
};

export const buildProfilePayload = ({
  id,
  email,
  firstName,
  lastName,
  role,
  backend,
}: BuildProfilePayloadInput) => {
  const basePayload = {
    id,
    email: email ?? null,
    first_name: cleanNamePart(firstName) || null,
    last_name: cleanNamePart(lastName) || null,
    updated_at: new Date().toISOString(),
  };

  if (backend === 'shop') {
    return basePayload;
  }

  if (backend === 'beeyield') {
    return {
      ...basePayload,
      is_professional: true,
    };
  }

  return {
    ...basePayload,
    role: role ?? 'admin',
  };
};
