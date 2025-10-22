// frontend/src/routes/guards/AuthGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSession } from "../../api/auth";

function getLocal() {
  try { 
    return JSON.parse(localStorage.getItem("cl_auth") || "null"); 
  } catch { 
    return null; 
  }
}

export default function AuthGuard({ children }) {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let alive = true;
    
    (async () => {
      try {
        const local = getLocal();
        
        // If we have local auth, trust it (already validated)
        if (local?.user) {
          if (alive) { 
            setActive(true); 
            setChecked(true); 
          }
          return;
        }
        
        // Otherwise, check with server
        const s = await getSession();
        if (!alive) return;
        
        if (s?.active && s?.user) {
          localStorage.setItem("cl_auth", JSON.stringify({ 
            user: s.user, 
            token: "cookie" 
          }));
          
          // Also set cl_user for consistency with routes/index.jsx
          localStorage.setItem("cl_user", JSON.stringify(s.user));
          
          setActive(true);
        } else {
          setActive(false);
        }
      } catch (err) {
        console.error("AuthGuard session check failed:", err);
        setActive(false);
      } finally {
        if (alive) setChecked(true);
      }
    })();
    
    return () => { alive = false; };
  }, []); // ✅ Empty dependency array - only run once on mount

  // Show loading state while checking auth
  if (!checked) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <div>Loading…</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!active) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  
  return children || <Outlet />;
}