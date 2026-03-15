import { Outlet } from "react-router-dom"


const Index = () => {
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50">
           <Outlet />
        </div>
    )
}

export default Index