import { useEffect } from "react";

interface OAuth2SuccessProps {
  onLoginSuccess: (user: any) => void;
}

export default function OAuth2Success({
  onLoginSuccess,
}: OAuth2SuccessProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    localStorage.setItem("token", token);

    fetch("http://localhost:8080/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        localStorage.setItem(
          "codearena_session_user",
          JSON.stringify(user)
        );

        onLoginSuccess(user);

        window.history.replaceState({}, "", "/");
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing you in...
    </div>
  );
}