import { Avatar, Chip } from "@heroui/react"
import { Briefcase, Mail, Award, Building, User, Cake, Flag, GraduationCap } from "lucide-react"

const UserData = ({ user }) => {
    const initialName = user ? `${user.firstName[0].toUpperCase()}${user.surname[0].toUpperCase()}` : user?.email[0].toUpperCase() || 'Guest'

    // Função para formatar a data de nascimento
    const formatBornDate = (dateString) => {
        if (!dateString) return "Not specified"
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Calcular idade a partir da data de nascimento
    const calculateAge = (bornDate) => {
        if (!bornDate) return null
        const today = new Date()
        const birthDate = new Date(bornDate)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    // Mapear valores de pesquisa para labels mais legíveis
    const researchPositionLabels = {
        'adm': 'Administrative',
        'early stage researcher': 'Early Stage Researcher',
        'managerial staff': 'Managerial Staff',
        'professor': 'Professor',
        'senior researcher': 'Senior Researcher',
        'technical staff': 'Technical Staff'
    }

    // Mapear valores de gênero para labels mais legíveis
    const genderLabels = {
        'female': 'Female',
        'male': 'Male',
        'non-binary': 'Non-binary',
        'not answer': 'Prefer not to answer'
    }

    // Mapear valores de role para labels mais legíveis
    const roleLabels = {
        'admin_alpha': 'Alpha Admin',
        'admin': 'Administrator',
        'coordinator': 'Coordinator',
        'member': 'Member',
        'guest': 'Guest'
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header com gradiente */}
            <div className="relative bg-gradient-to-br from-cyan-400 via-cyan-700 to-emerald-500 text-white px-6 py-8">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Chip
                            variant="flat"
                            classNames={{
                                base: "bg-white/20 border-white/30 backdrop-blur-sm",
                                content: "text-white font-semibold"
                            }}
                            startContent={<Building className="w-4 h-4" />}
                        >
                            User Profile
                        </Chip>

                        <Chip
                            variant="flat"
                            classNames={{
                                base: "bg-white/20 border-white/30 backdrop-blur-sm",
                                content: "text-white font-semibold text-xs"
                            }}
                        >
                            {roleLabels[user?.role] || user?.role}
                        </Chip>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3">
                        <Avatar
                            classNames={{
                                name: 'text-2xl font-bold'
                            }}
                            name={initialName}
                            className="w-20 h-20 border-4 border-white/80 bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-2xl"
                        />

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {user?.firstName} {user?.surname}
                            </h2>
                            <p className="text-white/80 text-sm mt-1">
                                {researchPositionLabels[user?.researchPosition] || user?.researchPosition || "Researcher"}
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 text-white/80 text-xs">
                            <div className="flex items-center">
                                <Flag size={14} className="mr-1" />
                                {user?.country || "Location not set"}
                            </div>
                            <div className="flex items-center">
                                <Briefcase size={14} className="mr-1" />
                                {user?.center?.name || "No center assigned"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do perfil */}
            <div className="p-6 space-y-6">
                {/* Seção de Informações Pessoais */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {user?.email || "No email provided"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Gender</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {genderLabels[user?.gender] || user?.gender || "Not specified"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Cake size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Date of Birth</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {formatBornDate(user?.bornDate)}
                                    {user?.bornDate && (
                                        <span className="text-slate-500 text-xs ml-2">
                                            ({calculateAge(user.bornDate)} years old)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Flag size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Country</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {user?.country || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção de Informações Profissionais */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                        Professional Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <GraduationCap size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Research Position</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {researchPositionLabels[user?.researchPosition] || user?.researchPosition || "Not specified"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Building size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Research Center</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {user?.center?.name || "No center assigned"}
                                </p>
                                {user?.center?.description && (
                                    <p className="text-xs text-slate-600 mt-1">
                                        {user.center.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Award size={18} className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500">Role</p>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    classNames={{
                                        content: "text-xs font-medium"
                                    }}
                                    color={
                                        user?.role === 'admin_alpha' ? 'danger' :
                                            user?.role === 'admin' ? 'warning' :
                                                user?.role === 'coordinator' ? 'primary' :
                                                    user?.role === 'member' ? 'success' : 'default'
                                    }
                                >
                                    {roleLabels[user?.role] || user?.role}
                                </Chip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção de Status da Conta */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                        Account Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Chip
                                color="success"
                                variant="flat"
                                size="sm"
                                classNames={{
                                    content: "text-xs font-medium"
                                }}
                            >
                                Active
                            </Chip>
                            <Chip
                                variant="flat"
                                size="sm"
                                classNames={{
                                    base: "bg-slate-100 border-slate-200",
                                    content: "text-slate-700 text-xs font-medium"
                                }}
                            >
                                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                            </Chip>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 mb-1">Account Created</p>
                            <p className="text-sm font-medium text-slate-800">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : "Unknown"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserData