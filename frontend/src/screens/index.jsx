import { Outlet, useLocation } from "react-router-dom"
import Header from "../components/header"
import Footer from "../components/footer"
import { useEffect } from "react"


const IndexGuest = () => {

    const location = useLocation()

    useEffect(() => {

        window.scrollTo(0, 0)
        
    }, [location.pathname])

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-pearl to-lightGold/30">
                <Outlet />
                <Footer />
            </div>
        </div>
    )
}

export default IndexGuest