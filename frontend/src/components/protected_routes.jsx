import { useState, useEffect, useContext } from 'react'

import { Navigate } from 'react-router-dom'

import { AppContext } from '../contexts/app_context'



const PrivateRoute = ({ children, accessControl }) => {

    const [ready, setReady] = useState(false)

    const { user, onLoadUser } = useContext(AppContext)

    useEffect(() => {

        onLoadUser()

        setReady(true)

    }, [onLoadUser])

    if (!ready) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="loader"></h1>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/" />
    }

    // Se o usuário logado não tem permissão, manda para página de não autorizado)
    if (accessControl && !accessControl.includes(user?.role)) {
        return <Navigate replace to="/notfound" />
    }

    // Usuário autorizado, renderiza o conteúdo protegido
    return children
}

export default PrivateRoute
