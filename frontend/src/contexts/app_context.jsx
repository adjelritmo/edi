import { createContext, useEffect, useState, useCallback } from 'react'

import { jwtDecode } from 'jwt-decode'

import getAllCentersNames from '../functions/guest/getAllCenters'

import typeUserEnum from '../functions/constants/type_user_enum'

import getCenterData from '../functions/collaborator/center/getCenterData'

const AppContext = createContext()




const AppProvider = ({ children }) => {

    const [user, setUser] = useState(null)

    const [guest, setGuest] = useState(null)

    const [center, setCenter] = useState(null)

    const [dashboard_data, setDashboard_data] = useState(null)

    const [centersNames, setCentersNames] = useState([])

    const logout = useCallback(() => {

        localStorage.removeItem('@equicenter')

        setUser(null)

        window.location.replace('/edi/login')

    }, [])

    const logoutGuest = useCallback(() => {

        localStorage.removeItem('@equicenter-guest')

        setGuest(null)
        
        window.location.replace('/edi/login')

    }, [])

    const onLoadUser = useCallback(() => {

        const equicentercode = localStorage.getItem('@equicenter')

        if (equicentercode) {

            try {

                const decoded = jwtDecode(equicentercode)

                const currentTime = Date.now() / 1000

                if (decoded.exp && decoded.exp < currentTime) {

                    logout()

                    return null

                }

                const { user } = decoded

                if (user?.role === typeUserEnum.COLLABORATOR)

                    getCenterData(setCenter)

                setUser(user)

                return user

            } catch (error) {

                console.error('Error decoding JWT:', error)

                logout()

                return null

            }

        } else {

            setUser(null)

        }


    }, [])

    const onLoadGuest = useCallback(async () => {

        const equicentercode = localStorage.getItem('@equicenter-guest')

        if (equicentercode) {

            try {

                const decoded = jwtDecode(equicentercode)

                const currentTime = Date.now() / 1000

                if (decoded.exp && decoded.exp < currentTime) {

                    logoutGuest()

                    return null

                }

                const { user } = decoded

                setGuest(user)

                return user

            } catch (error) {

                console.error('Error decoding JWT:', error)

                logoutGuest()

                return null

            }

        } else {

            setGuest(null)

        }


    }, [])

    useEffect(() => {

        getAllCentersNames(setCentersNames)

        onLoadUser()

    }, [onLoadUser])


    return (
        <AppContext.Provider value={{ user, setUser, logout, onLoadUser, guest, setGuest, logoutGuest, onLoadGuest, centersNames, setCentersNames, dashboard_data, setDashboard_data, center, setCenter }}>
            {children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider }