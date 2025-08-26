/* export async function handleLogout() {
    await fetch('http://localhost:1234/logout', {
    method: 'POST',
    credentials: 'include',
  });
} */

export const handleLogout = async () => {
  try {
    const res = await fetch('http://localhost:1234/logout', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al cerrar sesión');

    localStorage.removeItem('user');
    
  } catch (error) {
    console.error(error);
  }
};

export async function isAuthenticated() {
    try {
    const res = await fetch('http://localhost:1234/protected', {
      method: "POST",
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
