import { useState, useEffect, useContext } from 'react'

import { Navigate } from 'react-router-dom'

import { AppContext } from '../contexts/app_context'



const PrivateRouteGuest = ({ children, accessControl }) => {

    const [ready, setReady] = useState(false)

    const { guest, onLoadGuest } = useContext(AppContext)

    useEffect(() => {

        onLoadGuest()

        setReady(true)

    }, [onLoadGuest])

    if (!ready) {

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="loader"></h1>
            </div>
        )

    }

    if (!guest) {

        return <Navigate replace to="/unauthorized" />

    }

    // Se o usuário logado não tem permissão, manda para página de não autorizado)
    if (accessControl && !accessControl.includes(guest?.role)) {

        return <Navigate replace to="/notfound" />

    }

    return children

}

export default PrivateRouteGuest
