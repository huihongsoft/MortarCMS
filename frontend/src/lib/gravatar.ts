import md5 from 'blueimp-md5';

export function gravatarUrl(email: string, size = 80): string {
  // Gravatar requires the MD5 hex digest of the trimmed, lowercased email
  const hash = md5(email.trim().toLowerCase());
  return 'https://www.gravatar.com/avatar/' + hash + '?s=' + size + '&d=mp';
}
