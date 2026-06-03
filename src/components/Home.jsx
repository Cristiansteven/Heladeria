import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="home-hero card border-0 shadow-sm overflow-hidden">
      <div className="card-body p-4 p-md-5">
        <div className="row align-items-center g-4">
          <div className="col-md-7 text-center text-md-start">
            <p className="text-primary fw-semibold mb-2">Heladeria artesanal</p>
            <h1 className="display-4 fw-bold mb-3">Nube & Nieve</h1>
            <p className="lead text-secondary mb-4">
              Sabores frescos, productos claros y una gestion sencilla para atender mejor.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center justify-content-md-start">
              <Link className="btn btn-primary btn-lg" to="/productos">
                Ver productos
              </Link>
              <Link className="btn btn-outline-primary btn-lg" to="/login">
                Login
              </Link>
            </div>
          </div>

          <div className="col-md-5">
            <div className="ice-logo mx-auto">
              <div className="ice-scoop scoop-one" />
              <div className="ice-scoop scoop-two" />
              <div className="ice-scoop scoop-three" />
              <div className="ice-cone" />
            </div>
          </div>
        </div>

        <div className="row g-3 mt-4">
          <div className="col-md-4">
            <div className="feature-card">
              <strong>Productos visibles</strong>
              <span>Catalogo simple para clientes y equipo.</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <strong>Ingredientes al dia</strong>
              <span>Control de inventario, precios y calorias.</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <strong>Roles claros</strong>
              <span>Acceso segun usuario autenticado.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
