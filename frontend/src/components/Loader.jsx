// ==============================================
// Loader.jsx (Global Beautiful Loader)
// ==============================================

export default function Loader() {
  return (
    <div
      style={{
        width: "100%",
        padding: "30px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0,0,0,0.2);
          border-top-color: #0d6efd;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
