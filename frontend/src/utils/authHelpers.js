export function logoutOn401() {
  localStorage.removeItem("waec_token");
  localStorage.removeItem("waec_user");
  window.location.href = "/login";
}
