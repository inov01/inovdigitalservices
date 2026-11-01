import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"

// Landing route for shared portfolio links (/portfolio/:id). The social preview is
// served by api/portfolio-share; here we hand the project id to the portfolio
// section and send the visitor to it.
export default function PortfolioShare() {
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    if (id) {
      try { sessionStorage.setItem("inov-open-album", id) } catch {}
    }
    navigate("/#portfolio", { replace: true })
  }, [id, navigate])
  return <div style={{ minHeight: "60vh" }} />
}
