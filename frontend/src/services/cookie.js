export const cookie = {
  get: (name) => document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))?.split('=')[1] || null,
  set: (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  },
  delete: (name) => {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  },
};
