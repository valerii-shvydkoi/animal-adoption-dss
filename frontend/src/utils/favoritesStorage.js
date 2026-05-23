export const ACTIVE_FAVORITES_KEY = 'adoptify_favorites';
export const GUEST_FAVORITES_KEY = 'adoptify_guest_favorites';

const parseFavoriteIds = (rawValue) => {
  try {
    const parsed = JSON.parse(rawValue || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(Number).filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
};

const uniqueFavoriteIds = (ids) => [
  ...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)),
];

const readKey = (key) => parseFavoriteIds(localStorage.getItem(key));

const writeKey = (key, ids) => {
  localStorage.setItem(key, JSON.stringify(uniqueFavoriteIds(ids)));
};

export const getUserFavoritesKey = (user) => {
  const userIdentity = user?.id || user?.email || 'current';
  return `adoptify_user_favorites_${String(userIdentity).toLowerCase()}`;
};

export const getGuestFavoriteIds = () =>
  uniqueFavoriteIds([...readKey(GUEST_FAVORITES_KEY), ...readKey(ACTIVE_FAVORITES_KEY)]);

export const getStoredFavoriteIds = (user) => {
  if (user?.isAuthenticated) {
    return uniqueFavoriteIds([
      ...readKey(getUserFavoritesKey(user)),
      ...readKey(ACTIVE_FAVORITES_KEY),
    ]);
  }

  return getGuestFavoriteIds();
};

export const setStoredFavoriteIds = (ids, user) => {
  const cleanIds = uniqueFavoriteIds(ids);
  if (user?.isAuthenticated) {
    writeKey(getUserFavoritesKey(user), cleanIds);
    writeKey(ACTIVE_FAVORITES_KEY, cleanIds);
    return cleanIds;
  }

  writeKey(GUEST_FAVORITES_KEY, cleanIds);
  writeKey(ACTIVE_FAVORITES_KEY, cleanIds);
  return cleanIds;
};

export const clearGuestFavoriteIds = () => {
  localStorage.removeItem(GUEST_FAVORITES_KEY);
};

export const clearActiveFavoriteIds = () => {
  localStorage.removeItem(ACTIVE_FAVORITES_KEY);
};

export const mergeFavoriteIds = (...idGroups) => uniqueFavoriteIds(idGroups.flat());

export const toggleStoredFavoriteId = (petId, user) => {
  const currentIds = getStoredFavoriteIds(user);
  const normalizedId = Number(petId);
  const nextIds = currentIds.includes(normalizedId)
    ? currentIds.filter((id) => id !== normalizedId)
    : [...currentIds, normalizedId];
  return setStoredFavoriteIds(nextIds, user);
};

export const emitFavoritesUpdated = () => {
  window.dispatchEvent(new Event('favoritesUpdated'));
};
