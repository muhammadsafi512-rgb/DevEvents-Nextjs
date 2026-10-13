'use client';

import { useAuthModal} from "@/components/AuthModalProvider";

const LoginPrompt = ({ message } : { message: string}) => {
    const { openAuth } = useAuthModal();

    return (
        <div className="empty-state">
            <p>{message}</p>
            <button
                type="button"
                className="btn-primary"
                onClick={() => openAuth({ mode: 'login', reason: message})}
            >
                Login or Signup
            </button>
        </div>
    );
};

export default LoginPrompt;